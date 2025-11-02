export class MainMenu extends Phaser.Scene {
   constructor() {
      super('MainMenu')
   }

   create() {
      const {width, height} = this.sys.game.config

      const screenCenterX = width / 2
      const screenCenterY = height / 2

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
        });

        quitButton.on('pointerout', () => {
            this.tweens.add({
                targets: quitButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        //     Click Logic    //
        playButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        settingButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        quitButton.on('pointerdown', () => {
            window.location.href = 'https://cloudsup.framer.website/dashboard';
        })
   }
}