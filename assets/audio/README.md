# Audio Assets — Shloka Sadhana

Place bundled mantra audio files here for offline playback (zero network dependency).

## Naming convention
`{shloka-id}.mp3`  — e.g. `gayatri-mantra.mp3`

## How to wire to a shloka
In `src/data/shlokas_content.json`, set the `audioUrl` field:
```json
"audioUrl": "../../assets/audio/gayatri-mantra.mp3"
```
Then in `src/utils/audio.ts` / `ShlokaDetailScreen.tsx`, use `require()` instead of `{ uri: url }` for local files.

## Current status
- `gayatri-mantra.mp3` — **not yet bundled** (audioUrl points to archive.org placeholder)
  - Replace with a local file for production to achieve zero-network audio.

## Recommended sources for public-domain Sanskrit audio
- Internet Archive (archive.org) — search "Gayatri Mantra"
- Wikimedia Commons — Sanskrit pronunciation recordings
- License: Verify CC0 / Public Domain before bundling
