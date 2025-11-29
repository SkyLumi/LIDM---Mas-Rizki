import { API_BASE_URL } from '../../config.js'; // 1. WAJIB IMPORT

export class Result extends Phaser.Scene {
    constructor() {
        super('Result');
    }

    init(data) {
        this.score = data.score || 0;
        this.stars = data.stars || 0;
        this.levelCompleted = data.levelCompleted || false;
        
        // Ambil Key Level sebelumnya (Penting buat matikan scene biar gak freeze)
        this.previousLevelKey = data.levelKey || 'Level1'; 
        
        // 2. WAJIB AMBIL DATA ANALYTICS DARI SINI
        this.analyticsReport = data.analyticsReport; 
    }

    create() {
        const { width, height } = this.sys.game.config;
        const screenCenterX = width / 2;
        const screenCenterY = height / 2;
        const isMusicOn = this.registry.get('isMusicOn');
        this.bgMusic = this.sound.add('bgWin', { 
            loop: true, 
            volume: 0.5 
        });

        if (isMusicOn) {
            this.time.delayedCall(300, () => {
                if (this.bgMusic && !this.bgMusic.isPlaying) {
                    this.bgMusic.play();
                }
            });
        }

        // 1. Overlay
        this.add.rectangle(screenCenterX, screenCenterY, width, height, 0x000000, 0.7)
            .setInteractive();

        // 2. Panel Bintang
        const panelKey = `result-${this.stars}star`;
        this.add.image(screenCenterX, screenCenterY - 195, panelKey).setScale(1.0);
        
        // 3. Judul
        const titleKey = this.levelCompleted ? 'textWin' : 'textLose';
        this.add.image(screenCenterX, screenCenterY - 160, titleKey).setScale(0.8);

        // 4. Score
        const scoreY = screenCenterY + 20; 
        const scoreContainer = this.add.container(screenCenterX, scoreY);

        const scoreLabel = this.add.image(0, -60, 'Score').setScale(0.9).setOrigin(1, 0.5); 
        const scoreValue = this.add.text(20, -60, `${this.score}`, {
            fontFamily: 'LilitaOne', fontSize: "64px", color: "#FFFFFF"
        })
        .setOrigin(0, 0.5)
        .setShadow(3, 3, "#7A0806", 0, true, true);

        scoreLabel.x = -40; 
        scoreValue.x = 60;
        scoreContainer.add([scoreLabel, scoreValue]);

        // 5. Logic Tombol
        let buttonsToShow = [];
        buttonsToShow.push('home');
        buttonsToShow.push('retry');

        if (this.levelCompleted && this.previousLevelKey !== 'Level3') {
            buttonsToShow.push('next');
        }

        // --- Render Tombol ---
        const btnY = screenCenterY + 110; 
        const btnGap = 200; 
        
        let startX = screenCenterX - ((buttonsToShow.length - 1) * btnGap) / 2;

        buttonsToShow.forEach((btnType, index) => {
            let btnKey = '';
            let onClick = null;
            let baseScale = 0.75; 

            if (btnType === 'home') {
                btnKey = 'home-btn';
                onClick = () => this.stopGameAndGo('MainMenu');
            } else if (btnType === 'retry') {
                btnKey = 'retry-btn';
                onClick = () => this.stopGameAndGo(this.previousLevelKey);
            } else if (btnType === 'next') {
                btnKey = 'next_stage'; 
                baseScale = 0.97; 
                onClick = () => {
                    const currentNum = parseInt(this.previousLevelKey.replace('Level', ''));
                    const nextLevelKey = `Level${currentNum + 1}`;
                    this.stopGameAndGo(nextLevelKey);
                };
            }

            // Buat Tombol
            const button = this.add.image(startX + (index * btnGap), btnY, btnKey)
                .setInteractive()
                .setScale(baseScale); 

            button.on('pointerdown', onClick);
            button.on('pointerover', () => button.setScale(baseScale + 0.05));
            button.on('pointerout', () => button.setScale(baseScale));
        });

        // 6. KIRIM API (PINDAHKAN KELUAR LOOP AGAR CUMA JALAN SEKALI)
        if (this.levelCompleted && this.analyticsReport) {
            console.log("Syarat terpenuhi, mengirim Analitik...", this.analyticsReport);
            this.sendAnalyticsToAPI(this.analyticsReport);
        } else {
            console.log("Data tidak dikirim (Kalah atau Data Kosong).");
        }
    }

    // --- FUNGSI NAVIGASI BERSIH (Supaya Gak Double Asset) ---
    stopGameAndGo(targetScene) {
        
        if (this.bgMusic) {
            this.bgMusic.stop();
        }

        // 1. Matikan Scene Result ini
        this.scene.stop('Result');
        
        // 2. Matikan Scene Game Level di belakangnya (WAJIB)
        this.scene.stop(this.previousLevelKey);
        
        // 3. Baru mulai scene tujuan
        this.scene.start(targetScene);
    }

    async sendAnalyticsToAPI(data) {
        const apiEndpoint = `${API_BASE_URL}/v1/analytics/save`; 

        console.log('Sedang POST data ke:', apiEndpoint);

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
            console.log('API Sukses Terkirim:', result);

        } catch (error) {
            console.error('API Gagal Nembak:', error);
        }
    }
}