/**
 * Paanchang Service
 * Shloka Sadhana - Hindu Calendar System
 *
 * Provides Hindu calendar (Paanchang) calculations including Tithi, Nakshatra, and more.
 * Uses astronomical calculations for lunar calendar data.
 */

import { PaanchangData } from '@/types';

/**
 * Tithi names (Lunar days) - 15 Tithis in each Paksha
 */
const TITHI_NAMES = [
  'Unknown', // 0 - placeholder
  'Pratipada', // 1
  'Dwitiya', // 2
  'Tritiya', // 3
  'Chaturthi', // 4
  'Panchami', // 5
  'Shashthi', // 6
  'Saptami', // 7
  'Ashtami', // 8
  'Navami', // 9
  'Dashami', // 10
  'Ekadashi', // 11
  'Dwadashi', // 12
  'Trayodashi', // 13
  'Chaturdashi', // 14
  'Purnima', // 15 (Full Moon for Shukla Paksha) or Amavasya (New Moon for Krishna Paksha)
];

/**
 * Nakshatra names (Lunar mansions) - 27 Nakshatras
 */
const NAKSHATRA_NAMES = [
  'Unknown', // 0 - placeholder
  'Ashwini', // 1
  'Bharani', // 2
  'Krittika', // 3
  'Rohini', // 4
  'Mrigashira', // 5
  'Ardra', // 6
  'Punarvasu', // 7
  'Pushya', // 8
  'Ashlesha', // 9
  'Magha', // 10
  'Purva Phalguni', // 11
  'Uttara Phalguni', // 12
  'Hasta', // 13
  'Chitra', // 14
  'Swati', // 15
  'Vishakha', // 16
  'Anuradha', // 17
  'Jyeshtha', // 18
  'Mula', // 19
  'Purva Ashadha', // 20
  'Uttara Ashadha', // 21
  'Shravana', // 22
  'Dhanishta', // 23
  'Shatabhisha', // 24
  'Purva Bhadrapada', // 25
  'Uttara Bhadrapada', // 26
  'Revati', // 27
];

/**
 * Hindu month names - 12 months
 */
const HINDU_MONTHS = [
  'Unknown', // 0 - placeholder
  'Chaitra', // 1 (Mar-Apr)
  'Vaishakha', // 2 (Apr-May)
  'Jyeshtha', // 3 (May-Jun)
  'Ashadha', // 4 (Jun-Jul)
  'Shravana', // 5 (Jul-Aug)
  'Bhadrapada', // 6 (Aug-Sep)
  'Ashwin', // 7 (Sep-Oct)
  'Kartika', // 8 (Oct-Nov)
  'Margashirsha', // 9 (Nov-Dec)
  'Pausha', // 10 (Dec-Jan)
  'Magha', // 11 (Jan-Feb)
  'Phalguna', // 12 (Feb-Mar)
];

/**
 * Sanskrit weekday names
 */
const SANSKRIT_WEEKDAYS = [
  'Ravivar', // Sunday (Sun)
  'Somvar', // Monday (Moon)
  'Mangalvar', // Tuesday (Mars)
  'Budhvar', // Wednesday (Mercury)
  'Guruvar', // Thursday (Jupiter)
  'Shukravar', // Friday (Venus)
  'Shanivar', // Saturday (Saturn)
];

/**
 * English weekday names
 */
const ENGLISH_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Ekadashi names for each month and paksha
 * Format: { month: { paksha: name } }
 */
const EKADASHI_NAMES: Record<number, Record<'Shukla' | 'Krishna', string>> = {
  1: { Shukla: 'Kamada Ekadashi', Krishna: 'Papmochani Ekadashi' }, // Chaitra
  2: { Shukla: 'Mohini Ekadashi', Krishna: 'Varuthini Ekadashi' }, // Vaishakha
  3: { Shukla: 'Nirjala Ekadashi', Krishna: 'Apara Ekadashi' }, // Jyeshtha
  4: { Shukla: 'Yogini Ekadashi', Krishna: 'Sayana Ekadashi' }, // Ashadha
  5: { Shukla: 'Kamika Ekadashi', Krishna: 'Putrada Ekadashi' }, // Shravana
  6: { Shukla: 'Aja Ekadashi', Krishna: 'Indira Ekadashi' }, // Bhadrapada
  7: { Shukla: 'Padma Ekadashi', Krishna: 'Pasankusa Ekadashi' }, // Ashwin
  8: { Shukla: 'Utpanna Ekadashi', Krishna: 'Rama Ekadashi' }, // Kartika
  9: { Shukla: 'Mokshada Ekadashi', Krishna: 'Utpatti Ekadashi' }, // Margashirsha
  10: { Shukla: 'Saphala Ekadashi', Krishna: 'Putrada Ekadashi' }, // Pausha
  11: { Shukla: 'Jaya Ekadashi', Krishna: 'Sat-tila Ekadashi' }, // Magha
  12: { Shukla: 'Amalaki Ekadashi', Krishna: 'Vijaya Ekadashi' }, // Phalguna
};

/**
 * Calculate moon phase (0 to 1, where 0 = new moon, 0.5 = full moon)
 * Using simplified lunar phase calculation
 */
const calculateMoonPhase = (date: Date): number => {
  // Known new moon: January 6, 2000 at 18:14 UTC
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const synodicMonth = 29.530588853; // Average lunar cycle in days

  const diff = date.getTime() - knownNewMoon.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  const phase = (days % synodicMonth) / synodicMonth;

  return phase;
};

/**
 * Calculate Tithi number (1-15) and Paksha from moon phase
 */
const calculateTithi = (
  moonPhase: number
): { tithiNumber: number; paksha: 'Shukla' | 'Krishna' } => {
  // Shukla Paksha (waxing): 0 to 0.5 moon phase -> Tithi 1-15
  // Krishna Paksha (waning): 0.5 to 1 moon phase -> Tithi 1-15

  if (moonPhase < 0.5) {
    // Shukla Paksha (waxing moon)
    const tithiNumber = Math.floor(moonPhase * 30) + 1;
    return { tithiNumber, paksha: 'Shukla' };
  } else {
    // Krishna Paksha (waning moon)
    const tithiNumber = Math.floor((moonPhase - 0.5) * 30) + 1;
    return { tithiNumber, paksha: 'Krishna' };
  }
};

/**
 * Calculate Nakshatra (1-27) from moon's ecliptic longitude
 * Simplified calculation based on date
 */
const calculateNakshatra = (date: Date): number => {
  // Each Nakshatra is approximately 13.33 degrees (360/27)
  // Moon takes ~27.3 days to complete sidereal orbit
  const nakshatraMonth = 27.321661; // Sidereal month in days
  const knownNakshatra = new Date('2000-01-01T00:00:00Z');

  const diff = date.getTime() - knownNakshatra.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  const nakshatra = Math.floor((days % nakshatraMonth) / nakshatraMonth * 27) + 1;

  return nakshatra >= 1 && nakshatra <= 27 ? nakshatra : 1;
};

/**
 * Calculate Hindu month (1-12) from Gregorian month
 * Approximation based on solar calendar
 */
const calculateHinduMonth = (date: Date): number => {
  const month = date.getMonth(); // 0-11

  // Approximate mapping (Hindu months start mid-way through Gregorian months)
  const monthMap = [11, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Index 0-11 for Jan-Dec
  return monthMap[month];
};

/**
 * Get Tithi name from Tithi number
 * @param tithiNumber - Tithi number (1-15)
 * @returns Tithi name
 */
export const getTithiName = (tithiNumber: number): string => {
  if (tithiNumber >= 1 && tithiNumber <= 15) {
    return TITHI_NAMES[tithiNumber];
  }
  return 'Unknown';
};

/**
 * Get Nakshatra name from Nakshatra number
 * @param nakshatraNumber - Nakshatra number (1-27)
 * @returns Nakshatra name
 */
export const getNakshatraName = (nakshatraNumber: number): string => {
  if (nakshatraNumber >= 1 && nakshatraNumber <= 27) {
    return NAKSHATRA_NAMES[nakshatraNumber];
  }
  return 'Unknown';
};

/**
 * Get Hindu month name from month number
 * @param monthNumber - Hindu month number (1-12)
 * @returns Hindu month name
 */
export const getHinduMonth = (monthNumber: number): string => {
  if (monthNumber >= 1 && monthNumber <= 12) {
    return HINDU_MONTHS[monthNumber];
  }
  return 'Unknown';
};

/**
 * Get Sanskrit weekday name from JavaScript day number
 * @param dayNumber - Day number (0-6, where 0 = Sunday)
 * @returns Sanskrit weekday name
 */
export const getSanskritWeekday = (dayNumber: number): string => {
  if (dayNumber >= 0 && dayNumber <= 6) {
    return SANSKRIT_WEEKDAYS[dayNumber];
  }
  return 'Unknown';
};

/**
 * Check if a Tithi number is Ekadashi (11th Tithi)
 * @param tithiNumber - Tithi number (1-15)
 * @returns True if Ekadashi
 */
export const isEkadashi = (tithiNumber: number): boolean => {
  return tithiNumber === 11;
};

/**
 * Get Ekadashi name for a given month and paksha
 * @param monthNumber - Hindu month number (1-12)
 * @param paksha - Paksha (Shukla or Krishna)
 * @returns Ekadashi name or null
 */
export const getEkadasiName = (
  monthNumber: number,
  paksha: 'Shukla' | 'Krishna'
): string | null => {
  if (monthNumber >= 1 && monthNumber <= 12) {
    return EKADASHI_NAMES[monthNumber]?.[paksha] || null;
  }
  return null;
};

/**
 * Get Paanchang data for a specific date
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns PaanchangData
 */
export const getPaanchangForDate = (dateString: string): PaanchangData => {
  const date = new Date(dateString + 'T12:00:00Z'); // Use noon UTC to avoid timezone issues

  // Calculate moon phase and derived values
  const moonPhase = calculateMoonPhase(date);
  const { tithiNumber, paksha } = calculateTithi(moonPhase);
  const nakshatraNumber = calculateNakshatra(date);
  const hinduMonthNumber = calculateHinduMonth(date);
  const weekdayNumber = date.getDay();

  // Get names
  const tithi = getTithiName(tithiNumber);
  const nakshatra = getNakshatraName(nakshatraNumber);
  const hinduMonth = getHinduMonth(hinduMonthNumber);
  const weekday = getSanskritWeekday(weekdayNumber);
  const weekdayEnglish = ENGLISH_WEEKDAYS[weekdayNumber];

  // Check if Ekadashi
  const isEkadasiDay = isEkadashi(tithiNumber);
  const ekadasiName = isEkadasiDay
    ? getEkadasiName(hinduMonthNumber, paksha) || undefined
    : undefined;

  return {
    date: dateString,
    tithi,
    tithiNumber,
    nakshatra,
    paksha,
    hinduMonth,
    weekday,
    weekdayEnglish,
    isEkadashi: isEkadasiDay,
    ekadasiName,
  };
};
