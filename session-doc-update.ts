/**
 * session-doc-update.ts — CFAI Gold Standards: End-of-Session Documentation Updater
 *
 * Atomically syncs all living documentation files after a development session.
 * Copy this file to your project root, customise the path constants below, then run:
 *   npx tsx session-doc-update.ts
 *
 * Prerequisites: Node.js ≥20, tsx ≥4 (npx tsx works without installing locally)
 * Add to package.json: "session:update": "tsx session-doc-update.ts"
 *
 * ── Modes ────────────────────────────────────────────────────────────────────
 *
 * DEFAULT (zero-arg): derives everything from git history.
 *   npx tsx session-doc-update.ts
 *
 * Dry-run preview:
 *   npx tsx session-doc-update.ts --dry-run
 *
 * Flag mode — override specific fields, auto-detect the rest:
 *   npx tsx session-doc-update.ts --tests "17 GREEN" --build "#1182 abc1234" --deployed
 *
 * Full flag mode:
 *   npx tsx session-doc-update.ts --title "Sprint: ..." --summary "Fix A|Fix B" \
 *     --tests "17 GREEN" --build "#1182 abc1234" --deployed --db-rows 546 \
 *     --personas "docs-steward,qa-engineer" \
 *     --resolve-watchpoint "docs-steward:WP-DS-001" \
 *     --close-backlog "docs-steward:some backlog item" \
 *     --update-engagement "docs-steward:TypeScript|✅ 0 errors"
 *
 * Interactive mode — prompts for each field with auto-detected defaults:
 *   npx tsx session-doc-update.ts --interactive
 *
 * ── Session narrative flags ───────────────────────────────────────────────────
 *
 *   --session N                integer — session number
 *   --title "..."              string
 *   --summary "A|B|C"          pipe-separated bullets
 *   --fixes "A|B"              pipe-separated
 *   --tests "47 GREEN"         string
 *   --build "#1234 abc1234"    build number + SHA
 *   --deployed                 boolean flag — marks as deployed
 *   --oracle-score N           integer (0–100)
 *   --db-rows N                integer — rows backfilled
 *   --personas "slug1,slug2"   comma-separated persona file slugs (no .md extension)
 *   --dry-run                  preview changes without writing
 *   --no-prompt                skip confirmation prompts
 *   --interactive              prompt for each field
 *
 * ── Mutation flags (repeatable, work in all modes) ───────────────────────────
 *
 *   --resolve-watchpoint "slug:WP-ID"
 *       Mark watchpoint OPEN → ✅ RESOLVED in docs/team-personas/{slug}.md
 *
 *   --close-backlog "slug:keyword"
 *       Strikethrough a backlog table row matching keyword
 *
 *   --update-engagement "slug:keyword|new status text"
 *       Replace the status cell in the Current Engagement table
 *
 * ── Memory / .claude flags (repeatable) ──────────────────────────────────────
 *
 *   --new-memory "type:slug:title|body-para-1|body-para-2|..."
 *       Creates memory/{type}_{slug}.md and inserts pointer in MEMORY.md.
 *       type must be: feedback | project | reference
 *
 *   --update-memory "slugPattern:oldText|newText"
 *       Glob-matches memory/*{slugPattern}*.md (must be exactly 1 match).
 *       NOTE: pipe (|) cannot appear in oldText or newText — use a unique phrase instead.
 *
 *   --patch-claude-doc "relativePath:oldText|newText"
 *       Patches a file inside .claude/. Protected files are rejected.
 *       NOTE: pipe (|) cannot appear in oldText or newText.
 *
 * ── Environment variables ─────────────────────────────────────────────────────
 *
 *   CFAI_CHANGELOG_HEADER  Exact string matching your CHANGELOG.md section header,
 *                          e.g. "## Changelog" or "## 12. Recent Updates & Changelog".
 *                          If unset, the script scans for any ## line containing
 *                          "changelog" (case-insensitive).
 *
 * ── Self-test checklist (run against a project with real living docs) ─────────
 *
 *   npx tsx session-doc-update.ts --dry-run
 *   npx tsx session-doc-update.ts --dry-run --session 99 --title "test" --summary "A|B" --tests "0 GREEN"
 *   npx tsx session-doc-update.ts --dry-run --resolve-watchpoint "slug:WP-TEST-001"
 *   npx tsx session-doc-update.ts --dry-run --new-memory "feedback:test:Test Title|Para 1|Para 2"
 *   npx tsx session-doc-update.ts --dry-run --update-memory "test:old text|new text"
 *   npx tsx session-doc-update.ts --dry-run --patch-claude-doc "objectives.md:old text|new text"
 *   npx tsx session-doc-update.ts --dry-run --patch-claude-doc "../../etc/passwd:x|y"  # should reject
 *   npx tsx session-doc-update.ts --dry-run --patch-claude-doc "settings.json:x|y"      # should reject
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

// ─────────────────────────────────────────────────────────────────
// Path constants — adapt these to your project's directory structure
// ─────────────────────────────────────────────────────────────────

const HOME = process.env.HOME ?? process.env.USERPROFILE ?? '/';

// Script runs from the project root via npx tsx session-doc-update.ts
const PROJECT_ROOT = process.cwd();

// Auto-derives Claude's project memory path from the project root:
//   /Users/you/my-project  →  -Users-you-my-project  →  ~/.claude/projects/-Users-you-my-project/memory
const PROJECT_KEY = PROJECT_ROOT.replace(/\//g, '-');
const MEMORY_DIR = path.join(HOME, `.claude/projects/${PROJECT_KEY}/memory`);

const SESSION_HISTORY_PATH = path.join(MEMORY_DIR, 'session-history.md');
const MEMORY_PATH = path.join(MEMORY_DIR, 'MEMORY.md');
const CHANGELOG_PATH = path.join(PROJECT_ROOT, 'docs/CHANGELOG.md');   // ← adjust if different
const STATUS_PATH = path.join(PROJECT_ROOT, 'docs/STATUS.md');          // ← adjust if different
const PERSONAS_DIR = path.join(PROJECT_ROOT, 'docs/team-personas');     // ← adjust if different
const CLAUDE_DIR = path.join(PROJECT_ROOT, '.claude');

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface PersonaMutation {
  slug: string;
  type: 'resolve-watchpoint' | 'close-backlog' | 'update-engagement';
  key: string;    // watchpoint ID, or keyword for backlog/engagement search
  value?: string; // new status text for update-engagement
}

interface MemoryWrite {
  type: 'feedback' | 'project' | 'reference';
  slug: string;
  title: string;
  paragraphs: string[]; // each element becomes a paragraph in the file body
}

interface MemoryUpdate {
  slugPattern: string; // partial filename match
  oldText: string;
  newText: string;
}

interface ClaudeDocPatch {
  relativePath: string; // relative to CLAUDE_DIR, e.g. "objectives.md"
  oldText: string;
  newText: string;
}

interface SessionData {
  sessionNumber: number;
  date: string;              // YYYY-MM-DD
  title: string;
  summary: string;           // pipe-separated bullets
  fixes: string;             // pipe-separated
  tests: string;
  build?: string;            // e.g. "#1182 abc1234"
  emoji?: string;            // override auto-selection
  oracleScore?: number;
  deployed: boolean;
  dbRows?: number;
  personaFiles: string[];    // slugs for Last Updated stamp
  mutations: PersonaMutation[];
  memoryWrites: MemoryWrite[];
  memoryUpdates: MemoryUpdate[];
  claudeDocPatches: ClaudeDocPatch[];
  dryRun: boolean;
  noPrompt: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Argument parsing
// ─────────────────────────────────────────────────────────────────

function parseArgs(): Partial<SessionData> {
  const args = process.argv.slice(2);
  const result: Partial<SessionData> = {};
  const mutations: PersonaMutation[] = [];
  const memoryWrites: MemoryWrite[] = [];
  const memoryUpdates: MemoryUpdate[] = [];
  const claudeDocPatches: ClaudeDocPatch[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = () => args[++i] ?? '';

    switch (arg) {
      case '--session':       result.sessionNumber = parseInt(next()); break;
      case '--title':         result.title = next(); break;
      case '--summary':       result.summary = next(); break;
      case '--fixes':         result.fixes = next(); break;
      case '--tests':         result.tests = next(); break;
      case '--build':         result.build = next(); break;
      case '--emoji':         result.emoji = next(); break;
      case '--oracle-score':  result.oracleScore = parseInt(next()); break;
      case '--deployed':      result.deployed = true; break;
      case '--no-dry-run':    result.dryRun = false; break;
      case '--dry-run':       result.dryRun = true; break;
      case '--no-prompt':     result.noPrompt = true; break;
      case '--db-rows':       result.dbRows = parseInt(next()); break;
      case '--personas':
        result.personaFiles = next().split(',').map(s => s.trim()).filter(Boolean);
        break;

      // ── Persona mutation flags (repeatable) ──────────────────────

      case '--resolve-watchpoint': {
        // Format: "slug:WP-ID"
        const raw = next();
        const colonIdx = raw.indexOf(':');
        if (colonIdx > 0) {
          mutations.push({
            slug: raw.slice(0, colonIdx).trim(),
            type: 'resolve-watchpoint',
            key: raw.slice(colonIdx + 1).trim(),
          });
        }
        break;
      }

      case '--close-backlog': {
        // Format: "slug:keyword"
        const raw = next();
        const colonIdx = raw.indexOf(':');
        if (colonIdx > 0) {
          mutations.push({
            slug: raw.slice(0, colonIdx).trim(),
            type: 'close-backlog',
            key: raw.slice(colonIdx + 1).trim(),
          });
        }
        break;
      }

      case '--update-engagement': {
        // Format: "slug:keyword|new status"
        const raw = next();
        const colonIdx = raw.indexOf(':');
        if (colonIdx > 0) {
          const slug = raw.slice(0, colonIdx).trim();
          const rest = raw.slice(colonIdx + 1);
          const pipeIdx = rest.indexOf('|');
          if (pipeIdx > 0) {
            mutations.push({
              slug,
              type: 'update-engagement',
              key: rest.slice(0, pipeIdx).trim(),
              value: rest.slice(pipeIdx + 1).trim(),
            });
          }
        }
        break;
      }

      // ── Memory / .claude doc flags (repeatable) ──────────────────

      case '--new-memory': {
        // Format: "type:slug:title|body-para-1|body-para-2|..."
        const raw = next();
        const parts = raw.split(':');
        if (parts.length >= 3) {
          const type = parts[0].trim() as MemoryWrite['type'];
          const slug = parts[1].trim();
          const rest = parts.slice(2).join(':'); // re-join in case title contains colons
          const pipeIdx = rest.indexOf('|');
          const title = pipeIdx === -1 ? rest.trim() : rest.slice(0, pipeIdx).trim();
          const paragraphs = pipeIdx === -1 ? [] : rest.slice(pipeIdx + 1).split('|').map(s => s.trim()).filter(Boolean);
          memoryWrites.push({ type, slug, title, paragraphs });
        }
        break;
      }

      case '--update-memory': {
        // Format: "slugPattern:oldText|newText"
        const raw = next();
        const colonIdx = raw.indexOf(':');
        if (colonIdx > 0) {
          const slugPattern = raw.slice(0, colonIdx).trim();
          const rest = raw.slice(colonIdx + 1);
          const pipeIdx = rest.indexOf('|');
          if (pipeIdx > 0) {
            memoryUpdates.push({
              slugPattern,
              oldText: rest.slice(0, pipeIdx).trim(),
              newText: rest.slice(pipeIdx + 1).trim(),
            });
          }
        }
        break;
      }

      case '--patch-claude-doc': {
        // Format: "relativePath:oldText|newText"
        const raw = next();
        const colonIdx = raw.indexOf(':');
        if (colonIdx > 0) {
          const relativePath = raw.slice(0, colonIdx).trim();
          const rest = raw.slice(colonIdx + 1);
          const pipeIdx = rest.indexOf('|');
          if (pipeIdx > 0) {
            claudeDocPatches.push({
              relativePath,
              oldText: rest.slice(0, pipeIdx).trim(),
              newText: rest.slice(pipeIdx + 1).trim(),
            });
          }
        }
        break;
      }
    }
  }

  if (mutations.length > 0) result.mutations = mutations;
  if (memoryWrites.length > 0) result.memoryWrites = memoryWrites;
  if (memoryUpdates.length > 0) result.memoryUpdates = memoryUpdates;
  if (claudeDocPatches.length > 0) result.claudeDocPatches = claudeDocPatches;
  return result;
}

// ─────────────────────────────────────────────────────────────────
// Auto-detect last session number
// ─────────────────────────────────────────────────────────────────

async function resolveNextSessionNumber(): Promise<number | undefined> {
  try {
    const content = await fs.readFile(SESSION_HISTORY_PATH, 'utf8');
    const firstLine = content.split('\n')[0] ?? '';
    const m = firstLine.match(/Sessions \d+[–-](\d+)/);
    if (m) return parseInt(m[1]) + 1;
  } catch {
    // file unreadable — fall back to prompt
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────
// Git defaults
// ─────────────────────────────────────────────────────────────────

function resolveGitDefaults(): { fixes: string; title: string } {
  try {
    const log = execSync('git log --oneline -5 --no-merges', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const lines = log.trim().split('\n');
    const title = lines[0]?.replace(/^[a-f0-9]+ /, '') ?? '';
    const fixes = lines
      .map((l, i) => `${i + 1}. ${l.replace(/^[a-f0-9]+ /, '')}`)
      .join('|');
    return { fixes, title };
  } catch {
    return { fixes: '', title: '' };
  }
}

// ─────────────────────────────────────────────────────────────────
// Auto-detection helpers (used in zero-arg mode)
// ─────────────────────────────────────────────────────────────────

function resolveCommitsSinceLastDoc(): string[] {
  try {
    const anchor = execSync(
      'git log --format=%H --grep="docs: sync project context" -1',
      { cwd: PROJECT_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    const logCmd = anchor
      ? `git log ${anchor}..HEAD --oneline --no-merges`
      : 'git log --oneline --no-merges -10';
    const log = execSync(logCmd, { cwd: PROJECT_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return log.trim().split('\n').filter(Boolean).map(l => l.replace(/^[a-f0-9]+ /, ''));
  } catch {
    return [];
  }
}

function stripConventionalPrefix(msg: string): string {
  return msg
    .replace(/^(fix|feat|chore|refactor|test|style|perf|ci|build|docs)(\([^)]+\))?!?:\s*/i, '')
    .trim();
}

function resolvePersonasFromGit(): string[] {
  try {
    const anchor = execSync(
      'git log --format=%H --grep="docs: sync project context" -1',
      { cwd: PROJECT_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    const logCmd = anchor
      ? `git log ${anchor}..HEAD --name-only --format=""`
      : 'git log -20 --name-only --format=""';
    const log = execSync(logCmd, { cwd: PROJECT_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const personasRelDir = path.relative(PROJECT_ROOT, PERSONAS_DIR).replace(/\\/g, '/');
    const slugs = log
      .split('\n')
      .filter(l => l.includes(personasRelDir) && l.endsWith('.md'))
      .map(l => path.basename(l, '.md'));
    return [...new Set(slugs)];
  } catch {
    return [];
  }
}

async function buildAutoSessionData(
  sessionNumber: number,
  partialMutations: PersonaMutation[],
  dryRun: boolean,
): Promise<SessionData> {
  const commits = resolveCommitsSinceLastDoc();
  const meaningful = commits.filter(c => !/^docs: sync project context/i.test(c));
  const bullets = meaningful.map(stripConventionalPrefix).filter(Boolean);
  const personaFiles = resolvePersonasFromGit();

  return {
    sessionNumber,
    date: new Date().toISOString().slice(0, 10),
    title: bullets[0] ?? '(no title)',
    summary: bullets.join('|') || '(see git log)',
    fixes: meaningful.join('|') || '(see git log)',
    tests: '(see test suite)',
    build: undefined,
    deployed: false,
    personaFiles,
    mutations: partialMutations,
    memoryWrites: [],
    memoryUpdates: [],
    claudeDocPatches: [],
    dryRun,
    noPrompt: true,
  };
}

// ─────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

function selectEmoji(data: SessionData): string {
  if (data.emoji) return data.emoji;
  if (data.deployed) {
    const bugWords = /\b(fix|bug|regression|patch|revert|broken|dead|crash|repair|correct)\b/i;
    if (bugWords.test(data.fixes + ' ' + data.title)) return '🐛';
    return '🚀';
  }
  return '📊';
}

function pipeToBullets(s: string): string {
  return s.split('|').map(p => `- ${p.trim()}`).join('\n');
}

function pipeToNumbered(s: string): string {
  return s.split('|').map((p, i) => `${i + 1}. ${p.trim()}`).join('\n');
}

function oneLiner(s: string): string {
  return s.split('|')[0].trim();
}

// ─────────────────────────────────────────────────────────────────
// Transform 1: session-history.md
// ─────────────────────────────────────────────────────────────────

async function updateSessionHistory(
  data: SessionData,
  filePath: string,
  dryRun: boolean,
): Promise<void> {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');

  lines[0] = lines[0].replace(
    /\(Sessions (\d+)–(\d+)\)/,
    (_, lower) => `(Sessions ${lower}–${data.sessionNumber})`,
  );

  const allTouchedSlugs = [
    ...new Set([
      ...data.personaFiles,
      ...data.mutations.map(m => m.slug),
    ]),
  ];

  const newBlock = [
    '',
    `## Session ${data.sessionNumber} (${data.date}) — ${data.title}`,
    '',
    '### What Was Done',
    '',
    pipeToBullets(data.summary),
    '',
    '### Fixes',
    '',
    pipeToNumbered(data.fixes),
    '',
    '### Tests',
    '',
    data.tests,
    '',
    '### Build',
    '',
    data.build ?? '(no deploy this session)',
    '',
    '### Personas Touched',
    '',
    allTouchedSlugs.length > 0 ? allTouchedSlugs.join(', ') : '(none)',
    '',
  ].join('\n');

  const result = lines[0] + '\n' + newBlock + lines.slice(1).join('\n');
  const addedLines = newBlock.split('\n').length;

  if (dryRun) {
    console.log(`  session-history.md     (+${addedLines} lines prepended, header range updated)`);
  } else {
    await fs.writeFile(filePath, result, 'utf8');
    console.log('  ✓ session-history.md');
  }
}

// ─────────────────────────────────────────────────────────────────
// Transform 2: MEMORY.md
// ─────────────────────────────────────────────────────────────────

function enforceMemoryLineLimit(lines: string[], max: number = 195): string[] {
  let current = lines;
  while (current.length > max) {
    const startIdx = current.findIndex(l => l.startsWith('### What Changed'));
    if (startIdx === -1) break;

    const endIdx = current.findIndex(
      (l, i) => i > startIdx + 2 && (l === '---' || l.startsWith('### Prior Sessions')),
    );
    if (endIdx === -1) break;

    const bullets = current
      .slice(startIdx + 1, endIdx)
      .map((l, i) => ({ l, idx: startIdx + 1 + i }))
      .filter(({ l }) => /^- \*\*\d+\*\*:/.test(l));

    if (bullets.length === 0) break;

    const removeIdx = bullets[bullets.length - 1].idx;
    current = current.filter((_, i) => i !== removeIdx);
  }
  return current;
}

async function updateMemory(
  data: SessionData,
  filePath: string,
  dryRun: boolean,
): Promise<void> {
  const content = await fs.readFile(filePath, 'utf8');
  let lines = content.split('\n');
  const originalCount = lines.length;

  // 1. Update Current State header
  const stateIdx = lines.findIndex(l => l.startsWith('## Current State'));
  if (stateIdx !== -1) {
    const existing = lines[stateIdx];
    const buildMatch = existing.match(/Build #(\d+)/);
    const buildNum = data.build
      ? data.build.replace(/^#?(\d+).*/, '$1')
      : (buildMatch?.[1] ?? '?');
    const oracleStr = data.oracleScore !== undefined ? ` — ORACLE ${data.oracleScore}/100` : '';
    lines[stateIdx] = `## Current State (${data.date} — post-Session ${data.sessionNumber} — Build #${buildNum}${oracleStr})`;
  }

  // 2. Prepend bullet to What Changed section
  const wcIdx = lines.findIndex(l => l.startsWith('### What Changed'));
  if (wcIdx !== -1) {
    const testsStr = data.tests ? ` ${data.tests}.` : '';
    const buildStr = data.deployed && data.build ? ` Build ${data.build}.` : '';
    const newBullet = `- **${data.sessionNumber}**: ${oneLiner(data.summary)}.${testsStr}${buildStr}`;
    let insertAt = wcIdx + 1;
    if (lines[insertAt] === '') insertAt++;
    lines.splice(insertAt, 0, newBullet);
  }

  // 3. Enforce 195-line limit
  const beforeEnforce = lines.length;
  lines = enforceMemoryLineLimit(lines, 195);
  const pruned = beforeEnforce - lines.length;

  const result = lines.join('\n');

  if (dryRun) {
    console.log(
      `  MEMORY.md              (Current State updated, 1 bullet prepended, ${pruned} pruned — ${originalCount}→${lines.length} lines)`,
    );
  } else {
    await fs.writeFile(filePath, result, 'utf8');
    console.log(`  ✓ MEMORY.md (${originalCount}→${lines.length} lines${pruned > 0 ? `, ${pruned} old bullets pruned` : ''})`);
  }

  if (lines.length > 195) {
    process.stderr.write(
      `\nWARNING: MEMORY.md is ${lines.length} lines after pruning. Manual pruning may be needed.\n`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Transform 3: CHANGELOG.md
// ─────────────────────────────────────────────────────────────────

function resolveChangelogHeader(lines: string[]): number {
  // Tier 1: explicit env override
  const envHeader = process.env.CFAI_CHANGELOG_HEADER;
  if (envHeader) {
    const idx = lines.findIndex(l => l.trim() === envHeader.trim());
    if (idx !== -1) return idx;
  }
  // Tier 2: scan for any ## line containing "changelog" (case-insensitive)
  return lines.findIndex(l => l.startsWith('## ') && /changelog/i.test(l));
}

async function updateChangelog(
  data: SessionData,
  filePath: string,
  dryRun: boolean,
): Promise<void> {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');

  const headerIdx = resolveChangelogHeader(lines);
  if (headerIdx === -1) {
    process.stderr.write(
      '  ✗ CHANGELOG.md: could not find changelog section header. ' +
      'Set CFAI_CHANGELOG_HEADER env var or add a ## ...Changelog... header.\n',
    );
    return;
  }

  // Find the minor number of the most recent entry and increment
  let nextMinor = 1;
  const firstEntryIdx = lines.findIndex((l, i) => i > headerIdx && /^### \d+\.\d+/.test(l));
  if (firstEntryIdx !== -1) {
    const m = lines[firstEntryIdx].match(/^### \d+\.(\d+)/);
    if (m) nextMinor = parseInt(m[1]) + 1;
  }

  const emoji = selectEmoji(data);
  const formattedDate = formatDateLong(data.date);

  const statusLine = [
    `✅ **Complete** — ${data.tests}`,
    data.dbRows ? `, ${data.dbRows} DB rows backfilled,` : ',',
    data.deployed && data.build ? ` Build ${data.build} deployed` : ' (no deploy)',
  ].join('');

  const summaryProse = data.summary.split('|').map(s => s.trim()).join('. ');

  const newEntry = [
    `### ${data.sessionNumber}.${nextMinor} ${emoji} Session ${data.sessionNumber} (${formattedDate}): ${data.title}`,
    '',
    `**Status**: ${statusLine}`,
    '',
    summaryProse,
    '',
    `**Build**: ${data.build ?? '(no deploy)'} (${data.date})`,
    '',
    '---',
    '',
  ].join('\n');

  let insertAt = headerIdx + 1;
  if (lines[insertAt] === '') insertAt++;
  lines.splice(insertAt, 0, ...newEntry.split('\n'));

  if (dryRun) {
    console.log(`  CHANGELOG.md           (entry ${data.sessionNumber}.${nextMinor} ${emoji} prepended)`);
  } else {
    await fs.writeFile(filePath, lines.join('\n'), 'utf8');
    console.log(`  ✓ CHANGELOG.md (entry ${data.sessionNumber}.${nextMinor} ${emoji})`);
  }
}

// ─────────────────────────────────────────────────────────────────
// Transform 4: STATUS.md
// ─────────────────────────────────────────────────────────────────

async function updateStatus(
  data: SessionData,
  filePath: string,
  dryRun: boolean,
): Promise<void> {
  const content = await fs.readFile(filePath, 'utf8');
  let lines = content.split('\n');

  // 1. Last Updated
  const lastUpdatedIdx = lines.findIndex(l => l.startsWith('**Last Updated**:'));
  if (lastUpdatedIdx !== -1) {
    lines[lastUpdatedIdx] = `**Last Updated**: ${data.date} (Session ${data.sessionNumber})`;
  }

  // 2. Build number lines (if deployed)
  if (data.deployed && data.build) {
    const buildLineIdx = lines.findIndex(l => /^- Build: #\d+/.test(l));
    if (buildLineIdx !== -1) {
      lines[buildLineIdx] = `- Build: ${data.build} — Session ${data.sessionNumber} deployed, \`buildsBehind: 0\``;
    }
    const inlineBuildIdx = lines.findIndex(l => /^- \*\*Build\*\*:/.test(l) || /^Build: #\d+/.test(l));
    if (inlineBuildIdx !== -1 && inlineBuildIdx !== buildLineIdx) {
      lines[inlineBuildIdx] = lines[inlineBuildIdx].replace(
        /#\d+[^`\n]*`buildsBehind[^`]*`/,
        `${data.build} — Session ${data.sessionNumber} deployed, \`buildsBehind: 0\``,
      );
    }
  }

  // 3. Recent Session Updates block
  const recentHeaderIdx = lines.findIndex(l => l.includes('Recent Session Updates'));
  if (recentHeaderIdx !== -1) {
    lines[recentHeaderIdx] = lines[recentHeaderIdx].replace(
      /\(Sessions (\d+)–(\d+)\)/,
      (_, lower) => `(Sessions ${lower}–${data.sessionNumber})`,
    );

    const blockOpenIdx = lines.findIndex((l, i) => i > recentHeaderIdx && l === '```');
    if (blockOpenIdx !== -1) {
      const testsStr = data.tests ? ` ${data.tests}.` : '';
      const buildStr = data.deployed && data.build ? ` Build ${data.build}.` : '';
      const newLine = `✅ Session ${data.sessionNumber} (${formatDateShort(data.date)}): ${oneLiner(data.summary)}.${testsStr}${buildStr}`;
      lines.splice(blockOpenIdx + 1, 0, newLine);

      const blockCloseIdx = lines.findIndex((l, i) => i > blockOpenIdx + 1 && l === '```');
      if (blockCloseIdx !== -1) {
        const sessionLines = lines
          .slice(blockOpenIdx + 1, blockCloseIdx)
          .map((l, i) => ({ l, idx: blockOpenIdx + 1 + i }))
          .filter(({ l }) => l.startsWith('✅') || l.startsWith('🔄'));

        if (sessionLines.length > 25) {
          lines.splice(sessionLines[sessionLines.length - 1].idx, 1);
        }
      }
    }
  }

  if (dryRun) {
    console.log(
      `  STATUS.md              (Last Updated updated, session line prepended${data.deployed ? ', build # updated' : ''})`,
    );
  } else {
    await fs.writeFile(filePath, lines.join('\n'), 'utf8');
    console.log('  ✓ STATUS.md');
  }
}

// ─────────────────────────────────────────────────────────────────
// Persona mutation helpers
// ─────────────────────────────────────────────────────────────────

interface MutationResult {
  matched: boolean;
  description: string;
}

function applyResolveWatchpoint(
  lines: string[],
  wpId: string,
  sessionNumber: number,
  date: string,
): { lines: string[]; result: MutationResult } {
  const wpIdx = lines.findIndex(l => l.startsWith('### ') && l.includes(wpId));
  if (wpIdx === -1) {
    return { lines, result: { matched: false, description: `✗ watchpoint ${wpId} not found` } };
  }

  for (let i = wpIdx + 1; i < Math.min(wpIdx + 10, lines.length); i++) {
    if (lines[i].startsWith('**Status**:')) {
      if (lines[i].includes('✅') || lines[i].toLowerCase().includes('resolved')) {
        return {
          lines,
          result: { matched: true, description: `→ ${wpId} already resolved (skipped)` },
        };
      }
      const original = lines[i];
      lines[i] = `**Status**: ✅ RESOLVED (Session ${sessionNumber} — ${date})`;
      return {
        lines,
        result: {
          matched: true,
          description: `→ resolved ${wpId}\n     was: ${original.trim()}`,
        },
      };
    }
  }

  return {
    lines,
    result: { matched: false, description: `✗ **Status** line not found under ${wpId}` },
  };
}

function applyCloseBacklog(
  lines: string[],
  keyword: string,
  sessionNumber: number,
): { lines: string[]; result: MutationResult } {
  const backlogIdx = lines.findIndex(l => l.startsWith('## Prioritized Backlog'));
  if (backlogIdx === -1) {
    return { lines, result: { matched: false, description: '✗ no Prioritized Backlog section found' } };
  }
  const nextSectionIdx = lines.findIndex((l, i) => i > backlogIdx + 1 && l.startsWith('## '));
  const searchEnd = nextSectionIdx === -1 ? lines.length : nextSectionIdx;

  const normalizeForSearch = (s: string) => s.replace(/`/g, '').toLowerCase();
  const normalizedKeyword = normalizeForSearch(keyword);

  const rowIdx = lines.findIndex((l, i) => {
    if (i <= backlogIdx || i >= searchEnd) return false;
    if (!l.startsWith('|')) return false;
    if (/^\|\s*[-:]+\s*\|/.test(l)) return false; // separator row
    if (/Priority|Item/.test(l) && /Effort|Status/.test(l)) return false; // header row
    return normalizeForSearch(l).includes(normalizedKeyword);
  });

  if (rowIdx === -1) {
    return {
      lines,
      result: { matched: false, description: `✗ backlog row matching "${keyword}" not found` },
    };
  }

  const original = lines[rowIdx];

  if (original.includes('~~') && original.includes('✅')) {
    return {
      lines,
      result: { matched: true, description: `→ backlog "${keyword}" already closed (skipped)` },
    };
  }

  const cells = original.split('|');
  if (cells.length < 4) {
    return {
      lines,
      result: { matched: false, description: `✗ backlog row "${keyword}" has unexpected format` },
    };
  }

  const priority = cells[1].trim();
  const item = cells[2].trim();

  cells[1] = ` ~~${priority}~~ `;
  cells[2] = ` ~~${item}~~ `;
  cells[3] = ` ✅ **DONE (Session ${sessionNumber})** `;
  lines[rowIdx] = cells.slice(0, 4).join('|') + '|';

  return {
    lines,
    result: {
      matched: true,
      description: `→ closed backlog "${keyword}"\n     was: ${original.trim()}`,
    },
  };
}

function applyUpdateEngagement(
  lines: string[],
  keyword: string,
  newValue: string,
): { lines: string[]; result: MutationResult } {
  const engagementIdx = lines.findIndex(l => l.startsWith('## Current Engagement'));
  if (engagementIdx === -1) {
    return { lines, result: { matched: false, description: '✗ no Current Engagement section found' } };
  }
  const nextSectionIdx = lines.findIndex((l, i) => i > engagementIdx + 1 && l.startsWith('## '));
  const searchEnd = nextSectionIdx === -1 ? lines.length : nextSectionIdx;

  const normalizeForSearch = (s: string) => s.replace(/`/g, '').toLowerCase();
  const normalizedKeyword = normalizeForSearch(keyword);

  const rowIdx = lines.findIndex((l, i) => {
    if (i <= engagementIdx || i >= searchEnd) return false;
    if (!l.startsWith('|')) return false;
    if (/^\|\s*[-:]+\s*\|/.test(l)) return false; // separator
    if (/Area|Module/.test(l) && /Status/.test(l)) return false; // header
    return normalizeForSearch(l).includes(normalizedKeyword);
  });

  if (rowIdx === -1) {
    return {
      lines,
      result: { matched: false, description: `✗ engagement row matching "${keyword}" not found` },
    };
  }

  const original = lines[rowIdx];
  const cells = original.split('|');

  if (cells.length < 3) {
    return {
      lines,
      result: { matched: false, description: `✗ engagement row "${keyword}" has unexpected format` },
    };
  }

  cells[2] = ` ${newValue} `;
  lines[rowIdx] = cells.join('|');

  return {
    lines,
    result: {
      matched: true,
      description: `→ updated engagement "${keyword}"\n     was: ${original.trim()}`,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// Transform 5: persona file(s)
// ─────────────────────────────────────────────────────────────────

async function updatePersonaFile(
  slug: string,
  data: SessionData,
  dryRun: boolean,
  noPrompt: boolean,
  mutations: PersonaMutation[],
): Promise<void> {
  const filePath = path.join(PERSONAS_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    let lines = content.split('\n');

    const lastUpdatedIdx = lines.findIndex(l => l.startsWith('**Last Updated**:'));
    if (lastUpdatedIdx !== -1) {
      lines[lastUpdatedIdx] = `**Last Updated**: ${data.date} (Session ${data.sessionNumber})`;
    }

    const mutationLog: string[] = [];
    for (const mutation of mutations) {
      let result: MutationResult;

      switch (mutation.type) {
        case 'resolve-watchpoint': {
          const out = applyResolveWatchpoint(lines, mutation.key, data.sessionNumber, data.date);
          lines = out.lines;
          result = out.result;
          break;
        }
        case 'close-backlog': {
          const out = applyCloseBacklog(lines, mutation.key, data.sessionNumber);
          lines = out.lines;
          result = out.result;
          break;
        }
        case 'update-engagement': {
          const out = applyUpdateEngagement(lines, mutation.key, mutation.value ?? '');
          lines = out.lines;
          result = out.result;
          break;
        }
      }

      mutationLog.push(`    ${result!.description}`);
    }

    if (!dryRun && !noPrompt && mutations.length === 0) {
      const engagementIdx = lines.findIndex(l => l.startsWith('## Current Engagement'));
      if (engagementIdx !== -1) {
        console.log(`\n--- ${slug}.md: Current Engagement ---`);
        lines.slice(engagementIdx, engagementIdx + 20).forEach(l => console.log(l));
        console.log('---');

        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const answer = await new Promise<string>(resolve => {
          rl.question(`Open ${slug}.md in $EDITOR for free-form edits? (y/n) [n]: `, resolve);
        });
        rl.close();

        if (answer.toLowerCase() === 'y') {
          const editor = process.env.EDITOR ?? 'nano';
          execSync(`${editor} "${filePath}"`, { stdio: 'inherit' });
          const updated = await fs.readFile(filePath, 'utf8');
          lines = updated.split('\n');
          const idx = lines.findIndex(l => l.startsWith('**Last Updated**:'));
          if (idx !== -1) {
            lines[idx] = `**Last Updated**: ${data.date} (Session ${data.sessionNumber})`;
          }
        }
      }
    }

    if (dryRun) {
      const mutSummary = mutations.length > 0 ? ` + ${mutations.length} mutation(s)` : '';
      console.log(`  team-personas/${slug}.md  (Last Updated → Session ${data.sessionNumber}${mutSummary})`);
      mutationLog.forEach(l => console.log(l));
    } else {
      await fs.writeFile(filePath, lines.join('\n'), 'utf8');
      const mutSummary = mutations.length > 0 ? ` (${mutations.length} mutations applied)` : '';
      console.log(`  ✓ ${slug}.md${mutSummary}`);
      mutationLog.forEach(l => console.log(l));
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`  ✗ Could not update ${slug}.md: ${msg}\n`);
  }
}

// ─────────────────────────────────────────────────────────────────
// MEMORY.md pointer insertion helpers
// ─────────────────────────────────────────────────────────────────

function insertGroup1Pointer(lines: string[], pointer: string): string[] {
  const firstHeaderIdx = lines.findIndex(l => l.startsWith('## '));
  const searchEnd = firstHeaderIdx === -1 ? lines.length : firstHeaderIdx;

  let lastGroup1Idx = -1;
  for (let i = 0; i < searchEnd; i++) {
    if (lines[i].startsWith('- [') && !lines[i].includes('project_session_')) {
      lastGroup1Idx = i;
    }
  }

  if (lastGroup1Idx === -1) {
    const insertAt = firstHeaderIdx === -1 ? lines.length : firstHeaderIdx;
    const result = [...lines];
    result.splice(insertAt, 0, pointer);
    return result;
  }

  const result = [...lines];
  result.splice(lastGroup1Idx + 1, 0, pointer);
  return result;
}

function insertGroup2Pointer(lines: string[], pointer: string): string[] {
  const firstHeaderIdx = lines.findIndex(l => l.startsWith('## '));
  const searchEnd = firstHeaderIdx === -1 ? lines.length : firstHeaderIdx;

  const sessionPtrIndices: number[] = [];
  for (let i = 0; i < searchEnd; i++) {
    if (lines[i].startsWith('- [') && lines[i].includes('project_session_')) {
      sessionPtrIndices.push(i);
    }
  }

  let result = [...lines];

  if (sessionPtrIndices.length === 0) {
    let lastPtrIdx = -1;
    for (let i = 0; i < searchEnd; i++) {
      if (lines[i].startsWith('- [')) lastPtrIdx = i;
    }
    const insertAt = lastPtrIdx === -1
      ? (firstHeaderIdx === -1 ? lines.length : firstHeaderIdx)
      : lastPtrIdx + 1;
    result.splice(insertAt, 0, pointer);
  } else {
    const lastIdx = sessionPtrIndices[sessionPtrIndices.length - 1];
    result.splice(lastIdx + 1, 0, pointer);

    // Prune to max 10 Group 2 entries — remove oldest (bottom of list)
    const pruneEnd = firstHeaderIdx === -1 ? result.length : result.findIndex(l => l.startsWith('## '));
    const freshSessionPtrs: number[] = [];
    for (let i = 0; i < pruneEnd; i++) {
      if (result[i].startsWith('- [') && result[i].includes('project_session_')) {
        freshSessionPtrs.push(i);
      }
    }
    if (freshSessionPtrs.length > 10) {
      result.splice(freshSessionPtrs[0], 1);
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────
// Transform 6: writeNewMemoryFiles  (--new-memory)
// ─────────────────────────────────────────────────────────────────

async function writeNewMemoryFiles(
  writes: MemoryWrite[],
  memoryDir: string,
  memoryIndexPath: string,
  dryRun: boolean,
): Promise<void> {
  if (writes.length === 0) return;

  const VALID_TYPES = new Set<string>(['feedback', 'project', 'reference']);

  for (const w of writes) {
    if (!VALID_TYPES.has(w.type)) {
      process.stderr.write(`  ✗ --new-memory: invalid type "${w.type}" (must be feedback|project|reference)\n`);
      continue;
    }

    const filename = `${w.type}_${w.slug}.md`;
    const filePath = path.join(memoryDir, filename);

    // Collision guard
    try {
      await fs.access(filePath);
      process.stderr.write(`  ✗ --new-memory: ${filename} already exists (skipped — will not overwrite)\n`);
      continue;
    } catch {
      // File does not exist — safe to create
    }

    const body = w.paragraphs.length > 0 ? '\n\n' + w.paragraphs.join('\n\n') : '';
    const fileContent = [
      '---',
      `name: ${w.title}`,
      `description: ${w.title}`,
      `type: ${w.type}`,
      `originSessionId: ${randomUUID()}`,
      '---',
      body,
    ].join('\n');

    const pointer = `- [${w.title}](${filename}) — ${w.title}`;

    if (dryRun) {
      console.log(`  memory/${filename}  (new ${w.type} file — "${w.title}")`);
      console.log(`    would insert: ${pointer}`);
    } else {
      await fs.writeFile(filePath, fileContent, 'utf8');

      const indexContent = await fs.readFile(memoryIndexPath, 'utf8');
      const indexLines = insertGroup1Pointer(indexContent.split('\n'), pointer);
      await fs.writeFile(memoryIndexPath, indexLines.join('\n'), 'utf8');

      console.log(`  ✓ memory/${filename} (new ${w.type})`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Transform 7: updateExistingMemoryFiles  (--update-memory)
// ─────────────────────────────────────────────────────────────────

async function updateExistingMemoryFiles(
  updates: MemoryUpdate[],
  memoryDir: string,
  sessionNumber: number,
  date: string,
  dryRun: boolean,
): Promise<void> {
  if (updates.length === 0) return;

  for (const u of updates) {
    const allFiles = (await fs.readdir(memoryDir)).sort();
    const matches = allFiles.filter(
      f => f.includes(u.slugPattern) && f.endsWith('.md'),
    );

    if (matches.length === 0) {
      process.stderr.write(`  ✗ --update-memory: no file matching "*${u.slugPattern}*" found\n`);
      continue;
    }
    if (matches.length > 1) {
      process.stderr.write(
        `  ✗ --update-memory: "${u.slugPattern}" is ambiguous — matched:\n` +
        matches.map(f => `      ${f}`).join('\n') + '\n' +
        '    Use a more specific slug pattern.\n',
      );
      continue;
    }

    const filePath = path.join(memoryDir, matches[0]);
    const content = await fs.readFile(filePath, 'utf8');

    if (!content.includes(u.oldText)) {
      process.stderr.write(`  ✗ --update-memory: text not found in ${matches[0]}\n`);
      continue;
    }

    let updated = content.replace(u.oldText, u.newText);
    updated = updated.replace(
      /^\*\*Last Updated\*\*:.*$/m,
      `**Last Updated**: ${date} (Session ${sessionNumber})`,
    );

    if (dryRun) {
      console.log(`  memory/${matches[0]}  (update-memory)`);
      console.log(`    was: ${u.oldText}`);
      console.log(`    new: ${u.newText}`);
    } else {
      await fs.writeFile(filePath, updated, 'utf8');
      console.log(`  ✓ memory/${matches[0]} (updated)`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Transform 8: patchClaudeDocFiles  (--patch-claude-doc)
// ─────────────────────────────────────────────────────────────────

// Add project-specific frozen files to this set as needed.
const CLAUDE_DOC_BLOCKLIST = new Set(['oracle-output-standard.md']);

function isBlockedClaudeDoc(basename: string): boolean {
  if (CLAUDE_DOC_BLOCKLIST.has(basename)) return true;
  if (/^settings.*\.json$/.test(basename)) return true;
  if (basename.endsWith('.lock')) return true;
  return false;
}

async function patchClaudeDocFiles(
  patches: ClaudeDocPatch[],
  claudeDir: string,
  dryRun: boolean,
): Promise<void> {
  if (patches.length === 0) return;

  const claudeDirNormalized = claudeDir.endsWith(path.sep) ? claudeDir : claudeDir + path.sep;

  for (const p of patches) {
    const basename = path.basename(p.relativePath);

    if (isBlockedClaudeDoc(basename)) {
      process.stderr.write(`  ✗ --patch-claude-doc: "${p.relativePath}" is protected and cannot be patched\n`);
      continue;
    }

    const resolved = path.resolve(path.join(claudeDir, p.relativePath));
    if (!resolved.startsWith(claudeDirNormalized)) {
      process.stderr.write(`  ✗ --patch-claude-doc: "${p.relativePath}" resolves outside .claude/ — rejected\n`);
      continue;
    }

    let content: string;
    try {
      content = await fs.readFile(resolved, 'utf8');
    } catch {
      process.stderr.write(`  ✗ --patch-claude-doc: file not found: ${p.relativePath}\n`);
      continue;
    }

    if (!content.includes(p.oldText)) {
      process.stderr.write(`  ✗ --patch-claude-doc: text not found in ${p.relativePath}\n`);
      continue;
    }

    const updated = content.replace(p.oldText, p.newText);

    if (dryRun) {
      console.log(`  .claude/${p.relativePath}  (patch-claude-doc)`);
      console.log(`    was: ${p.oldText.split('\n')[0]}${p.oldText.includes('\n') ? ' …' : ''}`);
      console.log(`    new: ${p.newText.split('\n')[0]}${p.newText.includes('\n') ? ' …' : ''}`);
    } else {
      await fs.writeFile(resolved, updated, 'utf8');
      console.log(`  ✓ .claude/${p.relativePath} (patched)`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Transform 9: writeSessionProjectFile
// ─────────────────────────────────────────────────────────────────

async function writeSessionProjectFile(
  data: SessionData,
  memoryDir: string,
  memoryIndexPath: string,
): Promise<void> {
  const filename = `project_session_${data.sessionNumber}.md`;
  const filePath = path.join(memoryDir, filename);

  // Idempotency: skip if already exists
  try {
    await fs.access(filePath);
    console.log(`  ✓ memory/${filename} (already exists, skipped)`);
    return;
  } catch {
    // Does not exist — proceed
  }

  const summaryBullets = data.summary
    .split('|')
    .map(s => `- ${s.trim()}`)
    .join('\n');

  const personasTouched = data.personaFiles.length > 0
    ? data.personaFiles.join(', ')
    : '(none)';

  const memoriesCreated = data.memoryWrites.length > 0
    ? data.memoryWrites.map(w => `- ${w.type}_${w.slug}.md — ${w.title}`).join('\n')
    : '(none)';

  const claudeDocsPatchedList = data.claudeDocPatches.length > 0
    ? data.claudeDocPatches.map(p => `- ${p.relativePath}`).join('\n')
    : '(none)';

  const oracleStr = data.oracleScore !== undefined
    ? String(data.oracleScore)
    : '(no run this session)';

  const fileContent = [
    '---',
    `name: Session ${data.sessionNumber} — ${data.title}`,
    `description: ${data.summary.split('|')[0].trim()}`,
    'type: project',
    `originSessionId: ${randomUUID()}`,
    '---',
    '',
    `**Date**: ${data.date}`,
    `**Build**: ${data.build ?? '(no deploy)'}`,
    `**Deployed**: ${data.deployed}`,
    `**ORACLE Score**: ${oracleStr}`,
    '',
    '## What Was Done',
    '',
    summaryBullets,
    '',
    '## Personas Touched',
    '',
    personasTouched,
    '',
    '## Memory Files Created This Session',
    '',
    memoriesCreated,
    '',
    '## .claude Docs Patched This Session',
    '',
    claudeDocsPatchedList,
  ].join('\n');

  await fs.writeFile(filePath, fileContent, 'utf8');

  const indexContent = await fs.readFile(memoryIndexPath, 'utf8');
  const pointer = `- [Session ${data.sessionNumber} — ${data.title}](${filename}) — ${data.summary.split('|')[0].trim()}`;
  const indexLines = insertGroup2Pointer(indexContent.split('\n'), pointer);
  await fs.writeFile(memoryIndexPath, indexLines.join('\n'), 'utf8');

  console.log(`  ✓ memory/${filename} (auto-created)`);
}

// ─────────────────────────────────────────────────────────────────
// Interactive mode
// ─────────────────────────────────────────────────────────────────

async function promptInteractive(
  gitDefaults: { fixes: string; title: string },
  autoSessionNumber?: number,
): Promise<SessionData> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (question: string, defaultVal?: string): Promise<string> =>
    new Promise(resolve => {
      const prompt = defaultVal ? `${question} [${defaultVal}]: ` : `${question}: `;
      rl.question(prompt, ans => resolve(ans.trim() || defaultVal || ''));
    });

  console.log('\n── CFAI: End-of-Session Documentation Update ──\n');
  console.log('Use | to separate multiple bullets in summary/fixes fields.');
  console.log('Tip: pass --summary/--tests/--build/--personas as flags to skip these prompts.\n');

  const autoLabel = autoSessionNumber !== undefined ? ' (auto-detected)' : '';
  const sessionNumber = parseInt(
    await ask(`Session number${autoLabel}`, autoSessionNumber !== undefined ? String(autoSessionNumber) : undefined),
  );
  const title = await ask('Title', gitDefaults.title);
  const summary = await ask('Summary (e.g. "Fix A|Add B|Refactor C")');
  const fixes = await ask('Fixes', gitDefaults.fixes || undefined);
  const tests = await ask('Tests (e.g. "47 GREEN")');
  const build = await ask('Build (e.g. "#1182 abc1234", blank = no deploy)');
  const oracleStr = await ask('ORACLE score (blank = unchanged)');
  const deployedStr = await ask('Deployed? (y/n)', 'n');
  const dbRowsStr = await ask('DB rows backfilled (blank = none)');
  const personasStr = await ask('Affected personas (comma-separated slugs; blank = none)');

  rl.close();

  return {
    sessionNumber,
    date: new Date().toISOString().slice(0, 10),
    title,
    summary,
    fixes: fixes || '(see git log)',
    tests,
    build: build || undefined,
    oracleScore: oracleStr ? parseInt(oracleStr) : undefined,
    deployed: deployedStr.toLowerCase() === 'y',
    dbRows: dbRowsStr ? parseInt(dbRowsStr) : undefined,
    personaFiles: personasStr
      ? personasStr.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    mutations: [], // mutations are not collected in interactive mode — use flags
    memoryWrites: [],
    memoryUpdates: [],
    claudeDocPatches: [],
    dryRun: false,
    noPrompt: false,
  };
}

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────

const CONTENT_FLAGS = new Set([
  '--session', '--title', '--summary', '--fixes',
  '--tests', '--build', '--emoji', '--oracle-score', '--deployed',
  '--db-rows', '--personas',
]);

async function main(): Promise<void> {
  const gitDefaults = resolveGitDefaults();
  const partial = parseArgs();
  const rawArgs = process.argv.slice(2);
  const isInteractive = rawArgs.includes('--interactive');
  const hasContentFlags = rawArgs.some(a => CONTENT_FLAGS.has(a));
  const autoSession = await resolveNextSessionNumber();

  let data: SessionData;

  if (isInteractive) {
    data = await promptInteractive(gitDefaults, autoSession);
  } else if (hasContentFlags) {
    data = {
      sessionNumber: partial.sessionNumber ?? autoSession ?? 0,
      date: new Date().toISOString().slice(0, 10),
      title: partial.title ?? gitDefaults.title ?? '(no title)',
      summary: partial.summary ?? '(no summary)',
      fixes: partial.fixes ?? gitDefaults.fixes ?? '(see git log)',
      tests: partial.tests ?? '(no tests)',
      build: partial.build,
      emoji: partial.emoji,
      oracleScore: partial.oracleScore,
      deployed: partial.deployed ?? false,
      dbRows: partial.dbRows,
      personaFiles: partial.personaFiles ?? [],
      mutations: partial.mutations ?? [],
      memoryWrites: partial.memoryWrites ?? [],
      memoryUpdates: partial.memoryUpdates ?? [],
      claudeDocPatches: partial.claudeDocPatches ?? [],
      dryRun: partial.dryRun ?? false,
      noPrompt: partial.noPrompt ?? false,
    };
  } else {
    // Auto mode: derive everything from git history
    if (!autoSession) {
      process.stderr.write(
        'ERROR: session number could not be auto-detected (session-history.md unreadable?).\n' +
        'Pass --session N or run with --interactive.\n',
      );
      process.exit(1);
    }
    data = await buildAutoSessionData(autoSession, partial.mutations ?? [], partial.dryRun ?? false);
    data.memoryWrites = partial.memoryWrites ?? [];
    data.memoryUpdates = partial.memoryUpdates ?? [];
    data.claudeDocPatches = partial.claudeDocPatches ?? [];
    console.log(`Auto-detected session ${data.sessionNumber} — deriving summary from git history.`);
  }

  if (!data.sessionNumber) {
    process.stderr.write(
      'ERROR: session number could not be resolved. Pass --session N or run with --interactive.\n',
    );
    process.exit(1);
  }

  const mutationSlugs = [...new Set(data.mutations.map(m => m.slug))];
  const allPersonaSlugs = [...new Set([...data.personaFiles, ...mutationSlugs])];

  const dryLabel = data.dryRun ? '[DRY RUN] ' : '';
  console.log(`\n${dryLabel}Session ${data.sessionNumber} — ${data.title}`);
  console.log(
    `Date: ${data.date} | Deployed: ${data.deployed}${data.build ? ` (${data.build})` : ''} | Personas: ${allPersonaSlugs.join(', ') || 'none'}`,
  );
  if (data.mutations.length > 0) {
    console.log(`Mutations: ${data.mutations.map(m => `${m.type}(${m.slug}:${m.key})`).join(', ')}`);
  }
  if (data.memoryWrites.length > 0) {
    console.log(`New memory files: ${data.memoryWrites.map(w => `${w.type}_${w.slug}`).join(', ')}`);
  }
  if (data.memoryUpdates.length > 0) {
    console.log(`Memory updates: ${data.memoryUpdates.map(u => u.slugPattern).join(', ')}`);
  }
  if (data.claudeDocPatches.length > 0) {
    console.log(`Claude doc patches: ${data.claudeDocPatches.map(p => p.relativePath).join(', ')}`);
  }

  if (data.dryRun) {
    console.log('\nWould update:');
  } else {
    if (hasContentFlags && !data.noPrompt) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise<string>(resolve => {
        rl.question('\nApply changes to all documentation files? (Y/n): ', resolve);
      });
      rl.close();
      if (answer.toLowerCase() === 'n') {
        console.log('Aborted. Run with --dry-run to preview changes.');
        process.exit(0);
      }
    }
    console.log('\nUpdating:');
  }

  await updateSessionHistory(data, SESSION_HISTORY_PATH, data.dryRun);
  await updateMemory(data, MEMORY_PATH, data.dryRun);
  await updateChangelog(data, CHANGELOG_PATH, data.dryRun);
  await updateStatus(data, STATUS_PATH, data.dryRun);

  for (const slug of allPersonaSlugs) {
    const slugMutations = data.mutations.filter(m => m.slug === slug);
    await updatePersonaFile(slug, data, data.dryRun, data.noPrompt, slugMutations);
  }

  await writeNewMemoryFiles(data.memoryWrites, MEMORY_DIR, MEMORY_PATH, data.dryRun);
  await updateExistingMemoryFiles(data.memoryUpdates, MEMORY_DIR, data.sessionNumber, data.date, data.dryRun);
  await patchClaudeDocFiles(data.claudeDocPatches, CLAUDE_DIR, data.dryRun);

  if (!data.dryRun) {
    await writeSessionProjectFile(data, MEMORY_DIR, MEMORY_PATH);
  }

  if (data.dryRun) {
    console.log('\nRun without --dry-run to apply. You will be asked to confirm.');
  } else {
    console.log('\n✅ Documentation updated.');
    console.log('Next steps:');
    console.log('  1. git diff — review all changes');
    console.log(`  2. git add docs/ memory/ && git commit -m "docs: sync project context to Session ${data.sessionNumber}"`);
  }
}

main().catch(err => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`session-doc-update failed: ${msg}\n`);
  process.exit(1);
});
