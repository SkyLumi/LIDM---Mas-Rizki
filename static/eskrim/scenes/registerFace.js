import FaceMeshManager from './faceMeshManager.js'; // <-- IMPORT MANAGER

export class RegisterFace extends Phaser.Scene {
    constructor() {
        super('RegisterFace');
        
        // --- Properti Face Mesh ---
        this.faceMeshManager = null;
        this.videoElement = null;
        this.canvasElement = null;
        
        // --- Properti UI Dinamis ---
        this.infoText = null;
        this.instructionText = null;
        this.actionButton = null;

        // --- Properti State (Ingetan) ---
        this.registerStep = 'depan'; // ('depan', 'kiri', 'kanan', 'selesai')
        this.currentPose = 'unknown';
        this.isStepReady = false; // (Buat 'ngunci' auto-jepret & nyalain tombol)

        this.poseStableCounter = 0; // (Timer-nya)
        this.POSE_STABILITY_THRESHOLD = 30;
        
        this.snapshotData = {
            nama: null,
            id_murid: null,
            foto_depan: null,
            foto_kiri: null,
            foto_kanan: null
        };
    }

    create() {
        const { width, height } = this.sys.game.config;
        
        // --- 1. Minta Nama DULUAN ---
        const nama = prompt("Masukkan Nama Murid:");
        if (!nama) {
            this.scene.start('MainMenu');
            return;
        }
        this.snapshotData.nama = nama;
        this.snapshotData.id_murid = `murid_${Date.now()}`;

        // --- 2. Tampilan UI ---
        this.add.text(width / 2, 100, `Daftar: ${nama}`, {
            fontSize: '48px', fill: '#fff'
        }).setOrigin(0.5);

        this.instructionText = this.add.text(width / 2, 160, 'Langkah 1: Hadap DEPAN', {
            fontSize: '32px', fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.infoText = this.add.text(width / 2, 210, 'Posisikan wajah...', {
            fontSize: '24px', fill: '#ffff00'
        }).setOrigin(0.5);

        // --- 3. Tombol Aksi (LANJUT / SELESAI) ---
        this.actionButton = this.add.text(width / 2, height / 2 + 50, '...', {
            fontSize: '40px', fill: '#555', backgroundColor: '#333' // Awalnya mati
        }).setOrigin(0.5).setPadding(20).setInteractive({ useHandCursor: false });
        
        this.actionButton.on('pointerdown', () => this.handleNextStep());
        this.actionButton.disableInteractive();

        // --- 4. Tombol Skip ---
        const skipButton = this.add.text(width / 2, height - 100, 'Batal & Lanjut ke Login >>', {
            fontSize: '24px', fill: '#aaa'
        }).setOrigin(0.5).setInteractive();
        skipButton.on('pointerdown', () => {
            this.faceMeshManager.stop();
            this.scene.start('MainMenu');
        });

        // --- 5. Inisialisasi Face Mesh (Pake Manager) ---
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('snapshotCanvas');
        this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
    }

    update(time, delta) {
        // (Kosong, Manager udah ngurusin 'send' di background)
    }

    onFaceResults(results) {
        if (this.isStepReady || this.registerStep === 'selesai') return;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            this.currentPose = this.calculateFaceYaw(landmarks);

            let poseMatches = false;
            if (this.registerStep === 'depan' && this.currentPose === 'depan') poseMatches = true;
            else if (this.registerStep === 'kiri' && this.currentPose === 'kiri') poseMatches = true;
            else if (this.registerStep === 'kanan' && this.currentPose === 'kanan') poseMatches = true;

            // 3. --- LOGIKA "SABAR" (BARU) ---
            if (poseMatches) {
                // POSE BENER -> Tambah "Timer Sabar"
                this.poseStableCounter++;
                
                // Kasih feedback ke anak (persentase)
                let progress = Math.floor((this.poseStableCounter / this.POSE_STABILITY_THRESHOLD) * 100);
                this.infoText.setText(`Tahan Posisi... ${progress}%`);
                this.infoText.setColor('#00ff00');

                // Kalo "Timer Sabar" udah penuh (misal 30 frame)
                if (this.poseStableCounter >= this.POSE_STABILITY_THRESHOLD) {
                    // --- AUTO JEPRET ---
                    this.autoJepretFoto(); 
                }
            
            } else {
                // POSE SALAH -> Reset "Timer Sabar"
                this.poseStableCounter = 0; 
                this.infoText.setText(`Posisikan wajah... (Terdeteksi: ${this.currentPose})`);
                this.infoText.setColor('#ffff00');
            }
        
        } else {
            // Muka gak kedetek -> Reset "Timer Sabar"
            this.poseStableCounter = 0;
            this.infoText.setText('Wajah tidak terdeteksi...');
            this.infoText.setColor('#ff0000');
        }
    }

    // --- FUNGSI "AUTO JEPRET" (BARU) ---
    autoJepretFoto() {
        // 1. Ambil foto
        const snapshot = this.takeSnapshot();
        if (!snapshot || snapshot === 'data:,') {
            alert('Gagal ambil foto, video belum siap. Coba lagi.');
            return;
        }

        // 2. Simpen fotonya
        if (this.registerStep === 'depan') {
            this.snapshotData.foto_depan = snapshot;
            this.infoText.setText('FOTO DEPAN DIAMBIL!');
            this.actionButton.setText('LANJUT (ke Foto Kiri)');

        } else if (this.registerStep === 'kiri') {
            this.snapshotData.foto_kiri = snapshot;
            this.infoText.setText('FOTO KIRI DIAMBIL!');
            this.actionButton.setText('LANJUT (ke Foto Kanan)');

        } else if (this.registerStep === 'kanan') {
            this.snapshotData.foto_kanan = snapshot;
            this.infoText.setText('FOTO KANAN DIAMBIL! Data Lengkap.');
            this.actionButton.setText('SELESAI & DAFTAR').setFill('#ffff00');
        }
        
        // 3. "Kunci" auto-jepret & Nyalain tombol
        this.isStepReady = true;
        this.infoText.setColor('#00ff00');
        this.actionButton.setInteractive({ useHandCursor: true }).setFill('#00ff00');
    }

    // --- FUNGSI "RUMUS YAW" (Gak Berubah) ---
    calculateFaceYaw(landmarks) {
        // Landmark Pipi Kiri (User's Left) = 234
        // Landmark Pipi Kanan (User's Right) = 454
        const zLeft = landmarks[234].z;
        const zRight = landmarks[454].z;
        const zDiff = zLeft - zRight;
        const YAW_THRESHOLD = 0.04;
        
        if (zDiff > YAW_THRESHOLD) return 'kanan'; 
        else if (zDiff < -YAW_THRESHOLD) return 'kiri';
        else return 'depan';
    }
    
    // --- FUNGSI "NEXT STEP" (Jadi "Bodoh") ---
    handleNextStep() {
        if (!this.isStepReady) return; // (Jaga-jaga)

        // Reset tombol & "kunci"
        this.actionButton.disableInteractive().setFill('#555').setText('...');
        this.isStepReady = false; 

        this.poseStableCounter = 0

        // Ganti langkah
        if (this.registerStep === 'depan') {
            this.registerStep = 'kiri';
            this.instructionText.setText('Langkah 2: Toleh ke KIRI');
            this.infoText.setText('Posisikan wajah...');

        } else if (this.registerStep === 'kiri') {
            this.registerStep = 'kanan';
            this.instructionText.setText('Langkah 3: Toleh ke KANAN');
            this.infoText.setText('Posisikan wajah...');

        } else if (this.registerStep === 'kanan') {
            this.registerStep = 'selesai';
            this.infoText.setText('Memproses...');
            this.actionButton.disableInteractive().setFill('#555').setText('MENGIRIM...');
            
            this.sendDataToAPI(this.snapshotData);
        }
    }

    async sendDataToAPI(data) {
        const { id_murid, nama } = data;
        const photos = [
            { pose: 'depan', image: data.foto_depan },
            { pose: 'kiri', image: data.foto_kiri },
            { pose: 'kanan', image: data.foto_kanan }
        ];

        try {
            // Kita looping dan tembak 3 foto, SATU PER SATU
            for (let i = 0; i < photos.length; i++) {
                const photoData = photos[i];
                
                // Update UI biar anak-nya nunggu
                this.infoText.setText(`Mengirim foto ${photoData.pose}... (${i + 1}/3)`);
                
                const response = await fetch('http://127.0.0.1:5000/register-wajah', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        image_base64: photoData.image,
                        id_murid: id_murid, // <-- ID SAMA
                        nama: nama          // <-- NAMA SAMA
                    })
                });

                const result = await response.json();

                // Kalo 1 aja gagal, stop
                if (!response.ok) {
                    throw new Error(`Foto ${photoData.pose} gagal: ${result.message}`);
                }
            }

            // --- KALO SEMUA 3 FOTO SUKSES ---
            this.instructionText.setText('Registrasi Selesai!');
            this.actionButton.setText('TERDAFTAR').setFill('#555');
            this.infoText.setText('Silakan lanjut ke Menu Utama.');
            alert('Sukses! 3 foto berhasil didaftarkan.');
        
        } catch (error) {
            // --- KALO ADA YANG GAGAL ---
            console.error('API Gagal Nembak:', error);
            alert(`GAGAL: ${error.message}`);
            
            // "Buka Kunci" tombolnya biar bisa nyoba 'SELESAI' lagi
            this.infoText.setText('Gagal daftar. Coba lagi.');
            this.actionButton.setText('SELESAI & DAFTAR')
                .setInteractive({ useHandCursor: true}).setFill('#ff0000');
            this.isStepReady = true; // (Buka kunci 'handleNextStep')
            this.registerStep = 'kanan'; // (Mundur 1 langkah biar bisa diklik lagi)
        }
    }

    // --- FUNGSI "NGEFOTO" (Gak Berubah) ---
    takeSnapshot() {
        if (this.videoElement.readyState < 3 || this.videoElement.videoWidth === 0) {
            console.error("Snapshot Gagal: Video belum siap.");
            return null;
        }
        const ctx = this.canvasElement.getContext('2d');
        const videoWidth = this.videoElement.videoWidth;
        const videoHeight = this.videoElement.videoHeight;
        this.canvasElement.width = videoWidth;
        this.canvasElement.height = videoHeight;
        ctx.translate(videoWidth, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.videoElement, 0, 0, videoWidth, videoHeight);
        return this.canvasElement.toDataURL('image/jpeg', 0.8);
    }
}