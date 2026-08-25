from typing import List, Optional
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from app.models.intern import Intern, InternStatus
from app.schemas.intern import InternCreate, InternUpdate


class InternRepository:
    """Repository handling database operations for Intern model."""

    def get_all(
        self,
        db: Session,
        search: Optional[str] = None,
        department_id: Optional[int] = None,
        status: Optional[InternStatus] = None,
    ) -> List[Intern]:
        """Fetch interns with optional filtering by search, department_id, and status."""
        query = select(Intern).order_by(Intern.id.asc())

        if department_id is not None:
            query = query.where(Intern.department_id == department_id)

        if status is not None:
            query = query.where(Intern.status == status)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Intern.full_name.ilike(search_pattern),
                    Intern.intern_id.ilike(search_pattern),
                    Intern.email.ilike(search_pattern),
                )
            )

        return list(db.scalars(query).all())

    def get_by_id(self, db: Session, intern_id: int) -> Optional[Intern]:
        """Fetch an intern by primary key ID."""
        return db.scalar(select(Intern).where(Intern.id == intern_id))

    def get_by_intern_id(self, db: Session, intern_id_code: str) -> Optional[Intern]:
        """Fetch an intern by unique organizational code (e.g. INT-2026-001)."""
        return db.scalar(select(Intern).where(Intern.intern_id == intern_id_code.strip()))

    def get_by_email(self, db: Session, email: str) -> Optional[Intern]:
        """Fetch an intern by unique email address."""
        return db.scalar(select(Intern).where(Intern.email == email.strip().lower()))

    def create(self, db: Session, intern_in: InternCreate) -> Intern:
        """Insert a new intern record."""
        db_intern = Intern(
            intern_id=intern_in.intern_id.strip(),
            full_name=intern_in.full_name.strip(),
            email=intern_in.email.strip().lower(),
            phone=intern_in.phone.strip() if intern_in.phone else None,
            department_id=intern_in.department_id,
            role=intern_in.role.strip(),
            university=intern_in.university.strip() if intern_in.university else None,
            start_date=intern_in.start_date,
            end_date=intern_in.end_date,
            status=intern_in.status,
        )
        db.add(db_intern)
        db.commit()
        db.refresh(db_intern)
        return db_intern

    def update(
        self, db: Session, db_intern: Intern, intern_in: InternUpdate
    ) -> Intern:
        """Update fields of an existing intern record."""
        update_data = intern_in.model_dump(exclude_unset=True)

        if "intern_id" in update_data and update_data["intern_id"] is not None:
            db_intern.intern_id = update_data["intern_id"].strip()
        if "full_name" in update_data and update_data["full_name"] is not None:
            db_intern.full_name = update_data["full_name"].strip()
        if "email" in update_data and update_data["email"] is not None:
            db_intern.email = update_data["email"].strip().lower()
        if "phone" in update_data:
            db_intern.phone = update_data["phone"].strip() if update_data["phone"] else None
        if "department_id" in update_data and update_data["department_id"] is not None:
            db_intern.department_id = update_data["department_id"]
        if "role" in update_data and update_data["role"] is not None:
            db_intern.role = update_data["role"].strip()
        if "university" in update_data:
            db_intern.university = (
                update_data["university"].strip() if update_data["university"] else None
            )
        if "start_date" in update_data and update_data["start_date"] is not None:
            db_intern.start_date = update_data["start_date"]
        if "end_date" in update_data and update_data["end_date"] is not None:
            db_intern.end_date = update_data["end_date"]
        if "status" in update_data and update_data["status"] is not None:
            db_intern.status = update_data["status"]

        db.commit()
        db.refresh(db_intern)
        return db_intern

    def delete(self, db: Session, db_intern: Intern) -> None:
        """Delete an intern record from the database."""
        db.delete(db_intern)
        db.commit()


intern_repository = InternRepository()
