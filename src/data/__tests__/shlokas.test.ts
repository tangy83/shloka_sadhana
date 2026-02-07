/**
 * Shloka Data Tests
 * Shloka Sadhana - Content Data
 *
 * Tests for shloka data structure and integrity
 */

import { getShlokaById, getAllShlokas, getShlokasByDeity } from '../shlokas';

describe('Shloka Data', () => {
  describe('getAllShlokas', () => {
    it('should return an array of shlokas', () => {
      const allShlokas = getAllShlokas();
      expect(Array.isArray(allShlokas)).toBe(true);
      expect(allShlokas.length).toBeGreaterThan(0);
    });

    it('should return shlokas with valid structure', () => {
      const allShlokas = getAllShlokas();
      allShlokas.forEach((shloka) => {
        expect(shloka).toHaveProperty('id');
        expect(shloka).toHaveProperty('name');
        expect(shloka).toHaveProperty('shortName');
        expect(shloka).toHaveProperty('deity');
        expect(shloka).toHaveProperty('description');
        expect(shloka).toHaveProperty('benefits');
        expect(shloka).toHaveProperty('duration');
        expect(shloka).toHaveProperty('bestTime');
        expect(shloka).toHaveProperty('youtubeUrl');
        expect(shloka).toHaveProperty('sections');
      });
    });

    it('should have unique IDs for each shloka', () => {
      const allShlokas = getAllShlokas();
      const ids = allShlokas.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getShlokaById', () => {
    it('should return a shloka by ID', () => {
      const allShlokas = getAllShlokas();
      const firstShloka = allShlokas[0];
      const found = getShlokaById(firstShloka.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(firstShloka.id);
    });

    it('should return undefined for non-existent ID', () => {
      const found = getShlokaById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getShlokasByDeity', () => {
    it('should return shlokas filtered by deity', () => {
      const allShlokas = getAllShlokas();
      if (allShlokas.length > 0) {
        const firstDeity = allShlokas[0].deity;
        const filtered = getShlokasByDeity(firstDeity);

        expect(filtered.length).toBeGreaterThan(0);
        filtered.forEach((shloka) => {
          expect(shloka.deity).toBe(firstDeity);
        });
      }
    });

    it('should return empty array for non-existent deity', () => {
      const filtered = getShlokasByDeity('Non-existent Deity');
      expect(filtered).toEqual([]);
    });
  });

  describe('Shloka Content Validation', () => {
    it('should have non-empty strings for all required fields', () => {
      const allShlokas = getAllShlokas();
      allShlokas.forEach((shloka) => {
        expect(shloka.id).toBeTruthy();
        expect(shloka.name).toBeTruthy();
        expect(shloka.shortName).toBeTruthy();
        expect(shloka.deity).toBeTruthy();
        expect(shloka.description).toBeTruthy();
        expect(shloka.benefits).toBeTruthy();
        expect(shloka.duration).toBeTruthy();
        expect(shloka.bestTime).toBeTruthy();
        expect(shloka.youtubeUrl).toBeTruthy();
      });
    });

    it('should have valid YouTube URLs', () => {
      const allShlokas = getAllShlokas();
      allShlokas.forEach((shloka) => {
        expect(shloka.youtubeUrl).toMatch(/^https:\/\/(www\.)?youtube\.com\/|^https:\/\/youtu\.be\//);
      });
    });

    it('should have at least one section per shloka', () => {
      const allShlokas = getAllShlokas();
      allShlokas.forEach((shloka) => {
        expect(shloka.sections.length).toBeGreaterThan(0);
      });
    });

    it('should have valid section structure', () => {
      const allShlokas = getAllShlokas();
      allShlokas.forEach((shloka) => {
        shloka.sections.forEach((section) => {
          expect(section).toHaveProperty('id');
          expect(section).toHaveProperty('sanskrit');
          expect(section).toHaveProperty('transliteration');
          expect(section).toHaveProperty('meaning');
          expect(section.sanskrit).toBeTruthy();
          expect(section.transliteration).toBeTruthy();
          expect(section.meaning).toBeTruthy();
        });
      });
    });
  });

  describe('Minimum Content Requirements', () => {
    it('should have at least 3 shlokas', () => {
      const allShlokas = getAllShlokas();
      expect(allShlokas.length).toBeGreaterThanOrEqual(3);
    });

    it('should include Gayatri Mantra', () => {
      const allShlokas = getAllShlokas();
      const gayatri = allShlokas.find((s) => s.name.toLowerCase().includes('gayatri'));
      expect(gayatri).toBeDefined();
    });
  });
});
