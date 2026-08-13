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

---

## Promoted to CFAI Gold Standards
The general lessons (2.5.4 unused background modes, fork-artifact sweep, timezone-safe time
rendering, no "coming soon" content) were added to the shared library — see
`cicd/app-review-rejection-playbook.md`, `cicd/apple-app-store-submission-track.md`, and the
`compliance/ios-store-pre-submission-checklist.md` gate.
