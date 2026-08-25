from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.project import Project, ProjectStatus
from app.repositories.intern import InternRepository, intern_repository
from app.repositories.project import ProjectRepository, project_repository
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    """Service handling business logic and validations for Projects."""

    def __init__(
        self,
        repo: ProjectRepository = project_repository,
        intern_repo: InternRepository = intern_repository,
    ):
        self.repo = repo
        self.intern_repo = intern_repo

    def list_projects(
        self,
        db: Session,
        search: Optional[str] = None,
        intern_id: Optional[int] = None,
        status_filter: Optional[ProjectStatus] = None,
    ) -> List[Project]:
        """Fetch list of projects with optional search and filters."""
        return self.repo.get_all(
            db, search=search, intern_id=intern_id, status=status_filter
        )

    def get_project_by_id(self, db: Session, project_id: int) -> Project:
        """Fetch a single project by primary key ID or raise 404."""
        project = self.repo.get_by_id(db, project_id=project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} not found",
            )
        return project

    def create_project(self, db: Session, project_in: ProjectCreate) -> Project:
        """Create a new project ensuring intern existence and valid parameters."""
        # 1. Verify assigned intern exists
        intern = self.intern_repo.get_by_id(db, intern_id=project_in.intern_id)
        if not intern:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Intern with ID {project_in.intern_id} not found",
            )

        # 2. Verify date constraints
        if project_in.deadline < project_in.start_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="deadline cannot be earlier than start_date",
            )

        # 3. Verify progress constraints
        if project_in.progress < 0 or project_in.progress > 100:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="progress must be between 0 and 100",
            )

        # 4. Status COMPLETED normalizes progress to 100
        if project_in.status == ProjectStatus.COMPLETED:
            project_in.progress = 100

        try:
            return self.repo.create(db, project_in=project_in)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Database integrity constraint violation",
            )

    def update_project(
        self, db: Session, project_id: int, project_in: ProjectUpdate
    ) -> Project:
        """Update an existing project record."""
        # 1. Verify project exists
        project = self.get_project_by_id(db, project_id=project_id)

        # 2. If intern_id changed, verify new intern exists
        if project_in.intern_id is not None and project_in.intern_id != project.intern_id:
            intern = self.intern_repo.get_by_id(db, intern_id=project_in.intern_id)
            if not intern:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Intern with ID {project_in.intern_id} not found",
                )

        # 3. Verify date constraints
        effective_start = (
            project_in.start_date if project_in.start_date is not None else project.start_date
        )
        effective_deadline = (
            project_in.deadline if project_in.deadline is not None else project.deadline
        )
        if effective_deadline < effective_start:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="deadline cannot be earlier than start_date",
            )

        # 4. Verify progress constraints
        if project_in.progress is not None:
            if project_in.progress < 0 or project_in.progress > 100:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="progress must be between 0 and 100",
                )

        # 5. Normalization for COMPLETED
        effective_status = (
            project_in.status if project_in.status is not None else project.status
        )
        if effective_status == ProjectStatus.COMPLETED:
            project_in.progress = 100

        try:
            return self.repo.update(db, db_project=project, project_in=project_in)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Database integrity constraint violation",
            )

    def delete_project(self, db: Session, project_id: int) -> None:
        """Delete project by ID or raise 404."""
        project = self.get_project_by_id(db, project_id=project_id)
        try:
            self.repo.delete(db, db_project=project)
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete project due to existing database dependencies",
            )


project_service = ProjectService()
