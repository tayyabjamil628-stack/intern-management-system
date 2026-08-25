from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class DepartmentBase(BaseModel):
    """Base department schema with common attributes."""

    name: str = Field(
        ...,
        max_length=100,
        description="Unique name of the organizational department",
    )
    description: Optional[str] = Field(
        None,
        description="Optional detailed description of department activities",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if v is None:
            raise ValueError("Department name is required")
        stripped = v.strip()
        if not stripped:
            raise ValueError("Department name cannot be empty or whitespace only")
        if len(stripped) > 100:
            raise ValueError("Department name cannot exceed 100 characters")
        return stripped


class DepartmentCreate(DepartmentBase):
    """Schema for creating a new department."""

    pass


class DepartmentUpdate(BaseModel):
    """Schema for updating department details."""

    name: Optional[str] = Field(
        None,
        max_length=100,
        description="Updated department name (unique)",
    )
    description: Optional[str] = Field(
        None,
        description="Updated department description",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError("Department name cannot be empty or whitespace only")
            if len(stripped) > 100:
                raise ValueError("Department name cannot exceed 100 characters")
            return stripped
        return v


class DepartmentResponse(DepartmentBase):
    """Schema for serialized department response."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
