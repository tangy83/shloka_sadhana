/**
 * Quest Definitions
 * Shloka Sadhana — Daily quest system
 *
 * Static list of quests. One quest is surfaced per day (rotating by day-of-year mod count).
 * Progress is tracked via useQuestProgress hook.
 */

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  type: 'practices' | 'malas' | 'streak_days';
  xpReward: number;
}

export const QUESTS: Quest[] = [
  {
    id: 'daily_practice',
    title: 'Complete a Practice',
    description: 'Finish one full practice session today.',
    target: 1,
    type: 'practices',
    xpReward: 50,
  },
  {
    id: 'chant_108',
    title: 'Full Mala',
    description: 'Chant a complete mala of 108 beads.',
    target: 108,
    type: 'malas',
    xpReward: 75,
  },
  {
    id: 'streak_3',
    title: '3-Day Streak',
    description: 'Maintain a practice streak for 3 days.',
    target: 3,
    type: 'streak_days',
    xpReward: 100,
  },
  {
    id: 'practices_5',
    title: 'Dedicated Practitioner',
    description: 'Complete 5 practice sessions.',
    target: 5,
    type: 'practices',
    xpReward: 150,
  },
  {
    id: 'malas_5',
    title: 'Devotional Depth',
    description: 'Chant 5 complete malas (5 × 108 beads).',
    target: 5,
    type: 'malas',
    xpReward: 200,
  },
];

/**
 * Get today's featured quest (rotates daily)
 */
export const getTodayQuest = (): Quest => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return QUESTS[dayOfYear % QUESTS.length];
};
