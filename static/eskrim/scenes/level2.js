import { BaseGameScene } from './baseGameScene.js';

export class Level2 extends BaseGameScene {
    constructor() {
        super('Level2')
    }

    create() {
        super.create();

        this.gameTimeRemaining = 80
        this.maxScore = 2000
        this.timerText.setText(this.formatTime(this.gameTimeRemaining));

        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true,
            paused: true
        })

        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.jatuhinItemAcak,
            callbackScope: this,
            loop: true,
            paused: true
        })
        
        this.showTutorialOverlay('tutorial_level2')
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

    jatuhinItemAcak() {
        const { width } = this.sys.game.config
        const targetX = Phaser.Math.Between(800, width - 800) 

        this.tweens.add({
            targets: this.dispenserArm, x: targetX, duration: 500,
            onComplete: () => {
                this.dispenserArm.play('dispenserArm_anim');
                this.dispenserArm.once('animationcomplete', () => {
                    
                    if (Phaser.Math.FloatBetween(0, 1) < 0.3) {
                        this.spawnBomb(targetX)
                    } else {
                        this.spawnIceCream(targetX)
                    }
                    this.dispenserArm.setFrame(0)
                });
            }
        });
    }

    spawnBomb(x) {
        const bomb = this.bombs.create(x, 150, 'bomb');
        bomb.setScale(0.7)
        bomb.body.setAllowGravity(false);
        bomb.setVelocityY(300);
    }

    handleCatchBomb(cone, bomb) {
        const catchX = bomb.x;
        const catchY = bomb.y;

        this.score -= 100
        this.analytics.tcr_success--

        let scorePopup = this.add.text(catchX, catchY, '-100', {
            fontFamily: 'lilita-one',
            fontSize: '48px',
            fill: '#E82D2F',
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

        bomb.destroy();
        this.loseLife();
    }

    triggerCrack(x, y) {
        const crack = this.add.sprite(x, y, 'bomb').setScale(0.7);
        
        crack.play('bomb_pulse_anim');

        crack.on('animationcomplete', () => {
            crack.destroy();
        });
    }
}