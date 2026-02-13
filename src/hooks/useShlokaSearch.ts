/**
 * useShlokaSearch Hook
 * Shloka Sadhana - P0 #24 (Days 39-41)
 *
 * Fuzzy search hook for shloka library
 * Uses Fuse.js for typo-tolerant matching
 */

import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { getAllShlokas } from '@/data/shlokas';
import { Shloka } from '@/types';

/**
 * Fuzzy search configuration
 */
const SEARCH_OPTIONS: Fuse.IFuseOptions<Shloka> = {
  // Fields to search in (ordered by importance)
  keys: [
    { name: 'name', weight: 2 },           // Name is most important
    { name: 'deity', weight: 1.5 },        // Deity is very important
    { name: 'description', weight: 1 },    // Description is important
    { name: 'benefits', weight: 0.8 },     // Benefits less important
    { name: 'shortName', weight: 1.2 },    // Short name fairly important
  ],

  // Fuzzy matching threshold (0 = exact match, 1 = match anything)
  // 0.3 = good balance between typo tolerance and relevance
  threshold: 0.3,

  // Search in nested objects
  includeScore: true,

  // Minimum match length
  minMatchCharLength: 2,

  // Use extended search (supports exact match, prefix, suffix)
  useExtendedSearch: false,
};

/**
 * Search results with metadata
 */
export interface SearchResult {
  item: Shloka;
  score: number;      // Relevance score (0 = perfect match, 1 = worst match)
  matches: string[];  // Which fields matched
}

/**
 * Hook for searching shlokas with fuzzy matching
 *
 * @example
 * ```tsx
 * const { search, isSearching } = useShlokaSearch();
 *
 * const results = search('gayatri');  // Matches "Gayatri Mantra"
 * const results = search('vishnu');   // Matches all Vishnu-related shlokas
 * const results = search('gaytri');   // Typo-tolerant: matches "Gayatri"
 * ```
 */
export const useShlokaSearch = () => {
  // Get all shlokas once
  const allShlokas = useMemo(() => getAllShlokas(), []);

  // Create Fuse instance once (expensive operation)
  const fuse = useMemo(
    () => new Fuse(allShlokas, SEARCH_OPTIONS),
    [allShlokas]
  );

  /**
   * Search shlokas by query
   * Returns all shlokas if query is empty
   *
   * @param query - Search query (case-insensitive)
   * @returns Array of matching shlokas
   */
  const search = (query: string): Shloka[] => {
    // Empty query = return all shlokas
    if (!query || query.trim().length === 0) {
      return allShlokas;
    }

    // Perform fuzzy search
    const results = fuse.search(query.trim());

    // Extract shlokas from results (Fuse wraps them)
    return results.map((result) => result.item);
  };

  /**
   * Search with metadata (scores, matches)
   * Useful for debugging or showing match quality
   */
  const searchWithMetadata = (query: string): SearchResult[] => {
    if (!query || query.trim().length === 0) {
      // Return all shlokas with perfect score
      return allShlokas.map((item) => ({
        item,
        score: 0,
        matches: [],
      }));
    }

    const results = fuse.search(query.trim());

    return results.map((result) => ({
      item: result.item,
      score: result.score || 0,
      matches: result.matches?.map((m) => m.key || '') || [],
    }));
  };

  /**
   * Get search suggestions (auto-complete)
   * Returns top 5 shloka names matching query
   */
  const getSuggestions = (query: string, limit: number = 5): string[] => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const results = fuse.search(query.trim());
    return results.slice(0, limit).map((result) => result.item.name);
  };

  return {
    search,
    searchWithMetadata,
    getSuggestions,
    totalCount: allShlokas.length,
  };
};
