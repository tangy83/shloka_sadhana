# Wisdom Quotes JSON Instructions

## Where to place your JSON file

Once you have your 100 wisdom quotes in JSON format, you need to replace the content in:

```
src/data/wisdom.ts
```

## How to update the file

1. Open `src/data/wisdom.ts`
2. Find the `wisdomQuotes` array (starts around line 25)
3. Replace the entire array with your new quotes
4. Keep the array format as `export const wisdomQuotes: WisdomQuote[] = [...]`

## JSON Format Required

Each quote should follow this structure:

```typescript
{
  id: string;                    // REQUIRED: Unique identifier (e.g., "bhagavad-gita-2-47")
  text: string;                  // REQUIRED: English translation
  text_sanskrit?: string;        // OPTIONAL: Original Sanskrit/Hindi text
  meaning: string;               // REQUIRED: Detailed explanation
  author: string;                // REQUIRED: Who said it (e.g., "Lord Krishna")
  source: string;                // REQUIRED: Scripture reference (e.g., "Bhagavad Gita 2:47")
  source_chapter?: string;       // OPTIONAL: Chapter name (e.g., "Chapter 2: Sankhya Yoga")
  category: string;              // REQUIRED: One of: dharma, karma, devotion, meditation, wisdom, compassion
  tags?: string[];               // OPTIONAL: Array of keywords (e.g., ["duty", "detachment"])
  context?: string;              // OPTIONAL: Background/situation
  practical_application?: string;// OPTIONAL: How to apply in daily life
}
```

## Example Entry

```json
{
  "id": "bhagavad-gita-2-47",
  "text": "You have the right to perform your prescribed duty, but you are not entitled to the fruits of action.",
  "text_sanskrit": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
  "meaning": "This verse teaches Nishkama Karma - performing duty without attachment to results.",
  "author": "Lord Krishna",
  "source": "Bhagavad Gita 2:47",
  "source_chapter": "Chapter 2: Sankhya Yoga",
  "category": "karma",
  "tags": ["duty", "detachment", "karma-yoga"],
  "context": "Krishna instructs Arjuna on selfless action.",
  "practical_application": "Focus on your efforts, not outcomes."
}
```

## Categories Available

- `dharma` - Righteousness, duty, cosmic order
- `karma` - Action, selfless service
- `devotion` - Bhakti, surrender, love for God
- `meditation` - Mind control, yoga, inner peace
- `wisdom` - Knowledge, truth, self-realization
- `compassion` - Love, kindness, non-violence

## Testing

After adding your quotes:
1. Save the file
2. Run `npm start` to restart the app
3. Check the Home screen - you should see a "Daily Wisdom" card
4. The quote will change daily based on the date
5. Click "Show More" to see expanded details

## Notes

- The current file has 10 sample quotes to get you started
- You can add 100 or more quotes
- The daily quote is deterministic (same quote for everyone on the same day)
- All users will see the same quote on the same date
