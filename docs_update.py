#!/usr/bin/env python3
"""
docs_update.py — CFAI canonical-docs maintainer.

Reviews what actually exists in the application, then keeps the canonical
12-document CFAI documentation set (CLAUDE.md + docs/) in sync with the code.

Companion to (NOT a replacement for) toolkit/session-doc-update.ts:
  - session-doc-update.ts owns the living dev meta-docs
    (CHANGELOG, STATUS, Claude memory/MEMORY.md, session-history, personas).
  - docs_update.py owns the 12 canonical CFAI product docs defined in
    project-init/project-documentation-standards-reckoner.md.

Pure standard library. Shells out to the authenticated `claude` CLI
(Claude Code) via subprocess — no ANTHROPIC_API_KEY, no pip installs. This
mirrors scripts/generate_standard.py and toolkit/adopt.py.

ADOPTING PROJECTS: copy this file to your project root and run it from there.
`--project` defaults to the script's own directory, so the copy "just works".

Usage:
    python3 docs_update.py --self-test          # validate registry + prompts, no model call
    python3 docs_update.py --bootstrap --dry-run # preview which missing docs would be created
    python3 docs_update.py --bootstrap          # create only the docs that don't exist yet
    python3 docs_update.py                       # default: update the mandatory session trio
    python3 docs_update.py --all                 # update every doc in the registry
    python3 docs_update.py --doc DATA_MODEL.md   # update a single doc by filename
    python3 docs_update.py --all --project /path/to/repo

Modes are mutually exclusive: --bootstrap | --all | (default trio) | --doc.
--dry-run and --self-test never call the model and never write files.
"""

import os
import sys
import re
import json
import hashlib
import argparse
import subprocess
from datetime import date
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Model routing + subprocess isolation.
#
# `claude -p` inherits the caller's CLAUDE.md, hooks and plugins, so a personal
# rule like "end every response with a status footer" would be appended to every
# doc this script generates. `--setting-sources ""` isolates the subprocess.
#
# That flag also stops the CLI reading `model` from settings.json, so we resolve
# the model here and pass it explicitly — net routing is unchanged. No model ID
# is pinned. Precedence:
#   CFAI_UPDATE_MODEL -> CFAI_MODEL -> ANTHROPIC_MODEL -> .claude/settings*.json
#   (cwd, then ~) -> the caller-supplied default -> whatever the CLI defaults to.

CLAUDE_ISOLATION = ["--setting-sources", ""]


def _settings_model() -> str:
    """The `model` pinned in the caller's Claude Code settings, if any."""
    for root in (Path.cwd() / ".claude", Path.home() / ".claude"):
        for name in ("settings.local.json", "settings.json"):
            try:
                value = json.loads((root / name).read_text(encoding="utf-8")).get("model")
            except (OSError, ValueError, AttributeError):
                continue
            if isinstance(value, str) and value.strip():
                return value.strip()
    return ""


def model_flags(env_var: str, default: str | None = None) -> list[str]:
    """['--model', <id>] resolved from env, then settings.json, then `default`."""
    for var in (env_var, "CFAI_MODEL", "ANTHROPIC_MODEL"):
        value = os.environ.get(var, "").strip()
        if value:
            return ["--model", value]
    resolved = _settings_model() or (default or "")
    return ["--model", resolved] if resolved else []


# The mandatory end-of-session trio (per the Session Protocol). Updated by the
# default mode — the non-negotiable minimum at every session close.
SESSION_TRIO = ("FEATURE_REGISTRY.md", "SESSION_LOG.md", "KNOWN_ISSUES.md")

# Learnings log (F3) — abstracted software-engineering learnings, refreshed on the
# default/-all run (novelty-filtered so prior entries are preserved). Not part of
# DOC_REGISTRY: it appends/refreshes rather than full-rewrites, so it needs a
# dedicated updater, not the generic DocSpec loop.
LEARNINGS_REL_PATH = "docs/LEARNINGS_LOG.md"
LEARNING_CATEGORIES = (
    "Architecture Patterns",
    "Reusable Abstractions & Utilities",
    "Testing Strategies",
    "Tooling & Automation Wins",
    "Gotchas",
    "Anti-Patterns Observed",
    "Promotion Candidates → CFAI Standard",
)

# ---------------------------------------------------------------------------
# Modular backlog: one parent index + one child doc per feature group.
# The parent is a pure function of the children — regenerated, never authored.
# ---------------------------------------------------------------------------
BACKLOG_DIRNAME = "docs/backlog"
BACKLOG_INDEX = "MASTER_BACKLOG.md"
BACKLOG_STATUSES = ("BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED")
DONE_STATUSES = {"DONE"}

# Effort sizing -> story points, for effort-weighted coverage.
EFFORT_POINTS = {"XS": 1, "S": 2, "M": 4, "L": 8, "XL": 16}
# An item with no Effort weighs as M. Chosen so a backlog with no Effort fields at
# all weights uniformly, making weighted % == plain mean — i.e. projects that
# adopted before this field existed see an unchanged number.
DEFAULT_EFFORT_POINTS = EFFORT_POINTS["M"]

# A group is either delivered functionality (counts toward coverage) or tracked
# debt (burned down separately, never mixed into the coverage headline).
FEATURE_CLASS = "feature"
DEBT_CLASS = "debt"
KNOWN_CLASSES = (FEATURE_CLASS, DEBT_CLASS)

# ---------------------------------------------------------------------------
# The canonical 12-document registry
#
# Each entry mirrors the spec in
# project-init/project-documentation-standards-reckoner.md. `root_level` docs
# live at the repo root (CLAUDE.md); the rest live under docs/.
# ---------------------------------------------------------------------------

DocSpec = dict  # {name, subdir, must_contain[], quality_bar, update_trigger}

DOC_REGISTRY: list[DocSpec] = [
    {
        "name": "CLAUDE.md", "subdir": ".",
        "must_contain": ["one-line product identity", "tech stack", "key folder structure",
                         "no-touch files", "Session Protocol block"],
        "quality_bar": "<=150 lines; only what Claude cannot infer from the code; no duplication of global CLAUDE.md.",
        "update_trigger": "When the stack, folder structure, or protected files change.",
    },
    {
        "name": "PROJECT_OVERVIEW.md", "subdir": "docs",
        "must_contain": ["product name + one-sentence description", "target users", "core value proposition",
                         "current stage (MVP/Beta/Production)", "tech stack summary", "out of scope"],
        "quality_bar": "Fits on one screen; no aspirational language; describes only what exists or is being built.",
        "update_trigger": "Major product pivots only.",
    },
    {
        "name": "ARCHITECTURE.md", "subdir": "docs",
        "must_contain": ["Mermaid system diagram", "component list", "end-to-end data flow",
                         "third-party integrations", "infrastructure (hosting/regions)", "auth model"],
        "quality_bar": "Accurate enough to set up a local env from it; diagrams kept in sync with the implementation.",
        "update_trigger": "Any new service, integration, or structural change.",
    },
    {
        "name": "DATA_MODEL.md", "subdir": "docs",
        "must_contain": ["every table/collection with fields, types, constraints", "relationships (FKs/joins)",
                         "enums with valid values", "RLS rules if applicable", "soft-delete/audit patterns"],
        "quality_bar": "Must match the live schema exactly — a delta is a BUG, not a doc gap.",
        "update_trigger": "Any schema migration — update in the SAME commit as the migration.",
    },
    {
        "name": "FEATURE_REGISTRY.md", "subdir": "docs",
        "must_contain": ["per feature: name", "status (Built/In Progress/Partial/Planned/Abandoned/Unknown)",
                         "one-line description", "location in codebase", "known gaps if Partial", "owner"],
        "quality_bar": "Every feature listed incl. abandoned; never mark Built if gaps exist (use Partial); "
                       "accurate enough for a new dev to orient.",
        "update_trigger": "Every build session, before close — non-negotiable.",
    },
    {
        "name": "API_CONTRACTS.md", "subdir": "docs",
        "must_contain": ["per endpoint: HTTP method + path", "auth requirement", "request shape",
                         "response + error shapes", "status codes", "rate limits if applicable"],
        "quality_bar": "A frontend dev can build against the API without reading backend code; "
                       "no undocumented endpoints.",
        "update_trigger": "Any endpoint added, changed, or removed.",
    },
    {
        "name": "DECISIONS.md", "subdir": "docs",
        "must_contain": ["per entry: date", "what was decided", "why (reasoning)",
                         "alternatives considered + why rejected", "revisit conditions"],
        "quality_bar": "Append-only; value is in the WHY; mark superseded entries 'Superseded by [date]', never delete.",
        "update_trigger": "Any meaningful architectural/product/technology decision (incl. abandoning a feature).",
    },
    {
        "name": "KNOWN_ISSUES.md", "subdir": "docs",
        "must_contain": ["per issue: description", "severity (Critical/High/Low/Tech Debt)", "location",
                         "workaround if any", "date introduced (SESSION_LOG ref)"],
        "quality_bar": "Nothing too small to list; mark resolved 'Fixed [date]' and retain 30 days before removal.",
        "update_trigger": "Every build session — add new, mark resolved.",
    },
    {
        "name": "ENV_AND_CONFIG.md", "subdir": "docs",
        "must_contain": ["per variable: NAME only (never the value)", "what it does", "required/optional",
                         "environments (local/staging/production)", "where to obtain it"],
        "quality_bar": "A new dev can build a complete .env from this alone; NEVER include values — names only.",
        "update_trigger": "Any new/removed integration or configuration change.",
    },
    {
        "name": "SESSION_LOG.md", "subdir": "docs",
        "must_contain": ["per entry: date", "what was attempted", "what was completed",
                         "files/routes/schema changed", "issues introduced", "first task for next session"],
        "quality_bar": "Written at the end of EVERY session; specific & actionable — never 'did some work on auth'.",
        "update_trigger": "End of every single build session — mandatory.",
    },
    {
        "name": "DEPLOYMENT.md", "subdir": "docs",
        "must_contain": ["prerequisites (Node version, env vars, global deps)", "run locally (exact commands)",
                         "run the test suite", "deploy to staging", "deploy to production", "rollback procedure"],
        "quality_bar": "A deploy to any environment is possible from this doc alone; commands exact and current.",
        "update_trigger": "When the build, test, or deployment process changes.",
    },
]

# Note: the 12th document — the GLOBAL ~/.claude/CLAUDE.md — is intentionally
# NOT managed here. It is personal, not committed, and spans every project, so
# it must never be rewritten by a per-project script.

# ---------------------------------------------------------------------------
# App review — "review what exists in the application"
# ---------------------------------------------------------------------------

SCHEMA_GLOBS = ("schema.prisma", "*.sql", "migrations", "schema.rb")
MANIFESTS = ("package.json", "requirements.txt", "pyproject.toml", "go.mod",
             "Cargo.toml", "composer.json", "Gemfile")
MAX_MANIFEST_CHARS = 4000
MAX_AUDIT_CHARS = 24000


def _run(cmd: list[str], cwd: Path) -> str:
    """Run a read-only command; return stdout or a '[skipped: ...]' marker."""
    try:
        return subprocess.run(
            cmd, cwd=cwd, capture_output=True, text=True, timeout=30,
        ).stdout.strip()
    except Exception as exc:  # noqa: BLE001 — best-effort audit, never fatal
        return f"[skipped: {' '.join(cmd)} — {exc}]"


def _git_short_sha(root: Path) -> str:
    """Short HEAD sha of the project, or 'unknown' outside a repo."""
    sha = _run(["git", "rev-parse", "--short", "HEAD"], root)
    return sha if sha and not sha.startswith("[skipped") else "unknown"


def _resolve_repo_root(repo):
    """A local path -> itself; a git URL -> a cached shallow clone. None on failure.

    Mirrors standards_report.py's gold-root resolution so --repo accepts either a
    sibling clone or a canonical GitHub URL.
    """
    if not repo:
        return None
    p = Path(repo).expanduser()
    if p.exists():
        return p.resolve()
    if "://" in str(repo) or str(repo).endswith(".git"):
        import tempfile
        cache = Path(tempfile.gettempdir()) / (
            "cfai_gs_" + hashlib.sha256(str(repo).encode()).hexdigest()[:12]
        )
        if not cache.exists():
            out = _run(["git", "clone", "--depth", "1", str(repo), str(cache)], Path.cwd())
            if out.startswith("[skipped") or not cache.exists():
                return None
        return cache
    return None


def review_app(root: Path) -> str:
    """Produce a compact, model-friendly audit of what exists in the app.

    Pure read-only: git history, changed-file stats, tracked file list,
    dependency manifests, and any schema files. This is the evidence the
    model uses to update each doc against reality.
    """
    parts: list[str] = []

    parts.append("### Recent git history\n" + (_run(["git", "log", "--oneline", "-n", "30"], root) or "(no git history)"))
    parts.append("### Files changed in the last commit\n" + (_run(["git", "diff", "--stat", "HEAD~1..HEAD"], root) or "(none)"))

    tracked = _run(["git", "ls-files"], root)
    if tracked and not tracked.startswith("[skipped"):
        files = tracked.splitlines()
        listing = "\n".join(files[:400])
        if len(files) > 400:
            listing += f"\n… (+{len(files) - 400} more files)"
        parts.append(f"### Tracked files ({len(files)} total)\n{listing}")
    else:
        parts.append("### Tracked files\n" + tracked)

    for manifest in MANIFESTS:
        p = root / manifest
        if p.exists():
            parts.append(f"### {manifest}\n{p.read_text(encoding='utf-8', errors='replace')[:MAX_MANIFEST_CHARS]}")

    schema_hits: list[str] = []
    for pattern in SCHEMA_GLOBS:
        for hit in root.rglob(pattern):
            if hit.is_file() and "node_modules" not in hit.parts and ".venv" not in hit.parts:
                schema_hits.append(str(hit.relative_to(root)))
    if schema_hits:
        parts.append("### Schema / migration files detected\n" + "\n".join(sorted(set(schema_hits))[:50]))

    audit = "\n\n".join(parts)
    if len(audit) > MAX_AUDIT_CHARS:
        audit = audit[:MAX_AUDIT_CHARS] + "\n… (audit truncated)"
    return audit


# ---------------------------------------------------------------------------
# Prompt building (pure — exercised by --self-test)
# ---------------------------------------------------------------------------

def doc_path(root: Path, spec: DocSpec) -> Path:
    sub = spec["subdir"]
    return (root / spec["name"]) if sub == "." else (root / sub / spec["name"])


def build_prompt(spec: DocSpec, current: str, audit: str) -> str:
    """Build the per-doc update prompt. Pure function — no I/O."""
    must = "\n".join(f"  - {m}" for m in spec["must_contain"])
    return (
        f"You are the documentation maintainer for a CFAI project. Update the "
        f"file `{spec['name']}` so it reflects the CURRENT state of the application.\n\n"
        f"## What this document must contain\n{must}\n\n"
        f"## Quality bar\n{spec['quality_bar']}\n\n"
        f"## Update trigger\n{spec['update_trigger']}\n\n"
        f"## Current file content\n"
        f"{current if current.strip() else '(file does not exist yet — create it from scratch)'}\n\n"
        f"## Audit of what exists in the application\n{audit}\n\n"
        f"## Output rules\n"
        f"- Output the COMPLETE new Markdown content of `{spec['name']}` only.\n"
        f"- No preamble, no explanation, no surrounding code fences.\n"
        f"- Preserve still-accurate existing content; correct anything that has drifted.\n"
        f"- If you cannot determine something from the audit, write 'Unknown' — never guess.\n"
        f"- ENV_AND_CONFIG must list variable NAMES only — never real values or secrets.\n"
    )


def strip_fences(text: str) -> str:
    """Remove a single wrapping ```markdown ... ``` fence if the model added one."""
    t = text.strip()
    t = re.sub(r"^```(?:markdown|md)?\s*\n", "", t)
    t = re.sub(r"\n```\s*$", "", t)
    return t.strip() + "\n"


# ---------------------------------------------------------------------------
# Modular backlog (all pure functions — exercised by --self-test)
# ---------------------------------------------------------------------------

def derive_code(name: str) -> str:
    """Derive a short uppercase group code from a feature-group name.

    Multi-word names use initials (Authentication & Access -> AA); single-word
    names use the first 3 letters (Payments -> PAY). Override with --code when
    the derived value isn't what you want. Always >= 2 chars.
    """
    words = [w for w in re.split(r"[^A-Za-z0-9]+", name) if w]
    if not words:
        return "GRP"
    if len(words) == 1:
        return words[0][:3].upper()
    code = "".join(w[0] for w in words).upper()
    return code if len(code) >= 2 else (words[0][:3].upper())


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "group"


def item_completion(item: dict) -> int:
    """Effective completion % for an item: explicit value, else 100 if DONE else 0."""
    if item.get("completion") is not None:
        return max(0, min(100, item["completion"]))
    return 100 if item["status"] in DONE_STATUSES else 0


def parse_backlog_group(text: str) -> dict:
    """Parse a child backlog doc into group metadata + items. Pure.

    Reads the leading <!-- BACKLOG_GROUP ... --> block and every '### CODE-NNN'
    item, pulling each item's Status, Completion and Effort from its Field|Value
    table. Each item -> {"id", "status", "completion", "effort"} (completion and
    effort may be None). The group's "class" is 'feature' (default) or 'debt'.
    """
    meta: dict = {}
    m = re.search(r"<!--\s*BACKLOG_GROUP\s+(.*?)-->", text, re.DOTALL)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                key, _, val = line.partition(":")
                meta[key.strip().lower()] = val.strip()

    items: list[dict] = []
    for block in re.split(r"^###\s+", text, flags=re.MULTILINE)[1:]:
        head = block.splitlines()[0].strip()
        idm = re.match(r"([A-Z][A-Z0-9]*-\d+)", head)
        if not idm:
            continue
        sm = re.search(r"Status\s*\|\s*`?\s*([A-Za-z_]+)", block)
        status = (sm.group(1).upper() if sm else "BACKLOG")
        cm = re.search(r"Completion\s*\|\s*`?\s*(\d+)\s*%?", block)
        completion = int(cm.group(1)) if cm else None
        em = re.search(r"Effort\s*\|\s*`?\s*([A-Za-z]+)", block)
        effort = em.group(1).upper() if em else None
        items.append({"id": idm.group(1), "status": status,
                      "completion": completion, "effort": effort})

    # An unrecognized class fails safe to 'feature': never silently hide work from
    # the coverage number. backlog_integrity_warnings() surfaces the typo instead.
    raw_class = (meta.get("class") or FEATURE_CLASS).strip().lower()
    return {
        "code": meta.get("code", ""),
        "name": meta.get("name", ""),
        "status": meta.get("status", ""),
        "priority": meta.get("priority", ""),
        "owner": meta.get("owner", ""),
        "class": raw_class if raw_class in KNOWN_CLASSES else FEATURE_CLASS,
        "raw_class": raw_class,
        "items": items,
    }


def _pct(values: list[int]) -> int:
    """Mean of a list of percentages, rounded; 0 for an empty list."""
    return round(sum(values) / len(values)) if values else 0


def item_points(item: dict) -> int:
    """Story points for an item's Effort; DEFAULT_EFFORT_POINTS when absent/unknown."""
    return EFFORT_POINTS.get((item.get("effort") or "").upper(), DEFAULT_EFFORT_POINTS)


def weighted_pct(items: list[dict]) -> int:
    """Effort-weighted mean completion: Σ(completionᵢ × pointsᵢ) ÷ Σ(pointsᵢ). Pure.

    Equals _pct() when every item carries the same weight, so a backlog with no
    Effort fields rolls up exactly as it did before weighting existed.
    """
    denominator = sum(item_points(it) for it in items)
    if not denominator:
        return 0
    return round(sum(item_completion(it) * item_points(it) for it in items) / denominator)


def backlog_integrity_warnings(groups: list[dict]) -> list[str]:
    """Deterministic data-quality gates for the backlog. Pure.

    Catches the two failure modes weighting and segmentation introduce: a group
    whose class is misspelled (silently counted as a feature) and an item whose
    Effort cannot be weighted (silently defaulted to M).
    """
    warnings: list[str] = []
    for g in groups:
        raw = g.get("raw_class", g.get("class", FEATURE_CLASS))
        if raw not in KNOWN_CLASSES:
            warnings.append(
                f"{g.get('file', g.get('code', '?'))}: unknown class '{raw}' — counted as "
                f"'{FEATURE_CLASS}'. Use one of: {', '.join(KNOWN_CLASSES)}."
            )
        for it in g["items"]:
            effort = it.get("effort")
            if effort is not None and effort.upper() not in EFFORT_POINTS:
                warnings.append(
                    f"{g.get('file', '?')}: item {it['id']} has unparseable Effort "
                    f"'{effort}' — weighted as M. Use one of: {', '.join(EFFORT_POINTS)}."
                )
    return warnings


def _group_row(g: dict) -> str:
    items = g["items"]
    n = len(items)
    done = sum(1 for it in items if it["status"] in DONE_STATUSES)
    pct = _pct([item_completion(it) for it in items])
    wpct = weighted_pct(items)
    link = f"[{g['file']}](./{g['file']})"
    return (
        f"| {g['name'] or g['file']} | {g['code']} | {g['status'] or '—'} | "
        f"{g['priority'] or '—'} | {n} | {n - done} | {done} | {pct}% | {wpct}% | "
        f"{g['owner'] or '—'} | {link} |"
    )


def build_master_backlog(groups: list[dict], generated_on: str | None = None) -> str:
    """Build the parent MASTER_BACKLOG.md from parsed children. Pure.

    Feature coverage and tech-debt burndown are reported as two separate numbers
    and never pooled: audit-filed debt items must not drag down the coverage %,
    or the team is punished for running the modularity audit.
    """
    feat_groups = [g for g in groups if g.get("class", FEATURE_CLASS) != DEBT_CLASS]
    debt_groups = [g for g in groups if g.get("class", FEATURE_CLASS) == DEBT_CLASS]
    feat_items = [it for g in feat_groups for it in g["items"]]
    debt_items = [it for g in debt_groups for it in g["items"]]

    total_items = len(feat_items)
    total_done = sum(1 for it in feat_items if it["status"] in DONE_STATUSES)
    feat_plain = _pct([item_completion(it) for it in feat_items])
    feat_weighted = weighted_pct(feat_items)

    out: list[str] = []
    out.append("# Master Backlog\n")
    out.append("> **Auto-generated** by `docs_update.py --backlog`. Do NOT edit by hand — "
               "edit the per-group child docs, then re-run the script to refresh this index."
               + (f" Generated {generated_on}." if generated_on else ""))
    out.append(f"\n## Overall Coverage: {feat_plain}% complete\n")
    out.append(f"- **Feature groups:** {len(feat_groups)}"
               + (f"  ·  **Debt groups:** {len(debt_groups)}" if debt_groups else ""))
    out.append(f"- **Items:** {total_items}  (done **{total_done}**, open **{total_items - total_done}**)")
    out.append(f"- **Feature coverage:** **{feat_weighted}% effort-weighted**  ·  "
               f"{feat_plain}% plain mean  `{_bar(feat_weighted)}`")
    if abs(feat_weighted - feat_plain) > 10:
        out.append(f"  - ⚠ **{feat_plain}% of items done, but {feat_weighted}% of the weighted "
                   f"work** — report both; the plain mean flatters a backlog of small wins.")
    if debt_groups:
        debt_done = sum(1 for it in debt_items if it["status"] in DONE_STATUSES)
        out.append(f"- **Tech-debt burndown** (tracked separately — **NOT in coverage**): "
                   f"{weighted_pct(debt_items)}% across {len(debt_items)} items (done {debt_done}).")
    out.append("")

    out.append("## Feature Groups\n")
    out.append("| Group | Code | Status | Priority | Items | Open | Done | Completion | Weighted | Owner | Doc |")
    out.append("|---|---|---|---|---|---|---|---|---|---|---|")
    for g in feat_groups:
        out.append(_group_row(g))
    if not feat_groups:
        out.append("| _(no feature groups yet — run `docs_update.py --new-group \"Name\"`)_ |  |  |  |  |  |  |  |  |  |  |")

    if debt_groups:
        out.append("\n## Tech-Debt / Non-Feature Groups\n")
        out.append("> Burndown only — **excluded from the coverage number above**. Filed by "
                   "`module-audit.py --file-backlog`; closed automatically when the code passes the rubric.")
        out.append("")
        out.append("| Group | Code | Status | Priority | Items | Open | Done | Completion | Weighted | Owner | Doc |")
        out.append("|---|---|---|---|---|---|---|---|---|---|---|")
        for g in debt_groups:
            out.append(_group_row(g))

    out.append("\n## Status Definitions\n")
    out.append("| Status | Meaning |\n|---|---|")
    for s in BACKLOG_STATUSES:
        out.append(f"| `{s}` | {('done & verified' if s in DONE_STATUSES else 'in flight / planned')} |")
    return "\n".join(out) + "\n"


def _bar(pct: int, width: int = 20) -> str:
    """Simple text progress bar, e.g. ████████░░░░░░░░░░░░."""
    filled = round(pct / 100 * width)
    return "█" * filled + "░" * (width - filled)


def scaffold_group(name: str, code: str, added: str = "YYYY-MM-DD",
                   cls: str = FEATURE_CLASS) -> str:
    """Render a new child backlog doc with a BACKLOG_GROUP header and one
    fully-populated example item using the canonical field schema. Pure."""
    return (
        f"<!-- BACKLOG_GROUP\n"
        f"code: {code}\n"
        f"name: {name}\n"
        f"status: Active\n"
        f"priority: P2\n"
        f"owner: \n"
        f"class: {cls}\n"
        f"-->\n\n"
        f"# {name} — Backlog\n\n"
        f"> **Back to:** [Master Backlog](./{BACKLOG_INDEX})\n\n"
        f"## Scope\n\n_What this feature group covers._\n\n"
        f"## Backlog Items\n\n"
        f"### {code}-001\n"
        f"**Short title**\n\n"
        f"| Field | Value |\n|---|---|\n"
        f"| Status | `BACKLOG` |\n"
        f"| Completion | `0%` |\n"
        f"| Priority | `P2 - Medium` |\n"
        f"| Effort | `M` |\n"
        f"| Added | `{added}` |\n"
        f"| Updated | `{added}` |\n"
        f"| Target | `—` |\n"
        f"| Owner | `@owner` |\n"
        f"| Linked Personas | `—` |\n"
        f"| Depends On | `—` |\n\n"
        f"**Description**\n_What and why._\n\n"
        f"**Success Criteria**\n- [ ] _Measurable, testable outcome_\n\n"
        f"**Related Items**\n- _none yet_\n\n"
        f"**Code Location** (once built)\n- _path / route_\n\n"
        f"**Notes / Risks**\n- _none_\n"
    )


def read_backlog_groups(root: Path) -> list[dict]:
    """Parse every child backlog doc under docs/backlog/ (excluding the index)."""
    bdir = root / BACKLOG_DIRNAME
    groups: list[dict] = []
    if not bdir.exists():
        return groups
    for f in sorted(bdir.glob("*.md")):
        if f.name == BACKLOG_INDEX:
            continue
        g = parse_backlog_group(f.read_text(encoding="utf-8"))
        g["file"] = f.name
        if not g["code"]:
            g["code"] = derive_code(g["name"] or f.stem)
        groups.append(g)
    return groups


def cmd_backlog(root: Path, dry_run: bool) -> int:
    """Rebuild MASTER_BACKLOG.md from the child docs. Deterministic; no model."""
    groups = read_backlog_groups(root)
    index = build_master_backlog(groups, generated_on=date.today().isoformat())
    target = root / BACKLOG_DIRNAME / BACKLOG_INDEX
    print(f"Backlog groups found: {len(groups)} ({', '.join(g['file'] for g in groups) or 'none'})")
    if dry_run:
        print(f"[DRY] would write {target} ({len(index)} chars)")
        return 0
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(index, encoding="utf-8")
    print(f"wrote {target.relative_to(root)} ({len(groups)} groups indexed)")
    return 0


def cmd_new_group(root: Path, name: str, code: str | None, dry_run: bool) -> int:
    """Scaffold a new feature-group child doc, then reindex the parent."""
    code = (code or derive_code(name)).upper()
    child = root / BACKLOG_DIRNAME / f"{slugify(name)}.md"
    if child.exists():
        print(f"ERROR: {child.relative_to(root)} already exists — not overwriting.")
        return 1
    content = scaffold_group(name, code, added=date.today().isoformat())
    if dry_run:
        print(f"[DRY] would create {child} (code {code}, {len(content)} chars) and reindex parent")
        return 0
    child.parent.mkdir(parents=True, exist_ok=True)
    child.write_text(content, encoding="utf-8")
    print(f"created {child.relative_to(root)} (code {code})")
    return cmd_backlog(root, dry_run=False)


# ---------------------------------------------------------------------------
# Model call (streaming, mirrors toolkit/adopt.py)
# ---------------------------------------------------------------------------

def call_claude(prompt: str) -> str:
    proc = subprocess.Popen(
        [
            "claude", "-p", prompt,
            *model_flags("CFAI_UPDATE_MODEL"),
            *CLAUDE_ISOLATION,
            "--tools", "",                     # load-bearing: prevents tool-prompt stalls
            "--output-format", "stream-json",
            "--include-partial-messages",
            "--verbose",
        ],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        stdin=subprocess.DEVNULL,
    )

    final_text = ""
    last_printed_len = 0
    for line in proc.stdout:
        line = line.strip()
        if not line:
            continue
        try:
            event = json.loads(line)
            etype = event.get("type")
            if etype == "assistant":
                for block in event.get("message", {}).get("content", []):
                    if block.get("type") == "text":
                        current_text = block.get("text", "")
                        new_part = current_text[last_printed_len:]
                        if new_part:
                            print(new_part, end="", flush=True)
                            last_printed_len = len(current_text)
                        final_text = current_text
            elif etype == "result":
                result_val = event.get("result", "")
                if result_val and not final_text:
                    final_text = result_val
        except json.JSONDecodeError:
            pass

    proc.wait()
    if proc.returncode != 0:
        sys.exit(f"ERROR: claude CLI failed:\n{proc.stderr.read()}")
    return final_text


# ---------------------------------------------------------------------------
# Learnings log (F3) — dedicated novelty-filtering updater
# ---------------------------------------------------------------------------

def scaffold_learnings() -> str:
    """Initial LEARNINGS_LOG.md — banner + the 7 category headings. Pure."""
    lines = [
        "# Learnings Log",
        "",
        "> Abstracted **software-engineering** learnings from building this project — patterns, "
        "abstractions, and gotchas worth replicating in OTHER projects, NOT domain/business "
        "context. Refreshed by `docs_update.py` (novelty-filtered — prior entries preserved). "
        "Each learning is a `### Title` under a category.",
        "",
    ]
    for c in LEARNING_CATEGORIES:
        lines.append(f"## {c}")
        if c == "Gotchas":
            lines.append('_Format: **"symptom"** — cause / fix / prevention._')
        elif c.startswith("Promotion"):
            lines.append("_Auto-generated index of nuggets flagged for the CFAI standards "
                         "repo. Export with `docs_update.py --propose --repo <gold>`; pull "
                         "verdicts back on the next `--learnings --repo <gold>` run._")
        lines.append("")
    return "\n".join(lines) + "\n"


def parse_existing_learnings(markdown: str) -> dict:
    """Map each learning category -> its list of '### Title' entry titles. Pure."""
    result: dict = {}
    current = None
    for line in markdown.splitlines():
        if line.startswith("## "):
            head = line[3:].strip()
            current = head if head in LEARNING_CATEGORIES else None
            if current:
                result.setdefault(current, [])
        elif line.startswith("### ") and current:
            # Key on the clean title, marker-stripped, so status changes between
            # runs never look like a new/dropped entry to the novelty filter or
            # the regression guard.
            result[current].append(split_nugget_heading(line)[0])
    return result


def learning_skiplist(parsed: dict, max_items: int = 200) -> list:
    """Flatten already-captured entry titles — the novelty filter. Pure."""
    titles = [t for entries in parsed.values() for t in entries]
    return titles[:max_items]


def build_learnings_prompt(existing: str, audit: str, skiplist: list, categories) -> str:
    """Bespoke append/refresh prompt (novelty-filtered, abstracted-only). Pure."""
    skip = "\n".join(f"- {t}" for t in skiplist) or "(none yet)"
    cats = "\n".join(f"- {c}" for c in categories)
    return f"""\
You maintain a project's LEARNINGS LOG — a record of ABSTRACTED software-engineering
learnings (how this app was built in pure software terms: patterns, abstractions,
testing, tooling, gotchas worth replicating in OTHER projects). This is NOT domain or
business context — do not record product, feature, or business facts.

Use exactly these H2 category headings:
{cats}

Rules:
- ADD only NEW learnings not already captured. Preserve every existing entry byte-for-byte,
  INCLUDING any '<!-- NUG-xxxx status:... -->' marker on its heading — never edit those.
- Each learning is a '### Short title' under the right category, then 1-3 lines.
- For each NEW learning, judge whether it is general enough to become a CFAI standard and
  append EXACTLY ONE provisional marker to its heading:
    '<!-- status:candidate -->'  if it would help OTHER projects (promote it), or
    '<!-- status:local-only -->' if it is specific to this project.
  Do NOT invent a NUG id and do NOT use any other status — ids and verdicts are assigned by
  the tooling, not by you.
- Gotchas use the schema: **"symptom"** — cause / fix / prevention.
- Leave the "Promotion Candidates → CFAI Standard" section exactly as-is — it is regenerated
  automatically from the candidate flags.
- If nothing new is worth adding, return the existing document unchanged.

ALREADY CAPTURED (skip — do not repeat):
{skip}

CURRENT LEARNINGS LOG:
{existing}

PROJECT EVIDENCE (recent changes / structure):
{audit}

Output the COMPLETE updated LEARNINGS_LOG.md — no fences, no preamble.
"""


def guard_no_regression(existing: str, new: str) -> bool:
    """True iff every prior clean entry title still appears in `new`. Pure.

    Compares marker-stripped titles on both sides, so a status/id change is not
    mistaken for a dropped entry.
    """
    new_titles = {n["title"] for n in collect_nuggets(new)}
    for entries in parse_existing_learnings(existing).values():
        for title in entries:
            if title not in new_titles:
                return False
    return True


# ---------------------------------------------------------------------------
# Nugget layer — every learning carries a stable id + an owned status, and the
# "Promotion Candidates" flow that carries a nugget back to the CFAI standards
# repo for approve/reject review. See project-init/learnings-to-proposal-reckoner.md.
#
# States: new -> candidate | local-only -> submitted -> approved | rejected
#   new         model captured it, unflagged
#   candidate   model judged it general enough to become a standard
#   local-only  model judged it project-specific
#   submitted   exported to the standards repo as a proposal
#   approved    reviewed upstream, became/extended a standard
#   rejected    reviewed upstream, declined (permanent — never re-proposed)
#
# Python owns the status field, never the model: on refresh, a pre-existing
# entry keeps its prior id + status; the model may only assign a provisional
# candidate/local-only to genuinely new entries (mirrors the rubric-owns-grade
# rule in module-audit.py). `--propose` is the ONLY writer of `submitted`.
# ---------------------------------------------------------------------------

NUGGET_STATUSES = ("new", "candidate", "local-only", "submitted", "approved", "rejected")
# Statuses the model is allowed to propose for a brand-new entry. Anything else
# (or an absent marker) collapses to "new" — the model cannot forge a verdict.
MODEL_ASSIGNABLE = ("candidate", "local-only")
# Statuses that make a nugget a live promotion candidate (shown in the index).
PROMOTABLE = ("candidate", "submitted", "approved")

PROMOTION_HEADING = "Promotion Candidates → CFAI Standard"
PROMOTION_INDEX_OPEN = "<!-- CFAI_PROMOTION_INDEX -->"
PROMOTION_INDEX_CLOSE = "<!-- /CFAI_PROMOTION_INDEX -->"

# Marker on a nugget's ### heading. id is optional (the model never invents one).
_NUGGET_MARKER_RE = re.compile(
    r"\s*<!--\s*(?:(NUG-[0-9a-f]{4,})\s+)?status:([a-z-]+)\s*-->\s*$"
)


def make_nugget_id(project_slug: str, title: str) -> str:
    """Stable 'NUG-xxxx' id from project slug + clean title. Pure.

    Safe because guard_no_regression() forces clean titles to survive
    byte-for-byte, so a title-derived id is stable across refreshes; the project
    slug prevents cross-project collisions.
    """
    digest = hashlib.sha256(f"{project_slug}::{title}".encode("utf-8")).hexdigest()
    return f"NUG-{digest[:4]}"


def build_nugget_marker(nugget_id: str, status: str) -> str:
    """The HTML-comment marker appended to a nugget's ### heading. Pure."""
    return f"<!-- {nugget_id} status:{status} -->"


def split_nugget_heading(line: str):
    """('### <title> <marker>') -> (clean_title, id_or_None, status_or_None). Pure.

    A non-heading line yields (stripped_line, None, None). Marker-tolerant: the
    id may be absent (model-provisional markers carry only a status).
    """
    body = line[4:] if line.startswith("### ") else line
    nid = status = None
    m = _NUGGET_MARKER_RE.search(body)
    if m:
        nid, status = m.group(1), m.group(2)
        body = body[: m.start()]
    return body.strip(), nid, status


def collect_nuggets(markdown: str) -> list:
    """Every ### learning as {id, title, status, category, body}. Pure.

    id/status default to a freshly-derived id and 'new' when the heading has no
    marker, so callers always get a usable record. The generated promotion index
    (list items, not ### headings) is skipped by construction.
    """
    out, category, pending = [], None, None
    body_lines: list = []

    def _flush():
        if pending is not None:
            pending["body"] = "\n".join(body_lines).strip()
            out.append(pending)

    for line in markdown.splitlines():
        if line.startswith("## "):
            _flush()
            pending, body_lines = None, []
            category = line[3:].strip()
        elif line.startswith("### "):
            _flush()
            body_lines = []
            title, nid, status = split_nugget_heading(line)
            pending = {
                "id": nid or make_nugget_id("", title),
                "title": title,
                "status": status if status in NUGGET_STATUSES else "new",
                "category": category,
            }
        elif pending is not None:
            body_lines.append(line)
    _flush()
    return out


def reconcile_nugget_statuses(new_md: str, prior_nuggets, project_slug: str) -> str:
    """Rewrite model output so every ### heading carries a stable id + owned status.

    prior_nuggets: the pre-refresh nugget list (from collect_nuggets), used to
    look up prior id + status by clean title. Pure.

    - Existing entry (clean title matched): re-stamp the prior id + prior status,
      discarding whatever marker the model emitted — the model cannot move a
      nugget's status once it exists.
    - New entry: mint a project-scoped id; keep the model's provisional status
      iff it is candidate/local-only, else 'new'. The model cannot forge a
      verdict (submitted/approved/rejected) on a brand-new entry.
    """
    prior = {n["title"]: n for n in (prior_nuggets or [])}
    lines = []
    for line in new_md.splitlines():
        if line.startswith("### "):
            title, _mid, mstatus = split_nugget_heading(line)
            if title in prior:
                nid = prior[title]["id"]
                status = prior[title]["status"]
            else:
                nid = make_nugget_id(project_slug, title)
                status = mstatus if mstatus in MODEL_ASSIGNABLE else "new"
            lines.append(f"### {title} {build_nugget_marker(nid, status)}")
        else:
            lines.append(line)
    return "\n".join(lines) + ("\n" if new_md.endswith("\n") else "")


def upsert_promotion_index(markdown: str, nuggets) -> str:
    """Regenerate the marker-confined promotion index under the Promotion heading.

    Additive and idempotent: replaces only the region between
    PROMOTION_INDEX_OPEN/CLOSE (inserting it right after the heading the first
    time), so hand-authored entries under the heading are preserved. Pure.
    """
    rows = [n for n in nuggets if n["status"] in PROMOTABLE]
    block = [PROMOTION_INDEX_OPEN,
             "_Auto-generated from nugget flags — do not edit by hand._", ""]
    if rows:
        for n in sorted(rows, key=lambda n: (n["status"], n["id"])):
            block.append(f"- `{n['id']}` **{n['title']}** — _{n['status']}_ "
                         f"({n['category']})")
    else:
        block.append("_No promotion candidates yet._")
    block.append(PROMOTION_INDEX_CLOSE)
    block_text = "\n".join(block)

    lines = markdown.splitlines()
    # Drop any existing index region first.
    if PROMOTION_INDEX_OPEN in markdown and PROMOTION_INDEX_CLOSE in markdown:
        start = next(i for i, l in enumerate(lines) if l.strip() == PROMOTION_INDEX_OPEN)
        end = next(i for i, l in enumerate(lines) if l.strip() == PROMOTION_INDEX_CLOSE)
        lines = lines[:start] + lines[end + 1:]
    # Find the promotion heading; if absent, append the section.
    hidx = next((i for i, l in enumerate(lines)
                 if l.startswith("## ") and l[3:].strip() == PROMOTION_HEADING), None)
    if hidx is None:
        tail = lines + ["", f"## {PROMOTION_HEADING}", block_text]
        return "\n".join(tail) + "\n"
    lines = lines[:hidx + 1] + [block_text] + lines[hidx + 1:]
    return "\n".join(lines) + ("\n" if markdown.endswith("\n") else "")


def exportable_nuggets(nuggets) -> list:
    """The nuggets a `--propose` run may export — candidates only. Pure.

    Rejection permanence falls out of this: a rejected nugget is status:rejected,
    never candidate, so it can never be re-proposed.
    """
    return [n for n in nuggets if n["status"] == "candidate"]


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "untitled"


def build_proposal_file(nugget, project_slug: str, source_commit: str,
                        proposed_on: str):
    """(filename, content) for one exported nugget proposal. Pure."""
    fname = f"{nugget['id']}-{_slug(nugget['title'])[:48]}.md"
    front = "\n".join([
        "<!-- CFAI_PROPOSAL",
        f"id: {nugget['id']}",
        f"source_project: {project_slug}",
        f"source_commit: {source_commit}",
        f"category: {nugget['category']}",
        f"proposed_at: {proposed_on}",
        "status: proposed",
        "-->",
    ])
    content = (
        f"{front}\n\n"
        f"# {nugget['id']} — {nugget['title']}\n\n"
        f"**Source:** `{project_slug}` @ `{source_commit}` · "
        f"**Category:** {nugget['category']}\n\n"
        f"{nugget['body']}\n\n"
        "---\n\n"
        "## Review (fill in on approve/reject)\n\n"
        "- **Verdict:** _proposed_\n"
        "- **Target standard:** _new `discipline/…` | extend `path/to/guide.md`_\n"
        "- **Reason (if rejected):** _n/a_\n"
    )
    return fname, content


def mark_submitted(markdown: str, ids) -> str:
    """Stamp the given nugget ids to status:submitted in place. Pure."""
    ids = set(ids)
    lines = []
    for line in markdown.splitlines():
        if line.startswith("### "):
            title, nid, _status = split_nugget_heading(line)
            if nid in ids:
                lines.append(f"### {title} {build_nugget_marker(nid, 'submitted')}")
                continue
        lines.append(line)
    return "\n".join(lines) + ("\n" if markdown.endswith("\n") else "")


def verdict_from_dir(dirname: str):
    """Map a proposals/ subdirectory to the status it confers. Pure."""
    return {"accepted": "approved", "rejected": "rejected"}.get(dirname)


def apply_verdicts(markdown: str, verdicts) -> str:
    """Stamp nuggets with upstream verdicts ({id: 'approved'|'rejected'}). Pure."""
    lines = []
    for line in markdown.splitlines():
        if line.startswith("### "):
            title, nid, status = split_nugget_heading(line)
            if nid in verdicts:
                lines.append(f"### {title} {build_nugget_marker(nid, verdicts[nid])}")
                continue
        lines.append(line)
    return "\n".join(lines) + ("\n" if markdown.endswith("\n") else "")


def project_slug(root: Path) -> str:
    """Stable slug identifying the project — mixed into every nugget id. Pure."""
    return _slug(root.name)


def promote_legacy_candidates(prior_nuggets) -> list:
    """Flip unflagged entries sitting under the Promotion heading to 'candidate'.

    One-time migration for logs authored before the nugget layer: they filed
    promotion-worthy learnings *under the heading* instead of via a flag. Pure.
    """
    out = []
    for n in prior_nuggets:
        if n["category"] == PROMOTION_HEADING and n["status"] == "new":
            out.append({**n, "status": "candidate"})
        else:
            out.append(n)
    return out


def finalize_learnings(base: str, prior_source: str, slug: str, verdicts) -> str:
    """Stamp ids/statuses, apply upstream verdicts, regenerate the index. Pure.

    base:         the content to finalize (model refresh, or the existing doc).
    prior_source: the pre-refresh doc, read for prior ids/statuses.
    verdicts:     {id: 'approved'|'rejected'} pulled from the standards repo (or {}).
    """
    prior = promote_legacy_candidates(collect_nuggets(prior_source))
    out = reconcile_nugget_statuses(base, prior, slug)
    if verdicts:
        out = apply_verdicts(out, verdicts)
    return upsert_promotion_index(out, collect_nuggets(out))


def _proposal_id(path: Path):
    """The NUG id of a proposal file — frontmatter 'id:' or filename prefix. Pure."""
    m = re.match(r"(NUG-[0-9a-f]{4,})", path.name)
    if m:
        return m.group(1)
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            fm = re.match(r"\s*id:\s*(NUG-[0-9a-f]{4,})\s*$", line)
            if fm:
                return fm.group(1)
    except OSError:
        pass
    return None


def read_verdicts(repo_root: Path) -> dict:
    """Scan <repo>/proposals/{accepted,rejected}/NUG-*.md -> {id: status}."""
    verdicts: dict = {}
    base = repo_root / "proposals"
    for sub in ("accepted", "rejected"):
        status = verdict_from_dir(sub)
        d = base / sub
        if not d.is_dir():
            continue
        for f in sorted(d.glob("*.md")):
            nid = _proposal_id(f)
            if nid:
                verdicts[nid] = status
    return verdicts


def update_learnings(root: Path, audit: str, dry_run: bool, repo=None) -> None:
    """Refresh docs/LEARNINGS_LOG.md: novelty-filtered learnings + nugget stamps.

    When `repo` (a standards-repo path/URL) is given, upstream approve/reject
    verdicts are pulled in and stamped before the promotion index is rebuilt.
    """
    path = root / LEARNINGS_REL_PATH
    existing = path.read_text(encoding="utf-8") if path.exists() else scaffold_learnings()
    prompt = build_learnings_prompt(
        existing, audit, learning_skiplist(parse_existing_learnings(existing)),
        LEARNING_CATEGORIES,
    )
    if dry_run:
        note = f" (+verdict pull from {repo})" if repo else ""
        print(f"[DRY] would refresh {LEARNINGS_REL_PATH} (prompt {len(prompt)} chars){note}")
        return
    print(f"\n=== refreshing {LEARNINGS_REL_PATH} ===")
    new_content = strip_fences(call_claude(prompt))

    base = existing
    if not new_content.strip():
        print("  (no learnings output — finalizing existing)")
    elif not guard_no_regression(existing, new_content):
        print("  ⚠ model dropped prior entries — keeping existing, skipping this refresh")
    else:
        base = new_content

    verdicts = {}
    if repo:
        gold = _resolve_repo_root(repo)
        if gold:
            verdicts = read_verdicts(gold)
            print(f"  pulled {len(verdicts)} verdict(s) from {gold}/proposals")
        else:
            print(f"  ⚠ could not resolve --repo {repo!r} — skipping verdict pull")

    final = finalize_learnings(base, existing, project_slug(root), verdicts)
    if path.exists() and final == existing:
        print("  (no changes)")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(final, encoding="utf-8")
    print(f"  wrote {LEARNINGS_REL_PATH} ({len(final)} chars)")


def cmd_propose(root: Path, repo, dry_run: bool) -> int:
    """Export candidate nuggets as proposal files into the standards repo."""
    path = root / LEARNINGS_REL_PATH
    if not path.exists():
        sys.exit(f"ERROR: {LEARNINGS_REL_PATH} not found — run --learnings first.")
    if not repo:
        sys.exit("ERROR: --propose requires --repo <gold-standards path|URL>.")
    gold = _resolve_repo_root(repo)
    if not gold:
        sys.exit(f"ERROR: could not resolve --repo {repo!r}.")

    existing = path.read_text(encoding="utf-8")
    candidates = exportable_nuggets(collect_nuggets(existing))
    if not candidates:
        print("No candidate nuggets to propose. Flag learnings first (status:candidate).")
        return 0

    inbox = gold / "proposals" / "inbox"
    commit = _git_short_sha(root)
    today = date.today().isoformat()
    exported = []
    for n in candidates:
        fname, content = build_proposal_file(n, project_slug(root), commit, today)
        dest = inbox / fname
        if dry_run:
            print(f"[DRY] would write {dest}")
            continue
        inbox.mkdir(parents=True, exist_ok=True)
        dest.write_text(content, encoding="utf-8")
        print(f"  wrote {dest}")
        exported.append(n["id"])

    if dry_run:
        print(f"[DRY] would stamp {len(candidates)} nugget(s) submitted in {LEARNINGS_REL_PATH}")
        return 0
    if exported:
        path.write_text(mark_submitted(existing, set(exported)), encoding="utf-8")
        print(f"  stamped {len(exported)} nugget(s) submitted in {LEARNINGS_REL_PATH}")
    print(f"\nDone. {len(exported)} proposal(s) in {inbox}. Review them in the standards repo.")
    return 0


# ---------------------------------------------------------------------------
# Target selection
# ---------------------------------------------------------------------------

def select_targets(args) -> list[DocSpec]:
    if args.doc:
        wanted = args.doc if args.doc.endswith(".md") else f"{args.doc}.md"
        hits = [s for s in DOC_REGISTRY if s["name"] == wanted]
        if not hits:
            sys.exit(f"ERROR: '{wanted}' is not a registered doc. "
                     f"Known: {', '.join(s['name'] for s in DOC_REGISTRY)}")
        return hits
    if args.all or args.bootstrap:
        return list(DOC_REGISTRY)
    return [s for s in DOC_REGISTRY if s["name"] in SESSION_TRIO]


# ---------------------------------------------------------------------------
# Self-test (no model call, no writes)
# ---------------------------------------------------------------------------

def self_test() -> int:
    assert len(DOC_REGISTRY) == 11, f"expected 11 project-managed docs, got {len(DOC_REGISTRY)}"
    names = [s["name"] for s in DOC_REGISTRY]
    assert len(names) == len(set(names)), "duplicate doc names in registry"
    for s in DOC_REGISTRY:
        assert s["must_contain"] and s["quality_bar"] and s["update_trigger"], f"incomplete spec: {s['name']}"
        assert s["subdir"] in (".", "docs"), f"bad subdir for {s['name']}"
    for name in SESSION_TRIO:
        assert name in names, f"session trio member '{name}' missing from registry"
    # Prompt builder is pure and non-empty for every spec.
    for s in DOC_REGISTRY:
        p = build_prompt(s, current="", audit="(audit)")
        assert s["name"] in p and "Output rules" in p, f"prompt malformed for {s['name']}"
    # Fence stripper round-trips.
    assert strip_fences("```markdown\n# Hi\n```").strip() == "# Hi"

    # --- Modular backlog: code derivation, parsing, index build, scaffold ---
    assert derive_code("Payments") == "PAY"
    assert derive_code("Authentication & Access") == "AA"
    assert slugify("Authentication & Access") == "authentication-access"

    sample = scaffold_group("Authentication & Access", "AUTH")
    for token in ("<!-- BACKLOG_GROUP", "code: AUTH", "### AUTH-001",
                  "| Completion |", "| Added |", "| Owner |", "**Success Criteria**"):
        assert token in sample, f"scaffold missing {token!r}"

    # AUTH-001: explicit 0% / BACKLOG; AUTH-002: DONE, no Completion -> effective 100%.
    parsed = parse_backlog_group(
        sample + "\n### AUTH-002\n| Status | `DONE` |\n"
    )
    assert parsed["code"] == "AUTH" and parsed["name"] == "Authentication & Access"
    by_id = {it["id"]: it for it in parsed["items"]}
    assert by_id["AUTH-001"]["status"] == "BACKLOG" and by_id["AUTH-001"]["completion"] == 0
    assert by_id["AUTH-002"]["status"] == "DONE" and by_id["AUTH-002"]["completion"] is None
    assert item_completion(by_id["AUTH-002"]) == 100  # DONE with no explicit % -> 100
    assert item_completion(by_id["AUTH-001"]) == 0

    index = build_master_backlog([{**parsed, "file": "authentication-access.md"}],
                                 generated_on="2026-01-01")
    assert "Master Backlog" in index and "AUTH" in index and "Auto-generated" in index
    assert "| 2 | 1 | 1 | 50% |" in index, index           # items|open|done|completion
    assert "Overall Coverage: 50% complete" in index, index

    # --- Effort weighting: parse, points, formula, backward-compat invariant ---
    assert by_id["AUTH-001"]["effort"] == "M"             # from the scaffold template
    assert by_id["AUTH-002"]["effort"] is None            # no Effort row -> honest None
    assert item_points({"effort": None}) == DEFAULT_EFFORT_POINTS == 4
    assert item_points({"effort": "XS"}) == 1 and item_points({"effort": "XL"}) == 16
    assert weighted_pct([]) == 0
    skewed = [{"status": "DONE", "completion": 100, "effort": "XS"},
              {"status": "BACKLOG", "completion": 0, "effort": "XL"}]
    assert weighted_pct(skewed) == 6, weighted_pct(skewed)   # 100*1 / (1+16)
    assert _pct([item_completion(i) for i in skewed]) == 50   # the flattering number
    # Uniform weights => weighted == plain: an un-Efforted backlog rolls up unchanged.
    flat = [{"status": "DONE", "completion": 100, "effort": None},
            {"status": "BACKLOG", "completion": 0, "effort": None}]
    assert weighted_pct(flat) == _pct([item_completion(i) for i in flat])

    # --- Segmentation: debt never contaminates the feature coverage headline ---
    assert parse_backlog_group(sample)["class"] == FEATURE_CLASS   # default
    debt = parse_backlog_group(
        "<!-- BACKLOG_GROUP\ncode: MDT\nname: Debt\nclass: debt\n-->\n"
        "### MDT-001\n| Status | `BACKLOG` |\n| Completion | `0%` |\n"
    )
    assert debt["class"] == DEBT_CLASS, debt
    seg = build_master_backlog([{**parsed, "file": "auth.md"}, {**debt, "file": "debt.md"}])
    assert "Overall Coverage: 50% complete" in seg, seg    # not 33% — debt excluded
    assert "NOT in coverage" in seg and "Tech-Debt" in seg
    # An unknown class fails safe to feature, but must be reported, not swallowed.
    bad = parse_backlog_group("<!-- BACKLOG_GROUP\ncode: X\nclass: typo\n-->\n### X-001\n")
    assert bad["class"] == FEATURE_CLASS
    assert any("typo" in w for w in backlog_integrity_warnings([{**bad, "file": "x.md"}]))
    assert backlog_integrity_warnings([{**parsed, "file": "auth.md"}]) == []

    # --- Learnings log (F3): categories, scaffold, parse, skiplist, prompt, guard ---
    assert len(LEARNING_CATEGORIES) == 7
    scaffold = scaffold_learnings()
    for c in LEARNING_CATEGORIES:
        assert c in scaffold, f"scaffold missing category {c!r}"
    lsample = "## Gotchas\n### \"X\" — a/b/c\nbody\n"
    lparsed = parse_existing_learnings(lsample)
    assert lparsed.get("Gotchas") == ['"X" — a/b/c']
    assert '"X" — a/b/c' in learning_skiplist(lparsed)
    lprompt = build_learnings_prompt(lsample, "(audit)", learning_skiplist(lparsed), LEARNING_CATEGORIES)
    assert "abstract" in lprompt.lower() and "not domain" in lprompt.lower()
    assert guard_no_regression(lsample, lsample + "\n### new\nx\n")
    assert not guard_no_regression(lsample, "## Gotchas\n")

    # --- Nugget layer: id stability, status ownership, index, export, verdicts ---
    assert set(NUGGET_STATUSES) == {"new", "candidate", "local-only",
                                    "submitted", "approved", "rejected"}
    nid = make_nugget_id("proj", "A learning")
    assert nid == make_nugget_id("proj", "A learning") and nid.startswith("NUG-")
    assert make_nugget_id("proj", "A learning") != make_nugget_id("other", "A learning")
    ct, cid, cst = split_nugget_heading(f"### T {build_nugget_marker('NUG-abcd', 'candidate')}")
    assert (ct, cid, cst) == ("T", "NUG-abcd", "candidate")
    assert split_nugget_heading("### Bare") == ("Bare", None, None)
    # Python owns status: prior wins for existing; model can't forge on new.
    prior = collect_nuggets("## Gotchas\n### Kept <!-- NUG-7c21 status:approved -->\nb\n")
    rec = reconcile_nugget_statuses(
        "## Gotchas\n### Kept <!-- status:candidate -->\nb\n"
        "### Fresh <!-- status:approved -->\nb\n", prior, "proj")
    got = {t: (i, s) for t, i, s in
           (split_nugget_heading(l) for l in rec.splitlines() if l.startswith("### "))}
    assert got["Kept"] == ("NUG-7c21", "approved"), got     # prior wins
    assert got["Fresh"][1] == "new", got                    # forged verdict downgraded
    # Promotion index: only candidate/submitted/approved, marker-confined, idempotent.
    idx_md = "## Gotchas\n### C <!-- NUG-0001 status:candidate -->\nx\n"
    once = upsert_promotion_index(idx_md, collect_nuggets(idx_md))
    assert once == upsert_promotion_index(once, collect_nuggets(once))
    assert once.count(PROMOTION_INDEX_OPEN) == 1 and "NUG-0001" in once
    # Export + submit + verdicts.
    cand = collect_nuggets("## Gotchas\n### Ex <!-- NUG-aaaa status:candidate -->\nbody\n")
    assert [n["id"] for n in exportable_nuggets(cand)] == ["NUG-aaaa"]
    fn, body = build_proposal_file(cand[0], "proj", "abc1234", "2026-07-10")
    assert fn.startswith("NUG-aaaa") and "status: proposed" in body and "body" in body
    sub = mark_submitted("### Ex <!-- NUG-aaaa status:candidate -->\nx\n", {"NUG-aaaa"})
    assert split_nugget_heading(sub.splitlines()[0])[2] == "submitted"
    assert verdict_from_dir("accepted") == "approved" and verdict_from_dir("inbox") is None
    ver = apply_verdicts("### E <!-- NUG-aaaa status:submitted -->\nx\n", {"NUG-aaaa": "approved"})
    assert split_nugget_heading(ver.splitlines()[0])[2] == "approved"
    # Rejected can never be re-exported; legacy promotion entries auto-flag candidate.
    assert exportable_nuggets(collect_nuggets(
        "### R <!-- NUG-bbbb status:rejected -->\nx\n")) == []
    legacy = promote_legacy_candidates(collect_nuggets(
        f"## {PROMOTION_HEADING}\n### Old idea\nx\n"))
    assert legacy[0]["status"] == "candidate", legacy

    print(f"OK — {len(DOC_REGISTRY)} docs registered; session trio = {', '.join(SESSION_TRIO)}; "
          f"prompts build cleanly; backlog parser + feature/debt segmentation + "
          f"effort-weighted roll-up + learnings log + nugget promotion flow verified.")
    return 0


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description="Review the app and update the canonical 12 CFAI docs.")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--bootstrap", action="store_true", help="create only docs that don't exist yet")
    mode.add_argument("--all", action="store_true", help="update every doc in the registry")
    mode.add_argument("--doc", metavar="NAME", help="update a single doc by filename (e.g. DATA_MODEL.md)")
    mode.add_argument("--backlog", action="store_true",
                      help="rebuild docs/backlog/MASTER_BACKLOG.md from the child docs (no model call)")
    mode.add_argument("--new-group", metavar="NAME", dest="new_group",
                      help="scaffold a new feature-group backlog child, then reindex the parent")
    mode.add_argument("--learnings", action="store_true",
                      help="refresh docs/LEARNINGS_LOG.md only (abstracted SW-engineering learnings)")
    mode.add_argument("--propose", action="store_true",
                      help="export candidate nuggets as proposal files into --repo's proposals/inbox/")
    ap.add_argument("--repo", metavar="PATH|URL", default=None,
                    help="standards repo for --propose (export) or --learnings (pull approve/reject verdicts)")
    ap.add_argument("--code", metavar="CODE", help="explicit group code for --new-group (else derived)")
    ap.add_argument("--project", metavar="PATH", default=None,
                    help="project root (default: this script's directory)")
    ap.add_argument("--dry-run", action="store_true", help="preview targets + prompt sizes; no model call, no writes")
    ap.add_argument("--self-test", action="store_true", help="validate registry + prompt building; no model call")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    root = Path(args.project).resolve() if args.project else Path(__file__).resolve().parent
    if not root.exists():
        sys.exit(f"ERROR: project root not found: {root}")

    # Backlog modes are deterministic and never call the model — handle first.
    if args.new_group:
        return cmd_new_group(root, args.new_group, args.code, args.dry_run)
    if args.backlog:
        return cmd_backlog(root, args.dry_run)

    # Propose mode is deterministic (no model call) — export candidates upstream.
    if args.propose:
        print(f"Project root : {root}")
        return cmd_propose(root, args.repo, args.dry_run)

    # Learnings-only mode: review the app, then refresh just the learnings log.
    if args.learnings:
        print(f"Project root : {root}")
        print("Reviewing what exists in the application…")
        update_learnings(root, review_app(root), args.dry_run, repo=args.repo)
        return 0

    targets = select_targets(args)
    docs_dir = root / "docs"
    if not args.dry_run:
        docs_dir.mkdir(exist_ok=True)

    print(f"Project root : {root}")
    print(f"Mode         : {'doc=' + args.doc if args.doc else 'all' if args.all else 'bootstrap' if args.bootstrap else 'session-trio'}")
    print(f"Targets      : {', '.join(s['name'] for s in targets)}\n")

    # Review the application once; reuse the audit for every doc.
    print("Reviewing what exists in the application…")
    audit = review_app(root)
    print(f"  audit collected ({len(audit)} chars)\n")

    written, skipped = 0, 0
    for spec in targets:
        path = doc_path(root, spec)
        exists = path.exists()
        if args.bootstrap and exists:
            print(f"skip (exists)  {path.relative_to(root)}")
            skipped += 1
            continue

        current = path.read_text(encoding="utf-8") if exists else ""
        prompt = build_prompt(spec, current, audit)

        if args.dry_run:
            verb = "update" if exists else "create"
            print(f"[DRY] would {verb} {path.relative_to(root)}  (prompt {len(prompt)} chars)")
            continue

        print(f"\n=== {'updating' if exists else 'creating'} {path.relative_to(root)} ===")
        new_content = strip_fences(call_claude(prompt))
        if not new_content.strip():
            print(f"\nWARNING: empty model output for {spec['name']} — left unchanged.")
            skipped += 1
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(new_content, encoding="utf-8")
        print(f"\nwrote {path.relative_to(root)} ({len(new_content)} chars)")
        written += 1

    # F3 — refresh the learnings log on the default (session-trio) and --all runs,
    # reusing the audit already collected above. Skipped for --doc/--bootstrap.
    if not args.doc and not args.bootstrap:
        update_learnings(root, audit, args.dry_run, repo=args.repo)

    if args.dry_run:
        print("\nDry run complete — no files written.")
    else:
        print(f"\nDone. {written} written, {skipped} skipped.")
        print("Reminder: review every generated doc before committing. Never commit env VALUES — names only.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
