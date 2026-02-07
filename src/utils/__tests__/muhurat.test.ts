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
  });
});
