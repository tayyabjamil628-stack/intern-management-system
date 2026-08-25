from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.project import ProjectStatus
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.services.project import project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get(
    "",
    response_model=List[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="List all projects",
)
def list_projects(
    search: Optional[str] = Query(
        None,
        description="Filter projects by matching name or description substring",
    ),
    intern_id: Optional[int] = Query(
        None,
        description="Filter projects assigned to a specific intern ID",
    ),
    status_filter: Optional[ProjectStatus] = Query(
        None,
        alias="status",
        description="Filter projects by workflow status (NOT_STARTED, IN_PROGRESS, COMPLETED, ON_HOLD)",
    ),
    db: Session = Depends(get_db),
) -> List[ProjectResponse]:
    """Retrieve all projects with optional search, intern assignment, and status filters."""
    return project_service.list_projects(
        db,
        search=search,
        intern_id=intern_id,
        status_filter=status_filter,
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Get project by ID",
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Retrieve detailed information for a single project."""
    return project_service.get_project_by_id(db, project_id=project_id)


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new project",
)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Create a new project assigned to an existing intern."""
    return project_service.create_project(db, project_in=project_in)


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Update project",
)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Update details, progress, or status of an existing project."""
    return project_service.update_project(
        db, project_id=project_id, project_in=project_in
    )


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete project",
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete a project record by its ID."""
    project_service.delete_project(db, project_id=project_id)
    return None
