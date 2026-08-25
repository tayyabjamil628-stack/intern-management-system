from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.attendance import AttendanceStatus
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceUpdate,
)
from app.services.attendance import attendance_service

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get(
    "",
    response_model=List[AttendanceResponse],
    status_code=status.HTTP_200_OK,
    summary="List attendance logs",
)
def list_attendance(
    intern_id: Optional[int] = Query(
        None,
        description="Filter attendance logs by intern ID",
    ),
    status_filter: Optional[AttendanceStatus] = Query(
        None,
        alias="status",
        description="Filter attendance logs by status (PRESENT, ABSENT, LEAVE)",
    ),
    attendance_date: Optional[date] = Query(
        None,
        alias="date",
        description="Filter attendance logs for a specific calendar date (YYYY-MM-DD)",
    ),
    db: Session = Depends(get_db),
) -> List[AttendanceResponse]:
    """Retrieve attendance logs with optional filtering by intern, status, and date."""
    return attendance_service.list_attendance(
        db,
        intern_id=intern_id,
        status_filter=status_filter,
        attendance_date=attendance_date,
    )


@router.get(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get attendance record by ID",
)
def get_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
) -> AttendanceResponse:
    """Retrieve details of a single attendance record by its ID."""
    return attendance_service.get_attendance_by_id(db, attendance_id=attendance_id)


@router.post(
    "",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record intern attendance",
)
def create_attendance(
    attendance_in: AttendanceCreate,
    db: Session = Depends(get_db),
) -> AttendanceResponse:
    """Log a new attendance entry for an intern."""
    return attendance_service.create_attendance(db, attendance_in=attendance_in)


@router.put(
    "/{attendance_id}",
    response_model=AttendanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Update attendance record",
)
def update_attendance(
    attendance_id: int,
    attendance_in: AttendanceUpdate,
    db: Session = Depends(get_db),
) -> AttendanceResponse:
    """Update status, date, or remarks of an existing attendance record."""
    return attendance_service.update_attendance(
        db, attendance_id=attendance_id, attendance_in=attendance_in
    )


@router.delete(
    "/{attendance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete attendance record",
)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete an attendance record from the system."""
    attendance_service.delete_attendance(db, attendance_id=attendance_id)
    return None
