
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { JournalEntry, GoodDeed, PrayerTime, Region } from './types';
import { DEFAULT_DEEDS, RAMADAN_DUAS, REGIONAL_PRAYER_DATA } from './constants';
import { getDailyReflection, askSpiritualGuide, getDailyChallenge } from './services/geminiService';
import { getDynamicRegionalTimes } from './utils/prayerUtils';
import StatCard from './components/StatCard';

const getTodayStr = () => new Date().toISOString().split('T')[0];

const Dashboard: React.FC<{ entries: JournalEntry[] }> = ({ entries }) => {
  const [selectedRegion, setSelectedRegion] = useState<Region>(() => {
    return (localStorage.getItem('user_region') as Region) || 'Бишкек';
  });
  const [prayerTimes, setPrayerTimes] = useState<any[]>([]);
  const [challenge, setChallenge] = useState('Жүктөлүүдө...');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  
  // Ramadan 2026: Feb 18 to March 19
  const ramadanStart = new Date('2026-02-18T00:00:00');
  const ramadanEnd = new Date('2026-03-20T00:00:00'); 
  const today = new Date();
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = ramadanStart.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [ramadanStart]);

  const isStarted = today >= ramadanStart && today < ramadanEnd;
  const isFinished = today >= ramadanEnd;
  const ramadanDay = isStarted 
    ? Math.floor((today.getTime() - ramadanStart.getTime()) / (1000 * 60 * 60 * 24)) + 1 
    : 1;

  useEffect(() => {
    localStorage.setItem('user_region', selectedRegion);
    const dynamicTimes = getDynamicRegionalTimes(selectedRegion, today);
    const currentTimeStr = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    setPrayerTimes(dynamicTimes.map(p => ({ ...p, isPassed: p.time < currentTimeStr })));
    getDailyChallenge(ramadanDay).then(setChallenge);
  }, [selectedRegion, ramadanDay]);

  const totalFasted = entries.filter(e => e.isFasting).length;
  const totalPages = entries.reduce((acc, curr) => acc + (curr.quranPages || 0), 0);

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-8 px-6 bg-emerald-900 text-white rounded-b-[3rem] pb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
           <svg width="300" height="300" viewBox="0 0 100 100"><path d="M50 0 L100 50 L50 100 L0 50 Z" fill="currentColor"/></svg>
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Кыргызстан 2026</p>
              <h1 className="text-4xl font-black tracking-tight">Рамазан</h1>
            </div>
            <div className="bg-emerald-800/40 p-3 rounded-2xl backdrop-blur-sm border border-emerald-700/50">
               <i className="fas fa-kaaba text-emerald-200 text-xl"></i>
            </div>
          </div>

          {!isStarted && !isFinished && (
            <div className="mt-8 grid grid-cols-4 gap-2">
              {[
                { label: 'Күн', val: timeLeft.days },
                { label: 'Саат', val: timeLeft.hours },
                { label: 'Мүн', val: timeLeft.mins },
                { label: 'Сек', val: timeLeft.secs }
              ].map((unit, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-2 text-center backdrop-blur-md border border-white/10">
                  <p className="text-xl font-black">{unit.val}</p>
                  <p className="text-[8px] font-bold uppercase opacity-60 tracking-tighter">{unit.label}</p>
                </div>
              ))}
            </div>
          )}

          {isStarted && (
             <div className="mt-6 inline-flex items-center space-x-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-400/30">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
               <span className="text-sm font-black">Бүгүн {ramadanDay}-күн</span>
             </div>
          )}

          {isFinished && (
            <div className="mt-6 bg-amber-500/20 px-6 py-3 rounded-2xl border border-amber-400/30">
              <h2 className="text-xl font-black text-amber-200">Айт маарек болсун! 🎉</h2>
            </div>
          )}
        </div>
      </header>

      <div className="px-6 -mt-10 relative z-20">
        <div className="bg-white p-3 rounded-3xl shadow-xl flex items-center justify-between border border-emerald-50 ring-8 ring-[#f8faf7]">
          <div className="flex items-center space-x-3 ml-2">
             <i className="fas fa-map-marker-alt text-emerald-700 text-sm"></i>
             <span className="text-xs font-black text-emerald-950">Аймак:</span>
          </div>
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as Region)}
            className="bg-emerald-50 text-emerald-800 text-xs font-black py-2.5 px-5 rounded-2xl outline-none border-none appearance-none"
          >
            {Object.keys(REGIONAL_PRAYER_DATA).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-3 gap-3">
          {prayerTimes.map((p, i) => (
            <div key={i} className={`p-4 rounded-[2rem] border transition-all ${p.name.includes('Шам') ? 'bg-emerald-900 border-emerald-950 text-white shadow-xl scale-105 z-10' : 'bg-white border-gray-100 text-gray-900'}`}>
              <p className={`text-[8px] font-black uppercase mb-1 tracking-widest ${p.name.includes('Шам') ? 'text-emerald-300' : 'text-gray-400'}`}>{p.name}</p>
              <p className="text-base font-black">{p.time}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6">
        <StatCard label="Орозо" value={`${totalFasted} күн`} icon="fa-moon" color="bg-emerald-600" />
        <StatCard label="Куран" value={`${totalPages} бет`} icon="fa-book-quran" color="bg-blue-600" />
      </div>

      <div className="px-6 grid grid-cols-3 gap-3 pb-8">
        <Link to="/zakat" className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center space-y-2">
          <i className="fas fa-coins text-amber-500"></i>
          <span className="text-[9px] font-black text-gray-500 uppercase">Зекет</span>
        </Link>
        <Link to="/duas" className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center space-y-2">
          <i className="fas fa-hands-praying text-blue-500"></i>
          <span className="text-[9px] font-black text-gray-500 uppercase">Дубалар</span>
        </Link>
        <Link to="/calendar" className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center space-y-2">
          <i className="fas fa-history text-emerald-500"></i>
          <span className="text-[9px] font-black text-gray-500 uppercase">Тарых</span>
        </Link>
      </div>
    </div>
  );
};

const QiblaPage: React.FC = () => {
  const [heading, setHeading] = useState<number>(0);
  const [qiblaDir, setQiblaDir] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setHasPermission(true);
        } else {
          setError("Уруксат берилген жок");
        }
      } catch (e) {
        setError("Катачылык кетти");
      }
    } else {
      setHasPermission(true);
    }
  };

  useEffect(() => {
    if (!hasPermission) return;

    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const calculateQibla = (lat: number, lon: number) => {
      const φ1 = lat * Math.PI / 180;
      const φ2 = kaabaLat * Math.PI / 180;
      const Δλ = (kaabaLon - lon) * Math.PI / 180;
      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
      return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => setQiblaDir(calculateQibla(pos.coords.latitude, pos.coords.longitude)),
      () => setError("Геолокацияны күйгүзүңүз")
    );

    const handler = (e: DeviceOrientationEvent) => {
      const alpha = e.alpha || 0;
      const compass = (e as any).webkitCompassHeading || (360 - alpha);
      setHeading(compass);
    };

    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [hasPermission]);

  return (
    <div className="p-6 h-screen flex flex-col items-center justify-center bg-[#f8faf7]">
      <header className="absolute top-8 left-6 right-6 flex items-center space-x-4">
        <Link to="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-gray-400">
           <i className="fas fa-arrow-left"></i>
        </Link>
        <h1 className="text-2xl font-black text-emerald-900">Кыбыла</h1>
      </header>

      {!hasPermission ? (
        <button onClick={requestPermission} className="bg-emerald-700 text-white px-8 py-4 rounded-3xl font-black shadow-xl">
           Компасты иштетүү
        </button>
      ) : (
        <div className="relative w-72 h-72 flex items-center justify-center">
          <div className="absolute inset-0 border-8 border-emerald-900/5 rounded-full"></div>
          <div 
            className="relative w-64 h-64 rounded-full bg-white shadow-2xl flex items-center justify-center transition-transform duration-150"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <div className="absolute top-4 font-black text-rose-500 text-xs">N</div>
            {qiblaDir !== null && (
              <div className="absolute w-full h-full" style={{ transform: `rotate(${qiblaDir}deg)` }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 flex flex-col items-center">
                  <i className="fas fa-kaaba text-amber-500 text-3xl mb-1"></i>
                  <div className="w-1.5 h-32 bg-amber-500 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-1 h-8 bg-rose-500 rounded-full animate-pulse"></div>
        </div>
      )}
      
      {error && <p className="mt-8 text-rose-500 font-bold text-xs">{error}</p>}
    </div>
  );
};

const ZakatCalculator: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const calculate = () => {
    const val = parseFloat(amount);
    if (!isNaN(val) && val >= 480000) setResult(val * 0.025);
    else setResult(0);
  };
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center space-x-4">
        <Link to="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-gray-400">
           <i className="fas fa-arrow-left"></i>
        </Link>
        <h1 className="text-2xl font-black text-emerald-900">Зекет</h1>
      </header>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <input 
          type="number" placeholder="Жалпы сумма (сом)"
          className="w-full bg-gray-50 p-6 rounded-3xl border-none outline-none font-black text-2xl text-center"
          value={amount} onChange={e => setAmount(e.target.value)}
        />
        <button onClick={calculate} className="w-full bg-emerald-700 text-white py-6 rounded-3xl font-black text-lg">Эсептөө</button>
        {result !== null && (
          <div className="p-8 bg-emerald-950 rounded-[2rem] text-center text-white">
            <p className="text-[10px] text-emerald-300 font-black uppercase mb-2">Зекет суммасы:</p>
            <p className="text-4xl font-black">{result.toLocaleString()} сом</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DuasPage: React.FC = () => (
  <div className="p-6 space-y-6">
    <header className="flex items-center space-x-4">
      <Link to="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-gray-400">
         <i className="fas fa-arrow-left"></i>
      </Link>
      <h1 className="text-2xl font-black text-emerald-900">Дубалар</h1>
    </header>
    <div className="space-y-6">
      {RAMADAN_DUAS.map((dua, i) => (
        <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-50 space-y-4">
          <h2 className="text-lg font-black text-emerald-800">{dua.title}</h2>
          <p className="text-2xl font-serif text-right leading-loose text-emerald-950" dir="rtl">{dua.arabic}</p>
          <p className="text-xs font-bold text-emerald-700 italic">{dua.transliteration}</p>
          <p className="text-sm font-bold text-gray-600 leading-relaxed">{dua.translation}</p>
        </div>
      ))}
    </div>
  </div>
);

const GuidePage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleAsk = async () => {
    setIsLoading(true);
    const res = await askSpiritualGuide(question);
    setAnswer(res);
    setIsLoading(false);
  };
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center space-x-4">
        <Link to="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-gray-400">
           <i className="fas fa-arrow-left"></i>
        </Link>
        <h1 className="text-2xl font-black text-emerald-900">Насаатчы</h1>
      </header>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
        <textarea 
          className="w-full bg-gray-50 p-6 rounded-3xl border-none outline-none h-32 text-sm font-bold"
          placeholder="Сурооңузду жазыңыз..."
          value={question} onChange={e => setQuestion(e.target.value)}
        />
        <button onClick={handleAsk} disabled={isLoading} className="w-full bg-emerald-700 text-white py-6 rounded-3xl font-black">
          {isLoading ? "Ойлонууда..." : "Суроо берүү"}
        </button>
        {answer && <div className="p-6 bg-emerald-50 rounded-3xl text-sm font-medium leading-relaxed">{answer}</div>}
      </div>
    </div>
  );
};

const DailyForm: React.FC<{ onSave: (entry: JournalEntry) => void, initialData?: JournalEntry }> = ({ onSave, initialData }) => {
  const [isFasting, setIsFasting] = useState(initialData?.isFasting ?? true);
  const [intention, setIntention] = useState(initialData?.intention ?? '');
  const [quranPages, setQuranPages] = useState(initialData?.quranPages ?? 0);
  const [goodDeeds, setGoodDeeds] = useState<GoodDeed[]>(
    initialData?.goodDeeds ?? DEFAULT_DEEDS.map((label, idx) => ({ id: `deed-${idx}`, label, completed: false }))
  );
  const [reflection, setReflection] = useState(initialData?.reflection ?? '');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleDeed = (id: string) => {
    setGoodDeeds(prev => prev.map(d => d.id === id ? { ...d, completed: !d.completed } : d));
  };

  const handleReflect = async () => {
    setIsGenerating(true);
    const text = await getDailyReflection({ date: getTodayStr(), isFasting, intention, goodDeeds, quranPages, reflection: '', mood: 5 });
    setReflection(text);
    setIsGenerating(false);
  };

  return (
    <div className="p-6 pb-32 space-y-6">
      <header className="flex items-center space-x-4">
        <Link to="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-gray-400">
           <i className="fas fa-arrow-left"></i>
        </Link>
        <h1 className="text-2xl font-black text-emerald-900">Бүгүнкү Күн</h1>
      </header>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg flex justify-between items-center">
          <span className="font-black">Орозо кармалды</span>
          <button onClick={() => setIsFasting(!isFasting)} className={`w-14 h-8 rounded-full transition-all relative ${isFasting ? 'bg-emerald-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${isFasting ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <textarea 
          className="w-full bg-white p-6 rounded-3xl border-none outline-none h-32 text-sm font-bold shadow-inner"
          placeholder="Бүгүнкү ниетиңиз..."
          value={intention} onChange={e => setIntention(e.target.value)}
        />
        <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
           <p className="text-xs font-black uppercase text-gray-400 mb-4">Куран окуу (бет)</p>
           <div className="flex items-center justify-center space-x-8">
             <button onClick={() => setQuranPages(Math.max(0, quranPages-1))} className="w-12 h-12 rounded-xl bg-gray-50 text-2xl font-black shadow-sm">-</button>
             <span className="text-4xl font-black">{quranPages}</span>
             <button onClick={() => setQuranPages(quranPages+1)} className="w-12 h-12 rounded-xl bg-gray-50 text-2xl font-black shadow-sm">+</button>
           </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {goodDeeds.map(deed => (
            <div key={deed.id} onClick={() => toggleDeed(deed.id)} className={`p-5 rounded-2xl border-2 flex justify-between items-center transition-all ${deed.completed ? 'bg-emerald-900 border-emerald-900 text-white shadow-md' : 'bg-white border-gray-100'}`}>
              <span className="text-xs font-black">{deed.label}</span>
              {deed.completed && <i className="fas fa-check"></i>}
            </div>
          ))}
        </div>
        <div className="bg-amber-950 text-white p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-300">Насаат</h3>
            <button onClick={handleReflect} disabled={isGenerating} className="text-[10px] bg-amber-600 px-3 py-1.5 rounded-lg font-black uppercase">
               {isGenerating ? "..." : "Жаңыртуу"}
            </button>
          </div>
          <p className="text-[11px] font-bold leading-relaxed">{reflection || 'Амалдарды белгилеп, "Жаңыртууну" басыңыз.'}</p>
        </div>
        <button onClick={() => onSave({ date: getTodayStr(), isFasting, intention, goodDeeds, quranPages, reflection, mood: 5 })} className="w-full bg-emerald-700 text-white py-6 rounded-3xl font-black text-xl shadow-xl">Сактоо</button>
      </div>
    </div>
  );
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.05)] max-w-md mx-auto">
      <Link to="/" className={`flex flex-col items-center flex-1 transition-all ${isActive('/') ? 'text-emerald-700' : 'text-gray-300'}`}>
        <i className="fas fa-home-mosque text-xl"></i>
        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Башкы</span>
      </Link>
      <Link to="/duas" className={`flex flex-col items-center flex-1 transition-all ${isActive('/duas') ? 'text-emerald-700' : 'text-gray-300'}`}>
        <i className="fas fa-hands-praying text-xl"></i>
        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Дуба</span>
      </Link>
      <Link to="/entry" className="relative -top-8">
         <div className="bg-emerald-700 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-[6px] ring-white/95 active:scale-90 transition-all rotate-[45deg]">
           <i className="fas fa-plus text-lg -rotate-[45deg]"></i>
         </div>
      </Link>
      <Link to="/qibla" className={`flex flex-col items-center flex-1 transition-all ${isActive('/qibla') ? 'text-emerald-700' : 'text-gray-300'}`}>
        <i className="fas fa-compass text-xl"></i>
        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Кыбыла</span>
      </Link>
      <Link to="/guide" className={`flex flex-col items-center flex-1 transition-all ${isActive('/guide') ? 'text-emerald-700' : 'text-gray-300'}`}>
        <i className="fas fa-wand-magic-sparkles text-xl"></i>
        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Кеңеш</span>
      </Link>
    </nav>
  );
};

const App: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('ramadan_2026_v1');
    if (saved) setEntries(JSON.parse(saved));
  }, []);
  const saveEntry = (entry: JournalEntry) => {
    const newEntries = [...entries];
    const index = newEntries.findIndex(e => e.date === entry.date);
    if (index !== -1) newEntries[index] = entry;
    else newEntries.push(entry);
    setEntries(newEntries);
    localStorage.setItem('ramadan_2026_v1', JSON.stringify(newEntries));
    window.location.hash = '/';
  };
  return (
    <HashRouter>
      <div className="max-w-md mx-auto min-h-screen bg-[#f8faf7] text-gray-950 relative shadow-2xl overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard entries={entries} />} />
          <Route path="/entry" element={<DailyForm onSave={saveEntry} initialData={entries.find(e => e.date === getTodayStr())} />} />
          <Route path="/duas" element={<DuasPage />} />
          <Route path="/qibla" element={<QiblaPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/zakat" element={<ZakatCalculator />} />
          <Route path="/calendar" element={
            <div className="p-6 pb-32 space-y-6">
              <header className="flex items-center space-x-4">
                <Link to="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-gray-400">
                   <i className="fas fa-arrow-left"></i>
                </Link>
                <h1 className="text-2xl font-black text-emerald-900">Тарых</h1>
              </header>
              <div className="space-y-4">
                {[...entries].reverse().map((e, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex justify-between items-center shadow-md">
                    <div>
                      <p className="font-black text-emerald-950">{new Date(e.date).toLocaleDateString('ky-KG', { day: 'numeric', month: 'long' })}</p>
                      <p className="text-[10px] text-emerald-600 font-black uppercase">{e.isFasting ? 'Орозо кармалды' : 'Орозо жок'}</p>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">{e.quranPages} бет</span>
                  </div>
                ))}
              </div>
            </div>
          } />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;
