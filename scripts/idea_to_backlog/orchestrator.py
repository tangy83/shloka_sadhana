"""Orchestrate the multi-pass Q&A workflow."""

import re
from typing import List, Callable, Optional
from pathlib import Path

from .config import Config
from .persona_parser import PersonaParser, Persona
from .question_generator import QuestionGenerator
from .session_manager import SessionManager


class Orchestrator:
    """Coordinates the idea refinement workflow."""

    def __init__(self, config: Optional[Config] = None):
        """
        Initialize orchestrator.

        Args:
            config: Configuration instance (uses default if not provided)
        """
        if config is None:
            config = Config.from_env()

        self.config = config
        self.persona_parser = PersonaParser(config.persona_dir)
        self.question_generator = QuestionGenerator()
        self.personas: List[Persona] = []

    def load_personas(self) -> List[Persona]:
        """Load all persona files."""
        self.personas = self.persona_parser.parse_all()
        return self.personas

    def select_personas_for_pass(self, idea: str, pass_number: int) -> List[Persona]:
        """
        Select personas for a given pass.

        Pass 1: Product Manager, UI/UX Designer
        Pass 2: Frontend Engineer, Mobile Performance Engineer
        Pass 3: Accessibility, Onboarding, Behavioral Psychologist
        Pass 4: Gamification, Content, Growth
        Pass 5: Domain-specific (keyword-based selection)

        Args:
            idea: The feature idea (used for keyword matching in Pass 5)
            pass_number: Which pass (1-5)

        Returns:
            List of personas to consult
        """
        # Persona ID assignments per pass
        pass_assignments = {
            1: ['04-product-manager', '01-ui-ux-designer'],
            2: ['03-frontend-engineer', '11-mobile-performance-engineer'],
            3: ['02-accessibility-specialist', '08-onboarding-specialist', '17-behavioral-psychologist'],
            4: ['05-gamification-designer', '06-content-strategist', '09-growth-marketer'],
            5: []  # Dynamic based on keywords
        }

        # Pass 5: Select based on keywords in idea
        if pass_number == 5:
            idea_lower = idea.lower()
            persona_ids = []

            if re.search(r'\b(calendar|ekadashi|festival|muhurat|paanchang)\b', idea_lower):
                persona_ids.append('16-hindu-calendar-expert')

            if re.search(r'\b(audio|video|media|playback|recording)\b', idea_lower):
                persona_ids.append('12-audio-video-specialist')

            if re.search(r'\b(social|share|community|satsang|friend)\b', idea_lower):
                persona_ids.append('07-community-manager')

            if re.search(r'\b(notification|reminder|timing|alert)\b', idea_lower):
                persona_ids.append('14-notification-strategist')

            if re.search(r'\b(language|hindi|tamil|translation|localization)\b', idea_lower):
                persona_ids.append('13-localization-expert')

            if re.search(r'\b(cloud|sync|backend|server|database)\b', idea_lower):
                persona_ids.append('15-backend-sync-engineer')

            # Default if no matches: Hindu Calendar Expert + Data Analyst
            if not persona_ids:
                persona_ids = ['16-hindu-calendar-expert', '10-data-analyst']

            pass_assignments[5] = persona_ids

        # Get persona IDs for this pass
        persona_ids = pass_assignments.get(pass_number, [])

        # Find persona objects
        selected_personas = []
        for persona_id in persona_ids:
            persona = next((p for p in self.personas if p.id == persona_id), None)
            if persona:
                selected_personas.append(persona)
            else:
                print(f"Warning: Persona {persona_id} not found")

        return selected_personas

    def run_interactive_session(
        self,
        idea: str,
        answer_callback: Callable[[str, str, int, str], str]
    ) -> SessionManager:
        """
        Run the interactive 5-pass Q&A session.

        Args:
            idea: The feature idea to refine
            answer_callback: Function to get user answer (persona_name, question, pass_num, context) -> answer

        Returns:
            Completed SessionManager with all answers
        """
        session = SessionManager(idea=idea)

        for pass_num in range(1, self.config.num_passes + 1):
            # Select personas for this pass
            personas = self.select_personas_for_pass(idea, pass_num)

            # Get context from previous passes
            context = session.get_context_for_pass(pass_num)

            # Ask questions from each persona
            for persona in personas:
                questions = self.question_generator.generate_questions(
                    persona=persona,
                    idea=idea,
                    pass_number=pass_num,
                    previous_answers=session.answers
                )

                # Ask each question and record answer
                for question in questions:
                    answer = answer_callback(persona.name, question, pass_num, context)
                    session.record_answer(pass_num, persona.name, question, answer)

        return session

    def get_pass_name(self, pass_number: int) -> str:
        """Get descriptive name for each pass."""
        pass_names = {
            1: "Scoping & Vision",
            2: "Technical Feasibility",
            3: "User Impact & Inclusion",
            4: "Engagement & Content",
            5: "Domain-Specific Expertise"
        }
        return pass_names.get(pass_number, f"Pass {pass_number}")

    def get_pass_description(self, pass_number: int) -> str:
        """Get description of what each pass focuses on."""
        descriptions = {
            1: "Understanding WHAT we're building and WHO it's for",
            2: "Understanding HOW we'd build it and technical complexity",
            3: "Ensuring it works for ALL users and drives right behaviors",
            4: "Maximizing engagement and content strategy",
            5: "Applying domain expertise and identifying special requirements"
        }
        return descriptions.get(pass_number, "")
