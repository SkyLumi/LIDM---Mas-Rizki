export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader')
    }

    preload() {
        // ----              Font                ----
        this.load.font('lilita-one', 'static/assets/font/LilitaOne-Regular.ttf', 'truetype');


        // ----             Main Menu               ----
        this.load.image('menuBG', 'static/assets/eskrim_img/mainMenuPage.png')
        this.load.image('titleBox', 'static/assets/eskrim_img/title-box.png')
        this.load.image('playButton', 'static/assets/eskrim_img/play-button.png')
        this.load.image('settingsButton', 'static/assets/eskrim_img/pengaturan-button.png')
        this.load.image('quitButton', 'static/assets/eskrim_img/keluar-button.png')

        // ----             Level Menu               ----
        this.load.image('levelBG', 'static/assets/eskrim_img/backgroundLevelMenu.png')
        this.load.image('levelbox', 'static/assets/eskrim_img/levelbox.png')
        this.load.image('level1Btn', 'static/assets/eskrim_img/level1Btn.png')
        this.load.image('levelLockedBtn', 'static/assets/eskrim_img/level-locked-btn.png')
        this.load.image('closeButton', 'static/assets/eskrim_img/close-btn.png')
        
        // ----             Tutorial               ----
        this.load.image('tutorialPanel', 'static/assets/eskrim_img/tutorial.png')
        this.load.image('playTutorialBtn', 'static/assets/eskrim_img/mulai_button.png')
        
        // ----             Game               ----
        this.load.image('boxLife', 'static/assets/eskrim_img/boxLife.png')
        this.load.image('cone', 'static/assets/eskrim_img/cone.png')
        this.load.image('lifeIcon', 'static/assets/eskrim_img/life-cone-icon.png')
        this.load.image('machinery', 'static/assets/eskrim_img/background-mesin.png')
        this.load.spritesheet('dispenserArm', 'static/assets/eskrim_img/dispenserArm.png', {
            frameWidth: 4784, frameHeight: 1440
        })
        this.load.spritesheet('iceCreamFall', 'static/assets/eskrim_img/vanillaFall.png', {
            frameWidth: 150, frameHeight: 200
        })
        this.load.image('pauseBtn', 'static/assets/eskrim_img/pause_button.png')
        this.load.image('scorePanel', 'static/assets/eskrim_img/score-panel.png')

        
        this.load.audio('bgm-main-start', 'static/assets/audio/tangkap-mainmenu-start.m4a')
        this.load.audio('bgm-main-loop', 'static/assets/audio/tangkap-mainmenu-loop.m4a')
        this.load.audio('bgm-gameplay', 'static/assets/audio/tangkap-gameplay.m4a')
        this.load.audio('bgm-win-loop', 'static/assets/audio/tangkap-win-loop.m4a')
        this.load.audio('bgm-win-start', 'static/assets/audio/tangkap-win-start.m4a')
    }

    create() {
        this.scene.start('Game')
    }
}