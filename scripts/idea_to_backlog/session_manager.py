"""Manage Q&A session state."""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from pydantic import BaseModel


class SessionManager(BaseModel):
    """Manages the state of a Q&A session."""

    idea: str = ""
    session_id: str = ""
    timestamp: str = ""
    answers: Dict[int, Dict[str, List[Tuple[str, str]]]] = {}

    class Config:
        """Pydantic config."""
        arbitrary_types_allowed = True

    def __init__(self, idea: str = "", **data):
        """Initialize session manager."""
        if 'session_id' not in data:
            data['session_id'] = self._generate_session_id()
        if 'timestamp' not in data:
            data['timestamp'] = datetime.now().isoformat()
        super().__init__(idea=idea, **data)

    @staticmethod
    def _generate_session_id() -> str:
        """Generate unique session ID."""
        return f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    def record_answer(
        self,
        pass_number: int,
        persona_name: str,
        question: str,
        answer: str
    ):
        """
        Record a Q&A pair.

        Args:
            pass_number: Which pass (1-5)
            persona_name: Name of the persona asking
            question: The question asked
            answer: User's answer
        """
        if pass_number not in self.answers:
            self.answers[pass_number] = {}

        if persona_name not in self.answers[pass_number]:
            self.answers[pass_number][persona_name] = []

        self.answers[pass_number][persona_name].append((question, answer))

    def get_context_for_pass(self, pass_number: int) -> str:
        """
        Generate context summary for a given pass.

        This provides personas with insights from previous passes.

        Args:
            pass_number: The current pass number

        Returns:
            Markdown-formatted context from all previous passes
        """
        context = f"# Original Idea\n{self.idea}\n\n"

        if pass_number == 1:
            return context  # No previous context for first pass

        context += "# Previous Insights\n\n"

        for pnum in range(1, pass_number):
            if pnum not in self.answers:
                continue

            context += f"## Pass {pnum} Insights\n\n"

            for persona, qa_pairs in self.answers[pnum].items():
                context += f"### {persona}\n"
                for q, a in qa_pairs:
                    context += f"- **Q:** {q}\n"
                    context += f"  **A:** {a}\n"
                context += "\n"

        return context

    def get_all_answers(self) -> List[Tuple[int, str, str, str]]:
        """
        Get all Q&A pairs as a flat list.

        Returns:
            List of (pass_number, persona_name, question, answer) tuples
        """
        all_answers = []
        for pass_num, pass_data in sorted(self.answers.items()):
            for persona, qa_pairs in pass_data.items():
                for question, answer in qa_pairs:
                    all_answers.append((pass_num, persona, question, answer))
        return all_answers

    def get_personas_consulted(self) -> List[str]:
        """Get list of all personas that have been consulted."""
        personas = set()
        for pass_data in self.answers.values():
            personas.update(pass_data.keys())
        return sorted(personas)

    def save(self, output_dir: Path) -> Path:
        """
        Save session state to JSON.

        Args:
            output_dir: Directory to save session file

        Returns:
            Path to saved session file
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        filepath = output_dir / f"{self.session_id}.json"

        data = {
            "session_id": self.session_id,
            "idea": self.idea,
            "timestamp": self.timestamp,
            "answers": {
                str(k): {
                    persona: [(q, a) for q, a in qa_list]
                    for persona, qa_list in v.items()
                }
                for k, v in self.answers.items()
            }
        }

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        return filepath

    @classmethod
    def load(cls, filepath: Path) -> 'SessionManager':
        """
        Load session from JSON file.

        Args:
            filepath: Path to session JSON file

        Returns:
            SessionManager instance
        """
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Convert string keys back to integers for pass numbers
        answers = {
            int(k): {
                persona: [(q, a) for q, a in qa_list]
                for persona, qa_list in v.items()
            }
            for k, v in data.get('answers', {}).items()
        }

        return cls(
            idea=data['idea'],
            session_id=data['session_id'],
            timestamp=data['timestamp'],
            answers=answers
        )

    def get_summary(self) -> str:
        """Get a brief summary of the session."""
        total_questions = sum(
            len(qa_list)
            for pass_data in self.answers.values()
            for qa_list in pass_data.values()
        )

        return (
            f"Session: {self.session_id}\n"
            f"Idea: {self.idea[:60]}{'...' if len(self.idea) > 60 else ''}\n"
            f"Passes completed: {len(self.answers)}\n"
            f"Personas consulted: {len(self.get_personas_consulted())}\n"
            f"Total Q&A pairs: {total_questions}"
        )
