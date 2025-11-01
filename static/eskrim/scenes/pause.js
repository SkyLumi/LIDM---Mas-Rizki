export class Pause extends Phaser.Scene {
    constructor() {
        super('Pause');
    }

    create() {
        const { width, height } = this.sys.game.config

        let screenCenterX = width / 2
        let screenCenterY = height / 2

        this.add.rectangle(screenCenterX, screenCenterY, width, height, 0x000000, 0.7)
            .setInteractive()
            .on('pointerdown', () => {});

        this.add.image(screenCenterX - 10, 0, 'pausePanel')
            .setScale(0.6)
            .setOrigin(0.5, 0.4);

        this.add.text(screenCenterX, screenCenterY - 50, 'Paused', {
            fontFamily: 'lilita-one',
            fontSize: '96px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        let panelContainer = this.add.container(screenCenterX, screenCenterY + 150)

        const resumeButton = this.add.image(-150, 0, 'panelNextLevel')
            .setInteractive()
            .setScale(2)

        resumeButton.on('pointerdown', () => {
            this.scene.stop()
            this.scene.resume('Game')
        });

        const restartButton = this.add.image(0, 0, 'panelRestart')
            .setInteractive()
            .setScale(2)

        restartButton.on('pointerdown', () => {
            this.scene.stop()
            this.scene.stop('Game')
            this.scene.start('Game')
        });

        const menuButton = this.add.image(150, 0, 'panelHome')
            .setInteractive()
            .setScale(2)

        menuButton.on('pointerdown', () => {
            this.scene.stop()
            this.scene.stop('Game')
            this.scene.start('MainMenu')
        });

        panelContainer.add([resumeButton, restartButton, menuButton])
    }
}