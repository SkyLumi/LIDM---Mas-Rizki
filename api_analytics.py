from flask import Blueprint, request, jsonify, session
import json
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func 
import datetime
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
    id_game = data.get('id_games_dashboard')
    level_raw = data.get('level')
    angka_saja = ''.join(filter(str.isdigit, level_raw))
    level_key = int(angka_saja)
    
    skor = data.get('finalScore')
    durasi = data.get('totalPlayTimeSeconds')
    is_win = data.get('win')

    metrics = data.get('metrics', {})
    
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
        new_sesi = GameAktual(
            id_profil=id_profil_murid,
            id_games_dashboard=id_game,
            level=level_key, 
            skor=skor,
            waktu_durasi_detik=int(durasi),
            is_win=is_win
        )
        db.session.add(new_sesi)
        db.session.commit() # Commit biar dapet "id_sesi" baru

        # --- LANGKAH B: Bikin Laporan (Laporan) ---
        new_laporan = Laporan(
            id_sesi=new_sesi.id_sesi, # <-- "Kunci" penghubung
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

def calculate_period_stats(id_profil, start_date, end_date):
    """
    Helper untuk menghitung rata-rata skor, heatmap grid, dan hand usage
    dalam rentang waktu tertentu (start_date s/d end_date).
    """
    
    # ==========================================
    # 1. QUERY SKILL SCORES (RATA-RATA 6 SKILL)
    # ==========================================
    avg_query = db.select(
        func.avg(Laporan.fokus).label('fokus'),
        func.avg(Laporan.koordinasi).label('koordinasi'),
        func.avg(Laporan.waktu_reaksi).label('waktu_reaksi'),
        func.avg(Laporan.keseimbangan).label('keseimbangan'),
        func.avg(Laporan.ketangkasan).label('ketangkasan'),
        func.avg(Laporan.memori).label('memori')
    ).join(GameAktual, Laporan.id_sesi == GameAktual.id_sesi).where(
        GameAktual.id_profil == id_profil,
        func.date(GameAktual.waktu_main) >= start_date,
        func.date(GameAktual.waktu_main) <= end_date
    )
    scores = db.session.execute(avg_query).first()

    # Ambil nilai skill (Handle None jadi 0)
    val_fokus = float(scores.fokus) if scores.fokus else 0
    val_koordinasi = float(scores.koordinasi) if scores.koordinasi else 0
    val_keseimbangan = float(scores.keseimbangan) if scores.keseimbangan else 0
    val_ketangkasan = float(scores.ketangkasan) if scores.ketangkasan else 0
    val_memori = float(scores.memori) if scores.memori else 0
    val_waktu_reaksi = float(scores.waktu_reaksi) if scores.waktu_reaksi else 0 # Satuan ms

    # ==========================================
    # 2. HITUNG PERIOD AVERAGE (SKALA 0-100)
    # ==========================================
    # Kita harus menormalisasi Waktu Reaksi (ms) menjadi Skor (0-100)
    # Rumus: 0ms = 100 poin, 10.000ms = 0 poin
    score_reaksi_norm = 0
    if val_waktu_reaksi > 0:
        score_reaksi_norm = max(0, min(100, ((10000 - val_waktu_reaksi) / 10000) * 100))

    # Hitung Rata-rata dari 6 Skill
    # Jika belum ada data sama sekali (semua 0), hasil avg 0
    total_skill = val_fokus + val_koordinasi + val_keseimbangan + val_ketangkasan + val_memori + score_reaksi_norm
    period_avg = round(total_skill / 6, 1)


    # ==========================================
    # 3. QUERY GAME BREAKDOWN (UNTUK CHART HORIZONTAL)
    # ==========================================
    game_skill_query = db.select(
        GamesDashboard.nama_game,
        func.avg(Laporan.fokus).label('fokus'),
        func.avg(Laporan.koordinasi).label('koordinasi'),
        func.avg(Laporan.waktu_reaksi).label('waktu_reaksi'),
        func.avg(Laporan.keseimbangan).label('keseimbangan'),
        func.avg(Laporan.ketangkasan).label('ketangkasan'),
        func.avg(Laporan.memori).label('memori')
    ).join(GameAktual, Laporan.id_sesi == GameAktual.id_sesi)\
     .join(GamesDashboard, GameAktual.id_games_dashboard == GamesDashboard.id_games_dashboard)\
     .where(
        GameAktual.id_profil == id_profil,
        func.date(GameAktual.waktu_main) >= start_date,
        func.date(GameAktual.waktu_main) <= end_date
    ).group_by(GamesDashboard.nama_game)
    
    game_results = db.session.execute(game_skill_query).all()

    game_breakdown = {}
    game_skills_detailed = {}

    for row in game_results:
        nama = row.nama_game # Pastikan nama di DB sesuai (Case Sensitive)
        
        # Ambil nilai raw (handle None)
        fokus = float(row.fokus) if row.fokus else 0
        koor = float(row.koordinasi) if row.koordinasi else 0
        keseimbangan = float(row.keseimbangan) if row.keseimbangan else 0
        ketangkasan = float(row.ketangkasan) if row.ketangkasan else 0
        memori = float(row.memori) if row.memori else 0
        waktu_reaksi_ms = float(row.waktu_reaksi) if row.waktu_reaksi else 0

        # Normalisasi Waktu Reaksi (ms -> 0-100)
        reaksi_score = 0
        if waktu_reaksi_ms > 0:
            reaksi_score = max(0, min(100, ((10000 - waktu_reaksi_ms) / 10000) * 100))

        final_score = 0

        # === RESEP PENILAIAN PER GAME (SESUAI GAMBAR) ===
        # Gunakan .lower() biar aman kalau di DB tulisannya "Gelembung Ajaib" atau "gelembung ajaib"
        name_lower = nama.lower()

        if "gelembung" in name_lower or "tangkap" in name_lower:
            # Resep: Fokus, Koor Tangan Mata, Waktu Reaksi, Ketangkasan
            # Pembagi: 4
            final_score = (fokus + koor + reaksi_score + ketangkasan) / 4
        
        elif "papan" in name_lower: # Papan seimbang
            # Resep: Fokus, Koor Tangan Mata, Keseimbangan
            # Pembagi: 3
            final_score = (fokus + koor + keseimbangan) / 3
            
        elif "kartu" in name_lower or "cocok" in name_lower:
            # Resep: Memori
            # Pembagi: 1
            final_score = memori
        
        else:
            # Default kalau ada game baru (rata-rata semua)
            final_score = (fokus + koor + reaksi_score + keseimbangan + ketangkasan + memori) / 6

        # Simpan ke dictionary (Round 1 desimal)
        game_breakdown[nama] = round(final_score, 1)

        game_skills_detailed[nama] = {
            "fokus": round(fokus, 1),
            "koordinasi": round(koor, 1),
            "keseimbangan": round(keseimbangan, 1),
            "ketangkasan": round(ketangkasan, 1),
            "memori": round(memori, 1),
            "waktu_reaksi": round(reaksi_score, 1), # Udah dikonversi 0-100
            "waktu_reaksi_ms": round(waktu_reaksi_ms, 1) # Raw data
        }


    # ==========================================
    # 4. QUERY META (TOTAL MAIN & DURASI)
    # ==========================================
    meta_query = db.select(
        func.count(GameAktual.id_sesi).label('total_main'),
        func.sum(GameAktual.waktu_durasi_detik).label('total_durasi')
    ).where(
        GameAktual.id_profil == id_profil,
        func.date(GameAktual.waktu_main) >= start_date,
        func.date(GameAktual.waktu_main) <= end_date
    )
    meta_stats = db.session.execute(meta_query).first()

    total_games = meta_stats.total_main if meta_stats.total_main else 0
    total_seconds = meta_stats.total_durasi if meta_stats.total_durasi else 0
    total_minutes = round(total_seconds / 60)


    # ==========================================
    # 5. QUERY HEATMAP & HAND USAGE
    # ==========================================
    heatmap_query = db.select(Laporan.heatmap).join(GameAktual, Laporan.id_sesi == GameAktual.id_sesi).where(
        GameAktual.id_profil == id_profil,
        func.date(GameAktual.waktu_main) >= start_date,
        func.date(GameAktual.waktu_main) <= end_date,
        Laporan.heatmap.isnot(None)
    )
    heatmaps = db.session.execute(heatmap_query).scalars().all()

    final_grid = [[0.0 for _ in range(4)] for _ in range(4)]
    total_left, total_right = 0.0, 0.0
    count = 0

    for h in heatmaps:
        if not h: continue
        grid = h.get('grid')
        if grid and len(grid) == 4:
            count += 1
            for r in range(4):
                for c in range(4):
                    final_grid[r][c] += float(grid[r][c])
        
        dom = h.get('dominance', {})
        total_left += float(dom.get('left_percent', 0))
        total_right += float(dom.get('right_percent', 0))

    avg_left, avg_right = 0, 0
    if count > 0:
        for r in range(4):
            for c in range(4):
                final_grid[r][c] = round(final_grid[r][c] / count, 1)
        avg_left = round(total_left / count, 1)
        avg_right = round(total_right / count, 1)


    # ==========================================
    # 6. RETURN HASIL AKHIR
    # ==========================================
    return {
        "scores": {
            "fokus": round(val_fokus, 1),
            "ketangkasan": round(val_ketangkasan, 1),
            "koordinasi": round(val_koordinasi, 1),
            "keseimbangan": round(val_keseimbangan, 1),
            "memori": round(val_memori, 1),
            "waktu_reaksi": round(val_waktu_reaksi, 1), # Kembalikan nilai asli (ms)
        },
        "heatmap": final_grid,
        "hand_usage": {"left": avg_left, "right": avg_right},
        "meta": {
            "total_games": total_games,
            "total_minutes": total_minutes
        },
        "game_scores": game_breakdown, # Dictionary skor per game
        "game_skills": game_skills_detailed,
        "period_average": period_avg   # Skor Keseluruhan (0-100)
    }

@analytics_bp.route('/analytics/profil/<int:id_profil>/report/full', methods=['GET'])
@guru_required
def get_full_report(id_profil):
    """
    API Report dengan Filter Bulan & Tahun
    """
    try:
        # Validasi Profil & Akses Guru (Tetap sama)
        profil_murid = db.session.get(Profil, id_profil)
        if not profil_murid: return jsonify({"status": "gagal", "message": "Murid tidak ditemukan"}), 404
        
        guru_id = session.get('user_id')
        profil_guru = db.session.scalar(db.select(Profil).where(Profil.id_pengguna == guru_id))
        if not profil_guru or profil_murid.id_sekolah != profil_guru.id_sekolah:
            return jsonify({"status": "gagal", "message": "Akses ditolak"}), 403

        # === LOGIC BARU: TANGKAP FILTER DARI FRONTEND ===
        req_month = request.args.get('month', type=int)
        req_year = request.args.get('year', type=int)

        # Default ke Hari Ini
        target_date = datetime.date.today()

        # Kalau Frontend kirim filter, pakai tanggal dari filter
        if req_month and req_year:
            try:
                target_date = datetime.date(req_year, req_month, 1)
            except ValueError:
                # Fallback kalau tanggal ga valid
                target_date = datetime.date.today()

        # Tentukan Start & End Date berdasarkan target_date
        month_start = target_date.replace(day=1)
        
        # Hitung Akhir Bulan
        if month_start.month == 12:
            next_month = month_start.replace(year=month_start.year+1, month=1, day=1)
        else:
            next_month = month_start.replace(month=month_start.month+1, day=1)
        month_end = next_month - datetime.timedelta(days=1)

        report_data = {}

        # 1. OVERALL (1 Bulan Penuh sesuai filter)
        report_data['overall'] = calculate_period_stats(id_profil, month_start, month_end)

        # 2. BREAKDOWN (Minggu 1 - 4 relatif terhadap bulan yang dipilih)
        for i in range(4):
            week_start = month_start + datetime.timedelta(days=i*7)
            week_end = week_start + datetime.timedelta(days=6)
            
            # Potong kalau lewat bulan
            if week_start > month_end: 
                # Kalau minggu ke-4 lewat bulan, kirim data kosong
                report_data[f"week{i+1}"] = calculate_period_stats(id_profil, week_start, week_start) # Range 0 hari (kosong)
                continue 

            if week_end > month_end: week_end = month_end

            key = f"week{i+1}"
            report_data[key] = calculate_period_stats(id_profil, week_start, week_end)

        return jsonify({
            "status": "sukses",
            "data": report_data
        }), 200

    except Exception as e:
        print(f"Error full report: {e}")
        return jsonify({"status": "gagal", "message": "Server Error"}), 500

@analytics_bp.route('/analytics/laporan/<int:id_laporan>', methods=['GET'])
@guru_required
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
    
@analytics_bp.route('/analytics/history/<int:id_profil>', methods=['GET'])
@guru_required
def get_game_history(id_profil):
    try:
        # ... (Code Query Total Game & Durasi SAMA PERSIS, GAK BERUBAH) ...
        # Copas aja bagian 'stmt_total' dan 'games_stats' dari kode sebelumnya
        # Biar hemat tempat saya langsung ke bagian HEATMAP-nya ya:

        # --- 1. COPY BAGIAN INI KE ATAS (Code lama) ---
        stmt_total = (
            db.select(
                GamesDashboard.nama_game,
                func.count(GameAktual.id_sesi).label('total_main'),
                func.sum(GameAktual.waktu_durasi_detik).label('total_durasi')
            )
            .join(GameAktual, GamesDashboard.id_games_dashboard == GameAktual.id_games_dashboard)
            .where(GameAktual.id_profil == id_profil)
            .group_by(GamesDashboard.nama_game)
        )
        results_total = db.session.execute(stmt_total).all()

        games_stats = {}
        for row in results_total:
            nama_game = row[0].upper()
            games_stats[nama_game] = {
                'count': row[1],
                'duration_minutes': round(row[2] / 60) if row[2] else 0
            }
        
        today = datetime.date.today()
        
        # 1. Cari "Senin" minggu ini
        # (weekday(): Senin=0, ..., Jumat=4, Minggu=6)
        monday_of_current_week = today - datetime.timedelta(days=today.weekday())
        
        # 2. Mundur 4 minggu ke belakang dari Senin itu (Total 5 minggu)
        start_date = monday_of_current_week - datetime.timedelta(weeks=4)

        # 3. Ambil Data DB (Sama kayak kemarin)
        stmt_daily = (
            db.select(
                func.date(GameAktual.waktu_main).label('tanggal'),
                func.count(GameAktual.id_sesi).label('daily_count'),
                func.sum(GameAktual.waktu_durasi_detik).label('daily_duration')
            )
            .where(GameAktual.id_profil == id_profil)
            .where(func.date(GameAktual.waktu_main) >= start_date)
            .group_by(func.date(GameAktual.waktu_main))
        )
        results_daily = db.session.execute(stmt_daily).all()

        daily_map = {}
        for row in results_daily:
            tgl_str = row[0].isoformat()
            daily_map[tgl_str] = {
                'count': row[1],
                'duration_minutes': round(row[2] / 60) if row[2] else 0
            }

        # 4. ISI GRID (PASTI DIMULAI DARI SENIN)
        heatmap_games = []
        heatmap_time = []
        weeks_label = []

        current_day_pointer = start_date # Ini PASTI Senin
        
        for week_idx in range(5):
            week_row_games = []
            week_row_time = []
            
            # Label Minggu
            iso_week = current_day_pointer.isocalendar()[1]
            weeks_label.append(f"Minggu {iso_week}")

            for day_idx in range(7): # 0=Senin ... 6=Minggu
                tgl_str = current_day_pointer.isoformat()
                data_hari = daily_map.get(tgl_str, {'count': 0, 'duration_minutes': 0})
                
                week_row_games.append(data_hari['count'])
                week_row_time.append(data_hari['duration_minutes'])
                
                current_day_pointer += datetime.timedelta(days=1)
            
            heatmap_games.append(week_row_games)
            heatmap_time.append(week_row_time)

        return jsonify({
            "status": "sukses",
            "games_stats": games_stats,
            "heatmap": {
                "games": heatmap_games,
                "time": heatmap_time,
                "weeks": weeks_label
            }
        }), 200

    except Exception as e:
        print(f"Error get history: {e}")
        return jsonify({"status": "gagal", "message": "Server error"}), 500
    
