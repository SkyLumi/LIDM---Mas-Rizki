export class Game extends Phaser.Scene {
    
    constructor() {
        super('Game');
        
        this.targetConePos = { x: 0, y: 0 };
        this.smoothingFactor = 0.3;

        this.hands = null;
        this.videoElement = null;
        
        this.gameTimeRemaining = 80;
        
        this.cone = null;
        this.iceCreams = null;
        this.scoreText = null;
        this.spawnTimer = null;
        this.camera = null;
    }

    create() {
        const { width, height } = this.sys.game.config;

        let screenCenterX = width / 2;
        let screenCenterY = height / 2;

        this.score = 0;
        this.maxLives = 3;
        this.currentLives = this.maxLives;
        this.lifeIcons = [];
        this.gameOver = false;
        
        this.videoElement = document.getElementById('webcam')

        this.add.image(screenCenterX, 0, 'machinery')
            .setOrigin(0.5, 0)
            .setScale(0.8)

        this.cone = this.physics.add.sprite(width / 2, height - 200, 'cone').setScale(0.45)
        this.cone.body.setAllowGravity(false)
        this.cone.setSize(80, 100)
        this.cone.setDepth(10)
        
        this.iceCreams = this.physics.add.group({
            defaultKey: 'iceCreamFall',
            runChildUpdate: true
        })

        // --- Animasi Es Krim --- ///
        this.anims.create({
            key: 'iceCreamFall_anim',
            frames: this.anims.generateFrameNumbers('iceCreamFall', { start: 0, end: -1 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'dispenserArm_anim',
            frames: this.anims.generateFrameNumbers('dispenserArm', { start: 0, end: -1 }),
            frameRate: 10,
            repeat: 0
        });

        // --- Detek collider Es krim dengan cone nya
        this.physics.add.overlap(this.cone, this.iceCreams, this.handleCatch, null, this);

        this.targetConePos = { x: width / 2, y: height - 100 }

        // --- Deteksi Tangan dan enable Camera ---
        this.initMediaPipe()

        this.dispenserArm = this.add.sprite(screenCenterX, -100, 'dispenserArm')
            .setOrigin(0.08, 0)
            .setScale(0.2)
            .setDepth(10)

        //--- UI ---              
        this.add.image(200, 150, 'boxLife')
            .setScale(1)

        this.lifeContainer = this.add.container(200, 150)
        const spacing = 65 
        const totalWidth = (this.maxLives - 1) * spacing
        
        for (let i = 0; i < this.maxLives; i++) {
            const x = -totalWidth / 2 + i * spacing
            const icon = this.add.image(x, 0, 'lifeIcon')
                .setScale(0.6)

            this.lifeContainer.add(icon);
            this.lifeIcons.push(icon);
        }

        this.add.image(width - 200, 150, 'boxLife')
            .setScale(1)

        this.add.image(width - 140, screenCenterY + 100, 'scorePanel')
            .setScale(1.2)

        const pauseButton = this.add.image(140, height + -140, 'pauseBtn')
            .setScale(0.8)
            .setInteractive()

        this.scoreText = this.add.text(width - 160, 320, '00', {
            fontFamily: 'lilita-one',
            fontSize: '72px',
            fill: '#045170' 
        })

        this.timerText = this.add.text(width - 265, 108, this.formatTime(this.gameTimeRemaining), {
            fontFamily: 'lilita-one',
            fontSize: '72px',
            fill: '#ffffff' 
        })

        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.spawnTimer = this.time.addEvent({
            delay: 2500,
            callback: this.jatuhinEsKrim,
            callbackScope: this,
            loop: true
        });

        pauseButton.on('pointerdown', () => {
            pauseButton.disableInteractive();
            this.cameras.main.setPostPipeline('Blur');
            this.scene.pause('Game'); 
            this.scene.launch('Pause');
        });

        // 5. Setup Audio
        // this.sound.stopAll(); // Matikan musik menu
        // this.sound.play('bgm-gameplay', { loop: true });
    }

    update(time, delta) {
        if (this.gameOver) return;

        let newX = Phaser.Math.Linear(this.cone.x, this.targetConePos.x, this.smoothingFactor);
        let newY = Phaser.Math.Linear(this.cone.y, this.targetConePos.y, this.smoothingFactor);
        this.cone.setPosition(newX, newY);

        this.iceCreams.children.each(cream => {
            if (cream.y > this.sys.game.config.height + 100) {
                this.loseLife(); 
                cream.destroy();
                
                if (this.currentLives <= 0) {
                    this.endGame(false)
                }
            }
        });
    }
    
    spawnIceCream(x) {        
        const y = 150;

        const cream = this.iceCreams.create(x, y, 'iceCreamFall').setScale(0.9)
        cream.body.setAllowGravity(false)
        cream.setVelocityY(400) 
        cream.play('iceCreamFall_anim')
    }

    handleCatch(cone, cream) {
        this.score += 10

        this.scoreText.setText(this.score)

        cream.destroy()

        if (this.score >= 100) {
            this.endGame()
        }
    }
    
    endGame() {
        this.gameOver = true
        
        if (this.camera) this.camera.stop()
        this.videoElement.classList.add('hidden')
        
        this.scene.start('Result', { score: this.score })
    }
    
    onMediaPipeResults(results) {
        
        const { width, height } = this.sys.game.config;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            if (results.multiHandLandmarks.length === 2) {
                const wrist1 = results.multiHandLandmarks[0][0];
                const wrist2 = results.multiHandLandmarks[1][0];
                this.targetConePos.x = ((wrist1.x + wrist2.x) / 2) * width;
                this.targetConePos.y = (Math.min(wrist1.y, wrist2.y) * height) - 100;
            }
        }
        
    }

    loseLife() {
        if (this.currentLives > 0) {
            this.currentLives--;
            const lostIcon = this.lifeIcons[this.currentLives];
            lostIcon.setVisible(false);
        }

        if (this.currentLives === 0) {
            console.log('GAME OVER!');
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

    jatuhinEsKrim() {
        const { width } = this.sys.game.config;
        
        const targetX = Phaser.Math.Between(800, width - 800); 

        this.tweens.add({
            targets: this.dispenserArm,
            x: targetX,
            duration: 500,
            ease: 'Power1',
        
            onComplete: () => {
                this.dispenserArm.play('dispenserArm_anim');
                this.dispenserArm.once('animationcomplete', () => {
                this.spawnIceCream(targetX)
                this.dispenserArm.setFrame(0)
            });
            }
        });
    }

    updateTimer() {
        this.gameTimeRemaining--;
        this.timerText.setText(this.formatTime(this.gameTimeRemaining));

        if (this.gameTimeRemaining <= 0) {
            this.gameTimer.remove(); 
            this.endGame(false); 
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const partInSeconds = seconds % 60;
        const partInSecondsFormatted = partInSeconds.toString().padStart(2, '0');
        return `${minutes}:${partInSecondsFormatted}`;
    }
}