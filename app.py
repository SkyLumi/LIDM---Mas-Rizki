# app.py
from flask import Flask, render_template, redirect
import os # (Buat 'secret_key')

# 1. "Panggil" Lemari Abang
from api_auth import auth_bp
from api_analytics import analytics_bp
from extensions import db
from flask_migrate import Migrate

# 2. Bikin "Kamar" (Aplikasi Utama)
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 
    'postgresql://postgres:123@localhost:5432/cloudsup' # (Ganti ini)
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'ayang_geprek_bu_deka_enak_dan_lezat_bisa_beli_di_jember_teman_teman')

app.config['UPLOAD_FOLDER'] = 'static/encodings' 
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 5. "Colok" Mandor ke Kamar
db.init_app(app)

migrate = Migrate(app, db)

# 4. "Masukin" Lemari ke Kamar
app.register_blueprint(auth_bp, url_prefix='/v1') # (Semua API auth jadi /v1/guru/login)
app.register_blueprint(analytics_bp)              # (API analytics tetep /analytics/save)


# -----------------------------------------------------------------
# (Route "Biasa" / Non-API, Abang taruh di sini aja Gak apa-apa)
# -----------------------------------------------------------------

@app.route('/')
def menu():
    return redirect("http://127.0.0.1:5173/dashboard", code=302)

@app.route('/tangkap-game')
def tangkap_game():
    return render_template('eskrim.jinja')

@app.route('/gelembung-game')
def gelembung_game():
    return render_template('gelembung.jinja')

@app.route('/papan-game')
def papan_game():
    return render_template('papan.jinja')

@app.route('/kartu-game')
def kartu_game():
    return render_template('kartu.jinja')

# -----------------------------------------------------------------
# (Kode buat 'jalanin' server)
# -----------------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True)