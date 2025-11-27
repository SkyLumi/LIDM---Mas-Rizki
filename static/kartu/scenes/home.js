import FaceMeshManager from './faceMeshManager.js';
import { API_BASE_URL, DASHBOARD_BASE_URL } from '../../config.js';

// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class home extends Phaser.Scene {

   constructor() {
      super("home");

      /* START-USER-CTR-CODE */
      // HAPUS inisialisasi di sini, pindahkan ke init() atau create()
      // biar kereset setiap kali scene dibuka ulang.
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
         window.location.href = `${DASHBOARD_BASE_URL}/teacher/dashboard`;
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
      // --- ▼▼▼ RESET VARIABEL DI SINI (PENTING!) ▼▼▼ ---
      // Ini wajib biar pas balik dari game, statusnya gak nyangkut di 'LOGGED_IN'
      this.faceMeshManager = null;
      this.videoElement = null;
      this.canvasElement = null;
      
      this.currentMuridId = null;
      this.loginState = 'SEARCHING'; // Pastikan reset ke SEARCHING
      
      this.faceLostCounter = 0;
      this.FACE_LOST_THRESHOLD = 120;

      this.profileContainer = null;
      this.profileNameText = null;
      this.profileAvatar = null;
      this.searchingEvent = null; 
      // ---------------------------------------------------

      this.editorCreate();
      
      const { width, height } = this.scale;

      if (this.registry.get('isSfxOn') === undefined) {
         this.registry.set('isSfxOn', true);
         this.registry.set('isMusicOn', true);
      }

      // --- BUAT UI PROFIL PEMAIN (POJOK KANAN ATAS) ---
      this.createProfileUI();

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

      // Pastikan video play (kadang browser pause otomatis pas pindah tab/scene)
      if (this.videoElement && this.videoElement.paused) {
          this.videoElement.play().catch(e => console.log("Force play video error:", e));
      }

      this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
      
      // Matikan kamera saat pindah scene
      this.events.once('shutdown', this.shutdown, this);
   }

   // --- FUNGSI UI PROFIL BARU (SAMA SEPERTI MAINMENU) ---
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
                    // Pastikan text object masih ada sebelum di-set (Anti-crash)
                    if (this.profileNameText && this.profileNameText.scene) {
                        this.profileNameText.setText(dots);
                    }
                }
            }
        });
    }

   // --- LOGIKA DETEKSI WAJAH & LOGIN ---
   onFaceResults(results) {
        // Cek scene active biar gak error saat scene transisi
        if (!this.sys || !this.sys.settings.active) return;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            // --- WAJAH KEDETEK ---
            this.faceLostCounter = 0;
            
            if (this.loginState === 'SEARCHING' || this.loginState === 'FAILED') {
                const landmarks = results.multiFaceLandmarks[0];
                const currentPose = this.calculateFaceYaw(landmarks);

                if (currentPose === 'depan') {
                    this.loginState = 'LOGGING_IN'; 
                    
                    this.profileNameText.setText("Mencocokkan...");
                    this.profileNameText.setFontSize('24px'); // Kecilkan font untuk teks panjang
                    
                    this.attemptLogin(); 
                } else {
                    // Instruksi luruskan wajah
                    this.profileNameText.setText("Luruskan wajah!");
                    this.profileNameText.setFontSize('24px');
                    this.profileNameText.setColor('#ffff00'); 
                }
            }
            
        } else {
            // --- WAJAH HILANG ---
            if (this.loginState === 'LOGGED_IN') {
                this.handleLogout();
            } else {
                // Kembalikan ke titik-titik jika wajah hilang saat searching
                if (this.loginState === 'SEARCHING' && this.profileNameText.text !== "...") {
                     this.profileNameText.setColor('#ffffff');
                     this.profileNameText.setFontSize('48px');
                     this.profileNameText.setText("...");
                }
            }

            // Hard Reset Camera Logic
            if ((this.loginState === 'SEARCHING' || this.loginState === 'FAILED') 
                && this.faceLostCounter > this.FACE_LOST_THRESHOLD) 
            {
                console.warn("Wajah 'stuck'. Melakukan Hard Reset MediaPipe...");
                this.faceLostCounter = 0;
                
                // Coba stop dulu
                if (this.faceMeshManager) {
                    this.faceMeshManager.stop();
                }
                // Bikin baru
                this.faceMeshManager = new FaceMeshManager(this.videoElement, this.onFaceResults.bind(this));
                
                this.profileNameText.setText("Reset kamera...");
                this.profileNameText.setFontSize('24px');
            }
            
            this.faceLostCounter++;
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
            
            // TAMPILKAN NAMA PEMAIN
            if (this.profileNameText && this.profileNameText.scene) {
                this.profileNameText.setText(result.murid.nama);
                this.profileNameText.setFontSize('32px'); 
                this.profileNameText.setColor('#00ff00'); 
            }
            
            if (this.profileAvatar && this.profileAvatar.scene) {
                this.profileAvatar.setFillStyle(0x4caf50);
            }

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
            if (this.profileNameText && this.profileNameText.scene) {
                this.profileNameText.setText("Wajah Tak Dikenal"); 
                this.profileNameText.setFontSize('24px');
                this.profileNameText.setColor('#ff0000'); 
            }
            console.error("Login Error:", error);

            this.time.delayedCall(2000, () => {
                this.loginState = 'SEARCHING';
                if (this.profileNameText && this.profileNameText.scene) {
                    this.profileNameText.setColor('#ffffff');
                    this.profileNameText.setFontSize('48px');
                    this.profileNameText.setText("...");
                }
            });

            // Kunci lagi tombolnya
            if (this.play_) {
                this.play_.setTint(0x555555);
                this.play_.disableInteractive();
            }
        }
    }

    handleLogout() {
        console.log("LOGOUT: Wajah hilang, reset ke 'SEARCHING'.");
        this.loginState = 'SEARCHING';
        this.currentMuridId = null;
        
        if (this.profileNameText && this.profileNameText.scene) {
            this.profileNameText.setText('...');
            this.profileNameText.setFontSize('48px');
            this.profileNameText.setColor('#ffffff');
        }
        
        if (this.profileAvatar && this.profileAvatar.scene) {
            this.profileAvatar.setFillStyle(0x00bcd4);
        }

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
       // Pastikan dibersihkan bersih
       if(this.faceMeshManager) {
           this.faceMeshManager.stop();
           this.faceMeshManager = null; // Putus hubungan
       }
       if (this.searchingEvent) {
           this.searchingEvent.remove();
           this.searchingEvent = null;
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
    
    // Klik di luar panel untuk tutup panel
    overlay.on('pointerdown', () => {
        settingContainer.destroy();
    });
    
    settingContainer.add(overlay);

    // 3. Panel Background
    // Posisi Panel ada di X: centerX + 260
    const panelX = centerX + 260;
    const panel = this.add.image(panelX, centerY, "settingPanel")
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

    // --- ▼▼▼ TOMBOL KEMBALI (BARU DITAMBAHKAN) ▼▼▼ ---
    
    // Tentukan posisi Y di bawah tombol musik
    // (centerY + 180 adalah estimasi, sesuaikan biar pas di desain panelmu)
    const kembaliBtn = this.add.image(panelX - 1000, centerY - 380, "kembali_"); 
    kembaliBtn.setInteractive();

    // Event Hover (Membesar)
    kembaliBtn.on('pointerover', () => {
        this.tweens.add({
            targets: kembaliBtn,
            scale: 1.05, // Sesuaikan jika scale awal bukan 1
            duration: 100,
            ease: 'Power1'
        });
    });

    // Event Out (Mengecil)
    kembaliBtn.on('pointerout', () => {
        this.tweens.add({
            targets: kembaliBtn,
            scale: 1.0, // Kembali ke ukuran normal
            duration: 100,
            ease: 'Power1'
        });
    });

    // Event Klik (Pindah ke Home)
    kembaliBtn.on('pointerdown', () => {
        // Tidak perlu destroy container karena scene akan berganti
        this.scene.start('home'); 
    });

    // PENTING: Masukkan ke dalam container
    settingContainer.add(kembaliBtn);
    }

   /* END-USER-CODE */
}

/* END OF COMPILED CODE */