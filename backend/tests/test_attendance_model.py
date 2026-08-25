import pytest
from datetime import date
from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint
from app.db.base import Base
from app.models import (
    Attendance,
    AttendanceStatus,
    Department,
    Intern,
    InternStatus,
    Project,
    ProjectStatus,
)


def test_attendance_model_registered_in_metadata():
    """Verify that the attendance table is registered in SQLAlchemy Base.metadata."""
    assert "attendance" in Base.metadata.tables
    table = Base.metadata.tables["attendance"]

    # Verify column existence and attributes
    assert "id" in table.c
    assert isinstance(table.c.id.type, Integer)
    assert table.c.id.primary_key is True

    assert "intern_id" in table.c
    assert isinstance(table.c.intern_id.type, Integer)
    assert table.c.intern_id.nullable is False
    # Foreign key verification
    fks = list(table.c.intern_id.foreign_keys)
    assert len(fks) == 1
    assert fks[0].target_fullname == "interns.id"

    assert "attendance_date" in table.c
    assert isinstance(table.c.attendance_date.type, Date)
    assert table.c.attendance_date.nullable is False

    assert "status" in table.c
    assert isinstance(table.c.status.type, Enum)
    assert set(table.c.status.type.enums) == {"PRESENT", "ABSENT", "LEAVE"}
    assert table.c.status.nullable is False

    assert "remarks" in table.c
    assert isinstance(table.c.remarks.type, String)
    assert table.c.remarks.type.length == 255
    assert table.c.remarks.nullable is True

    assert "created_at" in table.c
    assert isinstance(table.c.created_at.type, DateTime)
    assert table.c.created_at.nullable is False


def test_attendance_status_enum():
    """Verify AttendanceStatus enumeration values."""
    assert AttendanceStatus.PRESENT.value == "PRESENT"
    assert AttendanceStatus.ABSENT.value == "ABSENT"
    assert AttendanceStatus.LEAVE.value == "LEAVE"


def test_attendance_unique_intern_date_constraint():
    """Verify that the unique constraint (intern_id, attendance_date) is defined on the table."""
    table = Base.metadata.tables["attendance"]
    unique_constraints = [c for c in table.constraints if isinstance(c, UniqueConstraint)]
    assert len(unique_constraints) >= 1
    uq = next(
        (c for c in unique_constraints if c.name == "uq_attendance_intern_date"),
        None,
    )
    assert uq is not None
    col_names = {col.name for col in uq.columns}
    assert col_names == {"intern_id", "attendance_date"}


def test_attendance_instance_representation():
    """Verify Attendance model instantiation and string representation."""
    att = Attendance(
        id=1,
        intern_id=5,
        attendance_date=date(2026, 6, 15),
        status=AttendanceStatus.PRESENT,
        remarks="Arrived on time",
    )
    assert att.id == 1
    assert att.intern_id == 5
    assert att.attendance_date == date(2026, 6, 15)
    assert att.status == AttendanceStatus.PRESENT
    assert att.remarks == "Arrived on time"
    assert (
        repr(att)
        == "<Attendance(id=1, intern_id=5, attendance_date='2026-06-15', status='PRESENT')>"
    )


def test_intern_attendance_relationship_configured():
    """Verify bidirectional relationship mapping between Intern and Attendance."""
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
    att = Attendance(
        id=1,
        intern_id=1,
        attendance_date=date(2026, 6, 15),
        status=AttendanceStatus.PRESENT,
        remarks="Daily standup attended",
    )
    intern.attendance_records = [att]
    assert len(intern.attendance_records) == 1
    assert intern.attendance_records[0].status == AttendanceStatus.PRESENT
    assert att.intern == intern
