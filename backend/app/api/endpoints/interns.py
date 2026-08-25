from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.intern import InternStatus
from app.schemas.intern import (
    InternCreate,
    InternResponse,
    InternUpdate,
)
from app.services.intern import intern_service

router = APIRouter(prefix="/interns", tags=["Interns"])


@router.get(
    "",
    response_model=List[InternResponse],
    status_code=status.HTTP_200_OK,
    summary="List all interns",
)
def list_interns(
    search: Optional[str] = Query(
        None,
        description="Search across full name, intern ID, or email address",
    ),
    department_id: Optional[int] = Query(
        None,
        description="Filter by assigned department ID",
    ),
    status_filter: Optional[InternStatus] = Query(
        None,
        alias="status",
        description="Filter by intern lifecycle status (ACTIVE, COMPLETED, TERMINATED)",
    ),
    db: Session = Depends(get_db),
) -> List[InternResponse]:
    """Retrieve a list of interns, with optional text search, department, and status filters."""
    return intern_service.list_interns(
        db,
        search=search,
        department_id=department_id,
        status_filter=status_filter,
    )


@router.get(
    "/{intern_id}",
    response_model=InternResponse,
    status_code=status.HTTP_200_OK,
    summary="Get intern by ID",
)
def get_intern(
    intern_id: int,
    db: Session = Depends(get_db),
) -> InternResponse:
    """Retrieve detailed profile information for a single intern."""
    return intern_service.get_intern_by_id(db, intern_id=intern_id)


@router.post(
    "",
    response_model=InternResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new intern",
)
def create_intern(
    intern_in: InternCreate,
    db: Session = Depends(get_db),
) -> InternResponse:
    """Enroll a new intern record in the system."""
    return intern_service.create_intern(db, intern_in=intern_in)


@router.put(
    "/{intern_id}",
    response_model=InternResponse,
    status_code=status.HTTP_200_OK,
    summary="Update intern",
)
def update_intern(
    intern_id: int,
    intern_in: InternUpdate,
    db: Session = Depends(get_db),
) -> InternResponse:
    """Update profile and lifecycle attributes of an existing intern."""
    return intern_service.update_intern(
        db, intern_id=intern_id, intern_in=intern_in
    )


@router.delete(
    "/{intern_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete intern",
)
def delete_intern(
    intern_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete an intern record from the database."""
    intern_service.delete_intern(db, intern_id=intern_id)
    return None
