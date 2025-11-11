import { BaseGameScene } from './baseGameScene.js'

export class Level1 extends BaseGameScene {
    constructor() {
        super('Level1')
    }

    create() {
        super.create() 

        this.gameTimeRemaining = 80;
        this.maxScore = 100;
        this.timerText.setText(this.formatTime(this.gameTimeRemaining));

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
    }
}