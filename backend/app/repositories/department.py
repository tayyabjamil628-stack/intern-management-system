from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class DepartmentRepository:
    """Repository handling database operations for Department model."""

    def get_all(self, db: Session, search: Optional[str] = None) -> List[Department]:
        """Fetch all departments, optionally filtered by search term."""
        query = select(Department).order_by(Department.id.asc())
        if search:
            query = query.where(Department.name.ilike(f"%{search.strip()}%"))
        return list(db.scalars(query).all())

    def get_by_id(self, db: Session, department_id: int) -> Optional[Department]:
        """Fetch a department by its primary key ID."""
        return db.scalar(select(Department).where(Department.id == department_id))

    def get_by_name(self, db: Session, name: str) -> Optional[Department]:
        """Fetch a department by its unique name."""
        return db.scalar(select(Department).where(Department.name == name.strip()))

    def create(self, db: Session, department_in: DepartmentCreate) -> Department:
        """Insert a new department into the database."""
        db_dept = Department(
            name=department_in.name.strip(),
            description=department_in.description,
        )
        db.add(db_dept)
        db.commit()
        db.refresh(db_dept)
        return db_dept

    def update(
        self, db: Session, db_department: Department, department_in: DepartmentUpdate
    ) -> Department:
        """Update fields of an existing department record."""
        update_data = department_in.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] is not None:
            db_department.name = update_data["name"].strip()
        if "description" in update_data:
            db_department.description = update_data["description"]
        db.commit()
        db.refresh(db_department)
        return db_department

    def delete(self, db: Session, db_department: Department) -> None:
        """Delete a department record from the database."""
        db.delete(db_department)
        db.commit()


department_repository = DepartmentRepository()
