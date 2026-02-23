/**
 * Achievement Definitions
 * Shloka Sadhana — Achievement unlock system
 *
 * Static list of achievements. Progress is checked via useAchievements hook
 * after each completed practice session.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;           // MaterialCommunityIcons name
  unlockCondition: {
    type: 'practices' | 'streak' | 'malas';
    value: number;
  };
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_practice',
    title: 'First Steps',
    description: 'Complete your first practice session.',
    icon: 'star-outline',
    unlockCondition: { type: 'practices', value: 1 },
    xpReward: 50,
  },
  {
    id: 'mala_master',
    title: 'Mala Master',
    description: 'Complete 108 beads in a single session.',
    icon: 'circle-outline',
    unlockCondition: { type: 'malas', value: 108 },
    xpReward: 75,
  },
  {
    id: 'week_streak',
    title: 'Week of Devotion',
    description: 'Maintain a 7-day practice streak.',
    icon: 'fire',
    unlockCondition: { type: 'streak', value: 7 },
    xpReward: 100,
  },
  {
    id: 'practices_10',
    title: 'Dedicated',
    description: 'Complete 10 practice sessions.',
    icon: 'meditation',
    unlockCondition: { type: 'practices', value: 10 },
    xpReward: 150,
  },
  {
    id: 'streak_30',
    title: 'Sacred Month',
    description: 'Maintain a 30-day practice streak.',
    icon: 'calendar-check',
    unlockCondition: { type: 'streak', value: 30 },
    xpReward: 200,
  },
  {
    id: 'practices_50',
    title: 'Devoted Practitioner',
    description: 'Complete 50 practice sessions.',
    icon: 'hands-pray',
    unlockCondition: { type: 'practices', value: 50 },
    xpReward: 300,
  },
  {
    id: 'malas_100',
    title: 'Bead Counter',
    description: 'Complete 100 full malas (total beads across sessions).',
    icon: 'circle-multiple-outline',
    unlockCondition: { type: 'malas', value: 100 },
    xpReward: 400,
  },
  {
    id: 'streak_100',
    title: 'Century of Devotion',
    description: 'Maintain a 100-day practice streak.',
    icon: 'trophy-outline',
    unlockCondition: { type: 'streak', value: 100 },
    xpReward: 500,
  },
];
