import FaceMeshManager from './faceMeshManager.js';
import { API_BASE_URL }  from '../../config.js';

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

        this.events.once('shutdown', this.shutdown, this)
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
                    this.infoText.setText('Posisikan wajah lurus ke DEPAN...');
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
                
                this.infoText.setText('Kamera di-reset. Mencari wajah...');
            }
        }
    }

    async attemptLogin() {
        this.infoText.setText('Mencocokkan wajah...');
        
        const imageBase64 = this.takeSnapshot();
        if (!imageBase64 || imageBase64 === 'data:,') {
            this.infoText.setText('Gagal ambil foto. Coba lagi.');
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
                throw new Error(result.message); 
            }
        
            this.loginState = 'LOGGED_IN';
            this.registry.set('currentMuridId', result.murid.id_murid);
            this.registry.set('currentMuridNama', result.murid.nama);
            
            this.welcomeText.setText(`Halo, ${result.murid.nama}!`);
            this.infoText.setText('Login sukses. Silakan mulai.');
            this.infoText.setColor('#00ff00');

            if (this.playButton) {
                this.playButton.setTint(0xffffff);
                this.playButton.setInteractive();
                
                this.tweens.add({
                    targets: this.playButton,
                    scale: { from: 0.8, to: 1.0 },
                    duration: 200,
                    yoyo: true,
                    onComplete: () => this.playButton.setScale(0.8)
                });
            }
        
        } catch (error) {
            this.loginState = 'FAILED';
            this.infoText.setText(error.message); 
            this.infoText.setColor('#ff0000');
            console.log(error.message)

            if (this.playButton) {
                this.playButton.setTint(0x555555);
                this.playButton.disableInteractive();
            }
        }
    }

    handleLogout() {
        if (!this.welcomeText || !this.welcomeText.active) {
            return; 
        }
        console.log("LOGOUT: Wajah hilang, reset ke 'SEARCHING'.");
        this.loginState = 'SEARCHING';
        this.currentMuridId = null;
        
        // Reset UI
        this.welcomeText.setText('Selamat Datang!');
        this.infoText.setText('Mencari wajah...');
        this.infoText.setColor('#ffff00');

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