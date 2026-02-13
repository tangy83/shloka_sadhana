"""Parse persona markdown files."""

import re
from pathlib import Path
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class Enhancement(BaseModel):
    """A single enhancement from a persona's backlog."""

    number: int
    name: str
    description: str
    priority: str  # P0, P1, P2
    effort: str    # S, M, L, XL


class Persona(BaseModel):
    """A persona with their enhancement backlog."""

    id: str  # e.g., "01-ui-ux-designer"
    name: str
    focus: str
    goal: str
    priority: Optional[str] = None
    impact: Optional[str] = None
    enhancements: List[Enhancement] = Field(default_factory=list)

    def get_enhancements_by_priority(self, priority: str) -> List[Enhancement]:
        """Get all enhancements matching a priority level."""
        return [e for e in self.enhancements if e.priority == priority]


class PersonaParser:
    """Parser for persona markdown files."""

    def __init__(self, persona_dir: Optional[Path] = None):
        """Initialize parser with persona directory."""
        if persona_dir is None:
            persona_dir = Path("personas")
        self.persona_dir = persona_dir

    def parse_file(self, filepath: Path) -> Persona:
        """Parse a single persona markdown file."""
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract persona ID from filename (e.g., "01-ui-ux-designer.md" -> "01-ui-ux-designer")
        persona_id = filepath.stem

        # Extract persona name from title line: # Persona X: Name emoji
        name_match = re.search(r'^#\s+Persona\s+\d+:\s+(.+?)(?:\s+[^\w\s]+)?$', content, re.MULTILINE)
        name = name_match.group(1).strip() if name_match else persona_id

        # Extract metadata
        focus = self._extract_metadata(content, 'Focus')
        goal = self._extract_metadata(content, 'Goal')
        priority = self._extract_metadata(content, 'Priority')
        impact = self._extract_metadata(content, 'Impact')

        # Parse enhancement tables
        enhancements = self._parse_enhancements(content)

        return Persona(
            id=persona_id,
            name=name,
            focus=focus or "",
            goal=goal or "",
            priority=priority,
            impact=impact,
            enhancements=enhancements
        )

    def _extract_metadata(self, content: str, label: str) -> Optional[str]:
        """Extract metadata field like **Focus**: value."""
        pattern = rf'\*\*{label}\*\*:\s*(.+?)(?:\s*\||$)'
        match = re.search(pattern, content)
        if match:
            return match.group(1).strip()
        return None

    def _parse_enhancements(self, content: str) -> List[Enhancement]:
        """Parse enhancement tables from markdown."""
        enhancements = []

        # Find all table rows (excluding headers and separators)
        # Pattern: | number | **Name** | Description | Priority | Effort |
        pattern = r'\|\s*(\d+)\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|\s*(P\d)\s*\|\s*([SMLX]+)\s*\|'

        for match in re.finditer(pattern, content):
            number = int(match.group(1))
            name = match.group(2).strip()
            description = match.group(3).strip()
            priority = match.group(4).strip()
            effort = match.group(5).strip()

            enhancements.append(Enhancement(
                number=number,
                name=name,
                description=description,
                priority=priority,
                effort=effort
            ))

        return enhancements

    def parse_all(self) -> List[Persona]:
        """Parse all persona files in the persona directory."""
        personas = []

        if not self.persona_dir.exists():
            raise FileNotFoundError(f"Persona directory not found: {self.persona_dir}")

        # Find all .md files
        md_files = sorted(self.persona_dir.glob("*.md"))

        # Filter out README
        md_files = [f for f in md_files if f.name.lower() != 'readme.md']

        for filepath in md_files:
            try:
                persona = self.parse_file(filepath)
                personas.append(persona)
            except Exception as e:
                print(f"Warning: Failed to parse {filepath.name}: {e}")
                continue

        return personas

    def get_persona_by_id(self, persona_id: str) -> Optional[Persona]:
        """Get a persona by its ID."""
        personas = self.parse_all()
        for persona in personas:
            if persona.id == persona_id:
                return persona
        return None
