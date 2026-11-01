#!/usr/bin/env python3
"""
module-audit.py — CFAI modularity auditor.

Enumerates every function in a codebase with its Input → Processing → Output
contract, then grades the health of each function, module, and outbound API
call against the CFAI modularity rubric. Emits a single scorecard document:
docs/audits/MODULARITY_AUDIT.md.

It scores TWO things, which are not the same question:

  HEALTH       Is this code well-formed?  (complexity, coupling, purity, the IPO
               contract of every function.)  Measured against the rubric.
  CONFORMANCE  Is this module WHAT IT WAS SUPPOSED TO BE — in the layer it belongs
               to, exposing only what it promised, importing only what it declared?
               Measured against .cfai/modules.yml, the Module Contract.

A rubric alone can only grade the code it happens to find. Without a declared
expected structure there is nothing to adhere TO, so `--init-contracts` bootstraps
one and `--plan` turns the findings into a sequenced programme of work that ends in
an Adherence Scorecard: one row per named modularity characteristic, each measured,
each carrying the command that reproves it.

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
    python3 module-audit.py --include-tests        # audit test/spec files as units too

The full loop, in order:

    python3 module-audit.py --project . --init-contracts          # 1. declare the target
    #    ... edit .cfai/modules.yml: what each module SHOULD be, then status: declared
    python3 module-audit.py --project . --tier all --file-backlog # 2. measure + file
    python3 module-audit.py --project . --plan                    # 3. sequence + prove
    python3 module-audit.py --project . --verify-plan             # 4. CI gate (non-zero on regression)

--dry-run, --self-test, --plan and --init-contracts never call the model.
--dry-run and --self-test never write files.

Test/spec files are EXCLUDED from the audit by default. A test file has no test for
itself, so audited as a unit it fails the rubric by construction: on a real monorepo
this filed 816 phantom debt items — 41% of the whole backlog. They are still scanned,
because "does foo.ts have a test?" is answered from the filesystem (Python), not from
what the model can see in one batch.

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
import threading
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

# The CFAI toolkit installs itself INTO the project root (adopt.py copies these there).
# They are vendored tooling, not the project's modularity. Left in, they are audited as
# the project's own code and — being root-level files — collapse into a phantom "."
# module carrying every toolkit symbol as an "export".
IGNORE_FILES = {
    "module-audit.py", "docs_update.py", "standards_report.py", "adopt.py",
    "idea_to_backlog.py", "generate_standard.py", "remindme.py", "session-doc-update.ts",
}

# Test files are excluded from the audit by default (--include-tests opts back in),
# but they are still SCANNED to answer "does this source file have a test?".
TEST_DIR_NAMES = {"__tests__", "tests", "test", "spec", "specs", "e2e",
                  "__mocks__", "testing", "fixtures"}
# Matches the test-marker in a file STEM: foo.test(.ts) · foo.spec · test_foo · foo_test
_TEST_STEM = re.compile(r"(?:\.(?:test|spec)$)|(?:^test_)|(?:_test$)", re.IGNORECASE)

# ---------------------------------------------------------------------------
# The rubric, as data. Python — not the model — owns grade, bands, critical caps,
# priority and effort. Model letter-grades drift ±1 band on borderline metrics
# (see the reckoner's "model-run scores drift" gotcha); a drifting grade would
# mean a drifting priority, which would mean the debt backlog churns every run.
# The model is reduced to a sensor that reports per-dimension 🟢/🟡/🔴.
# ---------------------------------------------------------------------------

# The rubric is VERSIONED. Adding or reweighting a dimension re-bands every grade
# ever recorded, so an artifact that does not say which rubric produced it makes the
# trend across that boundary a lie. Bump this on any change to the weights, the dims,
# or the caps — every artifact stamps it, and a ledger written under an older rubric
# is flagged rather than silently compared.
#   v1: 8 function dims (max 24). Scored the I and the O of the IPO contract.
#   v2: + single_responsibility (the P) and coupling (Rule 2's ladder) -> max 30.
#       test_present moved from the model to Python (it is a filesystem fact).
RUBRIC_VERSION = 2

TIER1_WEIGHTS = {
    "cyclomatic": 2, "cognitive": 2, "params": 1, "loc": 1,
    "nesting": 1, "purity": 2, "io_contract": 2, "test_present": 1,
    # The P of Input → Processing → Output. v1 asked the model to describe the
    # processing in a prose column and then never scored it, so a function doing
    # validation AND persistence AND formatting graded A on every other dimension.
    "single_responsibility": 2,
    # Rule 2's coupling ladder. Without it save(user, sendEmail=True) — the
    # principles reckoner's own flagship control-coupling gotcha — grades a clean A,
    # because two parameters is 🟢 on parameter count.
    "coupling": 1,
}
TIER1_DIMS = tuple(TIER1_WEIGHTS)
TIER1_MAX = sum(TIER1_WEIGHTS.values()) * 2         # derived, never a literal
# A 🔴 here caps the grade at C: these three are the IPO contract itself, and a unit
# that breaks one is not modular however well it scores on size and shape.
TIER1_CRITICAL = ("purity", "io_contract", "single_responsibility")

# A module carries TWO grades, scored over two disjoint dimension sets.
#
#   HEALTH      — is this code well-formed?      (unchanged from v1)
#   CONFORMANCE — is this module what its contract says it is?   (v2)
#
# They are deliberately NOT pooled into one grade. Pooling would inflate: an
# undeclared module cannot fail a conformance dim, so five free 🟢s would lift a
# genuinely broken module from F to D purely because the rubric grew. Two grades also
# say something one cannot: a module can be healthy but in the wrong place (well
# written, wrong dependencies), or conformant but rotten inside. Both are real, and
# the conformance number is the one that answers "do we adhere to our own design?"
TIER2_DIMS = ("instability", "efferent_coupling", "cohesion",
              "public_surface", "circular_deps", "mean_function_grade")
TIER2_AUTOMATIC_RED = "circular_deps"               # ≥1 cycle = automatic module 🔴

TIER2_CONFORMANCE_DIMS = (
    "contract_declared",            # is there a human-declared contract at all?
    "layer_conformance",            # does it respect the layer stack?
    "dependency_conformance",       # does it import only what it declared?
    "surface_conformance",          # does it export only what it promised?
    "effect_conformance",           # does it cause only the effects it declared?
    "responsibility_conformance",   # does the code still do the one job it claims?
)
# A layer violation inverts a dependency arrow — the same class of defect as a cycle,
# and just as fatal to testability. It forces conformance to F, like a cycle forces
# health to F.
TIER2_CONFORMANCE_AUTOMATIC_RED = "layer_conformance"
TIER2_CONFORMANCE_CRITICAL = ("layer_conformance", "dependency_conformance")
TIER2_ALL_DIMS = TIER2_DIMS + TIER2_CONFORMANCE_DIMS

TIER3_DIMS = ("contract_documented", "timeout", "retry", "error_handling",
              "auth_secrets", "versioning", "idempotency", "observability")
TIER3_CRITICAL = ("error_handling", "timeout")

DIMS_BY_TIER = {1: TIER1_DIMS, 2: TIER2_ALL_DIMS, 3: TIER3_DIMS}
# HEALTH criticals only. The conformance criticals live in TIER2_CONFORMANCE_CRITICAL
# and are applied by compute_conformance — folding them in here would let a layer
# violation cap the module's *health* grade, which is the pollution the two-grade
# split exists to prevent.
CRITICAL_BY_TIER = {1: TIER1_CRITICAL, 2: (TIER2_AUTOMATIC_RED,), 3: TIER3_CRITICAL}

# Which dims Python owns rather than the model. A dim in here is a FACT the
# filesystem or the import graph can answer, so asking the model for it only adds
# drift. The model is never even shown these — they are absent from the prompt.
PYTHON_DIMS_BY_TIER = {1: ("test_present",), 2: (), 3: ()}
TIER1_MODEL_DIMS = tuple(d for d in TIER1_DIMS if d not in PYTHON_DIMS_BY_TIER[1])
MODEL_DIMS_BY_TIER = {1: TIER1_MODEL_DIMS, 2: TIER2_DIMS, 3: TIER3_DIMS}

# ---------------------------------------------------------------------------
# The embedded rubric — a condensed mirror of the scorecards in
# architecture/modularity-audit-reckoner.md. Kept inline so the script is
# self-contained when copied to a project root.
# ---------------------------------------------------------------------------

RUBRIC = f"""\
CFAI MODULARITY RUBRIC v{RUBRIC_VERSION} (score each dimension 🟢2 / 🟡1 / 🔴0)

A function is an Input → Processing → Output unit. All three are scored:
  I = io_contract   P = single_responsibility   O = purity

TIER 1 — FUNCTION HEALTH
  cyclomatic              🟢≤5   🟡6-10  🔴>10     (weight ×2)
  cognitive               🟢≤7   🟡8-15  🔴>15     (weight ×2)
  params                  🟢≤3   🟡4-5   🔴>5      (weight ×1)
  loc (body)              🟢≤30  🟡31-60 🔴>60     (weight ×1)
  nesting (max depth)     🟢≤2   🟡3     🔴>3      (weight ×1)
  purity                  🟢pure/localized 🟡mixed 🔴hidden global mutation (weight ×2)
  io_contract             🟢typed+all inputs declared 🟡partial 🔴implicit/any/UNDECLARED inputs (weight ×2)
  single_responsibility   (weight ×2) — THE PROCESSING. State the unit's job in ONE
      sentence. 🟢 one responsibility, one reason to change. 🟡 the sentence needs an
      "and" — two jobs. 🔴 a grab-bag: validation AND persistence AND formatting, or a
      name that lies about what it does. Score the JOB, not the length: a 10-line
      function doing two unrelated things is 🟡, and a 200-line function doing exactly
      one thing well is 🟢 here (its size is already punished by loc/cyclomatic).
  coupling                (weight ×1) — HOW IT TALKS TO ITS CALLERS.
      🟢 data or stamp — it receives values or a record.
      🟡 control — a caller passes a flag that STEERS the callee's branching, e.g.
         save(user, sendEmail=true) or render(x, mode="compact"). The callee now
         branches on the caller's intent; each flag doubles the untested paths.
      🔴 common or content — it reads/writes shared global state, or reaches into
         another unit's internals.
  test_present            (weight ×1) — RESOLVED FROM THE FILESYSTEM. Do not score it.

  Grade = earned ÷ {TIER1_MAX}. A≥90 B80-89 C70-79 D60-69 F<60.
  CRITICAL CAP: any 🔴 on purity, io_contract OR single_responsibility caps the grade
  at C — those three ARE the IPO contract; breaking one is not a style nit.
  NOTE: inputs = parameters PLUS captured/ambient deps (globals, env, clock).
        A zero-param function reading globals is 🔴 on io_contract.

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
  Error handling on every call site (no silent catch{{}})
  Auth handled + secrets not inline
  Versioning / stable contract
  Idempotency for writes (retry-safe)
  Observability (structured log / metric / trace)
  Grade = passes ÷ 8, banded A-F. CRITICAL CAP: 🔴 on Error handling OR Timeout caps at C.
"""

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
    "single_responsibility": "L",   # splitting a unit means moving its callers too
    "layer_conformance": "L",       # an inverted arrow means the boundary is in the wrong place
    "io_contract": "M",
    "coupling": "M",          # a steering flag becomes two functions and N call-site edits
    "dependency_conformance": "M", "effect_conformance": "M",
    "responsibility_conformance": "M",
    "cyclomatic": "M", "cognitive": "M", "loc": "M", "nesting": "M",
    "cohesion": "M", "public_surface": "M", "efferent_coupling": "M",
    "instability": "M", "mean_function_grade": "M",
    "params": "S", "test_present": "S",
    "surface_conformance": "S",     # usually just unexporting a symbol
    "contract_declared": "S",       # write the contract
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

    Tier 1: earned ÷ TIER1_MAX (weighted). Tier 2: earned ÷ 2·|dims|. Tier 3: passes ÷ 8.
    The Tier-1 denominator is DERIVED from the weights, never a literal — a hard-coded
    24 silently became wrong the moment rubric v2 added a dimension.

    `capped` is True only when the cap actually lowered the band — a unit already at
    D or F is not "capped at C", and saying so on its item would be a lie.
    """
    if tier == 1:
        earned = sum(SCORE_VALUES[dims[d]] * w for d, w in TIER1_WEIGHTS.items())
        pct = round(earned / TIER1_MAX * 100)
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


def compute_conformance(dims: dict) -> tuple[int, str, bool]:
    """(percent, band, capped) for a module's adherence to its declared contract.

    Scored over TIER2_CONFORMANCE_DIMS only — never pooled with the health grade.
    This is THE adherence number: the one the remediation plan's scorecard reports
    and the one that answers "does this module match the structure we designed?".

    A module with no declared contract scores 🟢 on every dim except
    `contract_declared`. That is deliberate — we never invent a violation we did not
    observe, and an undeclared module has no layer to violate.
    """
    scored = [d for d in TIER2_CONFORMANCE_DIMS if d in dims]
    if not scored:
        return 100, "A", False
    earned = sum(SCORE_VALUES[dims[d]] for d in scored)
    pct = round(earned / (2 * len(scored)) * 100)
    band = _band(pct)

    if dims.get(TIER2_CONFORMANCE_AUTOMATIC_RED) == "R":
        return pct, "F", True
    if any(dims.get(d) == "R" for d in TIER2_CONFORMANCE_CRITICAL) and band in ("A", "B"):
        return pct, "C", True
    return pct, band, False


def filing_predicate(dims: dict, tier: int) -> bool:
    """File a remediation item iff the unit is D/F, or 🔴 on a critical dimension.

    The second clause matters: a function that scores an A on percentage but hides
    a global mutation is a 🔴 unit and must be filed.

    For a module, EITHER grade failing is enough — a module that is well written but
    imports across a layer boundary is still broken, just not in a way its health
    score can see. Note `contract_declared` is NOT critical: "this module has no
    contract yet" is one project-wide task (Wave 0), not N backlog items. Filing one
    per module would flood the ledger — the same failure the test-file exclusion
    just undid.
    """
    _, band, _ = compute_grade(dims, tier)
    if band in ("D", "F"):
        return True
    if any(dims.get(d) == "R" for d in CRITICAL_BY_TIER[tier]):
        return True
    if tier == 2:
        _, conf_band, _ = compute_conformance(dims)
        if conf_band in ("D", "F"):
            return True
        return any(dims.get(d) == "R" for d in TIER2_CONFORMANCE_CRITICAL)
    return False


def derive_priority(dims: dict, tier: int, band: str) -> str:
    """Deterministic P0–P3 from the rubric outcome. First match wins."""
    criticals = [d for d in CRITICAL_BY_TIER[tier] if dims.get(d) == "R"]
    if tier == 2:
        # A cycle or an inverted layer arrow: both move a boundary, and everything
        # inside that boundary is unstable until they land.
        if dims.get(TIER2_AUTOMATIC_RED) == "R" or \
                dims.get(TIER2_CONFORMANCE_AUTOMATIC_RED) == "R":
            return "P0 - Critical"
        if criticals or any(dims.get(d) == "R" for d in TIER2_CONFORMANCE_CRITICAL):
            return "P1 - High"
        _, conf_band, _ = compute_conformance(dims)
        # Bands sort A < B < C < D < F, so the WORSE of the two is the later letter.
        band = max(band, conf_band)
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
# The Module Contract — the EXPECTED structure, declared in .cfai/modules.yml
#
# The rubric alone can only measure intrinsic properties of whatever code it finds:
# how complex, how coupled, how many parameters. It cannot answer "is this module
# what it was SUPPOSED to be?" — because nothing ever said what it was supposed to
# be. The contract is that missing half. It declares, per module: one responsibility,
# an architectural layer, the intended public surface, an allow-list of dependencies,
# and a side-effect profile. Conformance is then measurable, and adherence to a named
# characteristic becomes something you can prove instead of assert.
# ---------------------------------------------------------------------------

CONTRACT_FILE = ".cfai/modules.yml"

# `status` gates conformance scoring. --init-contracts bootstraps every module from
# OBSERVED REALITY and marks it `provisional`: such a contract describes what IS, so
# scoring conformance against it would be vacuously 100% — a fake green. The human
# edits the draft from what-is to what-should-be and flips it to `declared`; the diff
# between those two IS the conformance gap. Only `declared` modules are scored.
STATUS_DECLARED, STATUS_PROVISIONAL, STATUS_EXEMPT, STATUS_MISSING = (
    "declared", "provisional", "exempt", "missing")

# How many symbols a bootstrapped contract lists before truncating. The file must stay
# hand-editable — that is the entire point of it — and a module with 200 exports would
# otherwise emit a 200-item line nobody will ever read, let alone narrow.
CONTRACT_LIST_CAP = 20


def parse_simple_yaml(text: str) -> dict:
    """Parse the YAML subset the contract file uses. Pure stdlib — no PyYAML.

    The toolkit is dependency-free by design (adopting projects must not need a pip
    install to run an audit), so this handles exactly what the contract format needs
    and nothing more: nested mappings by indentation, scalars, quoted strings, inline
    flow lists `[a, b]`, block lists, and `#` comments. Anything else raises.
    """
    root: dict = {}
    stack: list[tuple[int, object]] = [(-1, root)]   # (indent, dict-or-list)
    pending: tuple[int, dict, str] | None = None     # a 'key:' awaiting its first child

    for lineno, raw in enumerate(text.splitlines(), 1):
        line = _strip_comment(raw)
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip(" "))
        body = line.strip()

        # A bare `key:` does not say whether a mapping or a list follows. The first
        # child line does, so the container is materialized here, not there.
        if pending is not None:
            p_indent, p_parent, p_key = pending
            pending = None
            if indent > p_indent:
                container: object = [] if body.startswith("- ") else {}
                p_parent[p_key] = container
                stack.append((p_indent, container))
            else:
                p_parent[p_key] = None                  # an empty block

        while len(stack) > 1 and indent <= stack[-1][0]:
            stack.pop()
        parent = stack[-1][1]

        if body.startswith("- "):                       # block-list entry
            if not isinstance(parent, list):
                raise ValueError(f"{CONTRACT_FILE}:{lineno}: list item outside a list")
            parent.append(_scalar(body[2:]))
            continue

        if ":" not in body:
            raise ValueError(f"{CONTRACT_FILE}:{lineno}: expected 'key: value' — got {body!r}")
        if not isinstance(parent, dict):
            raise ValueError(f"{CONTRACT_FILE}:{lineno}: mapping key inside a list")

        key, _, value = body.partition(":")
        key, value = key.strip(), value.strip()
        if value == "":
            pending = (indent, parent, key)
        else:
            parent[key] = _scalar(value)

    if pending is not None:                             # a trailing empty block
        pending[1][pending[2]] = None
    return root


def _strip_comment(line: str) -> str:
    """Drop a trailing `#` comment, but never one inside quotes."""
    out, quote = [], ""
    for ch in line:
        if quote:
            if ch == quote:
                quote = ""
        elif ch in "\"'":
            quote = ch
        elif ch == "#":
            break
        out.append(ch)
    return "".join(out).rstrip()


def _scalar(token: str):
    """A YAML scalar: quoted string, inline list, int, bool, null, or bare string."""
    token = token.strip()
    if token.startswith("[") and token.endswith("]"):
        inner = token[1:-1].strip()
        return [_scalar(p) for p in inner.split(",")] if inner else []
    if len(token) >= 2 and token[0] == token[-1] and token[0] in "\"'":
        return token[1:-1]
    if token.lower() in ("null", "~", ""):
        return None
    if token.lower() in ("true", "false"):
        return token.lower() == "true"
    try:
        return int(token)
    except ValueError:
        return token


def load_contracts(root: Path) -> dict:
    """Read .cfai/modules.yml. A project with no contract file is not an error —
    it simply has no declared structure yet, which the Tier-0 scorecard reports."""
    path = root / CONTRACT_FILE
    try:
        doc = parse_simple_yaml(path.read_text(encoding="utf-8"))
    except OSError:
        return {"layers": {}, "modules": {}, "path": path, "present": False}
    except ValueError as exc:
        sys.exit(f"ERROR: {exc}")

    layers = doc.get("layers") or {}
    modules = doc.get("modules") or {}
    return {
        "layers": layers if isinstance(layers, dict) else {},
        "modules": {_norm_path(k): (v or {}) for k, v in modules.items()},
        "order": list((layers or {}).get("order") or []),
        "rubric_version": doc.get("rubric_version", 1),
        "path": path,
        "present": True,
    }


def module_status(contracts: dict, module: str) -> str:
    """declared | provisional | exempt | missing."""
    entry = contracts.get("modules", {}).get(_norm_path(module))
    if not entry:
        return STATUS_MISSING
    status = str(entry.get("status") or STATUS_PROVISIONAL).strip().lower()
    return status if status in (STATUS_DECLARED, STATUS_PROVISIONAL, STATUS_EXEMPT) \
        else STATUS_PROVISIONAL


def _declared(contracts: dict, module: str) -> dict | None:
    """The contract entry for `module`, but only if a human has DECLARED it."""
    if module_status(contracts, module) != STATUS_DECLARED:
        return None
    return contracts["modules"][_norm_path(module)]


def layer_violations(graph: dict, contracts: dict) -> dict[str, list[str]]:
    """Imports that point the wrong way through the layer stack.

    `layers.order` runs innermost/most-stable first. A module may depend on its own
    layer or any layer BEFORE it; depending on a layer AFTER it inverts the arrow —
    a domain module reaching out to infrastructure. That is the same class of defect
    as a cycle: it makes the inner layer untestable and un-reusable, so it is an
    automatic 🔴.
    """
    order = contracts.get("order") or []
    rank = {name: i for i, name in enumerate(order)}
    out: dict[str, list[str]] = {}
    for src in sorted(graph):
        src_entry = _declared(contracts, src)
        if not src_entry or src_entry.get("layer") not in rank:
            continue
        bad = []
        for dst in sorted(graph.get(src, ())):
            dst_entry = contracts.get("modules", {}).get(_norm_path(dst)) or {}
            dst_layer = dst_entry.get("layer")
            if dst_layer in rank and rank[dst_layer] > rank[src_entry["layer"]]:
                bad.append(dst)
        if bad:
            out[src] = bad
    return out


def dependency_violations(graph: dict, contracts: dict) -> dict[str, list[str]]:
    """Internal imports that are not on the module's declared allow-list."""
    out: dict[str, list[str]] = {}
    for src in sorted(graph):
        entry = _declared(contracts, src)
        if entry is None or "allowed_deps" not in entry:
            continue
        allowed = {_norm_path(d) for d in (entry.get("allowed_deps") or [])}
        bad = [d for d in sorted(graph.get(src, ())) if _norm_path(d) not in allowed]
        if bad:
            out[src] = bad
    return out


def surface_violations(actual_exports: dict, contracts: dict) -> dict[str, list[str]]:
    """Symbols a module exports that its contract never promised — leaked internals."""
    out: dict[str, list[str]] = {}
    for module, exported in sorted(actual_exports.items()):
        entry = _declared(contracts, module)
        if entry is None or "exports" not in entry:
            continue
        declared = {str(e) for e in (entry.get("exports") or [])}
        leaked = sorted(set(exported) - declared)
        if leaked:
            out[module] = leaked
    return out


def init_contracts_yaml(modules: list[str], graph: dict, exports: dict) -> str:
    """Bootstrap a contract for every module from OBSERVED reality, as `provisional`.

    This draft is deliberately NOT authoritative: it records what the code does today,
    including whatever boundary violations it currently commits. Editing it into what
    the code SHOULD do — and flipping `status` to `declared` — is the human's job, and
    the diff between the two is precisely the conformance gap the audit then measures.
    """
    lines = [
        "# CFAI Module Contracts — the EXPECTED structure of this codebase.",
        "#",
        "# Bootstrapped by `module-audit.py --init-contracts` from what the code does",
        "# TODAY. Every module is `provisional`, which means UNSCORED: a contract that",
        "# merely describes the status quo would grade 100% conformant and prove",
        "# nothing. Edit a module to what it SHOULD be, set `status: declared`, and the",
        "# audit will hold it to that from the next run on.",
        "#",
        "# Declare incrementally — an undeclared module is reported, never penalised.",
        "",
        "version: 1",
        f"rubric_version: {RUBRIC_VERSION}",
        "",
        "layers:",
        "  # Innermost / most stable FIRST. A module may depend on its own layer or any",
        "  # layer before it — never one after it. Rename these to your architecture.",
        "  order: [domain, application, adapter, infrastructure]",
        "  rule: downward_only",
        "",
        "modules:",
    ]
    for module in modules:
        deps = sorted(graph.get(module, ()))
        syms = sorted(exports.get(module, ()))
        lines.append(f"  {module}:")
        lines.append(f"    responsibility: \"TODO — one sentence, no 'and'.\"")
        lines.append(f"    layer: TODO")
        lines.append(f"    owner: \"@unassigned\"")
        # A module exporting 200 symbols IS the finding — but emitting all 200 on one
        # line makes the file unreadable, and this file has to be hand-edited or the
        # whole scheme fails. Truncate the draft and state the real number.
        if len(syms) > CONTRACT_LIST_CAP:
            lines.append(f"    # {len(syms)} exports — that is the finding. Narrow this to")
            lines.append(f"    # the surface you actually meant to publish.")
        lines.append(f"    exports: [{', '.join(syms[:CONTRACT_LIST_CAP])}]")
        if len(deps) > CONTRACT_LIST_CAP:
            lines.append(f"    # {len(deps)} outbound deps — narrow to what you would "
                         f"defend in review.")
        lines.append(f"    allowed_deps: [{', '.join(deps[:CONTRACT_LIST_CAP])}]")
        lines.append(f"    status: {STATUS_PROVISIONAL}")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# File discovery
# ---------------------------------------------------------------------------


def is_test_file(path: Path, root: Path) -> bool:
    """True if `path` is a test/spec file rather than product code.

    Test files are not your modularity. Audited as units they score 🔴 on
    `test_present` by construction — a test file has no test for itself — and
    they drown the ledger: on a real monorepo this filed 816 phantom debt items,
    41% of the backlog, every one of which had to be hand-frozen as `wontfix`.
    """
    try:
        rel = path.relative_to(root)
    except ValueError:
        rel = path
    if any(part in TEST_DIR_NAMES for part in rel.parts[:-1]):
        return True
    stem = path.stem                                  # 'foo.test' for foo.test.ts
    return bool(_TEST_STEM.search(stem))


def test_subject(stem: str) -> str:
    """The source stem a test-file stem covers: 'foo.test'/'test_foo'/'foo_test' -> 'foo'."""
    return _TEST_STEM.sub("", stem).strip("._-").lower()


def build_test_index(root: Path) -> set[str]:
    """Every source stem that has a test file somewhere in the repo.

    Whether `foo.ts` has a test is a FILESYSTEM FACT, not a model judgement — so
    Python owns it, per the same doctrine that keeps grade, band and priority out
    of the model's hands. Asking the model was doubly unreliable: it only ever
    sees one batch, so it could not see a test file that lived in another batch.
    """
    subjects: set[str] = set()
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in SOURCE_EXTENSIONS:
            continue
        if any(part in IGNORE_DIRS for part in path.parts):
            continue
        if is_test_file(path, root):
            subjects.add(test_subject(path.stem))
    return subjects


def has_test(path: Path, root: Path, index: set[str]) -> bool:
    """True if some test file in the repo names `path`'s stem as its subject."""
    return path.stem.lower() in index


def discover_sources(root: Path, subpath: str | None,
                     include_tests: bool = False) -> list[Path]:
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
        if path.name in IGNORE_FILES:
            continue
        if any(path.name.endswith(sfx) for sfx in IGNORE_SUFFIXES):
            continue
        if not include_tests and is_test_file(path, root):
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


def validate_records(raw: list[dict], fill=None) -> tuple[list[dict], list[str]]:
    """Keep well-formed records, drop the rest with a reason. Pure, never raises.

    `fill(rec) -> {dim: score}` supplies the Python-owned dims (PYTHON_DIMS_BY_TIER).
    Its answer OVERRIDES anything the model volunteered for those dims — the
    filesystem is not up for debate. Without `fill`, the model's value is used if it
    supplied one, and the record is rejected as unscored if it did not, so a missing
    fill fails loudly instead of silently greening the dim.
    """
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
        try:
            line = int(rec.get("line")) if rec.get("line") is not None else None
        except (TypeError, ValueError):
            line = None

        unit = {"tier": tier, "path": path, "symbol": symbol, "line": line,
                "title": str(rec.get("title") or symbol).strip(), "dims": {}}

        python_owned = PYTHON_DIMS_BY_TIER.get(tier, ()) if fill else ()
        computed = fill(unit) if fill else {}

        dims: dict[str, str] = {}
        missing = []
        for dim in DIMS_BY_TIER[tier]:
            if dim in python_owned:
                score = normalize_score(computed.get(dim))
            else:
                score = normalize_score(raw_dims.get(dim)) if dim in raw_dims else None
            if score is None:
                missing.append(dim)
            else:
                dims[dim] = score
        if missing:
            problems.append(f"record {i} ({path}::{symbol}): unscored dims {', '.join(missing)}")
            continue

        unit["dims"] = dims
        good.append(unit)
    return good, problems


def collect_records(batch_texts: list[str], fill=None) -> tuple[list[dict], set[str], list[str]]:
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
        good, validate_problems = validate_records(raw, fill=fill)
        problems += [f"batch {batch_no}: {p}" for p in extract_problems + validate_problems]
        for rec in good:
            audited.add(unit_key(rec))
            if filing_predicate(rec["dims"], rec["tier"]):
                records.append(rec)
    return records, audited, problems


def python_dims_fill(root: Path, test_index: set[str]):
    """The `fill` closure for validate_records: the dims Python owns, per record."""
    def fill(rec: dict) -> dict:
        if rec.get("tier") != 1:
            return {}
        return {"test_present": "G" if has_test(root / rec["path"], root, test_index) else "R"}
    return fill


# ---------------------------------------------------------------------------
# Claude invocation (streaming, mirrors toolkit/adopt.py)
# ---------------------------------------------------------------------------

AUDIT_SYSTEM = """\
You are a senior software architect running a modularity audit. You apply the
CFAI modularity rubric objectively and report only what the code shows — never
invent functions, files, or scores. Be terse and tabular. Output ONLY markdown.
"""


def run_claude(user_prompt: str, echo: bool = True) -> str:
    """Send a prompt to the `claude` CLI and return the final assistant text.

    The prompt is piped on STDIN, never passed as an argv element. The rollup
    prompt concatenates every batch fragment into one string, which overflows the
    OS ARG_MAX (~1 MiB for the whole argv+env on macOS) and dies with
    `OSError: [Errno 7] Argument list too long`. `claude -p` with no positional
    prompt reads it from stdin instead. This is the crash that forced a 355-batch
    LBWT audit to be salvaged rather than completed.

    stdin and stderr are pumped on threads. The child blocks once a pipe buffer
    fills, so writing a multi-megabyte prompt inline — or leaving stderr undrained
    for the length of the run — would deadlock against our own stdout read.
    """
    proc = subprocess.Popen(
        [
            "claude", "-p",
            "--system-prompt", AUDIT_SYSTEM,
            *model_flags("CFAI_AUDIT_MODEL"),
            *CLAUDE_ISOLATION,
            "--tools", "",                     # load-bearing: no filesystem tool prompts
            "--output-format", "stream-json",
            "--include-partial-messages",
            "--verbose",
        ],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    def _feed() -> None:
        try:
            proc.stdin.write(user_prompt)
            proc.stdin.close()
        except (BrokenPipeError, ValueError, OSError):
            pass

    errors: list[str] = []
    writer = threading.Thread(target=_feed, daemon=True)
    drainer = threading.Thread(target=lambda: errors.append(proc.stderr.read()), daemon=True)
    writer.start()
    drainer.start()

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
    writer.join(timeout=5)
    drainer.join(timeout=5)
    if proc.returncode != 0:
        sys.exit(f"\nERROR: claude CLI failed:\n{''.join(errors)}")
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
- Tier 1 dims: {", ".join(TIER1_MODEL_DIMS)}
- Tier 3 dims: {", ".join(TIER3_DIMS)}
- Do NOT emit a grade, band or priority — those are computed downstream.
- Do NOT score test coverage. Whether a unit has a test is resolved from the
  filesystem, not from what you can see in this batch.
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

TIER2_MODEL_DIMS = ("cohesion", "public_surface", "instability",
                    "effect_conformance", "responsibility_conformance")
_EXPORT = re.compile(
    r"(?m)^\s*(?:export\s+(?:default\s+)?(?:function|const|class)|def\s|class\s|func\s|public\s)")

# Captures the NAME of each top-level exported symbol, which surface_violations needs
# to diff the actual public surface against the declared one. Anchored at column 0:
# an indented `def` is a method, not a module export.
_EXPORT_NAME = re.compile(r"""(?mx)
    ^
    (?: export \s+ (?:default\s+)? (?:async\s+)?
          (?:function|const|let|var|class|interface|type|enum) \s+ (\w+)
      | (?:async\s+)? def \s+ (\w+)
      | class \s+ (\w+)
      | func \s+ (?:\([^)]*\)\s*)? (\w+)
    )
""")


def module_exports(files: list[Path], root: Path) -> dict[str, set[str]]:
    """The ACTUAL public surface of each module: every top-level exported symbol.

    Leading-underscore names are private by convention in every language the auditor
    covers, so they are not part of the surface a contract must declare.
    """
    out: dict[str, set[str]] = {}
    for path in files:
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        names = {next(g for g in m.groups() if g) for m in _EXPORT_NAME.finditer(text)}
        surface = {n for n in names if not n.startswith("_")}
        out.setdefault(module_of(path, root), set()).update(surface)
    return out


def module_manifest(files: list[Path], root: Path, ce: dict[str, int],
                    contracts: dict | None = None) -> str:
    """A compact per-module summary for the model to score the qualitative dims.

    Each line carries the module's contract status and, when declared, its stated
    responsibility and effects — the model cannot judge conformance to a contract it
    cannot see, and must not guess at one that does not exist.
    """
    contracts = contracts or {"modules": {}}
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
        status = module_status(contracts, module)
        line = (f"- {module}  |  files: {len(members)}  |  top-level defs/exports: "
                f"{exports}  |  outbound deps (Ce): {ce.get(module, 0)}  |  "
                f"contract: {status}  |  {names}")
        if status == STATUS_DECLARED:
            entry = contracts["modules"][_norm_path(module)]
            effects = ", ".join(str(e) for e in (entry.get("effects") or [])) or "none"
            line += (f"\n    responsibility: {entry.get('responsibility', '(unstated)')}"
                     f"\n    declared effects: {effects}")
        lines.append(line)
    return "\n".join(lines)


def tier2_prompt(manifest: str) -> str:
    return f"""\
{RUBRIC}

TASK — score TIER 2 for the modules below. Score ONLY these five dimensions. Every
other dimension (cycles, coupling, layering, dependency and surface conformance) is a
graph fact computed in Python and is NOT yours to judge.

HEALTH:
  cohesion         🟢low LCOM 🟡moderate 🔴high (unrelated responsibilities in one module)
  public_surface   🟢small/intentional 🟡broad 🔴everything exported
  instability      D=|A+I-1|  🟢≤0.3 🟡0.3-0.6 🔴>0.6

CONFORMANCE — score these ONLY for a module whose manifest line shows
`contract: declared`. For any other module output "G": an undeclared module has made
no promise, and inventing a violation of a promise nobody made is a false positive.
  effect_conformance          Does the module cause ONLY the side effects its contract
                              declares? 🟢 effects ⊆ declared. 🟡 an undeclared minor
                              effect (a log, a metric). 🔴 an undeclared major effect —
                              a DB write, a network call, filesystem or global mutation.
  responsibility_conformance  Does the code still do the ONE job the contract states?
                              🟢 it does. 🟡 it has drifted — it does that job and some
                              of another. 🔴 the module's actual job is not the stated
                              one at all.

Output ONE fenced ```json block: an array with one object per module.

  {{"tier": 2, "path": "src/services", "symbol": "<module>",
    "dims": {{"cohesion": "G", "public_surface": "Y", "instability": "G",
             "effect_conformance": "G", "responsibility_conformance": "G"}}}}

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


_CONTRACT_STATUS_SCORE = {
    STATUS_DECLARED: "G",
    STATUS_EXEMPT: "G",             # a deliberate opt-out is a decision, not a gap
    STATUS_PROVISIONAL: "Y",        # bootstrapped, not yet reviewed by a human
    STATUS_MISSING: "R",
}


def build_tier2_records(model_raw: list[dict], modules: list[str], graph: dict[str, set[str]],
                        ce: dict[str, int], tier1_records: list[dict],
                        contracts: dict | None = None,
                        exports: dict | None = None) -> list[dict]:
    """Merge model-scored qualitative dims with Python-computed structural dims.

    A module the model failed to score still gets a record: its structural failures
    (a circular dependency above all) are facts and must be filed. Unscored
    qualitative dims default to 🟢 — we never invent a failure the model didn't see.

    Every CONFORMANCE dim except the two the model owns is a fact derived from the
    import graph and the contract, so Python owns them outright. A module whose
    contract is not `declared` scores 🟢 on all of them: it has no declared layer to
    violate and no promised surface to leak. Only `contract_declared` marks the gap.
    """
    contracts = contracts or {"layers": {}, "modules": {}, "order": []}
    exports = exports or {}
    cyclic = {node for cycle in find_cycles(graph) for node in cycle}
    bad_layer = layer_violations(graph, contracts)
    bad_deps = dependency_violations(graph, contracts)
    bad_surface = surface_violations(exports, contracts)

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

        # --- conformance: Python owns four of six; the model owns two ---
        dims["contract_declared"] = _CONTRACT_STATUS_SCORE[module_status(contracts, module)]
        dims["layer_conformance"] = "R" if module in bad_layer else "G"
        dims["dependency_conformance"] = "R" if module in bad_deps else "G"
        dims["surface_conformance"] = "R" if module in bad_surface else "G"
        for dim in ("effect_conformance", "responsibility_conformance"):
            dims[dim] = normalize_score(model_dims.get(dim)) or "G"

        records.append({"tier": 2, "path": module, "symbol": "<module>", "line": None,
                        "title": module, "dims": dims})
    return records


# --- Tier 0 — the system scorecard -------------------------------------------
# The headline the report never had. Every number here is computed in Python from
# the import graph and the contract file — nothing is asked of the model, so nothing
# drifts. Tier 0 REPORTS; it does not file. Its findings are already filed by Tier 2
# (as module items), so giving it its own filing lane would double-count the work.


def afferent_coupling(graph: dict[str, set[str]]) -> dict[str, int]:
    """Ca — how many modules depend ON each module. A chokepoint has a high Ca."""
    ca: dict[str, int] = {m: 0 for m in graph}
    for deps in graph.values():
        for dst in deps:
            if dst in ca:
                ca[dst] += 1
    return ca


def tier0_scorecard(modules: list[str], graph: dict, ce: dict, contracts: dict,
                    tier1_records: list[dict], tier2_records: list[dict]) -> dict:
    """The system-level facts: contract coverage, layering, cycles, god-modules."""
    statuses = [module_status(contracts, m) for m in modules]
    declared = sum(1 for s in statuses if s == STATUS_DECLARED)
    provisional = sum(1 for s in statuses if s == STATUS_PROVISIONAL)
    exempt = sum(1 for s in statuses if s == STATUS_EXEMPT)
    total = len(modules) or 1

    ca = afferent_coupling(graph)
    dims_by_module = {r["path"]: r["dims"] for r in tier2_records}
    # A god-module: everything depends on it AND it is internally incoherent. Either
    # alone is fine — a widely-used, cohesive module is just a good library.
    gods = sorted(m for m in modules
                  if ca.get(m, 0) > 10 and dims_by_module.get(m, {}).get("cohesion") == "R")

    bad_layer = layer_violations(graph, contracts)
    health = [compute_grade(r["dims"], 2)[1] for r in tier2_records]
    conf = [compute_conformance(r["dims"])[1] for r in tier2_records]
    fn_bands = [compute_grade(r["dims"], 1)[1] for r in tier1_records if r.get("tier") == 1]

    return {
        "modules": len(modules),
        "declared": declared,
        "provisional": provisional,
        "exempt": exempt,
        "contract_coverage": round((declared + exempt) / total * 100),
        "layer_violations": {k: v for k, v in bad_layer.items()},
        "layer_violation_count": sum(len(v) for v in bad_layer.values()),
        "cycles": find_cycles(graph),
        "god_modules": gods,
        "health_bands": {b: health.count(b) for b in "ABCDF"},
        "conformance_bands": {b: conf.count(b) for b in "ABCDF"},
        "function_bands": {b: fn_bands.count(b) for b in "ABCDF"},
        "contract_present": contracts.get("present", False),
        # Zero API 🔴s means nothing when zero endpoints were audited. The scorecard
        # needs to tell "clean" apart from "never looked".
        "api_units": sum(1 for r in tier1_records if r.get("tier") == 3),
    }


def render_tier0(card: dict) -> str:
    """The Tier-0 section of the report. Deterministic — no model involved."""
    cycles = card["cycles"]
    lines = [
        "## Tier 0 — System",
        "",
        "| Characteristic | Target | Actual | |",
        "|---|---|---|---|",
        f"| Modules with a declared contract | 100% | {card['contract_coverage']}% "
        f"({card['declared']} declared · {card['provisional']} provisional · "
        f"{card['exempt']} exempt of {card['modules']}) | "
        f"{'✅' if card['contract_coverage'] == 100 else '❌'} |",
        f"| Circular dependencies | 0 | {len(cycles)} | "
        f"{'✅' if not cycles else '❌'} |",
        f"| Layer violations | 0 | {card['layer_violation_count']} | "
        f"{'✅' if not card['layer_violation_count'] else '❌'} |",
        f"| God-modules (Ca > 10 and 🔴 cohesion) | 0 | {len(card['god_modules'])} | "
        f"{'✅' if not card['god_modules'] else '❌'} |",
        "",
    ]
    if not card["contract_present"]:
        lines += [
            "> **No `.cfai/modules.yml` — this codebase has not declared its intended "
            "structure.** Conformance is therefore unmeasured, not passing. Run "
            "`module-audit.py --init-contracts` to bootstrap one from what the code does "
            "today, then edit it to what it *should* do.",
            "",
        ]
    if cycles:
        lines.append("**Circular dependencies** (each is an automatic module 🔴):")
        lines += [f"- {' → '.join(c)}" for c in cycles]
        lines.append("")
    if card["layer_violations"]:
        lines.append("**Layer violations** (a dependency pointing the wrong way):")
        lines += [f"- `{src}` → {', '.join(f'`{d}`' for d in dsts)}"
                  for src, dsts in sorted(card["layer_violations"].items())]
        lines.append("")
    if card["god_modules"]:
        lines.append("**God-modules:** " + ", ".join(f"`{m}`" for m in card["god_modules"]))
        lines.append("")

    def dist(name: str, bands: dict) -> str:
        total = sum(bands.values())
        body = "  ".join(f"{b}:{bands[b]}" for b in "ABCDF")
        return f"- **{name}** ({total}): {body}"

    graded = sum(card["function_bands"].values()) + sum(card["health_bands"].values())
    if graded:
        lines += [
            "### Grade distribution",
            "",
            dist("Functions (tier 1)", card["function_bands"]),
            dist("Module health (tier 2)", card["health_bands"]),
            dist("Module conformance (tier 2)", card["conformance_bands"]),
            "",
        ]
    return "\n".join(lines)


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
    "single_responsibility": "Single responsibility (one reason to change)",
    "coupling": "Coupling type (data / control / common)",
    "instability": "Instability–abstractness distance", "efferent_coupling": "Efferent coupling (Ce)",
    "cohesion": "Cohesion (LCOM)", "public_surface": "Public surface",
    "circular_deps": "Circular dependencies", "mean_function_grade": "Mean function grade",
    "contract_declared": "Module contract declared",
    "layer_conformance": "Layer conformance (dependency direction)",
    "dependency_conformance": "Dependencies within the declared allow-list",
    "surface_conformance": "Public surface matches the declared exports",
    "effect_conformance": "Side effects match the declared profile",
    "responsibility_conformance": "Code matches the declared responsibility",
    "contract_documented": "Contract documented", "timeout": "Timeout set",
    "retry": "Retry / backoff policy", "error_handling": "Error handling on every call site",
    "auth_secrets": "Auth handled, secrets not inline", "versioning": "Versioning / stable contract",
    "idempotency": "Idempotency for writes", "observability": "Observability",
}

CRITERIA_BY_DIM = {
    "purity": "Side effects extracted or injected; function pure or localized",
    "io_contract": "All inputs declared as typed parameters (no global/env/clock reads)",
    "single_responsibility": "Split until the unit's job is one sentence with no 'and'",
    "coupling": "Callers pass data, not control — replace steering flags with distinct functions",
    "cyclomatic": "Cyclomatic complexity ≤ 5",
    "cognitive": "Cognitive complexity ≤ 7",
    "params": "Parameter count ≤ 3 (introduce a params object)",
    "loc": "Function body ≤ 30 lines",
    "nesting": "Max nesting depth ≤ 2",
    "test_present": "Test present and passing",
    "circular_deps": "Circular dependency broken (move the shared boundary)",
    "layer_conformance": "Dependency arrow reversed — no module depends on an outer layer",
    "dependency_conformance": "Every import is on the module's declared allow-list "
                              "(or the contract is amended to admit it)",
    "surface_conformance": "Internals unexported, or the contract's `exports` amended",
    "effect_conformance": "Undeclared side effect removed, or declared in the contract",
    "responsibility_conformance": "Code matches its stated responsibility (move the "
                                  "stray work out, or restate the responsibility)",
    "contract_declared": f"Module declared in {CONTRACT_FILE} with `status: declared`",
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
    the entire contract with docs_update.py's coverage segmentation.

    `rubric_version` rides along so a ledger graded under an older rubric can be
    detected rather than silently compared. docs_update.py reads only the keys it
    knows (code/name/status/priority/owner/class) and ignores the rest.
    """
    return (
        f"<!-- BACKLOG_GROUP\n"
        f"code: {code}\n"
        f"name: {name}\n"
        f"status: Active\n"
        f"priority: P2\n"
        f"owner: \n"
        f"class: debt\n"
        f"rubric_version: {RUBRIC_VERSION}\n"
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
    """Split the debt doc into its prefix, its rubric version, and structured items. Pure."""
    parts = _ITEM_SPLIT.split(text)
    prefix, blocks = parts[0], parts[1:]

    # A ledger with no stamp predates versioning, so it is v1 by definition.
    version_match = re.search(r"(?m)^rubric_version:\s*(\d+)\s*$", prefix)
    rubric_version = int(version_match.group(1)) if version_match else 1

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
    return {"prefix": prefix, "items": items, "rubric_version": rubric_version}


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
    label = "Health" if derived["tier"] == 2 else "Grade"
    lines.append(f"- {label}: {derived['band']} ({derived['pct']}%){cap} · "
                 f"`{derived['location']}`")
    if derived["tier"] == 2:
        # A module carries two grades. Reporting only health would hide the module that
        # is beautifully written and in entirely the wrong place.
        cpct, cband, ccap = compute_conformance(derived["dims"])
        ccap_note = " · capped by critical 🔴" if ccap else ""
        lines.append(f"- Conformance: {cband} ({cpct}%){ccap_note} · "
                     f"contract `{CONTRACT_FILE}`")
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
# The Remediation Plan — from ledger to sequenced programme of work
#
# The ledger is a prioritized fix queue. On a real monorepo that is ~2,000 flat
# items, which is a landfill, not a plan: no order, no grouping, no target state,
# and nothing at the end that proves the work landed.
#
# The plan is a deterministic VIEW over that same ledger — no model call, so it is
# reproducible and cannot drift, and it reuses the existing unit-key identity rather
# than inventing a parallel tracking store. It adds the three things the ledger
# cannot express: sequence (waves), grouping (by module), and proof (the Adherence
# Scorecard).
# ---------------------------------------------------------------------------

PLAN_FILE = "docs/plans/MODULARITY_REMEDIATION_PLAN.md"
BASELINE_FILE = ".cfai/baseline.json"
# The last audit's Tier-0 card. `--plan` makes no model call, so it cannot recompute
# the grade distributions itself; it recomputes the cheap graph facts fresh (so the
# plan is never stale against the code) and reads the distributions from here.
AUDIT_CARD_FILE = ".cfai/last-audit.json"

# Effort points, shared with docs_update.py's coverage roll-up. An absent Effort
# weighs as M, exactly as it does there.
EFFORT_POINTS = {"XS": 1, "S": 2, "M": 4, "L": 8, "XL": 16}
DEFAULT_EFFORT_POINTS = EFFORT_POINTS["M"]

# The wave each failing dimension belongs to. This is the whole sequencing model, and
# it encodes ONE engineering rule: refactor outside-in, boundaries before internals.
# Splitting a function inside a module whose boundary is about to move is wasted work.
WAVE_OF_DIM = {
    # 0 — DECLARE. Conformance cannot be scored against a contract that doesn't exist.
    "contract_declared": 0,
    # 1 — STRUCTURE. Cycles and inverted layer arrows MOVE BOUNDARIES. Everything
    #     inside them is provisional until they land, so nothing else may start.
    "circular_deps": 1,
    "layer_conformance": 1,
    # 2 — BOUNDARIES. Now the module's edges: what it exposes, what it may reach for.
    "surface_conformance": 2,
    "dependency_conformance": 2,
    "efferent_coupling": 2,
    "instability": 2,
    "effect_conformance": 2,
    "responsibility_conformance": 2,
    "cohesion": 2,
    "public_surface": 2,
    # 3 — CONTRACTS. The I and the O of every function: declare the inputs, surface
    #     the effects. Do this before splitting anything — you cannot safely extract
    #     a function whose real inputs are still hidden in globals.
    "io_contract": 3,
    "purity": 3,
    "coupling": 3,
    # 4 — DECOMPOSE. The P: split the god-functions, now that their true I/O is visible.
    "single_responsibility": 4,
    "cyclomatic": 4,
    "cognitive": 4,
    "loc": 4,
    "nesting": 4,
    "params": 4,
    "mean_function_grade": 4,
    # 5 — INTEGRATIONS.
    "contract_documented": 5, "timeout": 5, "retry": 5, "error_handling": 5,
    "auth_secrets": 5, "versioning": 5, "idempotency": 5, "observability": 5,
    # 6 — TESTS. Last, against a shape that has finally stopped moving.
    "test_present": 6,
}

WAVE_NAMES = {
    0: "Declare — write the contracts",
    1: "Structure — break cycles, fix the layering",
    2: "Boundaries — surfaces, dependencies, effects",
    3: "Contracts — declare every function's inputs and effects",
    4: "Decompose — one responsibility per unit",
    5: "Integrations — harden the outbound calls",
    6: "Tests — cover what has stopped moving",
}


def wave_of(dims: dict, tier: int) -> int | None:
    """The wave a unit belongs to: the LOWEST wave among its failing dimensions.

    Lowest, not highest — a module that is both in a cycle and leaking its surface
    belongs in wave 1, because breaking the cycle may move the very boundary that
    defines that surface. Returns None for a unit with nothing failing.
    """
    waves = [WAVE_OF_DIM[d] for d in DIMS_BY_TIER[tier]
             if dims.get(d) == "R" and d in WAVE_OF_DIM]
    return min(waves) if waves else None


def item_points(item: dict) -> int:
    return EFFORT_POINTS.get((item["fields"].get("Effort") or "").strip().upper(),
                             DEFAULT_EFFORT_POINTS)


def package_effort(items: list[dict]) -> int:
    return sum(item_points(it) for it in items)


def _item_module(item: dict) -> str:
    """The module an item belongs to. Grouping BY MODULE is the point of the plan —
    a flat list of 2,000 functions is not something a team can pick up."""
    key = item["unit_key"]
    path, _, symbol = key.partition("::")
    if path == "<api>":
        return "<integrations>"
    if symbol == "<module>":
        return path
    return str(Path(path).parent.as_posix())


def _item_wave(item: dict) -> int:
    """Recover an item's wave from its rendered dims block.

    The plan is a view over the LEDGER, not over a fresh audit, so the dims are read
    back from the item the auditor already wrote. Labels are the stable interface —
    a human may reword the prose tail, but the dims block is machine-owned.
    """
    label_to_dim = {v: k for k, v in DIM_LABELS.items()}
    waves = []
    for line in item.get("dims_block", "").splitlines():
        line = line.strip()
        if not line.startswith("- 🔴"):
            continue
        dim = label_to_dim.get(line[4:].strip())
        if dim in WAVE_OF_DIM:
            waves.append(WAVE_OF_DIM[dim])
    return min(waves) if waves else max(WAVE_NAMES)


def plan_packages(parsed: dict) -> dict[str, list[dict]]:
    """Group the ledger's OPEN items by module, each stamped with its wave.

    A DONE item is finished work, not planned work. A `wontfix` item is a human
    decision that stands — the plan must not quietly re-litigate it.
    """
    packages: dict[str, list[dict]] = {}
    for item in parsed["items"]:
        status = (item["fields"].get("Status") or "").strip().upper()
        if status == "DONE" or item["state"] == STATE_WONTFIX:
            continue
        entry = dict(item)
        entry["wave"] = _item_wave(item)
        packages.setdefault(_item_module(item), []).append(entry)
    for items in packages.values():
        items.sort(key=lambda it: (it["wave"], PRIORITY_RANK.get(
            it["fields"].get("Priority", "P3 - Low"), 3), it["id"]))
    return packages


# --- The Adherence Scorecard — the showcase ---------------------------------
# One row per NAMED modularity characteristic, not one per item. This is the artifact
# that answers "do we adhere to the structure we said we wanted?". Every `current` is
# MEASURED — read off the graph or counted from the freshly-refreshed ledger — and
# every row carries the command that reproves it. Nothing here is self-reported.

ADHERENCE_CHARACTERISTICS = [
    # (id, dim, characteristic, target-as-text, source)
    ("S1", "contract_declared", "Every module declares a contract", "100%", "contract"),
    ("S2", "circular_deps", "Zero circular dependencies", "0", "graph"),
    ("S3", "layer_conformance", "Zero layer violations (dependencies point inward)",
     "0", "graph"),
    ("M1", "dependency_conformance", "Every import is on the module's declared allow-list",
     "0 🔴", "ledger"),
    ("M2", "surface_conformance", "Public surface matches the declared exports",
     "0 🔴", "ledger"),
    ("M3", "effect_conformance", "Side effects match the declared profile", "0 🔴", "ledger"),
    ("M4", "responsibility_conformance", "Each module does the one job it claims",
     "0 🔴", "ledger"),
    ("F1", "io_contract", "Every function declares all its inputs (the I)", "0 🔴", "ledger"),
    ("F2", "purity", "No hidden side effects (the O)", "0 🔴", "ledger"),
    ("F3", "single_responsibility", "Every function has one responsibility (the P)",
     "0 🔴", "ledger"),
    ("F4", "coupling", "Data coupling only — callers pass data, never control flags",
     "0 🔴", "ledger"),
    ("A1", "error_handling", "Every outbound call handles its errors", "0 🔴", "ledger"),
    ("A2", "timeout", "Every outbound call sets a timeout", "0 🔴", "ledger"),
]


def red_counts(parsed: dict) -> dict[str, int]:
    """How many OPEN items still carry each 🔴 dimension. Counted from the ledger the
    auditor just refreshed — so a characteristic can only clear when the units that
    failed it were actually re-audited and passed."""
    label_to_dim = {v: k for k, v in DIM_LABELS.items()}
    counts: dict[str, int] = {}
    for item in parsed["items"]:
        status = (item["fields"].get("Status") or "").strip().upper()
        if status == "DONE" or item["state"] == STATE_WONTFIX:
            continue
        for line in item.get("dims_block", "").splitlines():
            line = line.strip()
            if line.startswith("- 🔴"):
                dim = label_to_dim.get(line[4:].strip())
                if dim:
                    counts[dim] = counts.get(dim, 0) + 1
    return counts


# The rubric version each dimension was INTRODUCED in. A ledger written under an older
# rubric has no scores for a newer dim, so its zero-red count means "this was never
# checked", not "everything passed".
DIM_INTRODUCED_IN = {
    "single_responsibility": 2, "coupling": 2,
    **{d: 2 for d in TIER2_CONFORMANCE_DIMS},
}

# Conformance dims that are only meaningful once a human has DECLARED a contract. With
# every module `provisional`, nothing was scored — so zero violations proves nothing.
NEEDS_DECLARATION = ("layer_conformance", "dependency_conformance", "surface_conformance",
                     "effect_conformance", "responsibility_conformance")


def adherence_rows(card: dict, red_counts: dict,
                   ledger_version: int = RUBRIC_VERSION) -> list[dict]:
    """The scorecard. `card` supplies the graph facts; `red_counts` the ledger.

    Every row is met | unmet | UNMEASURED. The third state is the one that matters.

    A characteristic with zero violations has NOT necessarily passed — it may simply
    never have been checked: no module declared a contract, or the dimension postdates
    the ledger. Reporting that as ✅ is the same fake green the `provisional` gate
    exists to prevent, just one level up, and it is how an audit becomes decoration.
    An unmeasured characteristic is never counted as met.
    """
    rows = []
    for cid, dim, characteristic, target, source in ADHERENCE_CHARACTERISTICS:
        if dim == "circular_deps":
            current = len(card["cycles"])
        elif dim == "layer_conformance":
            current = card["layer_violation_count"]
        elif dim == "contract_declared":
            current = card["contract_coverage"]
        else:
            current = red_counts.get(dim, 0)

        why = ""
        # The ledger-version check applies ONLY to rows whose value is counted from the
        # ledger. Contract coverage and the import graph are recomputed fresh on every
        # run, so an old ledger says nothing about them.
        if source == "ledger" and ledger_version < DIM_INTRODUCED_IN.get(dim, 1):
            why = (f"the ledger is rubric v{ledger_version}; this dimension arrived in "
                   f"v{DIM_INTRODUCED_IN[dim]} — re-run `--file-backlog` to re-grade")
        elif dim in NEEDS_DECLARATION and not card.get("declared"):
            why = (f"no module is `declared` in {CONTRACT_FILE} — nothing was scored "
                   f"against a contract")
        elif dim in TIER3_DIMS and not card.get("api_units"):
            why = "no outbound API call was audited"

        if why:
            status, met, shown = "unmeasured", False, "—"
        else:
            met = (current == 100) if dim == "contract_declared" else (current == 0)
            status = "met" if met else "unmet"
            shown = current

        evidence = {
            "contract": f"`{CONTRACT_FILE}`",
            "graph": "import graph (Python)",
            "ledger": f"`{DEBT_GROUP_FILE}`",
        }[source]
        rows.append({"id": cid, "dim": dim, "characteristic": characteristic,
                     "target": target, "current": current, "shown": shown,
                     "met": met, "status": status, "why": why, "evidence": evidence})
    return rows


def render_plan(project: str, parsed: dict, card: dict, baseline: dict, today: str) -> str:
    """The remediation plan. Deterministic — no model call, so re-running is a no-op
    when nothing changed, and a diff when something did."""
    packages = plan_packages(parsed)
    counts = red_counts(parsed)
    rows = adherence_rows(card, counts, parsed.get("rubric_version", RUBRIC_VERSION))
    total_effort = sum(package_effort(v) for v in packages.values())
    open_items = sum(len(v) for v in packages.values())

    out = [
        f"# Modularity Remediation Plan — {project}",
        "",
        f"> **Generated:** {today} · **rubric v{RUBRIC_VERSION}** · "
        f"**{open_items} open item(s)** across **{len(packages)} module(s)** · "
        f"**{total_effort} effort point(s)**",
        f"> **Auto-generated** by `module-audit.py --plan` from `{DEBT_GROUP_FILE}`. "
        "Do NOT edit by hand — fix the code, re-run the audit, regenerate.",
        f"> Target state: `{CONTRACT_FILE}` (the expected structure) + the rubric below.",
        "",
        "---",
        "",
        "## §1 Target State — what we are holding this codebase to",
        "",
        "These are the expected definitions. Every one is objectively measurable, and",
        "§5 reports whether we currently meet it.",
        "",
        "| # | Characteristic | Target |",
        "|---|---|---|",
    ]
    out += [f"| {r['id']} | {r['characteristic']} | {r['target']} |" for r in rows]
    out += [
        "",
        f"Per-module intent — one responsibility, one layer, a declared public surface and",
        f"a dependency allow-list — is declared in `{CONTRACT_FILE}` and is the other half",
        "of the target. A module still marked `provisional` there has declared nothing yet,",
        "and is reported as undeclared rather than scored.",
        "",
        "---",
        "",
        "## §2 Baseline — where we are now",
        "",
        render_tier0(card).split("\n", 1)[1].strip(),
        "",
        "---",
        "",
        "## §3 Waves — the order the work must be done in",
        "",
        "Refactor **outside-in: boundaries before internals.** Splitting a function inside",
        "a module whose boundary is about to move is wasted work, so a wave does not start",
        "until the one before it has landed. An item's wave is the *lowest* wave any of its",
        "failing dimensions maps to.",
        "",
        "| Wave | Focus | Items | Effort |",
        "|---|---|---|---|",
    ]
    by_wave: dict[int, list[dict]] = {}
    for items in packages.values():
        for it in items:
            by_wave.setdefault(it["wave"], []).append(it)
    for wave in sorted(WAVE_NAMES):
        items = by_wave.get(wave, [])
        marker = "—" if not items else str(len(items))
        out.append(f"| **Wave {wave}** | {WAVE_NAMES[wave]} | {marker} | "
                   f"{package_effort(items) if items else '—'} |")
    if card["contract_coverage"] < 100:
        out += [
            "",
            f"> **Wave 0 is one task, not {card['modules']}.** Run `--init-contracts`, then "
            f"declare modules in `{CONTRACT_FILE}` — starting with the subtree that carries "
            "your P0s. Undeclared modules are reported, never penalised, so this can be done "
            "incrementally. It is filed as a single work package rather than one debt item "
            "per module, because a ledger nobody can read is a ledger nobody acts on.",
        ]

    out += ["", "---", "", "## §4 Work packages — by module", ""]
    if not packages:
        out.append("_No open items. Every audited unit passes the rubric._")
    for module in sorted(packages, key=lambda m: (min(i["wave"] for i in packages[m]), m)):
        items = packages[module]
        out += [
            f"### `{module}`",
            "",
            f"**Entry:** waves {sorted({i['wave'] for i in items})[0]}+ · "
            f"**Effort:** {package_effort(items)} point(s) · **Items:** {len(items)}",
            "",
            "| Wave | Item | Unit | Priority | Effort |",
            "|---|---|---|---|---|",
        ]
        for it in items:
            unit = it["unit_key"].partition("::")[2] or it["unit_key"]
            out.append(f"| {it['wave']} | {it['id']} | `{unit}` | "
                       f"{it['fields'].get('Priority', '—')} | "
                       f"{it['fields'].get('Effort', 'M')} |")
        out += [
            "",
            "**Exit criteria** — not self-reported; run this and read the grade:",
            "",
            "```bash",
            f"python3 module-audit.py --project . --tier all --path {module} --file-backlog",
            "```",
            "",
            "Every item above auto-closes when, and only when, its unit is re-audited and "
            "passes. A unit that was not re-measured is left open — absence is never a fix.",
            "",
        ]

    out += [
        "---",
        "",
        "## §5 Adherence Scorecard — the proof",
        "",
        "One row per **expected modularity characteristic**. `Current` is *measured* on "
        "every regeneration — from the import graph, or by counting open 🔴s in the ledger "
        "the auditor just refreshed. Nothing here is asserted by hand.",
        "",
        "**⚪ UNMEASURED is not ✅ MET.** A characteristic with zero violations has not "
        "necessarily passed — it may never have been *checked*. Those rows are called out "
        "explicitly rather than rounded up to a pass, because a scorecard that flatters "
        "you is worse than no scorecard.",
        "",
        "| # | Characteristic | Target | Baseline | Current | Evidence | Status |",
        "|---|---|---|---|---|---|---|",
    ]
    icon = {"met": "✅", "unmet": "❌", "unmeasured": "⚪ unmeasured"}
    for r in rows:
        pct = "%" if r["dim"] == "contract_declared" else ""
        base = baseline.get(r["id"])
        base = "—" if base is None else f"{base}{pct}"
        shown = r["shown"] if r["shown"] == "—" else f"{r['shown']}{pct}"
        out.append(f"| {r['id']} | {r['characteristic']} | {r['target']} | {base} | "
                   f"{shown} | {r['evidence']} | {icon[r['status']]} |")

    met = sum(1 for r in rows if r["status"] == "met")
    unmet = sum(1 for r in rows if r["status"] == "unmet")
    unmeasured = [r for r in rows if r["status"] == "unmeasured"]
    out += [
        "",
        f"**{met} of {len(rows)} characteristics met** · {unmet} not met · "
        f"**{len(unmeasured)} UNMEASURED**",
    ]
    if unmeasured:
        out += [
            "",
            "### ⚪ Unmeasured — why, and what to do about it",
            "",
            "These are **not passes.** Nothing was scored against them.",
            "",
            "| # | Characteristic | Why it could not be measured |",
            "|---|---|---|",
        ]
        out += [f"| {r['id']} | {r['characteristic']} | {r['why']} |" for r in unmeasured]

    out += [
        "",
        "Reproduce this table end-to-end:",
        "",
        "```bash",
        "python3 module-audit.py --project . --tier all --file-backlog   # re-measure + refile",
        "python3 module-audit.py --project . --plan                       # regenerate this plan",
        "```",
        "",
    ]
    return "\n".join(out) + "\n"


def write_plan(root: Path, files: list[Path], contracts: dict,
               verify: bool, dry_run: bool) -> int:
    """Generate the remediation plan from the ledger. No model call — deterministic.

    Returns a process exit code: non-zero under --verify-plan when a characteristic
    has regressed against the frozen baseline. That is the CI gate.
    """
    ledger_path = root / DEBT_GROUP_FILE
    try:
        parsed = parse_debt_group(ledger_path.read_text(encoding="utf-8"))
    except OSError:
        sys.exit(f"ERROR: no debt ledger at {DEBT_GROUP_FILE}.\n"
                 f"       The plan is a VIEW over the ledger — there is nothing to sequence "
                 f"yet.\n       Run this first:\n"
                 f"         python3 module-audit.py --project . --tier all --file-backlog")

    if parsed["rubric_version"] != RUBRIC_VERSION:
        print(f"⚠  The ledger was graded under rubric v{parsed['rubric_version']}; this is "
              f"v{RUBRIC_VERSION}.\n   Grades are NOT comparable across that boundary — "
              f"re-run --file-backlog to re-grade before trusting the trend.\n")

    # Graph facts are cheap and Python-only, so recompute them rather than trust a
    # stale card: the plan must never claim a cycle is gone when the code still has it.
    graph, ce = build_import_graph(files, root)
    modules = sorted(graph)
    saved = load_baseline(root, AUDIT_CARD_FILE)
    card = tier0_scorecard(modules, graph, ce, contracts, [], [])
    for key in ("function_bands", "health_bands", "conformance_bands"):
        if saved.get(key):
            card[key] = saved[key]

    ledger_version = parsed.get("rubric_version", RUBRIC_VERSION)
    rows = adherence_rows(card, red_counts(parsed), ledger_version)
    baseline = save_baseline(root, rows) if not dry_run else load_baseline(root)
    doc = render_plan(root.name, parsed, card, baseline, date.today().isoformat())

    if dry_run:
        print(f"[DRY] would write {PLAN_FILE} — "
              f"{sum(1 for r in rows if r['met'])}/{len(rows)} characteristics met")
        return 0

    atomic_write(root / PLAN_FILE, doc)
    met = [r for r in rows if r["status"] == "met"]
    unmeasured = [r for r in rows if r["status"] == "unmeasured"]
    print(f"\nPlan written to {PLAN_FILE}")
    print(f"Adherence: {len(met)}/{len(rows)} characteristics met"
          + (f"  ·  {len(unmeasured)} UNMEASURED" if unmeasured else ""))
    for row in rows:
        if row["status"] == "unmet":
            print(f"  ❌ {row['id']} {row['characteristic']} — "
                  f"target {row['target']}, now {row['current']}")
    for row in unmeasured:
        print(f"  ⚪ {row['id']} {row['characteristic']} — NOT MEASURED: {row['why']}")

    if not verify:
        return 0

    # --verify-plan: a characteristic that got WORSE than its frozen baseline is a
    # regression, and the gate fails. Not-yet-met is fine — that is just work to do.
    regressed = []
    for row in rows:
        base = baseline.get(row["id"])
        # An unmeasured row has no honest current value, so it can neither regress nor
        # improve. Comparing its zero-count against a baseline would manufacture both.
        if base is None or row["status"] == "unmeasured":
            continue
        better_is_higher = row["dim"] == "contract_declared"
        worse = row["current"] < base if better_is_higher else row["current"] > base
        if worse:
            regressed.append(f"{row['id']} {row['characteristic']}: "
                             f"{base} → {row['current']}")
    if regressed:
        print("\n🔴 REGRESSION against the baseline:")
        for line in regressed:
            print(f"  - {line}")
        return 1
    print("\n✅ No regression against the baseline.")
    return 0


def load_baseline(root: Path, name: str = BASELINE_FILE) -> dict:
    try:
        return json.loads((root / name).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def save_baseline(root: Path, rows: list[dict]) -> dict:
    """Freeze the first measurement so the trend is real. Captured ONCE — a baseline
    that moves with the current value would always show zero progress.

    An UNMEASURED characteristic is recorded as null, not as its zero count: freezing
    "0 violations, because nobody looked" as the baseline would later read as a
    regression the moment you actually start measuring it and find some.
    """
    existing = load_baseline(root)
    if existing:
        return existing
    snapshot = {r["id"]: (None if r["status"] == "unmeasured" else r["current"])
                for r in rows}
    atomic_write(root / BASELINE_FILE, json.dumps(snapshot, indent=2) + "\n")
    return snapshot


# ---------------------------------------------------------------------------
# Document assembly
# ---------------------------------------------------------------------------


def build_document(project_name: str, tier: str, summary: str, fragments: list[str],
                   file_count: int, batch_count: int, tier0: dict | None = None) -> str:
    # Tier 0 is Python's, and it goes FIRST. Until v2 the Tier-2 records were computed
    # and then used only by the ledger — they never reached the report at all, so the
    # document's "Module Health" section was whatever the model inferred from prose.
    system = f"{render_tier0(tier0)}\n---\n\n" if tier0 else ""
    return f"""\
# Modularity Audit — {project_name}

> **Generated:** {date.today().isoformat()} · **Tier:** {tier} · \
**Rubric:** v{RUBRIC_VERSION} · \
**Files audited:** {file_count} · **Batches:** {batch_count}
> **Method:** CFAI Gold Standards — `architecture/modularity-audit-reckoner.md`
> **Rubric:** `architecture/architecture-principles-reckoner.md`
> **Contract:** `{CONTRACT_FILE}` — the expected structure this audit scores against.
> Re-run `python3 module-audit.py` each sprint and diff the codebase grade. Grades
> from a different rubric version are not comparable.

---

{system}{summary}

---

## Full Inventory & Per-Unit Scores

<details>
<summary>Per-batch function inventory and scores ({batch_count} batches)</summary>

{chr(10).join(fragments)}

</details>
"""


def init_contracts(root: Path, files: list[Path], dry_run: bool) -> None:
    """Bootstrap .cfai/modules.yml from the code as it stands today."""
    path = root / CONTRACT_FILE
    if path.exists():
        sys.exit(f"ERROR: {CONTRACT_FILE} already exists — refusing to overwrite it.\n"
                 f"       Delete it first if you really want to re-bootstrap; the file "
                 f"holds hand-declared intent that cannot be regenerated.")
    graph, _ = build_import_graph(files, root)
    exports = module_exports(files, root)
    modules = sorted(set(graph) | set(exports))
    text = init_contracts_yaml(modules, graph, exports)

    if dry_run:
        print(f"[DRY] would write {CONTRACT_FILE} — {len(modules)} module(s), all provisional")
        return
    atomic_write(path, text)
    print(f"Wrote {CONTRACT_FILE} — {len(modules)} module(s), every one `provisional`.\n")
    print("Provisional means UNSCORED. The draft records what the code does today, so")
    print("scoring conformance against it would grade 100% and prove nothing.\n")
    print("Next: edit a module to what it SHOULD be — its one responsibility, its layer,")
    print("its intended exports, the dependencies it is allowed — then set")
    print("`status: declared`. The audit holds it to that from the next run on.")
    print("Declare incrementally; an undeclared module is reported, never penalised.")


# ---------------------------------------------------------------------------
# Self-test — no model call, no writes
# ---------------------------------------------------------------------------


SELF_TEST_REPLY = """\
| Function | Location | Inputs | Processing | Outputs | Grade |
| baz | src/foo.py:42 | none | mutates a global | None | F |

```json
[{"tier": 1, "path": "src/foo.py", "symbol": "Bar.baz", "line": 42, "title": "Bar.baz",
  "dims": {"cyclomatic": "G", "cognitive": "G", "params": "G", "loc": "G",
           "nesting": "G", "purity": "R", "io_contract": "R",
           "single_responsibility": "G", "coupling": "G"}},
 {"tier": 1, "path": "src/ok.py", "symbol": "fine", "line": 1, "title": "fine",
  "dims": {"cyclomatic": "G", "cognitive": "G", "params": "G", "loc": "G",
           "nesting": "G", "purity": "G", "io_contract": "G",
           "single_responsibility": "G", "coupling": "G"}}]
```
"""

# The model no longer scores test_present — Python resolves it from the filesystem.
# The self-test has no repo to look at, so it pins the dim green and exercises the
# rest of the pipeline.
SELF_TEST_FILL = lambda rec: {"test_present": "G"}       # noqa: E731

SELF_TEST_CONTRACT = """\
version: 1
rubric_version: 2
layers:
  order: [domain, application, infrastructure]
  rule: downward_only
modules:
  src/domain:
    responsibility: "Hold the rules."
    layer: domain
    exports: [Rule]
    allowed_deps: []
    status: declared
  src/infra:
    responsibility: "Talk to the database."
    layer: infrastructure
    exports: [query]
    allowed_deps: [src/domain]
    status: provisional
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
    assert RUBRIC_VERSION == 2, "rubric version must be stamped"
    assert TIER1_MAX == sum(TIER1_WEIGHTS.values()) * 2 == 30, "tier 1 max score must be 30"
    assert compute_grade({d: "G" for d in TIER1_DIMS}, 1) == (100, "A", False)
    assert compute_grade({**{d: "G" for d in TIER1_DIMS}, "purity": "R"}, 1)[1] == "C"
    # v2: the P of the IPO contract is scored, and it is critical.
    assert compute_grade({**{d: "G" for d in TIER1_DIMS},
                          "single_responsibility": "R"}, 1)[1] == "C"
    assert "coupling" in TIER1_DIMS and "cohesion" not in TIER1_DIMS   # no label collision
    assert compute_grade({**{d: "G" for d in TIER2_DIMS}, "circular_deps": "R"}, 2)[1] == "F"
    assert compute_grade({**{d: "G" for d in TIER3_DIMS}, "timeout": "R"}, 3)[1] == "C"
    assert normalize_score("🔴") == "R" and normalize_score(2) == "G"
    assert normalize_score("maybe") is None
    assert unit_key({"tier": 1, "path": "a.py", "symbol": "f", "line": 9}) == "a.py::f"
    assert unit_key({"tier": 1, "path": "a.py", "symbol": "f", "line": 99}) == "a.py::f"
    assert find_cycles({"a": {"b"}, "b": {"a"}}) == [["a", "b"]]
    assert find_cycles({"a": {"b"}, "b": set()}) == []
    for dim in TIER1_DIMS + TIER2_ALL_DIMS + TIER3_DIMS:
        assert dim in DIM_LABELS, f"dim {dim} has no label"
        assert dim in CRITERIA_BY_DIM, f"dim {dim} has no success criterion"
    # Tier 3 seeds its Effort from the failing COUNT, not per-dimension, so only the
    # tier-1/2 dims are ever looked up here.
    for dim in TIER1_DIMS + TIER2_ALL_DIMS:
        assert dim in EFFORT_BY_DIM, f"dim {dim} has no effort seed"

    # --- Health and conformance are two grades, never pooled ---
    conf_green = {d: "G" for d in TIER2_CONFORMANCE_DIMS}
    broken = {**{d: "G" for d in TIER2_DIMS}, "cohesion": "R", "public_surface": "R",
              "efferent_coupling": "R", **conf_green}
    assert compute_grade(broken, 2)[1] == "F", "conformance 🟢s must not dilute health"
    assert compute_conformance({**conf_green, "layer_conformance": "R"})[1] == "F"
    assert compute_conformance({**conf_green, "dependency_conformance": "R"})[1] == "C"
    # A layer violation moves a boundary — same class of defect as a cycle.
    layered = {**{d: "G" for d in TIER2_DIMS}, **conf_green, "layer_conformance": "R"}
    assert compute_grade(layered, 2)[1] == "A", "health is fine; the module is misplaced"
    assert filing_predicate(layered, 2), "a misplaced module must still be filed"
    assert derive_priority(layered, 2, "A") == "P0 - Critical"
    # "No contract yet" is ONE project task (Wave 0), not one backlog item per module.
    assert not filing_predicate({**{d: "G" for d in TIER2_DIMS}, **conf_green,
                                 "contract_declared": "R"}, 2)

    # --- The Module Contract: the expected structure ---
    doc = parse_simple_yaml(SELF_TEST_CONTRACT)
    assert doc["layers"]["order"] == ["domain", "application", "infrastructure"]
    contracts = {"layers": doc["layers"], "modules": doc["modules"],
                 "order": doc["layers"]["order"], "present": True}
    assert module_status(contracts, "src/domain") == STATUS_DECLARED
    assert module_status(contracts, "src/nope") == STATUS_MISSING
    # domain is innermost: reaching out to infra inverts the arrow.
    assert layer_violations({"src/domain": {"src/infra"}}, contracts) == \
        {"src/domain": ["src/infra"]}
    # A provisional contract describes what IS, so it is never scored against.
    assert layer_violations({"src/infra": {"src/domain"}}, contracts) == {}
    assert surface_violations({"src/domain": {"Rule", "leaked"}}, contracts) == \
        {"src/domain": ["leaked"]}

    # --- The model boundary: parse, validate, degrade safely ---
    records, audited, problems = collect_records([SELF_TEST_REPLY], fill=SELF_TEST_FILL)
    assert len(records) == 1 and not problems, (records, problems)   # only the failing unit
    assert len(audited) == 2, audited                                # both units were measured
    assert collect_records(["total garbage"]) == ([], set(), ["batch 1: no parseable JSON "
                                                              "records in model reply"])
    assert "```json" not in strip_json_block(SELF_TEST_REPLY)
    assert "| Function |" in strip_json_block(SELF_TEST_REPLY)
    assert "test_present" not in JSON_INSTRUCTION, "the model must not score test_present"

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
    print(f"  rubric         : v{RUBRIC_VERSION}  (tier 1 max {TIER1_MAX})")
    print(f"  rubric tiers   : system, function, module, api")
    print(f"  contract       : {CONTRACT_FILE}  "
          f"{'(present)' if (root / CONTRACT_FILE).exists() else '(none — run --init-contracts)'}")
    print(f"  output target  : {DEFAULT_OUTPUT}")
    print(f"  debt ledger    : {DEBT_GROUP_FILE}  (class: debt — excluded from coverage)")
    print("\n  OK — rubric, discovery, batching, JSON parsing, grading, the module")
    print("  contract, health/conformance scoring and the upsert/auto-close ledger")
    print("  all verified. No model call, no writes.")


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
    parser.add_argument("--include-tests", action="store_true",
                        help="Audit test/spec files as units too. Off by default: a test "
                             "file has no test for itself, so it fails the rubric by "
                             "construction and floods the ledger with phantom debt.")
    parser.add_argument("--init-contracts", action="store_true",
                        help=f"Bootstrap {CONTRACT_FILE} from the code as it is today, "
                             "with every module `provisional` (= unscored). Edit it to "
                             "what each module SHOULD be and set `status: declared`.")
    parser.add_argument("--plan", action="store_true",
                        help=f"Generate {PLAN_FILE} from the debt ledger: work grouped by "
                             "module, sequenced into waves, ending in the Adherence "
                             "Scorecard. Deterministic — no model call.")
    parser.add_argument("--verify-plan", action="store_true",
                        help="Regenerate the plan and EXIT NON-ZERO if any modularity "
                             "characteristic has regressed against the baseline. The CI gate.")
    args = parser.parse_args()

    root = Path(args.project).expanduser().resolve()
    if not root.is_dir():
        sys.exit(f"ERROR: project path is not a directory: {root}")

    if args.self_test:
        self_test(root, args.path, args.tier)
        return

    files = discover_sources(root, args.path, include_tests=args.include_tests)
    batches = batch_files(files, root)
    # Scan the WHOLE repo for tests, not just the audited subtree: a --path run on
    # src/ must still see the test that lives in __tests__/.
    test_index = build_test_index(root)
    fill = python_dims_fill(root, test_index)
    contracts = load_contracts(root)

    if args.init_contracts:
        init_contracts(root, files, args.dry_run)
        return

    if args.plan or args.verify_plan:
        sys.exit(write_plan(root, files, contracts,
                            verify=args.verify_plan, dry_run=args.dry_run))

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

    # Tier 2 + Tier 0 run as their own pass: the structural dimensions are graph facts
    # Python computes, and a module's files can straddle two batches.
    tier2_records: list[dict] = []
    tier0 = None
    if args.tier in ("all", "module"):
        print(f"\n\n{'=' * 62}\n  Tier 2 — module health + contract conformance\n{'=' * 62}")
        graph, ce = build_import_graph(files, root)
        cycles = find_cycles(graph)
        if cycles:
            print(f"  🔴 circular dependencies: {'; '.join(' → '.join(c) for c in cycles)}")
        modules = sorted(graph)
        exports = module_exports(files, root)
        model_raw, _ = extract_json_records(
            run_claude(tier2_prompt(module_manifest(files, root, ce, contracts))))
        tier1_records, _ = validate_records(
            [r for reply in replies for r in extract_json_records(reply)[0]], fill=fill)
        tier2_records = build_tier2_records(model_raw, modules, graph, ce, tier1_records,
                                            contracts, exports)
        tier0 = tier0_scorecard(modules, graph, ce, contracts, tier1_records, tier2_records)
        bad = tier0["layer_violation_count"]
        if bad:
            print(f"  🔴 layer violations: {bad}")
        print(f"  contract coverage: {tier0['contract_coverage']}% "
              f"({tier0['declared']}/{tier0['modules']} declared)")
        # --plan makes no model call, so it cannot recompute the grade distributions.
        # Hand them forward.
        atomic_write(root / AUDIT_CARD_FILE, json.dumps(tier0, indent=2) + "\n")

    print(f"\n\n{'=' * 62}\n  Rolling up codebase scorecard…\n{'=' * 62}")
    summary = run_claude(summary_prompt("\n\n---\n\n".join(fragments), root.name))

    document = build_document(root.name, args.tier, summary, fragments,
                              len(files), len(batches), tier0)
    dest = root / args.output
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(document, encoding="utf-8")
    print(f"\n\nDone. Scorecard written to {dest.relative_to(root)}")

    if not filing:
        print(f"Next: re-run with --file-backlog to file every 🔴/F unit into "
              f"{DEBT_GROUP_FILE}, then re-run next sprint.")
        return

    file_backlog(root, replies, tier2_records, args.debt_code,
                 dry_run=args.backlog_dry_run, fill=fill)


def file_backlog(root: Path, replies: list[str], tier2_records: list[dict],
                 code: str, dry_run: bool, fill=None) -> dict | None:
    """Upsert the debt ledger from this run's findings. Never destructive on failure."""
    records, audited, problems = collect_records(replies, fill=fill)
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
