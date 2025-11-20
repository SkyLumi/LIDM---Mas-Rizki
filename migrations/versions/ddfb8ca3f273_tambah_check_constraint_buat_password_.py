"""Tambah CHECK constraint buat password guru

Revision ID: ddfb8ca3f273
Revises: 0b34c6fea26c
Create Date: 2025-11-17 05:58:19.189441

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ddfb8ca3f273'
down_revision = '0b34c6fea26c'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    res = conn.execute(sa.text("SELECT id_role FROM \"Role\" WHERE nama_role = 'Murid'"))
    id_role_murid = res.fetchone()[0]

    op.create_check_constraint(
        "chk_password_wajib_buat_guru",
        "Pengguna",
        f"(id_role = {id_role_murid}) OR (password IS NOT NULL)"
    )


def downgrade():
    op.drop_constraint(
        "chk_password_wajib_buat_guru", 
        "Pengguna", 
        type_='check'
    )
