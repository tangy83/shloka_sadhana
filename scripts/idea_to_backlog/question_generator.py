"""Generate questions from templates based on persona and context."""

import yaml
from pathlib import Path
from typing import List, Dict, Any, Optional
from .persona_parser import Persona


class QuestionGenerator:
    """Generate questions from YAML templates."""

    def __init__(self, templates_dir: Optional[Path] = None):
        """Initialize generator with templates directory."""
        if templates_dir is None:
            templates_dir = Path(__file__).parent / "templates"

        self.templates_dir = templates_dir
        self.questions_file = templates_dir / "questions.yaml"
        self._questions: Dict[str, Dict[str, List[str]]] = {}
        self._load_templates()

    def _load_templates(self):
        """Load question templates from YAML file."""
        if not self.questions_file.exists():
            raise FileNotFoundError(f"Questions template not found: {self.questions_file}")

        with open(self.questions_file, 'r', encoding='utf-8') as f:
            self._questions = yaml.safe_load(f)

    def generate_questions(
        self,
        persona: Persona,
        idea: str,
        pass_number: int,
        previous_answers: Optional[Dict[int, Dict[str, List[tuple]]]] = None
    ) -> List[str]:
        """
        Generate questions for a persona based on context.

        Args:
            persona: The persona asking questions
            idea: The original idea text
            pass_number: Which pass (1-5)
            previous_answers: Answers from previous passes

        Returns:
            List of questions to ask
        """
        if persona.id not in self._questions:
            # Fallback to generic questions
            return self._get_fallback_questions(persona)

        persona_questions = self._questions[persona.id]

        # Collect all questions from all categories for this persona
        all_questions = []
        for category, questions in persona_questions.items():
            all_questions.extend(questions)

        # Select questions based on pass number and context
        selected = self._select_questions(
            all_questions,
            persona,
            idea,
            pass_number,
            previous_answers
        )

        return selected

    def _select_questions(
        self,
        available_questions: List[str],
        persona: Persona,
        idea: str,
        pass_number: int,
        previous_answers: Optional[Dict[int, Dict[str, List[tuple]]]]
    ) -> List[str]:
        """
        Select most relevant questions based on context.

        Strategy:
        - Pass 1 (Scoping): Ask broad scoping questions
        - Pass 2 (Technical): Ask technical/implementation questions
        - Pass 3 (User Impact): Ask accessibility, onboarding, psychological questions
        - Pass 4 (Engagement): Ask engagement, content, growth questions
        - Pass 5 (Domain-specific): Ask specialized domain questions

        Returns 3-5 questions per persona.
        """
        selected = []

        # Filter questions based on pass number and keywords
        idea_lower = idea.lower()

        for question in available_questions:
            question_lower = question.lower()

            # Skip already-asked questions if we have previous context
            # (In practice, each persona only asks once, so this is less critical)

            # Pass-specific filtering
            if pass_number == 1:
                # Scoping pass: prioritize "what", "why", "who" questions
                if any(word in question_lower for word in ['what', 'why', 'who', 'problem', 'user', 'align', 'mvp']):
                    selected.append(question)
            elif pass_number == 2:
                # Technical pass: prioritize implementation questions
                if any(word in question_lower for word in ['how', 'technical', 'component', 'library', 'file', 'data']):
                    selected.append(question)
            elif pass_number == 3:
                # User impact pass: prioritize accessibility, psychology, onboarding
                if any(word in question_lower for word in ['user', 'accessibility', 'screen reader', 'first-time', 'friction', 'aha']):
                    selected.append(question)
            elif pass_number == 4:
                # Engagement pass: prioritize engagement, content, growth
                if any(word in question_lower for word in ['engagement', 'content', 'sharing', 'viral', 'reward', 'motivation']):
                    selected.append(question)
            else:
                # Pass 5: Domain-specific, include all relevant questions
                selected.append(question)

        # If filtering didn't work well, just take first questions
        if len(selected) < 3:
            selected = available_questions[:5]

        # Limit to 5 questions max
        return selected[:5]

    def _get_fallback_questions(self, persona: Persona) -> List[str]:
        """Generate fallback questions if persona not in templates."""
        return [
            f"How does this idea relate to {persona.focus}?",
            f"What considerations should we have for {persona.goal}?",
            "What potential challenges or risks do you foresee?",
            "What would make this feature excellent from your perspective?"
        ]

    def get_all_persona_ids(self) -> List[str]:
        """Get list of all persona IDs with question templates."""
        return list(self._questions.keys())
