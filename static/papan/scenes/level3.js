import { BaseGameScene } from './baseGameScene.js';

export class Level3 extends BaseGameScene {

    constructor() {
        super('Level3');
        this.isBucketMoving = true;  
        this.bucketSpeed = 3;        
        this.bucketDirection = 1;    
    }

    createLevelLogic() {
        this.targetItems = 4; 
        this.spawnDelay = 2000; 

        const { width, height } = this.sys.game.config;
        this.bucket.setTexture("bucket_roda");
        this.bucket.setPosition(width / 2, height - 120);
    }

    updateBarTurn() {
        this.itemIndex1 = Phaser.Math.Between(1, 5);
        this.itemIndex2 = Phaser.Math.Between(1, 5);
        this.leftBar.setFrame(this.itemIndex1);
        this.rightBar.setFrame(this.itemIndex2);
        this.currentBarSide = 'both'; 
    }

    updateDispenser(time) {
        const data = this.dispenser.data.values;
        if (this.isDispensingSequence) return; 

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
                        this.startDispenseSequence();
                    } else {
                        data.state = 'IDLE';
                    }
                }
                break;
        }
    }

    startDispenseSequence() {
        this.isDispensingSequence = true;
        this.updateBarTurn();

        this.dispenser.play('dispense_anim');
        this.dispenser.once('animationcomplete', () => {
            this.setupBall(this.ball, this.itemMap[this.itemIndex1]);
            this.dispenser.setFrame(0);

            this.time.delayedCall(500, () => {
                this.dispenser.play('dispense_anim');
                this.dispenser.once('animationcomplete', () => {
                    this.setupBall(this.ball2, this.itemMap[this.itemIndex2]);
                    this.dispenser.setFrame(0);
                    this.dispenser.data.values.state = 'IDLE';
                    this.dispenser.data.values.idleMoveTimer = this.time.now;
                    this.isDispensingSequence = false; 
                });
            });
        });
    }

    updateBallPhysics() {
        const activeBalls = [this.ball, this.ball2];
        activeBalls.forEach(b => {
            if (!b.getData('isActive')) return;
            const ballData = b.data.values;
            const plankData = this.plank.data.values;

            ballData.vy += this.physicsConstants.gravity;
            b.x += ballData.vx;
            b.y += ballData.vy;
            b.rotation += ballData.vx * 0.05;

            const dx = b.x - this.plank.x;
            const dy = b.y - this.plank.y;
            const rotatedX = dx * Math.cos(-this.plank.rotation) - dy * Math.sin(-this.plank.rotation);
            const rotatedY = dx * Math.sin(-this.plank.rotation) + dy * Math.cos(-this.plank.rotation);
            const closestX = Phaser.Math.Clamp(rotatedX, -plankData.halfWidth, plankData.halfWidth);
            const closestY = Phaser.Math.Clamp(rotatedY, -plankData.halfHeight, plankData.halfHeight);
            const distance = Math.sqrt((rotatedX - closestX) ** 2 + (rotatedY - closestY) ** 2);

            if (distance < ballData.radius) {
                // --- ANALYTICS (Override Level 3) ---
                if (b.getData('plankTouchTime') === null) {
                    b.setData('plankTouchTime', this.time.now);
                }

                const penetration = ballData.radius - distance;
                const collisionVectorX = rotatedX - closestX;
                const collisionVectorY = rotatedY - closestY;
                const vectorLength = Math.sqrt(collisionVectorX ** 2 + collisionVectorY ** 2) || 1;
                let normalLocalX = collisionVectorX / vectorLength;
                let normalLocalY = collisionVectorY / vectorLength;
                const normalWorldX = normalLocalX * Math.cos(this.plank.rotation) - normalLocalY * Math.sin(this.plank.rotation);
                const normalWorldY = normalLocalX * Math.sin(this.plank.rotation) + normalLocalY * Math.cos(this.plank.rotation);
                b.x += normalWorldX * penetration;
                b.y += normalWorldY * penetration;
                const dotProduct = ballData.vx * normalWorldX + ballData.vy * normalWorldY;
                ballData.vx = (ballData.vx - 2 * dotProduct * normalWorldX) * this.physicsConstants.friction;
                ballData.vy = (ballData.vy - 2 * dotProduct * normalWorldY) * this.physicsConstants.bounce;
            }
        });
    }

    checkCollisions() {
        const activeBalls = [{b: this.ball, id: 1}, {b: this.ball2, id: 2}];
        const { height } = this.sys.game.config;
        const bucketData = this.bucket.data.values;
        const bucketHitbox = {
            left: this.bucket.x - bucketData.width / 2 + 20,
            right: this.bucket.x + bucketData.width / 2 - 20,
            top: this.bucket.y - bucketData.height / 2,
            bottom: this.bucket.y
        };

        activeBalls.forEach(item => {
            const b = item.b;
            const id = item.id; 
            if (!b.getData('isActive')) return; 

            if (b.x > bucketHitbox.left && b.x < bucketHitbox.right &&
                b.y > bucketHitbox.top && b.y < bucketHitbox.bottom) {
                
                b.setData('isActive', false);
                b.setVisible(false);
                this.handleItemCollectedLevel3(b, id); // Kirim Objek Bola, bukan koordinat
                return;
            }

            if (b.y - b.getData('radius') > height) {
                b.setData('isActive', false);
                b.setVisible(false);
                this.handleItemDroppedLevel3(id);
            }
        });
    }

    handleItemCollectedLevel3(ballObj, ballId) {
        this.score += 100;
        this.itemsCollected += 1;
        this.scoreText.setText(`${this.itemsCollected}`);
        
        // --- ANALYTICS LEVEL 3 ---
        const now = this.time.now;
        const spawnTime = ballObj.getData('spawnTime');
        if (spawnTime) this.analytics.reactionTimes.push(now - spawnTime);

        const plankTouchTime = ballObj.getData('plankTouchTime');
        if (plankTouchTime) this.analytics.balanceTimes.push(now - plankTouchTime);
        else this.analytics.balanceTimes.push(0);

        // UI Logic
        if (ballId === 1) this.leftBar.setFrame(0);
        else if (ballId === 2) this.rightBar.setFrame(0);

        const progress = Math.min(this.itemsCollected / this.targetItems, 1);
        this.tweens.add({ targets: this.scoreBarFill, scaleY: progress * 0.8, duration: 300, ease: 'Power2' });

        const poof = this.add.image(ballObj.x, ballObj.y, "poof").setScale(0.1);
        this.tweens.add({
            targets: poof,
            props: {
                scale: { value: 1.25, duration: 400, ease: 'Back.out' },
                alpha: { value: 0, duration: 300, delay: 200 },
                angle: { value: Phaser.Math.Between(-45, 45), duration: 500 }
            },
            onComplete: () => { poof.destroy(); }
        });

        if (this.itemsCollected >= this.targetItems) {
            this.time.delayedCall(1000, this.handleLevelComplete, [], this);
        } else {
            this.checkRespawn();
        }
    }

    handleItemDroppedLevel3(ballId) {
        // --- ANALYTICS LEVEL 3 ---
        this.analytics.missedBalls++;
        this.itemsDropped++;

        if (ballId === 1) this.leftBar.setFrame(0);
        else if (ballId === 2) this.rightBar.setFrame(0);

        const heartToRemove = this.livesGroup.pop(); 
        if (heartToRemove) { heartToRemove.destroy(); }
        this.currentLives -= 1;

        if (this.currentLives <= 0) {
            this.endGame();
        } else {
            this.checkRespawn();
        }
    }

    checkRespawn() {
        if (!this.ball.getData('isActive') && !this.ball2.getData('isActive')) {
            this.time.delayedCall(1000, () => {
                this.isProcessingBall = false;
                this.spawnBall();
            }, [], this);
        }
    }

    updateLevelLogic(time, delta) {
        if (!this.isBucketMoving) return;
        const { width } = this.sys.game.config;
        const bucketHalfWidth = this.bucket.getData('width') / 2;
        this.bucket.x += this.bucketSpeed * this.bucketDirection;
        if (this.bucket.x > width - bucketHalfWidth - 50) {
            this.bucket.x = width - bucketHalfWidth - 50;
            this.bucketDirection = -1; 
        } else if (this.bucket.x < bucketHalfWidth + 50) {
            this.bucket.x = bucketHalfWidth + 50;
            this.bucketDirection = 1; 
        }
    }
}