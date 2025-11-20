
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class home extends Phaser.Scene {

	constructor() {
		super("home");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// home_bg
		const home_bg = this.add.image(0, 0, "home_bg");
		home_bg.setOrigin(0, 0);

		// judul_kartu
		this.add.image(966, 470, "judul_kartu");

		// keluar_
		const keluar_ = this.add.image(1216, 752, "keluar_");
		keluar_.setInteractive(new Phaser.Geom.Rectangle(0, 0, 231, 102), Phaser.Geom.Rectangle.Contains);

		keluar_.on('pointerover', () => {
			this.tweens.add({
				targets: keluar_,
				scale: 1.05,
				duration: 100,
				ease: 'Power1'
			})
		})

		keluar_.on('pointerout',() => {
			this.tweens.add({
				targets: keluar_,
				scale: 1.0,
				duration: 100,
				ease: 'Power1'
			})
		})

		keluar_.on('pointerdown', () => {
			window.location.href = 'https://cloudsuptest.framer.website/dashboard';
		})

		// play_
		const play_ = this.add.image(704, 752, "play_");
		play_.setInteractive(new Phaser.Geom.Rectangle(0, 0, 231, 102), Phaser.Geom.Rectangle.Contains);

		play_.on('pointerover', () => {
			this.tweens.add({
				targets: play_,
				scale: 1.05,
				duration: 100,
				ease: 'Power1'
			})
		})

		play_.on('pointerout',() => {
			this.tweens.add({
				targets: play_,
				scale: 1.0,
				duration: 100,
				ease: 'Power1'
			})
		})

		play_.on('pointerdown', () => {
			this.scene.start('level')
		})

		// pengaturan_
		const pengaturan_ = this.add.image(960, 752, "pengaturan_");
		pengaturan_.setInteractive(new Phaser.Geom.Rectangle(0, 0, 233, 102), Phaser.Geom.Rectangle.Contains);

		pengaturan_.on('pointerover', () => {
			this.tweens.add({
				targets: pengaturan_,
				scale: 1.05,
				duration: 100,
				ease: 'Power1'
			})
		})

		pengaturan_.on('pointerout',() => {
			this.tweens.add({
				targets: pengaturan_,
				scale: 1.0,
				duration: 100,
				ease: 'Power1'
			})
		})

		pengaturan_.on('pointerdown', () => {
			this.openSettingPanel();
		})

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {
		this.editorCreate();

		if (this.registry.get('isSfxOn') === undefined) {
         this.registry.set('isSfxOn', true);
         this.registry.set('isMusicOn', true);
      }
	}

	openSettingPanel() {
      const { width, height } = this.scale; 
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Buat Container
      const settingContainer = this.add.container(0, 0);
      settingContainer.setDepth(100); 

      // 2. Overlay Redup
      const overlay = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.7);
      overlay.setInteractive();
      
      overlay.on('pointerdown', () => {
         settingContainer.destroy();
      });
      
      settingContainer.add(overlay);

      // 3. Panel Background
      // Skala langsung diset di sini dan tidak akan berubah
      const panel = this.add.image(centerX + 260, centerY, "settingPanel")
         .setScale(1.45); 
      settingContainer.add(panel);

      const toggleX = centerX + 250; 
      const sfxY = centerY - 115;     
      const musicY = centerY + 70;  

      // --- Tombol Efek (SFX) ---
      const isSfxOn = this.registry.get('isSfxOn');
      const sfxBtn = this.add.image(toggleX, sfxY, isSfxOn ? "toggleOn" : "toggleOff")
         .setScale(0.75);
      sfxBtn.setInteractive();
      
      sfxBtn.on('pointerdown', () => {
         const newState = !this.registry.get('isSfxOn');
         this.registry.set('isSfxOn', newState);
         sfxBtn.setTexture(newState ? "toggleOn" : "toggleOff");
      });
      settingContainer.add(sfxBtn);

      // --- Tombol Musik ---
      const isMusicOn = this.registry.get('isMusicOn');
      const musicBtn = this.add.image(toggleX, musicY, isMusicOn ? "toggleOn" : "toggleOff")
         .setScale(0.75); // Skala tetap (disamakan dengan sfxBtn)
      musicBtn.setInteractive();

      musicBtn.on('pointerdown', () => {
         const newState = !this.registry.get('isMusicOn');
         this.registry.set('isMusicOn', newState);
         musicBtn.setTexture(newState ? "toggleOn" : "toggleOff");
         this.sound.mute = !newState; 
      });
      settingContainer.add(musicBtn);

      // BAGIAN ANIMASI TWEEN SUDAH DIHAPUS
   }

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
