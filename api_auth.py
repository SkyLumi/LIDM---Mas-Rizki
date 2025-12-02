from extensions import db
from models import Pengguna, Profil, Role, AsalSekolah, JenisHambatan
from flask import Blueprint, request, jsonify, session, current_app
from functools import wraps
import face_recognition
import numpy as np
import base64
import io
from PIL import Image
import os
# --- BUAT GURU (BARU) ---
from werkzeug.security import check_password_hash, generate_password_hash

# 1. Bikin "Lemari"-nya
auth_bp = Blueprint('auth_bp', __name__)

def image_base64_to_encoding(image_base64):
    try:
        if ',' in image_base64:
            header, encoded = image_base64.split(",", 1)
        else:
            encoded = image_base64
        image_data = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(image_data))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        image_np = np.array(image)
        face_locations = face_recognition.face_locations(image_np)
        if not face_locations:
            return None
        face_encoding = face_recognition.face_encodings(image_np, known_face_locations=face_locations)[0]
        return face_encoding
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None
    
def guru_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 1. Cek ada 'user_id' di "ingetan" (session) gak
        if 'user_id' not in session:
            return jsonify({"status": "gagal", "message": "Akses ditolak. Silakan login."}), 401
            
        # 2. Cek 'role_id' di "ingetan"
        role_id_session = session.get('role_id')
        
        # 3. Ambil 'Role' Guru dari DB (biar dinamis)
        role_guru = db.session.scalar(db.select(Role).where(Role.nama_role == 'Guru'))
        
        if not role_guru or role_id_session != role_guru.id_role:
            return jsonify({"status": "gagal", "message": "Akses ditolak. Hanya Guru."}), 403 # 403 = Forbidden
            
        # --- Kalo lolos, lanjutin ---
        return f(*args, **kwargs)
    return decorated_function

# 5. "Pintu" Login Muka (ROMBAK)
@auth_bp.route('/login-wajah', methods=['POST'])
def login_wajah():
    data = request.json
    unknown_encoding = image_base64_to_encoding(data.get('image_base64'))
    
    if unknown_encoding is None:
        print("LOGIN GAGAL: Wajah tidak terdeteksi")
        return jsonify({"status": "gagal", "message": "Wajah tidak terdeteksi"}), 400
        
    try:
        # 1. Ambil SEMUA "Sidik Jari" dari DB
        stmt = db.select(Profil).where(Profil.face_id.isnot(None))
        all_profiles = db.session.scalars(stmt).all()
        
        if not all_profiles:
            print("LOGIN GAGAL: Belum ada wajah terdaftar di DB")
            return jsonify({"status": "gagal", "message": "Wajah tidak dikenal"}), 404

        # 2. "Muat" (Load) semua file .npy jadi "Database RAM" (Sementara)
        known_encodings = []
        known_metadata = []
        for profil in all_profiles:
            try:
                # (Ambil path dari DB, misal: 'static/encodings/profil_123.npy')
                encoding = np.load(profil.face_id) 
                known_encodings.append(encoding)
                known_metadata.append({"id_murid": profil.id_profil, "nama": profil.nama_lengkap})
            except Exception as e:
                print(f"Warning: Gagal load encoding file {profil.face_id}: {e}")
                
        # 3. Bandingin (Sama kayak kode lama Abang)
        matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.5)
        
        if True in matches:
            first_match_index = matches.index(True)
            found_murid = known_metadata[first_match_index]
            print(f"LOGIN SUKSES: {found_murid['nama']}")
            return jsonify({"status": "sukses", "murid": found_murid}), 200
        else:
            print("LOGIN GAGAL: Wajah tidak dikenal")
            return jsonify({"status": "gagal", "message": "Wajah tidak dikenal"}), 404
            
    except Exception as e:
        print(f"Error saat login wajah: {e}")
        return jsonify({"status": "gagal", "message": "Terjadi kesalahan server"}), 500

@auth_bp.route('/guru/register', methods=['POST'])
def guru_register():
    data = request.json
    email = data.get('email')
    nama_lengkap = data.get('nama_lengkap')
    kata_sandi = data.get('kata_sandi')
    id_sekolah = data.get('id_sekolah')
    
    cek_user = db.session.scalar(db.select(Pengguna).where(Pengguna.email == email))
    if cek_user:
         return jsonify({"status": "gagal", "message": "Email sudah terdaftar"}), 400

    hashed_password = generate_password_hash(kata_sandi, method='pbkdf2:sha256')
    
    try:
        role_guru = db.session.scalar(db.select(Role).where(Role.nama_role == 'Guru'))
        if not role_guru:
            return jsonify({"status": "gagal", "message": "Role Guru tidak ditemukan"}), 404

        new_user = Pengguna(email=email, password=hashed_password, id_role=role_guru.id_role)
        db.session.add(new_user)
        
        db.session.flush() 
        
        new_profil = Profil(
            id_pengguna=new_user.id_pengguna,
            nama_lengkap=nama_lengkap, 
            id_sekolah=id_sekolah
        )
        db.session.add(new_profil)
        
        db.session.commit()
        
        print(f"GURU BARU DIDAFTARKAN: {email}")
        return jsonify({"status": "sukses", "message": "Guru berhasil terdaftar"}), 201
        
    except Exception as e:
        db.session.rollback() # Rollback biar gak ada data 'yatim'
        print(f"Gagal daftar guru: {e}")
        return jsonify({"status": "gagal", "message": "Terjadi kesalahan saat mendaftar"}), 500


@auth_bp.route('/guru/login', methods=['POST'])
def guru_login():
    data = request.json
    email = data.get('email')
    kata_sandi = data.get('kata_sandi')


    user = db.session.scalar(db.select(Pengguna).where(Pengguna.email == email))
    
    # 2. Cek Kunci & Password (Pake 'user' asli)
    if not user or not check_password_hash(user.password, kata_sandi):
        print(f"Gagal login: {email}")
        return jsonify({"status": "gagal", "message": "Email atau kata sandi salah"}), 401
        
    # 3. Kalo sukses, "inget" dia (pake Session)
    session['user_id'] = user.id_pengguna
    session['role_id'] = user.id_role
    
    # 4. Cari profilnya buat dikirim balik (Pake "Jurus Baru")
    role = db.session.scalar(db.select(Role).where(Role.id_role == user.id_role))
    profil = db.session.scalar(db.select(Profil).where(Profil.id_pengguna == user.id_pengguna))
    sekolah = db.session.scalar(db.select(AsalSekolah).where(AsalSekolah.id_sekolah == profil.id_sekolah))
    
    if not profil:
        return jsonify({"status": "gagal", "message": "Profil pengguna tidak ditemukan"}), 404
    
    if not profil:
        return jsonify({"status": "gagal", "message": "Profil pengguna tidak ditemukan"}), 404
        
    print(f"GURU LOGIN SUKSES: {email}")
    return jsonify({
        "status": "sukses", 
        "message": "Login berhasil",
        "user": {
            "nama": profil.nama_lengkap,
            "nama_sekolah": sekolah.nama_sekolah,
            "email": email,
            "id_profil": profil.id_profil,
            "id_role": user.id_role,
            "role": role.nama_role
        }
    }), 200

@auth_bp.route('/guru/murid/tambah', methods=['POST'])
@guru_required
def guru_tambah_murid():
    data = request.json
    nama_lengkap = data.get('nama_lengkap')
    nomor_absen = data.get('nomor_absen')
    id_kelas = data.get('id_kelas')
    id_hambatan = data.get('id_hambatan')
    email_murid = data.get('email')
    password_murid = data.get('password') 
    image_base64 = data.get('image_base64') # (Opsional)
    
    if not nama_lengkap or not nomor_absen or not id_hambatan:
        return jsonify({"status": "gagal", "message": "Nama Depan, Absen, dan Hambatan wajib diisi."}), 400

    try:
        # 1. Ambil data Guru (Otomatis)
        guru_id_pengguna = session.get('user_id')
        profil_guru = db.session.scalar(
            db.select(Profil).where(Profil.id_pengguna == guru_id_pengguna)
        )
        if not profil_guru:
            return jsonify({"status": "gagal", "message": "Profil Guru tidak ditemukan."}), 404
        
        sekolah_otomatis = profil_guru.id_sekolah 

        # 2. Siapin "Kunci" (Pengguna) Murid
        if not email_murid:
            email_murid = None # (Aman, DB Abang udah nullable=True)
        else:
            # Kalo DIISI, baru cek duplikat
            user_exists = db.session.scalar(db.select(Pengguna).where(Pengguna.email == email_murid))
            if user_exists:
                return jsonify({"status": "gagal", "message": "Email murid sudah terdaftar."}), 400
        
        # Benerin Password
        hashed_password = None # Default-nya None (Aman, DB Abang udah nullable=True)
        if password_murid:
            # Kalo DIISI, baru di-hash
            hashed_password = generate_password_hash(password_murid, method='pbkdf2:sha256')
            
        role_murid = db.session.scalar(db.select(Role).where(Role.nama_role == 'Murid'))
        if not role_murid:
            return jsonify({"status": "gagal", "message": "Role 'Murid' tidak ditemukan"}), 500

        # 3. BUAT "KUNCI" & "PROFIL" (LANGKAH A)
        new_user_murid = Pengguna(email=email_murid, password=hashed_password, id_role=role_murid.id_role)
        db.session.add(new_user_murid)
        db.session.commit() # (Commit 1: Dapetin 'id_pengguna')

        new_profil_murid = Profil(
            id_pengguna=new_user_murid.id_pengguna,
            nama_lengkap=nama_lengkap,
            kelas=int(id_kelas),
            nomor_absen=int(nomor_absen), 
            id_hambatan=int(id_hambatan),
            id_sekolah=sekolah_otomatis
        )
        db.session.add(new_profil_murid)
        db.session.commit()

        if image_base64:
            face_encoding = image_base64_to_encoding(image_base64)
            if face_encoding is not None:
                filename = f"profil_{new_profil_murid.id_profil}.npy"
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                np.save(file_path, face_encoding)
                
                new_profil_murid.face_id = file_path
                db.session.commit()
                print(f"Berhasil simpan face encoding untuk: {nama_lengkap}")
            else:
                print(f"Warning: Wajah murid {nama_lengkap} ada, tapi tidak terdeteksi.")
        
        # 5. SELESAI
        print(f"GURU ({profil_guru.nama_lengkap}) berhasil mendaftarkan MURID: {nama_lengkap}")
        return jsonify({
            "status": "sukses", 
            "message": "Murid berhasil ditambahkan",
            "murid": {"id_profil": new_profil_murid.id_profil, "nama_lengkap": new_profil_murid.nama_lengkap}
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Gagal tambah murid: {e}")
        return jsonify({"status": "gagal", "message": "Terjadi kesalahan"}), 500

@auth_bp.route('/guru/murid/<int:id_profil>', methods=['PUT'])
@guru_required 
def guru_update_murid(id_profil):
    """
    API (HANYA GURU) untuk MENG-UPDATE data 'Pemain' / 'Murid'.
    (Ini "ditembak" pas Guru nge-klik 'Simpan' di form edit)
    """
    
    try:
        # --- 1. CARI MURID & GURU-NYA ---
        profil_murid = db.session.get(Profil, id_profil)
        if not profil_murid:
            return jsonify({"status": "gagal", "message": "Murid tidak ditemukan."}), 404

        guru_id_pengguna = session.get('user_id')
        profil_guru = db.session.scalar(
            db.select(Profil).where(Profil.id_pengguna == guru_id_pengguna)
        )
        
        # --- 2. JURUS KEAMANAN (PENTING!) ---
        # (Guru dari "SLB A" gak boleh ngedit murid "SLB B")
        if not profil_guru or profil_murid.id_sekolah != profil_guru.id_sekolah:
            return jsonify({"status": "gagal", "message": "Akses ditolak. Anda tidak berhak mengedit murid ini."}), 403

        # --- 3. AMBIL DATA BARU DARI FORM ---
        data = request.json
        
        # --- 4. UPDATE "PROFIL" (Data Gampang) ---
        # (Kita pake .get() biar "opsional", kalo gak diisi, gak berubah)
        if 'nama_lengkap' in data:
            profil_murid.nama_lengkap = data.get('nama_lengkap')
        if 'nomor_absen' in data:
            profil_murid.kelas = int(data.get('nomor_absen'))
        if 'id_hambatan' in data:
            profil_murid.id_hambatan = int(data.get('id_hambatan'))

        # --- 5. UPDATE "PENGGUNA" (Data Susah: Email/Pass) ---
        user_murid = db.session.get(Pengguna, profil_murid.id_pengguna)
        
        # A. Cek Email (Kalo "niat" diubah)
        if 'email' in data:
            new_email = data.get('email') or None 
            if new_email and new_email != user_murid.email:
                # Kalo email-nya BARU, cek duplikat
                user_exists = db.session.scalar(db.select(Pengguna).where(Pengguna.email == new_email))
                if user_exists:
                    return jsonify({"status": "gagal", "message": "Email baru tersebut sudah terdaftar."}), 400
            user_murid.email = new_email
            
        # B. Cek Password (Kalo "niat" diubah)
        if 'password' in data and data.get('password'): # Cek kalo diisi (bukan string kosong)
            new_pass = data.get('password')
            user_murid.password = generate_password_hash(new_pass, method='pbkdf2:sha256')

        # --- 6. UPDATE FOTO WAJAH (Kalo "niat" diubah) ---
        if 'image_base64' in data and data.get('image_base64'):
            image_base64 = data.get('image_base64')
            face_encoding = image_base64_to_encoding(image_base64)
            
            if face_encoding is not None:
                # (Timpa file .npy yang lama)
                filename = f"profil_{profil_murid.id_profil}.npy"
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                np.save(file_path, face_encoding)
                
                profil_murid.face_id = file_path # (Pastikan path-nya ke-update)
                print(f"Berhasil UPDATE face encoding untuk: {profil_murid.nama_lengkap}")
            else:
                print(f"Warning: Wajah murid {profil_murid.nama_lengkap} di-update, tapi tidak terdeteksi.")
        
        db.session.commit()
        
        print(f"GURU ({profil_guru.nama_lengkap}) berhasil MENG-UPDATE MURID: {profil_murid.nama_lengkap}")
        return jsonify({
            "status": "sukses", 
            "message": "Murid berhasil diupdate"
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Gagal update murid: {e}")
        return jsonify({"status": "gagal", "message": "Terjadi kesalahan"}), 500
    
@auth_bp.route('/guru/murid/<int:id_profil>', methods=['GET'])
@guru_required
def guru_get_murid_detail(id_profil):
    
    try:
        # --- 1. CARI MURID & GURU-NYA ---
        profil_murid = db.session.get(Profil, id_profil)
        if not profil_murid:
            return jsonify({"status": "gagal", "message": "Murid tidak ditemukan."}), 404

        guru_id_pengguna = session.get('user_id')
        profil_guru = db.session.scalar(
            db.select(Profil).where(Profil.id_pengguna == guru_id_pengguna)
        )
        
        # --- 2. JURUS KEAMANAN (SAMA KAYAK PUT) ---
        if not profil_guru or profil_murid.id_sekolah != profil_guru.id_sekolah:
            return jsonify({"status": "gagal", "message": "Akses ditolak."}), 403

        # --- 3. AMBIL DATA PENGGUNA (buat email) ---
        user_murid = db.session.get(Pengguna, profil_murid.id_pengguna)

        # --- 4. "BUNGKUS" JADI JSON ---
        data_murid = {
            "id_profil": profil_murid.id_profil,
            "nama_lengkap": profil_murid.nama_lengkap,
            "nomor_absen": profil_murid.kelas, # Kirim 'nomor_absen'
            "id_hambatan": profil_murid.id_hambatan,
            "email": user_murid.email
            # (PENTING: JANGAN PERNAH kirim 'password' hash!)
        }
        
        return jsonify({"status": "sukses", "murid": data_murid}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Gagal get murid detail: {e}")
        return jsonify({"status": "gagal", "message": "Terjadi kesalahan"}), 500
    
@auth_bp.route('/guru/murid/list', methods=['GET'])
@guru_required
def guru_get_murid_list():
    try:
        # 1. Cari Guru & Sekolahnya
        guru_id = session.get('user_id')
        profil_guru = db.session.scalar(db.select(Profil).where(Profil.id_pengguna == guru_id))
        
        if not profil_guru:
            return jsonify([]), 200 

        stmt = (
            db.select(Profil, Pengguna.email, Role.nama_role, JenisHambatan.jenis_hambatan)
            .join(Pengguna, Profil.id_pengguna == Pengguna.id_pengguna)
            .join(Role, Pengguna.id_role == Role.id_role)
            .outerjoin(JenisHambatan, Profil.id_hambatan == JenisHambatan.id_hambatan)
            .where(
                Profil.id_sekolah == profil_guru.id_sekolah,
                Role.nama_role == 'Murid'
            )
        )
        
        results = db.session.execute(stmt).all()
        
        list_murid = []
        for profil, email, role_name, nama_hambatan in results:
            list_murid.append({
                "id": profil.id_profil,
                "name": profil.nama_lengkap,
                "absen": str(profil.nomor_absen),
                "kelas": str(profil.kelas),
                "email": email,
                "disability": nama_hambatan if nama_hambatan else "-",
                "image": "",
                "password": ""
            })
            
        return jsonify(list_murid), 200

    except Exception as e:
        print(f"Error get murid: {e}")
        return jsonify({"message": "Gagal mengambil data"}), 500

@auth_bp.route('/guru/logout', methods=['POST'])
def guru_logout():
    """
    API Logout (Hapus Session)
    """
    session.clear() # SAPU BERSIH
    return jsonify({"status": "sukses", "message": "Berhasil logout"}), 200


@auth_bp.route('/guru/murid/<int:id_profil>', methods=['DELETE'])
@guru_required
def guru_delete_murid(id_profil):
    """
    API (HANYA GURU) Hapus Murid + File Wajah + Akun Login
    """
    try:
        # 1. Cari Muridnya
        profil_murid = db.session.get(Profil, id_profil)
        if not profil_murid:
            return jsonify({"status": "gagal", "message": "Murid tidak ditemukan"}), 404

        # 2. Cek Keamanan (Guru Sekolah A gaboleh hapus Murid Sekolah B)
        guru_id = session.get('user_id')
        guru_profil = db.session.scalar(db.select(Profil).where(Profil.id_pengguna == guru_id))
        
        if not guru_profil or profil_murid.id_sekolah != guru_profil.id_sekolah:
            return jsonify({"status": "gagal", "message": "Akses ditolak"}), 403

        # 3. HAPUS FILE WAJAH (Kalo ada)
        if profil_murid.face_id:
            try:
                # face_id isinya path (static/encodings/...)
                if os.path.exists(profil_murid.face_id):
                    os.remove(profil_murid.face_id)
                    print(f"File wajah dihapus: {profil_murid.face_id}")
            except Exception as e:
                print(f"Warning: Gagal hapus file wajah: {e}")

        # 4. HAPUS DATA DB
        # Kita hapus 'Pengguna' (Induknya), nanti 'Profil' (Anaknya)
        # otomatis kehapus karena 'ondelete=CASCADE' di models.py
        user_to_delete = db.session.get(Pengguna, profil_murid.id_pengguna)
        
        if user_to_delete:
            db.session.delete(user_to_delete)
            db.session.commit()
            return jsonify({"status": "sukses", "message": "Murid berhasil dihapus"}), 200
        else:
            # Jaga-jaga kalo datanya 'yatim' (punya profil gapunya user)
            db.session.delete(profil_murid)
            db.session.commit()
            return jsonify({"status": "sukses", "message": "Profil murid dihapus (User tidak ditemukan)"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error delete murid: {e}")
        return jsonify({"status": "gagal", "message": "Gagal menghapus data"}), 500

