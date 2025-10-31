export class Pause extends Phaser.Scene {
    constructor() {
        super('Pause');
    }

    create() {
        const { width, height } = this.sys.game.config;

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setInteractive()
            .on('pointerdown', () => {});

        this.add.text(width / 2, height / 2 - 100, 'PAUSED', {
            fontFamily: 'lilita-one',
            fontSize: '96px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const resumeButton = this.add.image(width / 2, height / 2 + 50, 'resumeBtn')
            .setInteractive()
            .setScale(0.5);

        resumeButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('Game');
        });

        const menuButton = this.add.image(width / 2, height / 2 + 150, 'menuBtn')
            .setInteractive()
            .setScale(0.5);

        menuButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.stop('Game');
            this.scene.start('MainMenu');
        });
    }
}