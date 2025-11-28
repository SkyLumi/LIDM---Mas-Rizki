import { BaseGameScene } from './baseGameScene.js';

export class Level2 extends BaseGameScene {

    constructor() {
        super('Level2');
        
        // FIX TYPO
        this.isBucketMoving = false; 
        this.bucketSpeed = 3;  
        this.bucketDirection = 1;
    }

    createLevelLogic() {
        this.targetItems = 2; 
        this.spawnDelay = 3000;
        const { width, height } = this.sys.game.config;
        
        // FIX TYPO
        if (this.isBucketMoving) {
            this.bucket.setTexture("bucket_roda");
            this.bucket.setPosition(width / 2, height - 120);
        } else {
            this.bucket.setTexture("bucket");
            this.bucket.setPosition(width - 230, height - 150);
        }
    }

    updateLevelLogic(time, delta) {
        // Level 2 diam (sesuai request terakhir), biarkan kosong
    }
}