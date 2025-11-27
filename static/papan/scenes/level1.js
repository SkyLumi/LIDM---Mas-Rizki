import { BaseGameScene } from './baseGameScene.js';

export class Level1 extends BaseGameScene {

    constructor() {
        super('Level1');
        
        this.isbucketMoving = false; 
        this.bucketSpeed = 3;  
        this.basketDirection = 1;
    }

    createLevelLogic() {
        this.targetItems = 1; 
        this.spawnDelay = 3000;
        const { width, height } = this.sys.game.config;
        
        if (this.isBasketMoving) {

            this.bucket.setTexture("bucket_roda");
            this.bucket.setPosition(width / 2, height - 120);
        } else {
            this.bucket.setTexture("bucket");
            this.bucket.setPosition(width - 230, height - 150);
        }
    }

    updateLevelLogic(time, delta) {
    }
}