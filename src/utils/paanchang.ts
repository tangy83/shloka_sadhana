/**
 * Paanchang Service
 * Shloka Sadhana - Hindu Calendar System
 *
 * Provides Hindu calendar (Paanchang) calculations including Tithi, Nakshatra, and more.
 * Uses astronomical calculations for lunar calendar data.
 */

import * as Astronomy from 'astronomy-engine';
import { PaanchangData } from '@/types';
import { getEkadashiByDate, getAllEkadashis } from '@/utils/ekadashiCalendar';

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
 * Ekadashi names for each month and paksha (purnimanta convention, matching
 * ekadashi.json: a Krishna paksha belongs to the month whose Purnima ends it)
 * Format: { month: { paksha: name } }
 */
const EKADASHI_NAMES: Record<number, Record<'Shukla' | 'Krishna', string>> = {
  1: { Shukla: 'Kamada Ekadashi', Krishna: 'Papamochani Ekadashi' }, // Chaitra
  2: { Shukla: 'Mohini Ekadashi', Krishna: 'Varuthini Ekadashi' }, // Vaishakha
  3: { Shukla: 'Nirjala Ekadashi', Krishna: 'Apara Ekadashi' }, // Jyeshtha
  4: { Shukla: 'Devshayani Ekadashi', Krishna: 'Yogini Ekadashi' }, // Ashadha
  5: { Shukla: 'Shravana Putrada Ekadashi', Krishna: 'Kamika Ekadashi' }, // Shravana
  6: { Shukla: 'Parivartini Ekadashi', Krishna: 'Aja Ekadashi' }, // Bhadrapada
  7: { Shukla: 'Papankusha Ekadashi', Krishna: 'Indira Ekadashi' }, // Ashwin
  8: { Shukla: 'Devuthani Ekadashi', Krishna: 'Rama Ekadashi' }, // Kartika
  9: { Shukla: 'Mokshada Ekadashi', Krishna: 'Utpanna Ekadashi' }, // Margashirsha
  10: { Shukla: 'Pausha Putrada Ekadashi', Krishna: 'Saphala Ekadashi' }, // Pausha
  11: { Shukla: 'Jaya Ekadashi', Krishna: 'Shattila Ekadashi' }, // Magha
  12: { Shukla: 'Amalaki Ekadashi', Krishna: 'Vijaya Ekadashi' }, // Phalguna
};

/**
 * Reference observer for daily Paanchang values. Tithi and nakshatra are taken
 * at sunrise in New Delhi (IST), the same convention as ekadashi.json.
 */
const OBSERVER = new Astronomy.Observer(28.6139, 77.209, 216);
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeDegrees = (deg: number): number => ((deg % 360) + 360) % 360;

/**
 * Lahiri ayanamsa (degrees): 23°51' at J2000, precessing ~50.3"/year
 */
const lahiriAyanamsa = (date: Date): number => {
  const years = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * DAY_MS);
  return 23.853 + years * 0.013969;
};

const siderealSunSign = (date: Date): number =>
  Math.floor(normalizeDegrees(Astronomy.SunPosition(date).elon - lahiriAyanamsa(date)) / 30);

/**
 * Sunrise in New Delhi for an ISO calendar date (falls back to 06:00 IST)
 */
const sunriseFor = (dateString: string): Date => {
  const istMidnight = new Date(Date.parse(`${dateString}T00:00:00Z`) - IST_OFFSET_MS);
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, OBSERVER, +1, istMidnight, 1);
  return rise ? rise.date : new Date(istMidnight.getTime() + 6 * 60 * 60 * 1000);
};

/**
 * Calculate Tithi number (1-15) and Paksha from the Moon–Sun elongation
 */
const calculateTithi = (
  date: Date
): { tithiNumber: number; paksha: 'Shukla' | 'Krishna' } => {
  const elongation = normalizeDegrees(
    Astronomy.EclipticGeoMoon(date).lon - Astronomy.SunPosition(date).elon
  );
  const tithiIndex = Math.floor(elongation / 12); // 0-29
  return {
    tithiNumber: (tithiIndex % 15) + 1,
    paksha: tithiIndex < 15 ? 'Shukla' : 'Krishna',
  };
};

/**
 * Calculate Nakshatra (1-27) from the Moon's sidereal longitude
 */
const calculateNakshatra = (date: Date): number => {
  const siderealMoon = normalizeDegrees(Astronomy.EclipticGeoMoon(date).lon - lahiriAyanamsa(date));
  return Math.min(27, Math.floor(siderealMoon / (360 / 27)) + 1);
};

/**
 * Calculate Hindu lunar month (1-12, purnimanta) and whether it is Adhik.
 * The amanta month is named from the Sun's sidereal sign at the new moon that
 * starts it (Sun in Meena → Chaitra); a lunar month containing no sankranti is Adhik.
 */
const calculateHinduMonth = (
  date: Date,
  paksha: 'Shukla' | 'Krishna'
): { monthNumber: number; isAdhik: boolean } => {
  const previousNewMoon = Astronomy.SearchMoonPhase(0, date, -35);
  const nextNewMoon = Astronomy.SearchMoonPhase(0, date, 35);
  if (!previousNewMoon || !nextNewMoon) {
    return { monthNumber: 1, isAdhik: false };
  }
  const startSign = siderealSunSign(previousNewMoon.date);
  const isAdhik = startSign === siderealSunSign(nextNewMoon.date);
  const amanta = ((startSign + 1) % 12) + 1;
  const monthNumber = paksha === 'Krishna' && !isAdhik ? (amanta % 12) + 1 : amanta;
  return { monthNumber, isAdhik };
};

/**
 * Whether a date falls inside the curated Ekadashi calendar's coverage
 */
const isWithinEkadashiCalendar = (dateString: string): boolean => {
  const all = getAllEkadashis();
  return all.length > 0 && dateString >= all[0].date && dateString <= all[all.length - 1].date;
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
  const sunrise = sunriseFor(dateString);

  const { tithiNumber, paksha } = calculateTithi(sunrise);
  const nakshatraNumber = calculateNakshatra(sunrise);
  const { monthNumber, isAdhik } = calculateHinduMonth(sunrise, paksha);
  const weekdayNumber = date.getDay();

  // Get names
  const tithi = paksha === 'Krishna' && tithiNumber === 15 ? 'Amavasya' : getTithiName(tithiNumber);
  const nakshatra = getNakshatraName(nakshatraNumber);
  const hinduMonth = `${isAdhik ? 'Adhik ' : ''}${getHinduMonth(monthNumber)}`;
  const weekday = getSanskritWeekday(weekdayNumber);
  const weekdayEnglish = ENGLISH_WEEKDAYS[weekdayNumber];

  // Ekadashi observance: the curated calendar is the source of truth within its
  // range (it applies the two-sunrise / no-sunrise rules); beyond it, use the tithi.
  const listed = getEkadashiByDate(dateString);
  const isEkadasiDay = listed ? true : !isWithinEkadashiCalendar(dateString) && isEkadashi(tithiNumber);
  const ekadasiName = listed
    ? listed.name
    : isEkadasiDay && !isAdhik
      ? getEkadasiName(monthNumber, paksha) || undefined
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
