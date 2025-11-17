
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Game extends Phaser.Scene {

	constructor() {
		super("Game");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// topbar
		const topbar = this.add.image(944, 48, "topbar");
		topbar.scaleX = 0.9307162315399644;
		topbar.scaleY = 0.9307162315399644;

		// bucket
		this.add.image(1696, 928, "bucket");

		// pause_btn
		const pause_btn = this.add.image(112, 976, "pause-btn");
		pause_btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 146), Phaser.Geom.Rectangle.Contains);
		pause_btn.scaleX = 0.6719934527233458;
		pause_btn.scaleY = 0.6719934527233458;

		// rightbar
		const rightbar = this.add.image(1856, 400, "rightbar");
		rightbar.scaleX = 0.7447442226207368;
		rightbar.scaleY = 0.7447442226207368;

		// dropPointandGear
		const dropPointandGear = this.add.image(1040, 128, "dropPointandGear");
		dropPointandGear.scaleX = 0.6721624796985333;
		dropPointandGear.scaleY = 0.6721624796985333;

		// papan
		const papan = this.add.image(992, 672, "papan");
		papan.scaleX = 0.7322827127247428;
		papan.scaleY = 0.7322827127247428;

		// leftbar
		const leftbar = this.add.image(-752, 0, "leftbar");
		leftbar.scaleX = 0.7383161582212082;
		leftbar.scaleY = 0.7383161582212082;
		leftbar.setOrigin(0, 0);

		// poof
		this.add.image(1318, 569, "poof");

		// poof_1
		this.add.image(1392, 624, "poof");

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
