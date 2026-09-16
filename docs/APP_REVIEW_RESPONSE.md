# App Review Response — Shloka Sadhana 1.0

- **Round 2 (current):** Guideline 2.1 — Information Needed, build 1.0 (5). See below.
- **Round 1 (resolved in build 5):** Guideline 2.5.4. See further down.

---

# Round 2 — Guideline 2.1 Information Needed (build 1.0 (5))

Prepared 2026-09-15. Submission `0d8f0fda-be2e-4aa1-8347-95dcab54f092` · submitted 2026-08-12 ·
Apple message 2026-08-14 · state `UNRESOLVED_ISSUES`.

## The rejection

> **Guideline 2.1 - Information Needed - New App Submission.** We need additional information to
> continue the review of this new app. [...] Reply in App Store Connect with all of the following:
> 1. A screen recording captured on a physical device, running the latest operating system [...]
>    beginning with launching the app [...] including account flows, paid content, UGC, and any
>    prompts requesting access to sensitive data or device capabilities (e.g. location).
> 2. A list of the device models and operating systems the app was tested on.
> 3. A description of the app's functions and target audience, the problem it solves and its value.
> 4. Instructions for setting up and accessing the main features, incl. credentials or sample files.
> 5. External services, tools, or platforms used to deliver core functionality.
> 6. Regional differences in features or content, or confirmation it is consistent everywhere.
> 7. For regulated industries or protected third-party material, documentation of authorization.
>
> Include this information in the Notes field of the App Review Information section for future submissions.

**Classification:** Information Needed. Answering 1–6 needed no code, but checking item 7 against the binary
found copyrighted translations and inaccurate calendar data. Those are fixed in **build 7** (build 6 fixed the content; build 7 fixed the location prompt found while verifying build 6's recording). The reply is sent against build 7.

## Facts verified against the binary (build 5, unchanged in build 6)

| Question | Verified fact | Evidence |
|---|---|---|
| Accounts | None. No registration, login, or account deletion. | no auth code or deps |
| Paid content | None. No IAP, subscriptions, or ads. | no StoreKit/IAP deps |
| UGC | None. | — |
| Permission prompts | **Notifications**: onboarding "Enable Reminders" (or Settings). **Location (When In Use)**: first time the Home screen muhurat cards load. Denial falls back to Delhi, India. | `src/screens/OnboardingScreen.tsx:91`, `src/utils/location.ts:45` |
| Network | None at runtime. Remote content loader is disabled (`REMOTE_CONTENT_URL = undefined`). All content is bundled. | `src/data/shlokas.ts:15` |
| External links | Shloka detail "Learn on YouTube" opens a YouTube **search** in the browser/YouTube app. It's optional and not core. | `src/screens/ShlokaDetailScreen.tsx:71` |
| Regional | Same features and content everywhere. Only sunrise/muhurat times differ, computed on-device from location. | `src/utils/muhurat.ts` |
| Content | 20 shlokas/mantras (Sanskrit, transliteration, English/Hindi meaning), 100 wisdom quotes, 139 festivals, Ekadashi 2026 calendar. | `src/data/*.json` |

### Fixed in build 6 (same review round, found while checking item 7 against the binary)

| Issue | Fix | Guard |
|---|---|---|
| **Copyrighted translations.** Most Bhagavad Gita quotes followed *Bhagavad-gītā As It Is* (© BBT) closely, some word for word (2.22, 9.26, 5.18, 18.66). Ashtavakra 1.3 was Byrom's copyrighted rendering and Mandukya 1 was Prabhavananda/Manchester's. | All 64 Gita quotes plus 12 other quotes re-rendered in original English from the Sanskrit (`src/data/wisdom_quotes.json`). | `src/data/__tests__/contentProvenance.test.ts` |
| **Unverifiable About claim.** "We work with Sanskrit scholars and spiritual teachers" | Replaced with an accurate statement: traditional sources; the English renderings and explanations are the app's own. | `AboutScreen.test.tsx` |
| **Festival dates wrong.** 120 of 139 dates ignored the 2026 Adhik Maas, e.g. Diwali 2026 shown as 30 Oct (actual 8 Nov) and Janmashtami 22 Aug (actual 4 Sep). One duplicate entry. | Dates recomputed from sunrise/pradosh/midnight tithi rules with an ephemeris, validated against Drik Panchang anchors. Duplicate removed. | `src/data/__tests__/festivalDates.test.ts` |
| **Ekadashi calendar ended 2026-12-20.** Kamada 2026 was a day early. | 2027 cycle added (25 dates, computed; method reproduces the published 2026 list). Kamada 2026 moved to 03-29. Tab renamed "All Dates". | `ekadashiCalendar.test.ts` |
| **Location prompt never appeared (found by checking the build-6 recording frame by frame).** Two Home cards called `getUserLocation()` at the same moment, while iOS was still dismissing the onboarding notification alert; iOS drops a permission request made then, the error was swallowed, and the app silently used Delhi — wrong muhurat times outside India, and nothing for a reviewer to see despite the purpose string. | One shared in-flight request; check existing status first; retry the prompt up to 3× while it stays undetermined; an explicit denial is final (`src/utils/location.ts`). **Build 7.** | `location.test.ts` |
| **Vague location purpose strings.** The binary also carried auto-added `NSLocationAlwaysAndWhenInUseUsageDescription` / `NSLocationAlwaysUsageDescription` reading "Allow ShlokaSadhana to access your location" — generic text for access the app never uses (Guideline 5.1.1). | `expo-location` plugin configured so only `NSLocationWhenInUseUsageDescription` ships, with a specific string naming the use and stating the location never leaves the device. **Build 7.** | verified in the built IPA |
| **Home Paanchang card inaccurate.** Mean-moon approximation; Ekadashi names shifted and Shukla/Krishna swapped; lunar month derived from the calendar month; Krishna tithi 15 labelled "Purnima". | Tithi, nakshatra and lunar month (incl. Adhik) computed at New Delhi sunrise with `astronomy-engine` (pure JS). Ekadashi flag and name come from the same data as the Ekadashi banner. | `paanchang.test.ts` |

## Screen recording script (physical iPhone, latest iOS, TestFlight build)

Delete the app first so onboarding and both permission prompts appear. Record in portrait with
Screen Recording from Control Center. Aim for 2–4 minutes.

1. Start recording on the Home Screen, then **tap the Shloka Sadhana icon** (launch must be visible).
2. Onboarding: *Begin* → *Continue* → **Enable Reminders** → show the iOS notification prompt → *Allow*.
3. Home: pause on the location prompt → *Allow While Using App*. Show the muhurat times and
   Choghadiya card updating, then Daily Quest and Your Journey.
4. **Practice** tab: pick a shloka, set sankalp, start the timer, tap the mala counter a few times, finish the session.
5. **Library** tab: open a shloka → scroll Sanskrit / transliteration / meaning.
6. **Satsang** tab: scroll the content.
7. Home → **Festivals** → open one. Open the **Ekadashi calendar** → open one.
8. Wisdom: open a quote.
9. **Settings**: show reminder time, theme, location setting, and About / Privacy Policy / Terms.
10. Home → **View Practice History** to show the session just completed. Stop recording.

Upload the video as an attachment to your Resolution Center reply.

## Reply to paste into the Resolution Center (and the App Review Notes field)

> Thank you for reviewing Shloka Sadhana. Here is the requested information.
>
> **1. Screen recording** is attached. It was captured on a physical device running build 1.0 (7) and starts at app
> launch. It shows onboarding, the notification and location permission prompts, and each core
> feature. The app has no account registration, login, or account deletion, no purchases or
> subscriptions, and no user-generated content, so none of those flows exist.
>
> **2. Devices tested:** iPhone 15 Pro running iOS 26.6 (physical device).
>
> **3. Functions and audience.** Shloka Sadhana is a free, fully offline daily practice companion
> for Hindu devotional practice. It is for people who want to build a consistent habit of chanting
> shlokas and mantras but lack structure or reliable reference material. It provides:
> - a library of 20 traditional shlokas and mantras with Sanskrit text, transliteration, and meaning;
> - a guided practice timer with a 108-bead mala counter and intention (sankalp) setting;
> - a Hindu festival and Ekadashi calendar with observance guidance;
> - daily auspicious times (sunrise, muhurat, Choghadiya periods) calculated for the user's location;
> - wisdom quotes from scripture, practice streaks, history, and optional daily reminders.
>
> **4. Setup and access.** No login, credentials, or sample files are required. Open the app, follow
> the three-page onboarding (reminders are optional), and every feature is available from the four
> tabs: Home, Practice, Library, and Satsang. Settings is reachable from the Home screen.
>
> **5. External services.** None. The app has no backend, analytics, advertising, authentication,
> payment, or AI services. All content is bundled in the app, and all data (practice history,
> settings) stays on the device. Location is used only on-device to calculate sunrise and muhurat
> times. It is never transmitted. An optional "Learn on YouTube" button on a shloka opens a YouTube
> search in the user's browser for pronunciation help. It is not required for any feature.
>
> **6. Regional differences.** The app works the same in all regions. The only variation is that
> sunrise and auspicious-time calculations use the device's location and time zone. If location
> access is declined, the app uses a default location.
>
> **7. Regulated industry / third-party material.** The app does not operate in a regulated
> industry. Its content consists of traditional devotional texts in the public domain: Hindu scriptures
> (Vedas, Upanishads, Bhagavad Gita, Puranas and devotional hymns), sayings of historical saints, and a
> few verses from other Indian traditions. The Sanskrit and Hindi texts appear in their traditional form.
> The English renderings and explanations were written by the developer. No licensed or copyrighted
> third-party material is included. Festival and Ekadashi dates are calculated astronomically.
>
> Please let us know if any further detail would help.

## Resubmit checklist (round 2)
- [x] Item-7 content fix: original translations, About copy (tests guard both)
- [x] Festival / Ekadashi / Paanchang accuracy fixes
- [x] Build 6 built from commit 01b338c (content/calendar fixes)
- [ ] Build 7 built from commit 4c32bc0 (location prompt + purpose string), uploaded, attached to version 1.0
- [x] App Review Information → Notes filled (items 3–7 + permissions; device list still to add)
- [ ] Record the screen recording on a physical device running build 7 (TestFlight) — must show both permission prompts
- [x] Devices tested (item 2): iPhone 15 Pro / iOS 26.6 — in the reply and appended to the ASC Notes field
- [ ] Reply in Resolution Center with the video attached, then Resubmit to App Review
- [ ] Re-capture screenshots if Home/Festivals now look different from the uploaded ones

---

# Round 1 — Guideline 2.5.4 (resolved in build 5)

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
