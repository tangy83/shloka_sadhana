#!/usr/bin/env python3
"""
remindme.py — CFAI session-context recall engine (the /remindme command).

Reconstructs "what were we trying to achieve in this window, how did the ask
drift, and how does it connect to the wider project" by reading Claude Code's
own session transcripts at ~/.claude/projects/<slug>/<sessionId>.jsonl.

Three modes:
  - recall (default) : brief the CURRENT window (goal + drift + project link + next step)
  - list            : map recent windows so you can see which thread is which
  - match           : recall a specific OTHER window by keyword or session-id

Pure standard library. Shells out to the `claude` CLI (Claude Code) via
subprocess for the recall synthesis — no ANTHROPIC_API_KEY, no pip installs.
This mirrors scripts/generate_standard.py and toolkit/adopt.py. `list` mode is
fully deterministic and never calls the model. The script never writes files.

Usage:
    python3 remindme.py                    # recall the CURRENT window
    python3 remindme.py list               # map recent windows for THIS project
    python3 remindme.py list all           # map recent windows across ALL projects
    python3 remindme.py <keyword...>       # recall best-matching OTHER window
    python3 remindme.py --session <id>     # recall a specific session (id prefix ok)
    python3 remindme.py --dry-run          # extract + print raw facts; no model, no writes
    python3 remindme.py --self-test        # validate parser/helpers; no model, no writes
    python3 remindme.py --project <path>   # override the project dir (defaults to cwd)

--dry-run and --self-test never call the model and never write files.
"""

import os
import sys
import json
import argparse
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

PROJECTS_DIR = Path.home() / ".claude" / "projects"

# Model routing + subprocess isolation.
#
# `claude -p` inherits the caller's CLAUDE.md, hooks and plugins, so a personal
# rule like "end every response with a status footer" would be appended to every
# doc this script generates. `--setting-sources ""` isolates the subprocess.
#
# That flag also stops the CLI reading `model` from settings.json, so we resolve
# the model here and pass it explicitly — net routing is unchanged. No model ID
# is pinned. Precedence:
#   CFAI_REMIND_MODEL -> CFAI_MODEL -> ANTHROPIC_MODEL -> .claude/settings*.json
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

# Bounds so the synthesis prompt stays small and cheap (never feed a whole
# transcript — they are huge and often already compacted).
MAX_PROMPT_CHARS = 600      # per typed prompt fed to the model
MAX_TRAJECTORY = 14         # most-recent typed prompts kept
MAX_DOC_CHARS = 1400        # per project-doc excerpt
LIST_LIMIT = 30             # recent windows shown / scanned in list & match
LIST_SCAN_LINES = 4000      # lines read per file for a lightweight summary

REMIND_SYSTEM = """\
You are a context-recall assistant. A developer runs many Claude Code windows
at once and has lost the thread of one of them. From the extracted session
facts and project context you are given, produce a TIGHT orientation briefing
so they can resume instantly. Rules:
- No preamble, no restating the task. Lead with the content.
- Use these short section headers, in order:
  **Goal** — one or two sentences: what this window set out to do (from the
    original prompt).
  **How it drifted** — did the focus shift? Name the pivot(s) plainly
    ("started as X → now Y"). If it never drifted, say "stayed on the original
    goal." Fold in any recovered/compacted history.
  **Where it fits** — how this connects to the wider project (use the project
    docs + git branch).
  **Where you are & next step** — the current state and ONE concrete action to
    pick up where you left off.
- Be specific and concrete; quote real prompt wording where it helps. Keep the
  whole thing scannable — this is a reminder, not a report.
"""

# ---------------------------------------------------------------------------
# Pure helpers (exercised by --self-test; no I/O, no model)
# ---------------------------------------------------------------------------

def flatten_content(content) -> str:
    """A message's content may be a plain string or a list of typed blocks.
    Return only the human-readable text (text blocks), joined by newlines.
    Tool-use / tool-result / image blocks contribute nothing."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "\n".join(parts)
    return ""


def _visible_text(content) -> str:
    """Flattened text with injected noise stripped: <system-reminder> blocks
    removed, and slash-command turns (recorded as <command-name>/foo</command-name>
    ...) reduced to a clean "/foo [args]" so they don't leak raw XML into titles."""
    import re
    text = flatten_content(content)
    text = re.sub(r"<system-reminder>.*?</system-reminder>", "", text, flags=re.DOTALL)
    cmd = re.search(r"<command-name>\s*([^<]+?)\s*</command-name>", text)
    if cmd:
        args = re.search(r"<command-args>\s*([^<]*?)\s*</command-args>", text)
        name = cmd.group(1).strip()
        return (name + (" " + args.group(1).strip() if args and args.group(1).strip() else "")).strip()
    text = re.sub(r"</?command-[a-z]+>", "", text)
    return text.strip()


def is_genuine_prompt(line: dict) -> bool:
    """True only for a real, top-level, human-typed prompt — not a tool result,
    attachment, compaction summary, injected reminder, or the /remindme turn."""
    if line.get("type") != "user":
        return False
    if line.get("isCompactSummary"):
        return False
    msg = line.get("message") or {}
    text = _visible_text(msg.get("content"))
    if not text:
        return False
    if text.startswith("/remindme"):
        return False
    return True


def parse_transcript(lines: list) -> dict:
    """Extract the recall signals from an ordered list of transcript records."""
    first_prompt = None
    typed_prompts = []
    ai_title = None
    last_prompt = None
    compact_summary = None
    last_assistant_text = None
    git_branch = None
    cwd = None
    started_at = None
    last_ts = None
    n_assistant = 0
    n_fhs = 0
    n_mode = 0

    for line in lines:
        ltype = line.get("type")
        if ltype == "file-history-snapshot":
            n_fhs += 1
        elif ltype == "mode":
            n_mode += 1
        ts = line.get("timestamp")
        if ts:
            if started_at is None:
                started_at = ts
            last_ts = ts
        if not git_branch and line.get("gitBranch"):
            git_branch = line.get("gitBranch")
        if not cwd and line.get("cwd"):
            cwd = line.get("cwd")

        if ltype == "ai-title" and line.get("aiTitle"):
            ai_title = line.get("aiTitle")  # last one wins
        elif ltype == "last-prompt" and line.get("lastPrompt"):
            last_prompt = line.get("lastPrompt")
        elif ltype == "assistant":
            n_assistant += 1
            txt = flatten_content((line.get("message") or {}).get("content")).strip()
            if txt:
                last_assistant_text = txt
        elif ltype == "user":
            msg = line.get("message") or {}
            if line.get("isCompactSummary"):
                compact_summary = flatten_content(msg.get("content")).strip() or compact_summary
                continue
            if is_genuine_prompt(line):
                text = _visible_text(msg.get("content"))
                typed_prompts.append(text)
                if first_prompt is None and line.get("parentUuid") is None:
                    first_prompt = text

    if first_prompt is None and typed_prompts:
        first_prompt = typed_prompts[0]
    if last_prompt is None and typed_prompts:
        last_prompt = typed_prompts[-1]

    return {
        "first_prompt": first_prompt,
        "typed_prompts": typed_prompts,
        "ai_title": ai_title,
        "last_prompt": last_prompt,
        "compact_summary": compact_summary,
        "last_assistant_text": last_assistant_text,
        "git_branch": git_branch,
        "cwd": cwd,
        "started_at": started_at,
        "last_ts": last_ts,
        "n_user": len(typed_prompts),
        "n_assistant": n_assistant,
        "n_fhs": n_fhs,
        "n_mode": n_mode,
    }


def touched_files(lines: list, cwd: str | None = None) -> list[str]:
    """Repo-relative paths this session wrote, deduped and sorted. Pure.

    Two independent signals, unioned because each misses cases the other catches:

      * `file-history-snapshot.snapshot.trackedFileBackups` — already keyed by
        repo-relative path, and the harness's own record of every edit. Survives
        compaction, which the tool_use blocks do not.
      * `tool_use` blocks for Edit/Write/NotebookEdit — absolute `input.file_path`,
        relativized against the session cwd. Catches writes in a window whose
        snapshot records were trimmed.

    Reads only, never writes. `/session-to-backlog` maps these onto each item's
    `Touches` to decide which backlog rows a session actually moved.
    """
    seen: set[str] = set()
    root = (cwd or "").rstrip("/")

    def _norm(path: str) -> str:
        # A "./" prefix only. str.lstrip("./") would strip any run of '.' and '/',
        # turning an absolute /elsewhere/x.ts into a bogus relative elsewhere/x.ts.
        return path[2:] if path.startswith("./") else path

    for line in lines:
        if line.get("type") == "file-history-snapshot":
            backups = ((line.get("snapshot") or {}).get("trackedFileBackups") or {})
            for path in backups:
                if isinstance(path, str) and path.strip():
                    seen.add(_norm(path.strip()))
            continue

        content = (line.get("message") or {}).get("content")
        if not isinstance(content, list):
            continue
        for block in content:
            if not isinstance(block, dict) or block.get("type") != "tool_use":
                continue
            if block.get("name") not in ("Edit", "Write", "NotebookEdit"):
                continue
            path = (block.get("input") or {}).get("file_path")
            if not isinstance(path, str) or not path.strip():
                continue
            path = path.strip()
            if root and path.startswith(root + "/"):
                path = path[len(root) + 1:]
            seen.add(_norm(path))

    return sorted(seen)


def is_headless(facts: dict) -> bool:
    """A CFAI helper's `claude -p` subprocess (generate_standard.py, docs_update.py,
    /remindme's own recall, …) leaves a single-turn session in the project dir.
    These are noise in the 'windows' view: one typed prompt and none of the
    interactive-only markers (file-history-snapshot / mode)."""
    return facts.get("n_user", 0) <= 1 and facts.get("n_fhs", 0) == 0 and facts.get("n_mode", 0) == 0


def derive_slug(path) -> str:
    """Claude Code names each project dir by replacing every non-alphanumeric
    char in the absolute path with '-'. NOTE it hyphenates '_' and '.' too, so
    'cfai_gold_standards' → 'cfai-gold-standards'. Never trust a naive '/'→'-'."""
    import re
    return re.sub(r"[^A-Za-z0-9]", "-", str(path))


def match_score(query: str, text: str) -> int:
    """Cheap relevance score of a query against a candidate string."""
    q = (query or "").lower().strip()
    t = (text or "").lower()
    if not q:
        return 0
    score = sum(1 for tok in q.split() if tok and tok in t)
    if q in t:
        score += 2
    return score


# ---------------------------------------------------------------------------
# Time formatting
# ---------------------------------------------------------------------------

def _parse_iso(ts):
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


def humanize_ago(dt) -> str:
    if dt is None:
        return "unknown"
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    secs = max(0, (now - dt).total_seconds())
    if secs < 90:
        return "just now"
    if secs < 3600:
        return f"{int(secs // 60)}m ago"
    if secs < 86400:
        return f"{int(secs // 3600)}h ago"
    return f"{int(secs // 86400)}d ago"


def humanize_span(start_ts, end_ts) -> str:
    a, b = _parse_iso(start_ts), _parse_iso(end_ts)
    if not a or not b:
        return "unknown"
    secs = max(0, (b - a).total_seconds())
    if secs < 3600:
        return f"{int(secs // 60)}m"
    if secs < 86400:
        return f"{secs / 3600:.1f}h"
    return f"{secs / 86400:.1f}d"


# ---------------------------------------------------------------------------
# Transcript discovery + loading
# ---------------------------------------------------------------------------

def load_transcript(path: Path, max_lines: int | None = None) -> list:
    lines = []
    with open(path, encoding="utf-8", errors="replace") as fh:
        for i, raw in enumerate(fh):
            if max_lines is not None and i >= max_lines:
                break
            raw = raw.strip()
            if not raw:
                continue
            try:
                lines.append(json.loads(raw))
            except json.JSONDecodeError:
                continue
    return lines


def _transcript_cwd(path: Path) -> str | None:
    """Cheaply read the cwd a transcript belongs to (scan the head only)."""
    try:
        for line in load_transcript(path, max_lines=60):
            if line.get("cwd"):
                return line.get("cwd")
    except OSError:
        return None
    return None


def _mtime(path: Path) -> float:
    try:
        return path.stat().st_mtime
    except OSError:
        return 0.0


def resolve_transcript(session=None, transcript=None, project=None,
                       allow_env_session=True) -> Path | None:
    """Find the transcript to recall, most-reliable signal first:
    1. explicit --transcript path
    2. session id (--session, or $CLAUDE_CODE_SESSION_ID unless the caller pinned
       a different --project) → glob by filename
    3. project slug dir → most-recent .jsonl (verified by its cwd field)
    4. broad scan → most-recent .jsonl whose cwd matches the project.
    When an explicit --project is given, allow_env_session is False so the
    current window's env session never masks the requested project."""
    if transcript:
        p = Path(transcript).expanduser()
        return p if p.exists() else None

    sid = session or (os.environ.get("CLAUDE_CODE_SESSION_ID") if allow_env_session else None)
    if sid and PROJECTS_DIR.exists():
        matches = sorted(PROJECTS_DIR.glob(f"*/{sid}*.jsonl"), key=_mtime, reverse=True)
        if matches:
            return matches[0]

    project_root = str(Path(project or os.getcwd()).resolve())

    slug_dir = PROJECTS_DIR / derive_slug(project_root)
    if slug_dir.is_dir():
        jsonls = sorted(slug_dir.glob("*.jsonl"), key=_mtime, reverse=True)
        for p in jsonls:
            if _transcript_cwd(p) in (project_root, None):
                return p
        if jsonls:
            return jsonls[0]

    if PROJECTS_DIR.exists():
        allj = sorted(PROJECTS_DIR.glob("*/*.jsonl"), key=_mtime, reverse=True)
        for p in allj:
            if _transcript_cwd(p) == project_root:
                return p
    return None


# ---------------------------------------------------------------------------
# list mode (deterministic — no model)
# ---------------------------------------------------------------------------

def lightweight_summary(path: Path) -> dict:
    """Cheap per-session summary for the list table (bounded read)."""
    lines = load_transcript(path, max_lines=LIST_SCAN_LINES)
    facts = parse_transcript(lines)
    first_line = (facts["first_prompt"] or facts["ai_title"] or "(no prompt found)")
    first_line = " ".join(first_line.split())  # collapse whitespace
    title = facts["ai_title"] or first_line
    return {
        "session_id": path.stem,
        "title": " ".join(title.split()),
        "first_line": first_line,
        "branch": facts["git_branch"] or "-",
        "n_prompts": facts["n_user"],
        "mtime": _mtime(path),
        "project": path.parent.name,
        "headless": is_headless(facts),
    }


def gather_recent_sessions(scope: str, project_root: str, limit: int = LIST_LIMIT,
                           include_headless: bool = False):
    """Return (rows, n_hidden). Scans a bounded set of the most-recent transcripts
    and, by default, drops single-turn helper/subprocess sessions."""
    if scope == "all":
        dirs = [d for d in PROJECTS_DIR.iterdir() if d.is_dir()] if PROJECTS_DIR.exists() else []
    else:
        d = PROJECTS_DIR / derive_slug(project_root)
        dirs = [d] if d.is_dir() else []

    paths = []
    for d in dirs:
        paths.extend(d.glob("*.jsonl"))
    # Scan extra so the post-filter list still fills up to `limit`.
    paths = sorted(paths, key=_mtime, reverse=True)[: limit * 3]

    rows, hidden = [], 0
    for p in paths:
        row = lightweight_summary(p)
        if row["headless"] and not include_headless:
            hidden += 1
            continue
        rows.append(row)
        if len(rows) >= limit:
            break
    return rows, hidden


def do_list(scope: str, project_root: str, include_headless: bool = False) -> int:
    rows, hidden = gather_recent_sessions(scope, project_root, include_headless=include_headless)
    if not rows:
        print("No session transcripts found for this "
              + ("machine." if scope == "all" else f"project.\n  Looked in: {PROJECTS_DIR / derive_slug(project_root)}"))
        return 0

    scope_label = "all projects" if scope == "all" else Path(project_root).name
    print(f"\nRecent Claude Code windows — {scope_label} (most recent first):\n")
    for r in rows:
        ago = humanize_ago(datetime.fromtimestamp(r["mtime"], tz=timezone.utc))
        title = r["title"][:72]
        header = f"  • {title}"
        meta = f"    {ago}  ·  branch {r['branch']}  ·  {r['n_prompts']} prompt(s)  ·  {r['session_id'][:8]}"
        if scope == "all":
            meta += f"  ·  {r['project']}"
        print(header)
        print(meta)
    if hidden:
        print(f"\n  ({hidden} single-turn helper/subprocess session(s) hidden — "
              f"add 'raw' to show)")
    print(f"\n  Recall one with:  /remindme <keyword>   or   /remindme --session <id>")
    return 0


# ---------------------------------------------------------------------------
# match mode — resolve a query to a specific other window, then recall it
# ---------------------------------------------------------------------------

def find_session_by_query(query: str, scope: str, project_root: str) -> Path | None:
    import re
    # Session-id (prefix) lookup — an explicit id is honored even if it is a
    # single-turn/headless session (4+ hex chars, optionally full-uuid form).
    q = query.strip()
    if re.fullmatch(r"[0-9a-f]{4,}(-[0-9a-f]+)*", q, re.IGNORECASE):
        matches = sorted(PROJECTS_DIR.glob(f"*/{q}*.jsonl"), key=_mtime, reverse=True)
        if matches:
            return matches[0]
    # Fuzzy over recent (non-headless) sessions' title + first line
    rows, _ = gather_recent_sessions(scope, project_root)
    best, best_score = None, 0
    for r in rows:
        s = match_score(query, f"{r['title']} {r['first_line']}")
        if s > best_score:
            best, best_score = r, s
    if best and best_score > 0:
        return PROJECTS_DIR / best["project"] / f"{best['session_id']}.jsonl"
    return None


# ---------------------------------------------------------------------------
# Project context (for the "where it fits" section)
# ---------------------------------------------------------------------------

def read_project_context(root) -> str:
    root = Path(root)
    chunks = []

    def add(label, path):
        try:
            if path.is_file():
                text = path.read_text(encoding="utf-8", errors="replace").strip()
                if text:
                    chunks.append(f"### {label}\n{text[:MAX_DOC_CHARS]}")
        except OSError:
            pass

    add("CLAUDE.md", root / "CLAUDE.md")
    add("README.md", root / "README.md")
    add("docs/STATUS.md", root / "docs" / "STATUS.md")

    backlog = root / "docs" / "backlog"
    try:
        if backlog.is_dir():
            names = sorted(p.name for p in backlog.glob("*.md"))
            if names:
                chunks.append("### docs/backlog/\n" + ", ".join(names[:20]))
    except OSError:
        pass

    return "\n\n".join(chunks) if chunks else "(no project docs found)"


# ---------------------------------------------------------------------------
# Synthesis prompt + model call
# ---------------------------------------------------------------------------

def build_prompt(facts: dict, project_ctx: str) -> str:
    trajectory = facts["typed_prompts"][-MAX_TRAJECTORY:]
    traj_block = "\n".join(
        f"{i}. {p[:MAX_PROMPT_CHARS]}" for i, p in enumerate(trajectory, 1)
    ) or "(none captured)"

    lines = [
        "Here are the extracted facts from a Claude Code session the developer "
        "has lost the thread of. Write the orientation briefing.",
        "",
        f"SESSION TITLE (auto-generated): {facts['ai_title'] or '(none)'}",
        f"GIT BRANCH: {facts['git_branch'] or '(unknown)'}",
        f"PROJECT DIR: {facts['cwd'] or '(unknown)'}",
        "",
        "ORIGINAL PROMPT (verbatim, what this window set out to do):",
        (facts["first_prompt"] or "(not recoverable)")[:MAX_PROMPT_CHARS * 3],
        "",
        f"YOUR PROMPTS OVER TIME (in order — read for drift; {facts['n_user']} total, "
        f"showing last {len(trajectory)}):",
        traj_block,
    ]
    if facts["compact_summary"]:
        lines += ["", "RECOVERED/COMPACTED HISTORY (a condensed summary of earlier context):",
                  facts["compact_summary"][:MAX_PROMPT_CHARS * 3]]
    if facts["last_assistant_text"]:
        lines += ["", "WHERE THINGS LEFT OFF (last thing the assistant said):",
                  facts["last_assistant_text"][:MAX_PROMPT_CHARS * 2]]
    lines += ["", "WIDER PROJECT CONTEXT (from the repo's own docs):", project_ctx]
    return "\n".join(lines)


def run_claude(prompt: str) -> str:
    proc = subprocess.Popen(
        [
            "claude", "-p", prompt,
            "--system-prompt", REMIND_SYSTEM,
            *model_flags("CFAI_REMIND_MODEL"),
            *CLAUDE_ISOLATION,
            "--tools", "",                     # load-bearing: no filesystem tool prompts
            "--output-format", "stream-json",
            "--include-partial-messages",
            "--verbose",
        ],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
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
                    delta = current[last_len:]
                    if delta:
                        print(delta, end="", flush=True)
                        last_len = len(current)
                    final_text = current
        elif event.get("type") == "result":
            rv = event.get("result", "")
            if rv and not final_text:
                final_text = rv
                print(rv, end="", flush=True)

    proc.wait()
    if proc.returncode != 0:
        sys.exit(f"\nERROR: claude CLI failed:\n{proc.stderr.read()}")
    return final_text


# ---------------------------------------------------------------------------
# recall / dry-run flows
# ---------------------------------------------------------------------------

def _print_header(path: Path, facts: dict) -> None:
    title = facts["ai_title"] or (facts["first_prompt"] or "")[:64]
    span = humanize_span(facts["started_at"], facts["last_ts"])
    # File mtime is always fresh (transcript line timestamps lag the live stream).
    last_ago = humanize_ago(datetime.fromtimestamp(_mtime(path), tz=timezone.utc))
    print("\n" + "=" * 64)
    print(f"  {title}".rstrip())
    print(f"  branch {facts['git_branch'] or '-'}  ·  {facts['n_user']} prompt(s)  ·  "
          f"active ~{span}  ·  last {last_ago}  ·  {path.stem[:8]}")
    print("=" * 64)


def do_dry_run(path: Path, project_root: str) -> int:
    facts = parse_transcript(load_transcript(path))
    _print_header(path, facts)
    print(f"  transcript      : {path}")
    print(f"  cwd (from log)  : {facts['cwd']}")
    print(f"  ai title        : {facts['ai_title']}")
    print(f"  first prompt    : {(facts['first_prompt'] or '')[:120]}")
    print(f"  typed prompts   : {facts['n_user']}")
    print(f"  assistant turns : {facts['n_assistant']}")
    print(f"  compaction seen : {'yes' if facts['compact_summary'] else 'no'}")
    print(f"  last assistant  : {(facts['last_assistant_text'] or '')[:120]}")
    print("\n  (dry run — no model call, no writes)")
    return 0


def do_json(path: Path, project_root: str) -> int:
    """Dump the session facts as JSON. No model call, no writes.

    This is the data feed for `/session-to-backlog`: the same reconstruction
    `/remindme` narrates, emitted as structured facts so the reconciliation can
    be computed against `Touches` rather than read out of prose.
    """
    lines = load_transcript(path)
    facts = parse_transcript(lines)
    facts["session_id"] = path.stem
    facts["transcript"] = str(path)
    facts["files_touched"] = touched_files(lines, facts.get("cwd") or project_root)
    print(json.dumps(facts, indent=2, ensure_ascii=False))
    return 0


def do_recall(path: Path, project_root: str) -> int:
    facts = parse_transcript(load_transcript(path))
    _print_header(path, facts)
    ctx_root = facts["cwd"] or project_root
    project_ctx = read_project_context(ctx_root)
    print()  # blank line before the streamed briefing
    run_claude(build_prompt(facts, project_ctx))
    print()
    return 0


# ---------------------------------------------------------------------------
# self-test (no model, no writes)
# ---------------------------------------------------------------------------

def _fixture_lines():
    return [
        {"type": "queue-operation", "operation": "enqueue"},
        {"type": "ai-title", "aiTitle": "First title"},
        {"type": "user", "parentUuid": None, "promptSource": "sdk",
         "cwd": "/tmp/proj", "gitBranch": "main",
         "timestamp": "2026-07-09T20:00:00.000Z",
         "message": {"role": "user", "content": "Build the thing"}},
        {"type": "assistant",
         "message": {"role": "assistant", "model": "claude-opus-4-8",
                     "content": [{"type": "text", "text": "Working on it"},
                                 {"type": "tool_use", "id": "t1", "name": "Bash", "input": {}}]},
         "timestamp": "2026-07-09T20:01:00.000Z"},
        {"type": "user",
         "message": {"role": "user",
                     "content": [{"type": "tool_result", "tool_use_id": "t1", "content": "ok"}]},
         "timestamp": "2026-07-09T20:01:30.000Z"},
        {"type": "user", "parentUuid": "x", "cwd": "/tmp/proj", "gitBranch": "main",
         "timestamp": "2026-07-09T20:05:00.000Z",
         "message": {"role": "user", "content": "Actually pivot to the other thing"}},
        {"type": "attachment", "message": {"role": "user", "content": []}},
        {"type": "user", "message": {"role": "user", "content": "/remindme"}},
        {"type": "user", "message": {"role": "user",
                                     "content": "<system-reminder>ignore me</system-reminder>"}},
        {"type": "ai-title", "aiTitle": "Second title"},
        {"type": "user", "isCompactSummary": True,
         "message": {"role": "user", "content": "Summary of earlier context here"}},
        {"type": "assistant",
         "message": {"role": "assistant",
                     "content": [{"type": "text", "text": "Final state summary"},
                                 {"type": "tool_use", "id": "t2", "name": "Edit",
                                  "input": {"file_path": "/tmp/proj/src/pay.ts"}},
                                 {"type": "tool_use", "id": "t3", "name": "Read",
                                  "input": {"file_path": "/tmp/proj/src/never-written.ts"}}]},
         "timestamp": "2026-07-09T20:10:00.000Z"},
        {"type": "file-history-snapshot", "messageId": "m1",
         "snapshot": {"trackedFileBackups": {
             "src/auth.ts": {"backupFileName": "abc@v2", "version": 2},
             "src/pay.ts": {"backupFileName": "def@v1", "version": 1}}}},
        {"type": "last-prompt", "lastPrompt": "Actually pivot to the other thing"},
    ]


def self_test() -> int:
    print("remindme.py — self-test")
    print("=" * 42)

    # content flattening
    assert flatten_content("hi") == "hi"
    assert flatten_content([{"type": "text", "text": "a"},
                            {"type": "text", "text": "b"}]) == "a\nb"
    assert flatten_content([{"type": "tool_result", "content": "x"}]) == ""

    # genuine-prompt filter
    assert is_genuine_prompt({"type": "user", "message": {"content": "hello"}})
    assert not is_genuine_prompt({"type": "user", "message": {"content": "/remindme list"}})
    assert not is_genuine_prompt({"type": "user", "isCompactSummary": True,
                                  "message": {"content": "s"}})
    assert not is_genuine_prompt({"type": "user",
                                  "message": {"content": [{"type": "tool_result", "content": "x"}]}})
    assert not is_genuine_prompt({"type": "assistant", "message": {"content": "x"}})
    # slash-command turns are cleaned to "/name args", not raw XML
    assert _visible_text("<command-message>init</command-message> "
                         "<command-name>/init</command-name>") == "/init"
    assert _visible_text("<command-name>adopt-standards</command-name>"
                         "<command-args>mobile</command-args>") == "adopt-standards mobile"

    # transcript parsing
    facts = parse_transcript(_fixture_lines())
    assert facts["first_prompt"] == "Build the thing", facts["first_prompt"]
    assert facts["typed_prompts"] == ["Build the thing", "Actually pivot to the other thing"], facts["typed_prompts"]
    assert facts["ai_title"] == "Second title", facts["ai_title"]
    assert "Summary of earlier context" in (facts["compact_summary"] or "")
    assert facts["last_assistant_text"] == "Final state summary", facts["last_assistant_text"]
    assert facts["git_branch"] == "main"
    assert facts["cwd"] == "/tmp/proj"
    assert facts["n_user"] == 2 and facts["n_assistant"] == 2
    assert facts["n_fhs"] == 1 and facts["n_mode"] == 0

    # touched files: both signals unioned, deduped, repo-relative, sorted.
    touched = touched_files(_fixture_lines(), facts["cwd"])
    assert touched == ["src/auth.ts", "src/pay.ts"], touched
    assert "src/never-written.ts" not in touched, "Read is not a write"
    # Absolute tool_use paths outside the session cwd stay absolute rather than
    # being silently mangled into a bogus relative path.
    assert touched_files(
        [{"type": "assistant", "message": {"content": [
            {"type": "tool_use", "name": "Write", "input": {"file_path": "/elsewhere/x.ts"}}]}}],
        "/tmp/proj") == ["/elsewhere/x.ts"]
    assert touched_files([], "/tmp/proj") == []

    # headless detection: single-turn, no interactive markers → headless
    assert is_headless({"n_user": 1, "n_fhs": 0, "n_mode": 0})
    assert not is_headless({"n_user": 1, "n_fhs": 2, "n_mode": 0})  # had file activity
    assert not is_headless({"n_user": 5, "n_fhs": 0, "n_mode": 0})  # multi-prompt
    assert not is_headless(facts)  # fixture has 2 typed prompts

    # slug + matcher + prompt builder
    assert derive_slug("/Users/x/cfai_gold_standards") == "-Users-x-cfai-gold-standards", derive_slug("/Users/x/cfai_gold_standards")
    assert derive_slug("/Users/x/HandyConnect V2.0") == "-Users-x-HandyConnect-V2-0"
    assert match_score("thing", "Build the thing") > match_score("thing", "unrelated")
    assert match_score("", "anything") == 0
    prompt = build_prompt(facts, "(no project docs found)")
    assert "Build the thing" in prompt and "ORIGINAL PROMPT" in prompt

    # time helpers
    assert humanize_ago(None) == "unknown"
    assert humanize_span("2026-07-09T20:00:00.000Z", "2026-07-09T20:30:00.000Z") == "30m"

    # model routing: script var → CFAI_MODEL → ANTHROPIC_MODEL → settings.json →
    # inherit the CLI (never pin an ID). Snapshot/restore the env so the self-test
    # leaves no side effects.
    _saved = {k: os.environ.get(k)
              for k in ("CFAI_REMIND_MODEL", "CFAI_MODEL", "ANTHROPIC_MODEL")}
    try:
        for k in _saved:
            os.environ.pop(k, None)
        # With no env override the model comes from settings.json, if one pins it.
        _pinned = _settings_model()
        assert model_flags("CFAI_REMIND_MODEL") == (["--model", _pinned] if _pinned else []), \
            "no env override must fall back to settings.json, else inherit the CLI"
        os.environ["CFAI_MODEL"] = "model-b"
        assert model_flags("CFAI_REMIND_MODEL") == ["--model", "model-b"]
        os.environ["CFAI_REMIND_MODEL"] = "model-a"
        assert model_flags("CFAI_REMIND_MODEL") == ["--model", "model-a"], "script var must win"
        os.environ["CFAI_REMIND_MODEL"] = "   "
        assert model_flags("CFAI_REMIND_MODEL") == ["--model", "model-b"], "blank var must fall through"
        # Isolation is what keeps a personal CLAUDE.md footer rule out of the recap.
        assert CLAUDE_ISOLATION == ["--setting-sources", ""], "subprocess must be isolated"
    finally:
        for k, v in _saved.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v

    print("\n  OK — parser, filters, slug, matcher, prompt builder, time helpers, "
          "and model routing valid. No model call, no writes.")
    return 0


# ---------------------------------------------------------------------------
# Gotchas (real behaviours this script defends against)
# ---------------------------------------------------------------------------
# - Project slug hyphenates '_' and '.' too ('cfai_gold_standards' →
#   'cfai-gold-standards'), so a naive '/'→'-' is wrong. We prefer
#   $CLAUDE_CODE_SESSION_ID + a filename glob, and verify by the transcript's
#   own `cwd` field before trusting a slug-derived dir.
# - Every CFAI helper that shells `claude -p` (generate_standard.py,
#   docs_update.py, and this script's own recall) leaves a single-turn session
#   in the project dir. is_headless() hides those from list/match ('raw' shows).
# - Transcript line `timestamp`s lag the live stream, so the header's
#   "last active" uses the file mtime, which is always fresh.
# - Never feed a whole transcript to the model — only the compact extracted
#   signals + bounded project-doc excerpts.

# ---------------------------------------------------------------------------
# Main / router
# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(
        description="Recall what a Claude Code window was for (the /remindme command).",
        add_help=True,
    )
    ap.add_argument("target", nargs="*",
                    help="empty = recall current window; 'list [all]' = map windows; "
                         "otherwise a keyword/session-id to recall another window")
    ap.add_argument("--session", help="recall a specific session id (prefix ok)")
    ap.add_argument("--transcript", help="recall a specific transcript file path")
    ap.add_argument("--project", help="project dir (defaults to cwd)")
    ap.add_argument("--all", action="store_true", help="scope list/match to ALL projects")
    ap.add_argument("--raw", action="store_true",
                    help="in list mode, also show single-turn helper/subprocess sessions")
    ap.add_argument("--dry-run", action="store_true",
                    help="print extracted facts; no model call, no writes")
    ap.add_argument("--json", action="store_true", dest="as_json",
                    help="emit session facts + files touched as JSON; no model call, no writes")
    ap.add_argument("--self-test", action="store_true",
                    help="validate parser + helpers; no model, no writes")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    project_root = str(Path(args.project or os.getcwd()).resolve())
    tokens = [t for t in args.target if t]

    # list mode
    if tokens and tokens[0].lower() == "list":
        rest = [t.lower() for t in tokens[1:]]
        scope = "all" if (args.all or "all" in rest) else "project"
        include_headless = args.raw or "raw" in rest
        return do_list(scope, project_root, include_headless=include_headless)

    # match mode (a keyword or session-id given as positional)
    if tokens and not args.session and not args.transcript:
        scope = "all" if args.all else "project"
        qtokens = list(tokens)
        while qtokens and qtokens[-1].lower() in ("all", "raw"):
            if qtokens[-1].lower() == "all":
                scope = "all"
            qtokens.pop()
        query = " ".join(qtokens)
        path = find_session_by_query(query, scope, project_root)
        if not path:
            print(f"No window matched '{query}'"
                  + ("" if args.all else " in this project — try  /remindme <keyword> all"))
            return 1
    else:
        # recall current (or an explicit --session/--transcript). An explicit
        # --project pins a different project, so don't let the current window's
        # env session mask it.
        path = resolve_transcript(session=args.session, transcript=args.transcript,
                                  project=project_root,
                                  allow_env_session=(args.project is None))
        if not path:
            print("Could not find a session transcript to recall.\n"
                  "  Tip: pass --session <id> or --transcript <path>, or run from the "
                  "project directory.")
            return 1

    if args.as_json:
        return do_json(path, project_root)
    if args.dry_run:
        return do_dry_run(path, project_root)
    return do_recall(path, project_root)


if __name__ == "__main__":
    sys.exit(main())
