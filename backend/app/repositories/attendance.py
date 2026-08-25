from datetime import date
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.attendance import Attendance, AttendanceStatus
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate


class AttendanceRepository:
    """Repository handling database operations for Attendance records."""

    def get_all(
        self,
        db: Session,
        intern_id: Optional[int] = None,
        status: Optional[AttendanceStatus] = None,
        attendance_date: Optional[date] = None,
    ) -> List[Attendance]:
        """Fetch attendance records ordered by date descending, then id descending."""
        query = select(Attendance).order_by(
            Attendance.attendance_date.desc(), Attendance.id.desc()
        )

        if intern_id is not None:
            query = query.where(Attendance.intern_id == intern_id)

        if status is not None:
            query = query.where(Attendance.status == status)

        if attendance_date is not None:
            query = query.where(Attendance.attendance_date == attendance_date)

        return list(db.scalars(query).all())

    def get_by_id(self, db: Session, attendance_id: int) -> Optional[Attendance]:
        """Fetch an attendance record by primary key ID."""
        return db.scalar(select(Attendance).where(Attendance.id == attendance_id))

    def get_by_intern_and_date(
        self, db: Session, intern_id: int, attendance_date: date
    ) -> Optional[Attendance]:
        """Fetch attendance record for a specific intern and date."""
        return db.scalar(
            select(Attendance).where(
                Attendance.intern_id == intern_id,
                Attendance.attendance_date == attendance_date,
            )
        )

    def create(self, db: Session, attendance_in: AttendanceCreate) -> Attendance:
        """Insert a new attendance record."""
        db_attendance = Attendance(
            intern_id=attendance_in.intern_id,
            attendance_date=attendance_in.attendance_date,
            status=attendance_in.status,
            remarks=attendance_in.remarks.strip() if attendance_in.remarks else None,
        )
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        return db_attendance

    def update(
        self, db: Session, db_attendance: Attendance, attendance_in: AttendanceUpdate
    ) -> Attendance:
        """Update fields of an existing attendance record."""
        update_data = attendance_in.model_dump(exclude_unset=True)

        if "intern_id" in update_data and update_data["intern_id"] is not None:
            db_attendance.intern_id = update_data["intern_id"]
        if "attendance_date" in update_data and update_data["attendance_date"] is not None:
            db_attendance.attendance_date = update_data["attendance_date"]
        if "status" in update_data and update_data["status"] is not None:
            db_attendance.status = update_data["status"]
        if "remarks" in update_data:
            db_attendance.remarks = (
                update_data["remarks"].strip() if update_data["remarks"] else None
            )

        db.commit()
        db.refresh(db_attendance)
        return db_attendance

    def delete(self, db: Session, db_attendance: Attendance) -> None:
        """Delete an attendance record from the database."""
        db.delete(db_attendance)
        db.commit()


attendance_repository = AttendanceRepository()
