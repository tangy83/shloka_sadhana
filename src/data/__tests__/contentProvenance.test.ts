/**
 * Content Provenance Tests
 *
 * Guards against shipping copyrighted modern translations (App Review
 * Guideline 2.1 item 7 / 5.2.1). Sanskrit source texts are public domain;
 * English renderings must be original. These phrases are signatures of
 * specific copyrighted translations (e.g. Bhagavad-gita As It Is, © BBT;
 * Byrom's Ashtavakra Gita; Prabhavananda & Manchester's Upanishads).
 */

import wisdomQuotes from '@/data/wisdom_quotes.json';
import shlokasContent from '@/data/shlokas_content.json';

const HALLMARK_PHRASES = [
  /living entit/i,
  /conditioned soul/i,
  /Supreme Personality of Godhead/i,
  /transcendental loving service/i,
  /devotional service/i,
  /false ego/i,
  /proprietor/i,
  /prescribed dut/i,
  /sense gratification/i,
  /bona fide spiritual master/i,
  /modes of material nature/i,
  /dog-eater/i,
  /miscreants/i,
  /I advent Myself/i,
  /three miseries/i,
];

const SIGNATURE_SENTENCES = [
  /As a person puts on new garments, giving up old ones/i,
  /a leaf, a flower, fruit, or water, I will accept it/i,
  /Abandon all varieties of dharma and simply surrender unto Me/i,
  /I envy no one, nor am I partial to anyone/i,
  /the heart of awareness/i,
  /Om is the imperishable word/i,
  /knowledge still more confidential/i,
  /Four kinds of pious people/i,
  /The soul is never born nor does it ever die\. It has not come into being, does not come into being/i,
];

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings);
  return [];
}

describe('content provenance', () => {
  const corpora: [string, unknown][] = [
    ['wisdom_quotes.json', wisdomQuotes],
    ['shlokas_content.json', shlokasContent],
  ];

  describe.each(corpora)('%s', (_name, corpus) => {
    const text = allStrings(corpus).join('\n');

    it.each(HALLMARK_PHRASES.map(p => [p.source, p]))(
      'contains no copyrighted-translation hallmark phrase /%s/',
      (_src, pattern) => {
        expect(text).not.toMatch(pattern as RegExp);
      }
    );

    it.each(SIGNATURE_SENTENCES.map(p => [p.source, p]))(
      'contains no verbatim copyrighted sentence /%s/',
      (_src, pattern) => {
        expect(text).not.toMatch(pattern as RegExp);
      }
    );
  });

  it('keeps every wisdom quote populated after rewrites', () => {
    (wisdomQuotes as { id: string; text: string; source: string }[]).forEach(q => {
      expect(q.text.trim().length).toBeGreaterThan(10);
      expect(q.source.trim().length).toBeGreaterThan(0);
    });
  });
});
