from flask import Blueprint, jsonify
from extensions import db
from models import AsalSekolah

master_bp = Blueprint('master_bp', __name__)

@master_bp.route('/master/sekolah', methods=['GET'])
def get_sekolah_list():
    try:
        sekolah_list = db.session.scalars(
            db.select(AsalSekolah).order_by(AsalSekolah.nama_sekolah.asc())
        ).all()
        
        data = [
            {"id": s.id_sekolah, "nama": s.nama_sekolah} 
            for s in sekolah_list
        ]

        return jsonify({"status": "sukses", "data": data}), 200
    except Exception as e:
        print(f"Error get sekolah: {e}")
        return jsonify({"status": "gagal", "message": "Server error"}), 500