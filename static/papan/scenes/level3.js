// scenes/Level3.js
import { BaseGameScene } from './baseGameScene.js';

export class Level3 extends BaseGameScene {

    constructor() {
        super('Level3');
        this.moveSpeed = 2; // Kecepatan gerak basket
        this.moveRange = 200; // Jarak gerak (pixel)
        this.initialY = 0;
    }

    /** NGISI FUNGSI KOSONG: Setup awal */
    createLevelLogic() {
        // Simpen posisi Y awal basketnya
        this.initialY = this.basket.y;
    }

    /** NGISI FUNGSI KOSONG: Gerakin Basket (Atas-Bawah) */
    updateLevelLogic(time, delta) {
        // Gerak Atas-Bawah pake "time" (Sin wave)
        const movement = Math.sin(time * 0.001 * this.moveSpeed) * this.moveRange;
        this.basket.y = this.initialY + movement;
    }
}