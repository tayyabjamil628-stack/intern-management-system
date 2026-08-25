from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.intern import Intern, InternStatus
from app.repositories.department import DepartmentRepository, department_repository
from app.repositories.intern import InternRepository, intern_repository
from app.schemas.intern import InternCreate, InternUpdate


class InternService:
    """Service handling business logic and validations for Interns."""

    def __init__(
        self,
        repo: InternRepository = intern_repository,
        dept_repo: DepartmentRepository = department_repository,
    ):
        self.repo = repo
        self.dept_repo = dept_repo

    def list_interns(
        self,
        db: Session,
        search: Optional[str] = None,
        department_id: Optional[int] = None,
        status_filter: Optional[InternStatus] = None,
    ) -> List[Intern]:
        """Fetch list of interns with optional filtering."""
        return self.repo.get_all(
            db, search=search, department_id=department_id, status=status_filter
        )

    def get_intern_by_id(self, db: Session, intern_id: int) -> Intern:
        """Fetch single intern by primary key ID or raise 404."""
        intern = self.repo.get_by_id(db, intern_id=intern_id)
        if not intern:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Intern with ID {intern_id} not found",
            )
        return intern

    def create_intern(self, db: Session, intern_in: InternCreate) -> Intern:
        """Create a new intern enforcing department existence and unique constraints."""
        # 1. Verify assigned department exists
        dept = self.dept_repo.get_by_id(db, department_id=intern_in.department_id)
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with ID {intern_in.department_id} not found",
            )

        # 2. Check duplicate intern_id
        existing_code = self.repo.get_by_intern_id(db, intern_id_code=intern_in.intern_id)
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Intern with intern_id '{intern_in.intern_id}' already exists",
            )

        # 3. Check duplicate email
        existing_email = self.repo.get_by_email(db, email=intern_in.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Intern with email '{intern_in.email}' already exists",
            )

        # 4. Check date validity
        if intern_in.end_date < intern_in.start_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="end_date cannot be earlier than start_date",
            )

        try:
            return self.repo.create(db, intern_in=intern_in)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Intern with this identifier or email already exists",
            )

    def update_intern(
        self, db: Session, intern_id: int, intern_in: InternUpdate
    ) -> Intern:
        """Update an existing intern record."""
        # 1. Fetch existing intern
        intern = self.get_intern_by_id(db, intern_id=intern_id)

        # 2. If department_id changed, verify target department exists
        if (
            intern_in.department_id is not None
            and intern_in.department_id != intern.department_id
        ):
            dept = self.dept_repo.get_by_id(db, department_id=intern_in.department_id)
            if not dept:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Department with ID {intern_in.department_id} not found",
                )

        # 3. If intern_id changed, check uniqueness
        if (
            intern_in.intern_id is not None
            and intern_in.intern_id.strip() != intern.intern_id
        ):
            existing_code = self.repo.get_by_intern_id(
                db, intern_id_code=intern_in.intern_id
            )
            if existing_code and existing_code.id != intern_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Intern with intern_id '{intern_in.intern_id}' already exists",
                )

        # 4. If email changed, check uniqueness
        if intern_in.email is not None and intern_in.email.strip().lower() != intern.email:
            existing_email = self.repo.get_by_email(db, email=intern_in.email)
            if existing_email and existing_email.id != intern_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Intern with email '{intern_in.email}' already exists",
                )

        # 5. Check effective start_date vs end_date
        effective_start = (
            intern_in.start_date if intern_in.start_date is not None else intern.start_date
        )
        effective_end = (
            intern_in.end_date if intern_in.end_date is not None else intern.end_date
        )
        if effective_end < effective_start:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="end_date cannot be earlier than start_date",
            )

        try:
            return self.repo.update(db, db_intern=intern, intern_in=intern_in)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Intern with this identifier or email already exists",
            )

    def delete_intern(self, db: Session, intern_id: int) -> None:
        """Delete intern by ID or raise 404."""
        intern = self.get_intern_by_id(db, intern_id=intern_id)
        try:
            self.repo.delete(db, db_intern=intern)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot delete intern '{intern.full_name}' because associated projects or attendance records exist.",
            )


intern_service = InternService()
