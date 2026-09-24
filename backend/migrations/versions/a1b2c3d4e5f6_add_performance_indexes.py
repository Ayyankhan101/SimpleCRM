"""add performance indexes for owner_id+deleted_at query patterns

Revision ID: a1b2c3d4e5f6
Revises: 00db8cf783b7
Create Date: 2026-09-24
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '00db8cf783b7'
branch_labels = None
depends_on = None


def upgrade():
    # Contacts: primary list query pattern (owner_id + deleted_at + sort by created_at)
    op.create_index('idx_contacts_owner_deleted', 'contacts', ['owner_id', 'deleted_at'], unique=False)
    op.create_index('idx_contacts_owner_stage', 'contacts', ['owner_id', 'stage'], unique=False)
    op.create_index('idx_contacts_owner_created', 'contacts', ['owner_id', sa.text('created_at DESC')], unique=False)

    # Deals: same pattern + pipeline queries
    op.create_index('idx_deals_owner_deleted', 'deals', ['owner_id', 'deleted_at'], unique=False)
    op.create_index('idx_deals_owner_stage', 'deals', ['owner_id', 'stage'], unique=False)
    op.create_index('idx_deals_owner_created', 'deals', ['owner_id', sa.text('created_at DESC')], unique=False)

    # Activities: same pattern + type/deal filters
    op.create_index('idx_activities_owner_deleted', 'activities', ['owner_id', 'deleted_at'], unique=False)
    op.create_index('idx_activities_owner_type', 'activities', ['owner_id', 'type'], unique=False)
    op.create_index('idx_activities_owner_created', 'activities', ['owner_id', sa.text('created_at DESC')], unique=False)


def downgrade():
    op.drop_index('idx_activities_owner_created', 'activities')
    op.drop_index('idx_activities_owner_type', 'activities')
    op.drop_index('idx_activities_owner_deleted', 'activities')
    op.drop_index('idx_deals_owner_created', 'deals')
    op.drop_index('idx_deals_owner_stage', 'deals')
    op.drop_index('idx_deals_owner_deleted', 'deals')
    op.drop_index('idx_contacts_owner_created', 'contacts')
    op.drop_index('idx_contacts_owner_stage', 'contacts')
    op.drop_index('idx_contacts_owner_deleted', 'contacts')
