#!/usr/bin/env python3
"""
Idea to Backlog - Main entry point

Systematically refine feature ideas through persona perspectives using TDD methodology.
"""

import sys
from pathlib import Path

# Add scripts directory to Python path
scripts_dir = Path(__file__).parent / "scripts"
sys.path.insert(0, str(scripts_dir))

from idea_to_backlog.cli import app

if __name__ == "__main__":
    app()
