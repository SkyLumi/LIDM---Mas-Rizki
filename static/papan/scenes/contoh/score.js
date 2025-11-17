
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class score extends Phaser.Scene {

	constructor() {
		super("score");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// result_0star
		this.add.image(960, 352, "result-0star");

		// next_stage
		const next_stage = this.add.image(1184, 656, "next_stage");
		next_stage.setInteractive(new Phaser.Geom.Rectangle(0, 0, 152, 108), Phaser.Geom.Rectangle.Contains);

		// replay
		const replay = this.add.image(976, 656, "replay");
		replay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 150, 109), Phaser.Geom.Rectangle.Contains);

		// home
		const home = this.add.image(768, 656, "home");
		home.setInteractive(new Phaser.Geom.Rectangle(0, 0, 152, 108), Phaser.Geom.Rectangle.Contains);

		// kerja_Bagus__
		this.add.image(992, 384, "Kerja Bagus !");

		// score
		this.add.image(880, 512, "Score");

		// _750
		this.add.image(1120, 512, "750");

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
