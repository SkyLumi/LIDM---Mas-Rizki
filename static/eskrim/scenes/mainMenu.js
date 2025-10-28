export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu')
    }

    create() {
        const { width, height } = this.sys.game.config

        this.add.image(width / 2, height / 2, 'menuBG')
    }
}