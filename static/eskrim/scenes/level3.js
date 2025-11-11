import { BaseGameScene } from './baseGameScene.js';

export class Level3 extends BaseGameScene {
    constructor() { super('Level3') }
    create() {
        const { width } = this.sys.game.config
        let screenCenterX = width / 2
        super.create()
        this.currentArmState = 'none'
        this.gameTimeRemaining = 80
        this.maxScore = 2000
        this.timerText.setText(this.formatTime(this.gameTimeRemaining));

        this.dispenserArm2 = this.add.sprite(screenCenterX + 100, -100, 'dispenserArm')
            .setOrigin(0.08, 0)
            .setScale(0.2)
            .setDepth(10);
        
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true,
            paused: true
        })
        
        this.spawnTimer = this.time.addEvent({
            delay: 1500,
            callback: this.masterSpawner,
            callbackScope: this,
            loop: true,
            paused: true
        });
        
        this.showTutorialOverlay('tutorial_level3')
        this.bombs = this.physics.add.group()
        this.physics.add.overlap(this.cone, this.bombs, this.handleCatchBomb, null, this)
    }

    update(time, delta) {
        super.update(time, delta)
        if (this.gameOver) return
        const floorY = this.sys.game.config.height - 65
        this.bombs.getChildren().forEach(bomb => {
            if (bomb.y > floorY) {
                this.triggerCrack(bomb.x, floorY)
                bomb.destroy()
            } 
        });
    }

    masterSpawner() {
        if (Phaser.Math.Between(0, 1) === 0) {
            this.jatuhinAcakMiring(); // Dispenser 1 (Miring)
        } else {
            this.jatuhinItemAcak(); // Dispenser 2 (Acak/Bom)
        }
    }

    jatuhinItemAcak() {
        const { width } = this.sys.game.config
        const targetX = Phaser.Math.Between(800, width - 800) 

        this.tweens.add({
            targets: this.dispenserArm2,
            x: targetX, duration: 500,
            onComplete: () => {
                this.dispenserArm2.play('dispenserArm_anim')
                this.dispenserArm2.once('animationcomplete', () => {
                    
                    if (Phaser.Math.FloatBetween(0, 1) < 0.3) {
                        this.spawnBomb(targetX)
                    } else {
                        this.spawnIceCream(targetX)
                    }
                    this.dispenserArm2.setFrame(0);
                });
            }
        });
    }

    jatuhinAcakMiring() {
        const { width } = this.sys.game.config;
        const targetX = Phaser.Math.Between(800, width - 800); 

        // 1. Tentukan arah miring BARU
        const newTiltDirection = Phaser.Math.RND.pick(['left', 'right', 'none']);

        // 2. Gerakin arm-nya (X-position)
        this.tweens.add({
            targets: this.dispenserArm,
            x: targetX,
            duration: 500,
            ease: 'Power1',
        
            onComplete: () => {

                // 3. Bikin fungsi "Jatohin" (biar rapi)
                const doTheDrop = (dropAnimKey, velocityX) => {
                    this.dispenserArm.play(dropAnimKey);
                    this.dispenserArm.once('animationcomplete', () => {
                        this.spawnIceCream(targetX, velocityX);
                        this.dispenserArm.setFrame(0)
                        // (Kita 'update ingetan' kita)
                        this.currentArmState = newTiltDirection; 
                    });
                };

                // 4. --- INI LOGIKA INTINYA ---
                // Cek "ingetan" kita
                if (this.currentArmState === newTiltDirection) {
                    // --- A. UDAH DI POSISI ---
                    // (Skip animasi miring, langsung 'doTheDrop')
                    if (newTiltDirection === 'left') {
                        doTheDrop('dispenserArm_animLeft', -150);
                    } else if (newTiltDirection === 'right') {
                        doTheDrop('dispenserArm_animRight', 150);
                    } else { // 'none'
                        doTheDrop('dispenserArm_anim', 0);
                    }
                
                } else {
                    // --- B. BELUM DI POSISI ---
                    // (Mainkan animasi miring DULU, BARU 'doTheDrop')
                    
                    if (newTiltDirection === 'left') {
                        this.dispenserArm.play('tilt_left_anim');
                        this.dispenserArm.once('animationcomplete', () => doTheDrop('dispenserArm_animLeft', -150));
                    
                    } else if (newTiltDirection === 'right') {
                        this.dispenserArm.play('tilt_right_anim');
                        this.dispenserArm.once('animationcomplete', () => doTheDrop('dispenserArm_animRight', 150));

                    } else { // 'none'
                        // (PENTING: Abang harus bikin animasi "kembali ke tengah"
                        // Kalo gak ada, Abang bisa 'setFrame(0)' aja di sini)
                        this.dispenserArm.setFrame(0); // <-- Misal, langsung reset
                        doTheDrop('dispenserArm_anim', 0);
                    }
                }
            }
        });
    }

    spawnBomb(x) {
        const bomb = this.bombs.create(x, 150, 'bomb');
        bomb.body.setAllowGravity(false);
        bomb.setVelocityY(300);
        bomb.setScale(0.7)
    }

    handleCatchBomb(cone, bomb) {
        bomb.destroy()
        this.loseLife()
    }

    triggerCrack(x, y) {
        const crack = this.add.sprite(x, y, 'bomb').setScale(0.7);
        
        crack.play('bomb_pulse_anim');

        crack.on('animationcomplete', () => {
            crack.destroy();
        });
    }
}