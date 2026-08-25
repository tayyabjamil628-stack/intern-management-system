from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.department import Department
from app.repositories.department import DepartmentRepository, department_repository
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class DepartmentService:
    """Service handling business and domain validation for Departments."""

    def __init__(self, repo: DepartmentRepository = department_repository):
        self.repo = repo

    def list_departments(
        self, db: Session, search: Optional[str] = None
    ) -> List[Department]:
        """List departments with optional name search."""
        return self.repo.get_all(db, search=search)

    def get_department_by_id(self, db: Session, department_id: int) -> Department:
        """Get department by ID or raise 404 Not Found."""
        dept = self.repo.get_by_id(db, department_id=department_id)
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with ID {department_id} not found",
            )
        return dept

    def create_department(
        self, db: Session, department_in: DepartmentCreate
    ) -> Department:
        """Create a department ensuring name uniqueness or raise 409 Conflict."""
        existing = self.repo.get_by_name(db, name=department_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Department with name '{department_in.name}' already exists",
            )
        try:
            return self.repo.create(db, department_in=department_in)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Department with name '{department_in.name}' already exists",
            )

    def update_department(
        self, db: Session, department_id: int, department_in: DepartmentUpdate
    ) -> Department:
        """Update an existing department ensuring name uniqueness if modified."""
        dept = self.get_department_by_id(db, department_id=department_id)

        if department_in.name is not None and department_in.name.strip() != dept.name:
            existing = self.repo.get_by_name(db, name=department_in.name)
            if existing and existing.id != department_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Department with name '{department_in.name}' already exists",
                )

        try:
            return self.repo.update(db, db_department=dept, department_in=department_in)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Department with name '{department_in.name}' already exists",
            )

    def delete_department(self, db: Session, department_id: int) -> None:
        """Delete department by ID or raise 404."""
        dept = self.get_department_by_id(db, department_id=department_id)
        try:
            self.repo.delete(db, db_department=dept)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot delete department '{dept.name}' because it has assigned interns or dependencies.",
            )


department_service = DepartmentService()
