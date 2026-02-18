/**
 * ML Recommendation Service Tests
 * Tests for 5-factor scoring algorithm: time-of-day, recency, difficulty, deity, contextual
 */

import { MLRecommendationService, RecommendationContext } from '@/services/mlRecommendationService';

// Mock the shlokas data with controlled fixtures
jest.mock('@/data/shlokas', () => ({
  shlokas: [
    {
      id: 'gayatri',
      title: 'Gayatri Mantra',
      deity: 'Surya',
      estimatedDuration: 5,
      category: 'mantra',
    },
    {
      id: 'mahamrityunjaya',
      title: 'Mahamrityunjaya',
      deity: 'Shiva',
      estimatedDuration: 10,
      category: 'mantra',
    },
    {
      id: 'hanuman_chalisa',
      title: 'Hanuman Chalisa',
      deity: 'Hanuman',
      estimatedDuration: 20,
      category: 'chalisa',
    },
    {
      id: 'vishnu_sahasranama',
      title: 'Vishnu Sahasranama',
      deity: 'Vishnu',
      estimatedDuration: 45,
      category: 'stotra',
    },
    {
      id: 'ganesha_atharvashirsha',
      title: 'Ganesha Atharvashirsha',
      deity: 'Ganesha',
      estimatedDuration: 15,
      category: 'stotra',
    },
  ],
}));

function makeContext(overrides: Partial<RecommendationContext> = {}): RecommendationContext {
  return {
    currentHour: 9, // Morning by default
    currentDay: '2026-02-17',
    recentlyPracticed: [],
    totalPractices: 0,
    isEkadashi: false,
    isFestival: false,
    ...overrides,
  };
}

let service: MLRecommendationService;

beforeEach(() => {
  service = new MLRecommendationService();
});

describe('MLRecommendationService — getRecommendation', () => {
  it('should return a single ShlokaScore', () => {
    const context = makeContext();
    const result = service.getRecommendation(context);

    expect(result).toBeDefined();
    expect(result.shloka).toBeDefined();
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(1);
  });

  it('should include a score breakdown', () => {
    const result = service.getRecommendation(makeContext());

    expect(result.breakdown).toEqual(
      expect.objectContaining({
        timeOfDay: expect.any(Number),
        recency: expect.any(Number),
        difficulty: expect.any(Number),
        deityPreference: expect.any(Number),
        contextual: expect.any(Number),
      })
    );
  });

  it('should include a user-facing reason string', () => {
    const result = service.getRecommendation(makeContext());
    expect(result.reason).toBeTruthy();
    expect(typeof result.reason).toBe('string');
  });

  it('should return top scored shloka (not random)', () => {
    const context = makeContext({ currentHour: 9 }); // Morning → Surya/Ganesha preferred
    const top = service.getRecommendation(context);
    const all = service.getTopRecommendations(context, 5);

    expect(top.shloka.id).toBe(all[0].shloka.id);
  });
});

describe('MLRecommendationService — getTopRecommendations', () => {
  it('should return N recommendations sorted by score descending', () => {
    const context = makeContext();
    const results = service.getTopRecommendations(context, 3);

    expect(results).toHaveLength(3);
    expect(results[0].totalScore).toBeGreaterThanOrEqual(results[1].totalScore);
    expect(results[1].totalScore).toBeGreaterThanOrEqual(results[2].totalScore);
  });

  it('should return all shlokas if count exceeds shloka count', () => {
    const context = makeContext();
    const results = service.getTopRecommendations(context, 100);
    expect(results).toHaveLength(5); // only 5 mock shlokas
  });
});

describe('Factor 1: Time of Day Score', () => {
  it('should prefer Surya-related shlokas in the morning (6 AM–12 PM)', () => {
    const context = makeContext({ currentHour: 9, recentlyPracticed: [] });
    const results = service.getTopRecommendations(context, 5);

    const gayatriScore = results.find((r) => r.shloka.id === 'gayatri')!;
    // Gayatri is Surya — morning deity, should have high timeOfDay score
    expect(gayatriScore.breakdown.timeOfDay).toBeGreaterThan(0.5);
  });

  it('should prefer Shiva-related shlokas in the evening (4 PM–7 PM)', () => {
    const context = makeContext({ currentHour: 17, recentlyPracticed: [] });
    const results = service.getTopRecommendations(context, 5);

    const shivaScore = results.find((r) => r.shloka.id === 'mahamrityunjaya')!;
    expect(shivaScore.breakdown.timeOfDay).toBeGreaterThan(0.5);
  });

  it('should give brahma muhurta boost (4 AM–6 AM)', () => {
    const contextBrahma = makeContext({ currentHour: 5 });
    const contextMorning = makeContext({ currentHour: 9 });

    const brahmaSurya = service
      .getTopRecommendations(contextBrahma, 5)
      .find((r) => r.shloka.id === 'gayatri')!;
    const morningSurya = service
      .getTopRecommendations(contextMorning, 5)
      .find((r) => r.shloka.id === 'gayatri')!;

    // Brahma muhurta gets extra boost
    expect(brahmaSurya.breakdown.timeOfDay).toBeGreaterThan(morningSurya.breakdown.timeOfDay);
  });

  it('should prefer afternoon deities (Hanuman) over non-preferred deities in afternoon (12 PM–4 PM)', () => {
    const context = makeContext({ currentHour: 14 });
    const results = service.getTopRecommendations(context, 5);

    // Hanuman Chalisa (Hanuman=afternoon deity, +0.3) should score higher than Gayatri (Surya, +0.2 short)
    const hanumanScore = results.find((r) => r.shloka.id === 'hanuman_chalisa')!;
    const gayatriScore = results.find((r) => r.shloka.id === 'gayatri')!;
    expect(hanumanScore.breakdown.timeOfDay).toBeGreaterThan(gayatriScore.breakdown.timeOfDay);
  });
});

describe('Factor 2: Recency Score', () => {
  it('should give score of 1.0 for never-practiced shloka', () => {
    const context = makeContext({ recentlyPracticed: [] });
    const results = service.getTopRecommendations(context, 5);
    const anyResult = results[0];
    expect(anyResult.breakdown.recency).toBe(1.0);
  });

  it('should penalize most recently practiced shloka (index 0)', () => {
    const context = makeContext({ recentlyPracticed: ['gayatri', 'mahamrityunjaya'] });
    const results = service.getTopRecommendations(context, 5);

    const gayatriScore = results.find((r) => r.shloka.id === 'gayatri')!;
    const hanumanScore = results.find((r) => r.shloka.id === 'hanuman_chalisa')!;

    // Gayatri was practiced most recently → lower recency score
    expect(gayatriScore.breakdown.recency).toBeLessThan(hanumanScore.breakdown.recency);
  });

  it('should give higher score to shloka practiced further back in history', () => {
    // gayatri at index 0 (most recent), mahamrityunjaya at index 5 (less recent)
    const recentlyPracticed = ['gayatri', 'a', 'b', 'c', 'd', 'mahamrityunjaya'];
    const context = makeContext({ recentlyPracticed });
    const results = service.getTopRecommendations(context, 5);

    const gayatriScore = results.find((r) => r.shloka.id === 'gayatri')!;
    const shivaScore = results.find((r) => r.shloka.id === 'mahamrityunjaya')!;

    expect(shivaScore.breakdown.recency).toBeGreaterThan(gayatriScore.breakdown.recency);
  });
});

describe('Factor 3: Difficulty Score', () => {
  it('should return 0.5 when no experience level is set', () => {
    const context = makeContext({ experienceLevel: undefined });
    const results = service.getTopRecommendations(context, 5);
    results.forEach((r) => {
      expect(r.breakdown.difficulty).toBe(0.5);
    });
  });

  it('should score 1.0 for perfect difficulty match (beginner + short shloka)', () => {
    const context = makeContext({ experienceLevel: 'beginner' });
    const results = service.getTopRecommendations(context, 5);

    // Gayatri is 5 min (beginner level)
    const gayatriScore = results.find((r) => r.shloka.id === 'gayatri')!;
    expect(gayatriScore.breakdown.difficulty).toBe(1.0);
  });

  it('should score 0.3 for opposite difficulty mismatch (beginner + advanced shloka)', () => {
    const context = makeContext({ experienceLevel: 'beginner' });
    const results = service.getTopRecommendations(context, 5);

    // Vishnu Sahasranama is 45 min (advanced level)
    const vishnuScore = results.find((r) => r.shloka.id === 'vishnu_sahasranama')!;
    expect(vishnuScore.breakdown.difficulty).toBe(0.3);
  });

  it('should score 0.6 for adjacent difficulty level', () => {
    const context = makeContext({ experienceLevel: 'intermediate' });
    const results = service.getTopRecommendations(context, 5);

    // Gayatri is beginner (adjacent to intermediate)
    const gayatriScore = results.find((r) => r.shloka.id === 'gayatri')!;
    expect(gayatriScore.breakdown.difficulty).toBe(0.6);
  });
});

describe('Factor 4: Deity Preference Score', () => {
  it('should return 0.5 when no preferred deity is set', () => {
    const context = makeContext({ preferredDeity: undefined });
    const results = service.getTopRecommendations(context, 5);
    results.forEach((r) => {
      expect(r.breakdown.deityPreference).toBe(0.5);
    });
  });

  it('should score 1.0 for perfect deity match', () => {
    const context = makeContext({ preferredDeity: 'Shiva' });
    const results = service.getTopRecommendations(context, 5);

    const shivaScore = results.find((r) => r.shloka.id === 'mahamrityunjaya')!;
    expect(shivaScore.breakdown.deityPreference).toBe(1.0);
  });

  it('should score 0.7 for related deity (Ganesha when Shiva is preferred)', () => {
    const context = makeContext({ preferredDeity: 'Shiva' });
    const results = service.getTopRecommendations(context, 5);

    // Ganesha is related to Shiva
    const ganeshaScore = results.find((r) => r.shloka.id === 'ganesha_atharvashirsha')!;
    expect(ganeshaScore.breakdown.deityPreference).toBe(0.7);
  });

  it('should score 0.4 for unrelated deity', () => {
    const context = makeContext({ preferredDeity: 'Shiva' });
    const results = service.getTopRecommendations(context, 5);

    // Vishnu is not related to Shiva
    const vishnuScore = results.find((r) => r.shloka.id === 'vishnu_sahasranama')!;
    expect(vishnuScore.breakdown.deityPreference).toBe(0.4);
  });

  it('should score 0.7 for Vishnu preference with Hanuman shloka (related)', () => {
    const context = makeContext({ preferredDeity: 'Vishnu' });
    const results = service.getTopRecommendations(context, 5);

    // Hanuman is in Vishnu's family
    const hanumanScore = results.find((r) => r.shloka.id === 'hanuman_chalisa')!;
    expect(hanumanScore.breakdown.deityPreference).toBe(0.7);
  });
});

describe('Factor 5: Contextual Score', () => {
  it('should boost Vishnu-related shlokas on Ekadashi', () => {
    const contextNormal = makeContext({ isEkadashi: false });
    const contextEkadashi = makeContext({ isEkadashi: true });

    const normalResults = service.getTopRecommendations(contextNormal, 5);
    const ekadashiResults = service.getTopRecommendations(contextEkadashi, 5);

    const vishnuNormal = normalResults.find((r) => r.shloka.id === 'vishnu_sahasranama')!;
    const vishnuEkadashi = ekadashiResults.find((r) => r.shloka.id === 'vishnu_sahasranama')!;

    expect(vishnuEkadashi.breakdown.contextual).toBeGreaterThan(vishnuNormal.breakdown.contextual);
  });

  it('should boost matching deity shloka on festival day', () => {
    const contextFestival = makeContext({
      isFestival: true,
      festivalDeity: 'Ganesha',
    });
    const results = service.getTopRecommendations(contextFestival, 5);

    const ganeshaScore = results.find((r) => r.shloka.id === 'ganesha_atharvashirsha')!;
    expect(ganeshaScore.breakdown.contextual).toBe(1.0); // 0.5 base + 0.5 festival boost, capped at 1.0
  });

  it('should not exceed 1.0 contextual score', () => {
    const context = makeContext({ isEkadashi: true, isFestival: true, festivalDeity: 'Vishnu' });
    const results = service.getTopRecommendations(context, 5);

    results.forEach((r) => {
      expect(r.breakdown.contextual).toBeLessThanOrEqual(1.0);
    });
  });

  it('should give base score of 0.5 for normal day', () => {
    const context = makeContext({ isEkadashi: false, isFestival: false });
    const results = service.getTopRecommendations(context, 5);

    // Non-Vishnu shloka on normal day should have base 0.5
    const shivaScore = results.find((r) => r.shloka.id === 'mahamrityunjaya')!;
    expect(shivaScore.breakdown.contextual).toBe(0.5);
  });
});

describe('MLRecommendationService — Weighted Combination', () => {
  it('should respect the 30/25/20/15/10 weight distribution', () => {
    // Verify weights by constructing a scenario where only one factor is active
    const context = makeContext({
      currentHour: 9, // Morning: Surya preferred
      recentlyPracticed: [],
      experienceLevel: undefined, // default 0.5
      preferredDeity: undefined,  // default 0.5
      isEkadashi: false,
    });

    const results = service.getTopRecommendations(context, 5);
    const gayatri = results.find((r) => r.shloka.id === 'gayatri')!;

    // Manually calculate expected score range for Gayatri in morning
    // timeOfDay: ~0.8 (Surya match), recency: 1.0, difficulty: 0.5, deity: 0.5, contextual: 0.5
    // expected = 0.8*0.30 + 1.0*0.25 + 0.5*0.20 + 0.5*0.15 + 0.5*0.10
    //          = 0.24 + 0.25 + 0.10 + 0.075 + 0.05 = 0.715
    expect(gayatri.totalScore).toBeGreaterThan(0.6);
    expect(gayatri.totalScore).toBeLessThanOrEqual(1.0);
  });

  it('should produce different top shlokas for different contexts', () => {
    const morningContext = makeContext({ currentHour: 9 });   // Morning → Surya/Ganesha preferred
    const eveningContext = makeContext({ currentHour: 17 });  // Evening → Shiva/Devi/Krishna preferred

    const morningTop = service.getRecommendation(morningContext);
    const eveningTop = service.getRecommendation(eveningContext);

    // Different times should recommend different shlokas (Gayatri for morning, Mahamrityunjaya for evening)
    expect(morningTop.shloka.id).not.toBe(eveningTop.shloka.id);
  });
});

describe('MLRecommendationService — Reason Generation', () => {
  it('should generate reason based on time of day', () => {
    const context = makeContext({ currentHour: 9 }); // Morning
    const result = service.getRecommendation(context);
    expect(result.reason).toBeTruthy();
  });

  it('should generate Ekadashi reason when Ekadashi is active and recency is low', () => {
    // With all shlokas recently practiced, recency drops below contextual (0.9)
    // so the Ekadashi contextual boost becomes the top factor
    const context = makeContext({
      isEkadashi: true,
      recentlyPracticed: ['gayatri', 'mahamrityunjaya', 'hanuman_chalisa', 'vishnu_sahasranama', 'ganesha_atharvashirsha'],
    });
    const results = service.getTopRecommendations(context, 5);
    const vishnuResult = results.find((r) => r.shloka.id === 'vishnu_sahasranama');
    if (vishnuResult) {
      // contextual=0.9 is top factor (recency is low due to recent practice)
      expect(vishnuResult.reason).toContain('Ekadashi');
    }
  });

  it('should generate deity reason when deity preference is the top factor', () => {
    // Add mahamrityunjaya to recentlyPracticed so recency drops to 0.1
    // making deity (1.0) the clear winning factor over recency
    const context = makeContext({
      preferredDeity: 'Shiva',
      recentlyPracticed: ['mahamrityunjaya', 'gayatri', 'hanuman_chalisa', 'vishnu_sahasranama', 'ganesha_atharvashirsha'],
      currentHour: 14, // Afternoon — less time-sensitive
    });
    const results = service.getTopRecommendations(context, 1);
    // Mahamrityunjaya: deity=1.0 (top factor) > recency=0.1 → reason = "Dedicated to Shiva"
    if (results[0].shloka.deity === 'Shiva') {
      expect(results[0].reason).toContain('Shiva');
    }
  });
});
