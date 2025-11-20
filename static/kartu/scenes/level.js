/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

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
         this.scene.start('home') // (Harusnya 'home' atau 'menu'?)
      })

      // lEVEL_
      this.add.image(969, 193, "LEVEL_");

      // level_Button_1
      // Kita simpan di 'this' biar bisa diakses nanti
      this.level_Button_1 = this.add.image(672, 448, "Level Button 1");
      this.level_Button_1.setInteractive(new Phaser.Geom.Rectangle(0, 0, 216, 210), Phaser.Geom.Rectangle.Contains);

      this.level_Button_1.on('pointerover', () => {
         this.tweens.add({
            targets: this.level_Button_1,
            scale: 1.05,
            duration: 100,
            ease: 'Power1'
         })
      })

      this.level_Button_1.on('pointerout',() => {
         this.tweens.add({
            targets: this.level_Button_1,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })

      // Ganti 'pointerdown' untuk panggil fungsi startLevel
      this.level_Button_1.on('pointerdown', () => {
         this.startLevel(1); // Kirim angka 1
      })

      // level_Button_2
      this.level_Button_2 = this.add.image(960, 448, "Level Button 2");
      this.level_Button_2.setInteractive(new Phaser.Geom.Rectangle(0, 0, 218, 210), Phaser.Geom.Rectangle.Contains);

      this.level_Button_2.on('pointerover', () => {
         this.tweens.add({
            targets: this.level_Button_2,
            scale: 1.05,
            duration: 100,
            ease: 'Power1'
         })
      })

      this.level_Button_2.on('pointerout',() => {
         this.tweens.add({
            targets: this.level_Button_2,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })

      // Ganti 'pointerdown' untuk panggil fungsi startLevel
      this.level_Button_2.on('pointerdown', () => {
         this.startLevel(2); // Kirim angka 2
      })

      // level_Button_3
      this.level_Button_3 = this.add.image(1248, 448, "Level Button 3");
      this.level_Button_3.setInteractive(new Phaser.Geom.Rectangle(0, 0, 216, 210), Phaser.Geom.Rectangle.Contains);

      this.level_Button_3.on('pointerover', () => {
         this.tweens.add({
            targets: this.level_Button_3,
            scale: 1.05,
            duration: 100,
            ease: 'Power1'
         })
      })

      this.level_Button_3.on('pointerout',() => {
         this.tweens.add({
            targets: this.level_Button_3,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })

      // Ganti 'pointerdown' untuk panggil fungsi startLevel
      this.level_Button_3.on('pointerdown', () => {
         this.startLevel(3); // Kirim angka 3
      })

      this.events.emit("scene-awake");
   }

   /* START-USER-CODE */

   create() {
      this.editorCreate();
      // Panggil fungsi untuk cek level yang terkunci
      this.checkLevelLocks();
   }

   checkLevelLocks() {
      // Ambil data bintang dari REGISTRY
      const starsLevel1 = this.registry.get('level_1_stars') || 0;
      const starsLevel2 = this.registry.get('level_2_stars') || 0;

      // console.log(`Stars L1: ${starsLevel1}, Stars L2: ${starsLevel2}`); // Opsional buat nge-cek

      // --- Cek Level 2 ---
      // Level 1 harus dapat minimal 1 bintang
      if (starsLevel1 <= 0) {
         // Kunci Level 2
         this.level_Button_2.setTexture("level2BtnLocked");
         this.level_Button_2.disableInteractive();
         this.level_Button_2.off('pointerover'); // Matikan hover
         this.level_Button_2.off('pointerout'); // Matikan hover
      }

      // --- Cek Level 3 ---
      // Level 2 harus dapat minimal 1 bintang
      if (starsLevel2 <= 0) {
         // Kunci Level 3
         this.level_Button_3.setTexture("level3BtnLocked"); // Ganti gambar
         this.level_Button_3.disableInteractive(); // Matikan tombol
         this.level_Button_3.off('pointerover');
         this.level_Button_3.off('pointerout');
      }
   }

   startLevel(levelNumber) {
      // Fungsi ini dipanggil pas tombol level diklik
      
      // Cek dulu apa level itu terkunci? (Ambil dari REGISTRY)
      if (levelNumber === 2) {
         const starsLevel1 = this.registry.get('level_1_stars') || 0;
         if (starsLevel1 <= 0) return; // Jangan lakukan apa-apa
      }
      if (levelNumber === 3) {
         const starsLevel2 = this.registry.get('level_2_stars') || 0;
         if (starsLevel2 <= 0) return; // Jangan lakukan apa-apa
      }

      // Jika level 1, atau level lain tapi udah kebuka, baru start scene
      // console.log(`Starting game, level: ${levelNumber}`);
      this.scene.start('game', { level: levelNumber });
   }

   /* END-USER-CODE */
}