# Idea to Backlog Tool - Usage Guide

## Overview

The `idea_to_backlog.py` script systematically refines raw feature ideas through 17 specialized personas using a TDD-first methodology. It transforms rough ideas into well-documented backlog entries with TDD specifications.

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Verify Installation

```bash
python idea_to_backlog.py --help
```

## Basic Usage

### Interactive Mode (Recommended)

The easiest way to use the tool:

```bash
python idea_to_backlog.py
```

You'll be prompted to:
1. Enter your feature idea
2. Answer questions from different personas across 5 passes
3. Review the generated outputs

### Command-Line Mode

Provide the idea directly:

```bash
python idea_to_backlog.py --idea "Allow users to freeze their streak once per month"
```

### Resume Interrupted Session

If you interrupt a session (Ctrl+C), you can save and resume later:

```bash
# After interruption, save when prompted
# Then resume with:
python idea_to_backlog.py --resume .sessions/session_YYYYMMDD_HHMMSS.json
```

## The 5-Pass System

The tool asks questions in 5 strategic passes:

### Pass 1: Scoping & Vision
**Personas:** Product Manager, UI/UX Designer
**Focus:** What are we building? Who is it for?
**Example Questions:**
- What specific user problem does this idea solve?
- Where would this feature fit in the app navigation?

### Pass 2: Technical Feasibility
**Personas:** Frontend Engineer, Mobile Performance Engineer
**Focus:** How would we build it? What's the complexity?
**Example Questions:**
- What React Native components are needed?
- What's the potential performance impact?

### Pass 3: User Impact & Inclusion
**Personas:** Accessibility Specialist, Onboarding Specialist, Behavioral Psychologist
**Focus:** Does it work for ALL users? Does it drive the right behaviors?
**Example Questions:**
- How will screen reader users interact with this?
- Will first-time users understand this feature?
- What habit or behavior does this encourage?

### Pass 4: Engagement & Content
**Personas:** Gamification Designer, Content Strategist, Growth Marketer
**Focus:** How does it drive engagement? What content is needed?
**Example Questions:**
- Does this feature have any rewards or milestones?
- What content is required?
- Does this have viral or sharing potential?

### Pass 5: Domain-Specific
**Personas:** Selected based on keywords in your idea
**Focus:** Apply specialized expertise

**Keyword Matching:**
- `calendar|ekadashi|festival` → Hindu Calendar Expert
- `audio|video|media` → Audio/Video Specialist
- `social|share|community` → Community Manager
- `notification|reminder` → Notification Strategist
- `language|translation` → Localization Expert

---

## Generated Outputs

The tool generates three files:

### 1. Backlog Entry (appended to `docs/BACKLOG.md`)

Structured entry with:
- Feature name, priority, effort estimate
- Implementation steps
- Acceptance criteria
- Technical considerations
- Persona insights
- Files to modify
- Dependencies
- Test coverage requirements

### 2. TDD Specification (`docs/tdd_specs/[feature]_tdd_spec.md`)

Complete TDD workflow:
- **RED Phase:** List of test cases to write (rendering, interactions, state, accessibility, edge cases)
- **GREEN Phase:** Implementation checklist
- **REFACTOR Phase:** Quality improvement tasks
- **Test file stub:** Copy-paste ready TypeScript test code
- Mocks needed
- Quality check commands

### 3. Idea Analysis (`docs/idea_analysis/[feature]_[timestamp].md`)

Complete transcript:
- Original idea
- All 5 passes with every question and answer
- Synthesis and recommendations
- Risks and success metrics

---

## Example Session

```bash
$ python idea_to_backlog.py

🕉️  Idea to Backlog Generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Refine ideas through persona perspectives
Generate TDD-ready specs

Step 1: Describe your feature idea
Be as detailed or as brief as you like. We'll refine it through 5 passes.

💡 Your idea: Allow users to "freeze" their streak once per month

✅ Loaded 17 personas

══════════════════════════════════════════════════════════════════════
╭─────────────────────────────────────────────────────────╮
│    Pass 1/5: Scoping & Vision                            │
╰─────────────────────────────────────────────────────────╯

👤 Product Manager
Feature prioritization, user journeys, analytics, roadmap

  Q1: What specific user problem does this idea solve?
  A: Users feel anxious about losing streaks on unavoidable rest days

  Q2: Which user segment benefits most from this feature?
  A: Daily practitioners with long streaks (21+ days)

  Q3: Is this a P0 (critical), P1 (high), P2 (medium), or P3 (low) priority? Why?
  A: P2 - Nice engagement feature but not critical

[... continues through all 5 passes ...]

🎯 Generating outputs...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Analyzing idea
✓ Generating backlog entry
✓ Generating TDD specification
✓ Generating idea analysis

💾 Writing output files...
  ✅ docs/BACKLOG.md (entry appended)
  ✅ docs/tdd_specs/streak_freeze_tdd_spec.md
  ✅ docs/idea_analysis/streak_freeze_20260209_143522.md

══════════════════════════════════════════════════════════════════════
╭────────────────────────────────────────────────────────╮
│                  ✨ Success!                            │
│                                                         │
│ Feature: Allow Users To Freeze Their Streak           │
│ Priority: P2                                            │
│ Effort: 2-3 days                                        │
│                                                         │
│ Next steps:                                             │
│ 1. Review backlog entry in docs/BACKLOG.md             │
│ 2. Follow TDD spec in docs/tdd_specs/streak_freeze... │
│ 3. Begin RED phase: Write failing tests                │
╰────────────────────────────────────────────────────────╯
```

---

## Tips for Best Results

### 1. Be Specific in Your Idea

**Good:**
"Allow users to freeze their streak once per month to avoid losing it on unavoidable rest days"

**Less Good:**
"Improve streaks"

### 2. Provide Context in Answers

When answering questions, mention:
- User pain points
- Expected behavior
- Edge cases you're aware of

### 3. Use the 5-Pass System

Each pass builds on the previous:
- Pass 1 establishes WHAT and WHY
- Pass 2 determines HOW
- Pass 3 ensures INCLUSIVITY
- Pass 4 maximizes ENGAGEMENT
- Pass 5 applies DOMAIN EXPERTISE

### 4. Save Sessions for Complex Ideas

For complex features, save your session after Pass 2 or 3, review the answers, then resume to finish.

### 5. Review Generated Outputs

The generated specs are starting points - review and adjust based on your specific needs.

---

## Troubleshooting

### "No persona files found"
- Ensure you're running from project root
- Check `personas/` directory exists with .md files
- Verify file permissions

### "Cannot append to BACKLOG.md"
- Check file exists: `docs/BACKLOG.md`
- Verify write permissions
- Ensure file is not open in another application

### "Module not found" errors
- Install dependencies: `pip install -r requirements.txt`
- Run from project root directory

### Sessions not saving
- Check `.sessions/` directory exists
- Verify write permissions
- Ensure disk space available

---

## Advanced Usage

### Custom Output Directory

```bash
python idea_to_backlog.py --output ./custom_docs --idea "Your idea"
```

### Running Tests

Test the Python modules:

```bash
cd scripts
pytest tests/ -v
```

### Manual Session Inspection

Sessions are saved as JSON in `.sessions/`:

```bash
cat .sessions/session_20260209_143000.json | python -m json.tool
```

---

## Integration with Existing Workflow

### After Generation

1. **Review Backlog Entry**: Check `docs/BACKLOG.md` for the appended entry
2. **Read TDD Spec**: Review `docs/tdd_specs/[feature]_tdd_spec.md`
3. **Begin TDD Workflow**:
   - **RED Phase:** Write failing tests per spec
   - **GREEN Phase:** Implement to pass tests
   - **REFACTOR Phase:** Polish code quality
4. **Follow Project Standards**: Use `docs/TDD_WORKFLOW_REACT_NATIVE.md`
5. **Log Issues**: Document learnings in `docs/ISSUES_LOG.md`

### Backlog Management

- Generated entries appear at the end of `docs/BACKLOG.md`
- Move them to appropriate priority sections as needed
- Update effort estimates after implementation

---

## File Locations

```
shloka_sadhana/
├── idea_to_backlog.py          # Main script (run this)
├── docs/
│   ├── BACKLOG.md              # Updated with new entries
│   ├── idea_analysis/          # Analysis documents
│   └── tdd_specs/              # TDD specifications
├── .sessions/                  # Saved sessions
├── personas/                   # Persona files (read-only)
└── scripts/
    └── idea_to_backlog/        # Python modules
```

---

## FAQ

**Q: Can I edit the questions?**
A: Yes! Edit `scripts/idea_to_backlog/templates/questions.yaml`

**Q: How long does a session take?**
A: 10-20 minutes depending on idea complexity and answer detail

**Q: Can I skip questions?**
A: Type "skip" or leave blank, but more detail = better output

**Q: Can I run this in non-interactive mode?**
A: Currently interactive only. Batch mode is a future enhancement.

**Q: Do I need internet connection?**
A: No! The tool is fully offline (rule-based, no LLM).

---

## Next Steps

After using the tool:

1. Review and adjust generated backlog entry
2. Follow TDD spec for implementation
3. Share feedback or issues via project channels
4. Iterate on the tool as needed

---

## Support

For issues or questions:
- Check this guide first
- Review generated `idea_analysis/` documents for examples
- Consult project documentation in `docs/`

Happy refining! 🚀
