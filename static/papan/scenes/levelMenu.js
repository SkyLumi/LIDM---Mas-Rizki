export class LevelMenu extends Phaser.Scene {

    constructor() {
        super('LevelMenu')
    }

    create() {
        const { width, height } = this.sys.game.config

        let screenCenterX = width / 2
        let screenCenterY = height / 2

        this.add.image(screenCenterX, screenCenterY, 'levelBG')
            .setScale(0.77)

        this.add.image(screenCenterX, 0, 'levelbox')
            .setScale(0.77)
            .setOrigin(0.5, 0)

        const closeButton = this.add.image(screenCenterX + 320, screenCenterY - 230, 'closeButton')
            .setInteractive()

        let buttonContainer = this.add.container(screenCenterX, screenCenterY + 20)

        const level1Btn = this.add.image(-200, 0, 'level1Btn')
            .setScale(0.8)
            .setInteractive()

        const level2Btn = this.add.image(0, 0, 'levelLockedBtn')
            .setScale(0.8)
            .setInteractive()

        const level3Btn = this.add.image(200, 0, 'levelLockedBtn')
            .setScale(0.8)
            .setInteractive()
            
        buttonContainer.add([level1Btn, level2Btn, level3Btn])

        //              Hover Animation             //

        const normalScale = 1;
        const hoverScale = 1.1;
        const tweenDuration = 100;

        const normalScaleLevel = 0.8;
        const hoverScaleLevel = 0.9;

        closeButton.on('pointerover', () => {
            this.tweens.add({
                targets: closeButton,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        closeButton.on('pointerout', () => {
            this.tweens.add({
                targets: closeButton,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level1Btn.on('pointerover', () => {
            this.tweens.add({
                targets: level1Btn,
                scale: hoverScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level1Btn.on('pointerout', () => {
            this.tweens.add({
                targets: level1Btn,
                scale: normalScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level2Btn.on('pointerover', () => {
            this.tweens.add({
                targets: level2Btn,
                scale: hoverScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level2Btn.on('pointerout', () => {
            this.tweens.add({
                targets: level2Btn,
                scale: normalScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level3Btn.on('pointerover', () => {
            this.tweens.add({
                targets: level3Btn,
                scale: hoverScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level3Btn.on('pointerout', () => {
            this.tweens.add({
                targets: level3Btn,
                scale: normalScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        //              Click Logic               //
        closeButton.on('pointerdown', () => {
            this.scene.start('MainMenu')
        })

        level1Btn.on('pointerdown', () => {
            this.scene.start('Level1')
        })

        level2Btn.on('pointerdown', () => {
            this.scene.start('Level2')
        })

        level3Btn.on('pointerdown', () => {
            this.scene.start('Level3')
        })

    }

}