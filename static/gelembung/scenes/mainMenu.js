import FaceMeshManager from './faceMeshManager.js';

export class MainMenu extends Phaser.Scene {
   constructor() {
      super('MainMenu')

      this.faceMeshManager = null;
      this.settingsContainer = null;
      this.isMusicOn = true; 
      this.isSfxOn = true;
   }

   create() {
        const {width, height} = this.sys.game.config

        const screenCenterX = width / 2
        const screenCenterY = height / 2

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
            
            if (bgMainMenu) {
                bgMainMenu.stop();
            }

            bgMainMenu = this.sound.add('bgMainMenu', { 
                loop: true, 
                volume: 0.5
            });
            
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

        //    Button      //
        const buttonContainer = this.add.container(screenCenterX, screenCenterY + 120)
        const playButton = this.add.image(-460,0,'playButton')
            .setScale(0.75)
            .setInteractive()
        const settingButton = this.add.image(0,0,'settingButton')
            .setScale(0.75)
            .setInteractive()
        
        const quitButton = this.add.image(460,0,'exitButton')
            .setScale(0.75)
            .setInteractive()

        buttonContainer.add([playButton, settingButton, quitButton])

        //    Button Hover Interaction    //
        const normalScale = 0.75
        const hoverScale = 0.80
        const tweenDuration = 100

        playButton.on('pointerover', () => {
            this.tweens.add({
                targets: playButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });

            if (this.isSfxOn) {
                this.sound.play('sfxMenuButtonHover')
            }
        });

        playButton.on('pointerout', () => {
            this.tweens.add({
                targets: playButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        settingButton.on('pointerover', () => {
            this.tweens.add({
                targets: settingButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });

            if (this.isSfxOn) {
                this.sound.play('sfxMenuButtonHover')
            }
        });

        settingButton.on('pointerout', () => {
            this.tweens.add({
                targets: settingButton,
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

            if (this.isSfxOn) {
                this.sound.play('sfxMenuButtonHover')
            }
        });

        quitButton.on('pointerout', () => {
            this.tweens.add({
                targets: quitButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        playButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
            if (this.isSfxOn) {
                this.sound.play('sfxPlayButton')
            }
        })

        settingButton.on('pointerdown', () => {
            if (this.isSfxOn) {
                this.sound.play('sfxMenuButtonClick')
            }
            this.showSettingsPanel()
        })

        quitButton.on('pointerdown', () => {
            if (this.isSfxOn) {
                this.sound.play('sfxMenuButtonClick')
            }
            window.location.href = 'https://cloudsuptest.framer.website/dashboard';
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
   }

    showSettingsPanel() {
      if (this.settingsContainer) {
         return;
      }
      const { width, height } = this.sys.game.config;

      this.settingsContainer = this.add.container(0, 0);
      this.settingsContainer.setDepth(20);

      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
      overlay.setInteractive();
      this.settingsContainer.add(overlay);

      const panel = this.add.image(width / 2, height / 2, 'settingMenu')
         .setScale(0.45);
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
         if (music) {
            music.setMute(false)
         }
         updateButtons();
      });
      musicOffBtn.on('pointerdown', () => {
         this.isMusicOn = false;
         this.registry.set('isMusicOn', false); 
         if (music) {
            music.setMute(true)
         }
         updateButtons();
      });

      this.settingsContainer.add([
         sfxOnBtn, sfxOffBtn, musicOnBtn, musicOffBtn, closeBtn
      ]);

      updateButtons();
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