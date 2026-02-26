import { Colors } from '@/constants/Colors';
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
    color: Colors.primary, // Orange
    tone: 'positive',
  },
  abhijitMuhurat: {
    title: 'Best for Important Tasks',
    description: 'Work, decisions, buying, new ventures',
    reason: 'The most auspicious period when Lord Vishnu conquered all obstacles. Planetary positions are favorable, making it ideal for starting new ventures and important decisions.',
    icon: '⭐',
    color: Colors.success, // Green
    tone: 'positive',
  },
  rahuKaal: {
    title: 'Avoid for New Ventures',
    description: 'Not ideal for starting new things',
    reason: 'A period ruled by Rahu (shadow planet) when energy is unstable. Traditionally considered inauspicious for starting new activities, but suitable for routine work and meditation.',
    icon: '⚠️',
    color: Colors.textSecondary, // Gray (neutral, not red)
    tone: 'gentle', // Non-alarming
  },
  yamagandaKaal: {
    title: 'Yamaganda Kaal',
    description: 'Avoid starting new activities',
    reason: 'A period associated with obstacles and delays. It is advised to avoid beginning important tasks, travel, or financial transactions during this time.',
    icon: '⚠️',
    color: Colors.textSecondary,
    tone: 'gentle',
  },
  gulikaKaal: {
    title: 'Gulika Kaal',
    description: 'Avoid starting new activities',
    reason: 'A period ruled by Saturn\'s son Gulika, considered inauspicious for new beginnings. Routine activities and existing work can continue without concern.',
    icon: '⚠️',
    color: Colors.textSecondary,
    tone: 'gentle',
  },
  inauspiciousPeriods: {
    title: 'Avoid for New Ventures',
    description: 'Not ideal for starting new things',
    reason: 'These periods are traditionally considered less favorable for beginning new activities, investments, or important decisions.',
    icon: '⚠️',
    color: Colors.textSecondary,
    tone: 'gentle',
  },
};
