/**
 * Muhurat Activity Labels
 * Shloka Sadhana - V3 Feature #4
 *
 * Activity recommendations for different muhurat times
 */

export interface MuhuratActivity {
  title: string;
  description: string;
  reason: string; // Why this time is auspicious/inauspicious
  icon: string;
  color: string;
  tone?: 'positive' | 'neutral' | 'gentle';
}

export const MUHURAT_ACTIVITIES: Record<string, MuhuratActivity> = {
  brahmaMuhurta: {
    title: 'Best for Spiritual Practice',
    description: 'Meditation, chanting, yoga, study',
    reason: 'The hour before sunrise when the mind is calm and pure, perfect for spiritual practices as cosmic energy is most conducive to meditation and self-realization.',
    icon: '🕉️',
    color: '#FF6B35', // Orange
    tone: 'positive',
  },
  abhijitMuhurat: {
    title: 'Best for Important Tasks',
    description: 'Work, decisions, buying, new ventures',
    reason: 'The most auspicious period when Lord Vishnu conquered all obstacles. Planetary positions are favorable, making it ideal for starting new ventures and important decisions.',
    icon: '⭐',
    color: '#4CAF50', // Green
    tone: 'positive',
  },
  rahuKaal: {
    title: 'Avoid for New Ventures',
    description: 'Not ideal for starting new things',
    reason: 'A period ruled by Rahu (shadow planet) when energy is unstable. Traditionally considered inauspicious for starting new activities, but suitable for routine work and meditation.',
    icon: '⚠️',
    color: '#C9A96E', // Gray (neutral, not red)
    tone: 'gentle', // Non-alarming
  },
};
