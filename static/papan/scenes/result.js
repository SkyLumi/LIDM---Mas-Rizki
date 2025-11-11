export class Result extends Phaser.Scene {
    constructor() {
        super('Result')

        // this.levelMap = {
        //     'Level1': 'Level2',
        //     'Level2': 'Level3',
        //     'Level3': 'MainMenu'
        // };

        this.finalScore = 0;
    }

    init(data) {
        this.finalScore = data.score;
        // this.gameSceneKey = data.gameSceneKey;
    }

    create() {
        const { width, height } = this.sys.game.config

        let screenCenterX = width / 2
        let screenCenterY = height / 2

        this.add.rectangle(screenCenterX, screenCenterY, width, height, 0x000000, 0.5)
            .setInteractive()
            .on('pointerdown', () => {});

        this.add.image(screenCenterX, 0, 'gameOverPanel')
            .setOrigin(0.5, 0)
            .setScale(1.4)

        let bintangContainer = this.add.container(screenCenterX, 230)

        const bintang1 = this.add.image(-110, 10, 'bintang')
            .setScale(0.8)

        const bintang2 = this.add.image(0, 0, 'bintang')
            .setScale(0.9)

        const bintang3 = this.add.image(110, 10, 'bintang')
            .setScale(0.8)

        bintangContainer.add([bintang1, bintang2, bintang3])

        this.add.text(screenCenterX, 500, 'KERJA BAGUS!', {
            fontFamily: 'lilita-one',
            fontSize: '72px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        let scoreTextContainer = this.add.container(screenCenterX - 230, 560)

        const scoreText = this.add.text(0, 0, 'Score :', {
            fontFamily: 'raleway',
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        })

        let scoreNumber = this.add.text(460, 0, '0', {
            fontFamily: 'raleway',
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(1, 0)

        scoreNumber.setText(this.finalScore)
        scoreTextContainer.add([scoreText, scoreNumber])

        let scoopTextContainer = this.add.container(screenCenterX - 230, 620)

        const scoopText = this.add.text(0, 0, 'Scoops :', {
            fontFamily: 'raleway',
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        })

        let scoopNumber = this.add.text(460, 0, '0', {
            fontFamily: 'raleway',
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(1, 0)

        scoopNumber.setText(this.finalScore / 10)
        scoopTextContainer.add([scoopText, scoopNumber])

        let panelContainer = this.add.container(screenCenterX, screenCenterY + 250)

        const menuButton = this.add.image(-200, 0, 'panelHome')
            .setInteractive()
            .setScale(3)

        menuButton.on('pointerdown', () => {
            this.scene.stop()
            // this.scene.stop(this.gameSceneKey )
            this.scene.start('MainMenu')
        });

        const nextLevelButton = this.add.image(200, 0, 'panelNextLevel')
            .setInteractive()
            .setScale(3)

        nextLevelButton.on('pointerdown', () => {
            // let nextLevel = this.levelMap[this.gameSceneKey]
            // this.scene.start(nextLevel)
        });

        const restartButton = this.add.image(0, 0, 'panelRestart')
            .setInteractive()
            .setScale(3)

        restartButton.on('pointerdown', () => {
            this.scene.stop()
            // this.scene.stop(this.gameSceneKey )
            // this.scene.start(this.gameSceneKey )
        });

        panelContainer.add([menuButton,restartButton,nextLevelButton])
    }
}