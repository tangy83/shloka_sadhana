#!/usr/bin/env python3
"""
module-audit.py — CFAI modularity auditor.

Enumerates every function in a codebase with its Input → Processing → Output
contract, then grades the health of each function, module, and outbound API
call against the CFAI modularity rubric. Emits a single scorecard document:
docs/audits/MODULARITY_AUDIT.md.

Implements the audit method defined in:
  architecture/modularity-audit-reckoner.md   (workflow + scorecards)
  architecture/architecture-principles-reckoner.md   (what "healthy" means)

AI-assisted and LANGUAGE-AGNOSTIC: it does not parse code with per-language
tooling. It batches source files and asks the authenticated `claude` CLI to
read each batch against an embedded rubric — so the same script audits a
Python, TypeScript, Go, or mixed codebase without extra dependencies.

Pure standard library. Shells out to the `claude` CLI (Claude Code) via
subprocess — no ANTHROPIC_API_KEY, no pip installs. This mirrors
scripts/generate_standard.py, toolkit/adopt.py, and toolkit/docs_update.py.

ADOPTING PROJECTS: copy this file to your project root and run it from there.
`--project` defaults to the script's own directory, so the copy "just works".

Usage:
    python3 module-audit.py --self-test           # validate rubric + discovery, no model call
    python3 module-audit.py --dry-run             # list files + batches that would be audited
    python3 module-audit.py                        # full audit → docs/audits/MODULARITY_AUDIT.md
    python3 module-audit.py --tier function        # one tier only (function | module | api | all)
    python3 module-audit.py --path src/services    # scope the audit to a subtree
    python3 module-audit.py --project /path/to/repo --output docs/audits/AUDIT.md
    python3 module-audit.py --backlog-dry-run      # audit + merge plan, writes nothing
    python3 module-audit.py --file-backlog         # also upsert docs/backlog/modularity-debt.md

--dry-run and --self-test never call the model and never write files.

With --file-backlog, every 🔴/F unit becomes a prioritized item in a `class: debt`
backlog group, which docs_update.py keeps out of the feature-completion coverage %.
Items are keyed on `path::symbol` (never the line number) so re-runs upsert instead
of duplicating, and an item auto-closes when its unit passes the rubric again. A unit
that was not re-audited this run is left untouched — absence is never a fix, so a
scoped run or a malformed model reply can never fake a burndown.

Grade, band, critical caps, Priority and the Effort seed are all computed here in
Python from the rubric. The model only ever reports per-dimension 🟢/🟡/🔴.
"""

import os
import re
import sys
import json
import argparse
import tempfile
import subprocess
from datetime import date
from pathlib import Path

# Model routing + subprocess isolation.
#
# `claude -p` inherits the caller's CLAUDE.md, hooks and plugins, so a personal
# rule like "end every response with a status footer" would be appended to every
# doc this script generates. `--setting-sources ""` isolates the subprocess.
#
# That flag also stops the CLI reading `model` from settings.json, so we resolve
# the model here and pass it explicitly — net routing is unchanged. No model ID
# is pinned. Precedence:
#   CFAI_AUDIT_MODEL -> CFAI_MODEL -> ANTHROPIC_MODEL -> .claude/settings*.json
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


DEFAULT_OUTPUT = "docs/audits/MODULARITY_AUDIT.md"
TIERS = ("function", "module", "api", "all")

# Rough character budget per batch sent to the model. Keeps each request well
# inside the context window so no source file is silently dropped (see the
# "whole-codebase in one prompt truncates silently" gotcha in the reckoner).
BATCH_CHAR_BUDGET = 45_000
MAX_FILE_CHARS = 40_000          # skip/annotate files larger than this

# Source extensions worth auditing. Extend for your stack as needed.
SOURCE_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rb", ".java", ".kt",
    ".swift", ".rs", ".php", ".cs", ".c", ".cc", ".cpp", ".h", ".hpp",
    ".scala", ".ex", ".exs", ".dart",
}

# Directories that are not your modularity — vendored, generated, or build
# output. Excluding these is load-bearing: included, they dominate the counts.
IGNORE_DIRS = {
    "node_modules", ".git", ".venv", "venv", "__pycache__", "dist", "build",
    ".next", ".nuxt", "out", "coverage", ".turbo", "target", "vendor",
    ".pytest_cache", ".mypy_cache", ".gradle", "Pods", "DerivedData",
    "migrations", "generated", ".terraform", "bin", "obj",
}
IGNORE_SUFFIXES = (".min.js", ".d.ts", ".generated.ts", ".pb.go", "_pb2.py")

# ---------------------------------------------------------------------------
# The embedded rubric — a condensed mirror of the scorecards in
# architecture/modularity-audit-reckoner.md. Kept inline so the script is
# self-contained when copied to a project root.
# ---------------------------------------------------------------------------

RUBRIC = """\
CFAI MODULARITY RUBRIC (score each dimension 🟢2 / 🟡1 / 🔴0)

TIER 1 — FUNCTION HEALTH
  Cyclomatic complexity   🟢≤5   🟡6-10  🔴>10     (weight ×2)
  Cognitive complexity    🟢≤7   🟡8-15  🔴>15     (weight ×2)
  Parameter count         🟢≤3   🟡4-5   🔴>5      (weight ×1)
  Lines of code (body)    🟢≤30  🟡31-60 🔴>60     (weight ×1)
  Max nesting depth       🟢≤2   🟡3     🔴>3      (weight ×1)
  Side-effect purity      🟢pure/localized 🟡mixed 🔴hidden global mutation (weight ×2)
  I/O contract clarity    🟢typed+all inputs declared 🟡partial 🔴implicit/any/UNDECLARED inputs (weight ×2)
  Test present            🟢yes  🔴no                (weight ×1)
  Grade = earned ÷ 24. A≥90 B80-89 C70-79 D60-69 F<60.
  CRITICAL CAP: any 🔴 on purity OR I/O contract caps the grade at C.
  NOTE: inputs = parameters PLUS captured/ambient deps (globals, env, clock).
        A zero-param function reading globals is 🔴 on I/O contract.

TIER 2 — MODULE / PACKAGE HEALTH
  Instability-abstractness distance D=|A+I-1|  🟢≤0.3 🟡0.3-0.6 🔴>0.6
  Efferent coupling (outbound deps Ce)         🟢≤5   🟡6-12   🔴>12
  Cohesion (LCOM)                              🟢low  🟡mod    🔴high
  Public surface (exported symbols)            🟢small 🟡broad 🔴everything
  Circular dependencies                        🟢0            🔴≥1 (AUTOMATIC module 🔴)
  Mean function grade in module                🟢A-B  🟡C      🔴D-F

TIER 3 — API-CALL HEALTH (per outbound endpoint/integration; each pass=🟢 fail=🔴)
  Contract documented (request+response+ERROR shapes, status codes)
  Timeout set explicitly
  Retry / backoff policy defined
  Error handling on every call site (no silent catch{})
  Auth handled + secrets not inline
  Versioning / stable contract
  Idempotency for writes (retry-safe)
  Observability (structured log / metric / trace)
  Grade = passes ÷ 8, banded A-F. CRITICAL CAP: 🔴 on Error handling OR Timeout caps at C.
"""

# ---------------------------------------------------------------------------
# The rubric, as data. Python — not the model — owns grade, bands, critical caps,
# priority and effort. Model letter-grades drift ±1 band on borderline metrics
# (see the reckoner's "model-run scores drift" gotcha); a drifting grade would
# mean a drifting priority, which would mean the debt backlog churns every run.
# The model is reduced to a sensor that reports per-dimension 🟢/🟡/🔴.
# ---------------------------------------------------------------------------

TIER1_WEIGHTS = {
    "cyclomatic": 2, "cognitive": 2, "params": 1, "loc": 1,
    "nesting": 1, "purity": 2, "io_contract": 2, "test_present": 1,
}
TIER1_DIMS = tuple(TIER1_WEIGHTS)
TIER1_CRITICAL = ("purity", "io_contract")          # a 🔴 here caps the grade at C

TIER2_DIMS = ("instability", "efferent_coupling", "cohesion",
              "public_surface", "circular_deps", "mean_function_grade")
TIER2_AUTOMATIC_RED = "circular_deps"               # ≥1 cycle = automatic module 🔴

TIER3_DIMS = ("contract_documented", "timeout", "retry", "error_handling",
              "auth_secrets", "versioning", "idempotency", "observability")
TIER3_CRITICAL = ("error_handling", "timeout")

DIMS_BY_TIER = {1: TIER1_DIMS, 2: TIER2_DIMS, 3: TIER3_DIMS}
CRITICAL_BY_TIER = {1: TIER1_CRITICAL, 2: (TIER2_AUTOMATIC_RED,), 3: TIER3_CRITICAL}

SCORE_VALUES = {"G": 2, "Y": 1, "R": 0}
_SCORE_ALIASES = {
    "2": "G", "g": "G", "🟢": "G", "green": "G", "pass": "G",
    "1": "Y", "y": "Y", "🟡": "Y", "yellow": "Y",
    "0": "R", "r": "R", "🔴": "R", "red": "R", "fail": "R",
}

BANDS = ((90, "A"), (80, "B"), (70, "C"), (60, "D"))
EFFORT_ORDER = ("XS", "S", "M", "L", "XL")

# Effort seed per failing dimension — the human owns Effort after creation.
EFFORT_BY_DIM = {
    "purity": "L",            # extracting or injecting side effects is real surgery
    "circular_deps": "L",     # breaking a cycle means moving a boundary
    "io_contract": "M",
    "cyclomatic": "M", "cognitive": "M", "loc": "M", "nesting": "M",
    "cohesion": "M", "public_surface": "M", "efferent_coupling": "M",
    "instability": "M", "mean_function_grade": "M",
    "params": "S", "test_present": "S",
}

DEBT_GROUP_CODE = "MDT"
DEBT_GROUP_NAME = "Modularity Debt"
DEBT_GROUP_FILE = "docs/backlog/modularity-debt.md"

# Item lifecycle, recorded in a hidden HTML comment on each item heading.
STATE_OPEN, STATE_CLOSED, STATE_REGRESSED, STATE_WONTFIX = (
    "open", "auto-closed", "regressed", "wontfix")
OPEN_STATES = {STATE_OPEN, STATE_REGRESSED}

HUMAN_TAIL_START = "**Description**"
AUDIT_LOG_START = "**Audit Log**"


def normalize_score(value) -> str | None:
    """Coerce a model-reported dimension score to 'G' | 'Y' | 'R'. None if junk."""
    key = str(value).strip().lower()
    if key.upper() in SCORE_VALUES:
        return key.upper()
    return _SCORE_ALIASES.get(key)


def _norm_path(path: str) -> str:
    return str(path).strip().replace("\\", "/").lstrip("./").strip("/")


def unit_key(rec: dict) -> str:
    """Stable identity for an audited unit. Excludes the line number, which drifts
    on every edit above the unit.

    Tier 1 -> 'path::symbol'          (the function)
    Tier 2 -> 'path::<module>'        (the module is the unit)
    Tier 3 -> '<api>::METHOD /route'  (the endpoint, not the call site — the rubric
                                       scores per distinct endpoint, and 'error
                                       handling on every call site' spans files)
    """
    tier = int(rec.get("tier", 1))
    symbol = str(rec.get("symbol", "")).strip()
    if tier == 3:
        return f"<api>::{symbol}"
    path = _norm_path(rec.get("path", ""))
    if tier == 2:
        return f"{path}::<module>"
    return f"{path}::{symbol}"


def _band(pct: int) -> str:
    for floor, letter in BANDS:
        if pct >= floor:
            return letter
    return "F"


def compute_grade(dims: dict, tier: int) -> tuple[int, str, bool]:
    """(percent, band, capped) for a unit. Pure. Applies the rubric's critical caps.

    Tier 1: earned ÷ 24 (weighted). Tier 2: earned ÷ 12. Tier 3: passes ÷ 8.

    `capped` is True only when the cap actually lowered the band — a unit already at
    D or F is not "capped at C", and saying so on its item would be a lie.
    """
    if tier == 1:
        earned = sum(SCORE_VALUES[dims[d]] * w for d, w in TIER1_WEIGHTS.items())
        pct = round(earned / 24 * 100)
    elif tier == 2:
        earned = sum(SCORE_VALUES[dims[d]] for d in TIER2_DIMS)
        pct = round(earned / (2 * len(TIER2_DIMS)) * 100)
    else:
        pct = round(sum(1 for d in TIER3_DIMS if dims[d] == "G") / len(TIER3_DIMS) * 100)

    band = _band(pct)
    # A circular dependency is a correctness and testability risk, not a style
    # issue: the module is 🔴 no matter how well it scores elsewhere.
    if tier == 2 and dims.get(TIER2_AUTOMATIC_RED) == "R":
        return pct, "F", True
    if any(dims.get(d) == "R" for d in CRITICAL_BY_TIER[tier]) and band in ("A", "B"):
        return pct, "C", True
    return pct, band, False


def filing_predicate(dims: dict, tier: int) -> bool:
    """File a remediation item iff the unit is D/F, or 🔴 on a critical dimension.

    The second clause matters: a function that scores an A on percentage but hides
    a global mutation is a 🔴 unit and must be filed.
    """
    _, band, _ = compute_grade(dims, tier)
    if band in ("D", "F"):
        return True
    return any(dims.get(d) == "R" for d in CRITICAL_BY_TIER[tier])


def derive_priority(dims: dict, tier: int, band: str) -> str:
    """Deterministic P0–P3 from the rubric outcome. First match wins."""
    criticals = [d for d in CRITICAL_BY_TIER[tier] if dims.get(d) == "R"]
    if tier == 2:
        if dims.get(TIER2_AUTOMATIC_RED) == "R":
            return "P0 - Critical"
    elif len(criticals) >= 2:
        return "P0 - Critical"
    elif len(criticals) == 1:
        return "P1 - High"
    if band == "F":
        return "P1 - High"
    if band == "D":
        return "P2 - Medium"
    return "P3 - Low"


def derive_effort(dims: dict, tier: int) -> str:
    """Seed Effort from the worst failing dimension. Human-owned after creation."""
    failing = [d for d in DIMS_BY_TIER[tier] if dims.get(d) == "R"]
    if not failing:
        return "S"
    if tier == 3:
        return "M" if len(failing) > 1 else "S"
    efforts = [EFFORT_BY_DIM.get(d, "S") for d in failing]
    return max(efforts, key=EFFORT_ORDER.index)


# ---------------------------------------------------------------------------
# File discovery
# ---------------------------------------------------------------------------


def discover_sources(root: Path, subpath: str | None) -> list[Path]:
    """Return auditable source files under root (optionally scoped to subpath)."""
    base = (root / subpath).resolve() if subpath else root
    if not base.exists():
        sys.exit(f"ERROR: --path not found: {base}")

    files: list[Path] = []
    for path in sorted(base.rglob("*")):
        if not path.is_file():
            continue
        if any(part in IGNORE_DIRS for part in path.relative_to(root).parts):
            continue
        if path.suffix.lower() not in SOURCE_EXTENSIONS:
            continue
        if any(path.name.endswith(sfx) for sfx in IGNORE_SUFFIXES):
            continue
        files.append(path)
    return files


def batch_files(files: list[Path], root: Path) -> list[list[Path]]:
    """Group files into char-budget-bounded batches so no request truncates."""
    batches: list[list[Path]] = []
    current: list[Path] = []
    running = 0
    for f in files:
        try:
            size = f.stat().st_size
        except OSError:
            size = 0
        size = min(size, MAX_FILE_CHARS)
        if current and running + size > BATCH_CHAR_BUDGET:
            batches.append(current)
            current, running = [], 0
        current.append(f)
        running += size
    if current:
        batches.append(current)
    return batches


def read_batch(files: list[Path], root: Path) -> str:
    """Concatenate a batch's files with path headers for the prompt."""
    parts = []
    for f in files:
        rel = f.relative_to(root)
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            text = f"<<unreadable: {exc}>>"
        if len(text) > MAX_FILE_CHARS:
            text = text[:MAX_FILE_CHARS] + "\n<<truncated for audit>>"
        parts.append(f"===== FILE: {rel} =====\n{text}")
    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# Import graph — circular dependencies and efferent coupling are graph problems.
# The model batches at BATCH_CHAR_BUDGET and physically cannot see a cycle that
# spans two batches, so Python computes these two dimensions itself.
# ---------------------------------------------------------------------------

_PY_IMPORT = re.compile(r"^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))", re.MULTILINE)
_JS_IMPORT = re.compile(r"""(?:from|import|require\()\s*['"]([^'"]+)['"]""")


def module_of(path: Path, root: Path) -> str:
    """The module a file belongs to: its parent directory, repo-relative."""
    parent = path.relative_to(root).parent
    return parent.as_posix() if parent.as_posix() != "." else "."


def _import_targets(text: str, suffix: str) -> list[str]:
    if suffix == ".py":
        return [a or b for a, b in _PY_IMPORT.findall(text)]
    return _JS_IMPORT.findall(text)


def _resolve_internal(target: str, source: Path, root: Path, known: set[str]) -> str | None:
    """Best-effort map an import target to a known internal module, else None."""
    if target.startswith("."):
        if "/" in target or target.startswith("./") or target.startswith("../"):
            candidate = (source.parent / target).resolve()   # JS relative path
            try:
                rel = candidate.relative_to(root).parent.as_posix()
            except ValueError:
                return None
            return rel if rel in known else None
        return module_of(source, root)                        # Python relative import
    dotted = target.replace(".", "/")
    for candidate in (dotted, str(Path(dotted).parent)):
        if candidate in known:
            return candidate
    return None


def build_import_graph(files: list[Path], root: Path) -> tuple[dict[str, set[str]], dict[str, int]]:
    """(module -> internal module deps, module -> efferent coupling Ce). Pure-ish (reads files).

    Ce counts every distinct outbound target, internal and external — an external
    package is still an outbound dependency.
    """
    known = {module_of(f, root) for f in files}
    graph: dict[str, set[str]] = {m: set() for m in known}
    outbound: dict[str, set[str]] = {m: set() for m in known}

    for f in files:
        src = module_of(f, root)
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for target in _import_targets(text, f.suffix.lower()):
            outbound[src].add(target)
            dest = _resolve_internal(target, f, root, known)
            if dest and dest != src:
                graph[src].add(dest)

    return graph, {m: len(t) for m, t in outbound.items()}


def find_cycles(graph: dict[str, set[str]]) -> list[list[str]]:
    """Every strongly-connected component of size > 1, plus self-loops. Pure.

    Iterative Tarjan — a recursive walk blows the stack on a large monorepo.
    """
    index: dict[str, int] = {}
    low: dict[str, int] = {}
    on_stack: set[str] = set()
    stack: list[str] = []
    counter = 0
    cycles: list[list[str]] = []

    for start in sorted(graph):
        if start in index:
            continue
        work = [(start, iter(sorted(graph.get(start, ()))))]
        index[start] = low[start] = counter
        counter += 1
        stack.append(start)
        on_stack.add(start)

        while work:
            node, children = work[-1]
            advanced = False
            for child in children:
                if child not in index:
                    index[child] = low[child] = counter
                    counter += 1
                    stack.append(child)
                    on_stack.add(child)
                    work.append((child, iter(sorted(graph.get(child, ())))))
                    advanced = True
                    break
                if child in on_stack:
                    low[node] = min(low[node], index[child])
            if advanced:
                continue
            work.pop()
            if work:
                low[work[-1][0]] = min(low[work[-1][0]], low[node])
            if low[node] == index[node]:
                component = []
                while True:
                    member = stack.pop()
                    on_stack.discard(member)
                    component.append(member)
                    if member == node:
                        break
                if len(component) > 1 or node in graph.get(node, ()):
                    cycles.append(sorted(component))

    return sorted(cycles)


# ---------------------------------------------------------------------------
# Structured findings — the model boundary. Everything below it is deterministic;
# everything above it can lie. So parsing NEVER raises, and a batch that fails to
# parse contributes no audited keys, which is what makes it impossible for a
# malformed response to auto-close (and thus fake the burndown of) an item.
# ---------------------------------------------------------------------------

_FENCE = re.compile(r"(?:```|~~~)[ \t]*(?:json)?[ \t]*\n(.*?)(?:```|~~~)", re.DOTALL)


def extract_json_records(text: str) -> tuple[list[dict], list[str]]:
    """Pull per-unit records out of the model's reply. Never raises."""
    records: list[dict] = []
    for block in _FENCE.findall(text or ""):
        try:
            parsed = json.loads(block)
        except (json.JSONDecodeError, TypeError):
            continue
        if isinstance(parsed, list):
            records.extend(r for r in parsed if isinstance(r, dict))
        elif isinstance(parsed, dict):
            records.append(parsed)

    if not records:                                   # last resort: the whole reply
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                records = [r for r in parsed if isinstance(r, dict)]
        except (json.JSONDecodeError, TypeError):
            pass

    if not records:
        return [], ["no parseable JSON records in model reply"]
    return records, []


def strip_json_block(text: str) -> str:
    """Remove the machine-readable JSON block, leaving the human markdown."""
    def drop(match: re.Match) -> str:
        try:
            json.loads(match.group(1))
        except (json.JSONDecodeError, TypeError):
            return match.group(0)                      # a real code block — keep it
        return ""
    return _FENCE.sub(drop, text or "").strip()


def validate_records(raw: list[dict]) -> tuple[list[dict], list[str]]:
    """Keep well-formed records, drop the rest with a reason. Pure, never raises."""
    good: list[dict] = []
    problems: list[str] = []

    for i, rec in enumerate(raw):
        if not isinstance(rec, dict):
            problems.append(f"record {i}: not an object")
            continue
        try:
            tier = int(rec.get("tier", 0))
        except (TypeError, ValueError):
            tier = 0
        if tier not in DIMS_BY_TIER:
            problems.append(f"record {i}: bad tier {rec.get('tier')!r}")
            continue

        symbol = str(rec.get("symbol", "")).strip()
        path = _norm_path(rec.get("path", ""))
        if not symbol:
            problems.append(f"record {i}: missing symbol")
            continue
        if tier in (1, 2) and not path:
            problems.append(f"record {i}: missing path")
            continue

        raw_dims = rec.get("dims")
        if not isinstance(raw_dims, dict):
            problems.append(f"record {i} ({path}::{symbol}): missing dims")
            continue
        dims: dict[str, str] = {}
        missing = []
        for dim in DIMS_BY_TIER[tier]:
            score = normalize_score(raw_dims.get(dim)) if dim in raw_dims else None
            if score is None:
                missing.append(dim)
            else:
                dims[dim] = score
        if missing:
            problems.append(f"record {i} ({path}::{symbol}): unscored dims {', '.join(missing)}")
            continue

        try:
            line = int(rec.get("line")) if rec.get("line") is not None else None
        except (TypeError, ValueError):
            line = None

        good.append({"tier": tier, "path": path, "symbol": symbol, "line": line,
                     "title": str(rec.get("title") or symbol).strip(), "dims": dims})
    return good, problems


def collect_records(batch_texts: list[str]) -> tuple[list[dict], set[str], list[str]]:
    """Fold every batch reply into (filed-worthy records, audited keys, problems).

    `audited` holds EVERY unit actually scored this run, passing or failing. A unit
    is 'passing' iff it is in `audited` but not among the returned records. A batch
    whose JSON is malformed contributes nothing to `audited`, so its units read as
    'not re-audited' rather than 'passing' — and are therefore never auto-closed.
    """
    records: list[dict] = []
    audited: set[str] = set()
    problems: list[str] = []

    for batch_no, text in enumerate(batch_texts, 1):
        raw, extract_problems = extract_json_records(text)
        good, validate_problems = validate_records(raw)
        problems += [f"batch {batch_no}: {p}" for p in extract_problems + validate_problems]
        for rec in good:
            audited.add(unit_key(rec))
            if filing_predicate(rec["dims"], rec["tier"]):
                records.append(rec)
    return records, audited, problems


# ---------------------------------------------------------------------------
# Claude invocation (streaming, mirrors toolkit/adopt.py)
# ---------------------------------------------------------------------------

AUDIT_SYSTEM = """\
You are a senior software architect running a modularity audit. You apply the
CFAI modularity rubric objectively and report only what the code shows — never
invent functions, files, or scores. Be terse and tabular. Output ONLY markdown.
"""


def run_claude(user_prompt: str, echo: bool = True) -> str:
    """Send a prompt to the `claude` CLI and return the final assistant text."""
    proc = subprocess.Popen(
        [
            "claude", "-p", user_prompt,
            "--system-prompt", AUDIT_SYSTEM,
            *model_flags("CFAI_AUDIT_MODEL"),
            *CLAUDE_ISOLATION,
            "--tools", "",                     # load-bearing: no filesystem tool prompts
            "--output-format", "stream-json",
            "--include-partial-messages",
            "--verbose",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        stdin=subprocess.DEVNULL,
    )

    final_text = ""
    last_len = 0
    for line in proc.stdout:
        line = line.strip()
        if not line:
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if event.get("type") == "assistant":
            for block in event.get("message", {}).get("content", []):
                if block.get("type") == "text":
                    current = block.get("text", "")
                    if echo and current[last_len:]:
                        print(current[last_len:], end="", flush=True)
                        last_len = len(current)
                    final_text = current
        elif event.get("type") == "result":
            result_val = event.get("result", "")
            if result_val and not final_text:
                final_text = result_val

    proc.wait()
    if proc.returncode != 0:
        sys.exit(f"\nERROR: claude CLI failed:\n{proc.stderr.read()}")
    return final_text


# ---------------------------------------------------------------------------
# Prompt builders
# ---------------------------------------------------------------------------


JSON_INSTRUCTION = f"""\

THEN, after the tables, output exactly ONE fenced ```json block: an array with one
object per unit you scored (both passing and failing units — every one).

  {{"tier": 1, "path": "src/foo.py", "symbol": "Bar.baz", "line": 42,
   "title": "Bar.baz", "dims": {{"cyclomatic": "G", ... }}}}

Rules, all mandatory:
- `path` and `symbol` are SEPARATE fields. Never a combined "file:line" string.
- `symbol` is qualified within its file ("Bar.baz", not "baz"). For tier 3, `symbol`
  is the endpoint, e.g. "POST /v1/charges".
- Every dimension must be scored, exactly one of "G" | "Y" | "R". Omit nothing.
- Tier 1 dims: {", ".join(TIER1_DIMS)}
- Tier 3 dims: {", ".join(TIER3_DIMS)}
- Do NOT emit a grade, band or priority — those are computed downstream.
"""


def batch_prompt(batch_content: str, tier: str, batch_no: int, total: int,
                 emit_json: bool = False) -> str:
    tier_line = {
        "function": "Audit TIER 1 (function health) ONLY.",
        "module": "Audit TIER 2 (module/package health) ONLY.",
        "api": "Audit TIER 3 (API-call health) ONLY.",
        "all": "Audit TIER 1 (functions) and TIER 3 (API calls) for these files. "
               "(TIER 2 is scored separately from the module manifest — skip it here.)",
    }[tier]
    return f"""\
{RUBRIC}

TASK — batch {batch_no}/{total}. {tier_line}

For every function in the files below, output one Markdown table row:
| Function | Location (file:line) | Inputs (params + captured/ambient deps) | Processing (one line) | Outputs (return + side effects) | Grade |

Then, if any outbound API/network call or third-party integration appears,
output a second table scoring TIER 3 for each distinct endpoint.

Score strictly per the rubric. Apply the critical caps. Do NOT summarise or add
prose — tables only. If a batch has no functions, output the single line:
(no functions in this batch)
{JSON_INSTRUCTION if emit_json else ""}
FILES:
{batch_content}
"""


# --- Tier 2 -----------------------------------------------------------------
# Three of the six module dimensions are graph facts, not judgement calls, so
# Python computes them: circular dependencies, efferent coupling, and the mean
# function grade (which falls out of this run's Tier 1 scores). Only cohesion,
# public surface and instability are left to the model.

TIER2_MODEL_DIMS = ("cohesion", "public_surface", "instability")
_EXPORT = re.compile(
    r"(?m)^\s*(?:export\s+(?:default\s+)?(?:function|const|class)|def\s|class\s|func\s|public\s)")


def module_manifest(files: list[Path], root: Path, ce: dict[str, int]) -> str:
    """A compact per-module summary for the model to score the qualitative dims."""
    by_module: dict[str, list[Path]] = {}
    for f in files:
        by_module.setdefault(module_of(f, root), []).append(f)

    lines = []
    for module in sorted(by_module):
        members = by_module[module]
        exports = 0
        for f in members:
            try:
                exports += len(_EXPORT.findall(f.read_text(encoding="utf-8", errors="replace")))
            except OSError:
                pass
        names = ", ".join(f.name for f in members[:12])
        lines.append(f"- {module}  |  files: {len(members)}  |  top-level defs/exports: "
                     f"{exports}  |  outbound deps (Ce): {ce.get(module, 0)}  |  {names}")
    return "\n".join(lines)


def tier2_prompt(manifest: str) -> str:
    return f"""\
{RUBRIC}

TASK — score TIER 2 (module/package health) for the modules below. Score ONLY these
three dimensions; the others are computed from the import graph and supplied for you:
  cohesion         🟢low LCOM 🟡moderate 🔴high (unrelated responsibilities in one module)
  public_surface   🟢small/intentional 🟡broad 🔴everything exported
  instability      D=|A+I-1|  🟢≤0.3 🟡0.3-0.6 🔴>0.6

Output ONE fenced ```json block: an array with one object per module.

  {{"tier": 2, "path": "src/services", "symbol": "<module>",
    "dims": {{"cohesion": "G", "public_surface": "Y", "instability": "G"}}}}

No prose, no tables. Score every module listed.

MODULES:
{manifest}
"""


def _coupling_score(ce: int) -> str:
    return "G" if ce <= 5 else ("Y" if ce <= 12 else "R")


def _mean_grade_score(pcts: list[int]) -> str:
    if not pcts:
        return "G"
    band = _band(round(sum(pcts) / len(pcts)))
    return {"A": "G", "B": "G", "C": "Y"}.get(band, "R")


def build_tier2_records(model_raw: list[dict], modules: list[str], graph: dict[str, set[str]],
                        ce: dict[str, int], tier1_records: list[dict]) -> list[dict]:
    """Merge model-scored qualitative dims with Python-computed structural dims.

    A module the model failed to score still gets a record: its structural failures
    (a circular dependency above all) are facts and must be filed. Unscored
    qualitative dims default to 🟢 — we never invent a failure the model didn't see.
    """
    cyclic = {node for cycle in find_cycles(graph) for node in cycle}
    by_module_pcts: dict[str, list[int]] = {}
    for rec in tier1_records:
        if rec.get("tier") != 1:            # callers pass every validated record;
            continue                        # a tier-3 record has tier-3 dims.
        module = str(Path(rec["path"]).parent.as_posix())
        pct, _, _ = compute_grade(rec["dims"], 1)
        by_module_pcts.setdefault(module, []).append(pct)

    scored = {_norm_path(r.get("path", "")): r.get("dims", {})
              for r in model_raw if isinstance(r, dict)}

    records = []
    for module in modules:
        model_dims = scored.get(module, {})
        dims = {d: (normalize_score(model_dims.get(d)) or "G") for d in TIER2_MODEL_DIMS}
        dims["circular_deps"] = "R" if module in cyclic else "G"
        dims["efferent_coupling"] = _coupling_score(ce.get(module, 0))
        dims["mean_function_grade"] = _mean_grade_score(by_module_pcts.get(module, []))
        records.append({"tier": 2, "path": module, "symbol": "<module>", "line": None,
                        "title": module, "dims": dims})
    return records


def summary_prompt(fragments: str, project_name: str) -> str:
    return f"""\
{RUBRIC}

You are given per-batch modularity audit fragments for the project
"{project_name}". Produce the FINAL rolled-up scorecard as Markdown with exactly
these sections:

## Codebase Scorecard
A grade distribution table (count + % of functions at A/B/C/D/F) and a single
overall codebase letter grade (mean, rounded to a band).

## Fix-First Queue (bottom 10)
The 10 lowest-grade units, worst first, as a table:
| Rank | Unit | Location | Grade | Top failing dimension | Suggested fix |

## Module Health
A short table of the weakest modules/packages by mean function grade and any
circular-dependency 🔴s observed across fragments.

## API-Call Health
Consolidate every TIER 3 row into one table; call out any 🔴 on Error handling
or Timeout.

Base everything ONLY on the fragments below — do not invent units. Terse, tabular.

FRAGMENTS:
{fragments}
"""


# ---------------------------------------------------------------------------
# The debt ledger. Items live in a `class: debt` backlog group, which docs_update.py
# keeps out of the feature-coverage headline — so filing debt never craters the
# completion number and the team is never punished for running this audit.
#
# Each item has a machine-owned head (regenerated every run) and a human-owned tail
# (carried forward verbatim). We splice rather than re-render, because a full
# deterministic re-render would silently drop prose a human added.
# ---------------------------------------------------------------------------

FIELD_ORDER = ("Status", "Completion", "Priority", "Effort", "Added",
               "Updated", "Target", "Owner", "Linked Personas", "Depends On")
MACHINE_FIELDS = {"Priority", "Updated"}     # everything else is the human's

PRIORITY_RANK = {"P0 - Critical": 0, "P1 - High": 1, "P2 - Medium": 2, "P3 - Low": 3}
TIER_FLAG = {1: "function", 2: "module", 3: "api"}

DIM_LABELS = {
    "cyclomatic": "Cyclomatic complexity", "cognitive": "Cognitive complexity",
    "params": "Parameter count", "loc": "Lines of code", "nesting": "Max nesting depth",
    "purity": "Side-effect purity", "io_contract": "I/O contract clarity",
    "test_present": "Test present",
    "instability": "Instability–abstractness distance", "efferent_coupling": "Efferent coupling (Ce)",
    "cohesion": "Cohesion (LCOM)", "public_surface": "Public surface",
    "circular_deps": "Circular dependencies", "mean_function_grade": "Mean function grade",
    "contract_documented": "Contract documented", "timeout": "Timeout set",
    "retry": "Retry / backoff policy", "error_handling": "Error handling on every call site",
    "auth_secrets": "Auth handled, secrets not inline", "versioning": "Versioning / stable contract",
    "idempotency": "Idempotency for writes", "observability": "Observability",
}

CRITERIA_BY_DIM = {
    "purity": "Side effects extracted or injected; function pure or localized",
    "io_contract": "All inputs declared as typed parameters (no global/env/clock reads)",
    "cyclomatic": "Cyclomatic complexity ≤ 5",
    "cognitive": "Cognitive complexity ≤ 7",
    "params": "Parameter count ≤ 3 (introduce a params object)",
    "loc": "Function body ≤ 30 lines",
    "nesting": "Max nesting depth ≤ 2",
    "test_present": "Test present and passing",
    "circular_deps": "Circular dependency broken (move the shared boundary)",
    "efferent_coupling": "Outbound dependencies ≤ 5",
    "cohesion": "Module cohesion raised (split unrelated responsibilities)",
    "public_surface": "Public surface narrowed to the intended API",
    "instability": "Instability–abstractness distance ≤ 0.3",
    "mean_function_grade": "Mean function grade in module ≥ B",
    "timeout": "Explicit timeout set on the call",
    "error_handling": "Error handling on every call site (no silent catch)",
    "retry": "Retry / backoff policy defined",
    "contract_documented": "Request, response and error shapes documented",
    "auth_secrets": "Auth handled; no inline secrets",
    "versioning": "Versioned / stable contract",
    "idempotency": "Writes are idempotent and retry-safe",
    "observability": "Structured log, metric or trace emitted",
}

_ITEM_SPLIT = re.compile(r"(?m)^(?=###\s+[A-Z][A-Z0-9]*-\d+)")
_AUDIT_COMMENT = re.compile(r'<!--\s*cfai-audit\s+unit-key="([^"]*)"\s+state="([^"]*)"\s*-->')
_FIELD_ROW = re.compile(r"(?m)^\|\s*([A-Za-z][A-Za-z /]*?)\s*\|\s*`?([^|`]*?)`?\s*\|\s*$")


def scaffold_debt_group(code: str = DEBT_GROUP_CODE, name: str = DEBT_GROUP_NAME) -> str:
    """The debt child doc's header. `class: debt` from the first byte — that key is
    the entire contract with docs_update.py's coverage segmentation."""
    return (
        f"<!-- BACKLOG_GROUP\n"
        f"code: {code}\n"
        f"name: {name}\n"
        f"status: Active\n"
        f"priority: P2\n"
        f"owner: \n"
        f"class: debt\n"
        f"-->\n\n"
        f"# {name} — Backlog\n\n"
        f"> **Back to:** [Master Backlog](./MASTER_BACKLOG.md)\n"
        f"> Auto-filed by `module-audit.py --file-backlog`. The item head (Priority, failing\n"
        f"> dimensions, grade) is regenerated each run; your Owner / Status / Completion /\n"
        f"> Notes are preserved. Set `state=\"wontfix\"` in an item's `cfai-audit` comment to\n"
        f"> freeze it. Items auto-close when the unit passes the rubric on a later run.\n\n"
        f"## Scope\n\n"
        f"Rubric-failing units (🔴/F) from the modularity audit. Debt, not features —\n"
        f"excluded from the feature-completion coverage number.\n\n"
        f"## Backlog Items\n\n"
    )


def parse_debt_group(text: str) -> dict:
    """Split the debt doc into its prefix and structured items. Pure."""
    parts = _ITEM_SPLIT.split(text)
    prefix, blocks = parts[0], parts[1:]

    items: list[dict] = []
    for block in blocks:
        iid = re.match(r"###\s+([A-Z][A-Z0-9]*-\d+)", block).group(1)
        comment = _AUDIT_COMMENT.search(block)
        title_match = re.search(r"(?m)^\*\*(.+?)\*\*\s*$", block)

        fields: dict[str, str] = {}
        for key, value in _FIELD_ROW.findall(block):
            if key.strip() in FIELD_ORDER:
                fields[key.strip()] = value.strip()

        dims_block, tail, log = "", "", []
        if "**Failing dimensions**" in block:
            after = block.split("**Failing dimensions**", 1)[1]
            dims_block = "**Failing dimensions**" + after.split(HUMAN_TAIL_START, 1)[0].rstrip()
        if HUMAN_TAIL_START in block:
            tail_raw = HUMAN_TAIL_START + block.split(HUMAN_TAIL_START, 1)[1]
            tail = tail_raw.split(AUDIT_LOG_START, 1)[0].rstrip()
        if AUDIT_LOG_START in block:
            log = [ln.strip()[2:].strip() for ln in
                   block.split(AUDIT_LOG_START, 1)[1].splitlines() if ln.strip().startswith("- ")]

        items.append({
            "id": iid,
            "unit_key": comment.group(1) if comment else "",
            "state": comment.group(2) if comment else STATE_OPEN,
            "title": title_match.group(1) if title_match else iid,
            "fields": fields,
            "dims_block": dims_block,
            "tail": tail,
            "log": log,
        })
    return {"prefix": prefix, "items": items}


def next_item_number(parsed: dict) -> int:
    numbers = [int(it["id"].rsplit("-", 1)[1]) for it in parsed["items"]]
    return max(numbers, default=0) + 1


def render_item(item: dict) -> str:
    lines = [
        f"### {item['id']}",
        f'<!-- cfai-audit unit-key="{item["unit_key"]}" state="{item["state"]}" -->',
        f"**{item['title']}**",
        "",
        "| Field | Value |",
        "|---|---|",
    ]
    for key in FIELD_ORDER:
        lines.append(f"| {key} | `{item['fields'].get(key, '—')}` |")
    lines += ["", item["dims_block"], "", item["tail"], "",
              f"{AUDIT_LOG_START} (managed by module-audit)"]
    lines += [f"- {entry}" for entry in item["log"]]
    return "\n".join(lines) + "\n\n"


def _dims_block(derived: dict) -> str:
    lines = ["**Failing dimensions** (module-audit, rubric-derived — do not hand-edit)"]
    for dim in derived["failing"]:
        lines.append(f"- 🔴 {DIM_LABELS.get(dim, dim)}")
    for dim in derived["warning"]:
        lines.append(f"- 🟡 {DIM_LABELS.get(dim, dim)}")
    cap = " · capped by critical 🔴" if derived["capped"] else ""
    lines.append(f"- Grade: {derived['band']} ({derived['pct']}%){cap} · `{derived['location']}`")
    return "\n".join(lines)


def _default_tail(derived: dict) -> str:
    criteria = [CRITERIA_BY_DIM[d] for d in derived["failing"] if d in CRITERIA_BY_DIM]
    rerun = f"python3 module-audit.py --tier {TIER_FLAG[derived['tier']]}"
    if derived["tier"] in (1, 2):
        rerun += f" --path {derived['path']}"
    criteria.append(f"`{rerun}` → grade ≥ B")

    lines = [HUMAN_TAIL_START, f"_{derived['action']}_", "", "**Success Criteria**"]
    lines += [f"- [ ] {c}" for c in criteria]
    lines += ["", "**Related Items**", "- _none yet_", "",
              "**Code Location**", f"- `{derived['path']}` · {derived['unit_label']}", "",
              "**Notes / Risks**", "- _none_"]
    return "\n".join(lines)


def derive_item(rec: dict, today: str) -> dict:
    """Everything the ledger needs about a failing unit, computed from the rubric."""
    dims, tier = rec["dims"], rec["tier"]
    pct, band, capped = compute_grade(dims, tier)
    failing = [d for d in DIMS_BY_TIER[tier] if dims[d] == "R"]
    warning = [d for d in DIMS_BY_TIER[tier] if dims[d] == "Y"]

    path = rec["path"] or "—"
    location = f"{path}:{rec['line']}" if rec.get("line") else path
    if tier == 3:
        location, unit_label = rec["symbol"], f"endpoint `{rec['symbol']}`"
    elif tier == 2:
        unit_label = "module"
    else:
        unit_label = f"symbol `{rec['symbol']}`"

    headline = ", ".join(DIM_LABELS.get(d, d) for d in failing[:2]) or f"grade {band}"
    derived = {
        "unit_key": unit_key(rec), "tier": tier, "path": path, "symbol": rec["symbol"],
        "pct": pct, "band": band, "capped": capped, "dims": dims,
        "failing": failing, "warning": warning, "location": location,
        "unit_label": unit_label,
        "title": f"{rec['title']} — {headline}",
        "priority": derive_priority(dims, tier, band),
        "effort": derive_effort(dims, tier),
        "action": f"Bring `{rec['symbol']}` back to grade B or better ({headline}).",
    }
    derived["dims_block"] = _dims_block(derived)
    derived["tail"] = _default_tail(derived)
    derived["log_line"] = f"{today} filed — {band} ({pct}%), {derived['priority']}"
    return derived


def _new_item(iid: str, derived: dict, today: str) -> dict:
    return {
        "id": iid,
        "unit_key": derived["unit_key"],
        "state": STATE_OPEN,
        "title": derived["title"],
        "fields": {
            "Status": "BACKLOG", "Completion": "0%", "Priority": derived["priority"],
            "Effort": derived["effort"], "Added": today, "Updated": today,
            "Target": "—", "Owner": "@owner", "Linked Personas": "—", "Depends On": "—",
        },
        "dims_block": derived["dims_block"],
        "tail": derived["tail"],
        "log": [derived["log_line"]],
    }


def _log(item: dict, entry: str) -> None:
    """Append a log line unless it is already there — keeps same-day re-runs stable."""
    if entry not in item["log"]:
        item["log"].append(entry)


def plan_upsert(parsed: dict, derived_by_key: dict, audited_keys: set) -> list[dict]:
    """Decide what happens to every item and every finding. Pure — no I/O, no dates.

    The load-bearing rule: a unit is only 'passing' if it was actually re-audited
    this run. Absence from `audited_keys` (a scoped --path run, a malformed batch)
    means 'not measured', never 'fixed'.
    """
    actions: list[dict] = []
    seen: set[str] = set()

    for item in parsed["items"]:
        key = item["unit_key"]
        seen.add(key)
        derived = derived_by_key.get(key)
        status = item["fields"].get("Status", "BACKLOG").upper()

        if item["state"] == STATE_WONTFIX:
            action = "frozen"
        elif key not in audited_keys:
            action = "untouched"
        elif derived:                                    # measured, still failing
            if item["state"] == STATE_CLOSED:
                action = "reopen"
            elif status == "DONE":
                action = "conflict"                      # a human closed it; don't fight them
            else:
                action = "refresh"
        else:                                            # measured, and it passed
            if item["state"] in OPEN_STATES and status != "DONE":
                action = "autoclose"
            else:
                action = "untouched"
        actions.append({"action": action, "item": item, "derived": derived})

    for key, derived in sorted(derived_by_key.items(),
                               key=lambda kv: (PRIORITY_RANK[kv[1]["priority"]], kv[0])):
        if key not in seen:
            actions.append({"action": "create", "item": None, "derived": derived})
    return actions


def apply_upsert(parsed: dict, plan: list[dict], today: str) -> tuple[str, dict]:
    """Render the new debt doc. Machine fields regenerate; human fields survive."""
    report = {k: 0 for k in ("created", "refreshed", "autoclosed", "reopened",
                             "frozen", "conflicts", "untouched")}
    next_num = next_item_number(parsed)
    code = parsed["items"][0]["id"].rsplit("-", 1)[0] if parsed["items"] else DEBT_GROUP_CODE
    items: list[dict] = []

    for entry in plan:
        action, item, derived = entry["action"], entry["item"], entry["derived"]

        if action == "create":
            items.append(_new_item(f"{code}-{next_num:03d}", derived, today))
            next_num += 1
            report["created"] += 1
            continue

        if action in ("frozen", "untouched"):
            report["frozen" if action == "frozen" else "untouched"] += 1
            items.append(item)
            continue

        if action == "conflict":
            _log(item, f"{today} ⚠ marked DONE by hand, but the auditor still scores "
                       f"{derived['band']} ({derived['pct']}%)")
            report["conflicts"] += 1
            items.append(item)
            continue

        if action == "autoclose":
            item["fields"]["Status"] = "DONE"
            item["fields"]["Completion"] = "100%"
            item["fields"]["Updated"] = today
            item["state"] = STATE_CLOSED
            _log(item, f"{today} auto-closed — unit now passes the rubric")
            report["autoclosed"] += 1
            items.append(item)
            continue

        # refresh | reopen — the machine head is rebuilt, the human tail is kept.
        before = render_item(item)
        item["title"] = derived["title"]
        item["dims_block"] = derived["dims_block"]
        item["fields"]["Priority"] = derived["priority"]
        if action == "reopen":
            item["fields"]["Status"] = "BACKLOG"
            item["fields"]["Completion"] = "0%"
            item["state"] = STATE_REGRESSED
            _log(item, f"{today} regressed — {derived['band']} ({derived['pct']}%) again")
            report["reopened"] += 1
        else:
            report["refreshed"] += 1
        # Only stamp Updated when something actually moved, so an unchanged re-run
        # produces a byte-identical file and `git diff` stays honest.
        if render_item(item) != before:
            item["fields"]["Updated"] = today
        items.append(item)

    return parsed["prefix"] + "".join(render_item(i) for i in items), report


def atomic_write(path: Path, text: str) -> None:
    """Write via a same-directory temp file + os.replace, so a crash never truncates."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent,
                                     delete=False) as handle:
        handle.write(text)
        temp = Path(handle.name)
    os.replace(temp, path)


# ---------------------------------------------------------------------------
# Document assembly
# ---------------------------------------------------------------------------


def build_document(project_name: str, tier: str, summary: str,
                   fragments: list[str], file_count: int, batch_count: int) -> str:
    header = f"""\
# Modularity Audit — {project_name}

> **Generated:** {date.today().isoformat()} · **Tier:** {tier} · \
**Files audited:** {file_count} · **Batches:** {batch_count}
> **Method:** CFAI Gold Standards — `architecture/modularity-audit-reckoner.md`
> **Rubric:** `architecture/architecture-principles-reckoner.md`
> Re-run `python3 module-audit.py` each sprint and diff the codebase grade.

---

{summary}

---

## Full Inventory & Per-Unit Scores

<details>
<summary>Per-batch function inventory and scores ({batch_count} batches)</summary>

{chr(10).join(fragments)}

</details>
"""
    return header


# ---------------------------------------------------------------------------
# Self-test — no model call, no writes
# ---------------------------------------------------------------------------


SELF_TEST_REPLY = """\
| Function | Location | Inputs | Processing | Outputs | Grade |
| baz | src/foo.py:42 | none | mutates a global | None | F |

```json
[{"tier": 1, "path": "src/foo.py", "symbol": "Bar.baz", "line": 42, "title": "Bar.baz",
  "dims": {"cyclomatic": "G", "cognitive": "G", "params": "G", "loc": "G",
           "nesting": "G", "purity": "R", "io_contract": "R", "test_present": "G"}},
 {"tier": 1, "path": "src/ok.py", "symbol": "fine", "line": 1, "title": "fine",
  "dims": {"cyclomatic": "G", "cognitive": "G", "params": "G", "loc": "G",
           "nesting": "G", "purity": "G", "io_contract": "G", "test_present": "G"}}]
```
"""


def self_test(root: Path, subpath: str | None, tier: str) -> None:
    print("module-audit.py — self-test")
    print("=" * 42)
    assert tier in TIERS, f"invalid tier: {tier}"
    assert "🟢" in RUBRIC and "CRITICAL CAP" in RUBRIC, "rubric malformed"
    assert BATCH_CHAR_BUDGET > MAX_FILE_CHARS, "batch budget must exceed max file size... check"
    files = discover_sources(root, subpath)
    batches = batch_files(files, root)

    # --- The rubric, as data: weights, bands, critical caps ---
    assert sum(TIER1_WEIGHTS.values()) * 2 == 24, "tier 1 max score must be 24"
    assert compute_grade({d: "G" for d in TIER1_DIMS}, 1) == (100, "A", False)
    assert compute_grade({**{d: "G" for d in TIER1_DIMS}, "purity": "R"}, 1)[1] == "C"
    assert compute_grade({**{d: "G" for d in TIER2_DIMS}, "circular_deps": "R"}, 2)[1] == "F"
    assert compute_grade({**{d: "G" for d in TIER3_DIMS}, "timeout": "R"}, 3)[1] == "C"
    assert normalize_score("🔴") == "R" and normalize_score(2) == "G"
    assert normalize_score("maybe") is None
    assert unit_key({"tier": 1, "path": "a.py", "symbol": "f", "line": 9}) == "a.py::f"
    assert unit_key({"tier": 1, "path": "a.py", "symbol": "f", "line": 99}) == "a.py::f"
    assert find_cycles({"a": {"b"}, "b": {"a"}}) == [["a", "b"]]
    assert find_cycles({"a": {"b"}, "b": set()}) == []

    # --- The model boundary: parse, validate, degrade safely ---
    records, audited, problems = collect_records([SELF_TEST_REPLY])
    assert len(records) == 1 and not problems, (records, problems)   # only the failing unit
    assert len(audited) == 2, audited                                # both units were measured
    assert collect_records(["total garbage"]) == ([], set(), ["batch 1: no parseable JSON "
                                                              "records in model reply"])
    assert "```json" not in strip_json_block(SELF_TEST_REPLY)
    assert "| Function |" in strip_json_block(SELF_TEST_REPLY)

    # --- The ledger: create -> refresh (human edit survives) -> auto-close -> idempotent ---
    today = "2026-01-01"
    derived = {unit_key(records[0]): derive_item(records[0], today)}
    key = next(iter(derived))
    doc = scaffold_debt_group()
    assert "class: debt" in doc, "the debt group must declare class: debt"

    def upsert(text, found, seen):
        parsed = parse_debt_group(text)
        return apply_upsert(parsed, plan_upsert(parsed, found, seen), today)

    filed, report = upsert(doc, derived, audited)
    assert report["created"] == 1 and "### MDT-001" in filed
    assert "| Priority | `P0 - Critical` |" in filed, filed   # two critical 🔴s
    assert "| Effort | `L` |" in filed

    again, report = upsert(filed, derived, audited)
    assert again == filed, "re-running on unchanged code must be byte-identical"
    assert report["refreshed"] == 1 and report["created"] == 0

    edited = filed.replace("| Owner | `@owner` |", "| Owner | `@alice` |")
    kept, _ = upsert(edited, derived, audited)
    assert "| Owner | `@alice` |" in kept, "human-owned fields must survive a refresh"

    closed, report = upsert(filed, {}, audited)
    assert report["autoclosed"] == 1 and "| Status | `DONE` |" in closed

    untouched, report = upsert(filed, {}, set())
    assert report["autoclosed"] == 0 and report["untouched"] == 1, \
        "a unit that was not re-audited must never auto-close"

    print(f"  project        : {root}")
    print(f"  scope          : {subpath or '(whole project)'}")
    print(f"  tier           : {tier}")
    print(f"  source files   : {len(files)}")
    print(f"  batches        : {len(batches)}")
    print(f"  rubric tiers   : function, module, api")
    print(f"  output target  : {DEFAULT_OUTPUT}")
    print(f"  debt ledger    : {DEBT_GROUP_FILE}  (class: debt — excluded from coverage)")
    print("\n  OK — rubric, discovery, batching, JSON parsing, grading and the")
    print("  upsert/auto-close ledger all verified. No model call, no writes.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Audit a codebase for modularity and emit a health scorecard."
    )
    parser.add_argument("--project", "-p", default=str(Path(__file__).resolve().parent),
                        help="Target project root (default: this script's directory).")
    parser.add_argument("--path", help="Restrict the audit to a subtree (e.g. src/services).")
    parser.add_argument("--tier", choices=TIERS, default="all",
                        help="Which scorecard tier(s) to run (default: all).")
    parser.add_argument("--output", "-o", default=DEFAULT_OUTPUT,
                        help=f"Output path relative to project (default: {DEFAULT_OUTPUT}).")
    parser.add_argument("--dry-run", action="store_true",
                        help="List files + batches that would be audited; no model call.")
    parser.add_argument("--self-test", action="store_true",
                        help="Validate rubric + discovery + batching; no model call.")
    parser.add_argument("--file-backlog", action="store_true",
                        help=f"File prioritized remediation items into {DEBT_GROUP_FILE} "
                             "and auto-close units that now pass. Off by default.")
    parser.add_argument("--backlog-dry-run", action="store_true",
                        help="Audit and compute the backlog merge plan, but write nothing "
                             "to docs/backlog/. Preview for --file-backlog.")
    parser.add_argument("--debt-code", default=DEBT_GROUP_CODE,
                        help=f"Item-ID prefix for the debt group (default: {DEBT_GROUP_CODE}).")
    args = parser.parse_args()

    root = Path(args.project).expanduser().resolve()
    if not root.is_dir():
        sys.exit(f"ERROR: project path is not a directory: {root}")

    if args.self_test:
        self_test(root, args.path, args.tier)
        return

    files = discover_sources(root, args.path)
    batches = batch_files(files, root)

    if not files:
        sys.exit("No auditable source files found. Check --path and SOURCE_EXTENSIONS.")

    if args.dry_run:
        print(f"Project : {root}")
        print(f"Scope   : {args.path or '(whole project)'}")
        print(f"Tier    : {args.tier}")
        print(f"Files   : {len(files)}  |  Batches : {len(batches)}\n")
        for i, batch in enumerate(batches, 1):
            print(f"  Batch {i}: {len(batch)} file(s)")
            for f in batch:
                print(f"    {f.relative_to(root)}")
        print(f"\nDry run — no model call, no write. Output would be: {args.output}")
        if args.file_backlog or args.backlog_dry_run:
            print(f"Would also file remediation items into: {DEBT_GROUP_FILE}")
        return

    filing = args.file_backlog or args.backlog_dry_run
    print(f"Auditing {len(files)} file(s) in {len(batches)} batch(es) — tier '{args.tier}'\n")

    replies: list[str] = []
    fragments: list[str] = []
    for i, batch in enumerate(batches, 1):
        print(f"\n{'=' * 62}\n  Batch {i}/{len(batches)} — {len(batch)} file(s)\n{'=' * 62}")
        content = read_batch(batch, root)
        reply = run_claude(batch_prompt(content, args.tier, i, len(batches), emit_json=filing))
        replies.append(reply)
        header = "### " + ", ".join(str(f.relative_to(root)) for f in batch)
        fragments.append(f"{header}\n\n{strip_json_block(reply) if filing else reply}")

    # Tier 2 runs as its own pass: the structural dimensions are graph facts Python
    # computes, and a module's files can straddle two batches.
    tier2_records: list[dict] = []
    if args.tier in ("all", "module"):
        print(f"\n\n{'=' * 62}\n  Tier 2 — module health (import graph + manifest)\n{'=' * 62}")
        graph, ce = build_import_graph(files, root)
        cycles = find_cycles(graph)
        if cycles:
            print(f"  🔴 circular dependencies: {'; '.join(' → '.join(c) for c in cycles)}")
        modules = sorted(graph)
        model_raw, _ = extract_json_records(run_claude(tier2_prompt(module_manifest(files, root, ce))))
        tier1_records, _ = validate_records(
            [r for reply in replies for r in extract_json_records(reply)[0]])
        tier2_records = build_tier2_records(model_raw, modules, graph, ce, tier1_records)

    print(f"\n\n{'=' * 62}\n  Rolling up codebase scorecard…\n{'=' * 62}")
    summary = run_claude(summary_prompt("\n\n---\n\n".join(fragments), root.name))

    document = build_document(root.name, args.tier, summary, fragments, len(files), len(batches))
    dest = root / args.output
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(document, encoding="utf-8")
    print(f"\n\nDone. Scorecard written to {dest.relative_to(root)}")

    if not filing:
        print(f"Next: re-run with --file-backlog to file every 🔴/F unit into "
              f"{DEBT_GROUP_FILE}, then re-run next sprint.")
        return

    file_backlog(root, replies, tier2_records, args.debt_code, dry_run=args.backlog_dry_run)


def file_backlog(root: Path, replies: list[str], tier2_records: list[dict],
                 code: str, dry_run: bool) -> dict | None:
    """Upsert the debt ledger from this run's findings. Never destructive on failure."""
    records, audited, problems = collect_records(replies)
    for rec in tier2_records:                       # tier 2 is already validated + merged
        audited.add(unit_key(rec))
        if filing_predicate(rec["dims"], 2):
            records.append(rec)

    print(f"\n{'=' * 62}\n  Backlog filing\n{'=' * 62}")
    print(f"  units measured : {len(audited)}")
    print(f"  units failing  : {len(records)}")
    if problems:
        print(f"  ⚠ skipped {len(problems)} malformed finding(s):")
        for problem in problems[:10]:
            print(f"      {problem}")

    if not audited:
        print("\n  No valid findings parsed — docs/backlog/ left untouched.")
        print("  (The scorecard above is unaffected; nothing was auto-closed.)")
        return None

    today = date.today().isoformat()
    derived_by_key = {unit_key(r): derive_item(r, today) for r in records}
    path = root / DEBT_GROUP_FILE
    text = path.read_text(encoding="utf-8") if path.exists() else scaffold_debt_group(code)

    parsed = parse_debt_group(text)
    plan = plan_upsert(parsed, derived_by_key, audited)
    new_text, report = apply_upsert(parsed, plan, today)

    summary = "  ".join(f"{k}={v}" for k, v in report.items() if v)
    print(f"\n  {summary or 'no changes'}")
    if report["conflicts"]:
        print("  ⚠ conflict: an item is marked DONE by hand but still fails the rubric.")

    if dry_run:
        print(f"\n  [DRY] would write {DEBT_GROUP_FILE} ({len(new_text)} chars). Nothing written.")
        return report

    atomic_write(path, new_text)
    print(f"\n  Wrote {DEBT_GROUP_FILE}")
    print("  Next: run `python3 docs_update.py --backlog` to refresh the index.")
    return report


if __name__ == "__main__":
    main()
