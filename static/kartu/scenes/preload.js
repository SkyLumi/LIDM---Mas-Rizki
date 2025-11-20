export default class preloader extends Phaser.Scene {
   constructor() {
      super('preloader')
   }

   preload() {
      const basePathImage = 'static/assets/kartu_img'
      const basePathFont = 'static/assets/font'
      const basePathAudio = 'static/assets/audio'

      //    FONT     //
      this.load.font('AlfaSlabOne', `${basePathFont}/AlfaSlabOne-Regular.ttf`)
      this.load.font('LilitaOne', `${basePathFont}/LilitaOne-Regular.ttf`)
      this.load.font('Raleway', `${basePathFont}/Raleway-Regular.ttf`)
      this.load.font('RalewayBold', `${basePathFont}/Raleway-Bold.ttf`)

      this.load.image("game_bg", "static/assets/kartu_img/game_bg.png");
      this.load.image("Group 427320172", "static/assets/kartu_img/Group 427320172.png");
      this.load.image("health_", "static/assets/kartu_img/health_.png");
      this.load.image("home_bg", "static/assets/kartu_img/home_bg.jpg");
      this.load.image("HomeButton", "static/assets/kartu_img/HomeButton.png");
      this.load.image("judul_kartu", "static/assets/kartu_img/judul_kartu.png");
      this.load.image("keluar_", "static/assets/kartu_img/keluar_.png");
      this.load.image("kembali_", "static/assets/kartu_img/kembali_.png");
      this.load.image("Level Button 1", "static/assets/kartu_img/Level Button 1.png");
      this.load.image("Level Button 2", "static/assets/kartu_img/Level Button 2.png");
      this.load.image("Level Button 3", "static/assets/kartu_img/Level Button 3.png");
      this.load.image("LEVEL_", "static/assets/kartu_img/LEVEL_.png");
      this.load.image("level_bg", "static/assets/kartu_img/level_bg.jpg");
      this.load.image("nextLevel", "static/assets/kartu_img/nextLevel.png");
      this.load.image("pause_", "static/assets/kartu_img/pause_.png");
      this.load.image("pengaturan_", "static/assets/kartu_img/pengaturan_.png");
      this.load.image("play_", "static/assets/kartu_img/play_.png");
      this.load.image("RetryButton", "static/assets/kartu_img/RetryButton.png");
      this.load.image("skor_", "static/assets/kartu_img/skor_.png");
      this.load.image("time_", "static/assets/kartu_img/time_.png");
      this.load.image("tutorPanel", "static/assets/kartu_img/tutor_.png");
      this.load.image("mulaiBtn", "static/assets/kartu_img/mulaiBtn.png");
      this.load.image("continueBtn", "static/assets/kartu_img/continueButton.png");

      this.load.image('handGesture', `${basePathImage}/hand_gesture.png`); 
      this.load.image('handCursorLoader', `${basePathImage}/handcursor_loader.png`);

      this.load.image("Cardback01", "static/assets/kartu_img/Card Back 1.png");
      this.load.image("Cardback02", "static/assets/kartu_img/Frame 1261153332.png");

      this.load.image("CardApple", `${basePathImage}/apple.png`)
      this.load.image("CardBanana", `${basePathImage}/banana.png`)
      this.load.image("CardBeatroot", `${basePathImage}/beatroot.png`)
      this.load.image("CardBlackberry", `${basePathImage}/blackberry.png`)
      this.load.image("CardBlueberry", `${basePathImage}/blueberry.png`)
      this.load.image("CardCoconut", `${basePathImage}/coconut.png`)
      this.load.image("CardMango", `${basePathImage}/mango.png`)
      this.load.image("CardOrange", `${basePathImage}/orange.png`)
      this.load.image("CardPeach", `${basePathImage}/peach.png`)
      this.load.image("CardPear", `${basePathImage}/pear.png`)
      this.load.image("CardPomegrenate", `${basePathImage}/pomegrenate.png`)
      this.load.image("CardStawberry", `${basePathImage}/strawberry.png`)
      this.load.image("CardWatermelon", `${basePathImage}/watermelon.png`)
      this.load.image("CardEmpty", `${basePathImage}/empty.png`)

      this.load.image("star0", `${basePathImage}/bintang0.png`)
      this.load.image("star1", `${basePathImage}/bintang1.png`)
      this.load.image("star2", `${basePathImage}/bintang2.png`)
      this.load.image("star3", `${basePathImage}/bintang3.png`)

      this.load.image("level2BtnLocked", `${basePathImage}/level2btnLocked.png`)
      this.load.image("level3BtnLocked", `${basePathImage}/level3btnLocked.png`)

      this.load.image("settingPanel", `${basePathImage}/settingPanel.png`)
      this.load.image("toggleOn", `${basePathImage}/toggleOn.png`)
      this.load.image("toggleOff", `${basePathImage}/toggleOff.png`)

      this.load.image("pausePanel", `${basePathImage}/pausePanel.png`)
   }

   create() {
      this.scene.start('home')
   }
}