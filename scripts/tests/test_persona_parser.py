"""Tests for persona parser."""

import pytest
from pathlib import Path
from idea_to_backlog.persona_parser import PersonaParser, Persona


def test_parse_all_personas():
    """Test parsing all persona files."""
    parser = PersonaParser(persona_dir=Path("personas"))

    try:
        personas = parser.parse_all()

        # Should load multiple personas
        assert len(personas) > 0, "Should load at least one persona"

        # Each persona should have required fields
        for persona in personas:
            assert persona.id, f"Persona should have ID: {persona}"
            assert persona.name, f"Persona {persona.id} should have name"
            assert persona.focus, f"Persona {persona.id} should have focus"
            # Enhancements might be empty for some personas
            assert isinstance(persona.enhancements, list)

        print(f"✅ Successfully parsed {len(personas)} personas")

    except FileNotFoundError:
        pytest.skip("Persona directory not found - run from project root")


def test_persona_structure():
    """Test persona data structure."""
    parser = PersonaParser(persona_dir=Path("personas"))

    try:
        personas = parser.parse_all()

        if len(personas) > 0:
            # Test first persona
            persona = personas[0]

            assert isinstance(persona, Persona)
            assert isinstance(persona.enhancements, list)

            print(f"✅ Persona structure valid: {persona.name}")

    except FileNotFoundError:
        pytest.skip("Persona directory not found")


if __name__ == "__main__":
    # Run tests manually
    test_parse_all_personas()
    test_persona_structure()
    print("\n✅ All persona parser tests passed!")
