"""add notes column to user_platforms table

Revision ID: 004_add_notes_to_user_platforms
Revises: 003_create_credit_usage_logs_table
Create Date: 2026-08-05

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_add_notes_to_user_platforms'
down_revision = '003_create_credit_usage_logs_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    try:
        op.add_column('user_platforms', sa.Column('notes', sa.Text(), nullable=True))
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.drop_column('user_platforms', 'notes')
    except Exception:
        pass
