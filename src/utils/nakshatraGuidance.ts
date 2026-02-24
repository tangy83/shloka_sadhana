/**
 * Nakshatra Guidance
 * Shloka Sadhana - Nakshatra-specific recommendations
 *
 * Provides do's and don'ts for each Nakshatra based on Vedic astrology
 */

export interface NakshatraGuidance {
  name: string;
  favorable: string[]; // Things that are favorable during this nakshatra
  unfavorable: string[]; // Things that should be avoided during this nakshatra
  general: string; // General guidance for the day
}

/**
 * Nakshatra guidance data
 * Based on traditional Vedic astrology principles
 */
export const NAKSHATRA_GUIDANCE: Record<string, NakshatraGuidance> = {
  'Ashwini': {
    name: 'Ashwini',
    favorable: ['Starting new ventures', 'Travel', 'Medical treatments', 'Quick actions'],
    unfavorable: ['Long-term commitments', 'Lending money', 'Marriage ceremonies'],
    general: 'A day of swift action and new beginnings. Good for starting treatments and travel.',
  },
  'Bharani': {
    name: 'Bharani',
    favorable: ['Agriculture', 'Construction', 'Creative work', 'Discipline'],
    unfavorable: ['Confrontations', 'Legal disputes', 'Aggressive actions'],
    general: 'Focus on patience and discipline. Good for building and creating with care.',
  },
  'Krittika': {
    name: 'Krittika',
    favorable: ['Purification rituals', 'Spiritual practices', 'Decisive actions', 'Leadership'],
    unfavorable: ['Starting fights', 'Harsh speech', 'Impulsive decisions'],
    general: 'A powerful day for spiritual purification and strong leadership.',
  },
  'Rohini': {
    name: 'Rohini',
    favorable: ['Business', 'Agriculture', 'Romance', 'Beauty treatments', 'Purchases'],
    unfavorable: ['Harsh actions', 'Surgery', 'Breaking relationships'],
    general: 'An auspicious day for growth, prosperity, and nurturing relationships.',
  },
  'Mrigashira': {
    name: 'Mrigashira',
    favorable: ['Learning', 'Travel', 'Creative pursuits', 'Light-hearted activities'],
    unfavorable: ['Heavy commitments', 'Serious decisions', 'Confrontations'],
    general: 'Good for exploration and seeking knowledge. Keep things light and curious.',
  },
  'Ardra': {
    name: 'Ardra',
    favorable: ['Destruction of negativity', 'Bold changes', 'Research', 'Transformation'],
    unfavorable: ['Important ceremonies', 'Auspicious events', 'New beginnings'],
    general: 'A day for transformation and clearing obstacles. Be prepared for intensity.',
  },
  'Punarvasu': {
    name: 'Punarvasu',
    favorable: ['Returning home', 'Renewal', 'Starting over', 'Reconciliation'],
    unfavorable: ['Final endings', 'Permanent decisions', 'Conflicts'],
    general: 'Perfect for second chances and renewal. Focus on restoration and healing.',
  },
  'Pushya': {
    name: 'Pushya',
    favorable: ['Spiritual practices', 'Religious ceremonies', 'Charity', 'Learning'],
    unfavorable: ['Selfish acts', 'Materialism', 'Harsh behavior'],
    general: 'One of the most auspicious nakshatras. Ideal for devotion and giving.',
  },
  'Ashlesha': {
    name: 'Ashlesha',
    favorable: ['Secret work', 'Research', 'Occult studies', 'Strategic planning'],
    unfavorable: ['Open declarations', 'Trust-based dealings', 'Major purchases'],
    general: 'A mysterious day. Good for depth work but be cautious in dealings.',
  },
  'Magha': {
    name: 'Magha',
    favorable: ['Honoring ancestors', 'Royal functions', 'Authority work', 'Ceremonies'],
    unfavorable: ['Disrespect to elders', 'Breaking traditions', 'Casual approach'],
    general: 'Honor tradition and ancestors. A day for respect, dignity, and ceremony.',
  },
  'Purva Phalguni': {
    name: 'Purva Phalguni',
    favorable: ['Romance', 'Entertainment', 'Rest', 'Creativity', 'Marriage'],
    unfavorable: ['Hard work', 'Discipline', 'Serious undertakings'],
    general: 'A joyful day for pleasure, rest, and romantic connections.',
  },
  'Uttara Phalguni': {
    name: 'Uttara Phalguni',
    favorable: ['Friendship', 'Partnerships', 'Contracts', 'Agreements'],
    unfavorable: ['Solo work', 'Isolation', 'Breaking bonds'],
    general: 'Perfect for partnerships and cooperative ventures. Strengthen relationships.',
  },
  'Hasta': {
    name: 'Hasta',
    favorable: ['Handicrafts', 'Skills', 'Detailed work', 'Healing', 'Medicine'],
    unfavorable: ['Carelessness', 'Rushed work', 'Deception'],
    general: 'A day for skillful work and precision. Good for healing and craftsmanship.',
  },
  'Chitra': {
    name: 'Chitra',
    favorable: ['Beauty', 'Architecture', 'Design', 'Wearing jewelry', 'Creativity'],
    unfavorable: ['Ugliness', 'Destruction', 'Harsh criticism'],
    general: 'Focus on beauty and artistic expression. A day to create and appreciate art.',
  },
  'Swati': {
    name: 'Swati',
    favorable: ['Independence', 'Travel', 'Business', 'Trade', 'Flexibility'],
    unfavorable: ['Restrictions', 'Rigid thinking', 'Dependency'],
    general: 'A day for freedom and independent action. Good for business and travel.',
  },
  'Vishakha': {
    name: 'Vishakha',
    favorable: ['Goal achievement', 'Determination', 'Spiritual growth', 'Celebrations'],
    unfavorable: ['Giving up', 'Laziness', 'Scattered energy'],
    general: 'Channel focused determination toward your goals. Stay committed.',
  },
  'Anuradha': {
    name: 'Anuradha',
    favorable: ['Devotion', 'Friendship', 'Group activities', 'Travel abroad'],
    unfavorable: ['Betrayal', 'Disloyalty', 'Selfish actions'],
    general: 'A day for devotion and loyalty. Strengthen friendships and group bonds.',
  },
  'Jyeshtha': {
    name: 'Jyeshtha',
    favorable: ['Protection', 'Authority', 'Taking charge', 'Occult studies'],
    unfavorable: ['Surrender', 'Weakness', 'Inappropriate power use'],
    general: 'Take responsibility and protect others. Use power wisely.',
  },
  'Mula': {
    name: 'Mula',
    favorable: ['Destruction of negativity', 'Radical change', 'Root causes', 'Research'],
    unfavorable: ['Surface solutions', 'Important beginnings', 'Auspicious events'],
    general: 'Dig deep to find root causes. A day for deep transformation.',
  },
  'Purva Ashadha': {
    name: 'Purva Ashadha',
    favorable: ['Invincibility rituals', 'Determination', 'Purification', 'Spiritual victory'],
    unfavorable: ['Defeat', 'Giving up', 'Weakness'],
    general: 'Channel invincible energy. Good for spiritual practices and determination.',
  },
  'Uttara Ashadha': {
    name: 'Uttara Ashadha',
    favorable: ['Victory', 'Leadership', 'Righteousness', 'Long-term success'],
    unfavorable: ['Unethical actions', 'Short-term thinking', 'Defeat'],
    general: 'Focus on righteous victory and long-term success. Lead with integrity.',
  },
  'Shravana': {
    name: 'Shravana',
    favorable: ['Listening', 'Learning', 'Music', 'Education', 'Communication'],
    unfavorable: ['Ignoring advice', 'Poor listening', 'Harsh speech'],
    general: 'A day for listening and learning. Good for education and communication.',
  },
  'Dhanishta': {
    name: 'Dhanishta',
    favorable: ['Music', 'Dance', 'Rhythm', 'Group activities', 'Wealth creation'],
    unfavorable: ['Solo work', 'Discord', 'Lack of harmony'],
    general: 'Find your rhythm and work in harmony. Good for group activities and wealth.',
  },
  'Shatabhisha': {
    name: 'Shatabhisha',
    favorable: ['Healing', 'Medicine', 'Secrets', 'Research', 'Mystical work'],
    unfavorable: ['Openness without care', 'Ignoring health', 'Superficiality'],
    general: 'A day for healing and deep work. Good for medical treatments and research.',
  },
  'Purva Bhadrapada': {
    name: 'Purva Bhadrapada',
    favorable: ['Spiritual intensity', 'Occult work', 'Transformation', 'Inner work'],
    unfavorable: ['Casual approach', 'Superficial actions', 'Comfort seeking'],
    general: 'Embrace intensity for transformation. Good for deep spiritual work.',
  },
  'Uttara Bhadrapada': {
    name: 'Uttara Bhadrapada',
    favorable: ['Wisdom', 'Deep meditation', 'Charity', 'Spiritual depth'],
    unfavorable: ['Superficiality', 'Materialism', 'Selfishness'],
    general: 'Seek wisdom and depth. A day for deep meditation and giving.',
  },
  'Revati': {
    name: 'Revati',
    favorable: ['Completion', 'Journeys end', 'Safe passage', 'Nurturing', 'Compassion'],
    unfavorable: ['New beginnings', 'Harsh actions', 'Selfishness'],
    general: 'A day for completion and compassion. Finish what you started with care.',
  },
  'Unknown': {
    name: 'Unknown',
    favorable: [],
    unfavorable: [],
    general: 'Nakshatra information not available for this time.',
  },
};

/**
 * Get guidance for a specific nakshatra
 * @param nakshatraName Name of the nakshatra
 * @returns Guidance for the nakshatra
 */
export const getNakshatraGuidance = (nakshatraName: string): NakshatraGuidance => {
  return NAKSHATRA_GUIDANCE[nakshatraName] || NAKSHATRA_GUIDANCE['Unknown'];
};
