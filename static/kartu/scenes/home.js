import FaceMeshManager from './faceMeshManager.js';
import { API_BASE_URL } from '../../config.js';

// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class home extends Phaser.Scene {

   constructor() {
      super("home");

      /* START-USER-CTR-CODE */
      this.faceMeshManager = null;
      this.videoElement = null;
      this.canvasElement = null;
      
      this.currentMuridId = null;
      this.loginState = 'SEARCHING'; // SEARCHING, LOGGING_IN, LOGGED_IN, FAILED
      
      this.faceLostCounter = 0;
      this.FACE_LOST_THRESHOLD = 120;
      /* END-USER-CTR-CODE */
   }

   /** @returns {void} */
   editorCreate() {

      // home_bg
      const home_bg = this.add.image(0, 0, "home_bg");
      home_bg.setOrigin(0, 0);

      // judul_kartu
      this.add.image(966, 470, "judul_kartu");

      // keluar_
      const keluar_ = this.add.image(1216, 752, "keluar_");
      keluar_.setInteractive(new Phaser.Geom.Rectangle(0, 0, 231, 102), Phaser.Geom.Rectangle.Contains);

      keluar_.on('pointerover', () => {
         this.tweens.add({
            targets: keluar_,
            scale: 1.05,
            duration: 100,
            ease: 'Power1'
         })
      })

      keluar_.on('pointerout',() => {
         this.tweens.add({
            targets: keluar_,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })

      keluar_.on('pointerdown', () => {
         window.location.href = 'https://cloudsuptest.framer.website/dashboard';
      })

      // --- MODIFIKASI TOMBOL PLAY (JADI GLOBAL PROPERTY) ---
      this.play_ = this.add.image(704, 752, "play_");
      this.play_.setInteractive(new Phaser.Geom.Rectangle(0, 0, 231, 102), Phaser.Geom.Rectangle.Contains);
      
      // KUNCI TOMBOL DI AWAL
      this.play_.setTint(0x555555); // Gelap
      this.play_.disableInteractive(); // Mati

      this.play_.on('pointerover', () => {
         this.tweens.add({
            targets: this.play_,
            scale: 1.05,
            duration: 100,
            ease: 'Power1'
         })
      })

      this.play_.on('pointerout',() => {
         this.tweens.add({
            targets: this.play_,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })

      this.play_.on('pointerdown', () => {
         this.scene.start('level')
      })

      // pengaturan_
      const pengaturan_ = this.add.image(960, 752, "pengaturan_");
      pengaturan_.setInteractive(new Phaser.Geom.Rectangle(0, 0, 233, 102), Phaser.Geom.Rectangle.Contains);

      pengaturan_.on('pointerover', () => {
         this.tweens.add({
            targets: pengaturan_,
            scale: 1.05,
            duration: 100,
            ease: 'Power1'
         })
      })

      pengaturan_.on('pointerout',() => {
         this.tweens.add({
            targets: pengaturan_,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })

      pengaturan_.on('pointerdown', () => {
         this.openSettingPanel();
      })

      this.events.emit("scene-awake");
   }

   /* START-USER-CODE */

   // Write your code here

   create() {
      this.editorCreate();
      
      const { width, height } = this.scale;

      if (this.registry.get('isSfxOn') === undefined) {
         this.registry.set('isSfxOn', true);
         this.registry.set('isMusicOn', true);
      }

      // --- TEXT UI STATUS ---
      this.welcomeText = this.add.text(width / 2, 100, 'Selamat Datang!', {
            fontSize: '48px', fill: '#fff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 4
      }).setOrigin(0.5);

      this.infoText = this.add.text(width / 2, 160, 'Mencari wajah...', {
            fontSize: '24px', fill: '#ffff00', fontFamily: 'Arial', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);

      // --- INISIALISASI AUTH & CAMERA ---
      this.videoElement = document.getElementById('webcam');
        
      // FIX: Cari canvas, kalau gak ada buat sendiri secara otomatis
      this.canvasElement = document.getElementById('snapshotCanvas');
      if (!this.canvasElement) {
          this.canvasElement = document.createElement('canvas');
          this.canvasElement.id = 'snapshotCanvas';
          this.canvasElement.style.display = 'none'; 
          document.body.appendChild(this.canvasElement);
      }

      this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
      
      // Matikan kamera saat pindah scene
      this.events.once('shutdown', this.shutdown, this);
   }

   // --- LOGIKA DETEKSI WAJAH & LOGIN ---
   onFaceResults(results) {
        if (!this.sys || !this.sys.settings.active) return;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            // --- WAJAH KEDETEK ---
            this.faceLostCounter = 0;
            
            if (this.loginState === 'SEARCHING' || this.loginState === 'FAILED') {
                const landmarks = results.multiFaceLandmarks[0];
                const currentPose = this.calculateFaceYaw(landmarks);

                if (currentPose === 'depan') {
                    this.loginState = 'LOGGING_IN'; 
                    this.attemptLogin(); 
                } else {
                    this.infoText.setText('Posisikan wajah lurus ke DEPAN...');
                    this.infoText.setColor('#ffff00');
                }
            }
            
        } else {
            // --- WAJAH HILANG ---
            
            if (this.loginState === 'LOGGED_IN') {
                this.handleLogout();
            }

            // Hard Reset Camera Logic
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

    async attemptLogin() {
        this.infoText.setText('Mencocokkan wajah...');
        this.infoText.setColor('#ffff00');
        
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
                throw new Error(result.message || "Gagal Login"); 
            }
        
            // --- LOGIN SUKSES ---
            this.loginState = 'LOGGED_IN';
            
            this.registry.set('currentMuridId', result.murid.id_murid);
            this.registry.set('currentMuridNama', result.murid.nama);
            
            this.welcomeText.setText(`Halo, ${result.murid.nama}!`);
            this.infoText.setText('Login sukses. Silakan main.');
            this.infoText.setColor('#00ff00');

            // --- BUKA KUNCI TOMBOL PLAY ---
            if (this.play_) {
                this.play_.clearTint(); // Hilangkan gelap
                this.play_.setInteractive(); // Bisa diklik
                
                // Efek 'Pop' biar user tau tombol nyala
                this.tweens.add({
                    targets: this.play_,
                    scale: { from: 1.0, to: 1.1 },
                    duration: 200,
                    yoyo: true,
                    onComplete: () => this.play_.setScale(1.0)
                });
            }
        
        } catch (error) {
            // --- LOGIN GAGAL ---
            this.loginState = 'FAILED';
            this.infoText.setText(error.message); 
            this.infoText.setColor('#ff0000');
            console.error("Login Error:", error);

            // Kunci lagi tombolnya
            if (this.play_) {
                this.play_.setTint(0x555555);
                this.play_.disableInteractive();
            }
        }
    }

    handleLogout() {
        if (!this.welcomeText || !this.welcomeText.active) return; 

        console.log("LOGOUT: Wajah hilang, reset ke 'SEARCHING'.");
        this.loginState = 'SEARCHING';
        this.currentMuridId = null;
        
        this.welcomeText.setText('Selamat Datang!');
        this.infoText.setText('Mencari wajah...');
        this.infoText.setColor('#ffff00');

        if (this.play_) {
            this.play_.setTint(0x555555);
            this.play_.disableInteractive();
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
        if (!this.canvasElement) {
            console.warn("Canvas element belum siap!");
            return null;
        }
        
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

    shutdown() {
       if(this.faceMeshManager) {
           this.faceMeshManager.stop();
       }
    }

   // --- SETTINGS PANEL ---
   openSettingPanel() {
      const { width, height } = this.scale; 
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Buat Container
      const settingContainer = this.add.container(0, 0);
      settingContainer.setDepth(100); 

      // 2. Overlay Redup
      const overlay = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.7);
      overlay.setInteractive();
      
      overlay.on('pointerdown', () => {
         settingContainer.destroy();
      });
      
      settingContainer.add(overlay);

      // 3. Panel Background
      const panel = this.add.image(centerX + 260, centerY, "settingPanel")
         .setScale(1.45); 
      settingContainer.add(panel);

      const toggleX = centerX + 250; 
      const sfxY = centerY - 115;     
      const musicY = centerY + 70;  

      // --- Tombol Efek (SFX) ---
      const isSfxOn = this.registry.get('isSfxOn');
      const sfxBtn = this.add.image(toggleX, sfxY, isSfxOn ? "toggleOn" : "toggleOff")
         .setScale(0.75);
      sfxBtn.setInteractive();
      
      sfxBtn.on('pointerdown', () => {
         const newState = !this.registry.get('isSfxOn');
         this.registry.set('isSfxOn', newState);
         sfxBtn.setTexture(newState ? "toggleOn" : "toggleOff");
      });
      settingContainer.add(sfxBtn);

      // --- Tombol Musik ---
      const isMusicOn = this.registry.get('isMusicOn');
      const musicBtn = this.add.image(toggleX, musicY, isMusicOn ? "toggleOn" : "toggleOff")
         .setScale(0.75);
      musicBtn.setInteractive();

      musicBtn.on('pointerdown', () => {
         const newState = !this.registry.get('isMusicOn');
         this.registry.set('isMusicOn', newState);
         musicBtn.setTexture(newState ? "toggleOn" : "toggleOff");
         this.sound.mute = !newState; 
      });
      settingContainer.add(musicBtn);
   }

   /* END-USER-CODE */
}

/* END OF COMPILED CODE */