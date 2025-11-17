
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Tutor1 extends Phaser.Scene {

	constructor() {
		super("Tutor");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// level_1
		this.add.image(964, 489, "Level 1");

		// mulai_button
		const mulai_button = this.add.image(959, 917, "mulai_button");
		mulai_button.setInteractive(new Phaser.Geom.Rectangle(0, 0, 317, 76), Phaser.Geom.Rectangle.Contains);
		mulai_button.scaleX = 1.5;
		mulai_button.scaleY = 1.5;

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
