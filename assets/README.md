# Assets Guide
# Shloka Sadhana - App Icons and Images

**Current Status:** Using Expo default placeholders
**Action Required:** Replace with custom-designed assets before production release

---

## Required Assets

### 1. App Icon (`icon.png`)
- **Size:** 1024x1024px
- **Format:** PNG with transparency
- **Usage:** iOS and Android app icon
- **Design Notes:**
  - Should reflect spiritual/meditation theme
  - Consider using Om symbol, lotus, or prayer beads
  - Use brand colors: Primary #E87E04, Background #1a1a2e
  - Ensure icon works at small sizes (recognize at 44x44px)

### 2. Adaptive Icon (`adaptive-icon.png`)
- **Size:** 1024x1024px
- **Format:** PNG with transparency
- **Usage:** Android adaptive icon (foreground layer)
- **Design Notes:**
  - Should be centered within safe zone (684x684px)
  - Background color set in app.json: #1a1a2e
  - Test with various mask shapes (circle, squircle, rounded square)

### 3. Splash Screen (`splash-icon.png`)
- **Size:** 1284x2778px (iPhone 13 Pro Max resolution)
- **Format:** PNG
- **Usage:** App loading screen
- **Design Notes:**
  - Background: #1a1a2e (dark theme)
  - Center icon or logo
  - Keep design minimal and fast-loading
  - Consider animated splash screen in future

### 4. Notification Icon (`notification-icon.png`)
- **Size:** 96x96px (Android), 1024x1024px (iOS)
- **Format:** PNG with transparency
- **Usage:** Push notification icon
- **Design Notes:**
  - Simple, recognizable silhouette
  - Should work in monochrome (Android uses single color)
  - Brand color overlay: #E87E04

### 5. Favicon (`favicon.png`)
- **Size:** 48x48px
- **Format:** PNG or ICO
- **Usage:** Web version (Expo web)
- **Design Notes:**
  - Simplified version of app icon
  - Should be recognizable even at tiny size

---

## Additional Assets Needed (Future)

### Screenshots (App Store & Play Store)
**iOS (required):**
- 6.5" iPhone: 1284x2778px (iPhone 13 Pro Max)
- 5.5" iPhone: 1242x2208px (iPhone 8 Plus)

**Android (required):**
- Phone: 1080x1920px minimum
- Tablet: 1920x1200px (optional)

**Quantity:** 3-8 screenshots per platform

**Content Ideas:**
- Practice session in progress (timer + counter)
- Shloka library view
- Daily wisdom screen
- Streak milestone celebration
- Practice summary/reflection

### App Store Assets
- **App Preview Video (optional):** 15-30 seconds, various sizes
- **App Icon (for store listing):** 1024x1024px
- **Feature Graphic (Android Play Store):** 1024x500px

---

## Asset Creation Tools

### Recommended Design Tools:
- **Figma** (free, web-based)
- **Adobe Illustrator** (professional)
- **Canva** (easy, templates available)
- **Sketch** (Mac only)

### Icon Generators:
- https://icon.kitchen/ (Adaptive icon preview)
- https://makeappicon.com/ (Generate all sizes)
- https://www.appicon.co/ (iOS + Android)

### Asset Optimization:
- **TinyPNG** - Compress PNG without quality loss
- **ImageOptim** - Batch optimize images (Mac)
- **Squoosh** - Google's image optimizer

---

## Color Palette (From PRD)

```
Primary: #E87E04 (Orange - spiritual fire)
Primary Dark: #B45309
Background: #1a1a2e (Dark blue-gray)
Surface: #16213e
Text: #E8D5B7 (Cream/beige)
Success: #10B981 (Green - for streaks)
```

---

## Design Guidelines

### Visual Theme:
- **Spiritual, calm, minimal**
- Avoid clutter and excessive ornamentation
- Use sacred geometry if appropriate
- Cultural sensitivity (consult with spiritual teachers)

### Typography (Future):
- Consider Devanagari font for Sanskrit text
- Ensure proper diacritical marks for transliteration

### Iconography:
- Lotus flower (purity, enlightenment)
- Om symbol (universal sound)
- Mala beads (practice counting)
- Moon phases (Hindu calendar)
- Simple geometric patterns

---

## Current Placeholders

All current assets are Expo defaults and MUST be replaced before production release:

- ⚠️ `icon.png` - Default Expo icon
- ⚠️ `adaptive-icon.png` - Default Expo adaptive icon
- ⚠️ `splash-icon.png` - Default Expo splash
- ⚠️ `notification-icon.png` - Copy of icon.png (placeholder)
- ⚠️ `favicon.png` - Default Expo favicon

**Action:** Create custom designs or hire a designer before Phase 5 (Deployment)

---

## When to Replace Assets

**Minimum for MVP (Phase 5):**
- Custom app icon (icon.png)
- Custom adaptive icon (adaptive-icon.png)
- Basic splash screen (splash-icon.png)
- App Store screenshots (3-5 per platform)

**Nice to Have:**
- Custom notification icon
- Animated splash screen
- App preview video
- Feature graphic (Play Store)

---

## Verification Checklist

Before submitting to App Store / Play Store:

iOS:
- [ ] App icon renders correctly on all iOS devices
- [ ] No transparency issues or artifacts
- [ ] Splash screen displays properly
- [ ] Screenshots meet Apple's guidelines
- [ ] Icon doesn't use Apple's UI elements

Android:
- [ ] Adaptive icon works with all mask shapes
- [ ] Background color matches brand
- [ ] Icon legible at 48dp size
- [ ] Screenshots meet Google's guidelines
- [ ] Feature graphic approved

---

**Remember:** Professional-looking assets significantly impact app store conversion rates. Invest in good design!
