"""create credit_usage_logs table

Revision ID: 003_create_credit_usage_logs_table
Revises: 002_create_user_platforms_table
Create Date: 2026-07-31

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_create_credit_usage_logs_table'
down_revision = '002_create_user_platforms_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'credit_usage_logs',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('model', sa.String(length=100), nullable=False, server_default='Default Model'),
        sa.Column('project_name', sa.String(length=100), nullable=False, server_default='General Project'),
        sa.Column('task_type', sa.String(length=50), nullable=False, server_default='General'),
        sa.Column('credits_used', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('prompt_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('token_usage', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('usage_date', sa.String(length=10), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index(op.f('ix_credit_usage_logs_id'), 'credit_usage_logs', ['id'], unique=False)
    op.create_index(op.f('ix_credit_usage_logs_user_id'), 'credit_usage_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_credit_usage_logs_platform'), 'credit_usage_logs', ['platform'], unique=False)
    op.create_index(op.f('ix_credit_usage_logs_usage_date'), 'credit_usage_logs', ['usage_date'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_credit_usage_logs_usage_date'), table_name='credit_usage_logs')
    op.drop_index(op.f('ix_credit_usage_logs_platform'), table_name='credit_usage_logs')
    op.drop_index(op.f('ix_credit_usage_logs_user_id'), table_name='credit_usage_logs')
    op.drop_index(op.f('ix_credit_usage_logs_id'), table_name='credit_usage_logs')
    op.drop_table('credit_usage_logs')
