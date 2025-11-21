import MediaPipeManager from "./mediapipeManager.js";

export class BaseGameScene extends Phaser.Scene {
    
    constructor(key) {
        super(key);
        
        this.targetConePos = { x: 0, y: 0 };
        this.smoothingFactor = 0.3;

        this.hands = null;

        this.cone = null;
        this.iceCreams = null;
        this.scoreText = null;
        this.spawnTimer = null;
        this.camera = null;
        this.iceCreamFill = null;
        this.maxScore = 100;
        this.barFullHeight = 0;
        this.scoop = 0
        this.gameReady = false;
    }

    create() {
        const { width, height } = this.sys.game.config;

        this.sound.stopByKey('bgm-main-loop');

        if (!this.gameBGM) {
            this.gameBGM = this.sound.add('bgm-gameplay', { 
                loop: true, 
                volume: 1
            });
            this.gameBGM.play();
        }

        //                      Analytics                          //
        this.analytics = {
            gameStartTime: this.time.now, // Catet waktu mulai
            totalFrames: 0,   // Total frame game
            handLossFrames: 0, // Total frame waktu tangan hilang
            heatmapData: [],   // nampung data heatmap (x, y, t)
            tcr_success: 0,    // (Koordinasi) Es krim ketangkep
            tcr_total: 0,      // (Koordinasi) Total es krim muncul
            reactionTimes: []  // (Waktu Reaksi) Buat game Gelembung
        };
        //                      ----------                          //

        let screenCenterX = width / 2;
        let screenCenterY = height / 2;

        this.videoElement = document.getElementById('webcam')
        this.mediapipe = new MediaPipeManager(this.videoElement, this.onMediaPipeResults.bind(this));

        // this.gameTimeRemaining = 80;
        this.score = 0;
        this.scoop = 0;
        this.maxLives = 3;
        this.currentLives = this.maxLives;
        this.lifeIcons = [];
        this.gameOver = false;

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
        if (!this.anims.exists('iceCreamFall_anim')) {
            this.anims.create({
                key: 'iceCreamFall_anim',
                frames: this.anims.generateFrameNumbers('iceCreamFall', { start: 0, end: -1 }),
                frameRate: 10,
                repeat: -1
            })
        }

        if (!this.anims.exists('dispenserArm_anim')) {
            this.anims.create({
                key: 'dispenserArm_anim',
                frames: this.anims.generateFrameNumbers('dispenserArm', { start: 0, end: -1 }),
                frameRate: 10,
                repeat: 0
            })
        }

        if (!this.anims.exists('tilt_left_anim')) {
            this.anims.create({
                key: 'tilt_left_anim',
                frames: this.anims.generateFrameNumbers('arm_tilt_left'),
                frameRate: 10,
                repeat: 0 // (PENTING: 0 = Main sekali)
            });
        }

        if (!this.anims.exists('tilt_right_anim')) {
            this.anims.create({
                key: 'tilt_right_anim',
                frames: this.anims.generateFrameNumbers('arm_tilt_right'),
                frameRate: 10,
                repeat: 0 // (PENTING: 0 = Main sekali)
            });
        }

        if (!this.anims.exists('dispenserArm_animLeft')) {
            this.anims.create({
                key: 'dispenserArm_animLeft',
                frames: this.anims.generateFrameNumbers('drop_left', { start: 0, end: -1 }),
                frameRate: 10,
                repeat: 0
            })
        }

        if (!this.anims.exists('dispenserArm_animRight')) {
            this.anims.create({
                key: 'dispenserArm_animRight',
                frames: this.anims.generateFrameNumbers('drop_right', { start: 0, end: -1 }),
                frameRate: 10,
                repeat: 0
            })
        }

        if (!this.anims.exists('splat_anim')) {
            this.anims.create({
                key: 'splat_anim',
                frames: this.anims.generateFrameNumbers('iceCreamSplat', { start: 0, end: -1 }),
                frameRate: 16,
                repeat: 0
            })
        }

        if (!this.anims.exists('bomb_pulse_anim')) {
            this.anims.create({
                key: 'bomb_pulse_anim',
                frames: this.anims.generateFrameNumbers('bomb', { start: 3, end: -1 }),
                frameRate: 30,
                repeat: 0
            });
        }

        // --- Detek collider Es krim dengan cone nya
        this.physics.add.overlap(this.cone, this.iceCreams, this.handleCatch, null, this);

        this.targetConePos = { x: width / 2, y: height - 100 }

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

        this.iceCreamFill = this.add.image(width - 110, screenCenterY + 58, 'scoreFillBar')
            .setScale(0.75)
        this.barFullHeight = this.iceCreamFill.height;
        this.iceCreamFill.setCrop(0, this.barFullHeight, this.iceCreamFill.width, 0);

        this.add.image(width - 140, screenCenterY + 100, 'scorePanel')
            .setScale(1.2)

        const pauseButton = this.add.image(140, height + -140, 'pauseBtn')
            .setScale(0.8)
            .setInteractive()

        this.scoreText = this.add.text(width - 115, 360, '00', {
            fontFamily: 'lilita-one',
            fontSize: '72px',
            fill: '#045170' 
        }).setOrigin(0.5)

        this.timerText = this.add.text(width - 265, 108, this.formatTime(this.gameTimeRemaining), {
            fontFamily: 'lilita-one',
            fontSize: '72px',
            fill: '#ffffff' 
        })

        pauseButton.on('pointerover', () => {
            this.tweens.add({
                targets: pauseButton,
                scale: 0.9,
                duration: 100,
                ease: 'Power1'
            });
        });

        pauseButton.on('pointerout', () => {
            this.tweens.add({
                targets: pauseButton,
                scale: 0.8,
                duration: 100,
                ease: 'Power1'
            });
        });

        pauseButton.on('pointerdown', () => {
            this.scene.pause(this.scene.key); 
            this.gameBGM.pause()
            this.scene.launch('Pause', { gameSceneKey: this.scene.key });
        });

        this.events.on('resume', () => {
            this.gameBGM.resume()
        });

        this.events.once('shutdown', this.shutdown, this)

    }

    update(time, delta) {
        if (this.gameOver) return;

        let newX = Phaser.Math.Linear(this.cone.x, this.targetConePos.x, this.smoothingFactor);
        let newY = Phaser.Math.Linear(this.cone.y, this.targetConePos.y, this.smoothingFactor);
        this.cone.setPosition(newX, newY);

        const floorY = this.sys.game.config.height - 65;

        this.iceCreams.children.each(cream => {
            if (cream.y > floorY) {
                this.triggerSplat(cream.x, floorY);
                cream.destroy();
            }
        });
    }
    
    spawnIceCream(x, velocityX = 0) {        
        const y = 150;

        this.analytics.tcr_total++
        const cream = this.iceCreams.create(x, y, 'iceCreamFall').setScale(0.9)
        cream.body.setAllowGravity(false)
        cream.setVelocityY(300) 
        cream.setVelocityX(velocityX);
        cream.play('iceCreamFall_anim')
        cream.spawnTime = this.time.now;
    }

    handleCatch(cone, cream) {
        const catchX = cream.x;
        const catchY = cream.y;

        if (cream.spawnTime) {
            const reactionTime = this.time.now - cream.spawnTime;
            this.analytics.reactionTimes.push(reactionTime);
            console.log(`Waktu Reaksi: ${reactionTime}ms`);
        }

        this.analytics.tcr_success++
        this.scoop += 1
        this.score += 100
        this.scoreText.setText(this.scoop)
        cream.destroy()
        this.updateFillBar();

        let scorePopup = this.add.text(catchX, catchY, '+100', {
            fontFamily: 'lilita-one',
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: scorePopup,
            y: catchY - 100,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            onComplete: () => {
                scorePopup.destroy(); // Hapus teksnya setelah selesai
            }
        });

        if (this.score >= this.maxScore) {
            this.endGame(true)
        }
    }

    showTutorialOverlay(tutorialImageKey) {
        const { width, height } = this.sys.game.config;

        // 1. Bikin background item (biar nge-blur)
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(190); // (Di bawah countdown, tapi di atas game)

        // 2. Bikin gambar tutorial
        const tutorialImg = this.add.image(width / 2, height / 2 - 100, tutorialImageKey)
            .setOrigin(0.5)
            .setDepth(190)
            .setScale(0.8); // (Sesuaikan scale)

        // 3. Bikin Tombol "Mulai"
        const mulaiButton = this.add.image(width / 2, height / 2 + 300, 'mulai_button')
            .setOrigin(0.5)
            .setDepth(190)
            .setInteractive() // <-- Bikin bisa diklik
            .setScale(0.8); // (Sesuaikan scale)

        // 4. Bikin "hover" effect (Opsional tapi keren)
        mulaiButton.on('pointerover', () => mulaiButton.setScale(0.85));
        mulaiButton.on('pointerout', () => mulaiButton.setScale(0.8));

        // 5. Pas Tombol "Mulai" DIKLIK:
        mulaiButton.on('pointerdown', () => {
            // (Hancurin semua overlay)
            bg.destroy();
            tutorialImg.destroy();
            mulaiButton.destroy();
            
            // (Panggil Countdown)
            this.startCountdown(); 
        });
    }
    
    startCountdown() {
        const { width, height } = this.sys.game.config;

        const countdownImage = this.add.image(width / 2, height / 2, 'countdown_3')
            .setOrigin(0.5)
            .setDepth(200) // Depth 200 (paling atas)
            .setScale(0); // Mulai dari 0 (buat animasi)

        // Bikin animasi "pop-up"
        this.tweens.add({
            targets: countdownImage,
            scale: 1, // Jadi 100%
            duration: 300,
            ease: 'Back.easeOut' // Efek "pop"
        });

        let count = 3;

        const countdownEvent = this.time.addEvent({
            delay: 1000,
            repeat: 3,
            callback: () => {
                count--;

                countdownImage.setScale(0);
                if (count === 2) {
                    countdownImage.setTexture('countdown_2');
                } else if (count === 1) {
                    countdownImage.setTexture('countdown_1');
                } else if (count === 0) {
                    countdownImage.setTexture('countdown_go');
                } else {
                    // Selesai (setelah "GO!")
                    countdownImage.destroy();
                    
                    // --- 1. GAME SIAP ---
                    this.gameReady = true; 
                    
                    // --- 2. JAM ANALYTICS DIMULAI ---
                    this.analytics.gameStartTime = this.time.now;
                    
                    // --- 3. TIMER GAME DIMULAI ---
                    this.gameTimer.paused = false;
                    this.spawnTimer.paused = false;
                    if (this.spawnTimer2) { // (Buat Level 3)
                        this.spawnTimer2.paused = false;
                    }
                    
                    countdownEvent.remove(); // Hapus event-nya
                }

                this.tweens.add({
                    targets: countdownImage,
                    scale: 1,
                    duration: 300,
                    ease: 'Back.easeOut'
                });
            }
        });
    }

    endGame(isWin) {
        if (this.gameOver) return
        this.gameOver = true
        this.gameTimer.paused = true
        this.spawnTimer.paused = true

        if (this.score < 600) {
            isWin = false;
        } else {
            isWin = true;
        }
        
        // --- 1. Hitung Semua Skor Analisis ---
        const totalPlayTimeMs = this.time.now - this.analytics.gameStartTime;
        
        // Rumus Skor Fokus (UI: 90.6 Points)
        const skorFokus = ((this.analytics.totalFrames - this.analytics.handLossFrames) / this.analytics.totalFrames) * 100;

        // Rumus Skor Koordinasi (UI: 55.4 Points)
        const skorKoordinasi = (this.analytics.tcr_total > 0) ? (this.analytics.tcr_success / this.analytics.tcr_total) * 100 : 0;

        let avgReactionTime = 0;
        if (this.analytics.reactionTimes.length > 0) {
            const totalReaction = this.analytics.reactionTimes.reduce((a, b) => a + b, 0);
            avgReactionTime = totalReaction / this.analytics.reactionTimes.length;
        }

        // --- 2. Buat "Bungkusan" Data ---
        const analyticsReport = {
            id_profil: this.registry.get('currentMuridId'),
            id_games_dashboard: 2,
            level: this.scene.key,
            finalScore: this.score,
            win: isWin,
            totalPlayTimeSeconds: totalPlayTimeMs / 1000,
            metrics: {
                fokus: skorFokus.toFixed(1),
                koordinasi: skorKoordinasi.toFixed(1),
                waktuReaksi: avgReactionTime.toFixed(0)
            },
            rawHeatmap: this.analytics.heatmapData // Data mentah (x,y,t)
        };

            this.mediapipe.destroy()
            this.scene.launch('Result', { score: this.score, scoop: this.scoop, gameSceneKey: this.scene.key, report: analyticsReport, win: isWin})
        }
    
    onMediaPipeResults(results) {

        if (!this.gameReady) return;

        //              Analytics               //
        this.analytics.totalFrames++;
        //              ---------               //

        if (!this.sys || !this.sys.game) return;
        const { width, height } = this.sys.game.config;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length === 2) {

            const wrist1 = results.multiHandLandmarks[0][0];
            const wrist2 = results.multiHandLandmarks[1][0];
            this.targetConePos.x = ((wrist1.x + wrist2.x) / 2) * width;
            this.targetConePos.y = (Math.min(wrist1.y, wrist2.y) * height) - 100;
        }
        else {
            this.targetConePos.x = width / 2;
            this.targetConePos.y = height + 300;
            this.analytics.handLossFrames++;
        }

        if (results.multiHandLandmarks) {
            const timestamp = this.time.now - this.analytics.gameStartTime;

            results.multiHandLandmarks.forEach((landmarks, index) => {
                const handX = landmarks[9].x; 
                const handY = landmarks[9].y;
                const handLabel = results.multiHandedness[index].label;
            
                this.analytics.heatmapData.push({ 
                    x: handX, 
                    y: handY, 
                    t: timestamp,
                    hand: handLabel
                })
            })
        }
    }

    loseLife() {
        if (this.currentLives > 0) {
            this.currentLives--;
            const lostIcon = this.lifeIcons[this.currentLives];
            lostIcon.setVisible(false)
        }

        if (this.currentLives === 0) {
            this.endGame(false)
        }
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

    triggerSplat(x, y) {
        const splat = this.add.sprite(x, y, 'iceCreamSplat').setScale(0.9);        
        splat.play('splat_anim');
        splat.on('animationcomplete', () => {
            splat.destroy();
        });
    }

    updateFillBar() {
        const scorePercent = Math.min(this.score / this.maxScore, 1);
        const newCropHeight = this.barFullHeight * scorePercent;
        const newCropY = this.barFullHeight - newCropHeight;
        this.iceCreamFill.setCrop(
            0,
            newCropY,
            this.iceCreamFill.width,
            newCropHeight
        );
    }

    updateTimer() {
        this.gameTimeRemaining--;
        this.timerText.setText(this.formatTime(this.gameTimeRemaining));

        if (this.gameTimeRemaining <= 0) {
            this.gameTimer.remove(); 
            this.endGame(true); 
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const partInSeconds = seconds % 60;
        const partInSecondsFormatted = partInSeconds.toString().padStart(2, '0');
        return `${minutes}:${partInSecondsFormatted}`;
    }

    shutdown() {
        console.log('clearing mediapipe')
        this.mediapipe.destroy()
        if (this.gameBGM) {
            this.gameBGM.stop();
            this.gameBGM = null;
        }

    }
}