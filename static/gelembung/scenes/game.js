import MediaPipeManager from "./mediapipeManager.js";

export class Game extends Phaser.Scene {
   constructor() {
      super('Game')
      this.camera = null
      this.bubbles = []
      this.lives = 0
      
      this.gameState = 'TUTORIAL'
      
      this.maxLives = 3
      this.lifeIcons = [] 
      this.baseSpeed = 1.0
      this.handEffect = {}

      this.scoreFillImage = null
      this.starThresholds = { one: 60, two: 80 }
      this.selectedLevel = 1
      this.pauseButton = null
      this.tutorialContainer = null
      this.pauseContainer = null
   }

   init(data) {
      this.maxScore = 2000
      this.remainingTime = 60
      this.score = 0

      if (data && data.level) {
         this.selectedLevel = data.level
      }
      this.starThresholds.one = this.maxScore * 0.6
      this.starThresholds.two = this.maxScore * 0.8
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
      this.add.image(width - 180, 620, 'scorePanel').setScale(0.64)

      this.scoreFillImage.setOrigin(0.5, 1.0);

      this.scoreText = this.add.text(width - 170, 320, `00`, {
            fontFamily: 'LilitaOne',
            fontSize: '84px',
            fill: '#045170' 
      }).setOrigin(0.5);

      this.updateScoreUI()

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

         if (bubble.getData('popping')) {
            return;
         }

         const isOutOfScreen = (
            bubble.x < -150 || 
            bubble.x > this.scale.width + 150 || 
            bubble.y < -150 || 
            bubble.y > this.scale.height + 150
         );

         if (isOutOfScreen) {
            const type = bubble.getData('type');
            if (type !== 'bomb') {
               this.loseLife();
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

   updateScoreUI() {
      if (this.score < 0) {
         this.score = 0;
      }

      this.scoreText.setText(this.score.toString().padStart(2, '0'));

      if (this.scoreFillImage) {
         
         let percentage = this.score / this.maxScore
         percentage = Phaser.Math.Clamp(percentage, 0, 1)

         const originalHeight = this.scoreFillImage.texture.getSourceImage().height
         const originalWidth = this.scoreFillImage.texture.getSourceImage().width

         const cropHeight = originalHeight * percentage;

         const cropY = originalHeight - cropHeight;

         this.scoreFillImage.setCrop(
            0, 
            cropY,   
            originalWidth,
            cropHeight   
         );
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

   startCountdown() {
      this.gameState = 'COUNTDOWN';
      const { width, height } = this.sys.game.config;

      const countdownImg = this.add.image(width / 2, height / 2, 'three')
         .setOrigin(0.5)
         .setScale(1);

      this.time.delayedCall(1000, () => {
         countdownImg.setTexture('two');
      });

      this.time.delayedCall(2000, () => {
         countdownImg.setTexture('one');
      });

      this.time.delayedCall(3000, () => {
         countdownImg.destroy();
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
      
      this.handEffectGroup.clear(true, true);
      Object.keys(this.handEffect).forEach(label => {
         delete this.handEffect[label]; 
      });

      this.scene.launch('Result', {
         isWin: isWin,
         score: this.score,
         maxScore: this.maxScore,
         starThresholds: this.starThresholds,
         selectedLevel: this.selectedLevel
      });
   }

   endGame() {
      this.gameState = 'GAMEOVER'

      if (this.countdownEvent) {
         this.countdownEvent.remove(false);
      }

      if (this.bubbleSpawnEvent) {
         this.bubbleSpawnEvent.remove(false);
      }
      
      this.bubbleGroup.getChildren().forEach(bubble => {
         this.tweens.killTweensOf(bubble);
         bubble.body.stop();
      });

      this.handEffectGroup.clear(true, true); 
      Object.keys(this.handEffect).forEach(label => {
         delete this.handEffect[label]; 
      });
   }

   onMediaPipeResults(results) {
      if (this.gameState !== 'PLAYING' || !this.sys?.game) {
         return;
      }

      const { width, height } = this.sys.game.config;

      const handsDetectedThisFrame = {};

      if (results.multiHandLandmarks && results.multiHandedness) {
         
         results.multiHandLandmarks.forEach((landmarks, i) => {
            
            const handInfo = results.multiHandedness[i];
            
            if (!handInfo || !handInfo.label) return;
            const label = handInfo.label;
            handsDetectedThisFrame[label] = true;

            const palm = landmarks[9];
            if (!palm) return;

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

      const maxBubbleCount = 2
      const activeCount = this.bubbleGroup.getChildren().length
      if (activeCount >= maxBubbleCount) return

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

      const type = Phaser.Utils.Array.GetRandom(['blue', 'purple'])
      const key = type == 'blue' ? 'blueBubble' : 'purpleBubble'
      const bubble = this.physics.add.sprite(x, y, key).setScale(0.2)
      bubble.body.setAllowGravity(false);
      bubble.setData('type', type)
      bubble.setData('popping', false)
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
               const type = bubble.getData('type');
               
               if (type !== 'bomb' && !bubble.getData('popping')) {
                  this.loseLife(); 
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

      bubble.setData('popping', true);

      bubble.body.setEnable(false);

      const type = bubble.getData('type');
      if (type === 'bomb'){ 
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxBomPop')
         }
         bubble.play('bomBubblePop');
         this.loseLife();
      }
      else {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxBubblePop')
         }
         bubble.play(type == 'blue' ? 'blueBubblePop' : 'purpleBubblePop');
         this.score += 2000
      }

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
   }
}