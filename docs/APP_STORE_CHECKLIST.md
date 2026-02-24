# Shloka Sadhana — Deployment Guide (iOS & Android)

**Step-by-step guide to deploy to App Store and Google Play Store**
Last Updated: 2026-02-23

---

## Current App Status

| Item | Status |
|------|--------|
| Code quality | 0 TypeScript errors, 1097 tests passing |
| app.json config | Complete (bundle ID, permissions, encryption) |
| eas.json | Production profile with autoIncrement |
| ErrorBoundary | Wrapped |
| Privacy Policy (in-app) | Written |
| Terms of Service (in-app) | Written |
| Require cycle | Fixed |
| Native Modal bugs | Fixed |

---

## PHASE 1: Developer Accounts (Do This First — Can Take 24-48h)

### Step 1A: Apple Developer Account

1. Go to https://developer.apple.com/programs/
2. Click "Enroll"
3. Sign in with your Apple ID (or create one)
4. Choose "Individual" enrollment ($99/year)
5. Complete identity verification (may require government ID)
6. Pay the $99 fee
7. Wait for activation (usually 24-48 hours)

**You'll need this before you can build or submit for iOS.**

### Step 1B: Google Play Developer Account

1. Go to https://play.google.com/console/signup
2. Sign in with your Google account
3. Pay the $25 one-time fee
4. Fill in developer profile information
5. Complete identity verification
6. Wait for activation (usually a few hours)

---

## PHASE 2: App Icon & Splash Screen

Your current icons are Expo default placeholders. You need a real branded icon.

### What to Design

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| `assets/icon.png` | 1024x1024 | PNG | Main app icon. No transparency, no rounded corners (iOS rounds them automatically) |
| `assets/adaptive-icon.png` | 1024x1024 | PNG | Android adaptive icon foreground. Can have transparency. Keep main element in center 66% (safe zone) |
| `assets/splash-icon.png` | 1024x1024 | PNG | Splash screen logo shown during app launch |
| `assets/notification-icon.png` | 1024x1024 | PNG | Notification bar icon (Android). Should be simple, single-color silhouette works best |
| `assets/favicon.png` | 48x48 | PNG | Web favicon (low priority) |

### Design Ideas for Sadhana

- Om (ॐ) symbol with a warm saffron/gold gradient
- Mala beads in a circle
- Lotus flower
- Diya (lamp) flame
- Abstract mandala pattern

### Tools to Create Icons

- **Canva** (free): https://www.canva.com — search "app icon" templates
- **Figma** (free): https://www.figma.com — more control, professional
- **Midjourney / DALL-E**: Generate a concept, then refine in Canva/Figma
- **Hire on Fiverr**: Search "app icon design" — $20-50 for professional quality

### How to Replace

Simply replace the files in the `assets/` folder with your new designs, keeping the exact same filenames. Expo automatically generates all required sizes from your 1024x1024 source images.

---

## PHASE 3: Host Privacy Policy & Terms of Service

Both stores **require a public URL** for your privacy policy. The easiest free option is GitHub Pages.

### Option A: GitHub Pages (Free, Recommended)

1. Create a new GitHub repo called `shlokasadhana-legal` (or any name)
2. Create a file `index.html` with your privacy policy and terms
3. Go to repo Settings > Pages > Source: "main" branch
4. Your URL will be: `https://yourusername.github.io/shlokasadhana-legal/`

Here is the HTML content to use (copy into `index.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sadhana - Legal</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
    h1 { color: #E55B00; } h2 { color: #444; margin-top: 30px; } a { color: #E55B00; }
    nav { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
    nav a { margin-right: 20px; text-decoration: none; font-weight: 600; }
    hr { margin: 40px 0; border: none; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <nav>
    <a href="#privacy">Privacy Policy</a>
    <a href="#terms">Terms of Service</a>
  </nav>

  <h1 id="privacy">Privacy Policy</h1>
  <p><em>Last Updated: February 7, 2026</em></p>

  <h2>1. Information We Collect</h2>
  <p>Sadhana stores all data locally on your device. We collect:</p>
  <ul>
    <li>Practice session data (duration, mala count, notes)</li>
    <li>App preferences and settings</li>
    <li>Streak and progress data</li>
  </ul>
  <p><strong>We do NOT collect:</strong> personal information, email addresses, names, location data sent to servers, analytics, or tracking data.</p>

  <h2>2. How We Use Information</h2>
  <p>All data is stored locally on your device using AsyncStorage. It is used solely to power app features like practice tracking, streak counting, and goal progress. No data is transmitted to any server.</p>

  <h2>3. Location Data</h2>
  <p>The app may request location access to calculate auspicious times (muhurat) based on your geographical coordinates. This calculation happens entirely on your device. Your location is never transmitted to any server.</p>

  <h2>4. Data Sharing</h2>
  <p>We do not share, sell, or transfer your data to any third party. There are no ads, no analytics services, and no third-party SDKs that access your data.</p>

  <h2>5. Data Storage & Security</h2>
  <p>All data is stored in your device's local storage. It is protected by your device's built-in security (passcode, Face ID, etc.).</p>

  <h2>6. Your Rights</h2>
  <ul>
    <li>Delete all data: Settings > Clear Data</li>
    <li>Uninstalling the app removes all data</li>
    <li>No account needed — no data exists on any server</li>
  </ul>

  <h2>7. Children's Privacy</h2>
  <p>The app does not knowingly collect information from children under 13. The app is suitable for all ages.</p>

  <h2>8. Changes to This Policy</h2>
  <p>We may update this policy from time to time. Changes will be reflected in the app and on this page.</p>

  <h2>9. Contact Us</h2>
  <p>Email: <a href="mailto:info@contextfirstai.com">info@contextfirstai.com</a><br>
  Website: <a href="https://www.contextfirstai.com/">https://www.contextfirstai.com/</a></p>

  <hr>

  <h1 id="terms">Terms of Service</h1>
  <p><em>Last Updated: February 7, 2026</em></p>

  <h2>1. Acceptance of Terms</h2>
  <p>By using Sadhana ("the App"), you agree to these Terms of Service.</p>

  <h2>2. Description of Service</h2>
  <p>Sadhana is a spiritual practice companion app for mantra recitation, practice tracking, and Hindu calendar information. It is provided for spiritual practice and educational purposes.</p>

  <h2>3. User Responsibilities</h2>
  <ul>
    <li>Use the app respectfully and in accordance with applicable laws</li>
    <li>Do not attempt to reverse-engineer or modify the app</li>
    <li>You are responsible for maintaining your device's security</li>
  </ul>

  <h2>4. Intellectual Property</h2>
  <p>Traditional shlokas, mantras, and scriptures are in the public domain. The app's design, code, and original content are owned by ContextFirst AI.</p>

  <h2>5. Disclaimer</h2>
  <p>The app is provided for spiritual practice and educational purposes only. It is not a substitute for guidance from a qualified spiritual teacher. Content is presented with respect and care but we cannot guarantee complete accuracy of all translations and interpretations.</p>

  <h2>6. Limitation of Liability</h2>
  <p>The app is provided "as is" without warranties of any kind. We are not liable for any damages arising from use of the app.</p>

  <h2>7. Changes to Terms</h2>
  <p>We may update these terms from time to time. Continued use of the app constitutes acceptance of updated terms.</p>

  <h2>8. Contact</h2>
  <p>Email: <a href="mailto:info@contextfirstai.com">info@contextfirstai.com</a><br>
  Website: <a href="https://www.contextfirstai.com/">https://www.contextfirstai.com/</a></p>
</body>
</html>
```

### Option B: Simple Web Hosting

Host the HTML above on any web hosting service (Vercel, Netlify, your own domain). The URL just needs to be publicly accessible.

**Save your hosted URL — you'll enter it during store submission.**

---

## PHASE 4: Take Screenshots

You need screenshots of the app running on various device sizes.

### How to Take Screenshots

1. Open the app in Expo Go on your iPhone (or iOS Simulator)
2. Navigate to each key screen
3. Take screenshots (iPhone: Side button + Volume Up)

### Screenshots to Capture (5-6 screens)

| # | Screen | What to Show |
|---|--------|-------------|
| 1 | Home Screen | Streak counter, quick actions, daily wisdom |
| 2 | Practice Screen | Timer running with mala counter |
| 3 | Shloka Library | List of available shlokas/mantras |
| 4 | Shloka Detail | Sanskrit text with transliteration and meaning |
| 5 | Session History | Completed sessions with stats |
| 6 | Settings | Theme, reminders, customization options |

### Screenshot Sizes Required

**iOS (App Store Connect):**

| Device | Resolution | Required? |
|--------|-----------|-----------|
| iPhone 6.7" (15 Pro Max) | 1290 x 2796 | Yes |
| iPhone 6.5" (14 Plus) | 1284 x 2778 | Yes |
| iPhone 5.5" (8 Plus) | 1242 x 2208 | Yes (if supporting older) |
| iPad 12.9" | 2048 x 2732 | Only if supporting iPad |

**Android (Play Console):**

| Device | Resolution | Required? |
|--------|-----------|-----------|
| Phone | At least 1080 x 1920 | Yes (min 2, max 8) |
| Tablet | 1600 x 2560 | Optional |

### Tools to Frame Screenshots

- **Screenshots.pro**: https://screenshots.pro (free, adds device frames)
- **AppMockUp**: https://app-mockup.com (free)
- **Figma**: Use device mockup templates

### Android Feature Graphic

Android also needs a **Feature Graphic** (1024 x 500 px) — a banner image shown at the top of your Play Store listing. Use Canva to create one with your app name and a few key features listed.

---

## PHASE 5: Prepare Store Listing Text

You'll need this text when filling out the store listing. Here it is ready to copy-paste:

### App Name
```
Sadhana
```

### Subtitle (iOS, max 30 chars)
```
Daily Mantra & Prayer Practice
```

### Short Description (Android, max 80 chars)
```
Practice mantras, track progress with mala counter, maintain daily streaks
```

### Full Description (both stores, max 4000 chars)

```
Sadhana is your companion for daily spiritual practice.

PRACTICE & TRACK
• Digital mala counter for mantra recitation
• Timer with session tracking
• Set intentions (Sankalp) and dedications (Offering)
• Detailed session history with statistics
• Streak tracking to build consistency

SHLOKA LIBRARY
• 20 curated mantras, stotras, and chalisas
• Sanskrit text with English transliteration
• Verse-by-verse meanings and context
• Benefits and best times for each practice
• YouTube links for pronunciation guidance

DAILY INSPIRATION
• Daily wisdom quotes from Bhagavad Gita, Vedas, Upanishads
• Verse of the day from sacred texts
• Personalized mantra recommendations

HINDU CALENDAR
• Daily Paanchang with Tithi and Nakshatra
• Ekadashi dates and significance
• Auspicious muhurat timings
• Festival calendar and reminders

GAMIFICATION
• Daily quests to motivate practice
• Achievement badges for milestones
• Practice goals (daily and weekly)

PERSONALIZATION
• Dark theme for comfortable viewing
• Adjustable font sizes
• Customizable daily reminders
• Practice goal setting

All data stays on your device. No account needed. No ads. No tracking.

Whether you're new to mantra practice or a seasoned practitioner, Sadhana helps you build a consistent spiritual routine.
```

### Keywords (iOS, max 100 chars)
```
mantra,shloka,hindu,prayer,meditation,mala,spiritual,practice,sanskrit,bhagavad
```

### Category
- iOS: **Lifestyle** (or Health & Fitness)
- Android: **Lifestyle** (or Health & Fitness)

### Age Rating
- iOS: **4+**
- Android: **Everyone**

---

## PHASE 6: Build the App with EAS

### Prerequisites
- EAS CLI installed: `npm install -g eas-cli`
- Logged in: `eas login` (create account at https://expo.dev if needed)

### Step 6A: Build for iOS

```bash
# From the project directory
eas build --platform ios --profile production
```

EAS will walk you through:
1. Selecting your Apple Developer Team
2. Creating/selecting a Distribution Certificate
3. Creating/selecting a Provisioning Profile

The build takes 15-30 minutes. You'll get a download link when done.

### Step 6B: Build for Android

```bash
eas build --platform android --profile production
```

EAS will walk you through creating an Android keystore (keep it safe — you need it for all future updates).

The build takes 10-20 minutes. You'll get an `.aab` file download link.

### Build Both at Once

```bash
eas build --platform all --profile production
```

---

## PHASE 7: Submit to iOS App Store

### Step 7A: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" > "+" > "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: Sadhana
   - **Primary Language**: English
   - **Bundle ID**: com.shlokasadhana.app (select from dropdown after build)
   - **SKU**: shloka-sadhana-001 (any unique string)

### Step 7B: Fill Out App Information

In the app page, fill out these tabs:

**App Information:**
- Category: Lifestyle
- Content Rights: "This app does not contain third-party content" or appropriate declaration
- Age Rating: Fill questionnaire (no violence, no mature content = 4+)

**Pricing and Availability:**
- Price: Free
- Availability: All territories

**App Privacy:**
- Data Types: Select "None" or minimal based on questionnaire
  - The app collects NO data linked to identity
  - Practice data stays on device only
  - No tracking

### Step 7C: Create Version & Upload

**Version Information:**
- Screenshots: Upload for each required device size
- Description: Paste the full description from Phase 5
- Keywords: Paste keywords from Phase 5
- Support URL: Your website or GitHub Pages URL
- Privacy Policy URL: Your hosted privacy policy URL

**Upload the build:**

```bash
eas submit --platform ios
```

Or manually: Download the `.ipa` from EAS, upload via Transporter app (Mac).

### Step 7D: Submit for Review

1. Select the uploaded build
2. Review all information
3. Click "Submit for Review"
4. Answer export compliance question: **No** (uses no encryption beyond standard HTTPS)
5. Wait 1-3 days (usually 24-48 hours)

---

## PHASE 8: Submit to Google Play Store

### Step 8A: Create App in Play Console

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - **App name**: Sadhana
   - **Default language**: English
   - **App or Game**: App
   - **Free or Paid**: Free
4. Accept declarations

### Step 8B: Set Up Store Listing

Go to **Grow > Store listing > Main store listing**:

- **Short description**: Paste from Phase 5
- **Full description**: Paste from Phase 5
- **App icon**: Upload 512x512 version of your icon
- **Feature graphic**: Upload 1024x500 banner
- **Phone screenshots**: Upload 2-8 screenshots

### Step 8C: Complete Required Sections

Navigate through the left sidebar and complete ALL sections marked with warnings:

**App content:**
- Privacy policy URL: Enter your hosted URL
- Ads: "No, my app does not contain ads"
- App access: "All functionality is available without special access"
- Content rating: Fill out questionnaire (will give "Everyone" rating)
- Target audience: "18 and above" (simplest, avoids COPPA requirements)
- Data safety: Fill out the form:
  - Does your app collect data? → No (or minimal — only on-device storage)
  - Does your app share data? → No

### Step 8D: Upload & Release

**Upload the build:**

```bash
eas submit --platform android
```

Or manually: Download `.aab` from EAS, upload in Play Console under Release > Production.

**Create a release:**
1. Go to Release > Production
2. Click "Create new release"
3. Upload the `.aab` file
4. Add release notes: "Initial release of Sadhana — your daily spiritual practice companion."
5. Click "Review release"
6. Click "Start rollout to Production"
7. Wait a few hours to 1 day for review

---

## PHASE 9: Post-Launch

### After Approval

- [ ] Verify the app appears in both stores
- [ ] Download and test on a real device from the store
- [ ] Monitor crash reports (check Expo dashboard)
- [ ] Monitor store ratings and reviews
- [ ] Respond to user feedback

### For Future Updates

```bash
# Bump version in app.json, then:
eas build --platform all --profile production
eas submit --platform all
```

EAS auto-increments the build number thanks to our `autoIncrement: true` config.

---

## Quick Reference: What You Need to Prepare

| # | Task | Time Estimate | Tool |
|---|------|--------------|------|
| 1 | Developer accounts | 1-2 days (activation wait) | Apple/Google websites |
| 2 | App icon (4 files) | 1-3 hours | Canva, Figma, or Fiverr |
| 3 | Host privacy policy | 30 minutes | GitHub Pages |
| 4 | Take 5-6 screenshots | 1 hour | Your phone + Screenshots.pro |
| 5 | Android feature graphic | 30 minutes | Canva |
| 6 | Build with EAS | 30-60 minutes | Terminal |
| 7 | Submit to App Store | 1-2 hours | App Store Connect |
| 8 | Submit to Play Store | 1-2 hours | Play Console |
| 9 | Wait for reviews | 1-3 days | Patience |

**Total realistic timeline: 5-7 days** (mostly waiting for account activation and store reviews)

---

## Helpful Links

| Resource | URL |
|----------|-----|
| Apple Developer Program | https://developer.apple.com/programs/ |
| Google Play Console | https://play.google.com/console/signup |
| EAS Build Docs | https://docs.expo.dev/build/introduction/ |
| EAS Submit Docs | https://docs.expo.dev/submit/introduction/ |
| App Store Review Guidelines | https://developer.apple.com/app-store/review/guidelines/ |
| Play Store Policies | https://play.google.com/about/developer-content-policy/ |
| Canva (icon/graphic design) | https://www.canva.com |
| Screenshots.pro (device frames) | https://screenshots.pro |
| AppIcon.co (icon generator) | https://appicon.co/ |
| GitHub Pages Docs | https://pages.github.com/ |

---

## Contact

For any questions about the app: info@contextfirstai.com
