"""create_attendance_table

Revision ID: d4f3a8b7c5e4
Revises: c3e2f9a6b4d3
Create Date: 2026-08-16 21:43:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d4f3a8b7c5e4"
down_revision: Union[str, None] = "c3e2f9a6b4d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "attendance",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("intern_id", sa.Integer(), nullable=False),
        sa.Column("attendance_date", sa.Date(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "PRESENT",
                "ABSENT",
                "LEAVE",
                name="attendance_status_enum",
                native_enum=False,
                length=20,
            ),
            nullable=False,
        ),
        sa.Column("remarks", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["intern_id"], ["interns.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("intern_id", "attendance_date", name="uq_attendance_intern_date"),
    )
    op.create_index("ix_attendance_intern_id", "attendance", ["intern_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_attendance_intern_id", table_name="attendance")
    op.drop_table("attendance")
