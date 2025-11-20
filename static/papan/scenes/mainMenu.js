export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu')
    }

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
                //              Hover Animation               //

        const normalScale = 1.4320753177975822;
        const hoverScale = 1.6320753177975822;
        const tweenDuration = 100;

        tombolPlay.on('pointerover', () => {
            this.tweens.add({
                targets: tombolPlay,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        tombolPlay.on('pointerout', () => {
            this.tweens.add({
                targets: tombolPlay,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        tombolPengaturan.on('pointerover', () => {
            this.tweens.add({
                targets: tombolPengaturan,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        tombolPengaturan.on('pointerout', () => {
            this.tweens.add({
                targets: tombolPengaturan,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        tombolKeluar.on('pointerover', () => {
            this.tweens.add({
                targets: tombolKeluar,
                scale: hoverScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        tombolKeluar.on('pointerout', () => {
            this.tweens.add({
                targets: tombolKeluar,
                scale: normalScale,
                duration: tweenDuration,
                ease: 'Power1'
            });
        });

        //              Click Logic                // 
        tombolPlay.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        tombolPengaturan.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })

        tombolKeluar.on('pointerdown', () => {
            this.scene.start('LevelMenu')
        })
	}

	/* START-USER-CODE */

	// Write more your code here

	create() {

		this.editorCreate();

	}
}