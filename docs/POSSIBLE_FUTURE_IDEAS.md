# Shloka Sadhana – Possible Future Ideas

This document captures product ideas for **stickiness** (coming back every day, making practice part of the day) and **tying the app to calendar and time of day** so the app feels timely and part of users’ lives, not generic.

---

## Part 1: Stickiness Levers

For an app like Shloka Sadhana, stickiness = **coming back every day** and **making practice feel part of the day**. Here are focused levers.

### 1. Make the streak central and visible

- Show **current streak** and **longest streak** on Home and in a widget.
- Gentle **streak recovery** message when they miss a day (“Your best was X days – start again today”).
- Optional **streak freeze** (e.g. 1 “freeze” per month) so one missed day doesn’t feel fatal.
- **Celebrate milestones** (7, 21, 40, 108 days) with a simple in-app moment (no heavy gamification).

### 2. One clear daily reminder (and quiet hours)

- **Single daily reminder** at their chosen time (“Time for your practice”).
- **Quiet hours** so you never notify at night.
- Optional **“No practice yet today”** nudge later in the day (once, not spamming).
- Reminder copy that feels **supportive**, not guilty.

### 3. Low-friction “quick win” each day

- **Quick 5‑min** (or 1‑mala) from Home so they can “check in” even on busy days.
- **Resume last session** when they left mid-practice.
- **“Shloka of the day”** so they don’t have to choose; one tap → detail → start.
- Goal like **“1 session per day”** with progress (“3/7 days this week”) so small wins feel visible.

### 4. Tie the app to the calendar and time of day

- **Paanchang / muhurat** (“Best for practice: 5:30–6:00 AM”) so opening the app feels timely.
- **Weekday mantra** (“Good day for Hanuman Chalisa”) so there’s a reason to open today.
- **Ekadashi / festivals** (“Tomorrow is Ekadashi”) so the app feels part of their calendar, not generic.

*(See Part 2 for detailed ideas on this.)*

### 5. Light “belonging” without social pressure

- **Satsang** (anonymous reflections) so they see others practice; “others did it today” without likes or competition.
- Optional **weekly digest** (“This week: 5 sessions, 47 min”) so they see their own consistency.
- Optional **reflection prompt** after session (“One word for today?”) so practice feels recorded and meaningful.

### 6. Reduce “I’ll do it later”

- **Onboarding**: set reminder + pick one shloka to try so day‑1 has a clear next step.
- **Favorites** + **Library search** so returning users find “their” mantras fast.
- **Session notes** (optional) so practice feels personal and worth reopening the app to log.

### 7. Avoid what hurts stickiness

- Don’t **over-notify** (max 1–2 reminders per day).
- Don’t make streaks feel **punishing** (recovery message > guilt).
- Don’t **hide** the streak or “today’s progress” (Home + widget).
- Keep **offline** and **local-first** so opening the app always works.

---

### Priority order for stickiness

| Priority | What to do first |
|----------|-------------------|
| **1** | One daily reminder + quiet hours; “No practice yet” nudge (once). |
| **2** | Streak prominent on Home; streak recovery message; milestone (7/21/40/108) moment. |
| **3** | Quick 5‑min + “Shloka of the day” + “Resume session” so today’s win is easy. |
| **4** | Simple practice goal (“1 per day”) + “3/7 this week” on Home. |
| **5** | Muhurat / “best time today” + weekday mantra so the app feels “for today”. |

Most of this is already in BACKLOG (reminders, streak recovery, weekly digest, onboarding, goals UI, daily shloka, muhurat). Implementing **reminders + streak visibility + one easy daily path** (quick 5‑min or shloka of the day) will usually move the needle most on stickiness.

---

## Part 2: Tie the app to calendar and time of day

Concrete ways to tie the app to **calendar and time of day** so it feels timely and part of users’ lives, not generic.

### 1. Paanchang / Muhurat – “Why open now?”

**Current idea:** Show “Best for practice: 5:30–6:00 AM (Brahma Muhurta)” etc.

**Go further:**

- **“You’re in Brahma Muhurta”**  
  When they open the app and *current time* falls inside Brahma Muhurta, say so: e.g. “You’re in Brahma Muhurta – a good time to start practice.” One line on Home or above the timer. Same for Abhijit: “You’re in Abhijit – good for important tasks (or practice).”  
  → Opening the app *right now* feels intentional, not random.

- **“Next best window”**  
  If they open outside auspicious times: “Next best for practice: 5:30–6:00 AM tomorrow” or “Next: Abhijit 12:00–12:48 PM today.”  
  → Gives a reason to come back at a specific time.

- **Gentle nudge at the start of a window**  
  Optional: one notification when Brahma Muhurta (or their preferred window) starts: “Brahma Muhurta has begun – a good time for practice.”  
  → Ties the app to *time of day*, not just “reminder at 7 AM.”

- **Rahu Kaal**  
  Show “Avoid for new ventures: 3:00–4:30 PM” so they plan around it; optional: “Rahu Kaal now – you can still practice; avoid starting new things.”  
  → Calendar-aware without being superstitious.

**UX:** One compact “Today’s auspicious times” block on Home. Add **“You’re in [X] now”** when current time is inside a window, and **“Next: [X] at HH:MM”** when it’s not.

---

### 2. Weekday mantra – “Why today?”

**Current idea:** “Good day for Hanuman Chalisa (Tuesday).”

**Go further:**

- **Make it actionable**  
  Don’t just say “Good day for Hanuman Chalisa.” Add: “Consider Hanuman Chalisa today” + **Start practice** (pre-filled with that shloka) or a direct link to its detail.  
  → One tap from “today’s suggestion” to practice.

- **Rotate by weekday + mood**  
  You already have weekday–deity mapping. Optionally add a second line: “Also favorable: [another deity/mantra]” so regular users don’t see the same line every Tuesday.

- **“Today’s focus” on Home**  
  Dedicated card: “Tuesday – Hanuman” with short line (e.g. “Strength, courage, removal of obstacles”) + **Start with this mantra**.  
  → Every day has a clear “today’s reason” to open the app.

- **Library filter**  
  “Good for today” filter in Library that shows only weekday-recommended shlokas.  
  → Calendar drives what they see first.

**UX:** One “Today’s mantra” (or “Good for today”) card on Home: deity + 1–2 mantras + primary CTA. Reuse existing weekday recommendation logic.

---

### 3. Ekadashi / festivals – “Why this week?”

**Current idea:** “Tomorrow is Ekadashi.”

**Go further:**

- **Countdown + meaning**  
  “Ekadashi in 2 days” or “Ekadashi tomorrow” with one line: why it matters (e.g. fasting, Vishnu-focused).  
  → Builds anticipation; app feels part of their religious calendar.

- **What to do**  
  Short, practical: “Observe with a light fast; good day for Vishnu mantras” + link to recommended shlokas (e.g. Vishnu Sahasranam) or “Start practice” with that shloka.  
  → Calendar → concrete action inside the app.

- **Day-of**  
  On Ekadashi day: banner or card at top of Home: “Today is [Name] Ekadashi” + one line significance + “Suggested: [mantra].”  
  → Opening the app on the day feels relevant.

- **Festivals**  
  Same pattern: “Maha Shivaratri in 5 days” → “Today is Maha Shivaratri” with suggested Shiva mantras / Mrityunjaya.  
  → App becomes the place that “knows” their calendar.

- **Gentle notifications**  
  Optional: “Tomorrow is Ekadashi – consider Vishnu mantras” (1 day before); “Today is Ekadashi” (morning of).  
  → Brings them back on *specific* calendar days.

**UX:**

- Small “Upcoming” block on Home: next 1–2 events (Ekadashi, next festival) with name + date + “In X days” / “Tomorrow” / “Today.”
- On the day, same event moves to a “Today” banner with short significance + suggested mantra + CTA.

---

### 4. Tying it together – “Today” as the anchor

Think of Home as answering: **“What does *today* mean for my practice?”**

| Layer    | Question           | What to show                                                |
|----------|--------------------|-------------------------------------------------------------|
| **Time** | Is now a good time? | “You’re in Brahma Muhurta” / “Next: Abhijit at 12:00”      |
| **Weekday** | What’s good today? | “Tuesday – Hanuman Chalisa” + Start practice               |
| **Lunar** | Any special day?   | “Ekadashi tomorrow” / “Today is Ekadashi”                  |
| **Solar** | Any festival?      | “Maha Shivaratri in 5 days” / “Today: Shivaratri”          |

So:

- **One “Today” section** (or 2–3 small cards):
  - “Right now: [Brahma Muhurta / Abhijit / next window]”
  - “Good for today: [Weekday mantra]”
  - “This week: [Next Ekadashi or festival]” or “Today: [Ekadashi / festival]”

- **CTAs** from each: “Start practice” (with suggested shloka when it makes sense), “See mantras,” “Read about Ekadashi.”

- **Copy** short and actionable: “Good time to practice,” “Consider Hanuman Chalisa,” “Tomorrow is Ekadashi.”

---

### 5. Implementation order (calendar & time)

| Step | What to do |
|------|------------|
| 1 | **Weekday mantra on Home** – One card: “Good for today: [deity] – [mantra name]” + link to detail / Start practice. Uses existing weekday logic; high impact, low effort. |
| 2 | **Muhurat on Home** – “Best for practice: HH:MM–HH:MM” + optional “Best for important tasks: …” and “You’re in [X] now” when current time is in a window. Uses existing muhurat.ts. |
| 3 | **Upcoming Ekadashi / festival** – One line or card: “Next: [Name] Ekadashi in X days” or “Tomorrow: Ekadashi” with optional “Suggested: [mantra].” Uses existing Paanchang/festival data. |
| 4 | **Day-of treatment** – When “today” is Ekadashi or a festival: small banner + significance + suggested mantra + CTA. |
| 5 | **Optional notifications** – “Brahma Muhurta has started” / “Tomorrow is Ekadashi” / “Today is [Festival]” so calendar and time pull them back. |

---

### 6. Principles

- **Be specific:** “Brahma Muhurta 5:30–6:00” and “Hanuman Chalisa on Tuesday” beat “Good time to practice.”
- **Be actionable:** Every time/calendar line can lead to “Start practice” or “See mantra.”
- **Respect tradition:** Use Paanchang/muhurat/Ekadashi/festival names and meanings correctly; avoid sounding generic.
- **Don’t overload:** 2–3 clear “today” items on Home are enough; rest in detail or secondary screens.

---

## Document info

- **Purpose:** Capture possible future ideas for stickiness and calendar/time-of-day; not a commitment to build.
- **Related:** BACKLOG.md (concrete tasks); REQUIREMENTS_V2.md (V2 scope).
- **Last updated:** 2026-02-05
