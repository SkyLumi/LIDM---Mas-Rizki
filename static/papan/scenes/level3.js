import { BaseGameScene } from './baseGameScene.js';

export class Level3 extends BaseGameScene {
    constructor() { super('Level3') }
    create() {
        const { width } = this.sys.game.config
        let screenCenterX = width / 2
        super.create()
        this.gameTimeRemaining = 80
        this.maxScore = 200
        this.timerText.setText(this.formatTime(this.gameTimeRemaining));

        this.dispenserArm2 = this.add.sprite(screenCenterX + 100, -100, 'dispenserArm')
            .setOrigin(0.08, 0)
            .setScale(0.2)
            .setDepth(10);
        
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        })
        
        this.spawnTimer = this.time.addEvent({
            delay: 3000,
            callback: this.jatuhinEsKrim,
            callbackScope: this,
            loop: true
        });
        this.spawnTimer2 = this.time.addEvent({
            delay: 4000,
            callback: this.jatuhinItemAcak,
            callbackScope: this,
            loop: true
        });
        
        this.bombs = this.physics.add.group()
        this.physics.add.overlap(this.cone, this.bombs, this.handleCatchBomb, null, this)
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

    spawnBomb(x) {
        const bomb = this.bombs.create(x, 150, 'bomb');
        bomb.body.setAllowGravity(false);
        bomb.setVelocityY(600); 
    }

    handleCatchBomb(cone, bomb) {
        bomb.destroy()
        this.loseLife()
    }
}