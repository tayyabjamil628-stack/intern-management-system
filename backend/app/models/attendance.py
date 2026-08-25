import enum
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.intern import Intern


class AttendanceStatus(str, enum.Enum):
    """Enumeration of valid attendance record statuses."""

    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LEAVE = "LEAVE"


class Attendance(Base):
    """Attendance entity model representing daily attendance logs for interns."""

    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint(
            "intern_id",
            "attendance_date",
            name="uq_attendance_intern_date",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    intern_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("interns.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    attendance_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[AttendanceStatus] = mapped_column(
        Enum(
            AttendanceStatus,
            name="attendance_status_enum",
            native_enum=False,
            length=20,
        ),
        nullable=False,
    )
    remarks: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    intern: Mapped["Intern"] = relationship("Intern", back_populates="attendance_records")

    def __repr__(self) -> str:
        return (
            f"<Attendance(id={self.id}, intern_id={self.intern_id}, "
            f"attendance_date='{self.attendance_date}', status='{self.status}')>"
        )
