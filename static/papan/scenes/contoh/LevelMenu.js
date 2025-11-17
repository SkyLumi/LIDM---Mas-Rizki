
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class LevelMenu extends Phaser.Scene {

	constructor() {
		super("LevelMenu");

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

		// levelbox
		const levelbox = this.add.image(976, 544, "levelbox");
		levelbox.scaleX = 1.5098727295860335;
		levelbox.scaleY = 1.5098727295860335;

		// level1btn
		const level1Btn = this.add.image(752, 480, "level1btn");
		level1Btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 124, 80), Phaser.Geom.Rectangle.Contains);
		level1Btn.scaleX = 1.5;
		level1Btn.scaleY = 1.5;

		// levelLockedbtn
		const level2Btn = this.add.image(969, 480, "levelLockedbtn");
		level2Btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 124, 80), Phaser.Geom.Rectangle.Contains);
		level2Btn.scaleX = 1.5;
		level2Btn.scaleY = 1.5;

		// levelLockedbtn_1
		const level3Btn = this.add.image(1184, 480, "levelLockedbtn");
		level3Btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 124, 80), Phaser.Geom.Rectangle.Contains);
		level3Btn.scaleX = 1.5;
		level3Btn.scaleY = 1.5;

		// close_btn
		const close_btn = this.add.image(1312, 224, "close-btn");
		close_btn.scaleX = 0.5;
		close_btn.scaleY = 0.5;

		this.events.emit("scene-awake");

		//              Hover Animation             //

        const normalScale = 1;
        const hoverScale = 1.1;
        const tweenDuration = 100;

        const normalScaleLevel = 0.8;
        const hoverScaleLevel = 0.9;

        close_btn.on('pointerover', () => {
            this.tweens.add({
                targets: close_btn,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        close_btn.on('pointerout', () => {
            this.tweens.add({
                targets: close_btn,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level1Btn.on('pointerover', () => {
            this.tweens.add({
                targets: level1Btn,
                scale: hoverScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level1Btn.on('pointerout', () => {
            this.tweens.add({
                targets: level1Btn,
                scale: normalScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level2Btn.on('pointerover', () => {
            this.tweens.add({
                targets: level2Btn,
                scale: hoverScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level2Btn.on('pointerout', () => {
            this.tweens.add({
                targets: level2Btn,
                scale: normalScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level3Btn.on('pointerover', () => {
            this.tweens.add({
                targets: level3Btn,
                scale: hoverScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        level3Btn.on('pointerout', () => {
            this.tweens.add({
                targets: level3Btn,
                scale: normalScaleLevel,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        //              Click Logic               //
        close_btn.on('pointerdown', () => {
            this.scene.start('MainMenu')
        })

        level1Btn.on('pointerdown', () => {
            this.scene.start('Level1')
        })

        level2Btn.on('pointerdown', () => {
            this.scene.start('Level2')
        })

        level3Btn.on('pointerdown', () => {
            this.scene.start('Level3')
        })
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
