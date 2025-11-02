export class Preloader extends Phaser.Scene {
   constructor() {
      super('Preloader')
   }

   preload() {
      const basePathImg = 'static/assets/gelembung_img'
      const basePathFont = 'static/assets/font'

      //    FONT     //
      this.load.font('AlfaSlabOne', `${basePathFont}/AlfaSlabOne-Regular.ttf`)
      this.load.font('LilitaOne', `${basePathFont}/LilitaOne-Regular.ttf`)
      this.load.font('Raleway', `${basePathFont}/Raleway-Regular.ttf`)

      //    BACKGROUND     //
      this.load.image('mainmenu', `${basePathImg}/bg-mainmenu.png`)
      this.load.image('levelmenu', `${basePathImg}/bg-levelmenu.png`)
      this.load.image('pauseMenu', `${basePathImg}/pause-menu.png`)
      this.load.image('settingMenu', `${basePathImg}/setting-menu.png`)
      this.load.image('titleBox', `${basePathImg}/titlebox.png`)
      this.load.image('levelBox', `${basePathImg}/levelbox.png`)

      //    BUTTONS     //
      this.load.image('startButton', `${basePathImg}/mulai_button.png`)
      this.load.image('playButton', `${basePathImg}/buttonplay.png`)
      this.load.image('exitButton', `${basePathImg}/buttonkeluar.png`)
      this.load.image('settingButton', `${basePathImg}/buttonpengaturan.png`)
      this.load.image('closeButton', `${basePathImg}/close-button.png`)
      this.load.image('continueButton', `${basePathImg}/continue-button.png`)
      this.load.image('retryButton', `${basePathImg}/retry-button.png`)
      this.load.image('homeButton', `${basePathImg}/home-button.png`)
      this.load.image('pauseButton', `${basePathImg}/pause-button.png`)
      this.load.image('nextLevelButton', `${basePathImg}/nextlevel-button.png`)
      this.load.image('shuffleButton', `${basePathImg}/shuffle.png`)

      //    SOUND & MUTE     //
      this.load.image('soundActive', `${basePathImg}/sound-active-button.png`)
      this.load.image('soundNonActive', `${basePathImg}/sound-nonactive-button.png`)
      this.load.image('muteActive', `${basePathImg}/mute-active-button.png`)
      this.load.image('muteNonActive', `${basePathImg}/mute-nonactive-button.png`)

      //    LEVEL BUTTON     //
      this.load.image('level1Selected', `${basePathImg}/level1btn-selected.png`)
      this.load.image('level1Unselected', `${basePathImg}/level1btn-unselected.png`)
      this.load.image('level2Selected', `${basePathImg}/level2btn-selected.png`)
      this.load.image('level2Unselected', `${basePathImg}/level2btn-unselected.png`)
      this.load.image('level3Selected', `${basePathImg}/level3btn-selected.png`)
      this.load.image('level3Unselected', `${basePathImg}/level3btn-unselected.png`)
      this.load.image('levelLock', `${basePathImg}/levellock.png`)

      //    RESULT SCREEN     //
      this.load.image('gameOver', `${basePathImg}/gameover.png`)
      this.load.image('result0Star', `${basePathImg}/result-0-star.png`)
      this.load.image('result1Star', `${basePathImg}/result-1-star.png`)
      this.load.image('result2Star', `${basePathImg}/result-2-star.png`)
      this.load.image('result3Star', `${basePathImg}/result-3-star.png`)

      //    SPRITESHEET    //
      this.load.spritesheet('efekAirAnimasi', `${basePathImg}/efek-air-animasi.png`, {
         frameWidth: 424,
         frameHeight: 424
      })
      this.load.spritesheet('blueBubble', `${basePathImg}/blue-bubble-animation.png`, {
         frameWidth: 520,
         frameHeight: 520
      })
      this.load.spritesheet('bomBubble', `${basePathImg}/bom-bubble-animation.png`, {
         frameWidth: 520,
         frameHeight: 520
      })
      this.load.spritesheet('purpleBubble', `${basePathImg}/purple-bubble-animation.png`,{
         frameWidth: 520,
         frameHeight: 520
      })

      //    GAMEPLAY SCREEN     //
      this.load.image('avatarPlaceholder', `${basePathImg}/avatar-placeholder.png`)
      this.load.image('scoreFill', `${basePathImg}/scorefill.png`)
      this.load.image('timer', `${basePathImg}/timer.png`)
      this.load.image('life', `${basePathImg}/life.png`)
      this.load.image('scorePanel', `${basePathImg}/scorepanel.png`)
      this.load.image('air', `${basePathImg}/air.png`)

      //    LEVEL TUTORIAL SCREEN     //
      this.load.image('tutorialLv1', `${basePathImg}/tutoriallv1.png`)
      this.load.image('tutorialLv2', `${basePathImg}/tutoriallv2.png`)
      this.load.image('tutorialLv3', `${basePathImg}/tutoriallv3.png`)

      //    COOLDOWN TIMER     //
      this.load.image('One', `${basePathImg}/One.png`)
      this.load.image('Two', `${basePathImg}/Two.png`)
      this.load.image('Three', `${basePathImg}/Three.png`)
   }

   create() {
      this.scene.start('MainMenu')
   }
}
