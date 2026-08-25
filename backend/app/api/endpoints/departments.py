from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)
from app.services.department import department_service

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get(
    "",
    response_model=List[DepartmentResponse],
    status_code=status.HTTP_200_OK,
    summary="List all departments",
)
def list_departments(
    search: Optional[str] = Query(None, description="Filter by department name"),
    db: Session = Depends(get_db),
) -> List[DepartmentResponse]:
    """Retrieve a list of all departments, optionally filtered by name."""
    return department_service.list_departments(db, search=search)


@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get department by ID",
)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
) -> DepartmentResponse:
    """Retrieve detailed information for a single department."""
    return department_service.get_department_by_id(db, department_id=department_id)


@router.post(
    "",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new department",
)
def create_department(
    department_in: DepartmentCreate,
    db: Session = Depends(get_db),
) -> DepartmentResponse:
    """Create a new organizational department."""
    return department_service.create_department(db, department_in=department_in)


@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update department",
)
def update_department(
    department_id: int,
    department_in: DepartmentUpdate,
    db: Session = Depends(get_db),
) -> DepartmentResponse:
    """Update details of an existing department."""
    return department_service.update_department(
        db, department_id=department_id, department_in=department_in
    )


@router.delete(
    "/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete department",
)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete a department by its ID."""
    department_service.delete_department(db, department_id=department_id)
    return None
