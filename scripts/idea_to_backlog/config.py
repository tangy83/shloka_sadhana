"""Configuration management for idea_to_backlog."""

import os
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field, validator


class Config(BaseModel):
    """Configuration for idea_to_backlog script."""

    # Directories
    project_root: Path = Field(default_factory=lambda: Path.cwd())
    persona_dir: Path = Field(default_factory=lambda: Path("personas"))
    docs_dir: Path = Field(default_factory=lambda: Path("docs"))
    idea_analysis_dir: Path = Field(default_factory=lambda: Path("docs/idea_analysis"))
    tdd_spec_dir: Path = Field(default_factory=lambda: Path("docs/tdd_specs"))
    session_dir: Path = Field(default_factory=lambda: Path(".sessions"))

    # Files
    backlog_file: Path = Field(default_factory=lambda: Path("docs/BACKLOG.md"))

    # Settings
    num_passes: int = Field(default=5, ge=1, le=10)

    @validator('persona_dir', 'docs_dir', 'idea_analysis_dir', 'tdd_spec_dir', 'session_dir', pre=True)
    def resolve_paths(cls, v, values):
        """Resolve paths relative to project root."""
        if not isinstance(v, Path):
            v = Path(v)

        # Make absolute if not already
        if not v.is_absolute() and 'project_root' in values:
            v = values['project_root'] / v

        return v

    @validator('backlog_file', pre=True)
    def resolve_file_path(cls, v, values):
        """Resolve file path relative to project root."""
        if not isinstance(v, Path):
            v = Path(v)

        if not v.is_absolute() and 'project_root' in values:
            v = values['project_root'] / v

        return v

    def ensure_directories(self):
        """Create necessary directories if they don't exist."""
        self.idea_analysis_dir.mkdir(parents=True, exist_ok=True)
        self.tdd_spec_dir.mkdir(parents=True, exist_ok=True)
        self.session_dir.mkdir(parents=True, exist_ok=True)

    @classmethod
    def from_env(cls, project_root: Optional[Path] = None) -> 'Config':
        """Create config from environment variables."""
        if project_root is None:
            project_root = Path.cwd()

        return cls(
            project_root=project_root,
            persona_dir=Path(os.getenv('PERSONA_DIR', 'personas')),
            docs_dir=Path(os.getenv('DOCS_DIR', 'docs')),
            idea_analysis_dir=Path(os.getenv('IDEA_ANALYSIS_DIR', 'docs/idea_analysis')),
            tdd_spec_dir=Path(os.getenv('TDD_SPEC_DIR', 'docs/tdd_specs')),
            session_dir=Path(os.getenv('SESSION_DIR', '.sessions')),
            backlog_file=Path(os.getenv('BACKLOG_FILE', 'docs/BACKLOG.md')),
            num_passes=int(os.getenv('NUM_PASSES', '5'))
        )


def get_config(project_root: Optional[Path] = None) -> Config:
    """Get configuration instance."""
    return Config.from_env(project_root)
