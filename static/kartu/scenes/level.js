import { API_BASE_URL } from '../../config.js';

export default class level extends Phaser.Scene {

   constructor() {
      super("level");

      /* START-USER-CTR-CODE */
      // Write your code here.
      /* END-USER-CTR-CODE */
   }

   /** @returns {void} */
   editorCreate() {

      // level_bg
      const level_bg = this.add.image(0, 0, "level_bg");
      level_bg.setOrigin(0, 0);

      // kembali_
      const kembali_ = this.add.image(230, 144, "kembali_");
      kembali_.setInteractive(new Phaser.Geom.Rectangle(0, 0, 255, 113), Phaser.Geom.Rectangle.Contains);

      kembali_.on('pointerover', () => {
         this.tweens.add({
            targets: kembali_,
            scale: 1.05,
            duration: 100,
            ease: 'Power1'
         })
      })

      kembali_.on('pointerout',() => {
         this.tweens.add({
            targets: kembali_,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })

      kembali_.on('pointerdown', () => {
         this.scene.start('home') 
      })

      // lEVEL_
      this.add.image(969, 193, "LEVEL_");

      // --- TOMBOL LEVEL 1 ---
      this.level_Button_1 = this.add.image(672, 448, "Level Button 1");

      this.level_Button_2 = this.add.image(960, 448, "level2BtnLocked");
      
      this.level_Button_3 = this.add.image(1248, 448, "level3BtnLocked");

      this.events.emit("scene-awake");
   }

   /* START-USER-CODE */

   async create() {
      this.editorCreate();

      // 1. Setup default state (Level 1 buka, sisanya kunci visual)
      this.setupLevelButton(this.level_Button_1, { is_unlocked: true }, 1, "Level Button 1", "Level Button 1");
      this.setupLevelButton(this.level_Button_2, { is_unlocked: false }, 2, "Level Button 2", "level2BtnLocked");
      this.setupLevelButton(this.level_Button_3, { is_unlocked: false }, 3, "Level Button 3", "level3BtnLocked");

      // 2. Ambil Data API
      await this.fetchLevelProgress();
   }

   async fetchLevelProgress() {
      const idProfil = this.registry.get('currentMuridId');
      const namaGame = "KARTU"; // Nama game di database

      if (!idProfil) {
         console.warn("ID Profil tidak ditemukan, menggunakan progress default.");
         return;
      }

      try {
         const response = await fetch(`${API_BASE_URL}/v1/game/status?id_profil=${idProfil}&nama_game=${namaGame}`);
         const result = await response.json();

         if (result.status === 'sukses') {
            const progress = result.data.progress;
            
            console.log("Progress Kartu:", progress);

            // Update UI berdasarkan API
            this.setupLevelButton(this.level_Button_1, progress.level1, 1, "Level Button 1", "Level Button 1");
            this.setupLevelButton(this.level_Button_2, progress.level2, 2, "Level Button 2", "level2BtnLocked");
            this.setupLevelButton(this.level_Button_3, progress.level3, 3, "Level Button 3", "level3BtnLocked");
         }
      } catch (error) {
         console.error("Gagal mengambil data level:", error);
      }
   }

   setupLevelButton(button, levelData, levelNumber, unlockedTexture, lockedTexture) {
      // Hapus listener lama biar gak numpuk
      button.off('pointerover');
      button.off('pointerout');
      button.off('pointerdown');

      if (levelData && levelData.is_unlocked) {
         // --- KONDISI TERBUKA ---
         button.setTexture(unlockedTexture);
         button.setInteractive({ useHandCursor: true });
         button.clearTint();

         // Efek Hover
         button.on('pointerover', () => {
            this.tweens.add({
               targets: button,
               scale: 1.05,
               duration: 100,
               ease: 'Power1'
            });
         });

         button.on('pointerout', () => {
            this.tweens.add({
               targets: button,
               scale: 1.0,
               duration: 100,
               ease: 'Power1'
            });
         });

         // Klik untuk main
         button.on('pointerdown', () => {
            this.startLevel(levelNumber);
         });

      } else {
         // --- KONDISI TERKUNCI ---
         button.setTexture(lockedTexture);
         button.disableInteractive();
         button.setScale(1.0);
      }
   }

   startLevel(levelNumber) {
      console.log(`Starting Kartu Level: ${levelNumber}`);
      this.scene.start('game', { level: levelNumber });
   }

   /* END-USER-CODE */
}