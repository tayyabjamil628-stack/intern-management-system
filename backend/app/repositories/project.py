from typing import List, Optional
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectRepository:
    """Repository handling database operations for Project model."""

    def get_all(
        self,
        db: Session,
        search: Optional[str] = None,
        intern_id: Optional[int] = None,
        status: Optional[ProjectStatus] = None,
    ) -> List[Project]:
        """Fetch all projects with optional filtering by search, intern_id, and status."""
        query = select(Project).order_by(Project.id.asc())

        if intern_id is not None:
            query = query.where(Project.intern_id == intern_id)

        if status is not None:
            query = query.where(Project.status == status)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Project.name.ilike(search_pattern),
                    Project.description.ilike(search_pattern),
                )
            )

        return list(db.scalars(query).all())

    def get_by_id(self, db: Session, project_id: int) -> Optional[Project]:
        """Fetch a project by its primary key ID."""
        return db.scalar(select(Project).where(Project.id == project_id))

    def create(self, db: Session, project_in: ProjectCreate) -> Project:
        """Insert a new project into the database."""
        db_project = Project(
            name=project_in.name.strip(),
            description=project_in.description.strip() if project_in.description else None,
            intern_id=project_in.intern_id,
            start_date=project_in.start_date,
            deadline=project_in.deadline,
            status=project_in.status,
            progress=100 if project_in.status == ProjectStatus.COMPLETED else project_in.progress,
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project

    def update(
        self, db: Session, db_project: Project, project_in: ProjectUpdate
    ) -> Project:
        """Update fields of an existing project record."""
        update_data = project_in.model_dump(exclude_unset=True)

        if "name" in update_data and update_data["name"] is not None:
            db_project.name = update_data["name"].strip()
        if "description" in update_data:
            db_project.description = (
                update_data["description"].strip() if update_data["description"] else None
            )
        if "intern_id" in update_data and update_data["intern_id"] is not None:
            db_project.intern_id = update_data["intern_id"]
        if "start_date" in update_data and update_data["start_date"] is not None:
            db_project.start_date = update_data["start_date"]
        if "deadline" in update_data and update_data["deadline"] is not None:
            db_project.deadline = update_data["deadline"]
        if "status" in update_data and update_data["status"] is not None:
            db_project.status = update_data["status"]
            if db_project.status == ProjectStatus.COMPLETED:
                db_project.progress = 100
        if "progress" in update_data and update_data["progress"] is not None:
            if db_project.status == ProjectStatus.COMPLETED:
                db_project.progress = 100
            else:
                db_project.progress = update_data["progress"]

        db.commit()
        db.refresh(db_project)
        return db_project

    def delete(self, db: Session, db_project: Project) -> None:
        """Delete a project record from the database."""
        db.delete(db_project)
        db.commit()


project_repository = ProjectRepository()
