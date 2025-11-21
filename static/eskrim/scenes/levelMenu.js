import { API_BASE_URL } from '../../config.js';

export class LevelMenu extends Phaser.Scene {

    constructor() {
        super('LevelMenu')
    }

    async create() {
        const { width, height } = this.sys.game.config
        let screenCenterX = width / 2
        let screenCenterY = height / 2

        // --- 1. BIKIN UI DULU (WAJIB) ---
        
        this.add.image(screenCenterX, screenCenterY, 'levelBG').setScale(0.77)
        this.add.image(screenCenterX, 0, 'levelbox').setScale(0.77).setOrigin(0.5, 0)

        const closeButton = this.add.image(screenCenterX + 320, screenCenterY - 230, 'closeButton')
            .setInteractive({ useHandCursor: true })

        let buttonContainer = this.add.container(screenCenterX, screenCenterY + 20)

        // PENTING: Pake 'this.' biar bisa diakses di fungsi lain
        // Default-nya kita bikin 'Locked' (gelap & gak bisa dipencet) dulu sampe API respon
        
        this.btnLevel1 = this.add.image(-200, 0, 'level1Btn')
            .setScale(0.8)
            .setTint(0x555555); // Gelap dulu

        this.btnLevel2 = this.add.image(0, 0, 'levelLockedBtn') // Gambar gembok
            .setScale(0.8)
            .setTint(0x555555);

        this.btnLevel3 = this.add.image(200, 0, 'levelLockedBtn') // Gambar gembok
            .setScale(0.8)
            .setTint(0x555555);
            
        buttonContainer.add([this.btnLevel1, this.btnLevel2, this.btnLevel3])

        // --- 2. PASANG EVENT LISTENER (HOVER & CLICK) ---
        // Kita pasang logic kliknya sekarang, tapi karena belum setInteractive(), gabakal jalan dulu.
        // Nanti 'setupLevelButton' yang bakal ngaktifin (setInteractive).

        this.setupButtonEvents(this.btnLevel1, 'Level1');
        this.setupButtonEvents(this.btnLevel2, 'Level2');
        this.setupButtonEvents(this.btnLevel3, 'Level3');

        closeButton.on('pointerdown', () => {
            this.scene.start('MainMenu')
        });

        // --- 3. TEMBAK API (BUAT BUKA KUNCI) ---
        
        const idProfil = this.registry.get('currentMuridId'); 
        const namaGame = "TANGKAP RASA"; // Sesuaikan DB

        if (!idProfil) {
            console.error("ID Profil hilang, balik ke MainMenu");
            this.scene.start('MainMenu');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/v1/game/status?id_profil=${idProfil}&nama_game=${namaGame}`);
            const result = await response.json();

            if (result.status === 'sukses') {
                const progress = result.data.progress;

                // Update status tombol berdasarkan API
                // Sekarang 'this.btnLevel1' udah ADA (bukan undefined lagi)
                this.setupLevelButton(this.btnLevel1, progress.level1, 'level1Btn'); 
                this.setupLevelButton(this.btnLevel2, progress.level2, 'level2Btn'); // Ganti texture kalo kebuka
                this.setupLevelButton(this.btnLevel3, progress.level3, 'level3Btn'); 
                
                console.log("Data Murid:", result.data.murid);
            }
        } catch (err) {
            console.error("Gagal ambil progress:", err);
            this.btnLevel1.setInteractive({ useHandCursor: true }).clearTint();
        }
    }

    // Fungsi Update Visual Tombol
    setupLevelButton(button, levelData, unlockedTexture) {
        if (levelData && levelData.is_unlocked) {
            // Kalo KEBUKA:
            button.setTexture(unlockedTexture); // Ganti gambar gembok jadi angka
            button.setInteractive({ useHandCursor: true }); // Bisa dipencet
            button.clearTint(); // Warnanya terang

        } else {
            // Kalo KEKEY (Default):
            button.disableInteractive();
            button.setTint(0x555555); // Gelap
        }
    }

    // Fungsi Helper buat Hover & Click
    setupButtonEvents(button, targetScene) {
        // Hover Effect
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 0.9, // Hover scale
                duration: 100,
                ease: 'Power1'
            });
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 0.8, // Normal scale
                duration: 100,
                ease: 'Power1'
            });
        });

        // Click Logic
        button.on('pointerdown', () => {
            this.scene.start(targetScene);
        });
    }
}