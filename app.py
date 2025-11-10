from flask import Flask, render_template, redirect, request, jsonify
import json
import face_recognition
import numpy as np
import base64
import io
from PIL import Image

# Inisialisasi aplikasi Flask
app = Flask(__name__)

known_face_encodings = []
known_face_metadata = []

def image_base64_to_encoding(image_base64):
    """Mengubah string base64 jadi 'face encoding' (vektor 128d)"""
    try:
        # 1. Pisahin header "data:image/jpeg;base64,"
        header, encoded = image_base64.split(",", 1)
        
        # 2. Decode string-nya jadi data gambar
        image_data = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(image_data))
        
        # 3. Ubah ke format 'face_recognition' (numpy array)
        image_np = np.array(image)
        
        # 4. Cari lokasi muka di foto
        # (Kita cuma ambil muka pertama [0])
        face_locations = face_recognition.face_locations(image_np)
        if not face_locations:
            print("Error: Gak nemu muka di foto")
            return None # (PENTING: Balikin 'None' kalo gak nemu)
            
        # 5. Ambil 'encoding' (sidik jari wajah)
        face_encoding = face_recognition.face_encodings(image_np, known_face_locations=face_locations)[0]
        return face_encoding
        
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

@app.route('/register-wajah', methods=['POST'])
def register_wajah():
    # 1. Ambil "bungkusan" data dari RegisterFace.js
    data = request.json
    image_base64 = data.get('image_base64') # Foto (depan/kiri/kanan)
    id_murid = data.get('id_murid')       # (Misal: 'murid_12345')
    nama_murid = data.get('nama')         # (Misal: 'Budi')
    
    # 2. Panggil "Penerjemah"
    face_encoding = image_base64_to_encoding(image_base64)
    
    # 3. Cek hasil "Penerjemah"
    if face_encoding is not None:
        # --- SUKSES NEMU MUKA ---
        
        # (Nanti di sini Abang SIMPEN KE DATABASE)
        # (Contoh: db.save(id_murid, nama_murid, face_encoding))
        
        # (Sementara, kita simpen di RAM)
        known_face_encodings.append(face_encoding)
        known_face_metadata.append({"id_murid": id_murid, "nama": nama_murid})
        
        print(f"SUKSES DAFTAR: {nama_murid} (ID: {id_murid})")
        return jsonify({"status": "sukses", "message": f"{nama_murid} terdaftar"}), 200
    else:
        # --- GAGAL NEMU MUKA ---
        print(f"GAGAL DAFTAR: Wajah tidak terdeteksi untuk {nama_murid}")
        return jsonify({"status": "gagal", "message": "Wajah tidak terdeteksi"}), 400
    
@app.route('/login-wajah', methods=['POST'])
def login_wajah():
    # 1. Ambil "bungkusan" data (cuma 1 foto)
    data = request.json
    image_base64 = data.get('image_base64')
    
    # 2. Panggil "Penerjemah"
    unknown_encoding = image_base64_to_encoding(image_base64)
    
    # 3. Cek hasil "Penerjemah"
    if unknown_encoding is None:
        # Gagal nemu muka di foto
        print("LOGIN GAGAL: Wajah tidak terdeteksi")
        return jsonify({"status": "gagal", "message": "Wajah tidak terdeteksi"}), 400
        
    # 4. --- INI INTI LOGIKA LOGIN ---
    # Bandingin 1 "sidik jari" baru ini
    # ke SEMUA "sidik jari" yang ada di 'known_face_encodings'
    #
    # Hasil 'matches' itu [True, False, False, True]
    # 'tolerance=0.5' = tingkat kemiripan (makin kecil makin ketat)
    
    matches = face_recognition.compare_faces(known_face_encodings, unknown_encoding, tolerance=0.5)
    
    found_murid = None
    if True in matches:
        # --- MUKA COCOK ---
        # Ambil 'index' (posisi) pertama yang 'True'
        first_match_index = matches.index(True)
        
        # Ambil data murid (nama/id) di 'index' yang sama
        found_murid = known_face_metadata[first_match_index]
        
        print(f"LOGIN SUKSES: {found_murid['nama']}")
        return jsonify({"status": "sukses", "murid": found_murid}), 200
    else:
        # --- MUKA GAK COCOK ---
        print("LOGIN GAGAL: Wajah tidak dikenal")
        return jsonify({"status": "gagal", "message": "Wajah tidak dikenal"}), 404
    
# Route untuk halaman menu utama
@app.route('/')
def menu():
    """Menampilkan halaman daftar game."""
    return redirect("https://cloudsup.framer.website/dashboard", code=302)

#------------------------------------------ es krim ------------------------------------
@app.route('/tangkap-game')
def tangkap_game():
    """Menampilkan halaman game."""
    return render_template('eskrim.jinja')

#------------------------------------------ gelembung ------------------------------------

@app.route('/gelembung-game')
def gelembung_game():
    """Menampilkan halaman game."""
    return render_template('gelembung.jinja')

#------------------------------------------ papan ------------------------------------

@app.route('/papan-game')
def papan_game():
    """Menampilkan halaman game."""
    return render_template('papan.jinja')

@app.route('/kartu-game')
def kartu_game():
    """Menampilkan halaman game."""
    return render_template('kartu.jinja')

@app.route('/analytics/save', methods=['POST'])
def save_analytics():
    """
    Menerima "bungkusan" data analisis dari Result.js,
    menghitung heatmap, dan menyimpannya.
    """
    
    # 1. Terima "bungkusan" datanya
    data = request.json
    
    print("Data diterima dari game:", json.dumps(data, indent=2))

    # 2. Ambil data mentah heatmap
    raw_heatmap_data = data.get('rawHeatmap')

    if raw_heatmap_data:
        # heatmap
        grid_scores = calculate_heatmap_grid(raw_heatmap_data)
        data['processedHeatmapGrid'] = grid_scores
        print("Hasil Kalkulasi Grid (0-100):", grid_scores)

        # hand dominance
        hand_dominance = calculate_hand_dominance(raw_heatmap_data)
        data['processedHandDominance'] = hand_dominance
        print("Hasil Dominasi Tangan (Kiri vs Kanan):", hand_dominance)
    
    # 5. (Nanti di sini Abang simpen 'data' ke database)
    # save_to_db(data)
    
    # 6. Kasih jawaban "OK" ke Result.js
    return jsonify({"status": "sukses", "message": "Data analisis diterima"}), 200

# -----------------------------------------------------------------------------
# ▼▼▼ INI "RUMUS GRID" (0-100) VERSI PYTHON ▼▼▼
# -----------------------------------------------------------------------------
def calculate_heatmap_grid(raw_heatmap, num_cols=4, num_rows=4):
    """
    Mengolah ribuan titik {x, y, t} menjadi grid skor 0-100
    sesuai gambar Abang (4 kolom, 3 baris).
    """
    
    # Langkah 1: Siapkan "Ember" Grid (4x4)
    grid_counts = [[0 for _ in range(num_cols)] for _ in range(num_rows)]
    
    # Langkah 2: "Plot" Ribuan Titik ke Grid (Binning)
    for point in raw_heatmap:
        x = point.get('x', 0) # (Nilai 0.0 - 1.0)
        y = point.get('y', 0) # (Nilai 0.0 - 1.0)
        
        col_index = min(int(x * num_cols), num_cols - 1)
        row_index = min(int(y * num_rows), num_rows - 1)
        
        grid_counts[row_index][col_index] += 1
        
    # Langkah 3: Cari Titik "Terpanas" (max) dan "Terdingin" (min)
    all_counts = [count for row in grid_counts for count in row]
    min_count = min(all_counts)
    max_count = max(all_counts)
    
    # Jaga-jaga biar gak dibagi 0
    if max_count == min_count:
        # (Semua kotak panasnya sama, jadi 50 aja)
        return [[50 for _ in range(num_cols)] for _ in range(num_rows)]

    # Langkah 4: Normalisasi (Rumus 0-100)
    grid_scores = [[0 for _ in range(num_cols)] for _ in range(num_rows)]
    for r in range(num_rows):
        for c in range(num_cols):
            count = grid_counts[r][c]
            # Rumus: ((Angka Asli - min) / (max - min)) * 100
            score = ((count - min_count) / (max_count - min_count)) * 100
            grid_scores[r][c] = round(score, 1) # (dibulatin 1 angka desimal)
            
    return grid_scores

def calculate_hand_dominance(raw_heatmap):
    """
    Menghitung persentase data poin tangan Kiri vs Kanan
    dari data mentah {hand: "Left" / "Right"}.
    """
    left_hand_count = 0
    right_hand_count = 0

    if not raw_heatmap:
        return {"left_percent": 0, "right_percent": 0}

    # Langkah 1: "Turus" (Tally) data Kiri vs Kanan
    for point in raw_heatmap:
        hand = point.get('hand') # (Isinya "Left" atau "Right")
        if hand == 'Left':
            left_hand_count += 1
        elif hand == 'Right':
            right_hand_count += 1
            
    # Langkah 2: Hitung Total
    total_hand_points = left_hand_count + right_hand_count

    # Jaga-jaga biar gak dibagi 0
    if total_hand_points == 0:
        return {"left_percent": 0, "right_percent": 0}

    # Langkah 3: Hitung Persentase (Rumus)
    # Rumus: (Jumlah Tangan / Total) * 100
    left_percentage = (left_hand_count / total_hand_points) * 100
    right_percentage = (right_hand_count / total_hand_points) * 100

    return {
        "left_percent": round(left_percentage, 1),  # (dibulatin, misal: 43.4)
        "right_percent": round(right_percentage, 1) # (misal: 56.6)
    }

# Menjalankan server saat script dieksekusi
if __name__ == '__main__':
    # Debug=True agar server otomatis restart saat ada perubahan kode
    app.run(debug=True)
