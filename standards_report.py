#!/usr/bin/env python3
"""
standards_report.py — CFAI adopted-standards adoption/currency/adherence report.

Reads a project's cfai-manifest.json and emits docs/STANDARDS_ADOPTION_REPORT.md:
  • CURRENCY  (always, deterministic, no repo/model) — how long ago each standard
                was adopted, banded + a text bar. The gold-standards repo keeps
                evolving, so this shows which adopted copies are getting old.
  • DRIFT     (--repo <gold-standards>) — compares the live gold source hash to the
                source_sha snapshot stored at adopt time → current / drifted.
  • ADHERENCE (--grade) — grades the project against each standard's DO/DO NOT rows
                via the `claude` CLI (rubric → %/letter), like module-audit.py.

Self-contained (embeds its own _bar/_pct); pure stdlib; shells to the `claude`
CLI only under --grade. Copied verbatim into adopted projects as a baseline script.

Usage:
    python3 standards_report.py --project .                    # currency only
    python3 standards_report.py --project . --repo <gold-url>  # + drift
    python3 standards_report.py --project . --grade            # + AI adherence
    python3 standards_report.py --self-test                    # no model, no writes
"""

import os
import sys
import json
import hashlib
import argparse
import subprocess
import tempfile
from datetime import date
from pathlib import Path

MANIFEST_FILENAME = "cfai-manifest.json"
DEFAULT_OUTPUT = "docs/STANDARDS_ADOPTION_REPORT.md"
CURRENCY_HORIZON_DAYS = 180

# Model routing + subprocess isolation.
#
# `claude -p` inherits the caller's CLAUDE.md, hooks and plugins, so a personal
# rule like "end every response with a status footer" would be appended to every
# doc this script generates. `--setting-sources ""` isolates the subprocess.
#
# That flag also stops the CLI reading `model` from settings.json, so we resolve
# the model here and pass it explicitly — net routing is unchanged. No model ID
# is pinned. Precedence:
#   CFAI_GRADE_MODEL -> CFAI_MODEL -> ANTHROPIC_MODEL -> .claude/settings*.json
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


# ---------------------------------------------------------------------------
# Pure helpers (unit-tested)
# ---------------------------------------------------------------------------

def sha256_text(text: str) -> str:
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()


def _bar(pct: int, width: int = 20) -> str:
    """Text progress bar, e.g. ████████░░░░░░░░░░░░ (matches docs_update.py)."""
    filled = round(pct / 100 * width)
    return "█" * filled + "░" * (width - filled)


def _pct(values: list[int]) -> int:
    return round(sum(values) / len(values)) if values else 0


def age_days(adopted_at, today_iso: str):
    """Whole days between adopted_at and today (both YYYY-MM-DD). None if unparseable."""
    if not adopted_at:
        return None
    try:
        a = date.fromisoformat(adopted_at)
        t = date.fromisoformat(today_iso)
    except (ValueError, TypeError):
        return None
    return (t - a).days


def currency_band(days) -> tuple:
    """(label, marker) for a staleness age in days. None → unknown."""
    if days is None:
        return "unknown", "⚪"
    if days <= 30:
        return "current", "🟢"
    if days <= 90:
        return "aging", "🟡"
    return "stale", "🔴"


def currency_pct(days, horizon: int = CURRENCY_HORIZON_DAYS) -> int:
    """100% freshly adopted, decaying linearly to 0% at the horizon (clamped)."""
    if days is None:
        return 0
    return max(0, round(100 * (1 - days / horizon)))


def drift_status(stored_sha, live_sha) -> str:
    """Compare the adopt-time source snapshot to the live gold source.
    unadopted-snapshot: no source_sha stored (pre-feature manifest).
    unknown: no live sha (no --repo / fetch failed). Else current / drifted."""
    if not stored_sha:
        return "unadopted-snapshot"
    if not live_sha:
        return "unknown"
    return "current" if stored_sha == live_sha else "drifted"


def extract_do_donot(markdown: str) -> list:
    """Parse the first 2-column DO / DO NOT table into [{"do","do_not"}].
    Returns [] when the standard has no such table (≈6 of 24 deviate)."""
    lines = markdown.splitlines()
    header_idx = -1
    for i, line in enumerate(lines):
        low = line.lower()
        if "|" in line and "do not" in low and low.strip().startswith("|"):
            header_idx = i
            break
    if header_idx == -1:
        return []

    rows = []
    for line in lines[header_idx + 1:]:
        stripped = line.strip()
        if not stripped.startswith("|"):
            break  # end of table
        cells = [c.strip() for c in stripped.strip("|").split("|")]
        if len(cells) < 2:
            continue
        if set(cells[0]) <= set("-: "):  # separator row |---|---|
            continue
        rows.append({"do": cells[0], "do_not": cells[1]})
    return rows


def parse_manifest_adopted(manifest: dict) -> list:
    return manifest.get("adopted", []) if isinstance(manifest, dict) else []


def build_report_row(entry: dict, live_sha, today_iso: str) -> dict:
    days = age_days(entry.get("adopted_at"), today_iso)
    label, marker = currency_band(days)
    pct = currency_pct(days)
    return {
        "title": entry.get("title", entry.get("module_id", "?")),
        "output_file": entry.get("output_file", ""),
        "adopted_at": entry.get("adopted_at", "?"),
        "source_committed_at": entry.get("source_committed_at"),
        "age_days": days,
        "currency_label": label,
        "currency_marker": marker,
        "currency_pct": pct,
        "bar": _bar(pct),
        "drift": drift_status(entry.get("source_sha"), live_sha),
    }


def build_report(rows: list, graded, generated_on: str) -> str:
    lines = [
        "# Standards Adoption Report",
        "",
        f"> Generated {generated_on} by `standards_report.py`. Currency is deterministic; "
        "drift needs `--repo`; adherence needs `--grade`.",
        "",
    ]
    if not rows:
        lines += ["_No standards adopted yet — run `/adopt-standards` to adopt some._", ""]
        return "\n".join(lines) + "\n"

    overall = _pct([r["currency_pct"] for r in rows])
    lines += [
        f"**Overall currency:** {overall}%  `{_bar(overall)}`  "
        f"({len(rows)} standard(s) adopted)",
        "",
        "| Standard | Adopted | Currency | Drift |",
        "|---|---|---|---|",
    ]
    for r in rows:
        cur = f"{r['currency_marker']} {r['currency_pct']}% `{r['bar']}` ({r['currency_label']})"
        lines.append(f"| {r['title']} | {r['adopted_at']} | {cur} | {r['drift']} |")
    lines.append("")

    stale = [r for r in rows if r["currency_label"] == "stale" or r["drift"] == "drifted"]
    if stale:
        lines += ["**Needs attention (stale or drifted — re-run `/adopt-standards`):**"]
        for r in stale:
            lines.append(f"- {r['title']} → `{r['output_file']}`")
        lines.append("")

    if graded:
        lines += ["## Adherence (AI-graded)", "",
                  "| Standard | Grade | % | Notes |", "|---|---|---|---|"]
        for title, g in graded.items():
            lines.append(f"| {title} | {g.get('grade','?')} | {g.get('pct','?')} | {g.get('notes','')} |")
        lines.append("")

    return "\n".join(lines) + "\n"


def adherence_prompt(title: str, rubric_rows: list, audit: str) -> str:
    rubric = "\n".join(f"- DO: {r['do']}  |  DO NOT: {r['do_not']}" for r in rubric_rows)
    return f"""\
Grade how well this project adheres to the CFAI standard "{title}".

The standard's binary rules (the rubric):
{rubric}

For each rule, judge from the project evidence below whether the project follows the DO and
avoids the DO NOT. Then output ONLY a compact assessment:
- a percentage 0-100 (share of rules satisfied),
- a letter grade (A≥90 B80-89 C70-79 D60-69 F<60),
- up to 3 short notes on the most important violations.

PROJECT EVIDENCE:
{audit}
"""


# ---------------------------------------------------------------------------
# Thin wrappers (real-run only; not unit-tested)
# ---------------------------------------------------------------------------

def load_manifest(project_root: Path) -> dict:
    path = project_root / MANIFEST_FILENAME
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _git(*args, cwd=None):
    return subprocess.run(["git"] + list(args), cwd=str(cwd) if cwd else None,
                          capture_output=True, text=True)


def _resolve_gold_root(repo: str) -> Path | None:
    """Return a local path to the gold-standards repo. Clones a git URL into /tmp
    (cached by hash). Full clone (not shallow) so source content is readable."""
    if not repo:
        return None
    if any(repo.startswith(p) for p in ("http://", "https://", "git@", "ssh://", "git://")):
        key = hashlib.md5(repo.encode()).hexdigest()[:10]
        clone_dir = Path(tempfile.gettempdir()) / f"cfai_gs_report_{key}"
        if not clone_dir.exists():
            r = _git("clone", "--depth=1", repo, str(clone_dir))
            if r.returncode != 0:
                print(f"  ⚠ could not clone {repo}: {r.stderr.strip()}")
                return None
        return clone_dir
    p = Path(repo).expanduser().resolve()
    return p if p.is_dir() else None


def fetch_live_source(gold_root: Path | None, source_file: str):
    """Live gold-source content sha, or None if unavailable."""
    if gold_root is None:
        return None
    src = gold_root / source_file
    if not src.exists():
        return None
    return sha256_text(src.read_text(encoding="utf-8"))


def run_claude(prompt: str) -> str:
    proc = subprocess.Popen(
        ["claude", "-p", prompt, *model_flags("CFAI_GRADE_MODEL"), *CLAUDE_ISOLATION, "--tools", "",
         "--output-format", "stream-json", "--include-partial-messages", "--verbose"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, stdin=subprocess.DEVNULL,
    )
    final = ""
    for line in proc.stdout:
        line = line.strip()
        if not line:
            continue
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        if ev.get("type") == "assistant":
            for block in ev.get("message", {}).get("content", []):
                if block.get("type") == "text":
                    final = block.get("text", "")
        elif ev.get("type") == "result" and not final:
            final = ev.get("result", "")
    proc.wait()
    return final


def collect_project_audit(project_root: Path, max_chars: int = 12000) -> str:
    """A small read-only snapshot of the project for adherence grading."""
    parts = []
    ls = _git("ls-files", cwd=project_root)
    if ls.returncode == 0:
        parts.append("TRACKED FILES:\n" + "\n".join(ls.stdout.splitlines()[:300]))
    for name in (".gitignore", "package.json", "requirements.txt", "CLAUDE.md"):
        f = project_root / name
        if f.exists():
            parts.append(f"===== {name} =====\n" + f.read_text(encoding="utf-8")[:2000])
    return ("\n\n".join(parts))[:max_chars]


def self_test() -> None:
    assert sha256_text("a") != sha256_text("b")
    assert currency_band(0)[0] == "current" and currency_band(200)[0] == "stale"
    assert currency_pct(0) == 100 and currency_pct(180) == 0
    assert drift_status(None, "x") == "unadopted-snapshot"
    assert drift_status("x", "x") == "current" and drift_status("x", "y") == "drifted"
    assert extract_do_donot("no table here") == []
    assert "█" in _bar(100)
    print("standards_report self-test: OK")


def main() -> int:
    ap = argparse.ArgumentParser(description="Report on adopted CFAI standards (currency/drift/adherence).")
    ap.add_argument("--project", "-p", default=".", help="Target project root (default: .).")
    ap.add_argument("--repo", "-r", help="Gold-standards repo (URL or path) to compute drift.")
    ap.add_argument("--grade", action="store_true", help="AI-grade adherence to each standard's DO/DO NOT rules.")
    ap.add_argument("--output", "-o", default=DEFAULT_OUTPUT, help=f"Output path (default: {DEFAULT_OUTPUT}).")
    ap.add_argument("--dry-run", action="store_true", help="Print the report; do not write.")
    ap.add_argument("--self-test", action="store_true", help="Validate pure helpers; no model, no writes.")
    args = ap.parse_args()

    if args.self_test:
        self_test()
        return 0

    root = Path(args.project).expanduser().resolve()
    if not root.is_dir():
        sys.exit(f"ERROR: project path is not a directory: {root}")

    adopted = parse_manifest_adopted(load_manifest(root))
    today = date.today().isoformat()
    gold_root = _resolve_gold_root(args.repo) if args.repo else None

    rows = []
    for entry in adopted:
        live_sha = fetch_live_source(gold_root, entry.get("gold_standard_source", "")) if gold_root else None
        rows.append(build_report_row(entry, live_sha, today))

    graded = None
    if args.grade and adopted:
        graded = {}
        audit = collect_project_audit(root)
        for entry in adopted:
            out = root / entry.get("output_file", "")
            rubric = extract_do_donot(out.read_text(encoding="utf-8")) if out.exists() else []
            if not rubric:
                graded[entry.get("title", "?")] = {"grade": "—", "pct": "—",
                                                    "notes": "no DO/DO NOT rubric — not graded"}
                continue
            print(f"  grading: {entry.get('title')} …")
            result = run_claude(adherence_prompt(entry.get("title", "?"), rubric, audit))
            graded[entry.get("title", "?")] = {"grade": "see notes", "pct": "—",
                                               "notes": result.replace("\n", " ")[:300]}

    report = build_report(rows, graded, today)
    if args.dry_run:
        print(report)
        return 0

    dest = root / args.output
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(report, encoding="utf-8")
    print(f"Report written to {dest.relative_to(root)}  ({len(rows)} standard(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
