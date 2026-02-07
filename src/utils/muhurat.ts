/**
 * Muhurat Service
 * Shloka Sadhana - Hindu Muhurat (Auspicious Times) Calculations
 *
 * Calculates sunrise, sunset, Brahma Muhurta, Abhijit Muhurat, Rahu Kaal, etc.
 */

import { MuhuratData } from '@/types';

/**
 * Default location (Delhi, India) if not specified
 */
const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
};

/**
 * Format time as HH:MM
 */
export const formatTime = (hours: number, minutes: number): string => {
  const h = Math.floor(hours);
  const m = Math.floor(minutes);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Parse time string to hours and minutes
 */
const parseTime = (time: string): { hours: number; minutes: number } => {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
};

/**
 * Add minutes to a time
 */
const addMinutes = (time: string, minutesToAdd: number): string => {
  const { hours, minutes } = parseTime(time);
  let totalMinutes = hours * 60 + minutes + minutesToAdd;

  // Handle day wrap-around
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  } else if (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
  }

  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  return formatTime(newHours, newMinutes);
};

/**
 * Calculate sunrise and sunset for a given date and location
 * Using simplified solar calculation
 */
export const calculateSunriseSunset = (
  date: string,
  latitude: number = DEFAULT_LOCATION.latitude,
  longitude: number = DEFAULT_LOCATION.longitude
): { sunrise: string; sunset: string } => {
  // Parse the date
  const dateObj = new Date(date + 'T12:00:00Z');
  const dayOfYear = Math.floor(
    (dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / 86400000
  );

  // Solar declination (simplified)
  const declination = -23.44 * Math.cos(((360 / 365) * (dayOfYear + 10)) * (Math.PI / 180));

  // Hour angle
  const latRad = latitude * (Math.PI / 180);
  const declRad = declination * (Math.PI / 180);

  const cosHourAngle =
    -Math.tan(latRad) * Math.tan(declRad);

  // Handle polar day/night
  let hourAngle: number;
  if (cosHourAngle > 1) {
    hourAngle = 0; // Polar night
  } else if (cosHourAngle < -1) {
    hourAngle = 180; // Polar day
  } else {
    hourAngle = Math.acos(cosHourAngle) * (180 / Math.PI);
  }

  // Solar noon (simplified - assumes 12:00)
  const solarNoon = 12 - (longitude / 15);

  // Calculate sunrise and sunset
  const sunriseHour = solarNoon - hourAngle / 15;
  const sunsetHour = solarNoon + hourAngle / 15;

  const sunriseMinutes = (sunriseHour % 1) * 60;
  const sunsetMinutes = (sunsetHour % 1) * 60;

  return {
    sunrise: formatTime(Math.floor(sunriseHour), sunriseMinutes),
    sunset: formatTime(Math.floor(sunsetHour), sunsetMinutes),
  };
};

/**
 * Calculate Brahma Muhurta (96 minutes before sunrise)
 * This is considered the most auspicious time for spiritual practice
 */
export const calculateBrahmaMuhurta = (
  sunrise: string
): { start: string; end: string } => {
  const start = addMinutes(sunrise, -96); // 96 minutes before sunrise
  const end = sunrise;

  return { start, end };
};

/**
 * Calculate Abhijit Muhurat (auspicious midday period)
 * Abhijit is the 8th muhurta of the day (around noon)
 * Calculated as the middle 1/15th of the daytime
 */
export const calculateAbhijitMuhurat = (
  sunrise: string,
  sunset: string
): { start: string; end: string } => {
  const sunriseMinutes = parseTime(sunrise).hours * 60 + parseTime(sunrise).minutes;
  const sunsetMinutes = parseTime(sunset).hours * 60 + parseTime(sunset).minutes;

  // Day length in minutes
  const dayLength = sunsetMinutes - sunriseMinutes;

  // Abhijit is in the middle of the day
  const middleOfDay = sunriseMinutes + dayLength / 2;

  // Abhijit duration is 1/15th of day (approximately 48 minutes for 12-hour day)
  const muhurtaDuration = dayLength / 15;

  const start = middleOfDay - muhurtaDuration / 2;
  const end = middleOfDay + muhurtaDuration / 2;

  return {
    start: formatTime(Math.floor(start / 60), start % 60),
    end: formatTime(Math.floor(end / 60), end % 60),
  };
};

/**
 * Calculate Rahu Kaal (inauspicious period)
 * Rahu Kaal is 1/8th of the daytime and varies by weekday
 */
export const calculateRahuKaal = (
  sunrise: string,
  sunset: string,
  weekday: number
): { start: string; end: string } => {
  const sunriseMinutes = parseTime(sunrise).hours * 60 + parseTime(sunrise).minutes;
  const sunsetMinutes = parseTime(sunset).hours * 60 + parseTime(sunset).minutes;

  // Day length in minutes
  const dayLength = sunsetMinutes - sunriseMinutes;

  // Each period is 1/8th of the day
  const periodDuration = dayLength / 8;

  // Rahu Kaal period by weekday (0 = Sunday)
  const rahuKaalPeriod: Record<number, number> = {
    0: 7, // Sunday: 7th period
    1: 1, // Monday: 1st period
    2: 6, // Tuesday: 6th period
    3: 4, // Wednesday: 4th period
    4: 3, // Thursday: 3rd period
    5: 2, // Friday: 2nd period
    6: 5, // Saturday: 5th period
  };

  const period = rahuKaalPeriod[weekday] || 1;
  const start = sunriseMinutes + (period - 1) * periodDuration;
  const end = start + periodDuration;

  return {
    start: formatTime(Math.floor(start / 60), start % 60),
    end: formatTime(Math.floor(end / 60), end % 60),
  };
};

/**
 * Get complete muhurat data for a specific date and location
 */
export const getMuhuratForDate = (
  date: string,
  latitude: number = DEFAULT_LOCATION.latitude,
  longitude: number = DEFAULT_LOCATION.longitude
): MuhuratData => {
  // Calculate sunrise and sunset
  const { sunrise, sunset } = calculateSunriseSunset(date, latitude, longitude);

  // Calculate other muhurats
  const brahmaMuhurta = calculateBrahmaMuhurta(sunrise);
  const abhijitMuhurat = calculateAbhijitMuhurat(sunrise, sunset);

  // Get weekday for Rahu Kaal
  const dateObj = new Date(date + 'T12:00:00Z');
  const weekday = dateObj.getDay();
  const rahuKaal = calculateRahuKaal(sunrise, sunset, weekday);

  return {
    date,
    sunrise,
    sunset,
    brahmaMuhurta,
    abhijitMuhurat,
    rahuKaal,
  };
};
