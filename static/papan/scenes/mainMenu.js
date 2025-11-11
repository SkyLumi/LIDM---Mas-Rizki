export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu')
    }

    create() {
        const { width, height } = this.sys.game.config

        let screenCenterX = width / 2
        let screenCenterY = height / 2

        this.add.image(screenCenterX, screenCenterY, 'menuBG')
            .setScale(0.77)

        this.add.image(screenCenterX + 25, screenCenterY + 10, 'titleBox')
            .setScale(0.38)

        let buttonContainer = this.add.container(screenCenterX, screenCenterY + 240)

        const playButton = this.add.image(-360, 0, 'playButton')
            .setScale(0.8)
            .setInteractive()

        const settingsButton = this.add.image(0, 0, 'settingsButton')
            .setScale(0.8)
            .setInteractive()

        const quitButton = this.add.image(360, 0, 'quitButton')
            .setScale(0.8)
            .setInteractive()

        buttonContainer.add([playButton, settingsButton, quitButton])

        //              Hover Animation               //

        const normalScale = 0.8;
        const hoverScale = 0.9;
        const tweenDuration = 100;

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

        settingsButton.on('pointerover', () => {
            this.tweens.add({
                targets: settingsButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        settingsButton.on('pointerout', () => {
            this.tweens.add({
                targets: settingsButton,
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

        //              Click Logic                // 
        playButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        settingsButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        quitButton.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })
    }
}