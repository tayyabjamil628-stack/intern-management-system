from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
from app.models.intern import InternStatus


class InternBase(BaseModel):
    """Base schema for Intern attributes."""

    intern_id: str = Field(
        ...,
        max_length=50,
        description="Unique organizational identifier (e.g. INT-2026-001)",
    )
    full_name: str = Field(
        ...,
        max_length=150,
        description="Full name of the intern",
    )
    email: EmailStr = Field(
        ...,
        max_length=150,
        description="Unique email address",
    )
    phone: Optional[str] = Field(
        None,
        max_length=20,
        description="Optional contact telephone number",
    )
    department_id: int = Field(
        ...,
        description="ID of the assigned organizational department",
    )
    role: str = Field(
        ...,
        max_length=100,
        description="Assigned role / title (e.g. Frontend Engineering Intern)",
    )
    university: Optional[str] = Field(
        None,
        max_length=150,
        description="Optional affiliated educational institution",
    )
    start_date: date = Field(
        ...,
        description="Internship start date",
    )
    end_date: date = Field(
        ...,
        description="Internship conclusion date",
    )
    status: InternStatus = Field(
        default=InternStatus.ACTIVE,
        description="Current lifecycle status of the intern",
    )

    @field_validator("intern_id", "full_name", "role")
    @classmethod
    def validate_non_empty_strings(cls, v: str) -> str:
        if v is None:
            raise ValueError("Field cannot be empty")
        stripped = v.strip()
        if not stripped:
            raise ValueError("Field cannot be empty or whitespace only")
        return stripped

    @field_validator("phone", "university")
    @classmethod
    def validate_optional_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            return stripped if stripped else None
        return v

    @model_validator(mode="after")
    def validate_date_range(self) -> "InternBase":
        if self.start_date and self.end_date:
            if self.end_date < self.start_date:
                raise ValueError("end_date cannot be earlier than start_date")
        return self


class InternCreate(InternBase):
    """Schema for enrolling/creating a new intern."""

    pass


class InternUpdate(BaseModel):
    """Schema for modifying existing intern records."""

    intern_id: Optional[str] = Field(
        None,
        max_length=50,
        description="Unique organizational identifier",
    )
    full_name: Optional[str] = Field(
        None,
        max_length=150,
        description="Full name of the intern",
    )
    email: Optional[EmailStr] = Field(
        None,
        max_length=150,
        description="Unique email address",
    )
    phone: Optional[str] = Field(
        None,
        max_length=20,
        description="Contact telephone number",
    )
    department_id: Optional[int] = Field(
        None,
        description="ID of the assigned department",
    )
    role: Optional[str] = Field(
        None,
        max_length=100,
        description="Assigned role / title",
    )
    university: Optional[str] = Field(
        None,
        max_length=150,
        description="Affiliated educational institution",
    )
    start_date: Optional[date] = Field(
        None,
        description="Internship start date",
    )
    end_date: Optional[date] = Field(
        None,
        description="Internship conclusion date",
    )
    status: Optional[InternStatus] = Field(
        None,
        description="Lifecycle status",
    )

    @field_validator("intern_id", "full_name", "role")
    @classmethod
    def validate_optional_non_empty_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError("Field cannot be empty or whitespace only")
            return stripped
        return v

    @field_validator("phone", "university")
    @classmethod
    def validate_optional_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            return stripped if stripped else None
        return v

    @model_validator(mode="after")
    def validate_date_range(self) -> "InternUpdate":
        if self.start_date is not None and self.end_date is not None:
            if self.end_date < self.start_date:
                raise ValueError("end_date cannot be earlier than start_date")
        return self


class InternResponse(InternBase):
    """Schema for serialized intern response."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
