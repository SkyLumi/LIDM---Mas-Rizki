export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader')
    }

    preload() {
        // ----             Main Menu               ----
        this.load.image('menuBG', 'static/eskrim_img/mainMenuPage.png')
        this.load.image('titleBox', 'static/eskrim_img/title-box.png')
        this.load.image('playButton', 'static/eskrim_img/play-button.png')
        this.load.image('settingsButton', 'static/eskrim_img/pengaturan-button.png')
        this.load.image('quitButton', 'static/eskrim_img/keluar-button.png')

        // ----             Level Menu               ----
        this.load.image('levelBG', 'static/eskrim_img/backgroundLevelMenu.png')
        this.load.image('levelbox', 'static/eskrim_img/levelbox.png')
        this.load.image('level1Btn', 'static/eskrim_img/level1Btn.png')
        this.load.image('levelLockedBtn', 'static/eskrim_img/level-locked-btn.png')
        
        // ----             Tutorial               ----
        this.load.image('')
        this.load.image('playTutorialBtn', 'static/eskrim_img/mulai_button.png')
        

        this.load.image('boxLife', 'static/eskrim_img/boxLife.png')
        this.load.image('scorePanel', 'static/eskrim_img/scorePanel.png')

        this.load.image('cone', 'static/eskrim_img/cone.png')
        this.load.image('lifeIcon', 'static/eskrim_img/life-cone-icon.png')
        this.load.image('machinery', 'static/eskrim_img/backgroundMesin.png')

        
        this.load.spritesheet('iceCreamFall', 'static/eskrim_img/vanillaFall.png', {
            frameWidth: 150, frameHeight: 200
        })
        this.load.spritesheet('dispenser', 'static/eskrim_img/dispenserArm.png', {
            frameWidth: 4784, frameHeight: 1440
        })
        
        this.load.audio('bgm-main-start', 'static/audio/tangkap-mainmenu-start.m4a')
        this.load.audio('bgm-main-loop', 'static/audio/tangkap-mainmenu-loop.m4a')
        this.load.audio('bgm-gameplay', 'static/audio/tangkap-gameplay.m4a')
        this.load.audio('bgm-win-loop', 'static/audio/tangkap-win-loop.m4a')
        this.load.audio('bgm-win-start', 'static/audio/tangkap-win-start.m4a')
    }

    create() {
        this.scene.start('MainMenu')
    }
}