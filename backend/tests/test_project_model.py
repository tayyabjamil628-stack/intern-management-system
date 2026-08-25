import pytest
from datetime import date
from sqlalchemy import CheckConstraint, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from app.db.base import Base
from app.models import Department, Intern, InternStatus, Project, ProjectStatus


def test_project_model_registered_in_metadata():
    """Verify that the projects table is registered in SQLAlchemy Base.metadata."""
    assert "projects" in Base.metadata.tables
    table = Base.metadata.tables["projects"]

    # Verify column existence and attributes
    assert "id" in table.c
    assert isinstance(table.c.id.type, Integer)
    assert table.c.id.primary_key is True

    assert "name" in table.c
    assert isinstance(table.c.name.type, String)
    assert table.c.name.type.length == 150
    assert table.c.name.nullable is False

    assert "description" in table.c
    assert isinstance(table.c.description.type, Text)
    assert table.c.description.nullable is True

    assert "intern_id" in table.c
    assert isinstance(table.c.intern_id.type, Integer)
    assert table.c.intern_id.nullable is False
    # Foreign key verification
    fks = list(table.c.intern_id.foreign_keys)
    assert len(fks) == 1
    assert fks[0].target_fullname == "interns.id"

    assert "start_date" in table.c
    assert isinstance(table.c.start_date.type, Date)
    assert table.c.start_date.nullable is False

    assert "deadline" in table.c
    assert isinstance(table.c.deadline.type, Date)
    assert table.c.deadline.nullable is False

    assert "status" in table.c
    assert isinstance(table.c.status.type, Enum)
    assert set(table.c.status.type.enums) == {"NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"}
    assert table.c.status.nullable is False

    assert "progress" in table.c
    assert isinstance(table.c.progress.type, Integer)
    assert table.c.progress.nullable is False

    assert "created_at" in table.c
    assert isinstance(table.c.created_at.type, DateTime)
    assert table.c.created_at.nullable is False

    assert "updated_at" in table.c
    assert isinstance(table.c.updated_at.type, DateTime)
    assert table.c.updated_at.nullable is False


def test_project_status_enum():
    """Verify ProjectStatus enumeration values."""
    assert ProjectStatus.NOT_STARTED.value == "NOT_STARTED"
    assert ProjectStatus.IN_PROGRESS.value == "IN_PROGRESS"
    assert ProjectStatus.COMPLETED.value == "COMPLETED"
    assert ProjectStatus.ON_HOLD.value == "ON_HOLD"


def test_project_progress_range_constraint():
    """Verify that the progress CheckConstraint is defined on the table."""
    table = Base.metadata.tables["projects"]
    check_constraints = [c for c in table.constraints if isinstance(c, CheckConstraint)]
    assert len(check_constraints) >= 1
    progress_constraint = next(
        (c for c in check_constraints if c.name == "check_project_progress_range"),
        None,
    )
    assert progress_constraint is not None
    sql_text = str(progress_constraint.sqltext)
    assert "progress >= 0" in sql_text
    assert "progress <= 100" in sql_text


def test_project_instance_representation():
    """Verify Project model instantiation and string representation."""
    project = Project(
        id=1,
        name="AI Document Processor",
        description="Extract and parse unstructured text documents.",
        intern_id=10,
        start_date=date(2026, 6, 1),
        deadline=date(2026, 7, 15),
        status=ProjectStatus.IN_PROGRESS,
        progress=45,
    )
    assert project.id == 1
    assert project.name == "AI Document Processor"
    assert project.intern_id == 10
    assert project.status == ProjectStatus.IN_PROGRESS
    assert project.progress == 45
    assert (
        repr(project)
        == "<Project(id=1, name='AI Document Processor', intern_id=10, status='IN_PROGRESS', progress=45)>"
    )


def test_intern_project_relationship_configured():
    """Verify bidirectional relationship mapping between Intern and Project."""
    intern = Intern(
        id=1,
        intern_id="INT-2026-001",
        full_name="Sarah Chen",
        email="sarah.chen@example.com",
        role="Frontend Engineer Intern",
        department_id=1,
        start_date=date(2026, 6, 1),
        end_date=date(2026, 8, 31),
        status=InternStatus.ACTIVE,
    )
    project = Project(
        id=1,
        name="IMS Portal Redesign",
        intern_id=1,
        start_date=date(2026, 6, 1),
        deadline=date(2026, 7, 15),
        status=ProjectStatus.IN_PROGRESS,
        progress=60,
    )
    intern.projects = [project]
    assert len(intern.projects) == 1
    assert intern.projects[0].name == "IMS Portal Redesign"
    assert project.intern == intern
