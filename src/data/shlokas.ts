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
