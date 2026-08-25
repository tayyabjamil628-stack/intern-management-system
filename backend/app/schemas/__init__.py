"""Pydantic schemas and serialization models package."""
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceUpdate,
)
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)
from app.schemas.health import HealthResponse
from app.schemas.intern import (
    InternCreate,
    InternResponse,
    InternUpdate,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)

__all__ = [
    "AttendanceCreate",
    "AttendanceResponse",
    "AttendanceUpdate",
    "DepartmentCreate",
    "DepartmentResponse",
    "DepartmentUpdate",
    "HealthResponse",
    "InternCreate",
    "InternResponse",
    "InternUpdate",
    "ProjectCreate",
    "ProjectResponse",
    "ProjectUpdate",
]

