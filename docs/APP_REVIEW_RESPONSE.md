# App Review Response — Shloka Sadhana 1.0 (Guideline 2.5.4)

Prepared 2026-08-08. Use this to (a) reply to Apple in the Resolution Center and
(b) keep the rejection, the fix, and the resubmission linked in the repo.

## The rejection

Submission ID `8e576a09-a8b7-463b-a69c-2e1d623fbce4` · Reviewed 2026-07-16 on iPad Air 11-inch (M3) · Build 1.0 (4).

> **Guideline 2.5.4 - Performance - Software Requirements.**
> The app declares support for audio in the `UIBackgroundModes` key in the Info.plist
> but we are unable to locate any features that require persistent audio.
> Background audio is intended for use by apps that provide audible content to the user
> while in the background, such as music player, music creation, or streaming audio apps.
>
> **Next Steps** — If the app does not have a feature that requires persistent audio, it would
> be appropriate to remove the "audio" setting from the `UIBackgroundModes` key.

**Classification:** Rejected (binary) — an Info.plist change requires a new build.

## What we changed (build 1.0 (5))

The app has no persistent-audio feature, so the declaration was removed.
- `app.json` — removed `ios.infoPlist.UIBackgroundModes` (the `"audio"` value) entirely. **[fixes the cited 2.5.4 issue]**
- `src/utils/audio.ts` and its test — deleted (dead code; never imported). `expo-av` dependency removed.

We also, in the same binary, cleared unrelated issues a reviewer could otherwise hit
(App Review re-reviews the whole app, and we did not want a second cycle):
- **Removed a visible time-rendering bug** ("-1:-1 AM") on the Home screen — sunrise/sunset are now computed in local solar time and all time formatters guard against malformed values (`src/utils/muhurat.ts`, shared `formatTo12Hour`). Regression tests added.
- **Removed leftover "Trading Windows" terminology** (fork artifact) from the Home screen; the card is now "Choghadiya — Auspicious Periods" with no trade/market language.
- **Re-themed the Satsang tab** to self-contained devotional content (no "coming soon" / unbuilt-feature language); removed a "cloud sync coming soon" note from Settings.
- Removed an orphan `NSPhotoLibraryUsageDescription` (the app has no photo-library feature).

## Reply to paste into the Resolution Center

> Thank you for the review.
>
> Shloka Sadhana does not have a feature that requires persistent audio. We have removed
> the "audio" value from the `UIBackgroundModes` key in the Info.plist, and this change is
> included in the attached build (1.0, build 5). We also removed the associated unused audio
> code so the app no longer references background audio in any form.
>
> Please let us know if any further detail would help.

(Reply only **after** build 5 is attached to the version — a reply left against build 4
re-triggers the same rejection.)

## Resubmit checklist
- [x] `UIBackgroundModes` removed from `app.json`
- [x] New binary built and uploaded (build 5)
- [ ] Build 5 attached to version 1.0 (replacing build 4)
- [ ] Screenshots re-captured (Home + Satsang changed) and re-uploaded
- [ ] Reply posted in Resolution Center
- [ ] Resubmitted for review
