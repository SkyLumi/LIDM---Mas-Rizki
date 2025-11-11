export class LevelMenu extends Phaser.Scene {
   constructor(){
      super('LevelMenu')
   }

   create() {
      const { width, height } = this.sys.game.config

      let screenCenterX = width / 2
      let screenCenterY = height / 2

      //    Background     //
      this.add.image(screenCenterX, screenCenterY, 'levelmenu')
      .setScale(0.75)

      //    Level Box      //
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
      .setInteractive()
      const level2Btn = this.add.image(0, 0, 'level2Unselected')
      .setScale(0.4)
      .setInteractive()
      const level3Btn = this.add.image(190, 0, 'level3Unselected')
      .setScale(0.4)
      .setInteractive()

      buttonContainer.add([
         level1Btn, 
         level2Btn,
         level3Btn
      ])

      //    Hover Button Interaction      //
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

      level1Btn.on('pointerover', () => {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxLevelButtonHover')
         }
         level1Btn.setTexture('level1Selected');
      });

      level1Btn.on('pointerout', () => {
         level1Btn.setTexture('level1Unselected');
      });

      level2Btn.on('pointerover', () => {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxLevelButtonHover')
         }
         level2Btn.setTexture('level2Selected');
      });

      level2Btn.on('pointerout', () => {
         level2Btn.setTexture('level2Unselected');
      });

      level3Btn.on('pointerover', () => {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxLevelButtonHover')
         }
         level3Btn.setTexture('level3Selected');
      });

      level3Btn.on('pointerout', () => {
         level3Btn.setTexture('level3Unselected');
      });

      closeButton.on('pointerdown', () => {
         if (this.registry.get('isSfxOn') === true) {
            this.sound.play('sfxMenuButtonClick')
         }
         this.scene.start('MainMenu')
      });

      level1Btn.on('pointerdown', () => {
         if (this.isSfxOn) {
                this.sound.play('sfxLevelButtonClick')
         }
         this.selectLevel(1)
      });
      level2Btn.on('pointerdown', () => {
         if (this.isSfxOn) {
                this.sound.play('sfxLevelButtonClick')
         }
         this.selectLevel(2)
      });
      level3Btn.on('pointerdown', () => {
         if (this.isSfxOn) {
            this.sound.play('sfxLevelButtonClick')
         }
         this.selectLevel(3)
      });
   }

   selectLevel(levelNumber) {
      this.scene.start('Game', {level: levelNumber})
   }
}