import pytest
from datetime import date
from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String
from app.db.base import Base
from app.models import Department, Intern, InternStatus


def test_intern_model_registered_in_metadata():
    """Verify that the interns table is registered in SQLAlchemy Base.metadata."""
    assert "interns" in Base.metadata.tables
    table = Base.metadata.tables["interns"]

    # Verify column existence and attributes
    assert "id" in table.c
    assert isinstance(table.c.id.type, Integer)
    assert table.c.id.primary_key is True

    assert "intern_id" in table.c
    assert isinstance(table.c.intern_id.type, String)
    assert table.c.intern_id.type.length == 50
    assert table.c.intern_id.nullable is False
    assert table.c.intern_id.unique is True

    assert "full_name" in table.c
    assert isinstance(table.c.full_name.type, String)
    assert table.c.full_name.type.length == 150
    assert table.c.full_name.nullable is False

    assert "email" in table.c
    assert isinstance(table.c.email.type, String)
    assert table.c.email.type.length == 150
    assert table.c.email.nullable is False
    assert table.c.email.unique is True

    assert "phone" in table.c
    assert isinstance(table.c.phone.type, String)
    assert table.c.phone.type.length == 20
    assert table.c.phone.nullable is True

    assert "department_id" in table.c
    assert isinstance(table.c.department_id.type, Integer)
    assert table.c.department_id.nullable is False
    # Foreign key verification
    fks = list(table.c.department_id.foreign_keys)
    assert len(fks) == 1
    assert fks[0].target_fullname == "departments.id"

    assert "role" in table.c
    assert isinstance(table.c.role.type, String)
    assert table.c.role.type.length == 100
    assert table.c.role.nullable is False

    assert "university" in table.c
    assert isinstance(table.c.university.type, String)
    assert table.c.university.type.length == 150
    assert table.c.university.nullable is True

    assert "start_date" in table.c
    assert isinstance(table.c.start_date.type, Date)
    assert table.c.start_date.nullable is False

    assert "end_date" in table.c
    assert isinstance(table.c.end_date.type, Date)
    assert table.c.end_date.nullable is False

    assert "status" in table.c
    assert isinstance(table.c.status.type, Enum)
    assert set(table.c.status.type.enums) == {"ACTIVE", "COMPLETED", "TERMINATED"}
    assert table.c.status.nullable is False

    assert "created_at" in table.c
    assert isinstance(table.c.created_at.type, DateTime)
    assert table.c.created_at.nullable is False

    assert "updated_at" in table.c
    assert isinstance(table.c.updated_at.type, DateTime)
    assert table.c.updated_at.nullable is False


def test_intern_status_enum():
    """Verify InternStatus enumeration values."""
    assert InternStatus.ACTIVE.value == "ACTIVE"
    assert InternStatus.COMPLETED.value == "COMPLETED"
    assert InternStatus.TERMINATED.value == "TERMINATED"


def test_intern_instance_representation():
    """Verify Intern model instantiation and string representation."""
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
    assert intern.id == 1
    assert intern.intern_id == "INT-2026-001"
    assert intern.full_name == "Sarah Chen"
    assert intern.email == "sarah.chen@example.com"
    assert intern.status == InternStatus.ACTIVE
    assert repr(intern) == "<Intern(id=1, intern_id='INT-2026-001', full_name='Sarah Chen', status='ACTIVE')>"


def test_department_intern_relationship_configured():
    """Verify bidirectional relationship mapping between Department and Intern."""
    dept = Department(id=1, name="Engineering", description="Core engineering")
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
    dept.interns = [intern]
    assert len(dept.interns) == 1
    assert dept.interns[0].full_name == "Sarah Chen"
