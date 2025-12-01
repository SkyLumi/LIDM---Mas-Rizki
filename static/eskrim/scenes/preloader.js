export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader')
    }

    preload() {
        // ----              Font                ----
        this.load.font('lilita-one', 'static/assets/font/LilitaOne-Regular.ttf', 'truetype')
        this.load.font('raleway', 'static/assets/font/Raleway-Regular.ttf', 'truetype')

        // ----             Fullscreen              ----
        this.load.image('fullscreen_icon', 'static/assets/img/fullscreen.png');
        this.load.image('minimize_icon', 'static/assets/img/minimize.png');

        // ----             Main Menu               ----
        this.load.image('menuBG', 'static/assets/eskrim_img/mainMenuPage.png')
        this.load.image('titleBox', 'static/assets/eskrim_img/title-box.png')
        this.load.image('playButton', 'static/assets/eskrim_img/play-button.png')
        this.load.image('settingsButton', 'static/assets/eskrim_img/pengaturan-button.png')
        this.load.image('quitButton', 'static/assets/eskrim_img/keluar-button.png')

        // ----             Level Menu               ----
        this.load.image('levelBG', 'static/assets/eskrim_img/backgroundLevelMenu.png')
        this.load.image('levelbox', 'static/assets/eskrim_img/levelbox.png')
        this.load.image('level1Btn', 'static/assets/eskrim_img/level1btn.png')
        this.load.image('level2Btn', 'static/assets/eskrim_img/level2btn.png')
        this.load.image('level3Btn', 'static/assets/eskrim_img/level3btn.png')
        this.load.image('levelLockedBtn', 'static/assets/eskrim_img/level-locked-btn.png')
        this.load.image('closeButton', 'static/assets/eskrim_img/close-btn.png')
        
        // ----             Tutorial               ----
        this.load.image('tutorial_level1', 'static/assets/eskrim_img/tutorial_level1.png');
        this.load.image('tutorial_level2', 'static/assets/eskrim_img/tutorial_level2.png');
        this.load.image('tutorial_level3', 'static/assets/eskrim_img/tutorial_level3.png');
        this.load.image('mulai_button', 'static/assets/eskrim_img/mulai_button.png')
        
        // ----             Game               ----
        this.load.image('countdown_3', 'static/assets/eskrim_img/3.png');
        this.load.image('countdown_2', 'static/assets/eskrim_img/2.png');
        this.load.image('countdown_1', 'static/assets/eskrim_img/1.png');
        this.load.image('countdown_go', 'static/assets/eskrim_img/go.png');

        this.load.image('boxLife', 'static/assets/eskrim_img/boxLife.png')
        this.load.image('cone', 'static/assets/eskrim_img/cone.png')
        this.load.image('lifeIcon', 'static/assets/eskrim_img/life-cone-icon.png')
        this.load.image('machinery', 'static/assets/eskrim_img/background-mesin.png')
        this.load.spritesheet('dispenserArm', 'static/assets/eskrim_img/dispenserArm.png', {
            frameWidth: 4784, frameHeight: 1440
        })
        this.load.spritesheet('arm_tilt_right', 'static/assets/eskrim_img/arm_tilt_right.png', {
            frameWidth: 4784, frameHeight: 1440
        })
        this.load.spritesheet('arm_tilt_left', 'static/assets/eskrim_img/arm_tilt_left.png', {
            frameWidth: 4784, frameHeight: 1440
        })
        this.load.spritesheet('drop_left', 'static/assets/eskrim_img/drop_left.png', {
            frameWidth: 4784, frameHeight: 1440
        })
        this.load.spritesheet('drop_right', 'static/assets/eskrim_img/drop_right.png', {
            frameWidth: 4784, frameHeight: 1440
        })
        this.load.spritesheet('iceCreamFall', 'static/assets/eskrim_img/vanillaFall.png', {
            frameWidth: 150, frameHeight: 200
        })
        this.load.spritesheet('iceCreamSplat', 'static/assets/eskrim_img/vanillasplat.png', {
            frameWidth: 288, frameHeight: 288
        })
        this.load.spritesheet('bomb', 'static/assets/eskrim_img/bomb.png', {
            frameWidth: 338, frameHeight: 305
        })
        this.load.image('pauseBtn', 'static/assets/eskrim_img/pause_button.png')
        this.load.image('scorePanel', 'static/assets/eskrim_img/score-panel.png')
        this.load.image('scoreFillBar', 'static/assets/eskrim_img/Fillicecreambar.png')

        // ----              Pause PopUp               ----
        this.load.image('pausePanel', 'static/assets/eskrim_img/pause-popup.png')
        this.load.image('panelHome', 'static/assets/eskrim_img/panelhome.png')
        this.load.image('panelRestart', 'static/assets/eskrim_img/panelrestart.png')
        this.load.image('panelResume', 'static/assets/eskrim_img/panelresume.png')

        // ----             Game Over               ----
        this.load.image('gameOverPanel','static/assets/eskrim_img/gameover-panel.png')
        this.load.image('bintang', 'static/assets/eskrim_img/bintang.png')
        this.load.image('panelNextLevel', 'static/assets/eskrim_img/panelnextlevel.png')


        this.load.audio('bgm-main-start', 'static/assets/audio/tangkap-mainmenu-start.m4a')
        this.load.audio('bgm-main-loop', 'static/assets/audio/tangkap-mainmenu-loop.m4a')
        this.load.audio('bgm-gameplay', 'static/assets/audio/tangkap-gameplay.m4a')
        this.load.audio('bgm-win-loop', 'static/assets/audio/tangkap-win-loop.m4a')
        this.load.audio('bgm-win-start', 'static/assets/audio/tangkap-win-start.m4a')
    }

    create() {
        this.scene.launch('UIScene');
        this.scene.start('MainMenu')
    }
}