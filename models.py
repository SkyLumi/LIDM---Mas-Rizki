from extensions import Base
from typing import Optional
import datetime
import decimal

from sqlalchemy import Boolean, Column, DateTime, ForeignKeyConstraint, Integer, LargeBinary, Numeric, PrimaryKeyConstraint, String, Table, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class AsalSekolah(Base):
    __tablename__ = 'Asal_Sekolah'
    __table_args__ = (
        PrimaryKeyConstraint('id_sekolah', name='Asal_Sekolah_pkey'),
    )

    id_sekolah: Mapped[int] = mapped_column(Integer, primary_key=True)
    nama_sekolah: Mapped[str] = mapped_column(String(255), nullable=False)

    Profil: Mapped[list['Profil']] = relationship('Profil', back_populates='Asal_Sekolah')


class GamesDashboard(Base):
    __tablename__ = 'Games_Dashboard'
    __table_args__ = (
        PrimaryKeyConstraint('id_games_dashboard', name='Games_Dashboard_pkey'),
    )

    id_games_dashboard: Mapped[int] = mapped_column(Integer, primary_key=True)
    nama_game: Mapped[str] = mapped_column(String(255), nullable=False)
    meta_description: Mapped[Optional[str]] = mapped_column(Text)
    deskripsi: Mapped[Optional[str]] = mapped_column(Text)
    thumbnail: Mapped[Optional[bytes]] = mapped_column(LargeBinary)

    Keterampilan: Mapped[list['Keterampilan']] = relationship('Keterampilan', secondary='Game_Keterampilan', back_populates='Games_Dashboard')
    Game_aktual: Mapped[list['GameAktual']] = relationship('GameAktual', back_populates='Games_Dashboard')


class JenisHambatan(Base):
    __tablename__ = 'Jenis_Hambatan'
    __table_args__ = (
        PrimaryKeyConstraint('id_hambatan', name='Jenis_Hambatan_pkey'),
    )

    id_hambatan: Mapped[int] = mapped_column(Integer, primary_key=True)
    jenis_hambatan: Mapped[str] = mapped_column(String(100), nullable=False)

    Profil: Mapped[list['Profil']] = relationship('Profil', back_populates='Jenis_Hambatan')


class Keterampilan(Base):
    __tablename__ = 'Keterampilan'
    __table_args__ = (
        PrimaryKeyConstraint('id_keterampilan', name='Keterampilan_pkey'),
    )

    id_keterampilan: Mapped[int] = mapped_column(Integer, primary_key=True)
    nama_keterampilan: Mapped[str] = mapped_column(String(100), nullable=False)
    deskripsi: Mapped[Optional[str]] = mapped_column(Text)

    Games_Dashboard: Mapped[list['GamesDashboard']] = relationship('GamesDashboard', secondary='Game_Keterampilan', back_populates='Keterampilan')


class Role(Base):
    __tablename__ = 'Role'
    __table_args__ = (
        PrimaryKeyConstraint('id_role', name='Role_pkey'),
        UniqueConstraint('nama_role', name='Role_nama_role_key')
    )

    id_role: Mapped[int] = mapped_column(Integer, primary_key=True)
    nama_role: Mapped[str] = mapped_column(String(50), nullable=False)

    Pengguna: Mapped[list['Pengguna']] = relationship('Pengguna', back_populates='Role_')


t_Game_Keterampilan = Table(
    'Game_Keterampilan', Base.metadata,
    Column('id_games_dashboard', Integer, primary_key=True),
    Column('id_keterampilan', Integer, primary_key=True),
    ForeignKeyConstraint(['id_games_dashboard'], ['Games_Dashboard.id_games_dashboard'], name='Game_Keterampilan_id_games_dashboard_fkey'),
    ForeignKeyConstraint(['id_keterampilan'], ['Keterampilan.id_keterampilan'], name='Game_Keterampilan_id_keterampilan_fkey'),
    PrimaryKeyConstraint('id_games_dashboard', 'id_keterampilan', name='Game_Keterampilan_pkey')
)


class Pengguna(Base):
    __tablename__ = 'Pengguna'
    __table_args__ = (
        ForeignKeyConstraint(['id_role'], ['Role.id_role'], name='Pengguna_id_role_fkey'),
        PrimaryKeyConstraint('id_pengguna', name='Pengguna_pkey'),
        UniqueConstraint('email', name='Pengguna_email_key')
    )

    id_pengguna: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(Text, nullable=True)
    password: Mapped[str] = mapped_column(String(255), nullable=True)
    id_role: Mapped[int] = mapped_column(Integer, nullable=False)

    Role_: Mapped['Role'] = relationship('Role', back_populates='Pengguna')
    Profil: Mapped['Profil'] = relationship('Profil', uselist=False, back_populates='Pengguna_')


class Profil(Base):
    __tablename__ = 'Profil'
    __table_args__ = (
        ForeignKeyConstraint(['id_hambatan'], ['Jenis_Hambatan.id_hambatan'], name='Profil_id_hambatan_fkey'),
        ForeignKeyConstraint(['id_pengguna'], ['Pengguna.id_pengguna'], ondelete='CASCADE', name='Profil_id_pengguna_fkey'),
        ForeignKeyConstraint(['id_sekolah'], ['Asal_Sekolah.id_sekolah'], name='Profil_id_sekolah_fkey'),
        PrimaryKeyConstraint('id_profil', name='Profil_pkey'),
        UniqueConstraint('face_id', name='Profil_face_id_key'),
        UniqueConstraint('id_pengguna', name='Profil_id_pengguna_key')
    )

    id_profil: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_pengguna: Mapped[int] = mapped_column(Integer, nullable=False)
    nama_depan: Mapped[Optional[str]] = mapped_column(String(100))
    nama_belakang: Mapped[Optional[str]] = mapped_column(String(100))
    avatar: Mapped[Optional[bytes]] = mapped_column(LargeBinary)
    face_id: Mapped[Optional[str]] = mapped_column(String(100))
    kelas: Mapped[Optional[int]] = mapped_column(Integer)
    id_hambatan: Mapped[Optional[int]] = mapped_column(Integer)
    id_sekolah: Mapped[Optional[int]] = mapped_column(Integer)

    Jenis_Hambatan: Mapped[Optional['JenisHambatan']] = relationship('JenisHambatan', back_populates='Profil')
    Pengguna_: Mapped['Pengguna'] = relationship('Pengguna', back_populates='Profil')
    Asal_Sekolah: Mapped[Optional['AsalSekolah']] = relationship('AsalSekolah', back_populates='Profil')
    Game_aktual: Mapped[list['GameAktual']] = relationship('GameAktual', back_populates='Profil_')


class GameAktual(Base):
    __tablename__ = 'Game_aktual'
    __table_args__ = (
        ForeignKeyConstraint(['id_games_dashboard'], ['Games_Dashboard.id_games_dashboard'], name='Game_aktual_id_games_dashboard_fkey'),
        ForeignKeyConstraint(['id_profil'], ['Profil.id_profil'], name='Game_aktual_id_profil_fkey'),
        PrimaryKeyConstraint('id_sesi', name='Game_aktual_pkey')
    )

    id_sesi: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_profil: Mapped[int] = mapped_column(Integer, nullable=False)
    id_games_dashboard: Mapped[int] = mapped_column(Integer, nullable=False)
    level: Mapped[Optional[int]] = mapped_column(Integer)
    skor: Mapped[Optional[int]] = mapped_column(Integer)
    waktu_durasi_detik: Mapped[Optional[int]] = mapped_column(Integer)
    is_win: Mapped[Optional[bool]] = mapped_column(Boolean)
    waktu_main: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('now()'))

    Games_Dashboard: Mapped['GamesDashboard'] = relationship('GamesDashboard', back_populates='Game_aktual')
    Profil_: Mapped['Profil'] = relationship('Profil', back_populates='Game_aktual')
    Laporan: Mapped['Laporan'] = relationship('Laporan', uselist=False, back_populates='Game_aktual')


class Laporan(Base):
    __tablename__ = 'Laporan'
    __table_args__ = (
        ForeignKeyConstraint(['id_sesi'], ['Game_aktual.id_sesi'], ondelete='CASCADE', name='Laporan_id_sesi_fkey'),
        PrimaryKeyConstraint('id_laporan', name='Laporan_pkey'),
        UniqueConstraint('id_sesi', name='Laporan_id_sesi_key')
    )

    id_laporan: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_sesi: Mapped[int] = mapped_column(Integer, nullable=False)
    fokus: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    koordinasi: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    waktu_reaksi: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    keseimbangan: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    ketangkasan: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    memori: Mapped[Optional[decimal.Decimal]] = mapped_column(Numeric)
    heatmap: Mapped[Optional[dict]] = mapped_column(JSONB)
    waktu_tanggal: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('now()'))

    Game_aktual: Mapped['GameAktual'] = relationship('GameAktual', back_populates='Laporan')
