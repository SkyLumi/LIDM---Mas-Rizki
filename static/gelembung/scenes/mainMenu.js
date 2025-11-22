import FaceMeshManager from './faceMeshManager.js';
import { API_BASE_URL }  from '../../config.js';

export class MainMenu extends Phaser.Scene {
   constructor() {
      super('MainMenu')

      this.faceMeshManager = null;
      this.settingsContainer = null;
      this.isMusicOn = true; 
      this.isSfxOn = true;

      // --- VARIABEL AUTH ---
      this.videoElement = null;
      this.canvasElement = null;
      this.currentMuridId = null;
      this.loginState = 'SEARCHING'; // SEARCHING, LOGGING_IN, LOGGED_IN, FAILED
      this.faceLostCounter = 0;
      this.FACE_LOST_THRESHOLD = 120;
   }

   create() {
        const {width, height} = this.sys.game.config

        const screenCenterX = width / 2
        const screenCenterY = height / 2

        // --- SETUP REGISTRY AUDIO ---
        if (this.registry.get('isMusicOn') === undefined) {
            this.registry.set('isMusicOn', true);
            this.registry.set('isSfxOn', true);
        }

        if (this.registry.get('highestLevelUnlocked') === undefined) {
            this.registry.set('highestLevelUnlocked', 1);
        }

        const bgGameplay = this.registry.get('bgGameplay');
        if (bgGameplay && bgGameplay.isPlaying) {
            bgGameplay.stop();
        }
        
        const resultMusic = this.registry.get('resultMusic');
        if (resultMusic && resultMusic.isPlaying) {
            resultMusic.stop();
        }

        this.isMusicOn = this.registry.get('isMusicOn') ?? true;
        this.isSfxOn = this.registry.get('isSfxOn') ?? true;

        let bgMainMenu = this.registry.get('bgMainMenu')

        if (!bgMainMenu || !bgMainMenu.isPlaying) {
            if (bgMainMenu) { bgMainMenu.stop(); }

            bgMainMenu = this.sound.add('bgMainMenu', { loop: true, volume: 0.5 });
            
            if (bgMainMenu) {
                this.registry.set('bgMainMenu', bgMainMenu);
                bgMainMenu.play()
                bgMainMenu.setMute(!this.isMusicOn);
            }
        } else {
            bgMainMenu.setMute(!this.isMusicOn);
        }

        //    Background     //
        this.add.image(screenCenterX, screenCenterY, 'mainmenu').setScale(0.75)
        
        //    Title Box   //
        this.add.image(960, 480, 'titleBox')

        //    Button Container   //
        const buttonContainer = this.add.container(screenCenterX, screenCenterY + 120)
        
        // --- TOMBOL PLAY (MATI SAAT AWAL) ---
        this.playButton = this.add.image(-460,0,'playButton')
            .setScale(0.75)
            .setTint(0x555555) // Gelap (Terkunci)
            .disableInteractive(); // Tidak bisa diklik

        const settingButton = this.add.image(0,0,'settingButton')
            .setScale(0.75)
            .setInteractive()
        
        const quitButton = this.add.image(460,0,'exitButton')
            .setScale(0.75)
            .setInteractive()

        buttonContainer.add([this.playButton, settingButton, quitButton])

        //    Button Hover Interaction    //
        const normalScale = 0.75
        const hoverScale = 0.80
        const tweenDuration = 100

        // Animasi Hover PlayButton (Hanya jalan kalau sudah aktif nanti)
        this.playButton.on('pointerover', () => {
            this.tweens.add({
                targets: this.playButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
            if (this.isSfxOn) this.sound.play('sfxMenuButtonHover');
        });

        this.playButton.on('pointerout', () => {
            this.tweens.add({
                targets: this.playButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        this.playButton.on('pointerdown', () => {
            if (this.isSfxOn) this.sound.play('sfxPlayButton');
            this.scene.start('LevelMenu')
        })

        // Setting & Quit Logic
        settingButton.on('pointerover', () => {
            this.tweens.add({ targets: settingButton, scale: hoverScale, duration: tweenDuration, ease: 'Power1' });
            if (this.isSfxOn) this.sound.play('sfxMenuButtonHover');
        });

        settingButton.on('pointerout', () => {
            this.tweens.add({ targets: settingButton, scale: normalScale, duration: tweenDuration, ease: 'Power1' });
        });

        quitButton.on('pointerover', () => {
            this.tweens.add({ targets: quitButton, scale: hoverScale, duration: tweenDuration, ease: 'Power1' });
            if (this.isSfxOn) this.sound.play('sfxMenuButtonHover');
        });

        quitButton.on('pointerout', () => {
            this.tweens.add({ targets: quitButton, scale: normalScale, duration: tweenDuration, ease: 'Power1' });
        });

        settingButton.on('pointerdown', () => {
            if (this.isSfxOn) this.sound.play('sfxMenuButtonClick');
            this.showSettingsPanel()
        })

        quitButton.on('pointerdown', () => {
            if (this.isSfxOn) this.sound.play('sfxMenuButtonClick');
            window.location.href = 'https://cloudsuptest.framer.website/dashboard';
        })

        // --- TEXT UI ---
        this.welcomeText = this.add.text(width / 2, 100, 'Selamat Datang!', {
            fontSize: '48px', fill: '#fff'
        }).setOrigin(0.5);

        this.infoText = this.add.text(width / 2, 160, 'Mencari wajah...', {
            fontSize: '24px', fill: '#ffff00'
        }).setOrigin(0.5);

        // --- (TOMBOL DAFTAR SUDAH DIHAPUS) ---

        // --- INISIALISASI FACE MESH ---
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('snapshotCanvas');
        this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
        
        this.events.once('shutdown', this.shutdown, this);
   }

    // --- LOGIKA PENCARIAN WAJAH (CONTINUOUS LOOP) ---
    onFaceResults(results) {
        if (!this.sys || !this.sys.settings.active) return;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            // --- WAJAH KEDETEK ---
            this.faceLostCounter = 0;
            
            // Loop Pencarian: Jika masih SEARCHING atau FAILED (belum sukses), coba terus
            if (this.loginState === 'SEARCHING' || this.loginState === 'FAILED') {
                const landmarks = results.multiFaceLandmarks[0];
                const currentPose = this.calculateFaceYaw(landmarks);

                if (currentPose === 'depan') {
                    // Kunci state supaya tidak spam API berkali-kali dalam satu waktu
                    this.loginState = 'LOGGING_IN'; 
                    this.attemptLogin(); 
                } else {
                    this.infoText.setText('Posisikan wajah lurus ke DEPAN...');
                    this.infoText.setColor('#ffff00');
                }
            }
            
        } else {
            // --- WAJAH GAK KEDETEK ---
            
            // Jika sudah login tapi wajah hilang, logout (security)
            if (this.loginState === 'LOGGED_IN') {
                this.handleLogout();
            }

            // Fitur Hard Reset (jika kamera freeze/stuck)
            if ((this.loginState === 'SEARCHING' || this.loginState === 'FAILED') 
                && this.faceLostCounter > this.FACE_LOST_THRESHOLD) 
            {
                console.warn("Wajah 'stuck'. Melakukan Hard Reset MediaPipe...");
                this.faceLostCounter = 0;
                this.faceMeshManager.stop();
                this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
                this.infoText.setText('Kamera di-reset. Mencari wajah...');
            }
            
            this.faceLostCounter++;
        }
    }

    // --- FUNGSI LOGIN KE API ---
    async attemptLogin() {
        this.infoText.setText('Mencocokkan wajah...');
        this.infoText.setColor('#ffff00');
        
        const imageBase64 = this.takeSnapshot();
        if (!imageBase64 || imageBase64 === 'data:,') {
            this.infoText.setText('Gagal ambil foto. Coba lagi.');
            this.loginState = 'SEARCHING'; // Kembalikan ke mode cari agar loop berlanjut
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
            
            this.welcomeText.setText(`Halo, ${result.murid.nama}!`);
            this.infoText.setText('Login sukses. Silakan mulai.');
            this.infoText.setColor('#00ff00');

            // NYALAKAN TOMBOL PLAY
            if (this.playButton) {
                this.playButton.clearTint(); // Jadi terang
                this.playButton.setInteractive(); // Bisa diklik
                
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
            // Set status ke FAILED, nanti 'onFaceResults' akan mendeteksi ini 
            // dan mencoba login lagi di frame berikutnya jika wajah masih ada.
            this.loginState = 'FAILED';
            this.infoText.setText(error.message); 
            this.infoText.setColor('#ff0000');
            console.error("Login Error:", error);

            // Pastikan tombol mati
            if (this.playButton) {
                this.playButton.setTint(0x555555);
                this.playButton.disableInteractive();
            }
        }
    }

    // --- LOGOUT / RESET ---
    handleLogout() {
        if (!this.welcomeText || !this.welcomeText.active) return; 

        console.log("LOGOUT: Wajah hilang, reset ke 'SEARCHING'.");
        this.loginState = 'SEARCHING';
        this.currentMuridId = null;
        
        this.welcomeText.setText('Selamat Datang!');
        this.infoText.setText('Mencari wajah...');
        this.infoText.setColor('#ffff00');

        // Matikan tombol Play
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
        if (!this.videoElement || this.videoElement.readyState < 3 || this.videoElement.videoWidth === 0) {
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

    showSettingsPanel() {
      if (this.settingsContainer) return;

      const { width, height } = this.sys.game.config;

      this.settingsContainer = this.add.container(0, 0);
      this.settingsContainer.setDepth(20);

      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
      overlay.setInteractive();
      this.settingsContainer.add(overlay);

      const panel = this.add.image(width / 2, height / 2, 'settingMenu').setScale(0.45);
      this.settingsContainer.add(panel);
      
      const sfxRowY = height / 2 - 20;
      const musicRowY = height / 2 + 150;
      const onButtonX = width / 2 + 15;
      const offButtonX = width / 2 + 185;
      const closeButtonX = width / 2 + 335;
      const closeButtonY = height / 2 - 285;

      const sfxOnBtn = this.add.image(onButtonX, sfxRowY, 'soundActive').setScale(0.35).setInteractive();
      sfxOnBtn.on('pointerover', () => sfxOnBtn.setScale(0.4)).on('pointerout', () => sfxOnBtn.setScale(0.35));

      const sfxOffBtn = this.add.image(offButtonX, sfxRowY, 'soundNonActive').setScale(0.35).setInteractive();
      sfxOffBtn.on('pointerover', () => sfxOffBtn.setScale(0.4)).on('pointerout', () => sfxOffBtn.setScale(0.35));

      const musicOnBtn = this.add.image(onButtonX, musicRowY, 'muteActive').setScale(0.35).setInteractive();
      musicOnBtn.on('pointerover', () => musicOnBtn.setScale(0.4)).on('pointerout', () => musicOnBtn.setScale(0.35));

      const musicOffBtn = this.add.image(offButtonX, musicRowY, 'muteNonActive').setScale(0.35).setInteractive();
      musicOffBtn.on('pointerover', () => musicOffBtn.setScale(0.4)).on('pointerout', () => musicOffBtn.setScale(0.35));

      const closeBtn = this.add.image(closeButtonX, closeButtonY, 'closeButton').setScale(0.38).setInteractive();
      closeBtn.on('pointerover', () => closeBtn.setScale(0.4)).on('pointerout', () => closeBtn.setScale(0.35));
      closeBtn.on('pointerdown', () => {
         this.settingsContainer.destroy();
         this.settingsContainer = null;
      });

      const updateButtons = () => {
         if (this.isSfxOn) {
            sfxOnBtn.setTexture('soundActive');
            sfxOffBtn.setTexture('muteNonActive');
         } else {
            sfxOnBtn.setTexture('soundNonActive');
            sfxOffBtn.setTexture('muteActive');
         }
         
         if (this.isMusicOn) {
            musicOnBtn.setTexture('soundActive');
            musicOffBtn.setTexture('muteNonActive');
         } else {
            musicOnBtn.setTexture('soundNonActive');
            musicOffBtn.setTexture('muteActive');
         }
      }

      const music = this.registry.get('bgMainMenu');

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
         if (music) music.setMute(false);
         updateButtons();
      });
      musicOffBtn.on('pointerdown', () => {
         this.isMusicOn = false;
         this.registry.set('isMusicOn', false); 
         if (music) music.setMute(true);
         updateButtons();
      });

      this.settingsContainer.add([sfxOnBtn, sfxOffBtn, musicOnBtn, musicOffBtn, closeBtn]);
      updateButtons();
   }

   shutdown() {
       if(this.faceMeshManager) {
           this.faceMeshManager.stop();
       }
   }
}