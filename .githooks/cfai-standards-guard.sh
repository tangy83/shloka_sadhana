#!/usr/bin/env bash
# cfai-standards-guard.sh — block CFAI internal standards (docs/standards/)
# from being committed. Installed by CFAI adopt.py.
# See docs/standards/README.md and the standards-ip-hygiene reckoner.
set -euo pipefail

blocked=$(git diff --cached --name-only --diff-filter=ACM \
  | grep '^docs/standards/' \
  | grep -v '^docs/standards/README\.md$' || true)

if [ -n "$blocked" ]; then
  echo "" >&2
  echo "  ✖ CFAI: refusing to commit internal standards (docs/standards/):" >&2
  printf '%s\n' "$blocked" | sed 's/^/      /' >&2
  echo "" >&2
  echo "    These are Context First AI internal IP — not for publication." >&2
  echo "    Unstage them:  git restore --staged docs/standards/" >&2
  echo "    Override (only if you are certain):  git commit --no-verify" >&2
  echo "" >&2
  exit 1
fi
