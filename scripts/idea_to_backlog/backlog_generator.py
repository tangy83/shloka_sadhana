"""Generate backlog entries from session data."""

import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from jinja2 import Environment, FileSystemLoader

from .session_manager import SessionManager


class IdeaAnalysis:
    """Analyzed idea with extracted information."""

    def __init__(self, session: SessionManager):
        """Analyze session to extract structured information."""
        self.session = session
        self.feature_name = self._extract_feature_name()
        self.priority = self._extract_priority()
        self.effort = self._extract_effort()
        self.epic = self._extract_epic()
        self.implementation_steps = self._extract_implementation_steps()
        self.acceptance_criteria = self._extract_acceptance_criteria()
        self.technical_notes = self._extract_technical_notes()
        self.persona_insights = self._extract_persona_insights()
        self.files_to_modify = self._extract_files()
        self.dependencies = self._extract_dependencies()

    def _extract_feature_name(self) -> str:
        """Extract feature name from idea or Product Manager answers."""
        idea = self.session.idea

        # Try to get a concise feature name
        # Look for Product Manager's scoping answers
        for pass_num, pass_data in self.session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'product' in persona.lower() or 'manager' in persona.lower():
                    for q, a in qa_pairs:
                        if 'problem' in q.lower() or 'what' in q.lower():
                            # Use first sentence of answer as feature hint
                            first_sentence = a.split('.')[0].strip()
                            if len(first_sentence) > 10 and len(first_sentence) < 100:
                                return self._titleize(first_sentence[:80])

        # Fallback: use first 50 chars of idea
        return self._titleize(idea[:50])

    def _titleize(self, text: str) -> str:
        """Convert text to title case feature name."""
        # Remove extra whitespace
        text = ' '.join(text.split())
        # Capitalize first letter of each word
        words = text.split()
        return ' '.join(word.capitalize() for word in words)

    def _extract_priority(self) -> str:
        """Extract priority from Product Manager answers."""
        for pass_num, pass_data in self.session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'product' in persona.lower() or 'manager' in persona.lower():
                    for q, a in qa_pairs:
                        if 'priority' in q.lower():
                            # Look for P0, P1, P2, P3
                            match = re.search(r'\b(P[0-3])\b', a, re.IGNORECASE)
                            if match:
                                return match.group(1).upper()

        return "P2"  # Default to medium priority

    def _extract_effort(self) -> str:
        """Extract effort estimate."""
        # Look for effort mentions in answers
        all_text = ' '.join([
            a for _, _, _, a in self.session.get_all_answers()
        ])

        # Look for patterns like "2-3 days", "1 week", etc.
        match = re.search(r'(\d+[-–]\d+)\s*(day|week)', all_text, re.IGNORECASE)
        if match:
            return f"{match.group(1)} {match.group(2)}s"

        # Default based on priority
        priority = self._extract_priority()
        defaults = {"P0": "5-7 days", "P1": "3-5 days", "P2": "2-3 days", "P3": "1-2 days"}
        return defaults.get(priority, "2-3 days")

    def _extract_epic(self) -> str:
        """Determine epic category from personas consulted and answers."""
        personas = self.session.get_personas_consulted()

        # Map persona types to epic categories
        if any('gamification' in p.lower() or 'engagement' in p.lower() for p in personas):
            return "Engagement & Gamification"
        elif any('content' in p.lower() for p in personas):
            return "Content & Discovery"
        elif any('calendar' in p.lower() or 'festival' in p.lower() or 'hindu' in p.lower() for p in personas):
            return "Cultural Features & Calendar"
        elif any('notification' in p.lower() or 'reminder' in p.lower() for p in personas):
            return "Engagement Systems"
        elif any('social' in p.lower() or 'community' in p.lower() for p in personas):
            return "Social & Community"
        elif any('accessibility' in p.lower() or 'onboarding' in p.lower() for p in personas):
            return "User Experience & Accessibility"
        elif any('performance' in p.lower() or 'technical' in p.lower() for p in personas):
            return "Performance & Technical"
        else:
            return "General Enhancement"

    def _extract_implementation_steps(self) -> List[str]:
        """Extract implementation steps from Frontend Engineer answers."""
        steps = []

        for pass_num, pass_data in self.session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'frontend' in persona.lower() or 'engineer' in persona.lower():
                    for q, a in qa_pairs:
                        if 'files' in q.lower() or 'modification' in q.lower():
                            # Parse answer for steps
                            steps.append(f"Modify/create files mentioned by Frontend Engineer: {a[:100]}")
                        elif 'component' in q.lower():
                            steps.append(f"Implement React Native components: {a[:100]}")
                        elif 'state' in q.lower() or 'storage' in q.lower():
                            steps.append(f"Implement state management: {a[:100]}")

        if not steps:
            steps = [
                "Write failing tests per TDD specification",
                "Implement minimal solution to pass tests",
                "Refactor for code quality",
                "Verify test coverage meets 75%+ requirement"
            ]

        return steps[:5]  # Limit to 5 steps

    def _extract_acceptance_criteria(self) -> List[str]:
        """Extract acceptance criteria from various persona answers."""
        criteria = []

        # From Product Manager
        for pass_num, pass_data in self.session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'product' in persona.lower():
                    for q, a in qa_pairs:
                        if 'mvp' in q.lower() or 'minimum' in q.lower():
                            criteria.append(f"{a[:150]}")

        # From UI/UX Designer
        for pass_num, pass_data in self.session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'ui' in persona.lower() or 'ux' in persona.lower():
                    for q, a in qa_pairs:
                        if 'interaction' in q.lower():
                            criteria.append(f"User can {a[:100]}")

        # From Accessibility
        for pass_num, pass_data in self.session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'accessibility' in persona.lower():
                    criteria.append("Feature is accessible to screen reader users")
                    break

        if not criteria:
            criteria = [
                "Feature works as described",
                "All tests pass",
                "No accessibility regressions",
                "Works on both iOS and Android"
            ]

        return criteria[:6]  # Limit to 6 criteria

    def _extract_technical_notes(self) -> List[str]:
        """Extract technical considerations from engineer personas."""
        notes = []

        for pass_num, pass_data in self.session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if any(keyword in persona.lower() for keyword in ['engineer', 'performance', 'technical']):
                    for q, a in qa_pairs:
                        notes.append(f"{persona}: {a[:120]}")

        return notes[:5]  # Limit to 5 notes

    def _extract_persona_insights(self) -> Dict[str, str]:
        """Extract key insight from each persona."""
        insights = {}

        for pass_num, pass_data in self.session.answers.items():
            for persona, qa_pairs in pass_data.items():
                # Take first substantial answer (>20 chars)
                for q, a in qa_pairs:
                    if len(a) > 20:
                        insights[persona] = a[:150]
                        break

        return insights

    def _extract_files(self) -> List[Dict[str, str]]:
        """Extract file paths to modify."""
        files = []

        # Look in Frontend Engineer answers
        for pass_num, pass_data in self.session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'frontend' in persona.lower() or 'engineer' in persona.lower():
                    for q, a in qa_pairs:
                        if 'file' in q.lower():
                            # Try to extract file paths from answer
                            paths = re.findall(r'[\w/]+\.tsx?', a)
                            for path in paths[:3]:
                                files.append({"path": path, "purpose": "Implementation"})

        # Add default test file
        feature_slug = self._slugify(self.feature_name)
        if files:
            test_path = files[0]["path"].replace('.tsx', '.test.tsx').replace('.ts', '.test.ts')
            files.append({"path": test_path, "purpose": "Test file"})
        else:
            files = [
                {"path": f"src/components/{feature_slug}/{feature_slug}.tsx", "purpose": "Main component"},
                {"path": f"src/components/{feature_slug}/__tests__/{feature_slug}.test.tsx", "purpose": "Test file"}
            ]

        return files

    def _slugify(self, text: str) -> str:
        """Convert text to slug (lowercase, hyphens)."""
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-')

    def _extract_dependencies(self) -> List[str]:
        """Extract dependencies mentioned in answers."""
        dependencies = []

        all_text = ' '.join([a for _, _, _, a in self.session.get_all_answers()])

        # Look for dependency keywords
        if 'existing' in all_text.lower() and 'feature' in all_text.lower():
            dependencies.append("May depend on existing features mentioned in answers")

        return dependencies if dependencies else []


class BacklogGenerator:
    """Generate backlog markdown entries."""

    def __init__(self, templates_dir: Optional[Path] = None):
        """Initialize generator with templates directory."""
        if templates_dir is None:
            templates_dir = Path(__file__).parent / "templates"

        self.env = Environment(loader=FileSystemLoader(str(templates_dir)))

    def generate_entry(self, session: SessionManager) -> str:
        """
        Generate backlog entry from session.

        Args:
            session: Completed session with all answers

        Returns:
            Markdown-formatted backlog entry
        """
        analysis = IdeaAnalysis(session)

        template = self.env.get_template('backlog_entry.md.j2')

        data = {
            "feature_name": analysis.feature_name,
            "priority": analysis.priority,
            "effort": analysis.effort,
            "epic": analysis.epic,
            "date": datetime.now().strftime('%Y-%m-%d'),
            "num_personas": len(session.get_personas_consulted()),
            "implementation_steps": analysis.implementation_steps,
            "acceptance_criteria": analysis.acceptance_criteria,
            "technical_notes": analysis.technical_notes,
            "persona_insights": analysis.persona_insights,
            "files_to_modify": analysis.files_to_modify,
            "dependencies": analysis.dependencies
        }

        return template.render(**data)

    def append_to_backlog(self, entry: str, backlog_file: Path):
        """
        Append entry to backlog file.

        Args:
            entry: Markdown entry to append
            backlog_file: Path to BACKLOG.md file
        """
        with open(backlog_file, 'a', encoding='utf-8') as f:
            f.write('\n\n')
            f.write(entry)
