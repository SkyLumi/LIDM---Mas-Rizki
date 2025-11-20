from werkzeug.security import generate_password_hash

# Masukkan password baru yang abang mau
password_baru = "123456"

# Generate hash pake metode yang sama persis kayak di backend abang
hash_baru = generate_password_hash(password_baru, method='pbkdf2:sha256')

print("="*50)
print("PASSWORD ASLI:", password_baru)
print("HASH UTK DATABASE (Copy yang bawah ini):")
print(hash_baru)
print("="*50)