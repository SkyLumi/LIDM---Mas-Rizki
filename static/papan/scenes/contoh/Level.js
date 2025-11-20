
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {

	constructor() {
		super("Level");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// backgrounds
		const backgrounds = this.add.image(0, 0, "backgrounds");
		backgrounds.scaleX = 1.5048153631225618;
		backgrounds.scaleY = 1.5048153631225618;
		backgrounds.setOrigin(0, 0);

		// titlebox
		const titlebox = this.add.image(1040, 448, "titlebox");
		titlebox.scaleX = 1.4984553496180204;
		titlebox.scaleY = 1.4984553496180204;

		// tombolPengaturan
		const tombolPengaturan = this.add.image(976, 672, "tombolPengaturan");
		tombolPengaturan.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 48), Phaser.Geom.Rectangle.Contains);
		tombolPengaturan.scaleX = 1.4320753177975822;
		tombolPengaturan.scaleY = 1.4320753177975822;

		// tombolKeluar
		const tombolKeluar = this.add.image(1296, 672, "tombolKeluar");
		tombolKeluar.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 48), Phaser.Geom.Rectangle.Contains);
		tombolKeluar.scaleX = 1.4320753177975822;
		tombolKeluar.scaleY = 1.4320753177975822;

		// tombolPlay
		const tombolPlay = this.add.image(656, 672, "tombolPlay");
		tombolPlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 48), Phaser.Geom.Rectangle.Contains);
		tombolPlay.scaleX = 1.4320753177975822;
		tombolPlay.scaleY = 1.4320753177975822;

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write more your code here

	create() {

		this.editorCreate();

	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
