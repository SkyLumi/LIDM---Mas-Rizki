from flask import Flask, render_template, redirect

# Inisialisasi aplikasi Flask
app = Flask(__name__)

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

# Menjalankan server saat script dieksekusi
if __name__ == '__main__':
    # Debug=True agar server otomatis restart saat ada perubahan kode
    app.run(debug=True)
