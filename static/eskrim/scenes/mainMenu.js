import FaceMeshManager from './faceMeshManager.js';
import { API_BASE_URL, DASHBOARD_BASE_URL }  from '../../config.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu')

        this.faceMeshManager = null;
        this.videoElement = null;
        this.canvasElement = null;

        this.welcomeText = null;
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

        this.playButton = this.add.image(-360, 0, 'playButton')
            .setScale(0.8)
            .setTint(0x555555);

        this.settingsButton = this.add.image(0, 0, 'settingsButton')
            .setScale(0.8)
            .setInteractive()

        this.quitButton = this.add.image(360, 0, 'quitButton')
            .setScale(0.8)
            .setInteractive()

        buttonContainer.add([this.playButton, this.settingsButton, this.quitButton])

        //              Hover Animation               //

        const normalScale = 0.8;
        const hoverScale = 0.9;
        const tweenDuration = 100;

        this.playButton.on('pointerover', () => {
            this.tweens.add({
                targets: this.playButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        this.playButton.on('pointerout', () => {
            this.tweens.add({
                targets: this.playButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        this.settingsButton.on('pointerover', () => {
            this.tweens.add({
                targets: this.settingsButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        this.settingsButton.on('pointerout', () => {
            this.tweens.add({
                targets: this.settingsButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        this.quitButton.on('pointerover', () => {
            this.tweens.add({
                targets: this.quitButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        this.quitButton.on('pointerout', () => {
            this.tweens.add({
                targets: this.quitButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        //              Click Logic                // 
        this.playButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        this.settingsButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        this.quitButton.on('pointerdown', () => {
            window.location.href = `${DASHBOARD_BASE_URL}/teacher/games/tangkap-rasa`;
        })

        this.createProfileUI();
        
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

        this.events.once('shutdown', this.shutdown, this)
    }

    createProfileUI() {
        const { width } = this.sys.game.config;
        
        // Ukuran kotak profil
        const panelWidth = 550;
        const panelHeight = 180; // Sedikit lebih tinggi untuk 2 baris
        
        // Container di pojok kanan atas
        this.profileContainer = this.add.container(width - panelWidth, 0);
        this.profileContainer.setDepth(10); 

        const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x084EC5) 
            .setOrigin(0, 0);

        const labelText = this.add.text(25, 15, "Pemain saat ini", {
            fontSize: '38px', 
            fontFamily: 'RalewayBold',
            color: '#ffffff'
        });

        const avatarY = 110; 
        this.profileAvatar = this.add.circle(60, avatarY, 35, 0x00bcd4);

        this.profileNameText = this.add.text(110, avatarY, "...", {
            fontSize: '40px',
            fontFamily: 'Raleway',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        this.profileContainer.add([bg, labelText, this.profileAvatar, this.profileNameText]);

        // --- ANIMASI TITIK-TITIK MENCARI ---
        this.dotCount = 0;
        
        this.searchingEvent = this.time.addEvent({
            delay: 500, // Update setiap 0.5 detik
            loop: true,
            callback: () => {
                // Hanya animasi jika sedang SEARCHING
                if (this.loginState === 'SEARCHING') {
                    this.dotCount = (this.dotCount + 1) % 4; 
                    const count = (this.dotCount % 3) + 1;
                    const dots = ".".repeat(count);
                    this.profileNameText.setText(dots);
                }
            }
        });
    }

    onFaceResults(results) {

        if (!this.sys || !this.sys.settings.active) {
            return;
        }
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            // --- WAJAH KEDETEK ---
            this.faceLostCounter = 0;
            
            // Kalo kita lagi 'SEARCHING'
            if (this.loginState === 'SEARCHING' || this.loginState === 'FAILED') {
                const landmarks = results.multiFaceLandmarks[0];
                const currentPose = this.calculateFaceYaw(landmarks);

                if (currentPose === 'depan') {
                    this.loginState = 'LOGGING_IN'; 
                    this.attemptLogin(); 
                } else {
                    // Muka miring
                }
            }
            
        } else {
            if (this.loginState === 'LOGGED_IN') {
                this.handleLogout();
            }

            if ((this.loginState === 'SEARCHING' || this.loginState === 'FAILED') 
                && this.faceLostCounter > this.FACE_LOST_THRESHOLD) 
            {
                console.warn("Wajah 'stuck' gak kedeteksi. Melakukan Hard Reset MediaPipe...");
                
                this.faceLostCounter = 0;
                
                this.faceMeshManager.stop();
                this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
                            }
        }
    }

    async attemptLogin() {
        const imageBase64 = this.takeSnapshot();
        if (!imageBase64 || imageBase64 === 'data:,') {
            this.profileNameText.setText('Gagal foto...');
            this.profileNameText.setFontSize('24px');
            this.loginState = 'SEARCHING'; 
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/v1/login-wajah`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: imageBase64 })
            });
        
            const result = await response.json();
        
            if (!response.ok) {
                throw new Error(result.message || "Gagal Login"); 
            }
        
            // --- LOGIN SUKSES ---
            this.loginState = 'LOGGED_IN';
            
            this.registry.set('currentMuridId', result.murid.id_murid);
            this.registry.set('currentMuridNama', result.murid.nama);
            
            // TAMPILKAN NAMA PEMAIN (Dari hasil response API yang baru disimpan)
            this.profileNameText.setText(result.murid.nama);
            this.profileNameText.setFontSize('32px'); 
            this.profileNameText.setColor('#00ff00'); // Hijau
            
            // Ganti warna avatar ke hijau
            this.profileAvatar.setFillStyle(0x4caf50);

            // NYALAKAN TOMBOL PLAY
            if (this.playButton) {
                this.playButton.clearTint(); 
                this.playButton.setInteractive(); 
                
                this.tweens.add({
                    targets: this.playButton,
                    scale: { from: 0.75, to: 0.9 },
                    duration: 200,
                    yoyo: true,
                    onComplete: () => this.playButton.setScale(0.75)
                });
            }
        
        } catch (error) {
            // --- LOGIN GAGAL ---
            this.loginState = 'FAILED';
            this.profileNameText.setText("Wajah Tak Dikenal"); 
            this.profileNameText.setFontSize('24px');
            this.profileNameText.setColor('#ff0000'); 
            console.error("Login Error:", error);

            this.time.delayedCall(2000, () => {
                this.loginState = 'SEARCHING';
                this.profileNameText.setColor('#ffffff');
                this.profileNameText.setFontSize('48px');
                this.profileNameText.setText("...");
            });

            if (this.playButton) {
                this.playButton.setTint(0x555555);
                this.playButton.disableInteractive();
            }
        }
    }

    handleLogout() {
        console.log("LOGOUT: Wajah hilang, reset ke 'SEARCHING'.");
        this.loginState = 'SEARCHING';
        this.currentMuridId = null;
        
        this.profileNameText.setText('...');
        this.profileNameText.setFontSize('48px');
        this.profileNameText.setColor('#ffffff');
        this.profileAvatar.setFillStyle(0x00bcd4);

        if (this.playButton) {
            this.playButton.setTint(0x555555);
            this.playButton.disableInteractive();
        }
    }

    calculateFaceYaw(landmarks) {
        const zLeft = landmarks[234].z;
        const zRight = landmarks[454].z;
        const zDiff = zLeft - zRight;
        const YAW_THRESHOLD = 0.04;
        
        if (zDiff > YAW_THRESHOLD) return 'kanan'; 
        else if (zDiff < -YAW_THRESHOLD) return 'kiri';
        else return 'depan';
    }
    
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

    shutdown() {
        this.faceMeshManager.stop();
    }
}