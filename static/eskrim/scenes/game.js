export class Game extends Phaser.Scene {
    
    constructor() {
        super('Game');
        
        this.targetConePos = { x: 0, y: 0 };
        this.smoothingFactor = 0.3;

        this.hands = null;
        this.videoElement = null;
    }

    create() {
        const { width, height } = this.sys.game.config;

        let screenCenterX = width / 2;
        let screenCenterY = height / 2;

        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        
        this.videoElement = document.getElementById('webcam')
                
        this.add.image(screenCenterX, 0, 'machinery').setOrigin(0.5, 0)


        this.cone = this.physics.add.sprite(width / 2, height - 200, 'cone').setScale(0.5);
        this.cone.body.setAllowGravity(false);
        this.cone.setSize(80, 50)
        
        this.iceCreams = this.physics.add.group({
            defaultKey: 'iceCreamFall',
            runChildUpdate: true // Biarkan es krim mengurus update-nya sendiri
        });

        this.physics.add.overlap(this.cone, this.iceCreams, this.handleCatch, null, this);

        this.targetConePos = { x: width / 2, y: height - 100 };

        this.initMediaPipe()

        this.add.sprite(screenCenterX, -120, 'dispenserArm')
            .setOrigin(0.08, 0)
            .setScale(0.25)

        //              UI              
        this.add.image(250, 150, 'boxLife')
            .setScale(1.2)

        this.add.image(width - 250, 150, 'boxLife')
            .setScale(1.2)

        this.add.image(width - 180, screenCenterY + 50, 'scorePanel')
            .setScale(1.4)

        this.add.image(200, height + -180, 'pauseBtn')
        // 5. Setup Audio
        // this.sound.stopAll(); // Matikan musik menu
        // this.sound.play('bgm-gameplay', { loop: true });
    }

    update(time, delta) {
    //     if (this.gameOver) return;

    //     // 1. Gerakkan Cone (Phaser)
    //     // Posisi cone mengejar targetPos yang di-update oleh MediaPipe
    //     let newX = Phaser.Math.Linear(this.cone.x, this.targetConePos.x, this.smoothingFactor);
    //     let newY = Phaser.Math.Linear(this.cone.y, this.targetConePos.y, this.smoothingFactor);
    //     this.cone.setPosition(newX, newY);

    //     // 2. Spawning Es Krim (Phaser)
    //     // ... (Logika timer Anda untuk memanggil this.spawnIceCream()) ...

    //     // 3. Cek Es Krim yang Jatuh (Phaser)
    //     this.iceCreams.children.each(cream => {
    //         if (cream.y > this.sys.game.config.height + 100) {
    //             this.lives--;
    //             // ... (update UI nyawa) ...
    //             cream.destroy();
                
    //             if (this.lives <= 0) this.endGame();
    //         }
    //     });
    }
    
    // spawnIceCream(x, y) {
    //     // Ambil es krim dari grup (atau buat baru)
    //     const cream = this.iceCreams.create(x, y, 'iceCreamFall');
    //     cream.body.setAllowGravity(false);
    //     cream.setVelocityY(400); // Kecepatan jatuh (px/detik)
    //     // cream.play('iceCreamFall');
    // }

    // handleCatch(cone, cream) {
    //     // Es krim tertangkap
    //     this.score += 10;
    //     // ... (update UI skor) ...
    //     cream.destroy(); // Hapus es krim

    //     // Cek kemenangan
    //     if (this.score >= 100) this.endGame();
    // }
    
    // endGame() {
    //     this.gameOver = true;
        
    //     if (this.camera) this.camera.stop();
    //     this.videoElement.classList.add('hidden');
        
    //     this.scene.start('Result', { score: this.score });
    // }
    
    onMediaPipeResults(results) {
        
        const { width, height } = this.sys.game.config;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            if (results.multiHandLandmarks.length === 2) {
                // Logika dua tangan
                const wrist1 = results.multiHandLandmarks[0][0];
                const wrist2 = results.multiHandLandmarks[1][0];
                this.targetConePos.x = ((wrist1.x + wrist2.x) / 2) * width;
                this.targetConePos.y = (Math.min(wrist1.y, wrist2.y) * height) - 100;
            }
        }
        
    }

    initMediaPipe() {
        this.hands = new window.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
            selfieMode: true
        });

        // Set callback 'onResults'
        this.hands.onResults((results) => this.onMediaPipeResults(results));

        this.camera = new window.Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: this.videoElement });
            },
            width: 640, height: 480,
            facingMode: 'user',
        });
        
        this.camera.start().catch(err => {
            console.error("Gagal mengakses kamera", err);
        });
    }
}