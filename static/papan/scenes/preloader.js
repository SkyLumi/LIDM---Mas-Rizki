export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader')
    }

    /** @returns {void} */
    editorPreload() {
        const basePathFont = 'static/assets/font'
        const basePathAudio = 'static/assets/audio'

        this.load.font('LilitaOne', `${basePathFont}/LilitaOne-Regular.ttf`)
        this.load.font('Raleway', `${basePathFont}/Raleway-Regular.ttf`)
        this.load.font('RalewayBold', `${basePathFont}/Raleway-Bold.ttf`)

        this.load.audio('bgMainMenu', `${basePathAudio}/papan-mainmenu.m4a`)
        this.load.audio('bgGameplay', `${basePathAudio}/papan-gameplay.m4a`)
        this.load.audio('bgWin', `${basePathAudio}/papan-win.m4a`)
        this.load.audio('sfxWin', `${basePathAudio}/papan-winsfx.m4a`)
    
        // Countdown
        this.load.image("1", "static/assets/papan_img/1.png");
        this.load.image("2", "static/assets/papan_img/2.png");
        this.load.image("3", "static/assets/papan_img/3.png");

        // Item Drop
        this.load.image("apel", "static/assets/papan_img/apel.png");
        this.load.image("bebek", "static/assets/papan_img/bebek.png");
        this.load.image("bola", "static/assets/papan_img/bola.png");
        this.load.image("jeruk", "static/assets/papan_img/jeruk.png");
        this.load.image("paus", "static/assets/papan_img/paus.png");
        this.load.image("volley", "static/assets/papan_img/volley.png");

        // Background and UI
        this.load.image("backgrounds", "static/assets/papan_img/backgrounds.png");
        this.load.image("ban", "static/assets/papan_img/ban.png");
        this.load.image("kaca", "static/assets/papan_img/kaca.png");
        this.load.image("levelbox", "static/assets/papan_img/levelbox.png");
        this.load.image("topbar", "static/assets/papan_img/topbar.png");
        this.load.image("topbarr", "static/assets/papan_img/topbarr.png");
        this.load.image("topbar", "static/assets/papan_img/topbar.png");
        this.load.image("topbarr", "static/assets/papan_img/topbarr.png");
        this.load.image("papan", "static/assets/papan_img/papan.png");
        this.load.image("pausePanel", "static/assets/papan_img/pausePanel.png");

        this.load.image("scoreBar", "static/assets/papan_img/scoreBar.png")
        this.load.image("scoreBarFill", "static/assets/papan_img/scoreBarFill.png")
        
        // Bucket Type
        this.load.image("bucket", "static/assets/papan_img/bucket.png");
        this.load.image("bucket_roda", "static/assets/papan_img/bucket_roda.png");

        // Buttons and Icons
        this.load.image("close-btn", "static/assets/papan_img/close-btn.png");
        this.load.image("continue-btn", "static/assets/papan_img/continue-btn.png");
        this.load.image("home-btn", "static/assets/papan_img/home-btn.png");
        this.load.image("level1btn", "static/assets/papan_img/level1btn.png");
        this.load.image("level2btn", "static/assets/papan_img/level2btn.png");
        this.load.image("level3btn", "static/assets/papan_img/level3btn.png");
        this.load.image("levelLockedbtn", "static/assets/papan_img/levelLockedbtn.png");
        this.load.image("mulai_button", "static/assets/papan_img/mulai_button.png");
        
        this.load.image("pause-btn", "static/assets/papan_img/pause-btn.png");
        this.load.image("retry-btn", "static/assets/papan_img/retry-btn.png");
        this.load.image("next_stage", "static/assets/papan_img/next_stage.png");
        this.load.image("replay", "static/assets/papan_img/replay.png");
        this.load.image("home", "static/assets/papan_img/home.png");
        
        this.load.image("settingMenu", "static/assets/papan_img/setting-menu.png");
        this.load.image("soundActive", "static/assets/papan_img/sound-active-button.png");
        this.load.image("soundNonActive", "static/assets/papan_img/sound-nonactive-button.png");
        this.load.image("muteActive", "static/assets/papan_img/mute-active-button.png");
        this.load.image("muteNonActive", "static/assets/papan_img/mute-nonactive-button.png");

        this.load.image("tombolKeluar", "static/assets/papan_img/tombolKeluar.png");
        this.load.image("tombolPengaturan", "static/assets/papan_img/tombolPengaturan.png");
        this.load.image("tombolPlay", "static/assets/papan_img/tombolPlay.png");

        this.load.image("lifePanel", "static/assets/papan_img/lifePanel.png");
        this.load.image("live", "static/assets/papan_img/live.png");

        // Tutorial Images
        this.load.image("tutorial", "static/assets/papan_img/tutorial.png");
        this.load.image("Level 1", "static/assets/papan_img/Level 1.png");
        this.load.image("Level 2", "static/assets/papan_img/Level 2.png");
        this.load.image("Level 3", "static/assets/papan_img/Level 3.png");
        
        // Spritesheets
        this.load.spritesheet("dropPointandGear", "static/assets/papan_img/dropPointandGear.png", {
            frameWidth: 435, frameHeight: 272
        });
        this.load.spritesheet("bar", "static/assets/papan_img/bar.png", {
            frameWidth: 1412 / 7,
            frameHeight: 640,
            spacing: 2,
            
        });
        
        // Result Button
        this.load.image("result-0star", "static/assets/papan_img/result-0star.png");
        this.load.image("result-1star", "static/assets/papan_img/result-1star.png");
        this.load.image("result-2star", "static/assets/papan_img/result-2star.png");
        this.load.image("result-3star", "static/assets/papan_img/result-3star.png");

        // Text Result
        this.load.image("textWin", "static/assets/papan_img/Kerja Bagus !.png");
        this.load.image("textLose", "static/assets/papan_img/Coba Lagi !.png");
        this.load.image("Score", "static/assets/papan_img/Score.png");
        
        // Effect
        this.load.image("poof", "static/assets/papan_img/poof.png");
        
        // Setting Menu
        this.load.image("setting-menu", "static/assets/papan_img/setting-menu.png");
        this.load.image("sound-active-button", "static/assets/papan_img/sound-active-button.png");
        this.load.image("sound-nonactive-button", "static/assets/papan_img/sound-nonactive-button.png");
        this.load.image("titlebox", "static/assets/papan_img/titlebox.png");
    }

    /** @returns {void} */
    // editorCreate() {

    //     // progressBar
    //     const progressBar = this.add.rectangle(553, 361, 256, 20);
    //     progressBar.setOrigin(0, 0);
    //     progressBar.isFilled = true;
    //     progressBar.fillColor = 14737632;

    //     // progressBarBg
    //     const progressBarBg = this.add.rectangle(553.0120849609375, 361, 256, 20);
    //     progressBarBg.setOrigin(0, 0);
    //     progressBarBg.fillColor = 14737632;
    //     progressBarBg.isStroked = true;

    //     // loadingText
    //     const loadingText = this.add.text(552.0120849609375, 329, "", {});
    //     loadingText.text = "Loading...";
    //     loadingText.setStyle({ "color": "#e0e0e0", "fontFamily": "arial", "fontSize": "20px" });

    //     this.progressBar = progressBar;

    //     this.events.emit("scene-awake");
    // }

    /** @type {Phaser.GameObjects.Rectangle} */
    progressBar;

    /* START-USER-CODE */

    // Write your code here

    preload() {

        // this.editorCreate();

        this.editorPreload();

        // const width = this.progressBar.width;

        // this.load.on("progress", (progress) => {

        //     this.progressBar.width = progress * width;
        // });
    }

    create() {
        this.scene.start("MainMenu");
    }
}