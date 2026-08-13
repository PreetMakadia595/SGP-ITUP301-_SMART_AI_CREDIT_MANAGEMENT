"""create user_platforms table

Revision ID: 002_create_user_platforms_table
Revises: 001_create_users_table
Create Date: 2026-07-31

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_create_user_platforms_table'
down_revision = '001_create_users_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'user_platforms',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('platform_name', sa.String(length=50), nullable=False),
        sa.Column('subscription_plan', sa.String(length=50), nullable=False, server_default='Pro'),
        sa.Column('monthly_credits', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('remaining_credits', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('renewal_date', sa.String(length=50), nullable=False),
        sa.Column('monthly_cost', sa.Float(), nullable=False, server_default='20.0'),
        sa.Column('encrypted_api_key', sa.String(length=512), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index(op.f('ix_user_platforms_id'), 'user_platforms', ['id'], unique=False)
    op.create_index(op.f('ix_user_platforms_user_id'), 'user_platforms', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_platforms_user_id'), table_name='user_platforms')
    op.drop_index(op.f('ix_user_platforms_id'), table_name='user_platforms')
    op.drop_table('user_platforms')
