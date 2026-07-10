"""
idea_to_backlog.py — Idea → Backlog workflow configuration.

Tag this file (@idea_to_backlog.py) with a rough note in a Claude Code session to
run the workflow:

    @idea_to_backlog.py let users pause their account temporarily

This file is a CONFIGURATION PAYLOAD, not a runnable script — it holds the
project-specific data the workflow reads (document paths, areas, ID prefixes,
application-layer inventory, stability-risk factors). The six-phase workflow the
model executes lives in the prose companion:

    Full workflow: idea-to-backlog-workflow.md   (in the same directory)

Companion to CFAI's idea-to-standard flow: there an insight becomes a *standard*;
here an idea becomes a *backlog item*. Distilled from the CFAI Gold Standards.

────────────────────────────────────────────────────────────────────────────────
FIRST-TIME SETUP: work through every `# CONFIGURE:` block below, in order. Until
you do, the placeholder values ([PROJECT], generic areas, empty file lists) will
not match your project. See idea-to-backlog-workflow.md → "Adopting in a new
project" for the step-by-step guide and the configuration checklist.
────────────────────────────────────────────────────────────────────────────────
"""

WORKFLOW_VERSION = "1.0.0"
WORKFLOW_DOC = "idea-to-backlog-workflow.md"  # prose companion (same directory)

# =============================================================================
# CONFIGURE: 1 — Document paths
# Point these at your project's actual files. Replace [PROJECT] with its name.
# =============================================================================
IDEAS_LOG_PATH = "docs/IDEAS_LOG.md"        # traceability — every idea logged here
BACKLOG_PATH = "docs/backlog/"              # new items go in CHILD group docs here
# NEVER write to docs/backlog/MASTER_BACKLOG.md — that parent index is regenerated
# wholesale by `docs_update.py --backlog`, so items written there are both invisible
# to the coverage roll-up and destroyed on the next run.
PRD_PATH = "docs/PRD.md"                    # requirements & user stories (optional)
PERSONA_DIRECTORY = "docs/team-personas/"   # persona docs to route findings into

# =============================================================================
# CONFIGURE: 2 — Areas & ID prefixes
# AREAS are the logical sections of your product (roadmap groupings, not teams).
# ID_PREFIXES maps each area to the short prefix used in item ids (e.g. CP-001).
# =============================================================================
AREAS = [
    "Core Platform",
    "Infrastructure",
    "Integrations",
    "Design",
    "Ops",
]

ID_PREFIXES = {
    "Core Platform": "CP",
    "Infrastructure": "INFRA",
    "Integrations": "INT",
    "Design": "DES",
    "Ops": "OPS",
}

# =============================================================================
# CONFIGURE: 3 — Roadmap phases
# =============================================================================
PHASES = ["Phase 1", "MVP", "Growth", "Ongoing"]

# =============================================================================
# CONFIGURE: 4 — Personas
# Route Phase-3 findings only to personas that exist in this project. Align with
# the CFAI expert-persona-framework and your PERSONA_DIRECTORY. Map layers →
# personas (mandatory/advisory) and domain keywords → personas.
# =============================================================================
PERSONA_LAYER_ROUTING = {
    # "database":   {"mandatory": ["backend"],   "advisory": ["data"]},
    # "api":        {"mandatory": ["backend"],   "advisory": ["security"]},
    # "components": {"mandatory": ["frontend"],  "advisory": ["designer", "accessibility"]},
    # "pages":      {"mandatory": ["frontend"],  "advisory": ["designer"]},
    # "config":     {"mandatory": ["devops"],    "advisory": ["security"]},
}

PERSONA_KEYWORD_HINTS = {
    # "auth":        "security",
    # "payment":     "compliance",
    # "accessibility":"accessibility",
}

# =============================================================================
# CONFIGURE: 5 — Application layers (most project-specific)
# Map each architectural layer to its real files. Phase 3 uses this to enumerate
# exactly which files a requirement will touch. Run, then group the output:
#   find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' | sort
# A mobile app might use `screens` instead of `pages`; a Python service `models`,
# `services`, `routers`. Add/remove layers to match your stack.
# =============================================================================
APP_LAYERS = {
    "database": [],     # migrations, schema definitions
    "lib": [],          # shared utilities, type defs, clients
    "api": [],          # route handlers, controllers
    "components": [],   # reusable UI components
    "pages": [],        # page/screen-level views
    "config": [],       # package.json, build/deploy config
}

# =============================================================================
# CONFIGURE: 6 — Stability risk factors
# Change types needing extra scrutiny on a running production app. For each,
# populate the relevant list with your actual files/tables/vars. Rename or add
# factors to fit your domain (e.g. CORE_BUSINESS_LOGIC_CHANGE for pricing logic).
# =============================================================================
STABILITY_RISK_FACTORS = {
    "BREAKING_DB_MIGRATION": {"affected_tables_to_audit": []},
    "AUTH_CHANGE": {"files_to_audit": []},
    "SHARED_COMPONENT_CHANGE": {"files_to_audit": []},
    "CORE_BUSINESS_LOGIC_CHANGE": {"calculation_locations": []},
    "ENV_VAR_DEPENDENCY": {"existing_env_vars": []},
}

# =============================================================================
# Classification reference (stable — usually no need to change)
# =============================================================================
CATEGORIES = ["Feature", "Tech", "Design", "Research", "Content", "Ops", "Business"]

PRIORITIES = {
    "P0": "Critical — blocks launch or core functionality",
    "P1": "High — important for good user experience",
    "P2": "Medium — nice to have, clear value",
    "P3": "Low — future consideration, low urgency",
}

SIZES = {
    "XS": "< 2 hours", "S": "2–4 hours", "M": "0.5–1 day",
    "L": "2–3 days", "XL": "1+ week",
}

RISK_LEVELS = {
    "Critical": {"deploy_gate": "Manual founder/CTO sign-off required"},
    "High": {"deploy_gate": "Test on local dev with real credentials"},
    "Medium": {"deploy_gate": "Smoke test on local dev"},
    "Low": {"deploy_gate": "Standard code review"},
}

IMPACT_LEVELS = {
    "Full Stack": "database + lib + api + components + pages",
    "Backend Only": "database + api",
    "Frontend Only": "components + pages",
    "Data Model": "database + lib + api",
    "Auth Flow": "api + lib + pages",
    "Config Only": "config",
}
