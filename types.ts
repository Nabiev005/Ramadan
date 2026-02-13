
export type Region = 'Бишкек' | 'Ош' | 'Жалал-Абад' | 'Нарын' | 'Талас' | 'Ысык-Көл' | 'Баткен';

export interface GoodDeed {
  id: string;
  label: string;
  completed: boolean;
}

export interface JournalEntry {
  date: string; // ISO string YYYY-MM-DD
  isFasting: boolean;
  intention: string;
  goodDeeds: GoodDeed[];
  quranPages: number;
  reflection: string;
  mood: number; // 1-5
  sadaqaAmount?: number;
}

export interface PrayerTime {
  name: string;
  time: string;
  isPassed: boolean;
}

export interface Dua {
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
}

export interface UserGoals {
  khatmTarget: number; // total pages, usually 604
  currentPages: number;
}
