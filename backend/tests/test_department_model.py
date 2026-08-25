import pytest
from sqlalchemy import Integer, String, Text, DateTime
from app.db.base import Base
from app.models import Department


def test_department_model_registered_in_metadata():
    """Verify that the departments table is registered in SQLAlchemy Base.metadata."""
    assert "departments" in Base.metadata.tables
    table = Base.metadata.tables["departments"]

    # Verify column existence and attributes
    assert "id" in table.c
    assert isinstance(table.c.id.type, Integer)
    assert table.c.id.primary_key is True

    assert "name" in table.c
    assert isinstance(table.c.name.type, String)
    assert table.c.name.type.length == 100
    assert table.c.name.nullable is False
    assert table.c.name.unique is True

    assert "description" in table.c
    assert isinstance(table.c.description.type, Text)
    assert table.c.description.nullable is True

    assert "created_at" in table.c
    assert isinstance(table.c.created_at.type, DateTime)
    assert table.c.created_at.nullable is False

    assert "updated_at" in table.c
    assert isinstance(table.c.updated_at.type, DateTime)
    assert table.c.updated_at.nullable is False


def test_department_instance_representation():
    """Verify Department model instantiation and string representation."""
    dept = Department(id=1, name="Engineering", description="Core engineering team")
    assert dept.id == 1
    assert dept.name == "Engineering"
    assert dept.description == "Core engineering team"
    assert repr(dept) == "<Department(id=1, name='Engineering')>"
