// scenes/Level2.js
import { BaseGameScene } from './baseGameScene.js';

export class Level2 extends BaseGameScene {

    constructor() {
        super('Level2');
        this.moveSpeed = 3; // Kecepatan gerak basket
        this.moveRange = 300; // Jarak gerak (pixel)
        this.initialX = 0;
    }

    /** NGISI FUNGSI KOSONG: Setup awal */
    createLevelLogic() {
        // Simpen posisi X awal basketnya
        this.initialX = this.basket.x;
    }

    /** NGISI FUNGSI KOSONG: Gerakin Basket (Kanan-Kiri) */
    updateLevelLogic(time, delta) {
        // Gerak Kanan-Kiri pake "time" (Sin wave)
        const movement = Math.sin(time * 0.001 * this.moveSpeed) * this.moveRange;
        this.basket.x = this.initialX + movement;
    }
}