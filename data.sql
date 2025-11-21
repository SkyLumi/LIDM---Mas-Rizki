INSERT INTO public."Role" (id_role, nama_role) VALUES
(1, 'Admin'),
(2, 'Guru'),
(3, 'Murid');

INSERT INTO public."Asal_Sekolah" (id_sekolah, nama_sekolah) VALUES
(1, 'SLB Negeri Jember'),
(2, 'SLB Negeri Branjangan'),
(3, 'SLB-C TPA Jember'),
(4, 'SLB Starkids Jember'),
(5, 'SLB ABC Balung'),
(6, 'SLB Harapan Pelangi'),
(7, 'SDLB-BCD YPAC');

INSERT INTO public."Games_Dashboard" (id_games_dashboard, nama_game, meta_description, deskripsi, thumbnail) VALUES
(1, 'GELEMBUNG AJAIB', 'Masuki dunia yang penuh gelembung!', 'Masuk ke dunia mandi penuh gelembung dan bersiaplah untuk keseruan tanpa batas! 💦 Tugasmu sederhana: pecahkan sebanyak mungkin gelembung sebelum waktu habis. Tapi awas—gelembung merah siap menggagalkan misi dengan sekali sentuh! Kumpulkan skor tertinggi, asah refleksmu, dan jadikan rutinitas harian makin seru. Pegang tongkat gelembungmu, dan mulai ledakkan semua gelembung ajaib sekarang! ✨🫧', 'image.jpg'),
(2, 'TANGKAP RASA', 'Penangkapan Es Krim Terhebat!', 'Siap jadi penjaga es krim terhebat di dunia? Pakai apronmu dan tangkap semua rasa yang jatuh dari langit! Gerakkan ember ke kiri dan kanan untuk mengumpulkan scoop sebanyak-banyaknya sebelum terlambat. Tapi awas… bola merah pengacau siap menghancurkan mimpimu dalam satu sentuhan! Jaga fokus, kumpulkan rasa favoritmu, dan buktikan bahwa kamu adalah master penangkap es krim sejati! 🍨✨', 'image.jpg'),
(3, 'PAPAN SEIMBANG', 'Persiapan, Mulai, Seimbangkan!', 'Seberapa kuat keseimbanganmu? Tantang fokus dan koordinasi tubuhmu untuk menjaga papan tetap stabil saat berbagai objek datang menyerang dari segala arah. Ambil posisi plank, tahan ritme tubuhmu, dan lihat seberapa lama kamu bisa bertahan tanpa jatuh! Tetap stabil, tetap fokus — dan buktikan kalau kamu adalah si penguasa keseimbangan sesungguhnya! 💪✨', 'image.jpg'),
(4, 'KARTU COCOK', 'Waktunya memanfaatkan ingatanmu!', 'Siapkan ingatan terbaikmu! Balik setiap kartu satu per satu untuk mencari pasangan yang cocok dan kumpulkan skor setinggi mungkin. Fokus, ingat letaknya, dan buat strategi untuk menang dengan percobaan seminimal mungkin. Semakin banyak pasangan yang kamu temukan, semakin cepat kamu naik ke level yang lebih sulit dan menantang! Bisakah otakmu tetap tajam sampai akhir? Saatnya membuktikan kemampuan memorimu! ✨🃏', 'image.jpg');

INSERT INTO public."Jenis_Hambatan" (id_hambatan, jenis_hambatan) VALUES
(1, 'Attention Deficit Hyperactivity Disorder (ADHD)'),
(2, 'Gangguan Spektrum Autisme (ASD)'),
(3, 'Development Coordination Disorder (DCD)'),
(4, 'Cerebral Palsy (CD)'),
(5, 'Down Syndrome (DS)');

INSERT INTO public."Pengguna" (id_pengguna, email, password, id_role) VALUES
(1, 'dinamustawati25@gmail.com', 'pbkdf2:sha256:1000000$IO28EZJBAk7W18qf$a934e0247cc1ac21c564ce18e2b97b7849721637d83cca215ee663cfb72bbfe9', 2);

INSERT INTO public."Keterampilan" (id_keterampilan, nama_keterampilan, deskripsi) VALUES
(1, 'fokus', 'kemampuan untuk berkonsentrasi terhadap obyek virtual'),
(2, 'koordinasi tangan-mata', 'kemampuan untuk mengkoordinasikan tangan dan mata untuk mencetak poin'),
(3, 'waktu reaksi', 'jangka waktu dalam interaksi dengan obyek virtual'),
(4, 'keseimbangan', 'jangka waktu dalam menyeimbangkan obyek virtual'),
(5, 'ketangkasan', 'kelincahan untuk interaksi pada obyek virtual yang ada didasarkan pada heatmap'),
(6, 'memori', 'kemampuan mengingat anak saat bermain');

INSERT INTO public."Game_Keterampilan" (id_games_dashboard, id_keterampilan) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 5),
(2, 1),
(2, 2),
(2, 3),
(2, 5),
(3, 1),
(3, 2),
(3, 3),
(3, 4),
(3, 5),
(4, 6);

INSERT INTO public."Profil" (id_profil, nama_lengkap, nomor_absen, id_pengguna, avatar, face_id, kelas, id_hambatan, id_sekolah) VALUES
(1, 'Dina Mustiawati', null, 1, null, null, null, null, 1),
(2, 'Arkana Al-Husna', 1, 2, null, 'static/encodings\profil_4.npy', 5, 5, 1),
(3, 'Hana Sharifah', 2, 3, null, null, 4, 1, 1),
(4, 'Danentara Kusuma', 3, 4, null, null, 1, 1, 1),
(5, 'Agil Jordi Wardhana', 4, 5, null, null, 2, 1, 1),
(6, 'Ananda Mikhail', 5, 6, null, null, 6, 1, 1);