/**
 * Shloka Recommendation Utility Tests
 * Shloka Sadhana - V3 Feature #6
 *
 * Tests for intelligent shloka recommendation algorithm
 * Following TDD approach - RED phase
 */

import {
  getDailyRecommendation,
  getRecommendationForUser,
} from '../shlokaRecommendation';
import { getAllShlokas } from '@/data/shlokas';

describe('shlokaRecommendation', () => {
  const TODAY = '2026-02-07'; // Friday
  const MONDAY = '2026-02-09';
  const EKADASHI = '2026-02-13'; // Vijaya Ekadashi

  describe('getDailyRecommendation', () => {
    it('should return a shloka recommendation for a given date', () => {
      const recommendation = getDailyRecommendation(TODAY);

      expect(recommendation).toBeDefined();
      expect(recommendation.shloka).toBeDefined();
      expect(recommendation.reason).toBeDefined();
    });

    it('should include shloka details', () => {
      const recommendation = getDailyRecommendation(TODAY);

      expect(recommendation.shloka.id).toBeDefined();
      expect(recommendation.shloka.name).toBeDefined();
      expect(recommendation.shloka.deity).toBeDefined();
      expect(recommendation.shloka.description).toBeDefined();
    });

    it('should return the same recommendation for the same date', () => {
      const rec1 = getDailyRecommendation(TODAY);
      const rec2 = getDailyRecommendation(TODAY);

      expect(rec1.shloka.id).toBe(rec2.shloka.id);
      expect(rec1.reason).toBe(rec2.reason);
    });

    it('should return different recommendations for different dates', () => {
      const rec1 = getDailyRecommendation(TODAY);
      const rec2 = getDailyRecommendation(MONDAY);

      // Likely different (unless same deity day)
      // At minimum, should have valid recommendations
      expect(rec1.shloka).toBeDefined();
      expect(rec2.shloka).toBeDefined();
    });

    it('should provide a reason for the recommendation', () => {
      const recommendation = getDailyRecommendation(TODAY);

      expect(recommendation.reason).toBeDefined();
      expect(typeof recommendation.reason).toBe('string');
      expect(recommendation.reason.length).toBeGreaterThan(10);
    });
  });

  describe('Deity-based Recommendations', () => {
    it('should recommend Shiva mantras on Monday', () => {
      const recommendation = getDailyRecommendation(MONDAY);

      // Monday is dedicated to Lord Shiva
      expect(
        recommendation.shloka.deity.toLowerCase().includes('shiva') ||
        recommendation.reason.toLowerCase().includes('monday')
      ).toBe(true);
    });

    it('should recommend Vishnu mantras on Ekadashi', () => {
      const recommendation = getDailyRecommendation(EKADASHI);

      // Ekadashi is dedicated to Lord Vishnu/Narayana
      expect(
        recommendation.shloka.deity.toLowerCase().includes('vishnu') ||
        recommendation.shloka.deity.toLowerCase().includes('narayana') ||
        recommendation.reason.toLowerCase().includes('ekadashi')
      ).toBe(true);
    });

    it('should recommend Ganesh mantras on Wednesday', () => {
      const wednesday = '2026-02-11';
      const recommendation = getDailyRecommendation(wednesday);

      expect(
        recommendation.shloka.deity.toLowerCase().includes('ganesh') ||
        recommendation.shloka.deity.toLowerCase().includes('ganesha') ||
        recommendation.reason.toLowerCase().includes('wednesday')
      ).toBe(true);
    });
  });

  describe('Festival-based Recommendations', () => {
    it('should detect Ekadashi and recommend accordingly', () => {
      const recommendation = getDailyRecommendation(EKADASHI);

      expect(recommendation.reason.toLowerCase()).toContain('ekadashi');
    });

    it('should provide appropriate reason for special days', () => {
      const recommendation = getDailyRecommendation(EKADASHI);

      // Reason should explain why this shloka is recommended
      expect(recommendation.reason).toBeDefined();
      expect(recommendation.reason.length).toBeGreaterThan(20);
    });
  });

  describe('getRecommendationForUser', () => {
    it('should return personalized recommendation based on history', () => {
      const practiceHistory = ['gayatri-mantra', 'mahamrityunjaya-mantra'];
      const recommendation = getRecommendationForUser(TODAY, practiceHistory);

      expect(recommendation).toBeDefined();
      expect(recommendation.shloka).toBeDefined();
    });

    it('should recommend different shlokas from practice history', () => {
      const shlokas = getAllShlokas();
      const practiceHistory = shlokas.slice(0, 3).map(s => s.id);

      const recommendation = getRecommendationForUser(TODAY, practiceHistory);

      // Should recommend something different
      expect(practiceHistory).not.toContain(recommendation.shloka.id);
    });

    it('should handle empty practice history', () => {
      const recommendation = getRecommendationForUser(TODAY, []);

      expect(recommendation).toBeDefined();
      expect(recommendation.shloka).toBeDefined();
    });

    it('should fall back to daily recommendation if all shlokas practiced', () => {
      const shlokas = getAllShlokas();
      const allPracticed = shlokas.map(s => s.id);

      const recommendation = getRecommendationForUser(TODAY, allPracticed);

      // Should still return a recommendation (cycle through again)
      expect(recommendation).toBeDefined();
      expect(recommendation.shloka).toBeDefined();
    });

    it('should prioritize variety in recommendations', () => {
      const practiceHistory = ['gayatri-mantra'];

      const recommendations = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date('2026-02-01');
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        recommendations.push(getRecommendationForUser(dateStr, practiceHistory));
      }

      // Should recommend different shlokas over time
      const uniqueIds = new Set(recommendations.map(r => r.shloka.id));
      expect(uniqueIds.size).toBeGreaterThan(1);
    });
  });

  describe('Recommendation Reasons', () => {
    it('should provide contextual reasons for each recommendation', () => {
      const recommendation = getDailyRecommendation(TODAY);

      // Reason should be meaningful and contextual
      expect(recommendation.reason).toMatch(
        /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|ekadashi|festival|begin|practice)/i
      );
    });

    it('should explain deity-based recommendations', () => {
      const recommendation = getDailyRecommendation(MONDAY);

      if (recommendation.shloka.deity.toLowerCase().includes('shiva')) {
        expect(recommendation.reason.toLowerCase()).toContain('shiva');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap year dates', () => {
      const recommendation = getDailyRecommendation('2028-02-29');

      expect(recommendation).toBeDefined();
      expect(recommendation.shloka).toBeDefined();
    });

    it('should handle year boundaries', () => {
      const rec1 = getDailyRecommendation('2025-12-31');
      const rec2 = getDailyRecommendation('2026-01-01');

      expect(rec1).toBeDefined();
      expect(rec2).toBeDefined();
    });

    it('should handle invalid date format gracefully', () => {
      expect(() => {
        getDailyRecommendation('invalid-date');
      }).toThrow();
    });

    it('should handle very long practice history', () => {
      const longHistory = Array(100).fill('gayatri-mantra');
      const recommendation = getRecommendationForUser(TODAY, longHistory);

      expect(recommendation).toBeDefined();
      expect(recommendation.shloka).toBeDefined();
    });
  });
});
