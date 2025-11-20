
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

		// group_427320172
		this.add.image(1056, 624, "Group 427320172");

		// homeButton
		this.add.image(736, 688, "HomeButton");

		// nextLevel
		this.add.image(896, 688, "nextLevel");

		// retryButton
		this.add.image(1056, 688, "RetryButton");

		// kERJA_BAGUS____2_
		this.add.image(880, 544, "KERJA BAGUS ! (2)");

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
