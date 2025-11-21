import { API_BASE_URL } from '../../config.js';

export class Result extends Phaser.Scene {
    constructor() {
        super('Result')

        this.levelMap = {
            'Level1': 'Level2',
            'Level2': 'Level3',
            'Level3': 'MainMenu'
        };

        this.levelMapPanel = {
            'Level1': 'Level 01',
            'Level2': 'Level 02',
            'Level3': 'level 03'
        };


        this.finalScore = 0
        this.analyticsReport = null
    }

    init(data) {
        this.finalScore = data.score
        this.scoop = data.scoop
        this.gameSceneKey = data.gameSceneKey
        this.analyticsReport = data.report
        this.win = data.win
    }

    create() {
        const { width, height } = this.sys.game.config

        let screenCenterX = width / 2
        let screenCenterY = height / 2

        if (!this.win) {
            this.finalScore = 0
            this.scoop = 0
            this.analyticsReport = null
        }

        //              Analytics               //
        if (this.analyticsReport) {
            this.sendAnalyticsToAPI(this.analyticsReport);
        }
        //              ---------               //

        this.add.rectangle(screenCenterX, screenCenterY, width, height, 0x000000, 0.5)
            .setInteractive()
            .on('pointerdown', () => {});

        this.add.image(screenCenterX, 0, 'gameOverPanel')
            .setOrigin(0.5, 0)
            .setScale(0.95)

        let bintangContainer = this.add.container(screenCenterX, 235)

        const bintang1 = this.add.image(-110, 10, 'bintang')
            .setScale(0.9)

        const bintang2 = this.add.image(0, 0, 'bintang')
            .setScale(1)

        const bintang3 = this.add.image(110, 10, 'bintang')
            .setScale(0.9)

        bintangContainer.add([bintang1, bintang2, bintang3])

        let labelJudul = this.add.text(screenCenterX, 500, 'KERJA BAGUS!', {
            fontFamily: 'lilita-one',
            fontSize: '72px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        if (!this.win) {
            labelJudul.setText('COBA LAGI')
            bintangContainer.setVisible(false)
        }

        this.add.text(screenCenterX, 390, this.levelMapPanel[this.gameSceneKey], {
            fontFamily: 'raleway',
            fontSize: '46px',
            fill: '#ffffff',
            fontStyle: 'bold'
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

        scoopNumber.setText(this.scoop)
        scoopTextContainer.add([scoopText, scoopNumber])

        let panelContainer = this.add.container(screenCenterX, screenCenterY + 250)

        const menuButton = this.add.image(-200, 0, 'panelHome')
            .setInteractive()
            .setScale(3)

        menuButton.on('pointerdown', () => {
            this.scene.stop()
            this.scene.stop(this.gameSceneKey )
            this.scene.start('MainMenu')
        });

        const nextLevelButton = this.add.image(200, 0, 'panelNextLevel')
        if (this.win) {
            // Kalo MENANG: Tombol Aktif & Terang
            nextLevelButton.setInteractive();
            nextLevelButton.clearTint();
            nextLevelButton.setScale(3)
            
            nextLevelButton.on('pointerdown', () => {
                const nextLevel = this.levelMap[this.gameSceneKey]
                
                if (nextLevel === 'MainMenu') {
                    // Kalo udah tamat (Level 3), balik ke menu
                    this.scene.stop()
                    this.scene.stop(this.gameSceneKey)
                    this.scene.start('MainMenu')
                } else {
                    // Lanjut level berikutnya
                    this.scene.stop()
                    this.scene.stop(this.gameSceneKey)
                    this.scene.start(nextLevel)
                }
            });
        } else {
            // Kalo KALAH: Tombol Mati & Gelap
            nextLevelButton.disableInteractive();
            nextLevelButton.setTint(0x555555); 
            nextLevelButton.setScale(3)
        }

        nextLevelButton.on('pointerdown', () => {
            const nextLevel = this.levelMap[this.gameSceneKey]
            this.scene.stop()
            this.scene.stop(this.gameSceneKey )
            this.scene.start(nextLevel)
        });

        const restartButton = this.add.image(0, 0, 'panelRestart')
            .setInteractive()
            .setScale(3)

        restartButton.on('pointerdown', () => {
            this.scene.stop()
            this.scene.stop(this.gameSceneKey)
            this.scene.start(this.gameSceneKey)
        });

        panelContainer.add([menuButton,restartButton,nextLevelButton])
    }

    async sendAnalyticsToAPI(data) {
        const apiEndpoint = `${API_BASE_URL}/v1/analytics/save`; 

        console.log('Mengirim data ke API:', data);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Sukses:', result);

        } catch (error) {
            console.error('API Gagal Nembak:', error);
        }
    }
}