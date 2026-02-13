"""Generate TDD specifications from session data."""

from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader

from .session_manager import SessionManager
from .backlog_generator import IdeaAnalysis


class TDDSpecGenerator:
    """Generate TDD specification documents."""

    def __init__(self, templates_dir: Optional[Path] = None):
        """Initialize generator with templates directory."""
        if templates_dir is None:
            templates_dir = Path(__file__).parent / "templates"

        self.env = Environment(loader=FileSystemLoader(str(templates_dir)))

    def generate_spec(self, session: SessionManager) -> str:
        """
        Generate TDD specification from session.

        Args:
            session: Completed session with all answers

        Returns:
            Markdown-formatted TDD specification
        """
        analysis = IdeaAnalysis(session)

        # Generate test cases based on persona answers
        red_phase = self._generate_red_phase(session, analysis)
        green_phase = self._generate_green_phase(session, analysis)
        refactor_phase = self._generate_refactor_phase()

        # Identify files and mocks
        test_files = self._identify_test_files(analysis)
        implementation_files = self._identify_implementation_files(analysis)
        mocks_needed = self._identify_mocks(session)

        # Generate test stub
        test_stub = self._generate_test_stub(analysis)

        template = self.env.get_template('tdd_spec.md.j2')

        data = {
            "feature_name": analysis.feature_name,
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "priority": analysis.priority,
            "effort": analysis.effort,
            "test_files": test_files,
            "red_phase": red_phase,
            "green_phase": green_phase,
            "refactor_phase": refactor_phase,
            "primary_test_file": test_files[0] if test_files else "tests/feature.test.tsx",
            "test_stub": test_stub,
            "implementation_files": implementation_files,
            "acceptance_criteria": analysis.acceptance_criteria,
            "mocks_needed": mocks_needed,
            "implementation_notes": self._extract_implementation_notes(session)
        }

        return template.render(**data)

    def _generate_red_phase(self, session: SessionManager, analysis: IdeaAnalysis) -> Dict[str, List[str]]:
        """Generate RED phase test cases."""
        test_cases = {
            "rendering_tests": [],
            "interaction_tests": [],
            "state_tests": [],
            "accessibility_tests": [],
            "edge_case_tests": []
        }

        # From UI/UX answers: rendering tests
        has_ui = any('ui' in p.lower() or 'ux' in p.lower() or 'designer' in p.lower()
                     for p in session.get_personas_consulted())

        if has_ui:
            test_cases["rendering_tests"] = [
                "Component renders without crashing",
                "Correct elements are displayed with proper testIDs",
                "Empty state renders correctly",
                "Loading state renders correctly",
                "Error state renders correctly"
            ]

        # From UI/UX: interaction tests
        for pass_num, pass_data in session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'ui' in persona.lower() or 'ux' in persona.lower():
                    for q, a in qa_pairs:
                        if 'interaction' in q.lower():
                            test_cases["interaction_tests"].append(f"Handle user interaction: {a[:80]}")

        if not test_cases["interaction_tests"]:
            test_cases["interaction_tests"] = [
                "Button press triggers correct action",
                "User input is captured correctly",
                "Navigation works as expected"
            ]

        # From Frontend Engineer: state tests
        has_state = False
        for pass_num, pass_data in session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'frontend' in persona.lower() or 'engineer' in persona.lower():
                    for q, a in qa_pairs:
                        if 'state' in q.lower() or 'storage' in q.lower():
                            has_state = True
                            test_cases["state_tests"].append(f"State management: {a[:80]}")

        if has_state and len(test_cases["state_tests"]) == 0:
            test_cases["state_tests"] = [
                "State initializes with correct default values",
                "State updates correctly on user actions",
                "AsyncStorage persistence works correctly",
                "State hydration on app restart works"
            ]

        # From Accessibility: a11y tests
        has_a11y = any('accessibility' in p.lower() for p in session.get_personas_consulted())

        if has_a11y:
            test_cases["accessibility_tests"] = [
                "Accessibility labels are correct and descriptive",
                "Screen reader navigation works",
                "Touch targets are minimum 44x44 points",
                "Dynamic type/font scaling works"
            ]

        # Edge cases
        test_cases["edge_case_tests"] = [
            "Handles network errors gracefully",
            "Handles empty data correctly",
            "Handles invalid input appropriately"
        ]

        return test_cases

    def _generate_green_phase(self, session: SessionManager, analysis: IdeaAnalysis) -> Dict[str, List[str]]:
        """Generate GREEN phase implementation steps."""
        steps = []

        # Basic implementation flow
        steps.append("Create component/screen file structure")
        steps.append("Implement component rendering with correct testIDs")

        # From Frontend Engineer answers
        for pass_num, pass_data in session.answers.items():
            for persona, qa_pairs in pass_data.items():
                if 'frontend' in persona.lower() or 'engineer' in persona.lower():
                    for q, a in qa_pairs:
                        if 'state' in q.lower():
                            steps.append("Implement state management logic")
                        elif 'storage' in q.lower():
                            steps.append("Implement AsyncStorage persistence")

        steps.extend([
            "Implement user interaction handlers",
            "Run tests continuously with test:watch",
            "Achieve 100% test passage"
        ])

        return {"implementation_steps": steps}

    def _generate_refactor_phase(self) -> Dict[str, List[str]]:
        """Generate REFACTOR phase tasks."""
        return {
            "tasks": [
                "Extract reusable components if duplicated",
                "Remove code duplication",
                "Improve naming and readability",
                "Add JSDoc comments for complex logic",
                "Verify TypeScript types are correct",
                "Run full test suite to ensure no regressions"
            ]
        }

    def _identify_test_files(self, analysis: IdeaAnalysis) -> List[str]:
        """Identify test files to create."""
        test_files = []

        for file_info in analysis.files_to_modify:
            if '.test.' in file_info['path']:
                test_files.append(file_info['path'])
            elif file_info['path'].endswith('.tsx') or file_info['path'].endswith('.ts'):
                # Convert to test file path
                test_path = file_info['path'].replace('.tsx', '.test.tsx').replace('.ts', '.test.ts')
                if '__tests__' not in test_path:
                    # Add __tests__ directory
                    parts = test_path.split('/')
                    filename = parts[-1]
                    parts[-1] = f"__tests__/{filename}"
                    test_path = '/'.join(parts)
                test_files.append(test_path)

        if not test_files:
            feature_slug = analysis._slugify(analysis.feature_name)
            test_files = [f"src/components/__tests__/{feature_slug}.test.tsx"]

        return test_files

    def _identify_implementation_files(self, analysis: IdeaAnalysis) -> List[str]:
        """Identify implementation files to create/modify."""
        impl_files = []

        for file_info in analysis.files_to_modify:
            if '.test.' not in file_info['path']:
                impl_files.append(file_info['path'])

        return impl_files if impl_files else ["src/components/Feature.tsx"]

    def _identify_mocks(self, session: SessionManager) -> List[str]:
        """Identify mocks needed from answers."""
        mocks = []

        all_text = ' '.join([a for _, _, _, a in session.get_all_answers()]).lower()

        # Common React Native mocks
        if 'asyncstorage' in all_text or 'storage' in all_text:
            mocks.append("@react-native-async-storage/async-storage")

        if 'navigation' in all_text or 'navigate' in all_text:
            mocks.append("@react-navigation/native")

        if 'notification' in all_text:
            mocks.append("expo-notifications")

        if 'haptic' in all_text:
            mocks.append("expo-haptics")

        if not mocks:
            mocks = ["Standard React Native Testing Library mocks (already configured)"]

        return mocks

    def _generate_test_stub(self, analysis: IdeaAnalysis) -> str:
        """Generate test file stub code."""
        feature_slug = analysis._slugify(analysis.feature_name)
        component_name = ''.join(word.capitalize() for word in feature_slug.split('-'))

        return f"""import React from 'react';
import {{ render, fireEvent, waitFor }} from '@testing-library/react-native';
import {{ {component_name} }} from '../{component_name}';

describe('{component_name}', () => {{
  // RED PHASE: Write failing tests first

  describe('Rendering', () => {{
    it('should render without crashing', () => {{
      const {{ getByTestId }} = render(<{component_name} />);
      expect(getByTestId('{feature_slug}')).toBeTruthy();
    }});

    it('should display correct initial content', () => {{
      const {{ getByText }} = render(<{component_name} />);
      // TODO: Add assertions based on requirements
      expect(getByText('Expected Text')).toBeTruthy();
    }});
  }});

  describe('User Interactions', () => {{
    it('should handle button press', async () => {{
      const onPressMock = jest.fn();
      const {{ getByTestId }} = render(<{component_name} onPress={{onPressMock}} />);

      const button = getByTestId('action-button');
      fireEvent.press(button);

      await waitFor(() => {{
        expect(onPressMock).toHaveBeenCalledTimes(1);
      }});
    }});
  }});

  describe('State Management', () => {{
    it('should initialize with correct default state', () => {{
      // TODO: Add state initialization tests
    }});

    it('should update state on user action', async () => {{
      // TODO: Add state update tests
    }});
  }});

  describe('Accessibility', () => {{
    it('should have proper accessibility labels', () => {{
      const {{ getByLabelText }} = render(<{component_name} />);
      expect(getByLabelText('Expected Label')).toBeTruthy();
    }});
  }});
}});
"""

    def _extract_implementation_notes(self, session: SessionManager) -> List[str]:
        """Extract important implementation notes from answers."""
        notes = []

        for pass_num, pass_data in session.answers.items():
            for persona, qa_pairs in pass_data.items():
                for q, a in qa_pairs:
                    if 'edge case' in q.lower() or 'error' in q.lower() or 'challenge' in q.lower():
                        notes.append(f"{persona}: {a[:100]}")

        if not notes:
            notes = ["Follow TDD workflow from docs/TDD_WORKFLOW_REACT_NATIVE.md"]

        return notes[:5]
