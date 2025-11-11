import { BaseGameScene } from './baseGameScene.js';

export class Level2 extends BaseGameScene {
    constructor() {
        super('Level2')
    }

    create() {
        super.create();

        this.gameTimeRemaining = 80
        this.maxScore = 100
        this.timerText.setText(this.formatTime(this.gameTimeRemaining));

        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        })

        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.jatuhinItemAcak,
            callbackScope: this,
            loop: true
        })
        
        this.bombs = this.physics.add.group()
        this.physics.add.overlap(this.cone, this.bombs, this.handleCatchBomb, null, this)
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
        bomb.body.setAllowGravity(false);
        bomb.setVelocityY(600);
    }

    handleCatchBomb(cone, bomb) {
        bomb.destroy();
        this.loseLife();
    }
}