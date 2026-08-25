import enum
from datetime import date, datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.project import Project
    from app.models.attendance import Attendance


class InternStatus(str, enum.Enum):
    """Enumeration of valid intern lifecycle statuses."""

    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    TERMINATED = "TERMINATED"


class Intern(Base):
    """Intern entity model representing an enrolled intern."""

    __tablename__ = "interns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    intern_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    department_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("departments.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    university: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[InternStatus] = mapped_column(
        Enum(InternStatus, name="intern_status_enum", native_enum=False, length=20),
        default=InternStatus.ACTIVE,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    department: Mapped["Department"] = relationship("Department", back_populates="interns")
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="intern")
    attendance_records: Mapped[List["Attendance"]] = relationship(
        "Attendance", back_populates="intern"
    )

    def __repr__(self) -> str:
        return f"<Intern(id={self.id}, intern_id='{self.intern_id}', full_name='{self.full_name}', status='{self.status}')>"
