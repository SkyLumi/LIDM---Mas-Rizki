export class Result extends Phaser.Scene {
   constructor() {
      super('Result');
      
      this.isWin = false;
      this.score = 0;
      this.maxScore = 100;
      this.starThresholds = { one: 60, two: 80 };
      this.selectedLevel = 1;

      this.sfxSound = null;
      this.musicTimer = null; 
      this.resultMusic = null;
      
      this.musicKey = 'bgLose';
      this.isMusicOn_local = true;
   }

   init(data) {
      this.isWin = data.isWin;
      this.score = data.score;
      this.maxScore = data.maxScore;
      this.starThresholds = data.starThresholds;
      this.selectedLevel = data.selectedLevel;

      this.musicKey = this.isWin ? 'bgWin' : 'bgLose';
      this.isMusicOn_local = this.registry.get('isMusicOn') ?? true;
   }

   create() {
      const { width, height } = this.sys.game.config;
      
      const bgGameplay = this.registry.get('bgGameplay');
      if (bgGameplay && bgGameplay.isPlaying) {
         bgGameplay.stop();
      }const isSfxOn = this.registry.get('isSfxOn') ?? true;

      if (isSfxOn) {
         const sfxKey = 'sfxWin'
         this.sfxSound = this.sound.add(sfxKey, { volume: 0.7 });

         if (this.sfxSound && this.isWin) {
            this.sfxSound.play();
            this.sfxSound.on('complete', this.playResultMusic, this);
         } else {
            this.musicTimer = this.time.delayedCall(1500, this.playResultMusic, [], this); 
         }
      }

      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
      overlay.setInteractive();

      let panelKey;
      let titleText;
      let buttonsToShow = [];
      let starCount = 0;
      let currentHighest = this.registry.get('highestLevelUnlocked');

      if (this.isWin) {
         titleText = 'KERJA\nBAGUS!';
         buttonsToShow = ['homeButton', 'retryButton', 'nextLevelButton'];

         if (this.score >= this.maxScore) {
            starCount = 3;
         } else if (this.score >= this.starThresholds.two) {
            starCount = 2;
         } else if (this.score >= this.starThresholds.one) {
            starCount = 1;
         }
         panelKey = `result${starCount}Star`; 

         const newLevelUnlocked = this.selectedLevel + 1;

         if (newLevelUnlocked > currentHighest && newLevelUnlocked <= 3) {
            
            this.registry.set('highestLevelUnlocked', newLevelUnlocked);
         }
         
      } else {
         titleText = 'COBA\nLAGI!';
         buttonsToShow = ['homeButton', 'retryButton'];
         starCount = 0;

         panelKey = 'result0Star';
      }

      this.add.image(width / 2, height / 2, panelKey)
      .setScale(0.7); 

      this.add.text(width / 2, height / 2 - 75, titleText, {
         fontFamily: 'LilitaOne', fontSize: '84px', fill: '#045170', align: 'center'
      }).setOrigin(0.5);

      const labelStyle = {
         fontFamily: 'RalewayBold',
         fontSize: '48px',
         fill: '#045170',
      };
      
      const valueStyle = {
         fontFamily: 'RalewayBold',
         fontSize: '48px',
         fill: '#FE6291',
      };

      const textY = height / 2 + 75;

      const labelText = this.add.text(0, 0, 'Score:', labelStyle)
         .setOrigin(0, 0.5);

      const valueText = this.add.text(labelText.width + 10, 0, this.score.toString(), valueStyle)
         .setOrigin(0, 0.5);

      const totalWidth = labelText.width + 10 + valueText.width;

      const scoreContainer = this.add.container(width / 2, textY);
      scoreContainer.add([labelText, valueText]);

      labelText.x = -totalWidth / 2;
      valueText.x = labelText.x + labelText.width + 10;
      
      const buttonY = height / 2 + 220; 
      let buttonX = width / 2 ; 

      const numButtons = buttonsToShow.length;
      const buttonGap = 180;

      const totalButtonWidth = (numButtons - 1) * buttonGap;

      buttonX = (width / 2) - (totalButtonWidth / 2) - 5;
      
      if (buttonsToShow.includes('homeButton')) {
         const homeButton = this.add.image(buttonX, buttonY, 'homeButton')
            .setScale(0.35)
            .setInteractive()
            .on('pointerdown', () => {
               if (this.registry.get('isSfxOn') === true) {
                  this.sound.play('sfxMenuButtonClick')
               }
               this.stopAllSounds();
               this.scene.stop('Game')
               this.scene.start('MainMenu')
            })
         buttonX += 180;

         homeButton.on('pointerover', () => {
            this.tweens.add({
               targets: homeButton,
               scale: 0.4,
               duration: 100,
               ease: 'Power1'
            });

            if (this.registry.get('isSfxOn') === true) {
               this.sound.play('sfxMenuButtonHover')
            }
         });

         homeButton.on('pointerout', () => {
            this.tweens.add({
               targets: homeButton,
               scale: 0.35,
               duration: 100,
               ease: 'Power1'
            });
         });
      }
      
      if (buttonsToShow.includes('retryButton')) {
         const retryButton = this.add.image(buttonX, buttonY, 'retryButton')
            .setScale(0.35)
            .setInteractive()
            .on('pointerdown', () => {
               if (this.registry.get('isSfxOn') === true) {
                  this.sound.play('sfxMenuButtonClick')
               }
               this.stopAllSounds();
               this.scene.stop('Game')
               this.scene.start('Game', { level: this.selectedLevel })
            });
            
         buttonX += 180;

         retryButton.on('pointerover', () => {
            this.tweens.add({
               targets: retryButton,
               scale: 0.4,
               duration: 100,
               ease: 'Power1'
            });
            if (this.registry.get('isSfxOn') === true) {
               this.sound.play('sfxMenuButtonHover')
            }
         });

         retryButton.on('pointerout', () => {
            this.tweens.add({
               targets: retryButton,
               scale: 0.35,
               duration: 100,
               ease: 'Power1'
            });
         });
      }

      if (buttonsToShow.includes('nextLevelButton') && this.selectedLevel + 1 < 4) {
         const nextLevel = this.selectedLevel + 1;
         if (nextLevel <= 3) { 3
            const nextLevelButton = this.add.image(buttonX, buttonY, 'nextLevelButton')
               .setScale(0.35)
               .setInteractive()
               .on('pointerdown', () => {
                  if (this.registry.get('isSfxOn') === true) {
                     this.sound.play('sfxMenuButtonClick')
                  }
                  this.stopAllSounds();
                  this.scene.start('Game', { level: nextLevel })
               });

            nextLevelButton.on('pointerover', () => {
               this.tweens.add({
                  targets: nextLevelButton,
                  scale: 0.4,
                  duration: 100,
                  ease: 'Power1'
               });

               if (this.registry.get('isSfxOn') === true) {
                  this.sound.play('sfxMenuButtonHover')
               }
            });

            nextLevelButton.on('pointerout', () => {
               this.tweens.add({
                  targets: nextLevelButton,
                  scale: 0.35,
                  duration: 100,
                  ease: 'Power1'
               });
            });
         }
      }
   }

   playResultMusic() {
      if (this.resultMusic && this.resultMusic.isPlaying) {
         this.resultMusic.stop();
      }
      this.resultMusic = this.sound.add(this.musicKey, { loop: true, volume: 0.5 });
      if (this.resultMusic) {
         this.resultMusic.play();
         this.resultMusic.mute = !this.isMusicOn_local;
         this.registry.set('resultMusic', this.resultMusic); 
      }
   }

   stopAllSounds() {
      if (this.sfxSound) {
         this.sfxSound.stop();

         this.sfxSound.off('complete', this.playResultMusic, this);
         this.sfxSound = null;
      }

      if (this.resultMusic && this.resultMusic.isPlaying) {
         this.resultMusic.stop();
      }

      const regMusic = this.registry.get('resultMusic');
      if (regMusic && regMusic.isPlaying) {
         regMusic.stop();
      }

      if (this.musicTimer) {
         this.musicTimer.remove();
         this.musicTimer = null;
      }
   }
}