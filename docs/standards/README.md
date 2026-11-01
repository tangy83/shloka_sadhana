# CFAI Standards (adopted locally — not published)

This folder holds **Context First AI internal standards** adapted for this
project by the CFAI adoption toolkit. It is intentionally **git-ignored**: the
reckoners are internal IP and must not be published or shared outside CFAI.

Everything produced *using* these standards — plans, specs, deliverables — lives
elsewhere in the repo and is committed normally. Only this folder is withheld.

## Reconstitute the standards

`cfai-manifest.json` (committed at the repo root) lists exactly which modules
were adopted. Anyone with access to the gold-standards repo can regenerate this
folder:

```bash
python3 adopt.py --project . --repo <gold-standards-repo-url>
```

A pre-commit guard (`.githooks/cfai-standards-guard.sh`) blocks these files from
being staged. After cloning, activate it with:

```bash
git config core.hooksPath .githooks
```

See the CFAI `standards-ip-hygiene-reckoner` for the full policy.
