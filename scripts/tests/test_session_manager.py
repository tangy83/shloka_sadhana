"""Tests for session manager."""

import json
import tempfile
from pathlib import Path
from idea_to_backlog.session_manager import SessionManager


def test_session_creation():
    """Test creating a new session."""
    session = SessionManager(idea="Test feature idea")

    assert session.idea == "Test feature idea"
    assert session.session_id.startswith("session_")
    assert isinstance(session.answers, dict)

    print("✅ Session creation works")


def test_record_answer():
    """Test recording Q&A pairs."""
    session = SessionManager(idea="Test idea")

    session.record_answer(
        pass_number=1,
        persona_name="Product Manager",
        question="What problem does this solve?",
        answer="It solves X problem"
    )

    assert 1 in session.answers
    assert "Product Manager" in session.answers[1]
    assert len(session.answers[1]["Product Manager"]) == 1

    q, a = session.answers[1]["Product Manager"][0]
    assert q == "What problem does this solve?"
    assert a == "It solves X problem"

    print("✅ Recording answers works")


def test_session_save_and_load():
    """Test saving and loading session."""
    with tempfile.TemporaryDirectory() as tmpdir:
        session = SessionManager(idea="Test idea")
        session.record_answer(1, "PM", "Q1", "A1")

        # Save
        output_dir = Path(tmpdir)
        saved_path = session.save(output_dir)

        assert saved_path.exists()

        # Load
        loaded_session = SessionManager.load(saved_path)

        assert loaded_session.idea == session.idea
        assert loaded_session.session_id == session.session_id
        assert loaded_session.answers == session.answers

        print("✅ Session save/load works")


def test_get_personas_consulted():
    """Test getting list of consulted personas."""
    session = SessionManager(idea="Test")

    session.record_answer(1, "Product Manager", "Q1", "A1")
    session.record_answer(1, "UI/UX Designer", "Q2", "A2")
    session.record_answer(2, "Frontend Engineer", "Q3", "A3")

    personas = session.get_personas_consulted()

    assert len(personas) == 3
    assert "Product Manager" in personas
    assert "UI/UX Designer" in personas
    assert "Frontend Engineer" in personas

    print("✅ Get personas consulted works")


if __name__ == "__main__":
    test_session_creation()
    test_record_answer()
    test_session_save_and_load()
    test_get_personas_consulted()
    print("\n✅ All session manager tests passed!")
