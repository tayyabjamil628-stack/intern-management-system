"""create_interns_table

Revision ID: b2d1e8f5a3c2
Revises: a1c0d9f4e2b1
Create Date: 2026-08-16 21:38:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b2d1e8f5a3c2"
down_revision: Union[str, None] = "a1c0d9f4e2b1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "interns",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("intern_id", sa.String(length=50), nullable=False),
        sa.Column("full_name", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=150), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("department_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=100), nullable=False),
        sa.Column("university", sa.String(length=150), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("ACTIVE", "COMPLETED", "TERMINATED", name="intern_status_enum", native_enum=False, length=20),
            server_default="ACTIVE",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("intern_id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_interns_department_id", "interns", ["department_id"], unique=False)
    op.create_index("ix_interns_intern_id", "interns", ["intern_id"], unique=True)
    op.create_index("ix_interns_email", "interns", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_interns_email", table_name="interns")
    op.drop_index("ix_interns_intern_id", table_name="interns")
    op.drop_index("ix_interns_department_id", table_name="interns")
    op.drop_table("interns")
