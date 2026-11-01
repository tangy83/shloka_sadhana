# Idea → Backlog Workflow

A structured, LLM-executed workflow that turns a rough idea into a properly
documented backlog item — through clarification, application-impact assessment,
and traceable document updates.

This is the **prose companion** to `idea_to_backlog.py`. That `.py` file holds the
project-specific configuration (document paths, areas, ID prefixes, app-layer
inventory, stability-risk factors); this file holds the phases the model runs.
Companion to CFAI's `idea-to-standard` flow — there an insight becomes a *standard*;
here an idea becomes a *backlog item*.

> **Before first use, fill in the `# CONFIGURE:` blocks in `idea_to_backlog.py`.**
> The workflow reads that config to know your doc paths, areas, ID prefixes,
> personas, application layers, and stability-risk factors.

---

## Invocation

Tag the config file with your rough note in a Claude Code session:

```
@idea_to_backlog.py let users pause their account temporarily
```

The model then runs the six phases below, asking for your input where marked and
editing your project's documents with its own file tools.

---

## Workflow Phases

```
CAPTURE → CLARIFY → IMPACT → CONFIRM → UPDATE → REPORT
```

### Phase 1 — Capture & Parse
1. **Acknowledge** the raw idea.
2. **Classify** the apparent **category** (from `CATEGORIES` in the config, e.g.
   Feature / Tech / Design / Research / Content / Ops / Business).
3. **Classify** the apparent **area** (from `AREAS`).
4. **Surface** the assumptions being made — state them explicitly so they can be corrected.

### Phase 2 — Clarification Q&A (2–3 rounds)
Ask 2–3 questions per round, wait for the response, and continue until covered:
- **Context & Problem** — what triggered this; what problem it solves; who feels it; how painful.
- **Scope & Definition** — the minimum viable version; what's explicitly out of scope; edge cases.
- **Dependencies & Timing** — what must come first; what depends on this. Record hard blockers in `Depends On`, and the initiative it belongs to (if any) in `Lane`.
- **Priority & Size** — priority (from `PRIORITIES`) and effort (from `EFFORTS`).
- **Success Criteria** — measurable, testable outcomes. Spell the heading exactly `**Success Criteria**`: the checkbox counter scopes to that string, so an item headed "Acceptance Criteria" reports as having none and goes silently unmeasured. Write outcomes, not activities.
- **Related Items** — existing backlog items this affects, modifies, or supersedes.

### Phase 3 — Application Impact Assessment (automatic, before Confirm)
Map the clarified requirement against the **built, running application** using the config:
1. **Layer scan** — for each layer in `APP_LAYERS`, mark Touched? (Yes/No + reason).
2. **File enumeration** — list the exact files (from `APP_LAYERS`) affected, each with an
   action (CREATE / MODIFY) and a one-line reason.
3. **Stability-risk check** — for each factor in `STABILITY_RISK_FACTORS`, mark Applies?
   (Yes/No + the specific concern).
4. **Classification** — assign a Risk Level and Impact Level (from `RISK_LEVELS` / `IMPACT_LEVELS`)
   and copy the matching **Deploy Gate** verbatim from `RISK_LEVELS`.
5. **Persona routing** — engage only the relevant personas (from the project's persona set /
   `PERSONA_LAYER_ROUTING` + `PERSONA_KEYWORD_HINTS`); do **not** include every persona by default.
6. **Ordered implementation sequence** — dependency-ordered steps (migrations first, shared
   types next, …, ending with a verification + deploy-gate step).

Output the **Application Impact Card** (template below).

### Phase 4 — Confirmation (gate)
Present the full **Requirement Specification** + the **Application Impact Card**, then ask:
> "Does this fully capture your idea, and does the impact assessment look correct? Reply YES to
> proceed with document updates, or provide corrections."
If the scope changes, **re-run Phase 3** before proceeding.

### Phase 5 — Update (on approval)
Edit the documents named in the config, with traceability:
1. **Ideas log** (`IDEAS_LOG_PATH`) — add/append the idea; set status; link the new backlog + PRD items.
2. **Backlog** (`BACKLOG_PATH`) — write into the **child group doc** for the item's area, never the
   parent index:
   - Resolve the child doc under `BACKLOG_PATH` whose `BACKLOG_GROUP` header `code:` matches
     `ID_PREFIXES[area]`. If none exists, create it first:
     `python3 docs_update.py --new-group "<Area>" --code <ID_PREFIXES[area]>`
   - Append the item to that child, allocating the next `PREFIX-NNN` from the existing max id in it.
   - Regenerate the parent index: `python3 docs_update.py --backlog`
   - **Never edit `MASTER_BACKLOG.md` by hand** — it is auto-generated from the children, so items
     written there are invisible to the coverage roll-up and are erased on the next regeneration.
3. **PRD** (`PRD_PATH`) — add/update the requirement and user stories; resolve open questions.
4. **Persona docs** (`PERSONA_DIRECTORY`) — for each engaged persona, append an evaluation through
   that persona's lens (gaps / risks / enhancements), cross-referenced with existing items.

Additive only — never rewrite or delete existing sections; append with clear IDs.

### Phase 6 — Report
Emit an "Update Complete" summary:
- **Documents modified** checklist.
- **New backlog item** (id, title, area, priority, size).
- **File change manifest** table (`# | Action | File | Layer | Notes`).
- **Stability-risk summary** table.
- The **ordered implementation sequence** (reproduced).
- The **Deploy Gate** (blockquote).
- **Personas engaged** findings.

---

## Application Impact Card (Phase 3 output → appended in Phase 4)

```markdown
---

## Application Impact Card

**Requirement ID**: [PREFIX-NNN]
**Impact Level**: [from IMPACT_LEVELS]
**Risk Level**: [from RISK_LEVELS]
**Deploy Gate**: [verbatim from RISK_LEVELS]

### Layers Touched
| Layer | Files | Action |
|-------|-------|--------|
| [layer from APP_LAYERS] | [filename(s)] | CREATE / MODIFY |
*(Omit layers with no changes.)*

### Stability Risk Flags
- [ ] **[FACTOR from STABILITY_RISK_FACTORS]** — [yes + specific concern, or "Not applicable"]

### Personas Engaged
**Mandatory** (must review before implementation):
- [PERSONA] — [one sentence: their specific concern]
**Advisory** (should be consulted):
- [PERSONA] — [one sentence: their specific concern]

### Ordered Implementation Sequence
```
Step 1: [Action] — [Exact file path] — [Rationale]
...
Step N: Verification — [What to confirm before deploy]
```

### Critical Flow Impact
For each critical user/route flow the project defines, state:
[Yes — specifically affects: [step(s)]] / [No — flow unchanged]

---
```

## Requirement Specification (Phase 4)

```markdown
## Requirement Summary
**Title**: [Clear, concise title]
**ID**: [Proposed PREFIX-NNN]
**Category**: [from CATEGORIES]   **Area**: [from AREAS]
**Status**: [from STATUSES]   **Priority**: [from PRIORITIES]   **Effort**: [from EFFORTS]

**Problem Statement**: [what this solves and for whom]
**Description**: [detailed description]
**Success Criteria**:            <- this exact spelling; see note above
- [ ] Measurable, testable outcome (not "add the endpoint")
**Dependencies**: [PREFIX-NNN if any, or "-"]
**Out of Scope**: [explicit exclusions]
**Related Items**: [existing items this affects]

[Application Impact Card appended here]
```

---

## Notes

- **Additive & traceable**: every write appends with an explicit id; existing content is never
  rewritten. If a requirement changes scope after Confirm, re-run Phase 3.
- **Persona alignment**: route to the personas that actually exist in this project (see the CFAI
  expert-persona-framework and `docs/team-personas/`), not a fixed list.
- **Feeds from learnings**: "Promotion Candidates" captured in `docs/LEARNINGS_LOG.md` are natural
  inputs to this workflow.
