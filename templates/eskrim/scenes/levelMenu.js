export class LevelSelect extends Phaser.Scene {

    constructor() {
        super('LevelSelect')
    }

    create() {
        const { width, height } = this.sys.game.config

        this.add.image(width / 2, height / 2, 'levelBG')

        this.add.image(width / 2, height / 2, 'levelbox')

        const level1Btn = this.add.image(width / 2, height / 2, 'level1Btn')
            
        level1Btn.on('pointerdown', () => {
            this.selectLevel(1)
        })

        const level2Btn = this.add.image(width / 2, height / 2, 'levelLockedBtn')
            .setOrigin(0.5)
            .setInteractive()

        level2Btn.on('pointerdown', () => {
            this.selectLevel(2)
        })

        // Tombol Level 3
        const level3Btn = this.add.text(width / 2, height * 0.7, 'Level 3', buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            
        level3Btn.on('pointerdown', () => {
            this.selectLevel(3)
        })

        // 4. Tombol Kembali
        const backBtn = this.add.text(width * 0.1, height * 0.1, '< Kembali', { fontSize: '32px', fill: '#FFF' })
            .setOrigin(0, 0.5)
            .setInteractive()
            
        backBtn.on('pointerdown', () => {
            this.scene.start('MainMenu')
        })
    }

    /**
     * Fungsi helper untuk pindah ke scene Tutorial
     * sambil mengirimkan data level berapa yang dipilih.
     */
    selectLevel(levelNumber) {
        // Pindah ke scene Tutorial dan kirim data 'level'
        this.scene.start('Tutorial', { level: levelNumber })
    }
}