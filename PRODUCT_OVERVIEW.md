# Shloka Sadhana — Product Overview

> **Shloka Sadhana** (Sanskrit: *श्लोक साधना*) means *"spiritual practice through sacred verse"* — a mobile companion for building consistent, meaningful Hindu spiritual practice.

---

## 1. What Is This App?

Shloka Sadhana is a native mobile application (iOS and Android) built with React Native and Expo. It serves as a **spiritual practice companion** that helps practitioners build and sustain a daily chanting and meditation habit — grounded in Hindu tradition, made accessible for modern life.

**One-line value proposition:**
*Transform sporadic spiritual intention into a consistent daily ritual, with guidance, cultural context, and community support — all on your phone.*

---

## 2. The Problem We Are Solving

Many spiritual practitioners struggle to maintain meaningful practice despite genuine intention. The root causes:

| Problem | Description |
|---------|-------------|
| **Inconsistent practice** | Without structure or reminders, practice becomes sporadic |
| **Lack of guidance** | Practitioners don't know which shlokas to chant, when, or why |
| **Lost tradition** | Disconnection from cultural and scriptural context erodes depth |
| **Isolation** | Practicing alone with no community or accountability |
| **No progress tracking** | No way to measure consistency or celebrate growth |
| **Motivation fade** | Initial enthusiasm dissipates without reinforcement |

---

## 3. What the App Is Trying to Achieve

### Primary Goals
- **Increase practice consistency** — through daily streaks, configurable reminders, and gentle re-engagement after a missed day
- **Deepen spiritual understanding** — curated shloka library with Sanskrit, transliteration, line-by-line English meaning, and pronunciation videos
- **Foster community** — Satsang section with upcoming events, global practitioner count, and planned anonymous reflections

### Secondary Goals
- **Deliver cultural context** — Paanchang (Hindu lunar calendar), Muhurat (auspicious times), Ekadashi calendar, and festival guide
- **Honour privacy** — all data stored locally on device; nothing leaves the phone
- **Stay offline-first** — full functionality without an internet connection
- **Be culturally respectful** — content is presented with meaning and context, never extracted from tradition for novelty

---

## 4. Core Features

### Practice Engine
- Precision **timer** (MM:SS) with start / pause / resume / complete controls
- **Mala counter** — tap to increment beads; auto-celebrates at every 108 (one mala)
- **Sankalp modal** — set a daily intention before practice begins
- **Offering modal** — dedicate the practice (to family, world peace, ancestors, etc.) after completion
- Notes / reflection capture for each session
- Minimum 60-second session requirement

### Shloka Library
- 20+ sacred texts with full Sanskrit (Devanagari), IAST transliteration, and English meanings
- Covers: Gayatri Mantra, Hanuman Chalisa, Vishnu Sahasranam, Maha Mrityunjaya, Ganesh Mantra, Devi Mahatmya, Shiva Tandava Stotram, Bhaja Govindam, and more
- Linked YouTube videos for pronunciation guidance
- One-tap "Start Practice" from any shloka

### Hindu Calendar Integration
- **Paanchang** — tithi (lunar day), nakshatra (lunar mansion), paksha (fortnight), moon phase
- **Muhurat Times** — Brahma Muhurta, sunrise, sunset, Abhijit, Rahu Kaal
- **Ekadashi Calendar** — all 26 Ekadashis for the year with significance, fasting guidelines, Vrat Katha
- **Festival Calendar** — 30+ Hindu festivals and vratas with dates and descriptions

### Daily Rotating Content
- **Verse of the Day** — deterministic daily rotation through all shloka verses
- **Daily Wisdom** — 30+ spiritual teachings across 6 categories (Dharma, Karma, Devotion, Meditation, Wisdom, Compassion)
- **Recommended Shloka** — intelligent suggestion based on day of week, deity associations, and Ekadashi awareness

### Progress & Motivation
- **Streak tracking** — current streak, longest streak, total sessions
- **Session history** — full log of past sessions with duration, mala count, offering, and notes
- **Recovery messaging** — compassionate encouragement when a streak breaks
- **Wisdom teachings** — unlocked at streak milestones (7, 14, 21, 30 days)

### Community (Satsang)
- Global practitioner count
- Upcoming online, local, and global community events
- Planned: anonymous practitioner reflections

### Settings & Accessibility
- Configurable daily reminders (12-hour time picker)
- Privacy Policy, Terms of Service
- Clear all data option
- Large touch targets (44×44pt minimum)
- Screen-reader friendly (WCAG 2.1 Level AA)

---

## 5. User Personas

The requirements and feature priorities for Shloka Sadhana are shaped by three distinct user archetypes:

---

### Persona 1 — Priya, The Consistent Practitioner

| Attribute | Detail |
|-----------|--------|
| **Age** | 42 |
| **Location** | Mumbai, India |
| **Occupation** | Software Engineer |
| **Spiritual background** | Grew up with practice; lapsed in her 20s; now returning |

**Goals**
- Restart a daily Hanuman Chalisa practice
- Track consistency with a visible streak
- Learn the deeper meaning behind each verse

**Pain Points**
- Forgets to practice without a reminder
- Loses count mid-chant, breaking focus
- Feels isolated — practice is solitary and has no community dimension

**How Shloka Sadhana helps Priya**
The daily reminder notification prompts her each morning. The mala counter lets her chant without losing count. The Satsang section and global practitioner count remind her she is part of something larger.

---

### Persona 2 — Michael, The Curious Seeker

| Attribute | Detail |
|-----------|--------|
| **Age** | 28 |
| **Location** | San Francisco, USA |
| **Occupation** | Graphic Designer |
| **Spiritual background** | No family tradition; exploring meditation and Eastern philosophy |

**Goals**
- Learn about Hindu spiritual practices authentically
- Build a beginner meditation habit
- Engage with the tradition respectfully, without cultural appropriation

**Pain Points**
- Raw internet searches are overwhelming and lack curation
- Doesn't know where to begin or which texts are appropriate
- Concerned about approaching a tradition that isn't his own

**How Shloka Sadhana helps Michael**
The curated library presents each shloka with full cultural context — deity background, spiritual benefits, best times to chant. Content is respectful and educational rather than exoticised. The "Recommended Shloka" feature gives him a clear starting point each day.

---

### Persona 3 — Asha, The Elder Teacher

| Attribute | Detail |
|-----------|--------|
| **Age** | 67 |
| **Location** | Chennai, India |
| **Occupation** | Retired Teacher |
| **Spiritual background** | Lifelong practitioner; daily Vishnu Sahasranam for decades |

**Goals**
- Maintain and track her existing Vishnu Sahasranam practice
- Share wisdom with younger generations
- Have a simple, uncluttered tool — not a complex app

**Pain Points**
- Technology interfaces are often confusing and overwhelming
- Needs large, readable text and straightforward navigation
- Wants to contribute to community, not just consume

**How Shloka Sadhana helps Asha**
The app's focused, uncluttered navigation and large text make it approachable. The Satsang section gives her a space to engage with community. Session history lets her see her practice totals over time.

---

## 6. Design Language & Color Palette

Shloka Sadhana follows an **ethnic Indian design aesthetic** — temple architecture and sacred objects translated into a mobile interface. Every color choice carries symbolic meaning rooted in Hindu visual tradition.

### Philosophy
> *The screen should feel like stepping into a sacred space — warm, grounded, alive with quiet devotion.*

The default is a **dark theme** that evokes the interior of a temple at dusk: deep crimson walls, the glow of oil lamps, sacred fire, and the gleam of gold offerings. A light theme (warm cream parchment) is also available.

### Color Palette

| Role | Name | Hex | Symbolic Meaning |
|------|------|-----|-----------------|
| **Primary action** | Burnt Saffron | `#E45818` | Sacred fire, transformation, energy |
| **Primary pressed** | Deep Saffron | `#B03010` | Fire's deeper ember |
| **Accent / achievement** | Temple Gold | `#FFD700` | Divine light, achievement, mala count |
| **Background (dark)** | Dark Orange-Brown | `#2C1200` | Smouldering temple wood, sacred depth |
| **Surface / cards** | Dark Crimson | `#8B0020` | Altar cloth, elevated surfaces |
| **Surface secondary** | Mid Maroon | `#5A001C` | Borders, modals, dividers |
| **Text primary** | Warm Cream | `#FFF8E7` | Ancient manuscript, parchment warmth |
| **Text secondary** | Warm Amber-Orange | `#FF9820` | Secondary labels, icons |
| **Text tertiary** | Translucent Cream | `rgba(255,248,231,0.50)` | Muted / placeholder text |
| **Text disabled** | Faint Cream | `rgba(255,248,231,0.35)` | Disabled states |
| **Success** | Temple Green | `#4CAF50` | Completion, streak achievement |
| **Warning** | Temple Gold | `#FFD700` | Caution (doubles with accent) |
| **Error** | Vermilion | `#EF4444` | Errors |
| **Informational** | Spiritual Violet | `#7C4DFF` | Informational, sacred knowledge |
| **Special — lotus** | Lotus Pink | `#E91E8C` | Special moments, mala celebrations |
| **Special — lunar** | Moon Phase Cream | `#FFE8A3` | Calendar elements, moon phases |
| **Border** | Mid Maroon | `#5A001C` | Warm, grounded boundary |
| **Subtle border** | Translucent Amber | `rgba(255,152,32,0.15)` | Soft card outlines |
| **Overlay** | Dark Orange-Brown | `rgba(44,18,0,0.80)` | Modal backdrops |

**Gradient:** Burnt Saffron `#E45818` → Deep Saffron `#B03010` (flame effect for CTAs)

### Light Theme
Same saffron and gold primaries applied over a warm cream (`#FFF8E7`) parchment background — the feel of reading sacred texts on aged paper in afternoon light.

---

## 7. Look, Feel & UX Principles

### Visual Identity

- **Dark mode first** — the primary experience feels like a temple sanctum at night
- **Sanskrit** rendered in Warm Cream (`#FFF8E7`), slightly enlarged — the sacred source text
- **Transliteration** in Warm Amber-Orange (`#FF9820`) italic — the spoken bridge
- **English meaning** in standard cream — contextual, supportive
- **Temple Gold** (`#FFD700`) for numbers that carry spiritual weight: mala count, streak, verse numbers
- **Lotus Pink** (`#E91E8C`) reserved for rare celebratory moments (completing a mala)
- **Moon-phase emojis** (🌕🌖🌗🌘🌑🌒🌓🌔) for Paanchang visual representation

### Interaction Design

- **Haptic feedback** with intentional graduation:
  - *Light* — each mala bead tap (subtle, rhythmic)
  - *Medium* — major actions (start/stop timer, save session)
  - *Heavy* — mala completion at 108 beads (celebratory)
- **60fps animations** — transitions, counter increments, completion celebrations
- **Minimum 44×44pt touch targets** across all interactive elements (WCAG 2.1 Level AA)
- Smooth card-based transitions; no jarring full-screen reloads

### Navigation Structure

```
Bottom Tab Bar
├── Home       — Dashboard: streak, stats, Paanchang, daily content
├── Practice   — Timer + Mala Counter (the core ritual space)
├── Library    — Browse and search all shlokas
├── Satsang    — Community events and connection
└── Wisdom     — Daily quotes and spiritual teachings

Stack (detail screens)
├── Shloka Detail     — Full text, meaning, video, start practice
├── Ekadashi Detail   — Significance, fasting guidelines, Vrat Katha
├── Wisdom Detail     — Full teaching with author
├── Session History   — Past sessions with stats
└── Settings          — Reminders, preferences, legal
```

### Content Presentation

- **Cards** — dark crimson surface (`#8B0020`), subtle mid-maroon border (`#5A001C`), gold accent lines for emphasis
- **Shloka cards** — show deity icon, estimated duration, best chanting time
- **Paanchang card** — moon phase emoji, tithi name, spiritual guidance in secondary text
- **Session history rows** — collapsible with offering, notes, and mala count inline

### UX Philosophy

| Principle | Expression in the App |
|-----------|----------------------|
| **Offline-first** | All features work without internet; Paanchang calculated locally |
| **Private-first** | Zero data sent to servers; all storage is AsyncStorage on-device |
| **Gentle motivation** | Streaks celebrate consistency; recovery messages soften breaks with compassion rather than guilt |
| **Cultural respect** | Every shloka includes meaning and deity context; nothing is presented as decoration |
| **Progressive complexity** | Beginners see "Start Practice" and recommendations; depth (Paanchang, Muhurat, Ekadashi) is available but never required |
| **Accessibility** | Screen-reader labels on all interactive elements; high contrast; large touch targets |
| **Ritual feel** | The practice screen is intentionally minimal — timer, counter, and the chant. No distractions. |

---

## 8. Technical Snapshot

| Dimension | Detail |
|-----------|--------|
| **Framework** | React Native 0.81.5 + Expo SDK 54 |
| **Language** | TypeScript (strict mode, 0 errors) |
| **State** | React Context API + AsyncStorage (offline persistence) |
| **Navigation** | React Navigation 7 (bottom tabs + native stack) |
| **Testing** | Jest 30 + React Native Testing Library — 826 tests passing |
| **Build & Deploy** | EAS Build + EAS Update (OTA) |
| **Data** | Fully local — AsyncStorage, no backend |
| **Notifications** | expo-notifications (local, no server) |
| **Haptics** | expo-haptics (light / medium / heavy) |

---

## 9. Current Status

| Area | Status |
|------|--------|
| Core practice engine | Complete |
| Shloka library (20+ texts) | Complete |
| Paanchang + Muhurat | Complete |
| Ekadashi calendar | Complete |
| Festival calendar | Complete |
| Session history + streaks | Complete |
| Daily content rotation | Complete |
| Satsang section | Complete |
| Settings + notifications | Complete |
| Dark + light themes | Complete |
| Tests | 826 passing |
| TypeScript / lint errors | 0 |

---

*This document is a living reference for the product vision, design language, and user personas that guide development decisions on Shloka Sadhana.*
