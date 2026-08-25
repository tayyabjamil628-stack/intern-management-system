from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.attendance import AttendanceStatus


class AttendanceBase(BaseModel):
    """Base schema for attendance attributes."""

    intern_id: int = Field(
        ...,
        description="ID of the intern whose attendance is logged",
    )
    attendance_date: date = Field(
        ...,
        description="Date of the attendance record",
    )
    status: AttendanceStatus = Field(
        ...,
        description="Attendance status: PRESENT, ABSENT, or LEAVE",
    )
    remarks: Optional[str] = Field(
        None,
        max_length=255,
        description="Optional remarks or notes",
    )

    @field_validator("remarks")
    @classmethod
    def validate_optional_remarks(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            return stripped if stripped else None
        return v


class AttendanceCreate(AttendanceBase):
    """Schema for creating a new attendance record."""

    pass


class AttendanceUpdate(BaseModel):
    """Schema for updating an existing attendance record."""

    intern_id: Optional[int] = Field(
        None,
        description="ID of the intern",
    )
    attendance_date: Optional[date] = Field(
        None,
        description="Date of the attendance record",
    )
    status: Optional[AttendanceStatus] = Field(
        None,
        description="Attendance status",
    )
    remarks: Optional[str] = Field(
        None,
        max_length=255,
        description="Remarks or notes",
    )

    @field_validator("remarks")
    @classmethod
    def validate_optional_remarks(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            return stripped if stripped else None
        return v


class AttendanceResponse(AttendanceBase):
    """Schema for serialized attendance response."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
