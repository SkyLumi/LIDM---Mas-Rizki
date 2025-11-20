import MediaPipeManager from "./mediapipeManager.js";

export class BaseGameScene extends Phaser.Scene {
    
constructor(key) {
        super(key);

        this.videoElement = null;
        this.mediapipe = null;
        this.dispenser = null;

        // --- Variabel State Game ---
        this.scoreText = null;
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.numToys = 1; // Default 1 mainan, Level bisa "niban" (override)
        this.toys = null; // Ini akan jadi "Group"

        // --- Konstanta Fisika ---
        this.physicsConstants = { gravity: 0.25, friction: 0.99, bounce: 0.7 };
        this.smoothingFactor = 0.2;
        
        // --- Spawner ---
        this.spawnMinX = 300;
        this.spawnMaxX = 1000; // Nanti di-set di create()
    }

    editorCreate() {

        const { width, height } = this.sys.game.config

        this.add.image(width / 2, 48, "topbar").setScale(0.93)

        this.basket = this.add.image(width - 230, height - 150, "bucket");
        this.basket.setData({ width: 265, height: 260 });

        // pause_btn
        const pause_btn = this.add.image(112, height - 80, "pause-btn").setScale(0.67);
        pause_btn.setInteractive()
            .on('pointerdown', () => {
                if (this.gameOver) return;
                // this.sound.play('menubtnClick');
                this.scene.launch('PauseScene'); // Buka scene Pause
                this.scene.pause(); // Pause game ini
            });

        // rightbar
        // Ini kayaknya buat bar skor?
        this.add.image(width - 64, 400, "rightbar").setScale(0.74);

        // dropPointandGear (Dispenser)
        // Saya ganti jadi Sprite biar bisa animasi
        this.dispenser = this.add.sprite(width / 2, 128, "dropPointandGear").setScale(0.67);
        this.dispenser.setData({
            state: 'IDLE',
            targetX: width / 2,
            speed: 10,
            frameWidth: 435, // Ukuran dari script lama
            frameHeight: 272,
            frameCount: 3,
            currentFrame: 0, // Ganti nama frame
            animationSpeed: 150,
            lastFrameTime: 0,
            idleMoveTimer: 0,
            idleMoveCooldown: 3000
        });
        // Kita perlu animasi buat dispenser
        this.anims.create({
            key: 'dispense_anim',
            frames: this.anims.generateFrameNumbers('dropPointandGear', { start: 0, end: 2 }), // Asumsi 3 frame
            frameRate: 1000 / 150, // 150ms per frame
            repeat: 0
        });

        // papan
        this.plank = this.add.image(width / 2, height / 2, "papan").setScale(0.73);
        this.plank.setData({
            width: 680, height: 80,
            halfWidth: 340, halfHeight: 40
        });

        // leftbar (Hiasan)
        // Saya ganti jadi Sprite
        // this.leftbar = this.add.sprite(0, 0, "leftbar").setOrigin(0, 0).setScale(0.74);
        // this.leftbar.setData({
        //     frameWidth: 204, frameHeight: 640, frameCount: 6
        // });
        // // Animasi Hiasan
        // this.anims.create({
        //     key: 'hiasan_anim',
        //     frames: this.anims.generateFrameNumbers('leftbar', { start: 0, end: 5 }), // Asumsi 6 frame
        //     frameRate: 2, // Pelan saja
        //     repeat: -1
        // });
        // this.leftbar.play('hiasan_anim'); // Langsung mainkan
        // this.hiasanSequenceIndex = 0; // Untuk update manual

        // Bola (dibuat di create, tapi disembunyikan)
        this.ball = this.add.image(this.dispenser.x, this.dispenser.y + 100, "bola");
        this.ball.setData({
            radius: 20, vx: 0, vy: 0, isActive: false
        });
        this.ball.setScale(0.5);
        this.ball.setVisible(false);

        // Teks Skor
        this.scoreText = this.add.text(width / 2, 80, "SKOR: 0", {
            fontFamily: '"Luckiest Guy"',
            fontSize: "48px",
            color: "#FFFFFF",
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.events.emit("scene-awake");
    }

    create() {
        this.editorCreate();

        // Init game state
        const { width } = this.sys.game.config;
        
        // Atur batas spawn di sini (contoh: 300px dari pinggir)
        const spawnMargin = 300; 
        this.spawnMinX = spawnMargin;
        this.spawnMaxX = width - spawnMargin;

        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.targetPlankPos.x = this.plank.x;
        this.targetPlankPos.y = this.plank.y;
        this.targetPlankPos.angle = 0;
        this.hiasanSequenceIndex = 0;

        // Init MediaPipe
        this.videoElement = document.getElementById('webcam');
        if (!this.videoElement) {
            console.error("Elemen video 'webcam' tidak ditemukan!");
            return;
        }
        this.mediapipe = new MediaPipeManager(this.videoElement, this.onMediaPipeResults.bind(this));

        // Putar musik gameplay
        // this.sound.stopAll();
        // this.sound.play('gameplay', { loop: true });

        // Mulai Countdown
        this.startCountdown();
    }

    startCountdown() {
        const { width, height } = this.sys.game.config;
        const countdownImages = ['3', '2', '1'];
        let count = 0;

        const showImage = () => {
            if (count < countdownImages.length) {
                const img = this.add.image(width / 2, height / 2, countdownImages[count])
                    .setScale(2)
                    .setAlpha(0);

                this.tweens.add({
                    targets: img,
                    scale: 1,
                    alpha: 1,
                    duration: 300,
                    ease: 'Power2',
                    yoyo: true,
                    hold: 400,
                    onComplete: () => {
                        img.destroy();
                        count++;
                        showImage();
                    }
                });
            } else {
                this.gameStarted = true;
                this.spawnBall(); // Jatuhkan bola pertama
            }
        };

        showImage();
    }

    // Ini dipanggil oleh MediaPipeManager
    onMediaPipeResults(results) {
        if (!this.sys || !this.sys.game || !this.gameStarted) return;
        const { width, height } = this.sys.game.config;

        // Logika plank dari script lama
        const maxAngle = 0.8;
        const angleSensitivity = 0.005;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length === 2) {
            const wrist1 = results.multiHandLandmarks[0][0];
            const wrist2 = results.multiHandLandmarks[1][0];
            // Koordinat X dibalik (1 - x)
            this.targetPlankPos.x = ((wrist1.x + wrist2.x) / 2) * width;
            this.targetPlankPos.y = ((wrist1.y + wrist2.y) / 2) * height;

            let leftHandY = (wrist1.x > wrist2.x) ? wrist1.y : wrist2.y;
            let rightHandY = (wrist1.x < wrist2.x) ? wrist1.y : wrist2.y;
            let yDiff = (leftHandY - rightHandY) * height;
            let targetAngle = yDiff * angleSensitivity;
            this.targetPlankPos.angle = Phaser.Math.Clamp(targetAngle, -maxAngle, maxAngle);

        } 
    }

    update(time, delta) {
        if (this.gameOver || !this.gameStarted) return;

        this.updatePlankPosition();
        this.updateDispenser(time);
        this.updateBallPhysics();
        this.checkCollisions();
    }

    updatePlankPosition() {
        // Smoothing
        this.plank.x += (this.targetPlankPos.x - this.plank.x) * this.smoothingFactor;
        this.plank.y += (this.targetPlankPos.y - this.plank.y) * this.smoothingFactor;
        this.plank.rotation += (this.targetPlankPos.angle - this.plank.rotation) * this.smoothingFactor;
    }

    updateDispenser(time) {
        const data = this.dispenser.data.values;

        switch (data.state) {
            case 'IDLE':
                if (time - data.idleMoveTimer > data.idleMoveCooldown) {
                    data.targetX = Phaser.Math.Between(this.spawnMinX, this.spawnMaxX);
                    data.state = 'IDLE_MOVING';
                    data.idleMoveTimer = time;
                }
                break;

            case 'IDLE_MOVING':
            case 'MOVING_TO_SPAWN':
                if (Math.abs(this.dispenser.x - data.targetX) > data.speed) {
                    this.dispenser.x += Math.sign(data.targetX - this.dispenser.x) * data.speed;
                } else {
                    this.dispenser.x = data.targetX;
                    if (data.state === 'MOVING_TO_SPAWN') {
                        data.state = 'DISPENSING';
                        this.dispenser.play('dispense_anim');
                        this.dispenser.once('animationcomplete', () => {
                            this.resetBall(); // Bola muncul
                            data.state = 'IDLE';
                            data.idleMoveTimer = time;
                            this.dispenser.setFrame(0); // Kembali ke frame awal
                        });
                    } else {
                        data.state = 'IDLE';
                    }
                }
                break;
        }
    }

    spawnBall() {
        if (this.gameOver) return;
        const data = this.dispenser.data.values;

        data.targetX = Phaser.Math.Between(this.spawnMinX, this.spawnMaxX);
        data.state = 'MOVING_TO_SPAWN';
    }

    resetBall() {
        this.ball.setPosition(this.dispenser.x, this.dispenser.y + (this.dispenser.data.values.frameHeight / 2));
        this.ball.setData('vx', 0);
        this.ball.setData('vy', 0);
        this.ball.setData('isActive', true);
        this.ball.setVisible(true);
    }

    updateBallPhysics() {
        if (!this.ball.getData('isActive')) return;

        const ballData = this.ball.data.values;
        const plankData = this.plank.data.values;

        ballData.vy += this.physicsConstants.gravity;
        this.ball.x += ballData.vx;
        this.ball.y += ballData.vy;

        this.ball.rotation += ballData.vx * 0.05;

        const dx = this.ball.x - this.plank.x;
        const dy = this.ball.y - this.plank.y;
        const rotatedX = dx * Math.cos(-this.plank.rotation) - dy * Math.sin(-this.plank.rotation);
        const rotatedY = dx * Math.sin(-this.plank.rotation) + dy * Math.cos(-this.plank.rotation);

        const closestX = Phaser.Math.Clamp(rotatedX, -plankData.halfWidth, plankData.halfWidth);
        const closestY = Phaser.Math.Clamp(rotatedY, -plankData.halfHeight, plankData.halfHeight);

        const distance = Math.sqrt((rotatedX - closestX) ** 2 + (rotatedY - closestY) ** 2);

        if (distance < ballData.radius) {
            const penetration = ballData.radius - distance;
            const collisionVectorX = rotatedX - closestX;
            const collisionVectorY = rotatedY - closestY;
            const vectorLength = Math.sqrt(collisionVectorX ** 2 + collisionVectorY ** 2) || 1;

            let normalLocalX = collisionVectorX / vectorLength;
            let normalLocalY = collisionVectorY / vectorLength;

            const normalWorldX = normalLocalX * Math.cos(this.plank.rotation) - normalLocalY * Math.sin(this.plank.rotation);
            const normalWorldY = normalLocalX * Math.sin(this.plank.rotation) + normalLocalY * Math.cos(this.plank.rotation);

            this.ball.x += normalWorldX * penetration;
            this.ball.y += normalWorldY * penetration;

            const dotProduct = ballData.vx * normalWorldX + ballData.vy * normalWorldY;
            const newVx = ballData.vx - 2 * dotProduct * normalWorldX;
            const newVy = ballData.vy - 2 * dotProduct * normalWorldY;

            ballData.vx = newVx * this.physicsConstants.friction;
            ballData.vy = newVy * this.physicsConstants.bounce;
        }
    }

    checkCollisions() {
        if (!this.ball.getData('isActive')) return;

        const { height } = this.sys.game.config;
        const basketData = this.basket.data.values;

        // Cek Masuk Keranjang
        const basketHitbox = {
            left: this.basket.x - basketData.width / 2,
            right: this.basket.x + basketData.width / 2,
            top: this.basket.y - basketData.height / 2,
            bottom: this.basket.y + basketData.height / 2
        };

        if (this.ball.x > basketHitbox.left && this.ball.x < basketHitbox.right &&
            this.ball.y > basketHitbox.top && this.ball.y < basketHitbox.bottom) {

            this.score += 100;
            this.scoreText.setText(`SKOR: ${this.score}`);
            this.ball.setData('isActive', false);
            this.ball.setVisible(false);

            // this.hiasanSequenceIndex = (this.hiasanSequenceIndex + 1) % this.leftbar.data.values.frameCount;
            // this.leftbar.setFrame(this.hiasanSequenceIndex);

            // this.sound.play('sfxwin');

            this.time.delayedCall(500, this.spawnBall, [], this);
        }

        if (this.ball.y - this.ball.getData('radius') > height) {
            this.ball.setData('isActive', false);
            this.ball.setVisible(false);
            this.time.delayedCall(500, this.spawnBall, [], this);
        }
    }

    endGame() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.gameStarted = false;

        // this.sound.stopAll();
        // if (this.score >= 60) {
        //     this.sound.play('winsfx', {
        //         onComplete: () => this.sound.play('winloop', { loop: true })
        //     });
        // } else {
        //     this.sound.play('bglose', { loop: true });
        // }

        // if (this.mediapipe) {
        //     this.mediapipe.destroy();
        // }

        this.scene.launch('ResultScene', { score: this.score });
    }

    shutdown() {
        console.log('GameScene shutdown, clearing mediapipe');
        if (this.mediapipe) {
            this.mediapipe.destroy();
        }
    }
}