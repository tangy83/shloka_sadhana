"""CLI interface for idea_to_backlog."""

import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

import typer
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Prompt, Confirm
from rich.panel import Panel
from rich.markdown import Markdown

from .config import Config, get_config
from .orchestrator import Orchestrator
from .session_manager import SessionManager
from .backlog_generator import BacklogGenerator, IdeaAnalysis
from .tdd_spec_generator import TDDSpecGenerator


app = typer.Typer()
console = Console()


def get_pass_description(pass_num: int) -> str:
    """Get description for each pass."""
    descriptions = {
        1: "Scoping & Vision - Understanding WHAT and WHO",
        2: "Technical Feasibility - Understanding HOW to build it",
        3: "User Impact & Inclusion - Ensuring it works for ALL users",
        4: "Engagement & Content - Maximizing engagement",
        5: "Domain-Specific - Applying specialized expertise"
    }
    return descriptions.get(pass_num, f"Pass {pass_num}")


@app.command()
def run(
    idea: Optional[str] = typer.Option(None, "--idea", "-i", help="Feature idea (or provide interactively)"),
    resume: Optional[str] = typer.Option(None, "--resume", help="Resume saved session from file"),
    output_dir: Optional[str] = typer.Option(None, "--output", "-o", help="Output directory (default: ./docs)"),
):
    """
    Refine feature ideas through persona perspectives using TDD methodology.

    This tool helps systematically refine raw ideas by asking clarifying questions
    from 17 specialized personas, then generates TDD-ready backlog entries.
    """
    try:
        # Display welcome banner
        console.print(Panel.fit(
            "[bold cyan]🕉️  Idea to Backlog Generator[/bold cyan]\n"
            "Refine ideas through persona perspectives • Generate TDD-ready specs",
            border_style="cyan"
        ))

        # Get configuration
        config = get_config()
        if output_dir:
            config.docs_dir = Path(output_dir)

        config.ensure_directories()

        # Get idea if not provided
        if not idea and not resume:
            console.print("\n[bold]Step 1: Describe your feature idea[/bold]")
            console.print("Be as detailed or as brief as you like. We'll refine it through 5 passes.\n")
            idea = Prompt.ask("💡 Your idea")

            if not idea.strip():
                console.print("[red]Error: Idea cannot be empty[/red]")
                raise typer.Exit(1)

        # Initialize orchestrator
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Initializing...", total=None)

            try:
                orchestrator = Orchestrator(config)

                progress.update(task, description="Loading personas...")
                personas = orchestrator.load_personas()

                console.print(f"\n✅ Loaded {len(personas)} personas\n")

            except Exception as e:
                console.print(f"[red]Error: {e}[/red]")
                raise typer.Exit(1)

        # Resume or start new session
        if resume:
            console.print(f"📂 Resuming session from {resume}")
            session = SessionManager.load(Path(resume))
            start_pass = len(session.answers) + 1
        else:
            session = SessionManager(idea=idea)
            start_pass = 1

        # Run multi-pass Q&A
        try:
            for pass_num in range(start_pass, config.num_passes + 1):
                console.print(f"\n{'=' * 70}")
                console.print(Panel.fit(
                    f"[bold cyan]Pass {pass_num}/5: {get_pass_description(pass_num)}[/bold cyan]",
                    border_style="cyan"
                ))

                selected_personas = orchestrator.select_personas_for_pass(session.idea, pass_num)

                for persona in selected_personas:
                    console.print(f"\n[bold magenta]👤 {persona.name}[/bold magenta]")
                    console.print(f"[dim]{persona.focus}[/dim]\n")

                    questions = orchestrator.question_generator.generate_questions(
                        persona=persona,
                        idea=session.idea,
                        pass_number=pass_num,
                        previous_answers=session.answers
                    )

                    for i, question in enumerate(questions, 1):
                        console.print(f"  [cyan]Q{i}:[/cyan] {question}")
                        answer = Prompt.ask("  [green]A[/green]", console=console)
                        session.record_answer(pass_num, persona.name, question, answer)

                # Show progress
                progress_pct = (pass_num / config.num_passes) * 100
                console.print(f"\n[dim]Progress: {progress_pct:.0f}% complete[/dim]")

        except KeyboardInterrupt:
            console.print("\n\n[yellow]⚠️  Session interrupted[/yellow]")
            if Confirm.ask("Save progress?"):
                session_file = session.save(config.session_dir)
                console.print(f"✅ Session saved to {session_file}")
                console.print(f"\nResume with: [cyan]python idea_to_backlog.py --resume {session_file}[/cyan]")
            raise typer.Exit(0)

        # Generate outputs
        console.print("\n[bold]🎯 Generating outputs...[/bold]")

        with Progress(console=console) as progress:
            task = progress.add_task("Analyzing idea...", total=4)

            # Generate backlog entry
            backlog_gen = BacklogGenerator()
            backlog_entry = backlog_gen.generate_entry(session)
            progress.advance(task)

            # Generate TDD spec
            tdd_gen = TDDSpecGenerator()
            tdd_spec = tdd_gen.generate_spec(session)
            progress.advance(task)

            # Generate idea analysis
            idea_analysis = generate_idea_analysis(session)
            progress.advance(task)

            # Prepare filenames
            analysis_obj = IdeaAnalysis(session)
            feature_slug = analysis_obj._slugify(analysis_obj.feature_name)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

            progress.advance(task)

        # Write files
        console.print("\n[bold]💾 Writing output files...[/bold]")

        files_written = []

        # 1. Append to BACKLOG.md
        try:
            backlog_gen.append_to_backlog(backlog_entry, config.backlog_file)
            files_written.append(str(config.backlog_file))
            console.print(f"  ✅ {config.backlog_file} (entry appended)")
        except Exception as e:
            console.print(f"  [red]❌ Failed to append to BACKLOG.md: {e}[/red]")

        # 2. Write TDD spec
        try:
            tdd_spec_file = config.tdd_spec_dir / f"{feature_slug}_tdd_spec.md"
            tdd_spec_file.write_text(tdd_spec, encoding='utf-8')
            files_written.append(str(tdd_spec_file))
            console.print(f"  ✅ {tdd_spec_file}")
        except Exception as e:
            console.print(f"  [red]❌ Failed to write TDD spec: {e}[/red]")

        # 3. Write idea analysis
        try:
            analysis_file = config.idea_analysis_dir / f"{feature_slug}_{timestamp}.md"
            analysis_file.write_text(idea_analysis, encoding='utf-8')
            files_written.append(str(analysis_file))
            console.print(f"  ✅ {analysis_file}")
        except Exception as e:
            console.print(f"  [red]❌ Failed to write idea analysis: {e}[/red]")

        # Display summary
        console.print("\n" + "=" * 70)
        console.print(Panel.fit(
            f"[bold green]✨ Success![/bold green]\n\n"
            f"Feature: [cyan]{analysis_obj.feature_name}[/cyan]\n"
            f"Priority: [yellow]{analysis_obj.priority}[/yellow]\n"
            f"Effort: [blue]{analysis_obj.effort}[/blue]\n\n"
            f"Next steps:\n"
            f"1. Review backlog entry in [cyan]{config.backlog_file}[/cyan]\n"
            f"2. Follow TDD spec in [cyan]{files_written[1] if len(files_written) > 1 else 'TDD spec'}[/cyan]\n"
            f"3. Begin RED phase: Write failing tests",
            border_style="green"
        ))

    except Exception as e:
        console.print(f"\n[red]Error: {e}[/red]")
        import traceback
        traceback.print_exc()
        raise typer.Exit(1)


def generate_idea_analysis(session: SessionManager) -> str:
    """Generate idea analysis document."""
    analysis = IdeaAnalysis(session)

    # Build passes data
    passes_data = {}
    for pass_num in sorted(session.answers.keys()):
        pass_data = session.answers[pass_num]
        passes_data[pass_num] = {
            "name": get_pass_description(pass_num),
            "personas": pass_data
        }

    # Simple synthesis (could be more sophisticated)
    synthesis = {
        "scope": f"Based on {len(session.get_personas_consulted())} persona perspectives, this feature aims to {session.idea[:200]}",
        "value": "Identified through Product Manager and UX Designer perspectives",
        "technical": "Technical approach defined through Frontend Engineer input",
        "risks": ["Implementation complexity", "Testing coverage", "User adoption"],
        "metrics": ["User engagement", "Feature adoption rate", "User satisfaction"]
    }

    # Manual template rendering (simpler than Jinja2 for this doc)
    content = f"""# Idea Analysis: {analysis.feature_name}

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Original Idea:** {session.idea}
**Priority:** {analysis.priority}
**Effort:** {analysis.effort}
**Epic:** {analysis.epic}

---

## Multi-Pass Refinement Summary

"""

    for pass_num, pass_info in passes_data.items():
        content += f"### Pass {pass_num}: {pass_info['name']}\n\n"
        for persona_name, qa_pairs in pass_info['personas'].items():
            content += f"**{persona_name}:**\n"
            for q, a in qa_pairs:
                content += f"- Q: {q}\n"
                content += f"- A: {a}\n"
            content += "\n"

    content += """---

## Synthesis & Recommendations

### Feature Scope
"""
    content += synthesis['scope'] + "\n\n"

    content += """### User Value
"""
    content += synthesis['value'] + "\n\n"

    content += """### Technical Approach
"""
    content += synthesis['technical'] + "\n\n"

    content += """### Risks & Mitigations
"""
    for risk in synthesis['risks']:
        content += f"- {risk}\n"

    content += """\n### Success Metrics
"""
    for metric in synthesis['metrics']:
        content += f"- {metric}\n"

    content += f"""
---

## Generated Artifacts

- **Backlog Entry**: `docs/BACKLOG.md` (appended)
- **TDD Spec**: `docs/tdd_specs/{analysis._slugify(analysis.feature_name)}_tdd_spec.md`

---

## Next Steps

1. Review and approve backlog entry
2. Follow TDD specification for implementation
3. Begin RED phase: Write failing tests
4. Implement GREEN phase: Make tests pass
5. REFACTOR phase: Polish code quality
6. Log any issues in ISSUES_LOG.md
"""

    return content


if __name__ == "__main__":
    app()
