"""Tambah CHECK constraint buat email guru

Revision ID: 1fa442d7bc76
Revises: 6295c77e5da3
Create Date: 2025-11-17 07:18:00.469509

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1fa442d7bc76'
down_revision = '6295c77e5da3'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    res = conn.execute(sa.text("SELECT id_role FROM \"Role\" WHERE nama_role = 'Murid'"))
    id_role_murid = res.fetchone()[0]

    op.create_check_constraint(
        "chk_email_wajib_buat_guru",
        "Pengguna",
        f"(id_role = {id_role_murid}) OR (email IS NOT NULL)"
    )


def downgrade():
    op.drop_constraint(
        "chk_email_wajib_buat_guru", 
        "Pengguna", 
        type_='check'
    )
