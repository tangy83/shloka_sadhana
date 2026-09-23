# iOS App Store Publishing — Learnings & Gotchas (Shloka Sadhana)

**Project:** Shloka Sadhana (Expo SDK 54 / React Native 0.81.5, TypeScript)
**Context:** First submission. Build 4 was rejected (Guideline 2.5.4); build 5 remediated it.

These are the project-specific lessons. General patterns worth reusing across apps are
promoted to the CFAI Gold Standards library (see the end).

---

## 1. Guideline 2.5.4 — don't declare background modes you don't use

**What happened.** `app.json` declared `ios.infoPlist.UIBackgroundModes: ["audio"]`, but the
app plays no audio at all — the only `expo-av` consumer (`src/utils/audio.ts`) was never imported,
there are no audio assets, and pronunciation is delivered via external YouTube links. App Review
rejected it: *"unable to locate any features that require persistent audio."*

**Fix.** Removed `UIBackgroundModes` from `app.json`, deleted the dead `audio.ts` + test, and
removed the `expo-av` dependency. Requires a new binary (Info.plist is compiled in).

**Rule.** Only declare a `UIBackgroundModes` value if a shipping feature genuinely needs it.
Audit `app.json` `infoPlist` against actual, reachable features before every submission.

## 2. A rejection re-reviews the WHOLE app — fix all contradictions in one binary

Apple cited only 2.5.4, but the app had other reviewer-visible problems (below). Because a
resubmission is re-reviewed from scratch and each cycle cost ~5 days, we fixed everything in
build 5 rather than risk a second rejection on an issue we already knew about.

## 3. Fork artifacts are a rejection risk — sweep before first submission

This app was rebranded from a trading app. Leftovers that survived into the binary:
- A Home card titled **"Trading Windows Today"** with "good times to trade / times to avoid for
  new trades" — financial guidance in a devotional app (Guideline 2.3.1 / 4.0). Renamed to
  "Choghadiya — Auspicious Periods"; all trade/market language purged (`grep -riE "trading|trade|market|stock|portfolio" src/` is now clean of user-facing hits).
- Symbols `getTradingWindows` / `TradingWindows` / `TradingWindowsCard` renamed to
  `getAuspiciousPeriods` / `AuspiciousPeriods` / `AuspiciousPeriodsCard`.

**Rule.** When rebranding/forking, grep the whole tree for the old domain's vocabulary — in UI
strings AND identifiers — before shipping.

## 4. Time/date math must be timezone-safe and guard malformed output

The Home screen rendered a broken clock — **"9:23 PM – -1:-1 AM"**. Root cause: sunrise/sunset
were computed in UTC (`solarNoon = 12 - longitude/15`), which for the summer sun produced a
slightly-negative hour, and `formatTime` / `formatTo12Hour` did not guard negatives → the literal
string `"-1:-1"`. A visible broken value on the first screen is textbook Guideline 2.1.

**Fix.** Express sunrise/sunset in local solar time (`12 ∓ hourAngle/15`, always in [0,24)),
normalise every formatter into a valid 24h clock, and share one guarded `formatTo12Hour`.
Regression tests use the exact rejection date/location (`src/utils/__tests__/muhurat.test.ts`).

**Rule.** Never `padStart` a possibly-negative number and call it a time. Clamp/normalise, and
add a regression test that reproduces the bad input.

## 5. "Coming soon" tabs and notes fail Guideline 2.1

The Satsang tab advertised unbuilt features ("group chanting… coming in a future update") and
Settings had a "cloud sync coming in a future update" note. Advertising features that don't
exist is placeholder content. Re-themed Satsang to self-contained devotional content; removed the
Settings note. **Rule.** Ship nothing that promises a feature the binary doesn't contain.

## 6. Orphan usage-description strings

`NSPhotoLibraryUsageDescription` promised screenshot-saving that doesn't exist. Removed it (after
confirming no bundled SDK references the Photos framework — the opposite mistake causes a *missing*-
string rejection, 90683). **Rule.** Every `NS*UsageDescription` must map to a real, reachable API use.

## 7. Mechanics that worked (reuse these)

- **Headless build + submit:** with `eas.json` `submit.production.ios` carrying `ascAppId` + the
  ASC API key (`.p8`), `eas build --platform ios --profile production --non-interactive --auto-submit`
  builds and uploads with no interactive Apple login / 2FA. (First build must create credentials
  interactively once; after that it's fully headless.)
- **Whole listing via the ASC API** (JWT ES256 from the `.p8`): metadata, screenshots
  (reserve→upload→commit), build attach, pricing (free price point), review contact, and the
  submission itself (`reviewSubmissions` → add item → `submitted:true`). App Privacy nutrition
  label and Age Rating are **not** writable via the v1 API — do those in the ASC UI.
- **`buildNumber`** auto-increments (`eas.json` `appVersionSource: remote` + `autoIncrement`);
  each new build must exceed every prior value across all tracks, including rejected builds.

## 8. Guideline 2.1 "Information Needed — New App Submission" (build 5, 2026-08-14)

**What happened.** After the 2.5.4 fix, Apple sent its standard new-app questionnaire. It asks for a
screen recording on a physical device, devices tested, a description, setup steps, external services,
regional differences, and authorization for protected third-party material.

**Lesson: check each answer against the binary.** Item 7 couldn't honestly be answered yes. Most
Bhagavad Gita quotes followed a copyrighted English translation (*As It Is*, © BBT), a couple word for
word. Checking the same content also showed 120 of 139 festival dates were wrong (2026 Adhik Maas
ignored) and the Home Paanchang card used a mean-moon approximation. All were fixed in build 6
before replying.

**Rules.**
- Public-domain scripture ≠ public-domain translation. Render the English yourself; a test blocks
  the telltale phrases of known translations (`contentProvenance.test.ts`).
- Calendar data is code. Generate it from an ephemeris with tithi rules, validate against published
  anchors, and test anchor dates. Never hand-type or LLM-generate festival dates.
- Fill in App Review Information → **Notes** on the first submission (what the app does, no login,
  permissions, external services). It pre-empts this whole round.
- Test on a physical device before submitting; Apple asks for the list.

## 9. Verify the review video frame by frame — it catches real bugs

The build-6 recording looked fine to the eye, but sampling it with ffmpeg
(`fps=2,signalstats` to find the dimmed frames a system alert causes, then extracting those
frames) showed the **location prompt never appeared**. Cause: two Home cards call
`getUserLocation()` on mount, while iOS is still dismissing the onboarding notification alert.
iOS silently drops a permission request made at that moment, and the `catch` fell back to Delhi.
Users outside India would have seen wrong muhurat times and never been asked.

**Rules.**
- Never let a permission request live inside a `catch`-and-fallback with no user-visible result.
  Check the status first, share one in-flight request between callers, and retry while the status
  is still `undetermined`.
- Don't fire a permission request during a screen transition or while another system alert is up.
- Audit the *built IPA's* Info.plist (`unzip` it, `plutil -p`), not just `app.json`: Expo's default
  plugins had added two "Always" location keys with generic text — a 5.1.1 risk we never wrote.
  `npx expo config --type introspect` is NOT a substitute; it applies legacy plugins for packages
  that aren't installed and reports keys (audio background mode, photo library) the binary lacks.

## 10. Build numbers are burned forever — including by builds you forgot

**What happened.** `eas submit` for build 8 failed twice with only *"Something went wrong when
submitting your app to Apple App Store Connect"* — the CLI printed no reason. The real error was
only reachable through the EAS GraphQL API (`submissions.byId(...).jobRun.errors`):

> `EAS_UPLOAD_TO_ASC_VERSION_DUPLICATE` — Build number 8 for app version 1.0.0 has already been used.

App Store Connect already held a build 8 uploaded **2026-05-11**, long expired. Numbering had
later restarted at 3 and climbed 3→7 underneath it. EAS's remote counter handed out 8; Apple
refuses it, because build numbers are unique forever within a version train, expired or not.

**Fix.** Rebuild as 9 (`autoIncrement: true` does it). The number is compiled into the binary, so
an existing artifact cannot be relabelled — it costs a full rebuild.

**Rules.**
- Before trusting `autoIncrement`, list what ASC actually holds:
  `GET /v1/builds?filter[app]=<id>&sort=-uploadedDate` — expired builds still occupy their number.
- When `eas submit` fails without a message, query the jobRun errors; the web UI and CLI both hide it.

## 11. Deleting the app does NOT reset iOS location permission

**What happened.** Five takes of the App Review demo video, and the location prompt never appeared
once. Delete + reinstall was assumed to reset permissions; it resets app data (AsyncStorage, so
onboarding reappears) but iOS **retains the location authorisation for the same bundle ID**.
`location.ts` then correctly sees `granted` and skips the prompt — nothing to record.
"Reset Location & Privacy" also failed, because the reinstall that followed it restored the grant.

**Rule.** To make the prompt fire again, set **Settings → Privacy & Security → Location Services →
<app> → "Ask Next Time Or When I Share"**, then force-quit. Don't delete the app — deletion is
irrelevant to the grant and costs a reinstall.

**Corollary for review videos.** A reviewer's device is genuinely fresh, so they *will* see the
prompt. If a poisoned test device won't produce it, say so in the reply rather than burning takes.

## 12. The recording script is a spec — verify each step is buildable first

Three steps of the round-2 script could not be performed at all, and each was found only by
attempting them on camera: the Complete button was dead below 60s, festival cards had an empty
`onPress` with no detail screen, and `SankalpModal` is never rendered anywhere. The reply text also
claimed a "sankalp setting" the UI does not offer — an inaccurate statement to App Review.

**Rule.** Before recording, grep each script step to the code that implements it. A step that names
a screen with no route, or a control with an empty handler, is a bug the reviewer will also hit.


---

## Promoted to CFAI Gold Standards
The general lessons (2.5.4 unused background modes, fork-artifact sweep, timezone-safe time
rendering, no "coming soon" content) were added to the shared library — see
`cicd/app-review-rejection-playbook.md`, `cicd/apple-app-store-submission-track.md`, and the
`compliance/ios-store-pre-submission-checklist.md` gate.
