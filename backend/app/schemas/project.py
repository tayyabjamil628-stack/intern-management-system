from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.models.project import ProjectStatus


class ProjectBase(BaseModel):
    """Base schema for Project attributes."""

    name: str = Field(
        ...,
        max_length=150,
        description="Name or title of the project",
    )
    description: Optional[str] = Field(
        None,
        description="Detailed description of project objectives and scope",
    )
    intern_id: int = Field(
        ...,
        description="ID of the intern assigned to this project",
    )
    start_date: date = Field(
        ...,
        description="Project kickoff date",
    )
    deadline: date = Field(
        ...,
        description="Project deadline / completion target date",
    )
    status: ProjectStatus = Field(
        default=ProjectStatus.NOT_STARTED,
        description="Current workflow status of the project",
    )
    progress: int = Field(
        default=0,
        ge=0,
        le=100,
        description="Completion percentage between 0 and 100",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if v is None:
            raise ValueError("Project name is required")
        stripped = v.strip()
        if not stripped:
            raise ValueError("Project name cannot be empty or whitespace only")
        if len(stripped) > 150:
            raise ValueError("Project name cannot exceed 150 characters")
        return stripped

    @field_validator("description")
    @classmethod
    def validate_optional_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            return stripped if stripped else None
        return v

    @model_validator(mode="after")
    def validate_project_rules(self) -> "ProjectBase":
        if self.start_date and self.deadline:
            if self.deadline < self.start_date:
                raise ValueError("deadline cannot be earlier than start_date")
        if self.status == ProjectStatus.COMPLETED:
            self.progress = 100
        return self


class ProjectCreate(ProjectBase):
    """Schema for creating/assigning a new project."""

    pass


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project."""

    name: Optional[str] = Field(
        None,
        max_length=150,
        description="Project name or title",
    )
    description: Optional[str] = Field(
        None,
        description="Project description",
    )
    intern_id: Optional[int] = Field(
        None,
        description="ID of the intern assigned to this project",
    )
    start_date: Optional[date] = Field(
        None,
        description="Project start date",
    )
    deadline: Optional[date] = Field(
        None,
        description="Project deadline",
    )
    status: Optional[ProjectStatus] = Field(
        None,
        description="Workflow status",
    )
    progress: Optional[int] = Field(
        None,
        ge=0,
        le=100,
        description="Completion percentage between 0 and 100",
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError("Project name cannot be empty or whitespace only")
            if len(stripped) > 150:
                raise ValueError("Project name cannot exceed 150 characters")
            return stripped
        return v

    @field_validator("description")
    @classmethod
    def validate_optional_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            return stripped if stripped else None
        return v

    @model_validator(mode="after")
    def validate_project_update_rules(self) -> "ProjectUpdate":
        if self.start_date is not None and self.deadline is not None:
            if self.deadline < self.start_date:
                raise ValueError("deadline cannot be earlier than start_date")
        if self.status == ProjectStatus.COMPLETED:
            self.progress = 100
        return self


class ProjectResponse(ProjectBase):
    """Schema for serialized project response."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
