/**
 * Muhurat (Auspicious Times) Tests
 * Shloka Sadhana - Hindu Muhurat Calculations
 *
 * Tests for sunrise, sunset, Brahma Muhurta, and other auspicious time calculations
 */

import {
  calculateSunriseSunset,
  calculateBrahmaMuhurta,
  calculateAbhijitMuhurat,
  calculateRahuKaal,
  calculateYamagandaKaal,
  calculateGulikaKaal,
  calculateChoghadiya,
  getTradingWindows,
  getMuhuratForDate,
  formatTime,
} from '../muhurat';

describe('Muhurat Service', () => {
  describe('formatTime', () => {
    it('should format time in HH:MM format', () => {
      expect(formatTime(6, 30)).toBe('06:30');
      expect(formatTime(12, 0)).toBe('12:00');
      expect(formatTime(18, 45)).toBe('18:45');
    });

    it('should handle single digit hours and minutes', () => {
      expect(formatTime(5, 5)).toBe('05:05');
      expect(formatTime(9, 9)).toBe('09:09');
    });

    it('should handle edge cases', () => {
      expect(formatTime(0, 0)).toBe('00:00');
      expect(formatTime(23, 59)).toBe('23:59');
    });
  });

  describe('calculateSunriseSunset', () => {
    it('should calculate sunrise and sunset for a given date and location', () => {
      // Delhi coordinates
      const result = calculateSunriseSunset('2024-01-15', 28.6139, 77.2090);

      expect(result).toHaveProperty('sunrise');
      expect(result).toHaveProperty('sunset');
      expect(typeof result.sunrise).toBe('string');
      expect(typeof result.sunset).toBe('string');

      // Sunrise should be in morning (before noon)
      const sunriseHour = parseInt(result.sunrise.split(':')[0]);
      expect(sunriseHour).toBeGreaterThanOrEqual(0);
      expect(sunriseHour).toBeLessThan(12);

      // Sunset should be in evening (after noon or late morning)
      const sunsetHour = parseInt(result.sunset.split(':')[0]);
      expect(sunsetHour).toBeGreaterThanOrEqual(10);
      expect(sunsetHour).toBeLessThan(24);

      // Sunset should be after sunrise
      const sunriseMinutes = sunriseHour * 60 + parseInt(result.sunrise.split(':')[1]);
      const sunsetMinutes = sunsetHour * 60 + parseInt(result.sunset.split(':')[1]);
      expect(sunsetMinutes).toBeGreaterThan(sunriseMinutes);
    });

    it('should return different times for different locations', () => {
      const delhi = calculateSunriseSunset('2024-01-15', 28.6139, 77.2090);
      const mumbai = calculateSunriseSunset('2024-01-15', 19.0760, 72.8777);

      // Times should be different (even if slightly)
      const isDifferent = delhi.sunrise !== mumbai.sunrise || delhi.sunset !== mumbai.sunset;
      expect(isDifferent).toBe(true);
    });

    it('should return different times for different dates', () => {
      const jan = calculateSunriseSunset('2024-01-15', 28.6139, 77.2090);
      const jun = calculateSunriseSunset('2024-06-15', 28.6139, 77.2090);

      // Times should be different between winter and summer
      expect(jan.sunrise).not.toBe(jun.sunrise);
      expect(jan.sunset).not.toBe(jun.sunset);
    });
  });

  describe('calculateBrahmaMuhurta', () => {
    it('should calculate Brahma Muhurta (96 minutes before sunrise)', () => {
      const sunrise = '06:30';
      const brahmaMuhurta = calculateBrahmaMuhurta(sunrise);

      expect(brahmaMuhurta).toHaveProperty('start');
      expect(brahmaMuhurta).toHaveProperty('end');
      expect(typeof brahmaMuhurta.start).toBe('string');
      expect(typeof brahmaMuhurta.end).toBe('string');

      // End should be sunrise
      expect(brahmaMuhurta.end).toBe(sunrise);

      // Start should be 96 minutes before sunrise
      expect(brahmaMuhurta.start).toBe('04:54');
    });

    it('should handle edge cases around midnight', () => {
      const sunrise = '00:30'; // Very early sunrise (extreme latitude)
      const brahmaMuhurta = calculateBrahmaMuhurta(sunrise);

      expect(brahmaMuhurta.start).toBeTruthy();
      expect(brahmaMuhurta.end).toBe(sunrise);
    });

    it('should calculate correctly for different sunrise times', () => {
      const bm1 = calculateBrahmaMuhurta('05:00');
      const bm2 = calculateBrahmaMuhurta('07:00');

      expect(bm1.start).toBe('03:24');
      expect(bm1.end).toBe('05:00');

      expect(bm2.start).toBe('05:24');
      expect(bm2.end).toBe('07:00');
    });
  });

  describe('calculateAbhijitMuhurat', () => {
    it('should calculate Abhijit Muhurat (midday auspicious time)', () => {
      const sunrise = '06:00';
      const sunset = '18:00';
      const abhijit = calculateAbhijitMuhurat(sunrise, sunset);

      expect(abhijit).toHaveProperty('start');
      expect(abhijit).toHaveProperty('end');
      expect(typeof abhijit.start).toBe('string');
      expect(typeof abhijit.end).toBe('string');

      // Should be around noon
      const startHour = parseInt(abhijit.start.split(':')[0]);
      expect(startHour).toBeGreaterThanOrEqual(11);
      expect(startHour).toBeLessThanOrEqual(13);
    });

    it('should calculate correctly for different day lengths', () => {
      // Short winter day
      const winter = calculateAbhijitMuhurat('07:00', '17:00');

      // Long summer day
      const summer = calculateAbhijitMuhurat('05:00', '19:00');

      // Both should be valid
      expect(winter.start).toBeTruthy();
      expect(winter.end).toBeTruthy();
      expect(summer.start).toBeTruthy();
      expect(summer.end).toBeTruthy();

      // Summer abhijit should be later than winter
      const winterStart = parseInt(winter.start.split(':')[0]);
      const summerStart = parseInt(summer.start.split(':')[0]);
      expect(summerStart).toBeLessThanOrEqual(winterStart);
    });
  });

  describe('calculateRahuKaal', () => {
    it('should calculate Rahu Kaal for each weekday', () => {
      const sunrise = '06:00';
      const sunset = '18:00';

      for (let weekday = 0; weekday < 7; weekday++) {
        const rahuKaal = calculateRahuKaal(sunrise, sunset, weekday);

        expect(rahuKaal).toHaveProperty('start');
        expect(rahuKaal).toHaveProperty('end');
        expect(typeof rahuKaal.start).toBe('string');
        expect(typeof rahuKaal.end).toBe('string');
      }
    });

    it('should return different times for different weekdays', () => {
      const sunrise = '06:00';
      const sunset = '18:00';

      const sunday = calculateRahuKaal(sunrise, sunset, 0);
      const monday = calculateRahuKaal(sunrise, sunset, 1);

      expect(sunday.start).not.toBe(monday.start);
    });

    it('should handle different day lengths', () => {
      const short = calculateRahuKaal('07:00', '17:00', 0);
      const long = calculateRahuKaal('05:00', '19:00', 0);

      expect(short.start).toBeTruthy();
      expect(short.end).toBeTruthy();
      expect(long.start).toBeTruthy();
      expect(long.end).toBeTruthy();
    });
  });

  describe('getMuhuratForDate', () => {
    it('should return complete muhurat data for a date and location', () => {
      const muhurat = getMuhuratForDate('2024-01-15', 28.6139, 77.2090);

      expect(muhurat).toHaveProperty('date');
      expect(muhurat).toHaveProperty('sunrise');
      expect(muhurat).toHaveProperty('sunset');
      expect(muhurat).toHaveProperty('brahmaMuhurta');
      expect(muhurat).toHaveProperty('abhijitMuhurat');
      expect(muhurat).toHaveProperty('rahuKaal');

      expect(muhurat.date).toBe('2024-01-15');
      expect(typeof muhurat.sunrise).toBe('string');
      expect(typeof muhurat.sunset).toBe('string');
    });

    it('should calculate all muhurat times correctly', () => {
      const muhurat = getMuhuratForDate('2024-01-15', 28.6139, 77.2090);

      // Brahma Muhurta should end at sunrise
      expect(muhurat.brahmaMuhurta.end).toBe(muhurat.sunrise);

      // All times should be valid
      expect(muhurat.brahmaMuhurta.start).toBeTruthy();
      expect(muhurat.abhijitMuhurat?.start).toBeTruthy();
      expect(muhurat.abhijitMuhurat?.end).toBeTruthy();
      expect(muhurat.rahuKaal?.start).toBeTruthy();
      expect(muhurat.rahuKaal?.end).toBeTruthy();
    });

    it('should handle today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      const muhurat = getMuhuratForDate(today, 28.6139, 77.2090);

      expect(muhurat.date).toBe(today);
      expect(muhurat.sunrise).toBeTruthy();
      expect(muhurat.sunset).toBeTruthy();
    });

    it('should use default location if not provided', () => {
      const muhurat = getMuhuratForDate('2024-01-15');

      expect(muhurat.date).toBe('2024-01-15');
      expect(muhurat.sunrise).toBeTruthy();
      expect(muhurat.sunset).toBeTruthy();
    });
  });

  describe('calculateYamagandaKaal', () => {
    it('should calculate Yamaganda Kaal for each weekday', () => {
      const sunrise = '06:00';
      const sunset = '18:00';

      for (let weekday = 0; weekday < 7; weekday++) {
        const yamagandaKaal = calculateYamagandaKaal(sunrise, sunset, weekday);

        expect(yamagandaKaal).toHaveProperty('start');
        expect(yamagandaKaal).toHaveProperty('end');
        expect(typeof yamagandaKaal.start).toBe('string');
        expect(typeof yamagandaKaal.end).toBe('string');
      }
    });

    it('should return different times for different weekdays', () => {
      const sunrise = '06:00';
      const sunset = '18:00';

      const sunday = calculateYamagandaKaal(sunrise, sunset, 0);
      const monday = calculateYamagandaKaal(sunrise, sunset, 1);

      expect(sunday.start).not.toBe(monday.start);
    });

    it('should calculate correct period for Sunday (5th period)', () => {
      // Sunday: Yamaganda is 5th period
      const sunrise = '06:00';
      const sunset = '18:00';
      const yamaganda = calculateYamagandaKaal(sunrise, sunset, 0);

      // Day is 12 hours = 720 minutes
      // Each period = 720/8 = 90 minutes
      // 5th period: 06:00 + (4 * 90) = 06:00 + 360 = 12:00 to 13:30
      expect(yamaganda.start).toBe('12:00');
      expect(yamaganda.end).toBe('13:30');
    });

    it('should calculate correct period for Wednesday (2nd period)', () => {
      // Wednesday: Yamaganda is 2nd period
      const sunrise = '06:00';
      const sunset = '18:00';
      const yamaganda = calculateYamagandaKaal(sunrise, sunset, 3);

      // 2nd period: 06:00 + (1 * 90) = 06:00 + 90 = 07:30 to 09:00
      expect(yamaganda.start).toBe('07:30');
      expect(yamaganda.end).toBe('09:00');
    });

    it('should handle different day lengths', () => {
      const short = calculateYamagandaKaal('07:00', '17:00', 0);
      const long = calculateYamagandaKaal('05:00', '19:00', 0);

      expect(short.start).toBeTruthy();
      expect(short.end).toBeTruthy();
      expect(long.start).toBeTruthy();
      expect(long.end).toBeTruthy();
    });
  });

  describe('calculateGulikaKaal', () => {
    it('should calculate Gulika Kaal for each weekday', () => {
      const sunrise = '06:00';
      const sunset = '18:00';

      for (let weekday = 0; weekday < 7; weekday++) {
        const gulikaKaal = calculateGulikaKaal(sunrise, sunset, weekday);

        expect(gulikaKaal).toHaveProperty('start');
        expect(gulikaKaal).toHaveProperty('end');
        expect(typeof gulikaKaal.start).toBe('string');
        expect(typeof gulikaKaal.end).toBe('string');
      }
    });

    it('should return different times for different weekdays', () => {
      const sunrise = '06:00';
      const sunset = '18:00';

      const sunday = calculateGulikaKaal(sunrise, sunset, 0);
      const monday = calculateGulikaKaal(sunrise, sunset, 1);

      expect(sunday.start).not.toBe(monday.start);
    });

    it('should calculate correct period for Sunday (6th period)', () => {
      // Sunday: Gulika is 6th period
      const sunrise = '06:00';
      const sunset = '18:00';
      const gulika = calculateGulikaKaal(sunrise, sunset, 0);

      // 6th period: 06:00 + (5 * 90) = 06:00 + 450 = 13:30 to 15:00
      expect(gulika.start).toBe('13:30');
      expect(gulika.end).toBe('15:00');
    });

    it('should calculate correct period for Thursday (2nd period)', () => {
      // Thursday: Gulika is 2nd period
      const sunrise = '06:00';
      const sunset = '18:00';
      const gulika = calculateGulikaKaal(sunrise, sunset, 4);

      // 2nd period: 06:00 + (1 * 90) = 06:00 + 90 = 07:30 to 09:00
      expect(gulika.start).toBe('07:30');
      expect(gulika.end).toBe('09:00');
    });

    it('should handle different day lengths', () => {
      const short = calculateGulikaKaal('07:00', '17:00', 0);
      const long = calculateGulikaKaal('05:00', '19:00', 0);

      expect(short.start).toBeTruthy();
      expect(short.end).toBeTruthy();
      expect(long.start).toBeTruthy();
      expect(long.end).toBeTruthy();
    });
  });

  describe('calculateChoghadiya', () => {
    it('should calculate 8 day choghadiya periods', () => {
      const sunrise = '06:00';
      const sunset = '18:00';
      const weekday = 0; // Sunday

      const { dayChoghadiya } = calculateChoghadiya(sunrise, sunset, weekday);

      expect(dayChoghadiya).toHaveLength(8);
      dayChoghadiya.forEach((period) => {
        expect(period).toHaveProperty('start');
        expect(period).toHaveProperty('end');
        expect(period).toHaveProperty('type');
        expect(period).toHaveProperty('isAuspicious');
        expect(typeof period.type).toBe('string');
        expect(typeof period.isAuspicious).toBe('boolean');
      });
    });

    it('should calculate 8 night choghadiya periods', () => {
      const sunrise = '06:00';
      const sunset = '18:00';
      const weekday = 0; // Sunday

      const { nightChoghadiya } = calculateChoghadiya(sunrise, sunset, weekday);

      expect(nightChoghadiya).toHaveLength(8);
      nightChoghadiya.forEach((period) => {
        expect(period).toHaveProperty('start');
        expect(period).toHaveProperty('end');
        expect(period).toHaveProperty('type');
        expect(period).toHaveProperty('isAuspicious');
      });
    });

    it('should have correct choghadiya types', () => {
      const sunrise = '06:00';
      const sunset = '18:00';
      const weekday = 0; // Sunday

      const { dayChoghadiya } = calculateChoghadiya(sunrise, sunset, weekday);

      const validTypes = ['Amrit', 'Shubh', 'Labh', 'Char', 'Rog', 'Kaal', 'Udveg'];
      dayChoghadiya.forEach((period) => {
        expect(validTypes).toContain(period.type);
      });
    });

    it('should mark auspicious periods correctly', () => {
      const sunrise = '06:00';
      const sunset = '18:00';
      const weekday = 0;

      const { dayChoghadiya } = calculateChoghadiya(sunrise, sunset, weekday);

      dayChoghadiya.forEach((period) => {
        const auspiciousTypes = ['Amrit', 'Shubh', 'Labh', 'Char'];
        const inauspiciousTypes = ['Rog', 'Kaal', 'Udveg'];

        if (auspiciousTypes.includes(period.type)) {
          expect(period.isAuspicious).toBe(true);
        } else if (inauspiciousTypes.includes(period.type)) {
          expect(period.isAuspicious).toBe(false);
        }
      });
    });

    it('should have continuous periods without gaps', () => {
      const sunrise = '06:00';
      const sunset = '18:00';
      const weekday = 0;

      const { dayChoghadiya } = calculateChoghadiya(sunrise, sunset, weekday);

      for (let i = 0; i < dayChoghadiya.length - 1; i++) {
        expect(dayChoghadiya[i].end).toBe(dayChoghadiya[i + 1].start);
      }
    });

    it('should start at sunrise and end at sunset', () => {
      const sunrise = '06:00';
      const sunset = '18:00';
      const weekday = 0;

      const { dayChoghadiya } = calculateChoghadiya(sunrise, sunset, weekday);

      expect(dayChoghadiya[0].start).toBe(sunrise);
      expect(dayChoghadiya[7].end).toBe(sunset);
    });

    it('should have different patterns for different weekdays', () => {
      const sunrise = '06:00';
      const sunset = '18:00';

      const sunday = calculateChoghadiya(sunrise, sunset, 0);
      const monday = calculateChoghadiya(sunrise, sunset, 1);

      // First period should be different for different weekdays
      expect(sunday.dayChoghadiya[0].type).not.toBe(monday.dayChoghadiya[0].type);
    });
  });

  describe('getTradingWindows', () => {
    it('should consolidate auspicious periods from muhurat data', () => {
      const date = '2024-01-15';
      const lat = 28.6139;
      const lon = 77.2090;

      const muhurat = getMuhuratForDate(date, lat, lon);
      const tradingWindows = getTradingWindows(muhurat);

      expect(tradingWindows).toHaveProperty('date');
      expect(tradingWindows).toHaveProperty('auspiciousPeriods');
      expect(tradingWindows).toHaveProperty('inauspiciousPeriods');
      expect(tradingWindows.date).toBe(date);
    });

    it('should not have duplicate periods in inauspicious list', () => {
      const date = '2024-01-15';
      const muhurat = getMuhuratForDate(date, 28.6139, 77.2090);
      const tradingWindows = getTradingWindows(muhurat);

      // Check for exact duplicates
      const periodStrings = tradingWindows.inauspiciousPeriods.map(
        (p) => `${p.start}-${p.end}`
      );
      const uniquePeriods = new Set(periodStrings);

      expect(periodStrings.length).toBe(uniquePeriods.size);
    });

    it('should merge overlapping inauspicious periods', () => {
      const date = '2024-01-15';
      const muhurat = getMuhuratForDate(date, 28.6139, 77.2090);
      const tradingWindows = getTradingWindows(muhurat);

      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      // Check that no two consecutive periods overlap
      for (let i = 0; i < tradingWindows.inauspiciousPeriods.length - 1; i++) {
        const current = tradingWindows.inauspiciousPeriods[i];
        const next = tradingWindows.inauspiciousPeriods[i + 1];

        const currentEnd = toMinutes(current.end);
        const nextStart = toMinutes(next.start);

        // Next should start at or after current ends (no overlap)
        expect(nextStart).toBeGreaterThanOrEqual(currentEnd);
      }
    });

    it('should merge adjacent inauspicious periods', () => {
      const date = '2024-01-15';
      const muhurat = getMuhuratForDate(date, 28.6139, 77.2090);
      const tradingWindows = getTradingWindows(muhurat);

      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      // If two periods are adjacent (end of one = start of next), they should be merged
      for (let i = 0; i < tradingWindows.inauspiciousPeriods.length - 1; i++) {
        const current = tradingWindows.inauspiciousPeriods[i];
        const next = tradingWindows.inauspiciousPeriods[i + 1];

        const currentEnd = toMinutes(current.end);
        const nextStart = toMinutes(next.start);

        // Should not have adjacent periods (they should be merged)
        expect(currentEnd).not.toBe(nextStart);
      }
    });

    it('should include Abhijit Muhurat in auspicious periods', () => {
      const date = '2024-01-15';
      const muhurat = getMuhuratForDate(date, 28.6139, 77.2090);
      const tradingWindows = getTradingWindows(muhurat);

      // Should include at least Abhijit
      expect(tradingWindows.auspiciousPeriods.length).toBeGreaterThan(0);

      // Helper to convert time to minutes
      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      // Abhijit should be contained within or equal to one of the auspicious periods
      // (it might be merged with adjacent choghadiya periods)
      const abhijitStart = toMinutes(muhurat.abhijitMuhurat?.start || '12:00');
      const abhijitEnd = toMinutes(muhurat.abhijitMuhurat?.end || '12:00');

      const containsAbhijit = tradingWindows.auspiciousPeriods.some((period) => {
        const periodStart = toMinutes(period.start);
        const periodEnd = toMinutes(period.end);

        // Check if abhijit is fully contained within this period
        return periodStart <= abhijitStart && periodEnd >= abhijitEnd;
      });

      expect(containsAbhijit).toBe(true);
    });

    it('should include all inauspicious periods (possibly merged)', () => {
      const date = '2024-01-15';
      const muhurat = getMuhuratForDate(date, 28.6139, 77.2090);
      const tradingWindows = getTradingWindows(muhurat);

      // Should have inauspicious periods (may be merged if adjacent)
      expect(tradingWindows.inauspiciousPeriods.length).toBeGreaterThan(0);

      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      // Rahu Kaal should be covered (either as separate period or merged into a larger period)
      if (muhurat.rahuKaal) {
        const rahuStart = toMinutes(muhurat.rahuKaal.start);
        const rahuEnd = toMinutes(muhurat.rahuKaal.end);

        const rahuIsCovered = tradingWindows.inauspiciousPeriods.some((period) => {
          const periodStart = toMinutes(period.start);
          const periodEnd = toMinutes(period.end);

          // Check if Rahu Kaal is fully covered by this period
          return periodStart <= rahuStart && periodEnd >= rahuEnd;
        });

        expect(rahuIsCovered).toBe(true);
      }
    });

    it('should include auspicious choghadiya periods', () => {
      const date = '2024-01-15';
      const muhurat = getMuhuratForDate(date, 28.6139, 77.2090);
      const tradingWindows = getTradingWindows(muhurat);

      // Should have multiple auspicious periods from choghadiya
      expect(tradingWindows.auspiciousPeriods.length).toBeGreaterThan(1);
    });

    it('should not have overlapping periods in auspicious list', () => {
      const date = '2024-01-15';
      const muhurat = getMuhuratForDate(date, 28.6139, 77.2090);
      const tradingWindows = getTradingWindows(muhurat);

      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      // Check for overlaps in auspicious periods
      for (let i = 0; i < tradingWindows.auspiciousPeriods.length - 1; i++) {
        const current = tradingWindows.auspiciousPeriods[i];
        const next = tradingWindows.auspiciousPeriods[i + 1];

        const currentEnd = toMinutes(current.end);
        const nextStart = toMinutes(next.start);

        // Next should start at or after current ends
        expect(nextStart).toBeGreaterThanOrEqual(currentEnd);
      }
    });

    // Note: We no longer display "Avoid Trading" section in the UI
    // so overlap tests and traditional Kaal filtering tests are not needed

    it('should return auspicious periods for trading', () => {
      const date = '2024-01-15';
      const muhurat = getMuhuratForDate(date, 28.6139, 77.2090);
      const tradingWindows = getTradingWindows(muhurat);

      // Should have auspicious periods (Abhijit + good Choghadiya)
      expect(tradingWindows.auspiciousPeriods.length).toBeGreaterThan(0);

      // Each period should have valid time format
      tradingWindows.auspiciousPeriods.forEach((period) => {
        expect(period.start).toMatch(/^\d{2}:\d{2}$/);
        expect(period.end).toMatch(/^\d{2}:\d{2}$/);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should calculate consistent times across all functions', () => {
      const date = '2024-01-15';
      const lat = 28.6139;
      const lon = 77.2090;

      const muhurat = getMuhuratForDate(date, lat, lon);
      const sunData = calculateSunriseSunset(date, lat, lon);

      expect(muhurat.sunrise).toBe(sunData.sunrise);
      expect(muhurat.sunset).toBe(sunData.sunset);
    });

    it('should have logical time ordering', () => {
      const muhurat = getMuhuratForDate('2024-01-15', 28.6139, 77.2090);

      // Convert times to minutes for comparison
      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      const brahmaMuhurtaStart = toMinutes(muhurat.brahmaMuhurta.start);
      const sunrise = toMinutes(muhurat.sunrise);
      const abhijitStart = toMinutes(muhurat.abhijitMuhurat?.start || '12:00');
      const abhijitEnd = toMinutes(muhurat.abhijitMuhurat?.end || '12:00');
      const sunset = toMinutes(muhurat.sunset);

      // Brahma Muhurta should be before sunrise
      expect(brahmaMuhurtaStart).toBeLessThan(sunrise);

      // Abhijit should be during daytime
      expect(abhijitStart).toBeGreaterThan(sunrise);
      expect(abhijitEnd).toBeLessThan(sunset);

      // Abhijit end should be after start
      expect(abhijitEnd).toBeGreaterThan(abhijitStart);
    });

    it('should include all new muhurat periods in complete data', () => {
      const muhurat = getMuhuratForDate('2024-01-15', 28.6139, 77.2090);

      expect(muhurat).toHaveProperty('yamagandaKaal');
      expect(muhurat).toHaveProperty('gulikaKaal');
      expect(muhurat).toHaveProperty('dayChoghadiya');
      expect(muhurat).toHaveProperty('nightChoghadiya');

      expect(muhurat.yamagandaKaal).toBeTruthy();
      expect(muhurat.gulikaKaal).toBeTruthy();
      expect(muhurat.dayChoghadiya).toHaveLength(8);
      expect(muhurat.nightChoghadiya).toHaveLength(8);
    });

    it('should have non-overlapping inauspicious periods', () => {
      const muhurat = getMuhuratForDate('2024-01-15', 28.6139, 77.2090);

      const periods = [muhurat.rahuKaal, muhurat.yamagandaKaal, muhurat.gulikaKaal].filter(
        Boolean
      );

      const toMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      // Check that no two periods overlap
      for (let i = 0; i < periods.length; i++) {
        for (let j = i + 1; j < periods.length; j++) {
          const p1Start = toMinutes(periods[i]!.start);
          const p1End = toMinutes(periods[i]!.end);
          const p2Start = toMinutes(periods[j]!.start);
          const p2End = toMinutes(periods[j]!.end);

          // Either p1 ends before p2 starts, or p2 ends before p1 starts
          const noOverlap = p1End <= p2Start || p2End <= p1Start;
          expect(noOverlap).toBe(true);
        }
      }
    });
  });
});
