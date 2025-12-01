import MediaPipeManager from "./mediapipeManager.js";
import { API_BASE_URL }  from '../../config.js';

export default class Game extends Phaser.Scene {
   constructor() {
      super('Game')
      this.camera = null
      this.bubbles = []
      this.lives = 0
      
      this.gameState = 'TUTORIAL'
      
      this.maxLives = 3
      this.handEffect = {}

      this.scoreFillImage = null
      this.starThresholds = { one: 60, two: 80 }
      this.selectedLevel = 1
      this.pauseButton = null
      this.tutorialContainer = null
      this.pauseContainer = null

      this.analytics = null;

      this.maxBubbleCount = 1;
      this.bubbleTypes = ['blue', 'purple'];
      this.baseSpeed = 1.0;
      
      // Variable untuk tween score
      this.scoreFillTween = null;
   }

   init(data) {
      this.maxScore = 2000;
      this.score = 0;
      this.lives = 0;
      this.lifeIcons = [];

      if (data && data.level) {
         this.selectedLevel = data.level
      }

      switch (this.selectedLevel) {
         case 1:
            this.remainingTime = 90;
            this.maxBubbleCount = 1;
            this.bubbleTypes = ['blue', 'purple'];
            this.baseSpeed = 1.0;
            break;
         case 2:
            this.remainingTime = 80;
            this.maxBubbleCount = 2;
            this.bubbleTypes = ['blue', 'purple', 'bomb'];
            this.baseSpeed = 1.1;
            break;
         case 3:
            this.remainingTime = 80;
            this.maxBubbleCount = 3;
            this.bubbleTypes = ['blue', 'purple', 'bomb', 'blue', 'bomb']; 
            this.baseSpeed = 1.2;
            break;
         default:
            this.remainingTime = 90;
            this.maxBubbleCount = 1;
            this.bubbleTypes = ['blue', 'purple'];
            this.baseSpeed = 1.0;
      }

      this.starThresholds.one = 800
      this.starThresholds.two = 1400
   }

   create() {

      const { width, height } = this.sys.game.config;

      let screenCenterX = width / 2;
      let screenCenterY = height / 2;

      const bgMainMenu = this.registry.get('bgMainMenu');
      let bgGameplay = this.registry.get('bgGameplay');

      if (bgMainMenu && bgMainMenu.isPlaying) {
         bgMainMenu.stop();
      }

      if (!bgGameplay || !bgGameplay.isPlaying) {
         if (bgGameplay) {
            bgGameplay.stop();
         }

         bgGameplay = this.sound.add('bgGameplay', { 
            loop: true
         });
         
         if (bgGameplay) {
            bgGameplay.play();
            this.registry.set('bgGameplay', bgGameplay);
         }
      }

      const isMusicOn = this.registry.get('isMusicOn');
      if (bgGameplay) {
         bgGameplay.mute = !isMusicOn;
      }
      
      this.analytics = {
         gameStartTime: this.time.now, 
         totalFrames: 0,   
         handLossFrames: 0, 
         heatmapData: [],   
         reactionTimes: [],
         missedBubbles: 0,
         handSpeeds: [],
         lastPopData: null 
      };

      //    Bubble Group      //
      this.bubbleGroup = this.physics.add.group()

      this.handEffectGroup = this.physics.add.group();

      //    Mediapipe Manager    //
      this.videoElement = document.getElementById('webcam') 
      this.mediapipe = new MediaPipeManager(this.videoElement, this.onMediaPipeResults.bind(this))

      //    Busa Air    //
      this.add.image(960,1003,'air')

      //    Lives    //
      const spacing = 150
      const totalWidth = (this.maxLives - 1) * spacing

      this.lifeContainer = this.add.container(300,140)

      for (let i = 0; i < this.maxLives; i++) {
            const x = -totalWidth / 2 + i * spacing
            const icon = this.add.image(x, 0, 'life')
                .setScale(0.8)
            this.lifeContainer.add(icon);
            this.lifeIcons.push(icon);
      }

      //    Timer    //
      this.add.image(width - 265, 120, 'timer').setScale(0.95)
      this.TimerText = this.add.text(width - 425, 130, `Waktu: ${this.remainingTime} detik`, {
            fontFamily: 'LilitaOne',
            fontSize: '46px',
            fill: '#045170' 
      })

      //    Score Panel   //
      this.scoreFillImage = this.add.image(width - 165, 820, 'scoreFill').setScale(0.3)
      // *** MODIFIKASI: Inisialisasi posisi persentase fill untuk animasi ***
      this.scoreFillImage.displayedPerc = 0; 
      
      this.add.image(width - 180, 620, 'scorePanel').setScale(0.64)

      this.scoreFillImage.setOrigin(0.5, 1.0);

      this.scoreText = this.add.text(width - 170, 320, `00`, {
            fontFamily: 'LilitaOne',
            fontSize: '84px',
            fill: '#045170' 
      }).setOrigin(0.5);

      this.updateScoreUI() // Panggil sekali untuk set posisi awal

      this.pauseButton = this.add.image(170, 900, 'pauseButton')
      .setScale(0.47)
      .setInteractive()
      .setVisible(false)

      this.pauseButton.on('pointerover', () => {
         this.tweens.add({
               targets: this.pauseButton,
               scale: 0.52,
               duration: 100,
               ease: 'Power1'
         });

         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxMenuButtonHover')
         }

      });

      this.pauseButton.on('pointerout', () => {
         this.tweens.add({
               targets: this.pauseButton,
               scale: 0.47,
               duration: 100,
               ease: 'Power1'
         });
      });

      this.pauseButton.on('pointerdown', () => {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxMenuButtonClick')
         }
         this.pauseGame();
      });

      this.physics.add.overlap(
         this.handEffectGroup, 
         this.bubbleGroup, 
         this.popBubble,
         null,            
         this          
      );

      this.showTutorial()
   }

   update(time, delta) {
      if (this.gameState !== 'PLAYING') {
         return;
      }

      this.bubbleGroup.getChildren().forEach(bubble => {

         const isOutOfScreen = (
            bubble.x < -150 || 
            bubble.x > this.scale.width + 150 || 
            bubble.y < -150 || 
            bubble.y > this.scale.height + 150
         );

         if (isOutOfScreen) {
            const type = bubble.getData('type');
            
            if (type !== 'bomb') { 
               this.score -= 100;
               this.updateScoreUI();
               if (this.selectedLevel > 1) {
                  this.loseLife();
               }
               this.analytics.missedBubbles++;
            }
            bubble.destroy();
         }
      }); 
   }

   updateTimer() {
      if (this.gameOver) {
         return;
      }

      this.remainingTime--;

      this.TimerText.setText(`Waktu: ${this.remainingTime} detik`);

      if (this.remainingTime <= 0) {
         this.checkGameEnd()
      }
   }

   // *** MODIFIKASI: Method updateScoreUI dengan Tween Animasi ***
   updateScoreUI() {
      if (this.score < 0) this.score = 0;
      
      const poppedBubbleCount = this.analytics.reactionTimes.length;
      this.scoreText.setText(poppedBubbleCount.toString().padStart(2, '0'));

      if (this.scoreFillImage) {
         
         const star1_VisualY = 0.5;
         const star2_VisualY = 0.7;
         const slowZoneVisualCap = 0.80; 

         const scoreStar1 = 800;
         const scoreStar2 = 1400;
         const scoreJump  = 2000;

         // Hitung Target Persentase
         let targetPercentage = 0;
         let t = 0;

         if (this.score >= scoreJump) {
            targetPercentage = 1.0; 
         } 
         else if (this.score <= scoreStar1) {
            t = this.score / scoreStar1;
            targetPercentage = Phaser.Math.Linear(0, star1_VisualY, t);
         }
         else if (this.score <= scoreStar2) {
            t = (this.score - scoreStar1) / (scoreStar2 - scoreStar1);
            targetPercentage = Phaser.Math.Linear(star1_VisualY, star2_VisualY, t);
         }
         else {
            t = (this.score - scoreStar2) / (scoreJump - scoreStar2);
            targetPercentage = Phaser.Math.Linear(star2_VisualY, slowZoneVisualCap, t);
         }
         
         targetPercentage = Phaser.Math.Clamp(targetPercentage, 0, 1);
         
         // Jalankan Tween Animasi pada Fill
         if (this.scoreFillTween) {
            this.scoreFillTween.stop();
         }

         this.scoreFillTween = this.tweens.add({
            targets: this.scoreFillImage,
            displayedPerc: targetPercentage,
            duration: 500, // 0.5 detik durasi animasi
            ease: 'Cubic.Out',
            onUpdate: () => {
               if(!this.scoreFillImage || !this.scoreFillImage.active) return;

               const currentPerc = this.scoreFillImage.displayedPerc;
               const originalHeight = this.scoreFillImage.texture.getSourceImage().height;
               const originalWidth = this.scoreFillImage.texture.getSourceImage().width;
               
               const cropHeight = originalHeight * currentPerc;
               const cropY = originalHeight - cropHeight;

               this.scoreFillImage.setCrop(
                  0, 
                  cropY,   
                  originalWidth,
                  cropHeight   
               );
            }
         });
      }
      
      if (this.score >= this.maxScore && this.gameState === 'PLAYING') {
         this.checkGameEnd();
      }
   }

   showTutorial() {
      const { width, height } = this.sys.game.config;

      this.tutorialContainer = this.add.container(0, 0);

      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

      let tutorialImageKey = 'tutoriallv1';
      if (this.selectedLevel === 2) {
         tutorialImageKey = 'tutoriallv2';
      } else if (this.selectedLevel === 3) {
         tutorialImageKey = 'tutoriallv3';
      }

      const tutorialImg = this.add.image(width / 2, height / 2, tutorialImageKey)
         .setOrigin(0.5);
      
      const tutorialBtn = this.add.image(width / 2, height * 0.8, 'startButton')
         .setOrigin(0.5)
         .setInteractive();

      this.tutorialContainer.add([overlay, tutorialImg, tutorialBtn])

      tutorialBtn.on('pointerdown', () => {
         this.tutorialContainer.destroy();
         this.startCountdown();

         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxStartGame', {
               volume: 1.25
            })
         }
         
      });
   }

   // *** MODIFIKASI: Animasi Countdown 3-2-1 yang lebih menarik ***
   startCountdown() {
      this.gameState = 'COUNTDOWN';
      const { width, height } = this.sys.game.config;

      // Variable untuk menyimpan sprite countdown yang sedang aktif
      let currentCountSprite = null;

      // Fungsi helper untuk animasi angka
      const showCount = (textureKey, delay) => {
         this.time.delayedCall(delay, () => {
            
            // Hapus angka sebelumnya jika ada
            if (currentCountSprite) {
               currentCountSprite.destroy();
            }

            // Buat angka baru
            currentCountSprite = this.add.image(width / 2, height / 2, textureKey)
               .setOrigin(0.5)
               .setScale(0); // Mulai dari kecil (0)

            // Mainkan tween pop-up
            this.tweens.add({
               targets: currentCountSprite,
               scale: 1, // Membesar ke ukuran normal
               duration: 600,
               ease: 'Back.out' // Efek membal sedikit
            });
         });
      };

      // Jadwalkan animasi
      showCount('three', 0);
      showCount('two', 1000);
      showCount('one', 2000);

      // Selesai countdown
      this.time.delayedCall(3000, () => {
         if (currentCountSprite) {
            currentCountSprite.destroy();
         }
         this.analytics.gameStartTime = this.time.now;
         this.analytics.lastPopData = { x: width/2, y: height/2, time: this.time.now };
         this.startGame();
      });
   }

   startGame() {

      this.gameState = 'PLAYING';

      this.pauseButton.setVisible(true)

      this.bubbleSpawnEvent = this.time.addEvent({
         delay: 2000,
         loop: true,
         callback: () => this.spawnBubble()
      });

      this.countdownEvent = this.time.addEvent({
         delay: 1000,
         callback: this.updateTimer,
         callbackScope: this,
         loop: true
      });
   }

   pauseGame() {
      if (this.gameState !== 'PLAYING') {
         return;
      }

      this.gameState = 'PAUSED';

      this.pauseButton.setVisible(false);

      this.physics.pause();

      this.bubbleGroup.getChildren().forEach(bubble => {
         const bubbleTweens = this.tweens.getTweensOf(bubble);
         if (bubbleTweens) {
            bubbleTweens.forEach(tween => tween.pause());
         }
      });  

      // Pause juga tween animasi score jika sedang jalan
      if(this.scoreFillTween && this.scoreFillTween.isPlaying()) {
         this.scoreFillTween.pause();
      }

      if (this.countdownEvent) this.countdownEvent.paused = true;
      if (this.bubbleSpawnEvent) this.bubbleSpawnEvent.paused = true;

      const bgGameplay = this.registry.get('bgGameplay');
      if (bgGameplay && bgGameplay.isPlaying) {
         bgGameplay.pause();
      }

      const { width, height } = this.sys.game.config;
      this.pauseContainer = this.add.container(0, 0);
      this.pauseContainer.setDepth(20);
      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
      overlay.setInteractive();
      this.pauseContainer.add(overlay);
      const panel = this.add.image(width / 2, height / 2, 'pauseMenu').setScale(0.45);
      this.pauseContainer.add(panel);
      
      const buttonY = height / 2 + 80; 
      const buttonGap = 180; 
      const numButtons = 3;
      const totalButtonWidth = (numButtons - 1) * buttonGap;
      let buttonX = (width / 2) - (totalButtonWidth / 2);

      const resumeBtn = this.add.image(buttonX, buttonY, 'continueButton')
         .setInteractive().setScale(0.35)
         .on('pointerdown', () => {
            if (this.registry.get('isSfxOn') === true) {
               this.sound.play('sfxMenuButtonClick')
            }
            this.resumeGame()
         });
      
      resumeBtn.on('pointerover', () => {
         this.tweens.add({
            targets: resumeBtn,
            scale: 0.4,
            duration: 100,
            ease: 'Power1'
         });

         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxMenuButtonHover')
         }

      });

      resumeBtn.on('pointerout', () => {
         this.tweens.add({
            targets: resumeBtn,
            scale: 0.35,
            duration: 100,
            ease: 'Power1'
         });
      });

      this.pauseContainer.add(resumeBtn);
      buttonX += buttonGap;

      const homeBtn = this.add.image(buttonX, buttonY, 'homeButton')
         .setInteractive().setScale(0.35)
         .on('pointerdown', () => {
            if (this.registry.get('isSfxOn') === true) {
               this.sound.play('sfxMenuButtonClick')
            }
            this.stopAllSounds();
            this.scene.start('MainMenu'); 
         });
      
      homeBtn.on('pointerover', () => {
         this.tweens.add({
            targets: homeBtn,
            scale: 0.4,
            duration: 100,
            ease: 'Power1'
         });

         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxMenuButtonHover')
         }
         
      });

      homeBtn.on('pointerout', () => {
         this.tweens.add({
            targets: homeBtn,
            scale: 0.35,
            duration: 100,
            ease: 'Power1'
         });
      });

      this.pauseContainer.add(homeBtn);
      buttonX += buttonGap;

      const retryBtn = this.add.image(buttonX, buttonY, 'retryButton')
         .setInteractive().setScale(0.35)
         .on('pointerdown', () => {
            if (this.registry.get('isSfxOn') === true) {
               this.sound.play('sfxMenuButtonClick')
            }
            this.stopAllSounds();
            this.scene.start('Game', { level: this.selectedLevel });
         });

      retryBtn.on('pointerover', () => {
         this.tweens.add({
            targets: retryBtn,
            scale: 0.4,
            duration: 100,
            ease: 'Power1'
         });

         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxMenuButtonHover')
         }
      });

      retryBtn.on('pointerout', () => {
         this.tweens.add({
            targets: retryBtn,
            scale: 0.35,
            duration: 100,
            ease: 'Power1'
         });
      });

      this.pauseContainer.add(retryBtn);
   }

   resumeGame() {
      if (this.gameState !== 'PAUSED') {
         return;
      }
      
      this.gameState = 'PLAYING';

      this.pauseButton.setVisible(true);

      this.physics.resume();

      this.bubbleGroup.getChildren().forEach(bubble => {
         const bubbleTweens = this.tweens.getTweensOf(bubble);
         if (bubbleTweens) {
            bubbleTweens.forEach(tween => tween.resume());
         }
      });

      // Resume tween score
      if(this.scoreFillTween && this.scoreFillTween.isPaused()) {
         this.scoreFillTween.resume();
      }

      if (this.countdownEvent) this.countdownEvent.paused = false;
      if (this.bubbleSpawnEvent) this.bubbleSpawnEvent.paused = false;

      const bgGameplay = this.registry.get('bgGameplay');
      if (bgGameplay && bgGameplay.isPaused) {
         bgGameplay.resume();
      }

      if (this.pauseContainer) {
         this.pauseContainer.destroy();
         this.pauseContainer = null;
      }
   }

   loseLife() {
      if (this.gameState === 'GAMEOVER') {
         return;
      }

      this.lives++; 

      const iconIndexToHide = this.maxLives - this.lives;
      
      if (this.lifeIcons[iconIndexToHide]) {
         this.lifeIcons[iconIndexToHide].setVisible(false);
      }

      if (this.lives >= this.maxLives) {
         this.checkGameEnd()
      }
   }

   checkGameEnd() {
      if (this.gameState !== 'PLAYING') {
         return;
      }

      if (this.score >= this.starThresholds.one) {
         this.finishLevel(true);
      } else {
         this.finishLevel(false);
      }
   }

   finishLevel(isWin) { 
      if (this.gameState !== 'PLAYING') return; 
      this.gameState = 'GAMEOVER';

      if (this.countdownEvent) this.countdownEvent.remove(false);
      if (this.bubbleSpawnEvent) this.bubbleSpawnEvent.remove(false);
      
      this.bubbleGroup.getChildren().forEach(bubble => {
         this.tweens.killTweensOf(bubble);
         if (bubble.body) bubble.body.stop();
      });
      
      if(this.scoreFillTween) this.scoreFillTween.stop();

      this.handEffectGroup.clear(true, true);
      Object.keys(this.handEffect).forEach(label => {
         delete this.handEffect[label]; 
      });

      const totalPlayTimeMs = this.time.now - this.analytics.gameStartTime;

      // --- HITUNG METRIK ---

      // 1. Fokus (Persentase tangan terlihat)
      let skorFokus = 0;
      if (this.analytics.totalFrames > 0) {
         skorFokus = ((this.analytics.totalFrames - this.analytics.handLossFrames) / this.analytics.totalFrames) * 100;
      }

      // 2. Waktu Reaksi (Rata-rata)
      let avgReactionTime = 0;
      const reactionTimes = this.analytics.reactionTimes;

      if (reactionTimes.length > 0) {
         const totalReactionTime = reactionTimes.reduce((acc, time) => acc + time, 0);
         avgReactionTime = totalReactionTime / reactionTimes.length;
      }

      // 3. Koordinasi (Akurasi Pecah Gelembung)
      const poppedCount = reactionTimes.length;
      const missedCount = this.analytics.missedBubbles;
      const totalInteraction = poppedCount + missedCount;
      
      let skorKoordinasi = 0;
      if (totalInteraction > 0) {
         skorKoordinasi = (poppedCount / totalInteraction) * 100;
      } else {
         skorKoordinasi = isWin ? 100 : 0;
      }

      let skorKetangkasan = 0;
      if (this.analytics.handSpeeds.length > 0) {
         const sumSpeed = this.analytics.handSpeeds.reduce((a, b) => a + b, 0);
         const avgSpeed = sumSpeed / this.analytics.handSpeeds.length; // pixel per ms

         // TARGET KECEPATAN:
         // Anggaplah kecepatan "Jago" adalah 1.5 pixel/ms (berpindah 1500px dalam 1 detik)
         // Jika avgSpeed >= 1.5, maka skor 100
         const TARGET_SPEED = 1.5; 
         skorKetangkasan = Math.min(100, (avgSpeed / TARGET_SPEED) * 100);
      }

      // --- AMBIL ID MURID DARI REGISTRY ---
      const muridId = this.registry.get('currentMuridId');

      const analyticsReport = {
         id_profil: muridId || "guest_unknown",
         id_games_dashboard: 1, // ID untuk Game Gelembung
         level: `level${this.selectedLevel}`,
         finalScore: this.score,
         win: isWin,
         totalPlayTimeSeconds: totalPlayTimeMs / 1000,
         metrics: {
             fokus: skorFokus.toFixed(1),
             koordinasi: skorKoordinasi.toFixed(1),
             waktuReaksi: avgReactionTime.toFixed(0) 
         },
         rawHeatmap: this.analytics.heatmapData
      };
      
      console.log("LAPORAN ANALITIK BARU:", analyticsReport);

      if (this.score >= this.starThresholds.one) {
          this.sendAnalyticsToAPI(analyticsReport);
      } else {
          console.log("Skor belum mencapai bintang 1, data tidak dikirim ke API.");
      }

      this.scene.launch('Result', {
         isWin: isWin,
         score: this.score,
         maxScore: this.maxScore,
         starThresholds: this.starThresholds,
         selectedLevel: this.selectedLevel
      });
   }

   async sendAnalyticsToAPI(data) {
        const apiEndpoint = `${API_BASE_URL}/v1/analytics/save`; 

        console.log('Mengirim data ke API...', data);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Sukses:', result);

        } catch (error) {
            console.error('API Gagal Nembak:', error);
        }
    }

   onMediaPipeResults(results) {
      if (this.gameState !== 'PLAYING' || !this.sys?.game) {
         return;
      }

      this.analytics.totalFrames++;

      const { width, height } = this.sys.game.config;

      const handsDetectedThisFrame = {};

      if (results.multiHandLandmarks && results.multiHandedness) {
         
         const timestamp = this.time.now - this.analytics.gameStartTime;

         results.multiHandLandmarks.forEach((landmarks, i) => {
            
            const handInfo = results.multiHandedness[i];
            
            if (!handInfo || !handInfo.label) return;
            const label = handInfo.label;
            handsDetectedThisFrame[label] = true;

            const palm = landmarks[9];
            if (!palm) return;

            this.analytics.heatmapData.push({ 
               x: palm.x,
               y: palm.y,
               t: timestamp,
               hand: label
            });

            const x = palm.x * width;
            const y = palm.y * height;
            
            if (!this.handEffect[label]) {
               const effect = this.physics.add.sprite(x, y, 'efekAirAnimasi')
                  .setScale(0.25)
                  .setOrigin(0.5)
                  .play('airEffectPlay');
               
               effect.body.setAllowGravity(false);
               this.handEffectGroup.add(effect);
               
               this.handEffect[label] = effect;

            } else {
               const eff = this.handEffect[label];
               eff.x += (x - eff.x) / 2;
               eff.y += (y - eff.y) / 2;
            }
         });

      } else {
         this.analytics.handLossFrames++;
      }
      
      Object.keys(this.handEffect).forEach(label => {
         
         if (!handsDetectedThisFrame[label]) {
            this.handEffect[label].destroy(); 
            delete this.handEffect[label]; 
         }
      });

      this.latestLandmarks = results.multiHandLandmarks ? results.multiHandLandmarks[0] : null;
   }

   spawnBubble() {
      if (this.gameState !== 'PLAYING') {
         return;
      }

      const directions = ['top', 'bottom', 'left', 'right']
      const dir = Phaser.Utils.Array.GetRandom(directions)
      let x, y, targetX, targetY

      const activeCount = this.bubbleGroup.getChildren().length
      if (activeCount >= this.maxBubbleCount) return

      switch (dir) {
         case 'top':
            x = Phaser.Math.Between(100, this.scale.width - 100)
            y = -100
            targetX = x + Phaser.Math.Between(-50, 50)
            targetY = this.scale.height + 100
            break
         case 'bottom':
            x = Phaser.Math.Between(100, this.scale.width - 100)
            y = this.scale.height + 100
            targetX = x + Phaser.Math.Between(-50, 50)
            targetY = -100
            break
         case 'left':
            x = -100
            y = Phaser.Math.Between(100, this.scale.height - 100)
            targetX = this.scale.width + 100
            targetY = y + Phaser.Math.Between(-50, 50)
            break
         case 'right':
            x = this.scale.width + 100
            y = Phaser.Math.Between(100, this.scale.height - 100)
            targetX = -100
            targetY = y + Phaser.Math.Between(-50, 50)
            break
      }

      const type = Phaser.Utils.Array.GetRandom(this.bubbleTypes);
      let key;
      if (type === 'blue') key = 'blueBubble';
      else if (type === 'purple') key = 'purpleBubble';
      else if (type === 'bomb') key = 'bomBubble';

      const bubble = this.physics.add.sprite(x, y, key).setScale(0.2)
      bubble.body.setAllowGravity(false);
      bubble.setData('type', type)
      bubble.setData('popping', false)
      bubble.setData('spawnTime', this.time.now);
      this.bubbleGroup.add(bubble)

      const baseDuration = 15000
      const adjustedDuration = baseDuration / this.baseSpeed

      this.tweens.add({
         targets: bubble,
         x: targetX,
         y: targetY,
         duration: adjustedDuration,
         ease: 'Linear',
         onComplete: () => {
            if (bubble.active) {
               if (type !== 'bomb' && !bubble.getData('popping')) {
                  if (this.selectedLevel > 1) {
                     this.loseLife(); 
                  }
               }
               bubble.destroy();
            }
         }
      })
   }

   popBubble(handEffect, bubble) {
      if (this.gameState !== 'PLAYING') {
         return;
      }

      const popX = bubble.x;
      const popY = bubble.y;

      const type = bubble.getData('type');

      if (type !== 'bomb' && !bubble.getData('popping')) {
         
         const spawnTime = bubble.getData('spawnTime'); 

         const reactionTimeMs = this.time.now - spawnTime;

         this.analytics.reactionTimes.push(reactionTimeMs);

      }

      bubble.setData('popping', true);

      bubble.body.setEnable(false);
      let textScorePopUp = '+100'

      if (type === 'bomb'){ 
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxBomPop')
         }
         textScorePopUp = '-100'
         this.score -= 100;
         bubble.play('bomBubblePop');
         this.loseLife();
      }
      else {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxBubblePop')
         }
         bubble.play(type == 'blue' ? 'blueBubblePop' : 'purpleBubblePop');
         textScorePopUp = '+100'
         this.score += 100
      }

      let scorePopup = this.add.text(popX, popY, textScorePopUp, {
            fontFamily: 'LilitaOne',
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(100);

      this.tweens.add({
         targets: scorePopup,
         y: popY - 100,
         alpha: 0,
         duration: 800,
         ease: 'Power1',
         onComplete: () => {
               scorePopup.destroy();
         }
      });

      this.updateScoreUI();

      bubble.on('animationcomplete', () => {
         bubble.destroy();
      });
   }  

   stopAllSounds() {
      const gameMusic = this.registry.get('bgGame');
      if (gameMusic && gameMusic.isPlaying) {
         gameMusic.stop();
      }
   }

   shutdown() {
      this.mediapipe.destroy()
      if (this.countdownEvent) this.countdownEvent.remove();
      if (this.bubbleSpawnEvent) this.bubbleSpawnEvent.remove();
      if (this.scoreFillTween) this.scoreFillTween.stop();
   }
}