import FaceMeshManager from './faceMeshManager.js';
import { API_BASE_URL, LOCAL_DASHBOARD_BASE_URL, DASHBOARD_BASE_URL } from '../../config.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');

        this.faceMeshManager = null;
        this.settingsContainer = null;
        this.isMusicOn = true;
        this.isSfxOn = true;

        // --- VARIABEL AUTH ---
        this.videoElement = null;
        this.canvasElement = null;
        this.currentMuridId = null;
        this.loginState = 'SEARCHING'; 
        this.faceLostCounter = 0;
        this.FACE_LOST_THRESHOLD = 120;

        // --- VARIABEL UI ---
        this.profileContainer = null;
        this.profileNameText = null;
        this.profileAvatar = null;
    }

    create() {
        // 1. Setup Audio State (Hanya variable, tanpa load file)
        this.setupAudioState();

        // 2. Setup Visual
        this.createVisuals();

        // 3. Setup Profil UI
        this.createProfileUI();

        // 4. Setup FaceMesh
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('snapshotCanvas');

        if (this.faceMeshManager) {
            this.faceMeshManager.stop();
        }

        this.time.delayedCall(100, () => {
            this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
        });

        this.events.once('shutdown', this.shutdown, this);
    }

    setupAudioState() {
        // Hanya mengatur default value di registry agar settings panel tidak error
        if (this.registry.get('isMusicOn') === undefined) {
            this.registry.set('isMusicOn', true);
            this.registry.set('isSfxOn', true);
        }
        if (this.registry.get('highestLevelUnlocked') === undefined) {
            this.registry.set('highestLevelUnlocked', 1);
        }

        // Ambil state terakhir
        this.isMusicOn = this.registry.get('isMusicOn');
        this.isSfxOn = this.registry.get('isSfxOn');

        // NOTE: Bagian load & play music dihapus sesuai request
    }

    createVisuals() {
        // BACKGROUNDS
        const backgrounds = this.add.image(0, 0, "backgrounds");
        backgrounds.scaleX = 1.5048; backgrounds.scaleY = 1.5048; backgrounds.setOrigin(0, 0);

        // TITLEBOX
        const titlebox = this.add.image(1040, 448, "titlebox");
        titlebox.scaleX = 1.4984; titlebox.scaleY = 1.4984;

        // TOMBOL SETTING
        const tombolPengaturan = this.add.image(976, 672, "tombolPengaturan");
        tombolPengaturan.setInteractive();
        tombolPengaturan.scaleX = 1.432; tombolPengaturan.scaleY = 1.432;

        // TOMBOL KELUAR
        const tombolKeluar = this.add.image(1296, 672, "tombolKeluar");
        tombolKeluar.setInteractive();
        tombolKeluar.scaleX = 1.432; tombolKeluar.scaleY = 1.432;

        // TOMBOL PLAY (LOCKED)
        this.tombolPlay = this.add.image(656, 672, "tombolPlay");
        this.tombolPlay.scaleX = 1.432; this.tombolPlay.scaleY = 1.432;
        this.tombolPlay.setTint(0x555555); // Gelap
        this.tombolPlay.disableInteractive();

        this.events.emit("scene-awake");

        // HOVER ANIMATION
        const normalScale = 1.432;
        const hoverScale = 1.632;
        const tweenDuration = 100;

        // Play
        this.tombolPlay.on('pointerover', () => {
            this.tweens.add({ targets: this.tombolPlay, scale: hoverScale, duration: tweenDuration, ease: 'Power1' });
            // Audio dihapus
        });
        this.tombolPlay.on('pointerout', () => {
            this.tweens.add({ targets: this.tombolPlay, scale: normalScale, duration: tweenDuration, ease: 'Power1' });
        });
        this.tombolPlay.on('pointerdown', () => {
            // Audio dihapus
            this.scene.start('LevelMenu');
        });

        // Settings
        tombolPengaturan.on('pointerover', () => {
            this.tweens.add({ targets: tombolPengaturan, scale: hoverScale, duration: tweenDuration, ease: 'Power1' });
            // Audio dihapus
        });
        tombolPengaturan.on('pointerout', () => {
            this.tweens.add({ targets: tombolPengaturan, scale: normalScale, duration: tweenDuration, ease: 'Power1' });
        });
        tombolPengaturan.on('pointerdown', () => {
            // Audio dihapus
            this.showSettingsPanel();
        });

        // Keluar
        tombolKeluar.on('pointerover', () => {
            this.tweens.add({ targets: tombolKeluar, scale: hoverScale, duration: tweenDuration, ease: 'Power1' });
            // Audio dihapus
        });
        tombolKeluar.on('pointerout', () => {
            this.tweens.add({ targets: tombolKeluar, scale: normalScale, duration: tweenDuration, ease: 'Power1' });
        });
        tombolKeluar.on('pointerdown', () => {
            // Audio dihapus
            window.location.href = `${DASHBOARD_BASE_URL}/teacher/dashboard`;
        });
    }

    createProfileUI() {
        const { width } = this.sys.game.config;
        const panelWidth = 550;
        const panelHeight = 180;
        
        this.profileContainer = this.add.container(width - panelWidth, 0);
        this.profileContainer.setDepth(10); 

        const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x084EC5).setOrigin(0, 0);
        const labelText = this.add.text(25, 15, "Pemain saat ini", { fontSize: '38px', fontFamily: 'RalewayBold', color: '#ffffff' });
        
        const avatarY = 110; 
        this.profileAvatar = this.add.circle(60, avatarY, 35, 0x00bcd4);
        this.profileNameText = this.add.text(110, avatarY, "...", { fontSize: '40px', fontFamily: 'Raleway', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0, 0.5);

        this.profileContainer.add([bg, labelText, this.profileAvatar, this.profileNameText]);

        this.dotCount = 0;
        this.searchingEvent = this.time.addEvent({
            delay: 500, loop: true,
            callback: () => {
                if (this.loginState === 'SEARCHING') {
                    this.dotCount = (this.dotCount + 1) % 4; 
                    const count = (this.dotCount % 3) + 1;
                    this.profileNameText.setText(".".repeat(count));
                }
            }
        });
    }

    onFaceResults(results) {
        if (!this.sys || !this.sys.settings.active) return;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            this.faceLostCounter = 0;
            if (this.loginState === 'SEARCHING' || this.loginState === 'FAILED') {
                const landmarks = results.multiFaceLandmarks[0];
                const zLeft = landmarks[234].z;
                const zRight = landmarks[454].z;
                const zDiff = zLeft - zRight;
                const YAW_THRESHOLD = 0.04;
                
                let currentPose = 'depan';
                if (zDiff > YAW_THRESHOLD) currentPose = 'kanan'; 
                else if (zDiff < -YAW_THRESHOLD) currentPose = 'kiri';

                if (currentPose === 'depan') {
                    this.loginState = 'LOGGING_IN'; 
                    this.profileNameText.setText("Mencocokkan...");
                    this.profileNameText.setFontSize('24px'); 
                    this.attemptLogin(); 
                } else {
                    this.profileNameText.setText("Luruskan wajah!");
                    this.profileNameText.setFontSize('24px');
                    this.profileNameText.setColor('#ffff00'); 
                }
            }
        } else {
            if (this.loginState === 'LOGGED_IN') {
                this.handleLogout();
            } else {
                if (this.loginState === 'SEARCHING' && this.profileNameText.text !== "...") {
                     this.profileNameText.setColor('#ffffff');
                     this.profileNameText.setFontSize('48px');
                     this.profileNameText.setText("...");
                }
            }
            
            if ((this.loginState === 'SEARCHING' || this.loginState === 'FAILED') && this.faceLostCounter > this.FACE_LOST_THRESHOLD) {
                this.faceLostCounter = 0;
                if (this.faceMeshManager) {
                    this.faceMeshManager.stop();
                    this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
                }
                this.profileNameText.setText("Reset kamera...");
                this.profileNameText.setFontSize('24px');
            }
            this.faceLostCounter++;
        }
    }

    async attemptLogin() {
        if (!this.canvasElement) return;
        const ctx = this.canvasElement.getContext('2d');
        const w = this.videoElement.videoWidth;
        const h = this.videoElement.videoHeight;
        if (w === 0 || h === 0) return;

        this.canvasElement.width = w;
        this.canvasElement.height = h;
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.videoElement, 0, 0, w, h);
        const imageBase64 = this.canvasElement.toDataURL('image/jpeg', 0.8);
        
        try {
            const response = await fetch(`${API_BASE_URL}/v1/login-wajah`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: imageBase64 })
            });
            const result = await response.json();
        
            if (!response.ok) throw new Error(result.message || "Gagal"); 
        
            this.loginState = 'LOGGED_IN';
            this.registry.set('currentMuridId', result.murid.id_murid);
            this.registry.set('currentMuridNama', result.murid.nama);
            
            this.profileNameText.setText(result.murid.nama);
            this.profileNameText.setFontSize('32px'); 
            this.profileNameText.setColor('#00ff00'); 
            this.profileAvatar.setFillStyle(0x4caf50);

            if (this.tombolPlay) {
                this.tombolPlay.clearTint(); 
                this.tombolPlay.setInteractive(); 
                this.tweens.add({
                    targets: this.tombolPlay,
                    scale: { from: 1.432, to: 1.6 },
                    duration: 200, yoyo: true,
                    onComplete: () => this.tombolPlay.setScale(1.432)
                });
            }
        } catch (error) {
            this.loginState = 'FAILED';
            this.profileNameText.setText("Wajah Tak Dikenal"); 
            this.profileNameText.setFontSize('24px');
            this.profileNameText.setColor('#ff0000'); 
            this.time.delayedCall(2000, () => {
                this.loginState = 'SEARCHING';
                this.profileNameText.setColor('#ffffff');
                this.profileNameText.setFontSize('48px');
                this.profileNameText.setText("...");
            });
        }
    }

    handleLogout() {
        this.loginState = 'SEARCHING';
        this.currentMuridId = null;
        this.profileNameText.setText('...');
        this.profileNameText.setFontSize('48px');
        this.profileNameText.setColor('#ffffff');
        this.profileAvatar.setFillStyle(0x00bcd4);

        if (this.tombolPlay) {
            this.tombolPlay.setTint(0x555555);
            this.tombolPlay.disableInteractive();
        }
    }

    showSettingsPanel() {
        if (this.settingsContainer) return;
        const { width, height } = this.sys.game.config;

        this.settingsContainer = this.add.container(0, 0).setDepth(20);
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7).setInteractive();
        this.settingsContainer.add(overlay);

        const panel = this.add.image(width/2, height/2, 'settingMenu').setScale(0.6);
        this.settingsContainer.add(panel);
        
        const sfxRowY = height/2 - 20;
        const musicRowY = height/2 + 120;
        const onButtonX = width/2 + 15;
        const offButtonX = width/2 + 185;
        const closeButtonX = width/2 + 335;
        const closeButtonY = height/2 - 285;

        const sfxOnBtn = this.add.image(onButtonX, sfxRowY, 'soundActive').setScale(0.35).setInteractive();
        const sfxOffBtn = this.add.image(offButtonX, sfxRowY, 'soundNonActive').setScale(0.35).setInteractive();
        const musicOnBtn = this.add.image(onButtonX, musicRowY, 'muteActive').setScale(0.35).setInteractive();
        const musicOffBtn = this.add.image(offButtonX, musicRowY, 'muteNonActive').setScale(0.35).setInteractive();
        const closeBtn = this.add.image(closeButtonX, closeButtonY, 'close-btn').setScale(0.38).setInteractive();

        closeBtn.on('pointerdown', () => { this.settingsContainer.destroy(); this.settingsContainer = null; });

        const updateButtons = () => {
            sfxOnBtn.setTexture(this.isSfxOn ? 'soundActive' : 'soundNonActive');
            sfxOffBtn.setTexture(this.isSfxOn ? 'muteNonActive' : 'muteActive');
            musicOnBtn.setTexture(this.isMusicOn ? 'soundActive' : 'soundNonActive');
            musicOffBtn.setTexture(this.isMusicOn ? 'muteNonActive' : 'muteActive');
        };

        // Logic Switch Audio (Hanya ganti variabel, tidak play audio)
        sfxOnBtn.on('pointerdown', () => { 
            this.isSfxOn = true; 
            this.registry.set('isSfxOn', true); 
            updateButtons(); 
        });
        sfxOffBtn.on('pointerdown', () => { 
            this.isSfxOn = false; 
            this.registry.set('isSfxOn', false); 
            updateButtons(); 
        });
        
        musicOnBtn.on('pointerdown', () => { 
            this.isMusicOn = true; 
            this.registry.set('isMusicOn', true); 
            updateButtons(); 
        });
        musicOffBtn.on('pointerdown', () => { 
            this.isMusicOn = false; 
            this.registry.set('isMusicOn', false); 
            updateButtons(); 
        });

        this.settingsContainer.add([sfxOnBtn, sfxOffBtn, musicOnBtn, musicOffBtn, closeBtn]);
        updateButtons();
    }

    shutdown() {
        if(this.faceMeshManager) this.faceMeshManager.stop();
        if (this.searchingEvent) this.searchingEvent.remove();
    }
}