/**
 * Muhurat Service
 * Shloka Sadhana - Hindu Muhurat (Auspicious Times) Calculations
 *
 * Calculates sunrise, sunset, Brahma Muhurta, Abhijit Muhurat, Rahu Kaal, etc.
 */

import { MuhuratData, ChoghadiyaPeriod, ChoghadiyaType, TimePeriod, TradingWindows } from '@/types';

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
): TimePeriod => {
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
 * Calculate Yamaganda Kaal (inauspicious period)
 * Yamaganda Kaal is 1/8th of the daytime and varies by weekday
 */
export const calculateYamagandaKaal = (
  sunrise: string,
  sunset: string,
  weekday: number
): TimePeriod => {
  const sunriseMinutes = parseTime(sunrise).hours * 60 + parseTime(sunrise).minutes;
  const sunsetMinutes = parseTime(sunset).hours * 60 + parseTime(sunset).minutes;

  // Day length in minutes
  const dayLength = sunsetMinutes - sunriseMinutes;

  // Each period is 1/8th of the day
  const periodDuration = dayLength / 8;

  // Yamaganda Kaal period by weekday (0 = Sunday)
  const yamagandaPeriod: Record<number, number> = {
    0: 5, // Sunday: 5th period
    1: 4, // Monday: 4th period
    2: 3, // Tuesday: 3rd period
    3: 2, // Wednesday: 2nd period
    4: 1, // Thursday: 1st period
    5: 7, // Friday: 7th period
    6: 6, // Saturday: 6th period
  };

  const period = yamagandaPeriod[weekday] || 1;
  const start = sunriseMinutes + (period - 1) * periodDuration;
  const end = start + periodDuration;

  return {
    start: formatTime(Math.floor(start / 60), start % 60),
    end: formatTime(Math.floor(end / 60), end % 60),
  };
};

/**
 * Calculate Gulika Kaal (inauspicious period)
 * Gulika Kaal is 1/8th of the daytime and varies by weekday
 */
export const calculateGulikaKaal = (
  sunrise: string,
  sunset: string,
  weekday: number
): TimePeriod => {
  const sunriseMinutes = parseTime(sunrise).hours * 60 + parseTime(sunrise).minutes;
  const sunsetMinutes = parseTime(sunset).hours * 60 + parseTime(sunset).minutes;

  // Day length in minutes
  const dayLength = sunsetMinutes - sunriseMinutes;

  // Each period is 1/8th of the day
  const periodDuration = dayLength / 8;

  // Gulika Kaal period by weekday (0 = Sunday)
  const gulikaPeriod: Record<number, number> = {
    0: 6, // Sunday: 6th period
    1: 5, // Monday: 5th period
    2: 4, // Tuesday: 4th period
    3: 3, // Wednesday: 3rd period
    4: 2, // Thursday: 2nd period
    5: 1, // Friday: 1st period
    6: 7, // Saturday: 7th period
  };

  const period = gulikaPeriod[weekday] || 1;
  const start = sunriseMinutes + (period - 1) * periodDuration;
  const end = start + periodDuration;

  return {
    start: formatTime(Math.floor(start / 60), start % 60),
    end: formatTime(Math.floor(end / 60), end % 60),
  };
};

/**
 * Calculate Choghadiya periods (8 periods each for day and night)
 * Choghadiya is a Vedic system of dividing the day into auspicious and inauspicious periods
 */
export const calculateChoghadiya = (
  sunrise: string,
  sunset: string,
  weekday: number
): { dayChoghadiya: ChoghadiyaPeriod[]; nightChoghadiya: ChoghadiyaPeriod[] } => {
  const sunriseMinutes = parseTime(sunrise).hours * 60 + parseTime(sunrise).minutes;
  const sunsetMinutes = parseTime(sunset).hours * 60 + parseTime(sunset).minutes;

  // Day and night lengths
  const dayLength = sunsetMinutes - sunriseMinutes;
  const nightLength = 24 * 60 - dayLength;

  // Each choghadiya period duration
  const dayPeriodDuration = dayLength / 8;
  const nightPeriodDuration = nightLength / 8;

  // Choghadiya sequence (repeating pattern of 7, cycles through)
  const choghadiyaTypes: ChoghadiyaType[] = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];

  // Starting choghadiya type for each weekday (day)
  const dayStartIndex: Record<number, number> = {
    0: 1, // Sunday starts with Char
    1: 6, // Monday starts with Rog
    2: 3, // Tuesday starts with Amrit
    3: 5, // Wednesday starts with Shubh
    4: 2, // Thursday starts with Labh
    5: 0, // Friday starts with Udveg
    6: 4, // Saturday starts with Kaal
  };

  // Starting choghadiya type for night (4 steps ahead from day start)
  const nightStartIndex: Record<number, number> = {};
  for (let day = 0; day < 7; day++) {
    nightStartIndex[day] = (dayStartIndex[day] + 4) % 7;
  }

  // Calculate day choghadiya
  const dayChoghadiya: ChoghadiyaPeriod[] = [];
  let startIndex = dayStartIndex[weekday];

  for (let i = 0; i < 8; i++) {
    const typeIndex = (startIndex + i) % 7;
    const type = choghadiyaTypes[typeIndex];
    const isAuspicious = ['Amrit', 'Shubh', 'Labh', 'Char'].includes(type);

    const start = sunriseMinutes + i * dayPeriodDuration;
    const end = start + dayPeriodDuration;

    dayChoghadiya.push({
      type,
      isAuspicious,
      start: formatTime(Math.floor(start / 60), start % 60),
      end: formatTime(Math.floor(end / 60), end % 60),
    });
  }

  // Calculate night choghadiya
  const nightChoghadiya: ChoghadiyaPeriod[] = [];
  startIndex = nightStartIndex[weekday];

  for (let i = 0; i < 8; i++) {
    const typeIndex = (startIndex + i) % 7;
    const type = choghadiyaTypes[typeIndex];
    const isAuspicious = ['Amrit', 'Shubh', 'Labh', 'Char'].includes(type);

    const start = sunsetMinutes + i * nightPeriodDuration;
    const end = start + nightPeriodDuration;

    nightChoghadiya.push({
      type,
      isAuspicious,
      start: formatTime(Math.floor(start / 60) % 24, start % 60),
      end: formatTime(Math.floor(end / 60) % 24, end % 60),
    });
  }

  return { dayChoghadiya, nightChoghadiya };
};

/**
 * Get trading windows from muhurat data
 * Consolidates auspicious and inauspicious periods for trading
 */
export const getTradingWindows = (muhurat: MuhuratData): TradingWindows => {
  const auspiciousPeriods: TimePeriod[] = [];
  const inauspiciousChoghadiya: TimePeriod[] = [];
  const traditionalKaals: TimePeriod[] = [];

  // Add Abhijit Muhurat (most auspicious)
  if (muhurat.abhijitMuhurat) {
    auspiciousPeriods.push(muhurat.abhijitMuhurat);
  }

  // Add auspicious choghadiya periods
  if (muhurat.dayChoghadiya) {
    muhurat.dayChoghadiya.forEach((period) => {
      if (period.isAuspicious) {
        auspiciousPeriods.push({ start: period.start, end: period.end });
      } else {
        // Keep choghadiya separate - these can be filtered
        inauspiciousChoghadiya.push({ start: period.start, end: period.end });
      }
    });
  }

  // Add traditional inauspicious periods (these are always shown unless covered by Abhijit)
  if (muhurat.rahuKaal) {
    traditionalKaals.push(muhurat.rahuKaal);
  }
  if (muhurat.yamagandaKaal) {
    traditionalKaals.push(muhurat.yamagandaKaal);
  }
  if (muhurat.gulikaKaal) {
    traditionalKaals.push(muhurat.gulikaKaal);
  }

  // Sort periods by start time
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  auspiciousPeriods.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  inauspiciousChoghadiya.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  traditionalKaals.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  // Helper function to merge overlapping or adjacent periods
  const mergePeriods = (periods: TimePeriod[]): TimePeriod[] => {
    const merged: TimePeriod[] = [];
    periods.forEach((period) => {
      if (merged.length === 0) {
        merged.push(period);
      } else {
        const last = merged[merged.length - 1];
        const lastEnd = toMinutes(last.end);
        const currentStart = toMinutes(period.start);

        // If overlapping or adjacent (within 1 minute), merge
        if (currentStart <= lastEnd + 1) {
          const currentEnd = toMinutes(period.end);
          if (currentEnd > lastEnd) {
            last.end = period.end;
          }
        } else {
          merged.push(period);
        }
      }
    });
    return merged;
  };

  // Merge overlapping or adjacent periods
  const mergedAuspicious = mergePeriods(auspiciousPeriods);
  const mergedChoghadiya = mergePeriods(inauspiciousChoghadiya);
  const mergedKaals = mergePeriods(traditionalKaals);

  // Filter inauspicious choghadiya: remove those that overlap with ANY auspicious period
  const filteredChoghadiya: TimePeriod[] = [];
  mergedChoghadiya.forEach((bad) => {
    const badStart = toMinutes(bad.start);
    const badEnd = toMinutes(bad.end);

    let hasOverlap = false;
    for (const good of mergedAuspicious) {
      const goodStart = toMinutes(good.start);
      const goodEnd = toMinutes(good.end);

      if (!(badEnd <= goodStart || goodEnd <= badStart)) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) {
      filteredChoghadiya.push(bad);
    }
  });

  // Filter traditional Kaals: ONLY remove if covered by Abhijit Muhurat specifically
  const filteredKaals: TimePeriod[] = [];
  mergedKaals.forEach((kaal) => {
    const kaalStart = toMinutes(kaal.start);
    const kaalEnd = toMinutes(kaal.end);

    // Check if covered by Abhijit Muhurat (not other choghadiya)
    let coveredByAbhijit = false;
    if (muhurat.abhijitMuhurat) {
      const abhijitStart = toMinutes(muhurat.abhijitMuhurat.start);
      const abhijitEnd = toMinutes(muhurat.abhijitMuhurat.end);

      // Check if Abhijit fully covers this Kaal
      if (abhijitStart <= kaalStart && abhijitEnd >= kaalEnd) {
        coveredByAbhijit = true;
      }
    }

    // Keep the Kaal unless fully covered by Abhijit
    if (!coveredByAbhijit) {
      filteredKaals.push(kaal);
    }
  });

  // Combine filtered choghadiya and traditional kaals
  const allInauspicious = [...filteredChoghadiya, ...filteredKaals];
  allInauspicious.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  // Merge the combined list (in case choghadiya and kaals are adjacent)
  const finalInauspicious = mergePeriods(allInauspicious);

  return {
    date: muhurat.date,
    auspiciousPeriods: mergedAuspicious,
    inauspiciousPeriods: finalInauspicious,
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

  // Get weekday for all weekday-dependent calculations
  const dateObj = new Date(date + 'T12:00:00Z');
  const weekday = dateObj.getDay();

  // Calculate muhurats
  const brahmaMuhurta = calculateBrahmaMuhurta(sunrise);
  const abhijitMuhurat = calculateAbhijitMuhurat(sunrise, sunset);
  const rahuKaal = calculateRahuKaal(sunrise, sunset, weekday);
  const yamagandaKaal = calculateYamagandaKaal(sunrise, sunset, weekday);
  const gulikaKaal = calculateGulikaKaal(sunrise, sunset, weekday);

  // Calculate choghadiya
  const { dayChoghadiya, nightChoghadiya } = calculateChoghadiya(sunrise, sunset, weekday);

  return {
    date,
    sunrise,
    sunset,
    brahmaMuhurta,
    abhijitMuhurat,
    rahuKaal,
    yamagandaKaal,
    gulikaKaal,
    dayChoghadiya,
    nightChoghadiya,
  };
};
