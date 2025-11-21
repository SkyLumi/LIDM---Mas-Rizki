# api_game.py
from flask import Blueprint, jsonify, request
from extensions import db
from models import Profil, GameAktual, GamesDashboard, JenisHambatan, AsalSekolah

# 1. Bikin Lemari "Game Logic"
game_bp = Blueprint('game_bp', __name__)

@game_bp.route('/game/status', methods=['GET'])
def get_game_status():
    """
    API Komplit: Ambil Data Diri Murid + Cek Menang/Kalah per Level.
    Dipanggil pas masuk MainMenu/LevelMenu.
    """
    # Ambil Parameter dari URL (Contoh: ?id_profil=1&nama_game=Tangkap Rasa)
    id_profil = request.args.get('id_profil')
    nama_game = request.args.get('nama_game') 

    if not id_profil or not nama_game:
        return jsonify({"status": "gagal", "message": "Parameter kurang"}), 400

    try:
        # --- 1. AMBIL DATA DIRI (Sesuai Gambar) ---
        # Kita JOIN biar dapet nama sekolah & hambatan (bukan cuma ID)
        stmt = (
            db.select(Profil, JenisHambatan.jenis_hambatan, AsalSekolah.nama_sekolah)
            .outerjoin(JenisHambatan, Profil.id_hambatan == JenisHambatan.id_hambatan)
            .outerjoin(AsalSekolah, Profil.id_sekolah == AsalSekolah.id_sekolah)
            .where(Profil.id_profil == id_profil)
        )
        result = db.session.execute(stmt).first()

        if not result:
            return jsonify({"status": "gagal", "message": "Murid tidak ditemukan"}), 404

        profil, nama_hambatan, nama_sekolah = result

        # --- 2. CARI ID GAME (Berdasarkan Nama) ---
        game_db = db.session.scalar(
            db.select(GamesDashboard).where(GamesDashboard.nama_game == nama_game)
        )
        
        if not game_db:
             return jsonify({"status": "gagal", "message": f"Game '{nama_game}' tidak ditemukan"}), 404

        # --- 3. CEK PROGRESS (Level mana aja yang MENANG?) ---
        # Ambil semua level yang 'is_win = True' buat murid ini di game ini
        won_levels = db.session.scalars(
            db.select(GameAktual.level)
            .where(GameAktual.id_profil == id_profil)
            .where(GameAktual.id_games_dashboard == game_db.id_games_dashboard)
            .where(GameAktual.is_win == True)
        ).all()

        # Konversi ke List unik (misal: [1, 2])
        won_levels_list = list(set(won_levels)) # Hapus duplikat kalo ada

        # --- 4. BUNGKUS DATANYA ---
        response_data = {
            "murid": {
                "id_profil": profil.id_profil,
                "nama_lengkap": profil.nama_lengkap,
                "nomor_absen": profil.nomor_absen,
                "kelas": profil.kelas,
                "hambatan": nama_hambatan or "-",
                "sekolah": nama_sekolah or "-"
            },
            "progress": {
                # Level 1: Selalu Kebuka (true)
                # Level 2: Kebuka KALO Level 1 udah menang
                # Level 3: Kebuka KALO Level 2 udah menang
                "level1": {
                    "is_win": 1 in won_levels_list,
                    "is_unlocked": True 
                },
                "level2": {
                    "is_win": 2 in won_levels_list,
                    "is_unlocked": 1 in won_levels_list # Syarat: Menang Lv 1
                },
                "level3": {
                    "is_win": 3 in won_levels_list,
                    "is_unlocked": 2 in won_levels_list # Syarat: Menang Lv 2
                }
            }
        }

        return jsonify({"status": "sukses", "data": response_data}), 200

    except Exception as e:
        print(f"Error get game status: {e}")
        return jsonify({"status": "gagal", "message": "Server error"}), 500