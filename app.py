from flask import Flask, render_template

# Inisialisasi aplikasi Flask
app = Flask(__name__)

# Route untuk halaman menu utama
@app.route('/')
def menu():
    """Menampilkan halaman daftar game."""
    return render_template('menu.html')

#------------------------------------------ es krim ------------------------------------
@app.route('/eskrim-game')
def eskrim_game():
    """Menampilkan halaman game."""
    return render_template('eskrim.html')

#------------------------------------------ gelembung ------------------------------------

@app.route('/gelembung-game')
def gelembung_game():
    """Menampilkan halaman game."""
    return render_template('gelembung.html')

#------------------------------------------ papan ------------------------------------

@app.route('/papan-game')
def papan_game():
    """Menampilkan halaman game."""
    return render_template('papan.html')

# Menjalankan server saat script dieksekusi
if __name__ == '__main__':
    # Debug=True agar server otomatis restart saat ada perubahan kode
    app.run(debug=True)
