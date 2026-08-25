from datetime import date
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.attendance import Attendance, AttendanceStatus
from app.repositories.attendance import AttendanceRepository, attendance_repository
from app.repositories.intern import InternRepository, intern_repository
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate


class AttendanceService:
    """Service handling business logic and validations for Attendance."""

    def __init__(
        self,
        repo: AttendanceRepository = attendance_repository,
        intern_repo: InternRepository = intern_repository,
    ):
        self.repo = repo
        self.intern_repo = intern_repo

    def list_attendance(
        self,
        db: Session,
        intern_id: Optional[int] = None,
        status_filter: Optional[AttendanceStatus] = None,
        attendance_date: Optional[date] = None,
    ) -> List[Attendance]:
        """Fetch attendance records matching optional filter criteria."""
        return self.repo.get_all(
            db,
            intern_id=intern_id,
            status=status_filter,
            attendance_date=attendance_date,
        )

    def get_attendance_by_id(self, db: Session, attendance_id: int) -> Attendance:
        """Fetch a single attendance record by primary key ID or raise 404."""
        record = self.repo.get_by_id(db, attendance_id=attendance_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attendance record with ID {attendance_id} not found",
            )
        return record

    def create_attendance(
        self, db: Session, attendance_in: AttendanceCreate
    ) -> Attendance:
        """Create a new daily attendance record for an intern."""
        # 1. Verify target intern exists
        intern = self.intern_repo.get_by_id(db, intern_id=attendance_in.intern_id)
        if not intern:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Intern with ID {attendance_in.intern_id} not found",
            )

        # 2. Check for duplicate intern + date record
        existing = self.repo.get_by_intern_and_date(
            db,
            intern_id=attendance_in.intern_id,
            attendance_date=attendance_in.attendance_date,
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Attendance for this intern is already recorded for this date.",
            )

        try:
            return self.repo.create(db, attendance_in=attendance_in)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Attendance for this intern is already recorded for this date.",
            )

    def update_attendance(
        self, db: Session, attendance_id: int, attendance_in: AttendanceUpdate
    ) -> Attendance:
        """Update an existing attendance record."""
        # 1. Verify record exists
        record = self.get_attendance_by_id(db, attendance_id=attendance_id)

        # Determine effective intern_id and date
        effective_intern_id = (
            attendance_in.intern_id
            if attendance_in.intern_id is not None
            else record.intern_id
        )
        effective_date = (
            attendance_in.attendance_date
            if attendance_in.attendance_date is not None
            else record.attendance_date
        )

        # 2. If intern_id changed, verify target intern exists
        if (
            attendance_in.intern_id is not None
            and attendance_in.intern_id != record.intern_id
        ):
            intern = self.intern_repo.get_by_id(db, intern_id=attendance_in.intern_id)
            if not intern:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Intern with ID {attendance_in.intern_id} not found",
                )

        # 3. If intern_id or date changed, check for conflict with other records
        if (
            effective_intern_id != record.intern_id
            or effective_date != record.attendance_date
        ):
            existing = self.repo.get_by_intern_and_date(
                db,
                intern_id=effective_intern_id,
                attendance_date=effective_date,
            )
            if existing and existing.id != attendance_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Attendance for this intern is already recorded for this date.",
                )

        try:
            return self.repo.update(
                db, db_attendance=record, attendance_in=attendance_in
            )
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Attendance for this intern is already recorded for this date.",
            )

    def delete_attendance(self, db: Session, attendance_id: int) -> None:
        """Delete an attendance record by ID or raise 404."""
        record = self.get_attendance_by_id(db, attendance_id=attendance_id)
        self.repo.delete(db, db_attendance=record)


attendance_service = AttendanceService()
