"""create_projects_table

Revision ID: c3e2f9a6b4d3
Revises: b2d1e8f5a3c2
Create Date: 2026-08-16 21:41:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3e2f9a6b4d3"
down_revision: Union[str, None] = "b2d1e8f5a3c2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("intern_id", sa.Integer(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("deadline", sa.Date(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "NOT_STARTED",
                "IN_PROGRESS",
                "COMPLETED",
                "ON_HOLD",
                name="project_status_enum",
                native_enum=False,
                length=20,
            ),
            server_default="NOT_STARTED",
            nullable=False,
        ),
        sa.Column("progress", sa.Integer(), server_default="0", nullable=False),
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
        sa.CheckConstraint(
            "progress >= 0 AND progress <= 100",
            name="check_project_progress_range",
        ),
        sa.ForeignKeyConstraint(["intern_id"], ["interns.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_projects_intern_id", "projects", ["intern_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_projects_intern_id", table_name="projects")
    op.drop_table("projects")
