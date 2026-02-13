
import { Region } from '../types';
import { REGIONAL_PRAYER_DATA } from '../constants';

export const getShiftedTime = (baseTime: string, daysDiff: number, type: 'earlier' | 'later'): string => {
  const [hours, minutes] = baseTime.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;

  // In Feb-March in Kyrgyzstan, morning prayers get earlier and evening prayers get later
  const shiftAmount = daysDiff * 1.5; // average shift per day in minutes
  
  if (type === 'earlier') {
    totalMinutes -= Math.floor(shiftAmount);
  } else {
    totalMinutes += Math.floor(shiftAmount);
  }

  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

export const getDynamicRegionalTimes = (region: Region, targetDate: Date) => {
  const baseDate = new Date('2026-02-18');
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const baseData = REGIONAL_PRAYER_DATA[region];
  
  return baseData.map(p => {
    let shiftedTime = p.time;
    if (diffDays !== 0) {
      if (p.name === 'Багымдат' || p.name === 'Күн') {
        shiftedTime = getShiftedTime(p.time, diffDays, 'earlier');
      } else if (p.name === 'Аср' || p.name === 'Шам (Ооз ачуу)' || p.name === 'Куптан') {
        shiftedTime = getShiftedTime(p.time, diffDays, 'later');
      }
    }
    return { ...p, time: shiftedTime };
  });
};
