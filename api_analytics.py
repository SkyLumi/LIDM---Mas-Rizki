from flask import Blueprint, request, jsonify, session
import json
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func 
import datetime

# --- ▼▼▼ INI YANG BARU ▼▼▼ ---
from extensions import db
from models import GameAktual, Laporan, Profil, GamesDashboard
from api_auth import guru_required

# 1. Bikin "Lemari"-nya
analytics_bp = Blueprint('analytics_bp', __name__)

@analytics_bp.route('/analytics/save', methods=['POST'])
def save_analytics():
    """
    Menerima "bungkusan" data analisis dari Result.js (Frontend),
    menyimpan Sesi, menghitung heatmap, dan menyimpan Laporan.
    """
    
    # 1. Terima "bungkusan" data JSON dari game
    data = request.json
    
    # 2. "Bongkar" bungkusannya
    
    # --- Data Sesi (Buat tabel "Game_aktual") ---
    # (PENTING: Pastiin 3 data ini dikirim dari game Abang)
    id_profil_murid = data.get('id_profil') 
    id_game = data.get('id_games_dashboard') # (Misal: 1, 2, 3)
    level_key = data.get('level') # (Misal: "Level1")
    
    skor = data.get('finalScore')
    durasi = data.get('totalPlayTimeSeconds')
    is_win = data.get('win') # (true/false)

    # --- Data Laporan (Buah tabel "Laporan") ---
    # (Ini "Bungkusan" metrics yang Abang bilang)
    metrics = data.get('metrics', {}) # (Default-nya "ember" kosong)
    
    # --- INI "JURUS JAGO"-NYA (Pake .get()) ---
    # (Kalo game "Kartu" gak ngirim 'koordinasi', ini otomatis jadi 'None')
    fokus_score = metrics.get('fokus')
    koordinasi_score = metrics.get('koordinasi')
    reaksi_score = metrics.get('waktuReaksi')
    keseimbangan_score = metrics.get('keseimbangan')
    ketangkasan_score = metrics.get('ketangkasan')
    memori_score = metrics.get('memori')

    # --- Data Mentah (Buat di-kalkulasi) ---
    raw_heatmap_data = data.get('rawHeatmap')

    # 3. Validasi (PENTING)
    if not id_profil_murid or not id_game:
        return jsonify({"status": "gagal", "message": "ID Profil atau ID Game tidak ada."}), 400

    # 4. Kalkulasi Analytics (Rumus Abang)
    heatmap_json_to_save = {} # Siapin "ember" buat kolom JSONB
    
    if raw_heatmap_data:
        processed_grid = calculate_heatmap_grid(raw_heatmap_data)
        hand_dominance = calculate_hand_dominance(raw_heatmap_data)
        
        # Masukin ke "ember" JSONB
        heatmap_json_to_save['grid'] = processed_grid
        heatmap_json_to_save['dominance'] = hand_dominance
        
    # 5. Simpen ke DB (Pake "Jurus Jago" Transaction)
    try:
        # --- LANGKAH A: Bikin Sesi (GameAktual) ---
        new_sesi = GameAktual(
            id_profil=id_profil_murid,
            id_games_dashboard=id_game,
            level=level_key, 
            skor=skor,
            waktu_durasi_detik=int(durasi),
            is_win=is_win
            # 'waktu_main' otomatis diisi PostgreSQL
        )
        db.session.add(new_sesi)
        db.session.commit() # Commit biar dapet "id_sesi" baru

        # --- LANGKAH B: Bikin Laporan (Laporan) ---
        new_laporan = Laporan(
            id_sesi=new_sesi.id_sesi, # <-- "Kunci" penghubung
            
            # (Ini 100% AMAN, kalo "Kartu" gak ngirim 'koordinasi',
            #  'koordinasi_score' isinya 'None', dan DB nerima 'NULL')
            fokus=fokus_score,
            koordinasi=koordinasi_score,
            waktu_reaksi=reaksi_score,
            keseimbangan=keseimbangan_score,
            ketangkasan=ketangkasan_score,
            memori=memori_score,
            
            heatmap=heatmap_json_to_save # <-- Simpen JSON-nya
        )
        db.session.add(new_laporan)
        db.session.commit() # Commit Laporan

        print(f"SUKSES SIMPAN: Sesi {new_sesi.id_sesi} untuk Profil {id_profil_murid}")
        return jsonify({"status": "sukses", "message": "Data analisis berhasil disimpan"}), 201

    except IntegrityError as e:
        db.session.rollback() # (PENTING: Batalin 'new_sesi' kalo 'new_laporan' gagal)
        print(f"Gagal simpan (IntegrityError): {e}")
        return jsonify({"status": "gagal", "message": "Data tidak valid (IntegrityError)"}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Gagal simpan (Exception): {e}")
        return jsonify({"status": "gagal", "message": "Terjadi kesalahan server"}), 500

def calculate_heatmap_grid(raw_heatmap, num_cols=4, num_rows=4):
    grid_counts = [[0 for _ in range(num_cols)] for _ in range(num_rows)]
    for point in raw_heatmap:
        x, y = point.get('x', 0), point.get('y', 0)
        col_index = min(int(x * num_cols), num_cols - 1)
        row_index = min(int(y * num_rows), num_rows - 1)
        grid_counts[row_index][col_index] += 1
    
    all_counts = [count for row in grid_counts for count in row]
    min_count, max_count = min(all_counts), max(all_counts)
    if max_count == min_count:
        return [[50 for _ in range(num_cols)] for _ in range(num_rows)]
        
    grid_scores = [[0 for _ in range(num_cols)] for _ in range(num_rows)]
    for r in range(num_rows):
        for c in range(num_cols):
            score = ((grid_counts[r][c] - min_count) / (max_count - min_count)) * 100
            grid_scores[r][c] = round(score, 1)
    return grid_scores

def calculate_hand_dominance(raw_heatmap):
    left_count = sum(1 for p in raw_heatmap if p.get('hand') == 'Left')
    right_count = sum(1 for p in raw_heatmap if p.get('hand') == 'Right')
    total = left_count + right_count
    if total == 0:
        return {"left_percent": 0, "right_percent": 0}
    
    left_percent = round((left_count / total) * 100, 1)
    right_percent = round((right_count / total) * 100, 1)
    return {"left_percent": left_percent, "right_percent": right_percent}

# api_analytics.py (di paling bawah)

@analytics_bp.route('/analytics/profil/<int:id_profil>/weekly', methods=['GET'])
@guru_required # <-- "Bouncer" Jaga
def get_weekly_analytics(id_profil):
    """
    API (HANYA GURU) untuk MENG-AMBIL (GET) RATA-RATA skill
    murid 'id_profil' DALAM MINGGU INI.
    """
    
    try:
        # --- 1. JURUS KEAMANAN (WAJIB) ---
        # (Guru "SLB A" gak boleh "ngintip" murid "SLB B")
        profil_murid = db.session.get(Profil, id_profil)
        if not profil_murid:
            return jsonify({"status": "gagal", "message": "Murid tidak ditemukan."}), 404

        guru_id_pengguna = session.get('user_id')
        profil_guru = db.session.scalar(
            db.select(Profil).where(Profil.id_pengguna == guru_id_pengguna)
        )
        
        if not profil_guru or profil_murid.id_sekolah != profil_guru.id_sekolah:
            return jsonify({"status": "gagal", "message": "Akses ditolak."}), 403

        # --- 2. JURUS NGITUNG "MINGGU INI" ---
        today = datetime.date.today()
        # (Senin = 0, Minggu = 6)
        start_of_week = today - datetime.timedelta(days=today.weekday())
        end_of_week = start_of_week + datetime.timedelta(days=6)
        
        # (Bikin jadi 'datetime' biar bisa dibandingin sama DB)
        start_dt = datetime.datetime.combine(start_of_week, datetime.time.min) # Senin 00:00
        end_dt = datetime.datetime.combine(end_of_week, datetime.time.max) # Minggu 23:59

        # --- 3. "JURUS JAGO" (Suruh SQL ngitung AVG) ---
        # (Kita "ngintip" 'Laporan', 'JOIN' ke 'GameAktual' buat "filter"
        #  tanggal dan 'id_profil')
        
        avg_query = db.select(
            func.avg(Laporan.fokus).label('fokus'),
            func.avg(Laporan.koordinasi).label('koordinasi'),
            func.avg(Laporan.waktu_reaksi).label('waktu_reaksi'),
            func.avg(Laporan.keseimbangan).label('keseimbangan'),
            func.avg(Laporan.ketangkasan).label('ketangkasan'),
            func.avg(Laporan.memori).label('memori')
        ).join(GameAktual).where(
            GameAktual.id_profil == id_profil, # 1. Cuma murid ini
            GameAktual.waktu_main.between(start_dt, end_dt) # 2. Cuma minggu ini
        )

        # "Jalanin" query-nya
        results = db.session.execute(avg_query).first()
        
        # --- 4. "BUNGKUS" JADI JSON ---
        # (Hasil 'results' itu misal: (Decimal('80.5'), Decimal('70.2'), None, ...))
        # (Kita "bersihin" jadi JSON yang 'jago')
        averages = {
            'fokus': float(results.fokus) if results.fokus else 0,
            'koordinasi': float(results.koordinasi) if results.koordinasi else 0,
            'waktu_reaksi': float(results.waktu_reaksi) if results.waktu_reaksi else 0,
            'keseimbangan': float(results.keseimbangan) if results.keseimbangan else 0,
            'ketangkasan': float(results.ketangkasan) if results.ketangkasan else 0,
            'memori': float(results.memori) if results.memori else 0,
        }

        return jsonify({
            "status": "sukses", 
            "id_profil": id_profil,
            "range": "weekly",
            "start_date": start_of_week.isoformat(),
            "end_date": end_of_week.isoformat(),
            "data": averages
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Gagal get weekly analytics: {e}")
        return jsonify({"status": "gagal", "message": "Terjadi kesalahan server"}), 500

# api_analytics.py

# ... (import dan fungsi save_analytics di atas) ...

@analytics_bp.route('/analytics/laporan/<int:id_laporan>', methods=['GET'])
@guru_required # <-- Aman, cuma Guru yang boleh liat
def get_laporan_detail(id_laporan):
    """
    API untuk mengambil detail laporan SATU game,
    termasuk HEATMAP (Grid Array) yang sudah diproses.
    """
    try:
        # 1. Cari Laporan
        laporan = db.session.get(Laporan, id_laporan)
        if not laporan:
            return jsonify({"status": "gagal", "message": "Laporan tidak ditemukan"}), 404

        # 2. Cari Sesi & Profil Murid (Buat Cek Keamanan)
        # (Kita harus pastiin Guru ini berhak liat murid ini)
        sesi = db.session.get(GameAktual, laporan.id_sesi)
        profil_murid = db.session.get(Profil, sesi.id_profil)
        
        guru_id = session.get('user_id')
        profil_guru = db.session.scalar(db.select(Profil).where(Profil.id_pengguna == guru_id))

        # Cek Sekolah (Keamanan)
        if not profil_guru or profil_murid.id_sekolah != profil_guru.id_sekolah:
            return jsonify({"status": "gagal", "message": "Akses ditolak."}), 403

        # 3. Ambil Data Heatmap (JSON)
        # (Isinya otomatis udah jadi Dict/Array Python karena tipe kolomnya JSONB)
        heatmap_data = laporan.heatmap or {} # Jaga-jaga kalo kosong
        
        # 4. Bungkus Data
        response_data = {
            "id_laporan": laporan.id_laporan,
            "waktu_main": sesi.waktu_main.isoformat() if sesi.waktu_main else None,
            "nama_game": sesi.Games_Dashboard.nama_game, # (Relasi otomatis SQLAlchemy)
            "skor": sesi.skor,
            "durasi": sesi.waktu_durasi_detik,
            
            # --- INI YANG ABANG CARI (ARRAY GRID) ---
            "heatmap_grid": heatmap_data.get('grid', []), # Array 4x4 (atau 4x3)
            "dominasi_tangan": heatmap_data.get('dominance', {}),
            
            # Skor Analisis
            "scores": {
                "fokus": float(laporan.fokus) if laporan.fokus else 0,
                "koordinasi": float(laporan.koordinasi) if laporan.koordinasi else 0,
                "waktu_reaksi": float(laporan.waktu_reaksi) if laporan.waktu_reaksi else 0,
                # ... (sisanya)
            }
        }

        return jsonify({"status": "sukses", "data": response_data}), 200

    except Exception as e:
        print(f"Error get laporan detail: {e}")
        return jsonify({"status": "gagal", "message": "Terjadi kesalahan server"}), 500