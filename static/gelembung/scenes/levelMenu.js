export class LevelMenu extends Phaser.Scene {
   constructor(){
      super('LevelMenu')
   }

   create() {
      const { width, height } = this.sys.game.config

      let screenCenterX = width / 2
      let screenCenterY = height / 2

      const highestLevelUnlocked = this.registry.get('highestLevelUnlocked'); 

      this.add.image(screenCenterX, screenCenterY, 'levelmenu')
      .setScale(0.75)

      this.add.image(screenCenterX, screenCenterY, 'levelBox')
      .setScale(0.37)

      const closeButton = this.add.image(
         screenCenterX + 330, 
         screenCenterY - 330, 
         'closeButton'
      )
      .setScale(0.35)
      .setInteractive()
      
      const buttonContainer = this.add.container(screenCenterX, screenCenterY -60)

      const level1Btn = this.add.image(-190, 0, 'level1Unselected')
         .setScale(0.4)
         .setInteractive();
      this.addLevelButtonEvents(level1Btn, 1, 'level1Unselected', 'level1Selected');


      let level2Texture = (highestLevelUnlocked >= 2) ? 'level2Unselected' : 'levelLock';
      const level2Btn = this.add.image(0, 0, level2Texture)
         .setScale(0.4);
      
      if (highestLevelUnlocked >= 2) {
         level2Btn.setInteractive();
         this.addLevelButtonEvents(level2Btn, 2, 'level2Unselected', 'level2Selected');
      }

      let level3Texture = (highestLevelUnlocked >= 3) ? 'level3Unselected' : 'levelLock';
      const level3Btn = this.add.image(190, 0, level3Texture)
         .setScale(0.4);

      if (highestLevelUnlocked >= 3) {
         level3Btn.setInteractive();
         this.addLevelButtonEvents(level3Btn, 3, 'level3Unselected', 'level3Selected');
      }
      
      buttonContainer.add([
         level1Btn, 
         level2Btn,
         level3Btn
      ])

      const normalScale = 0.35
      const hoverScale = 0.4
      const tweenDuration = 100;

      closeButton.on('pointerover', () => {
         this.tweens.add({
            targets: closeButton,
            scale: hoverScale,
            duration: tweenDuration,
            ease: 'Power1'
         })
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxMenuButtonHover')
         }
      })

      closeButton.on('pointerout', () => {
         this.tweens.add({
            targets: closeButton,
            scale: normalScale,
            duration: tweenDuration,
            ease: 'Power1'
         })
      })

      closeButton.on('pointerdown', () => {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxMenuButtonClick')
         }
         this.scene.start('MainMenu')
      });
      
   }

   addLevelButtonEvents(button, levelNumber, unselectedTexture, selectedTexture) {
      
      button.on('pointerover', () => {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxLevelButtonHover');
         }
         button.setTexture(selectedTexture);
      });

      button.on('pointerout', () => {
         button.setTexture(unselectedTexture);
      });

      button.on('pointerdown', () => {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxLevelButtonClick');
         }
         this.selectLevel(levelNumber);
      });
   }

   selectLevel(levelNumber) {
      this.scene.start('Game', {level: levelNumber})
   }
}