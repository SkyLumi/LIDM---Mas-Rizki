import MediaPipeManager from "./mediapipeManager.js";

export class BaseGameScene extends Phaser.Scene {
    
    constructor(key) {
        super(key);
    }

    init() {
        // 1. HARD CLEANUP
        this.children.removeAll(true);
        this.sound.stopAll();
        this.tweens.killAll();
        this.time.removeAllEvents();

        // 2. RESET SYSTEM VARIABLES
        this.videoElement = null;
        this.mediapipe = null;
        this.dispenser = null;
        this.plank = null; 
        this.ball = null;  
        this.ball2 = null; 
        this.bucket = null; 
        this.pauseBtn = null; 
        
        this.leftBar = null; 
        this.rightBar = null;
        this.lifePanel = null;
        this.livesGroup = []; 
        this.scoreBar = null;
        this.scoreBarFill = null;
        this.scoreText = null; 

        // 3. GAME STATE
        this.score = 0; 
        this.itemsCollected = 0; 
        this.itemsDropped = 0; // Tambahan untuk hitung akurasi
        this.targetItems = 3;    
        this.currentLives = 3;   
        this.spawnDelay = 3000; 
        
        this.gameOver = false;
        this.gameStarted = false;
        this.isProcessingBall = false; 
        this.isDispensingSequence = false;
        this.currentBarSide = 'left'; 

        this.physicsConstants = { gravity: 0.25, friction: 0.99, bounce: 0.7 };
        this.smoothingFactor = 0.2;
        this.spawnMinX = 300;
        this.spawnMaxX = 1000;

        this.itemMap = [null, "volley", "bola", "bebek", "paus", "jeruk"];
        this.nextItemIndex = 1; 
        this.maxItemIdx = 5; 

        // --- [NEW: ANALYTICS DATA STRUCTURE] ---
        this.analytics = {
            gameStartTime: 0,       // Diisi saat startCountdown selesai
            totalFrames: 0,         // Total frame game berjalan
            handLossFrames: 0,      // Frame dimana tangan tidak terdeteksi
            heatmapData: [],        // Koordinat tangan [x, y]
            reactionTimes: [],      // Waktu dari spawn -> masuk keranjang
            balanceTimes: [],       // Waktu bertahan di atas papan (PlankTouch -> Bucket)
            missedBalls: 0          // Bola jatuh
        };
    }

    create() {
        this.scene.resume();
        this.events.off('shutdown');
        this.events.on('shutdown', this.shutdown, this);

        const { width, height } = this.sys.game.config;
        this.spawnMaxX = width - 300;
        this.targetPlankPos = { x: width/2, y: height/2, angle: 0 };

        // --- SETUP UI & OBJECTS (Sama seperti sebelumnya) ---
        this.add.image(width / 2, 45, "topbar").setScale(0.95);

        const panelX = 64;
        const panelY = 50; 
        this.lifePanel = this.add.image(panelX, panelY, "lifePanel").setScale(1.6).setDepth(20);
        
        const startHeartX = panelX - 25;
        const heartY = panelY; 
        const heartSpacing = 25;
        for (let i = 0; i < 3; i++) {
            let heart = this.add.image(startHeartX + (i * heartSpacing), heartY, "live").setScale(1.2).setDepth(30);
            this.livesGroup.push(heart);
        }
        
        const barY = 240; 
        this.leftBar = this.add.sprite(75, barY, "bar").setScale(0.75);
        this.leftBar.setFrame(0); 
        this.rightBar = this.add.sprite(width - 65, barY, "bar").setScale(0.75);
        this.rightBar.setFrame(0); 

        const scoreBarY = barY + 400; 
        const scoreBarX = 1828; 
        this.scoreBar = this.add.image(scoreBarX, scoreBarY, "scoreBar").setScale(0.8).setDepth(-1); 
        const fillStartY = scoreBarY + (this.scoreBar.displayHeight / 2) - 5; 
        this.scoreBarFill = this.add.image(scoreBarX + 30, fillStartY - 15, "scoreBarFill");
        this.scoreBarFill.setOrigin(0.5, 1); 
        this.scoreBarFill.setScale(0.8, 0);
        this.scoreBarFill.setDepth(-10); 
        this.scoreText = this.add.text(scoreBarX - 44, scoreBarY - 46, "0", {
            fontFamily: 'LilitaOne', fontSize: "32px", color: "#045170"
        }).setOrigin(0.5).setDepth(12);

        this.pauseBtn = this.add.image(112, height - 80, "pause-btn").setScale(0.67);
        this.pauseBtn.setInteractive().on('pointerdown', () => this.pauseGame());
        this.pauseBtn.setVisible(false); 

        this.bucket = this.add.image(width - 230, height - 150, "bucket");
        this.bucket.setData({ width: 265, height: 260 }); 

        this.dispenser = this.add.sprite(width / 2, 128, "dropPointandGear").setScale(0.67);
        this.dispenser.setData({
            state: 'IDLE', targetX: width / 2, speed: 10,
            frameWidth: 435, frameHeight: 272,
            idleMoveTimer: 0, idleMoveCooldown: this.spawnDelay 
        });

        if (!this.anims.exists('dispense_anim')) {
            this.anims.create({
                key: 'dispense_anim', 
                frames: this.anims.generateFrameNumbers('dropPointandGear', { start: 0, end: 1 }),
                frameRate: 8, repeat: 0
            });
        }

        this.plank = this.add.image(width / 2, height / 2, "papan").setScale(0.73);
        this.plank.setData({ width: 680, height: 80, halfWidth: 340, halfHeight: 40 });
        this.targetPlankPos.x = this.plank.x;
        this.targetPlankPos.y = this.plank.y;

        this.ball = this.add.image(this.dispenser.x, this.dispenser.y + 100, "bola");
        this.ball.setData({ radius: 25, vx: 0, vy: 0, isActive: false });
        this.ball.setScale(0.5); 
        this.ball.setVisible(false);

        this.ball2 = this.add.image(this.dispenser.x, this.dispenser.y + 100, "bola");
        this.ball2.setData({ radius: 25, vx: 0, vy: 0, isActive: false });
        this.ball2.setScale(0.5); 
        this.ball2.setVisible(false);

        this.videoElement = document.getElementById('webcam');
        if (this.mediapipe) { try { this.mediapipe.destroy(); } catch(e){} this.mediapipe = null; }
        this.mediapipe = new MediaPipeManager(this.videoElement, this.onMediaPipeResults.bind(this));
        
        this.createLevelLogic(); 
        this.dispenser.data.values.idleMoveCooldown = this.spawnDelay;

        this.showTutorial();
    }
    
    setupBall(ballObj, itemName) {
        ballObj.setTexture(itemName);
        if (itemName === 'apel' || itemName === 'jeruk') { ballObj.setScale(0.9); } 
        else if (itemName == 'bebek' || itemName == 'paus') { ballObj.setScale(0.85); } 
        else { ballObj.setScale(0.5); }

        ballObj.setPosition(this.dispenser.x, this.dispenser.y + (this.dispenser.data.values.frameHeight / 2));
        ballObj.setData('vx', 0);
        ballObj.setData('vy', 0);
        ballObj.setData('isActive', true);
        ballObj.setVisible(true);

        // --- ANALYTICS: CATAT WAKTU SPAWN ---
        ballObj.setData('spawnTime', this.time.now);
        ballObj.setData('plankTouchTime', null); // Reset waktu sentuh papan
    }

    showTutorial() {
        const { width, height } = this.sys.game.config;
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7).setDepth(99).setInteractive(); 
        const tutorialKey = this.scene.key.replace("Level", "Level "); 
        const tutorialImage = this.add.image(width/2, height/2 - 100, tutorialKey).setDepth(100).setScale(0.9);
        const startBtn = this.add.image(width/2, height/2 + 290, "mulai_button").setInteractive().setDepth(101).setScale(1.3);

        startBtn.once('pointerdown', () => {
            overlay.destroy(); tutorialImage.destroy(); startBtn.destroy();
            this.startCountdown();
        });
    }

    startCountdown() {
        const { width, height } = this.sys.game.config;
        const countdownImages = ['3', '2', '1'];
        let count = 0;
        this.leftBar.setFrame(0);
        this.rightBar.setFrame(0);
        const showImage = () => {
            if (count < countdownImages.length) {
                const img = this.add.image(width / 2, height / 2, countdownImages[count]).setScale(1).setAlpha(0).setDepth(100);
                this.tweens.add({
                    targets: img, scale: 0.5, alpha: 1, duration: 300, ease: 'Power2',
                    yoyo: true, hold: 400,
                    onComplete: () => { img.destroy(); count++; showImage(); }
                });
            } else {
                this.gameStarted = true;
                // --- ANALYTICS: START TIME ---
                this.analytics.gameStartTime = this.time.now;
                
                this.pauseBtn.setVisible(true);
                this.spawnBall(); 
            }
        };
        showImage();
    }

    onMediaPipeResults(results) {
        if (!this.sys || !this.sys.game || !this.gameStarted || this.gameOver) return;
        
        // --- ANALYTICS: HAND TRACKING ---
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // Tangan terdeteksi
            // Simpan data heatmap (Sampling tiap 10 frame biar memori gak jebol)
            if (this.analytics.totalFrames % 10 === 0) {
                const hand = results.multiHandLandmarks[0][0]; // Ambil koordinat wrist tangan pertama
                this.analytics.heatmapData.push({ x: hand.x, y: hand.y });
            }
        } else {
            // Tangan hilang
            this.analytics.handLossFrames++;
        }

        // Logic Gerak Papan
        const { width, height } = this.sys.game.config;
        const maxAngle = 0.8;
        const angleSensitivity = 0.005;
        if (results.multiHandLandmarks && results.multiHandLandmarks.length === 2) {
            const wrist1 = results.multiHandLandmarks[0][0];
            const wrist2 = results.multiHandLandmarks[1][0];
            this.targetPlankPos.x = ((wrist1.x + wrist2.x) / 2) * width;
            this.targetPlankPos.y = ((wrist1.y + wrist2.y) / 2) * height;
            let leftHandY = (wrist1.x > wrist2.x) ? wrist1.y : wrist2.y;
            let rightHandY = (wrist1.x < wrist2.x) ? wrist1.y : wrist2.y;
            let yDiff = (leftHandY - rightHandY) * height;
            this.targetPlankPos.angle = Phaser.Math.Clamp(yDiff * angleSensitivity, -maxAngle, maxAngle);
        } 
    }

    update(time, delta) {
        if (this.gameOver || !this.gameStarted) return;
        
        // --- ANALYTICS: HITUNG FRAME ---
        this.analytics.totalFrames++;

        this.updatePlankPosition(); 
        this.updateDispenser(time); 
        this.updateBallPhysics();   
        this.updateLevelLogic(time, delta); 
        this.checkCollisions();     
    }

    updatePlankPosition() {
        this.plank.x += (this.targetPlankPos.x - this.plank.x) * this.smoothingFactor;
        this.plank.y += (this.targetPlankPos.y - this.plank.y) * this.smoothingFactor;
        this.plank.rotation += (this.targetPlankPos.angle - this.plank.rotation) * this.smoothingFactor;
    }

    createLevelLogic() {}
    updateLevelLogic(time, delta) {}

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
                        this.updateBarTurn(); 
                        this.nextItemIndex = Phaser.Math.Between(1, this.maxItemIdx);
                        if (this.currentBarSide === 'left') { this.leftBar.setFrame(this.nextItemIndex); } 
                        else { this.rightBar.setFrame(this.nextItemIndex); }
                        
                        this.dispenser.play('dispense_anim');
                        this.dispenser.once('animationcomplete', () => {
                            this.dropBallFromDispenser(); 
                            data.state = 'IDLE';
                            data.idleMoveTimer = time;
                            this.dispenser.setFrame(0);
                        });
                    } else {
                        data.state = 'IDLE';
                    }
                }
                break;
        }
    }

    spawnBall() {
        if (this.gameOver || this.isProcessingBall) return;
        if (this.itemsCollected >= this.targetItems) {
            this.handleLevelComplete();
            return;
        }
        if (this.currentBarSide === 'left') { this.leftBar.setFrame(0); } 
        else { this.rightBar.setFrame(0); }
        
        const data = this.dispenser.data.values;
        data.targetX = Phaser.Math.Between(this.spawnMinX, this.spawnMaxX);
        data.state = 'MOVING_TO_SPAWN';
    }

    dropBallFromDispenser() {
        const currentItemName = this.itemMap[this.nextItemIndex];
        this.setupBall(this.ball, currentItemName);
    }

    updateBarTurn() { this.currentBarSide = 'left'; }

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
            // --- ANALYTICS: SENTUH PAPAN ---
            // Jika baru pertama kali sentuh papan, catat waktunya untuk Balance Metric
            if (this.ball.getData('plankTouchTime') === null) {
                this.ball.setData('plankTouchTime', this.time.now);
            }

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
            ballData.vx = (ballData.vx - 2 * dotProduct * normalWorldX) * this.physicsConstants.friction;
            ballData.vy = (ballData.vy - 2 * dotProduct * normalWorldY) * this.physicsConstants.bounce;
        }
    }

    checkCollisions() {
        if (!this.ball.getData('isActive') || this.isProcessingBall) return;
        const { height } = this.sys.game.config;
        const bucketData = this.bucket.data.values;
        const bucketHitbox = {
            left: this.bucket.x - bucketData.width / 2 + 20,
            right: this.bucket.x + bucketData.width / 2 - 20,
            top: this.bucket.y - bucketData.height / 2,
            bottom: this.bucket.y
        };
        if (this.ball.x > bucketHitbox.left && this.ball.x < bucketHitbox.right &&
            this.ball.y > bucketHitbox.top && this.ball.y < bucketHitbox.bottom) {
            this.handleItemCollected();
            return;
        }
        if (this.ball.y - this.ball.getData('radius') > height) {
            this.handleItemDropped();
        }
    }

    handleItemCollected() {
        this.isProcessingBall = true;
        this.score += 100;
        this.itemsCollected += 1;
        
        // --- ANALYTICS: HITUNG METRIK ---
        const now = this.time.now;
        
        // 1. Reaction Time (Masuk Bucket - Waktu Spawn)
        const spawnTime = this.ball.getData('spawnTime');
        if (spawnTime) {
            this.analytics.reactionTimes.push(now - spawnTime);
        }

        // 2. Balance Time (Masuk Bucket - Waktu Sentuh Papan)
        const plankTouchTime = this.ball.getData('plankTouchTime');
        if (plankTouchTime) {
            this.analytics.balanceTimes.push(now - plankTouchTime);
        } else {
            // Kalau masuk tanpa sentuh papan (langsung jatuh ke bucket), balance time = 0
            this.analytics.balanceTimes.push(0);
        }

        this.scoreText.setText(`${this.itemsCollected}`);
        const progress = Math.min(this.itemsCollected / this.targetItems, 1);
        this.tweens.add({ targets: this.scoreBarFill, scaleY: progress * 0.8, duration: 300, ease: 'Power2' });

        const poofX = this.ball.x;
        const poofY = this.ball.y;
        this.ball.setData('isActive', false);
        this.ball.setVisible(false);
        
        const poof = this.add.image(poofX, poofY, "poof").setScale(0.1);
        this.tweens.add({
            targets: poof,
            props: {
                scale: { value: 1.25, duration: 400, ease: 'Back.out' },
                alpha: { value: 0, duration: 300, delay: 200 },
                angle: { value: Phaser.Math.Between(-45, 45), duration: 500 }
            },
            onComplete: () => { poof.destroy(); }
        });

        if (this.currentBarSide === 'left') { this.leftBar.setFrame(0); } 
        else { this.rightBar.setFrame(0); }

        if (this.itemsCollected >= this.targetItems) {
            this.time.delayedCall(1000, this.handleLevelComplete, [], this);
        } else {
            this.time.delayedCall(1000, () => {
                this.isProcessingBall = false;
                this.spawnBall();
            }, [], this);
        }
    }

    handleItemDropped() {
        this.isProcessingBall = true;
        
        // --- ANALYTICS: RECORD LOSS ---
        this.analytics.missedBalls++;
        this.itemsDropped++;

        const heartToRemove = this.livesGroup.pop(); 
        if (heartToRemove) { heartToRemove.destroy(); }
        this.currentLives -= 1;
        this.ball.setData('isActive', false);
        this.ball.setVisible(false);
        if (this.currentBarSide === 'left') { this.leftBar.setFrame(0); } 
        else { this.rightBar.setFrame(0); }
        if (this.currentLives <= 0) { this.endGame(); } 
        else {
            this.time.delayedCall(1000, () => {
                this.isProcessingBall = false;
                this.spawnBall();
            }, [], this);
        }
    }

    pauseGame() {
        if (this.gameOver) return;
        this.scene.pause(); 
        this.scene.launch('Pause', { gameSceneKey: this.scene.key }); 
    }

    // --- FUNGSI CALCULATE ANALYTICS ---
    calculateAnalytics() {
        const totalPlayTimeMs = this.time.now - this.analytics.gameStartTime;

        // 1. Fokus (Tangan terlihat / Total Frame)
        let skorFokus = 0;
        if (this.analytics.totalFrames > 0) {
            skorFokus = ((this.analytics.totalFrames - this.analytics.handLossFrames) / this.analytics.totalFrames) * 100;
        }

        // 2. Koordinasi (Akurasi)
        const totalInteraction = this.itemsCollected + this.itemsDropped;
        let skorKoordinasi = 0;
        if (totalInteraction > 0) {
            skorKoordinasi = (this.itemsCollected / totalInteraction) * 100;
        }

        // 3. Waktu Reaksi (Average)
        let avgReactionTime = 0;
        if (this.analytics.reactionTimes.length > 0) {
            const sumReaction = this.analytics.reactionTimes.reduce((a, b) => a + b, 0);
            avgReactionTime = sumReaction / this.analytics.reactionTimes.length;
        }

        // 4. Keseimbangan (Average Waktu di Papan)
        let avgBalanceTime = 0;
        if (this.analytics.balanceTimes.length > 0) {
            const sumBalance = this.analytics.balanceTimes.reduce((a, b) => a + b, 0);
            avgBalanceTime = sumBalance / this.analytics.balanceTimes.length;
        }

        const muridId = this.registry.get('currentMuridId') || "guest";

        return {
            id_profil: muridId,
            id_games_dashboard: 3,
            level: this.scene.key.toLowerCase(),
            finalScore: this.score,
            stars: this.currentLives,
            win: (this.currentLives > 0),
            totalPlayTimeSeconds: totalPlayTimeMs / 1000,
            metrics: {
                fokus: skorFokus.toFixed(1),
                koordinasi: skorKoordinasi.toFixed(1),
                waktuReaksi: null,
                keseimbangan: avgBalanceTime.toFixed(0)
            },
            rawHeatmap: this.analytics.heatmapData
        };
    }

    endGame() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.gameStarted = false;
        
        const report = this.calculateAnalytics();
        
        this.scene.launch('Result', { 
            score: this.score, 
            stars: 0, 
            levelCompleted: false, 
            levelKey: this.scene.key,
            analyticsReport: report 
        });
        this.shutdown();
    }

    handleLevelComplete() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.gameStarted = false;
        
        let stars = this.currentLives; 
        if (stars > 3) stars = 3;
        if (stars < 1) stars = 1; 

        // Generate Report
        const report = this.calculateAnalytics();

        this.scene.launch('Result', { 
            score: this.score, 
            stars: stars, 
            levelCompleted: true, 
            levelKey: this.scene.key,
            analyticsReport: report
        });
        this.shutdown();
    }

    shutdown() {
        this.cleanup();
    }

    cleanup() {
        if (this.mediapipe) {
            if (this.videoElement && this.videoElement.srcObject) {
                const tracks = this.videoElement.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                this.videoElement.srcObject = null;
            }
            try { this.mediapipe.destroy(); } catch(e){}
            this.mediapipe = null;
        }
        this.sound.stopAll();
        this.events.off('shutdown', this.shutdown, this);
    }
}