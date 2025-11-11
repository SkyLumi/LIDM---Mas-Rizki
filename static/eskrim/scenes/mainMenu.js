import FaceMeshManager from './faceMeshManager.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu')

        this.faceMeshManager = null;
        this.videoElement = null;
        this.canvasElement = null;

        this.welcomeText = null;
        this.infoText = null;
        this.playButton = null;

        this.currentMuridId = null;
        this.loginState = 'SEARCHING';

        this.faceLostCounter = 0;
        this.FACE_LOST_THRESHOLD = 120;
    }

    create() {
        const { width, height } = this.sys.game.config

        let screenCenterX = width / 2
        let screenCenterY = height / 2

        this.add.image(screenCenterX, screenCenterY, 'menuBG')
            .setScale(0.77)

        this.add.image(screenCenterX + 25, screenCenterY + 10, 'titleBox')
            .setScale(0.38)

        let buttonContainer = this.add.container(screenCenterX, screenCenterY + 240)

        const playButton = this.add.image(-360, 0, 'playButton')
            .setScale(0.8)
            .setInteractive()

        const settingsButton = this.add.image(0, 0, 'settingsButton')
            .setScale(0.8)
            .setInteractive()

        const quitButton = this.add.image(360, 0, 'quitButton')
            .setScale(0.8)
            .setInteractive()

        buttonContainer.add([playButton, settingsButton, quitButton])

        //              Hover Animation               //

        const normalScale = 0.8;
        const hoverScale = 0.9;
        const tweenDuration = 100;

        playButton.on('pointerover', () => {
            this.tweens.add({
                targets: playButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        playButton.on('pointerout', () => {
            this.tweens.add({
                targets: playButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        settingsButton.on('pointerover', () => {
            this.tweens.add({
                targets: settingsButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        settingsButton.on('pointerout', () => {
            this.tweens.add({
                targets: settingsButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        quitButton.on('pointerover', () => {
            this.tweens.add({
                targets: quitButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        quitButton.on('pointerout', () => {
            this.tweens.add({
                targets: quitButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        //              Click Logic                // 
        playButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        settingsButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        quitButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        this.welcomeText = this.add.text(width / 2, 100, 'Selamat Datang!', {
            fontSize: '48px', fill: '#fff'
        }).setOrigin(0.5);

        this.infoText = this.add.text(width / 2, 160, 'Mencari wajah...', {
            fontSize: '24px', fill: '#ffff00'
        }).setOrigin(0.5);

        // --- 3. Tombol "Daftar" (Gak berubah) ---
        const registerButton = this.add.text(width / 2, height - 100, 'Daftar Wajah Baru <<', {
            fontSize: '24px', fill: '#aaa'
        }).setOrigin(0.5).setInteractive();
        
        registerButton.on('pointerdown', () => {
            this.faceMeshManager.stop();
            this.scene.start('RegisterFace');
        });

        // --- 4. Inisialisasi Face Mesh (Pake Manager) ---
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('snapshotCanvas');
        this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));

        if (!this.bgm) {
            this.bgm = this.sound.add('bgm-main-loop', { 
                loop: true, 
                volume: 1
            });
            this.bgm.play();
        }
    }

    onFaceResults(results) {
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            // --- WAJAH KEDETEK ---
            this.faceLostCounter = 0;
            
            // Kalo kita lagi 'SEARCHING'
            if (this.loginState === 'SEARCHING' || this.loginState === 'FAILED') {
                const landmarks = results.multiFaceLandmarks[0];
                const currentPose = this.calculateFaceYaw(landmarks);

                if (currentPose === 'depan') {
                    // Muka lurus DITEMUKAN!
                    // 1. "Kunci" state-nya
                    this.loginState = 'LOGGING_IN'; 
                    // 2. LANGSUNG TEMBAK
                    this.attemptLogin(); 
                } else {
                    // Muka miring
                    this.infoText.setText('Posisikan wajah lurus ke DEPAN...');
                }
            }
            // (Kalo state 'LOGGING_IN' atau 'LOGGED_IN', kita diem aja)
            
        } else {
            // --- WAJAH GAK KEDETEK ---
            
            // Kalo kita lagi 'LOGGED_IN' (atau 'FAILED') dan mukanya ilang
            if (this.loginState === 'LOGGED_IN') {
                this.handleLogout(); // Panggil fungsi logout
            }

            if ((this.loginState === 'SEARCHING' || this.loginState === 'FAILED') 
                && this.faceLostCounter > this.FACE_LOST_THRESHOLD) 
            {
                // --- INI DIA "HARD RESET" (JURUS ABANG) ---
                console.warn("Wajah 'stuck' gak kedeteksi. Melakukan Hard Reset MediaPipe...");
                
                this.faceLostCounter = 0; // Reset timer
                
                // Kita "Reboot" Manager-nya
                this.faceMeshManager.stop();
                this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
                
                this.infoText.setText('Kamera di-reset. Mencari wajah...');
            }
        }
    }

    // --- FUNGSI "NEMBAK API" LOGIN ---
    async attemptLogin() {
        this.infoText.setText('Mencocokkan wajah...');
        
        const imageBase64 = this.takeSnapshot();
        if (!imageBase64 || imageBase64 === 'data:,') {
            this.infoText.setText('Gagal ambil foto. Coba lagi.');
            this.loginState = 'SEARCHING'; // Buka kunci
            return;
        }
        
        try {
            const response = await fetch('http://127.0.0.1:5000/login-wajah', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: imageBase64 })
            });
        
            const result = await response.json();
        
            if (!response.ok) {
                // (Misal: "Wajah tidak dikenal")
                throw new Error(result.message); 
            }
        
            // --- LOGIN SUKSES ---
            this.loginState = 'LOGGED_IN';
            this.currentMuridId = result.murid.id_murid;
            
            // Update UI
            this.welcomeText.setText(`Halo, ${result.murid.nama}!`);
            this.infoText.setText('Login sukses. Silakan mulai.');
            this.infoText.setColor('#00ff00');
        
        } catch (error) {
            // --- LOGIN GAGAL ---
            this.loginState = 'FAILED';
            this.infoText.setText(error.message); // (Misal: "Wajah tidak dikenal")
            this.infoText.setColor('#ff0000');
        }
    }

    // --- FUNGSI "LOGOUT" (BARU) ---
    handleLogout() {
        console.log("LOGOUT: Wajah hilang, reset ke 'SEARCHING'.");
        this.loginState = 'SEARCHING';
        this.currentMuridId = null;
        
        // Reset UI
        this.welcomeText.setText('Selamat Datang!');
        this.infoText.setText('Mencari wajah...');
        this.infoText.setColor('#ffff00');
        
    }

    // --- FUNGSI "RUMUS YAW" (Sama kayak Register) ---
    calculateFaceYaw(landmarks) {
        const zLeft = landmarks[234].z;
        const zRight = landmarks[454].z;
        const zDiff = zLeft - zRight;
        const YAW_THRESHOLD = 0.04;
        
        if (zDiff > YAW_THRESHOLD) return 'kanan'; 
        else if (zDiff < -YAW_THRESHOLD) return 'kiri';
        else return 'depan';
    }
    
    // --- FUNGSI "NGEFOTO" (Sama kayak Register) ---
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