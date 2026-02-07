/**
 * Shloka Data
 * Shloka Sadhana - Sacred Texts Database
 *
 * Collection of Hindu prayers, mantras, and shlokas
 * Supports configurable content via remote JSON
 */

import { Shloka } from '@/types';
import { loadShlokaContent } from '@/utils/contentLoader';
import shlokas_content from './shlokas_content.json';

// Configuration: Set remote URL here to enable content updates without code changes
// Leave undefined to use local content only
const REMOTE_CONTENT_URL: string | undefined = undefined;
// Example: 'https://your-cdn.com/shlokas.json'

// Runtime cache for loaded content
let loadedContent: Shloka[] | null = null;

/**
 * All shlokas available in the app
 * V3 Feature #8: Loaded from JSON (20 mantras/stotras/chalisas)
 */
export const shlokas: Shloka[] = shlokas_content as Shloka[];

/**
 * Legacy hardcoded shlokas (kept for reference, not used)
 * Commented out to avoid unused variable warning
 */
/*
const legacyShlokas: Shloka[] = [
  // 1. Gayatri Mantra
  {
    id: 'gayatri-mantra-legacy',
    name: 'Gayatri Mantra',
    shortName: 'Gayatri',
    deity: 'Goddess Gayatri (Savitri)',
    description:
      'The most sacred mantra in Hinduism, dedicated to Goddess Gayatri. It is a prayer for enlightenment and liberation from ignorance.',
    benefits:
      'Enhances wisdom, removes ignorance, purifies mind and body, increases concentration, brings spiritual awakening.',
    duration: '5-10 minutes',
    bestTime: 'Early morning (Brahma Muhurta) or sunset',
    youtubeUrl: 'https://www.youtube.com/watch?v=7K_-k1eXGmQ',
    sections: [
      {
        id: 1,
        sanskrit: 'ॐ भूर्भुवः स्वः',
        transliteration: 'Om Bhūr Bhuvaḥ Svaḥ',
        meaning: 'Om, the three realms - Earth, Atmosphere, and Heaven',
      },
      {
        id: 2,
        sanskrit: 'तत्सवितुर्वरेण्यं',
        transliteration: 'Tat Savitur Vareṇyaṃ',
        meaning: 'That divine Sun, most adorable',
      },
      {
        id: 3,
        sanskrit: 'भर्गो देवस्य धीमहि',
        transliteration: 'Bhargo Devasya Dhīmahi',
        meaning: 'The effulgence of that divine light, we meditate upon',
      },
      {
        id: 4,
        sanskrit: 'धियो यो नः प्रचोदयात्',
        transliteration: 'Dhiyo Yo Naḥ Prachodayāt',
        meaning: 'May that light illuminate our intellect',
      },
    ],
  },

  // 2. Maha Mrityunjaya Mantra
  {
    id: 'maha-mrityunjaya',
    name: 'Maha Mrityunjaya Mantra',
    shortName: 'Mrityunjaya',
    deity: 'Lord Shiva',
    description:
      'The "Great Death-Conquering Mantra" is a powerful prayer to Lord Shiva for protection, health, and liberation from the cycle of death and rebirth.',
    benefits:
      'Removes fear of death, heals diseases, provides protection, increases longevity, removes negative karma.',
    duration: '10-15 minutes',
    bestTime: 'Morning or evening',
    youtubeUrl: 'https://www.youtube.com/watch?v=6yVkhGPO-3o',
    sections: [
      {
        id: 1,
        sanskrit: 'ॐ त्र्यम्बकं यजामहे',
        transliteration: 'Om Tryambakaṃ Yajāmahe',
        meaning: 'Om, we worship the Three-Eyed One (Lord Shiva)',
      },
      {
        id: 2,
        sanskrit: 'सुगन्धिं पुष्टिवर्धनम्',
        transliteration: 'Sugandhiṃ Puṣṭi-Vardhanam',
        meaning: 'Who is fragrant and nourishes all beings',
      },
      {
        id: 3,
        sanskrit: 'उर्वारुकमिव बन्धनान्',
        transliteration: 'Urvārukam-Iva Bandhanān',
        meaning: 'Like a cucumber from its vine, may we be freed from bondage',
      },
      {
        id: 4,
        sanskrit: 'मृत्योर्मुक्षीय मामृतात्',
        transliteration: 'Mṛtyor-Mukṣīya Māmṛtāt',
        meaning: 'From death, may I be liberated, not from immortality',
      },
    ],
  },

  // 3. Ganesh Mantra
  {
    id: 'ganesh-mantra',
    name: 'Ganesh Mantra',
    shortName: 'Ganesh',
    deity: 'Lord Ganesha',
    description:
      'A powerful mantra to Lord Ganesha, the remover of obstacles. Chanted at the beginning of any new endeavor for success and blessings.',
    benefits:
      'Removes obstacles, brings success, enhances wisdom, provides protection, removes negative energy.',
    duration: '5-10 minutes',
    bestTime: 'Morning or before starting new work',
    youtubeUrl: 'https://www.youtube.com/watch?v=NXCRd5Rmzxo',
    sections: [
      {
        id: 1,
        sanskrit: 'ॐ गं गणपतये नमः',
        transliteration: 'Om Gaṃ Gaṇapataye Namaḥ',
        meaning: 'Om, salutations to Lord Ganesha, the remover of obstacles',
      },
      {
        id: 2,
        sanskrit: 'वक्रतुण्ड महाकाय',
        transliteration: 'Vakratuṇḍa Mahākāya',
        meaning: 'O curved-tusked one, of mighty body',
      },
      {
        id: 3,
        sanskrit: 'सूर्यकोटि समप्रभ',
        transliteration: 'Sūryakoṭi Samaprabha',
        meaning: 'Whose brilliance equals a million suns',
      },
      {
        id: 4,
        sanskrit: 'निर्विघ्नं कुरु मे देव',
        transliteration: 'Nirvighnaṃ Kuru Me Deva',
        meaning: 'O Lord, make my work free from obstacles',
      },
      {
        id: 5,
        sanskrit: 'सर्वकार्येषु सर्वदा',
        transliteration: 'Sarvakāryeṣu Sarvadā',
        meaning: 'In all my endeavors, always',
      },
    ],
  },

  // 4. Durga Mantra
  {
    id: 'durga-mantra',
    name: 'Durga Mantra',
    shortName: 'Durga',
    deity: 'Goddess Durga',
    description:
      'A powerful mantra to invoke Goddess Durga, the supreme warrior goddess who destroys evil and protects devotees.',
    benefits:
      'Provides protection, destroys negative forces, increases courage and strength, removes fear, brings victory.',
    duration: '10-15 minutes',
    bestTime: 'Morning or evening, especially on Tuesdays',
    youtubeUrl: 'https://www.youtube.com/watch?v=lZddx8fuXKI',
    sections: [
      {
        id: 1,
        sanskrit: 'ॐ दुं दुर्गायै नमः',
        transliteration: 'Om Duṃ Durgāyai Namaḥ',
        meaning: 'Om, salutations to Goddess Durga',
      },
      {
        id: 2,
        sanskrit: 'सर्वमङ्गलमाङ्गल्ये',
        transliteration: 'Sarvamaṅgala-Māṅgalye',
        meaning: 'O Goddess who is the auspiciousness of all that is auspicious',
      },
      {
        id: 3,
        sanskrit: 'शिवे सर्वार्थसाधिके',
        transliteration: 'Śive Sarvārtha-Sādhike',
        meaning: 'O consort of Shiva, who fulfills all desires',
      },
      {
        id: 4,
        sanskrit: 'शरण्ये त्र्यम्बके गौरि',
        transliteration: 'Śaraṇye Tryambake Gauri',
        meaning: 'O refuge of all, Three-Eyed One, golden Goddess',
      },
      {
        id: 5,
        sanskrit: 'नारायणि नमोऽस्तु ते',
        transliteration: "Nārāyaṇi Namo'stu Te",
        meaning: 'O Narayani, salutations to You',
      },
    ],
  },

  // 5. Hanuman Chalisa (excerpt)
  {
    id: 'hanuman-chalisa',
    name: 'Hanuman Chalisa',
    shortName: 'Hanuman',
    deity: 'Lord Hanuman',
    description:
      'A 40-verse devotional hymn dedicated to Lord Hanuman. Known for its power to remove obstacles and provide protection.',
    benefits:
      'Removes obstacles, provides protection, increases courage and strength, removes fear, grants devotion.',
    duration: '10-15 minutes',
    bestTime: 'Morning or Tuesday',
    youtubeUrl: 'https://www.youtube.com/watch?v=MlGHdpIcjjo',
    sections: [
      {
        id: 1,
        sanskrit: 'श्रीगुरु चरन सरोज रज',
        transliteration: 'Śrīguru Charana Saroja Raja',
        meaning: "With the dust of Guru's lotus feet, I cleanse the mirror of my mind",
      },
      {
        id: 2,
        sanskrit: 'निज मन मुकुर सुधारि',
        transliteration: 'Nija Mana Mukura Sudhāri',
        meaning: 'And narrate the pure fame of the best of Raghu dynasty',
      },
      {
        id: 3,
        sanskrit: 'बरनऊं रघुबर बिमल जसु',
        transliteration: 'Baranau Raghubara Bimala Jasu',
        meaning: 'Which bestows the four fruits of life (Dharma, Artha, Kama, Moksha)',
      },
      {
        id: 4,
        sanskrit: 'जो दायक फल चारि',
        transliteration: 'Jo Dāyaka Phala Chāri',
        meaning: 'And gives the four fruits of human life',
      },
    ],
  },
];
*/

/**
 * Initialize and load shloka content
 * Call this on app startup to pre-load content
 */
export const initializeContent = async (): Promise<void> => {
  loadedContent = await loadShlokaContent(REMOTE_CONTENT_URL);
};

/**
 * Get all shlokas (synchronous - uses loaded content or fallback to local)
 */
export const getAllShlokas = (): Shloka[] => {
  return loadedContent || shlokas;
};

/**
 * Get all shlokas (async version - loads content if not already loaded)
 */
export const getAllShlokasAsync = async (): Promise<Shloka[]> => {
  if (!loadedContent) {
    await initializeContent();
  }
  return loadedContent || shlokas;
};

/**
 * Get a single shloka by ID
 */
export const getShlokaById = (id: string): Shloka | undefined => {
  return shlokas.find((shloka) => shloka.id === id);
};

/**
 * Get shlokas filtered by deity
 */
export const getShlokasByDeity = (deity: string): Shloka[] => {
  return shlokas.filter((shloka) => shloka.deity === deity);
};
