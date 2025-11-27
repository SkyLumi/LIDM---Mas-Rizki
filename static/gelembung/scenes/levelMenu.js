import { API_BASE_URL } from '../../config.js';

export class LevelMenu extends Phaser.Scene {
   constructor(){
      super('LevelMenu')
   }

   async create() {
      const { width, height } = this.sys.game.config

      let screenCenterX = width / 2
      let screenCenterY = height / 2

      this.add.image(screenCenterX, screenCenterY, 'levelmenu').setScale(0.75)
      this.add.image(screenCenterX, screenCenterY, 'levelBox').setScale(0.37)

      const closeButton = this.add.image(
         screenCenterX + 330, 
         screenCenterY - 330, 
         'closeButton'
      ).setScale(0.35).setInteractive()

      const buttonContainer = this.add.container(screenCenterX, screenCenterY -60)

      this.btnLevel1 = this.add.image(-190, 0, 'level1Unselected').setScale(0.4);
      
      this.btnLevel2 = this.add.image(0, 0, 'levelLock').setScale(0.4);
      this.btnLevel3 = this.add.image(190, 0, 'levelLock').setScale(0.4);

      buttonContainer.add([this.btnLevel1, this.btnLevel2, this.btnLevel3])

      const normalScale = 0.35
      const hoverScale = 0.4
      const tweenDuration = 100;

      closeButton.on('pointerover', () => {
         this.tweens.add({ targets: closeButton, scale: hoverScale, duration: tweenDuration, ease: 'Power1' })
         if (this.registry.get('isSfxOn') === true) this.sound.play('sfxMenuButtonHover')
      })

      closeButton.on('pointerout', () => {
         this.tweens.add({ targets: closeButton, scale: normalScale, duration: tweenDuration, ease: 'Power1' })
      })

      closeButton.on('pointerdown', () => {
         if (this.registry.get('isSfxOn') === true) this.sound.play('sfxMenuButtonClick')
         this.scene.start('MainMenu')
      });

      const idProfil = this.registry.get('currentMuridId');
      const namaGame = "GELEMBUNG AJAIB";

      if (!idProfil) {
          console.error("ID Profil tidak ditemukan, menggunakan default unlock.");
          this.setupLevelButton(this.btnLevel1, { is_unlocked: true }, 1);
          return;
      }

      try {
          const response = await fetch(`${API_BASE_URL}/v1/game/status?id_profil=${idProfil}&nama_game=${namaGame}`);
          const result = await response.json();

          if (result.status === 'sukses') {
              const progress = result.data.progress;
              
              console.log("Progress Gelembung:", progress);

              this.setupLevelButton(this.btnLevel1, progress.level1, 1);
              this.setupLevelButton(this.btnLevel2, progress.level2, 2);
              this.setupLevelButton(this.btnLevel3, progress.level3, 3);
          }
      } catch (error) {
          console.error("Gagal mengambil data level:", error);
          this.setupLevelButton(this.btnLevel1, { is_unlocked: true }, 1);
      }
   }

   setupLevelButton(button, levelData, levelNumber) {
      const unselectedTexture = `level${levelNumber}Unselected`;
      const selectedTexture = `level${levelNumber}Selected`;

      if (levelData && levelData.is_unlocked) {
         button.setTexture(unselectedTexture);
         
         button.setInteractive({ useHandCursor: true });
         button.clearTint();

         button.on('pointerover', () => {
            if (this.registry.get('isSfxOn') === true) {
               this.sound.play('sfxLevelButtonHover');
            }
            button.setTexture(selectedTexture);
            // button.setScale(0.45);
         });

         button.on('pointerout', () => {
            button.setTexture(unselectedTexture);
            // button.setScale(0.4);
         });

         button.on('pointerdown', () => {
            if (this.registry.get('isSfxOn') === true) {
               this.sound.play('sfxLevelButtonClick');
            }
            this.selectLevel(levelNumber);
         });

      } else {
         button.setTexture('levelLock');
         button.disableInteractive();
         button.setScale(0.4);
      }
   }

   selectLevel(levelNumber) {
      this.scene.start('Game', { level: levelNumber })
   }
}