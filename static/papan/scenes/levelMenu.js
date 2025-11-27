import { API_BASE_URL } from '../../config.js'; 

export class LevelMenu extends Phaser.Scene {

    constructor() {
        super('LevelMenu');
    }

    /** * Setup Visual Awal (Hanya Gambar & Posisi) 
     * Logika interaksi dipindah ke create/setupLevelButton
     */
    editorCreate() {
        // backgrounds
        const backgrounds = this.add.image(0, 0, "backgrounds");
        backgrounds.scaleX = 1.5048;
        backgrounds.scaleY = 1.5048;
        backgrounds.setOrigin(0, 0);

        // levelbox
        const levelbox = this.add.image(976, 544, "levelbox");
        levelbox.scaleX = 1.509;
        levelbox.scaleY = 1.509;

        // --- LEVEL BUTTONS ---
        // Kita simpan ke 'this' tapi JANGAN setInteractive di sini dulu.
        // Biarkan logic API yang menentukan apakah bisa diklik atau tidak.
        
        this.level1Btn = this.add.image(752, 480, "level1btn");
        this.level1Btn.scaleX = 1.5; this.level1Btn.scaleY = 1.5;

        this.level2Btn = this.add.image(969, 480, "levelLockedbtn");
        this.level2Btn.scaleX = 1.5; this.level2Btn.scaleY = 1.5;

        this.level3Btn = this.add.image(1184, 480, "levelLockedbtn");
        this.level3Btn.scaleX = 1.5; this.level3Btn.scaleY = 1.5;

        // close_btn (Tombol keluar tetap aktif dari awal)
        const close_btn = this.add.image(1312, 224, "close-btn");
        close_btn.setInteractive();
        close_btn.scaleX = 0.5; close_btn.scaleY = 0.5;

        this.events.emit("scene-awake");

        // --- HOVER ANIMATION (Hanya untuk Close Button) ---
        // Tombol level diurus dinamis nanti
        const normalScaleClose = 0.5;
        const hoverScaleClose = 0.6;
        const tweenDuration = 100;

        close_btn.on('pointerover', () => {
            this.tweens.add({ targets: close_btn, scale: hoverScaleClose, duration: tweenDuration, ease: 'Power1' });
        });

        close_btn.on('pointerout', () => {
            this.tweens.add({ targets: close_btn, scale: normalScaleClose, duration: tweenDuration, ease: 'Power1' });
        });

        close_btn.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }

    /* START-USER-CODE */

    async create() {
        // 1. Buat Tampilan Visual
        this.editorCreate();

        // 2. Ambil ID Murid & Nama Game
        const idProfil = this.registry.get('currentMuridId');
        const NAMA_GAME_DB = "PAPAN SEIMBANG"; 

        // Default data (Level 1 Buka, Sisanya Kunci)
        const defaultProgress = {
            level1: { is_unlocked: true },
            level2: { is_unlocked: false }, 
            level3: { is_unlocked: false } 
        };

        // Jika Guest (Gak login), pakai default
        if (!idProfil) {
            console.log("Guest Mode: Menggunakan default unlock.");
            this.applyProgress(defaultProgress);
            return;
        }

        // 3. Fetch Data dari API
        try {
            const response = await fetch(`${API_BASE_URL}/v1/game/status?id_profil=${idProfil}&nama_game=${NAMA_GAME_DB}`);
            const result = await response.json();

            if (result.status === 'sukses') {
                console.log("Progress Loaded:", result.data.progress);
                this.applyProgress(result.data.progress);
            } else {
                console.warn("Gagal load progress, pakai default.");
                this.applyProgress(defaultProgress);
            }
        } catch (error) {
            console.error("Error Fetching Level Data:", error);
            this.applyProgress(defaultProgress);
        }
    }

    applyProgress(progress) {
        // Setup Level 1
        this.setupLevelButton(this.level1Btn, progress.level1, 1);
        
        // Setup Level 2
        this.setupLevelButton(this.level2Btn, progress.level2, 2);
        
        // Setup Level 3
        this.setupLevelButton(this.level3Btn, progress.level3, 3);
    }

    setupLevelButton(button, levelData, levelNumber) {
        // Reset listener lama (PENTING biar gak numpuk)
        button.off('pointerover');
        button.off('pointerout');
        button.off('pointerdown');

        const unlockedTexture = `level${levelNumber}btn`; 
        const lockedTexture = "levelLockedbtn";

        const normalScale = 1.5;
        const hoverScale = 1.7;
        const tweenDuration = 100;

        // Cek Status Unlock
        if (levelData && levelData.is_unlocked) {
            // --- UNLOCKED ---
            button.setTexture(unlockedTexture);
            button.setInteractive({ useHandCursor: true });
            button.clearTint(); 

            // Hover Animation
            button.on('pointerover', () => {
                this.tweens.add({ targets: button, scale: hoverScale, duration: tweenDuration, ease: 'Power1' });
                // if (this.registry.get('isSfxOn')) this.sound.play('sfxLevelButtonHover');
            });

            button.on('pointerout', () => {
                this.tweens.add({ targets: button, scale: normalScale, duration: tweenDuration, ease: 'Power1' });
            });

            // Click Action
            button.on('pointerdown', () => {
                // if (this.registry.get('isSfxOn')) this.sound.play('sfxLevelButtonClick');
                this.scene.start(`Level${levelNumber}`);
            });

        } else {
            // --- LOCKED ---
            button.setTexture(lockedTexture);
            // Tetap interactive tapi cuma visual (biar gak bisa diklik main)
            button.setInteractive();
            button.setScale(1.5); 
            button.setTint(0x888888); // Gelapkan sedikit biar kelihatan disable

            // Opsional: Bunyi Tetot kalau diklik
            button.on('pointerdown', () => {
               console.log("Level Terkunci");
            });
        }
    }

    /* END-USER-CODE */
}