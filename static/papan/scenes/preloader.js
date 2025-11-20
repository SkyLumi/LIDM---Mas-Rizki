export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader')
    }

    /** @returns {void} */
    editorPreload() {

        this.load.image("1", "static/assets/papan_img/1.png");
        this.load.image("2", "static/assets/papan_img/2.png");
        this.load.image("3", "static/assets/papan_img/3.png");
        this.load.image("750", "static/assets/papan_img/750.png");
        this.load.image("apel", "static/assets/papan_img/apel.png");
        this.load.image("backgrounds", "static/assets/papan_img/backgrounds.png");
        this.load.image("ban", "static/assets/papan_img/ban.png");
        this.load.image("bebek", "static/assets/papan_img/bebek.png");
        this.load.image("bola", "static/assets/papan_img/bola.png");
        this.load.image("bucket", "static/assets/papan_img/bucket.png");
        this.load.image("bucket_roda", "static/assets/papan_img/bucket_roda.png");
        this.load.image("close-btn", "static/assets/papan_img/close-btn.png");
        this.load.image("continue-btn", "static/assets/papan_img/continue-btn.png");
        this.load.spritesheet("dropPointandGear", "static/assets/papan_img/dropPointandGear.png", {
            frameWidth: 435, frameHeight: 272
        });
        this.load.image("home", "static/assets/papan_img/home.png");
        this.load.image("home-btn", "static/assets/papan_img/home-btn.png");
        this.load.image("jeruk", "static/assets/papan_img/jeruk.png");
        this.load.image("kaca", "static/assets/papan_img/kaca.png");
        this.load.image("Kerja Bagus !", "static/assets/papan_img/Kerja Bagus !.png");
        this.load.image("leftbar", "static/assets/papan_img/leftbar.png");
        this.load.image("Level 1", "static/assets/papan_img/Level 1.png");
        this.load.image("Level 2", "static/assets/papan_img/Level 2.png");
        this.load.image("Level 3", "static/assets/papan_img/Level 3.png");
        this.load.image("level1btn", "static/assets/papan_img/level1btn.png");
        this.load.image("levelbox", "static/assets/papan_img/levelbox.png");
        this.load.image("levelLockedbtn", "static/assets/papan_img/levelLockedbtn.png");
        this.load.image("mulai_button", "static/assets/papan_img/mulai_button.png");
        this.load.image("mute-active-button", "static/assets/papan_img/mute-active-button.png");
        this.load.image("mute-nonactive-button", "static/assets/papan_img/mute-nonactive-button.png");
        this.load.image("next_stage", "static/assets/papan_img/next_stage.png");
        this.load.image("papan", "static/assets/papan_img/papan.png");
        this.load.image("paus", "static/assets/papan_img/paus.png");
        this.load.image("pause-btn", "static/assets/papan_img/pause-btn.png");
        this.load.image("poof", "static/assets/papan_img/poof.png");
        this.load.image("replay", "static/assets/papan_img/replay.png");
        this.load.image("result-0star", "static/assets/papan_img/result-0star.png");
        this.load.image("result-1star", "static/assets/papan_img/result-1star.png");
        this.load.image("result-2star", "static/assets/papan_img/result-2star.png");
        this.load.image("result-3star", "static/assets/papan_img/result-3star.png");
        this.load.image("retry-btn", "static/assets/papan_img/retry-btn.png");
        this.load.image("rightbar", "static/assets/papan_img/rightbar.png");
        this.load.image("Score", "static/assets/papan_img/Score.png");
        this.load.image("setting-menu", "static/assets/papan_img/setting-menu.png");
        this.load.image("sound-active-button", "static/assets/papan_img/sound-active-button.png");
        this.load.image("sound-nonactive-button", "static/assets/papan_img/sound-nonactive-button.png");
        this.load.image("titlebox", "static/assets/papan_img/titlebox.png");
        this.load.image("tombolKeluar", "static/assets/papan_img/tombolKeluar.png");
        this.load.image("tombolPengaturan", "static/assets/papan_img/tombolPengaturan.png");
        this.load.image("tombolPlay", "static/assets/papan_img/tombolPlay.png");
        this.load.image("topbar", "static/assets/papan_img/topbar.png");
        this.load.image("topbarr", "static/assets/papan_img/topbarr.png");
        this.load.image("tutorial", "static/assets/papan_img/tutorial.png");
        this.load.image("volley", "static/assets/papan_img/volley.png");

        // --- ASET KARTU (KARTU_IMG) ---
        // this.load.image("Card Back 1", "static/assets/kartu_img/Card Back 1.png");
        // this.load.image("Frame 1261153332", "static/assets/kartu_img/Frame 1261153332.png");
        // this.load.image("game_bg", "static/assets/kartu_img/game_bg.png");
        // this.load.image("Group 427320172", "static/assets/kartu_img/Group 427320172.png");
        // this.load.image("health_", "static/assets/kartu_img/health_.png");
        // this.load.image("home_bg", "static/assets/kartu_img/home_bg.jpg");
        // this.load.image("HomeButton", "static/assets/kartu_img/HomeButton.png");
        // this.load.image("judul_kartu", "static/assets/kartu_img/judul_kartu.png");
        // this.load.image("keluar_", "static/assets/kartu_img/keluar_.png");
        // this.load.image("kembali_", "static/assets/kartu_img/kembali_.png");
        // this.load.image("KERJA BAGUS ! (2)", "static/assets/kartu_img/KERJA BAGUS ! (2).png");
        // this.load.image("Level Button 1", "static/assets/kartu_img/Level Button 1.png");
        // this.load.image("Level Button 2", "static/assets/kartu_img/Level Button 2.png");
        // this.load.image("Level Button 3", "static/assets/kartu_img/Level Button 3.png");
        // this.load.image("LEVEL_", "static/assets/kartu_img/LEVEL_.png");
        // this.load.image("level_bg", "static/assets/kartu_img/level_bg.jpg");
        // this.load.image("nextLevel", "static/assets/kartu_img/nextLevel.png");
        // this.load.image("pause_", "static/assets/kartu_img/pause_.png");
        // this.load.image("pengaturan_", "static/assets/kartu_img/pengaturan_.png");
        // this.load.image("play_", "static/assets/kartu_img/play_.png");
        // this.load.image("RetryButton", "static/assets/kartu_img/RetryButton.png");
        // this.load.image("skor_", "static/assets/kartu_img/skor_.png");
        // this.load.image("time_", "static/assets/kartu_img/time_.png");
        // this.load.image("tutor_", "static/assets/kartu_img/tutor_.png");
    }

    /** @returns {void} */
    editorCreate() {

        // progressBar
        const progressBar = this.add.rectangle(553, 361, 256, 20);
        progressBar.setOrigin(0, 0);
        progressBar.isFilled = true;
        progressBar.fillColor = 14737632;

        // progressBarBg
        const progressBarBg = this.add.rectangle(553.0120849609375, 361, 256, 20);
        progressBarBg.setOrigin(0, 0);
        progressBarBg.fillColor = 14737632;
        progressBarBg.isStroked = true;

        // loadingText
        const loadingText = this.add.text(552.0120849609375, 329, "", {});
        loadingText.text = "Loading...";
        loadingText.setStyle({ "color": "#e0e0e0", "fontFamily": "arial", "fontSize": "20px" });

        this.progressBar = progressBar;

        this.events.emit("scene-awake");
    }

    /** @type {Phaser.GameObjects.Rectangle} */
    progressBar;

    /* START-USER-CODE */

    // Write your code here

    preload() {

        this.editorCreate();

        this.editorPreload();

        const width = this.progressBar.width;

        this.load.on("progress", (progress) => {

            this.progressBar.width = progress * width;
        });
    }

    create() {

        this.scene.start("MainMenu");
    }
}