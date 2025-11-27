import { BaseGameScene } from './baseGameScene.js';

export class Level1 extends BaseGameScene {

    constructor() {
        super('Level1');
    }

    /** SETUP AWAL KHUSUS LEVEL 1 */
    createLevelLogic() {
        // Konfigurasi Level 1
        this.targetItems = 3;  // Butuh 3 item untuk menang penuh
        this.currentLives = 3; // Reset nyawa
        
        // Posisi Keranjang Statis untuk Level 1
        // (Pastikan posisi ini mudah dijangkau)
        const { width, height } = this.sys.game.config;
        this.basket.setPosition(width - 200, height - 120);
    }

    /** UPDATE LOOP KHUSUS LEVEL 1 */
    updateLevelLogic(time, delta) {
        // Level 1: Keranjang TIDAK BERGERAK.
        // Jadi fungsi ini dibiarkan kosong.
    }
}