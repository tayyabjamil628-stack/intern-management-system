import pytest
from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKeyConstraint,
    Integer,
    PrimaryKeyConstraint,
    String,
    Text,
    UniqueConstraint,
)
from app.db.base import Base
import app.models  # noqa: F401


def test_schema_audit_tables():
    """Audit that exactly the 4 required business tables exist in Base.metadata."""
    expected_tables = {"departments", "interns", "projects", "attendance"}
    actual_tables = set(Base.metadata.tables.keys())
    assert actual_tables == expected_tables, f"Mismatch in tables: {actual_tables} vs {expected_tables}"


def test_departments_schema_audit():
    """Audit departments table definition, constraints, and types."""
    table = Base.metadata.tables["departments"]
    
    # Columns
    cols = table.c
    assert set(cols.keys()) == {"id", "name", "description", "created_at", "updated_at"}
    
    # Primary Key
    assert cols["id"].primary_key is True
    assert isinstance(cols["id"].type, Integer)
    
    # name
    assert isinstance(cols["name"].type, String)
    assert cols["name"].type.length == 100
    assert cols["name"].nullable is False
    assert cols["name"].unique is True
    
    # description
    assert isinstance(cols["description"].type, Text)
    assert cols["description"].nullable is True
    
    # created_at & updated_at
    assert isinstance(cols["created_at"].type, DateTime)
    assert cols["created_at"].nullable is False
    assert isinstance(cols["updated_at"].type, DateTime)
    assert cols["updated_at"].nullable is False


def test_interns_schema_audit():
    """Audit interns table definition, constraints, foreign keys, and indexes."""
    table = Base.metadata.tables["interns"]
    
    # Columns
    cols = table.c
    expected_cols = {
        "id",
        "intern_id",
        "full_name",
        "email",
        "phone",
        "department_id",
        "role",
        "university",
        "start_date",
        "end_date",
        "status",
        "created_at",
        "updated_at",
    }
    assert set(cols.keys()) == expected_cols
    
    # Unique fields
    assert cols["intern_id"].unique is True
    assert cols["email"].unique is True
    
    # Foreign key
    fks = list(table.foreign_keys)
    assert len(fks) == 1
    assert fks[0].target_fullname == "departments.id"
    assert fks[0].ondelete == "RESTRICT"
    
    # Status enum
    assert isinstance(cols["status"].type, Enum)
    assert set(cols["status"].type.enums) == {"ACTIVE", "COMPLETED", "TERMINATED"}


def test_projects_schema_audit():
    """Audit projects table definition, constraints, check constraints, and foreign keys."""
    table = Base.metadata.tables["projects"]
    
    # Columns
    cols = table.c
    expected_cols = {
        "id",
        "name",
        "description",
        "intern_id",
        "start_date",
        "deadline",
        "status",
        "progress",
        "created_at",
        "updated_at",
    }
    assert set(cols.keys()) == expected_cols
    
    # Foreign key
    fks = list(table.foreign_keys)
    assert len(fks) == 1
    assert fks[0].target_fullname == "interns.id"
    assert fks[0].ondelete == "RESTRICT"
    
    # Status enum
    assert isinstance(cols["status"].type, Enum)
    assert set(cols["status"].type.enums) == {"NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"}
    
    # Check constraint
    check_constraints = [c for c in table.constraints if isinstance(c, CheckConstraint)]
    assert any(
        "progress >= 0" in str(c.sqltext) and "progress <= 100" in str(c.sqltext)
        for c in check_constraints
    )


def test_attendance_schema_audit():
    """Audit attendance table definition, composite unique constraint, and foreign keys."""
    table = Base.metadata.tables["attendance"]
    
    # Columns
    cols = table.c
    expected_cols = {
        "id",
        "intern_id",
        "attendance_date",
        "status",
        "remarks",
        "created_at",
    }
    assert set(cols.keys()) == expected_cols
    
    # Foreign key
    fks = list(table.foreign_keys)
    assert len(fks) == 1
    assert fks[0].target_fullname == "interns.id"
    assert fks[0].ondelete == "RESTRICT"
    
    # Status enum
    assert isinstance(cols["status"].type, Enum)
    assert set(cols["status"].type.enums) == {"PRESENT", "ABSENT", "LEAVE"}
    
    # Composite Unique Constraint
    unique_constraints = [c for c in table.constraints if isinstance(c, UniqueConstraint)]
    assert any(
        {col.name for col in c.columns} == {"intern_id", "attendance_date"}
        for c in unique_constraints
    )
