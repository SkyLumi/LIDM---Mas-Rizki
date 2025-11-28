export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' }); // active: true biar langsung nyala
    }

    create() {        
        const { width, height } = this.sys.game.config;

        // --- BIKIN TOMBOL FULLSCREEN ---
        this.fullscreenBtn = this.add.image(width - 50, height - 50, 'fullscreen_icon')
            .setOrigin(0.5)
            .setDepth(9999) // PENTING: Angka gede biar selalu di atas scene lain
            .setScrollFactor(0) // Biar gak ikut gerak kalo kameranya jalan
            .setInteractive({ useHandCursor: true })
            .setScale(0.15);

        // --- LOGIKA KLIK ---
        this.fullscreenBtn.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.closeFullscreen();
            } else {
                this.openFullscreen();
            }
        });

        // --- EFEK HOVER ---
        this.fullscreenBtn.on('pointerover', () => this.fullscreenBtn.setAlpha(0.7));
        this.fullscreenBtn.on('pointerout', () => this.fullscreenBtn.setAlpha(1));

        // --- UBAH ICON OTOMATIS ---
        this.scale.on('enterfullscreen', () => {
            this.fullscreenBtn.setTexture('minimize_icon');
        });

        this.scale.on('leavefullscreen', () => {
            this.fullscreenBtn.setTexture('fullscreen_icon');
        });
    }

    openFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    closeFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}