import MediaPipeManager from "./mediapipeManager.js";
import { API_BASE_URL } from '../../config.js';

export default class game extends Phaser.Scene {

   constructor() {
      super("game");
   }

   editorCreate() {
      
      const game_bg = this.add.image(0, 0, "game_bg");
      game_bg.setOrigin(0, 0);

      this.add.image(168, 91, "health_");

      this.add.image(1748, 91, "time_");

      this.add.image(955, 102, "skor_");

      
      this.pauseButton = this.add.image(103, 976, "pause_");
      this.pauseButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, 111, 108), Phaser.Geom.Rectangle.Contains);

      this.pauseButton.on('pointerover', () => {
         this.tweens.add({
            targets: this.pauseButton,
            scale: 1.05,
            duration: 100,
            ease: 'Power1'
         })
      })

      this.pauseButton.on('mouseout', () => {
         this.tweens.add({
            targets: this.pauseButton,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })

      this.pauseButton.on('pointerdown', this.pauseGame.bind(this));

      this.videoElement = document.getElementById('webcam')
      this.mediapipe = new MediaPipeManager(this.videoElement, this.onMediaPipeResults.bind(this))

      this.events.emit("scene-awake");
   }

   onMediaPipeResults(results) {
      let handVisible = false;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
         const handLandmarksMap = {};
         results.multiHandLandmarks.forEach((landmarks, i) => {
            const handInfo = results.multiHandedness[i];
            if (handInfo && handInfo.label) {
               handLandmarksMap[handInfo.label] = landmarks;
            }
         });

         let landmarksToProcess = null;

         if (this.lockedHandLabel && handLandmarksMap[this.lockedHandLabel]) {
            landmarksToProcess = handLandmarksMap[this.lockedHandLabel];
            handVisible = true;
         
         } else if (!this.lockedHandLabel && Object.keys(handLandmarksMap).length > 0) {
            if (handLandmarksMap['Right']) {
               this.lockedHandLabel = 'Right';
               landmarksToProcess = handLandmarksMap['Right'];
            } else {
               const firstLabel = Object.keys(handLandmarksMap)[0];
               this.lockedHandLabel = firstLabel;
               landmarksToProcess = handLandmarksMap[firstLabel];
            }
            handVisible = true;
         
         } else if (this.lockedHandLabel && !handLandmarksMap[this.lockedHandLabel]) {
            this.lockedHandLabel = null;
            handVisible = false;
         }

         if (handVisible && landmarksToProcess) {
            const palm = landmarksToProcess[9];
            if (palm) {
               const { width, height } = this.sys.game.config;
               const x = palm.x * width;
               const y = palm.y * height;

               if (!this.handCursor) {
                  this.handCursor = this.add.image(x, y, 'handGesture').setDepth(100);

                  this.handLoader = this.add.image(x, y, 'handCursorLoader').setDepth(101).setVisible(false);
                  
                  this.handLoaderMask = this.make.graphics({ x: x, y: y });
                  
                  this.handLoader.mask = new Phaser.Display.Masks.GeometryMask(this, this.handLoaderMask);
               }

               const smoothing = 0.5;
               this.handCursor.x += (x - this.handCursor.x) * smoothing;
               this.handCursor.y += (y - this.handCursor.y) * smoothing;

               if (this.handLoader) {
                  this.handLoader.x = this.handCursor.x;
                  this.handLoader.y = this.handCursor.y;
                  this.handLoaderMask.x = this.handCursor.x;
                  this.handLoaderMask.y = this.handCursor.y;
               }
               
               this.handCursor.setVisible(true);
            }
         }
      }
      
      if (!handVisible && this.handCursor) {
         this.handCursor.setVisible(false);
         
         if (this.handLoader) {
            this.handLoader.setVisible(false);
         }
         if (this.handLoaderMask) {
            this.handLoaderMask.clear(); 
         }
         this.lockedHandLabel = null;
         this.resetHover();
      }
   }

   init(data) {
      this.currentLevel = data.level || 1;
   }

   create() {

      this.editorCreate();

      this.HOVER_DURATION = 1500;
      this.FLIP_ANIM_DURATION = 250;
      
      this.cardAssetKeys = [
         "CardApple", 
         "CardBanana", 
         "CardBeatroot",
         "CardBlackberry",
         "CardBlueberry",
         "CardCoconut",
         "CardMango",
         "CardOrange",
         "CardPeach",
         "CardPear",
         "CardPomegrenate",
         "CardStawberry",
         "CardWatermelon"
      ];
      
      this.cardBacks = [
         "Cardback01", 
         "Cardback02"
      ];

      this.handCursor = null;
      this.handLoader = null;
      this.handLoaderMask = null;
      this.cards = null;
      this.lockedHandLabel = null;
      
      this.tutorialContainer = null;
      this.mulaiButton = null;
      
      this.currentHover = {
         element: null,
         startTime: null
      };
      
      this.health = 4;
      this.moves = 0;
      this.timerValue = 90;
      this.timerEvent = null;
      this.isBoardLocked = false;
      this.flippedCards = [];
      this.totalPairsInLevel = 0; 
      this.totalPairsFound = 0;

      this.isPaused = false;
      this.pauseContainer = null;

      const textStyle = { 
         fontFamily: 'LilitaOne', 
         fontSize: '64px', 
         color: '#ffffff', 
      };

      const textStyleMove = { 
         fontFamily: 'LilitaOne', 
         fontSize: '64px', 
         color: '#BC701E', 
      };
      
      this.healthText = this.add.text(165, 91, `x${this.health}`, textStyle).setOrigin(0, 0.5);
      
      this.timeText = this.add.text(1765, 91, `${this.timerValue}s`, textStyle).setOrigin(1, 0.5);
      
      this.movesText = this.add.text(940, 100, `${this.moves}`, textStyleMove).setOrigin(0, 0.5);


      this.loadLevel(this.currentLevel);

   }

   update(time, delta) {
      if (this.isPaused) return;
      if (this.handCursor && this.handCursor.visible) {
         if (!this.isBoardLocked) {
            this.checkHover();
         }
      }
   }
   
   updateLoaderMask(progress) {
      if (!this.handLoaderMask || !this.handLoader) return;

      this.handLoaderMask.clear();
      this.handLoaderMask.fillStyle(0xffffff, 1.0); 

      const startAngle = Phaser.Math.DegToRad(90); 
      const endAngle = Phaser.Math.DegToRad(90 + (progress * 360));
      
      const radius = this.handLoader.width / 2; 

      this.handLoaderMask.beginPath();
      this.handLoaderMask.moveTo(0, 0); 
      this.handLoaderMask.arc(0, 0, radius, startAngle, endAngle, false);
      this.handLoaderMask.closePath();
      this.handLoaderMask.fillPath();
   }

   pauseGame() {
      if (this.isPaused || this.isBoardLocked) {
         return;
      }

      this.isPaused = true;
      this.isBoardLocked = true; 
      
      if (this.timerEvent) {
         this.timerEvent.paused = true;
      }

      if (this.handCursor) this.handCursor.setVisible(false);
      if (this.handLoader) this.handLoader.setVisible(false);
      this.pauseButton.setVisible(false);

      const { width, height } = this.sys.game.config;

      this.pauseContainer = this.add.container(width / 2, height / 2).setDepth(200);

      const bg = this.add.graphics({ x: -width / 2, y: -height / 2 })
         .fillStyle(0x000000, 0.7)
         .fillRect(0, 0, width, height)
         .setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains); 

      const panel = this.add.image(180, 30, 'pausePanel').setScale(1.5);
      
      const buttonY = 150; 
      const buttonSpacing = 150; 

      // KIRI
      const continueBtn = this.add.image(-buttonSpacing + 10, buttonY, 'continueBtn').setInteractive().setScale(1.5);

      continueBtn.on('pointerover', () => {
         this.tweens.add({
            targets: continueBtn,
            scale: 1.6,
            duration: 100,
            ease: 'Power1'
         })
      })

      continueBtn.on('pointerout',() => {
         this.tweens.add({
            targets: continueBtn,
            scale: 1.5,
            duration: 100,
            ease: 'Power1'
         })
      })
      
      // TENGAH
      const retryBtn = this.add.image(0 + 10, buttonY, 'RetryButton').setInteractive();

      retryBtn.on('pointerover', () => {
         this.tweens.add({
            targets: retryBtn,
            scale: 1.1,
            duration: 100,
            ease: 'Power1'
         })
      })

      retryBtn.on('pointerout',() => {
         this.tweens.add({
            targets: retryBtn,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })
      
      // KANAN
      const homeBtn = this.add.image(buttonSpacing + 10, buttonY, 'HomeButton').setInteractive();

      homeBtn.on('pointerover', () => {
         this.tweens.add({
            targets: homeBtn,
            scale: 1.1,
            duration: 100,
            ease: 'Power1'
         })
      })

      homeBtn.on('pointerout',() => {
         this.tweens.add({
            targets: homeBtn,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
         })
      })

      this.pauseContainer.add([bg, panel, continueBtn, retryBtn, homeBtn]);


      continueBtn.on('pointerdown', () => {
         this.resumeGame();
      });

      retryBtn.on('pointerdown', () => {
         this.isPaused = false;
         this.isBoardLocked = false; 
         if (this.pauseContainer) this.pauseContainer.destroy();
         
         this.loadLevel(this.currentLevel);
      });

      homeBtn.on('pointerdown', () => {
         this.isPaused = false;
         this.isBoardLocked = false;
         if (this.pauseContainer) this.pauseContainer.destroy();

         this.scene.start('home');
      });
   }

   resumeGame() {
      if (!this.isPaused) {
         return;
      }

      this.isPaused = false;
      this.isBoardLocked = false; 

      if (this.pauseContainer) {
         this.pauseContainer.destroy();
         this.pauseContainer = null;
      }

      if (this.timerEvent) {
         this.timerEvent.paused = false;
      }

      if (this.handCursor) {
         this.handCursor.setVisible(true);
      }
      
      this.pauseButton.setVisible(true);
   }

   generateCenteredGrid(cols, rows, cardWidth, cardHeight, padding) {
      
      const positions = [];
      const screenWidth = this.sys.game.config.width;
      const screenHeight = this.sys.game.config.height;

      const totalGridWidth = (cols * cardWidth) + ((cols - 1) * padding);
      const totalGridHeight = (rows * cardHeight) + ((rows - 1) * padding);

      const startX = (screenWidth - totalGridWidth) / 2;
      const startY = (screenHeight - totalGridHeight) / 2 + 45; 

      const offsetX = cardWidth / 2;
      const offsetY = cardHeight / 2;

      for (let r = 0; r < rows; r++) {
         for (let c = 0; c < cols; c++) {
            const x = startX + (c * (cardWidth + padding)) + offsetX;
            const y = startY + (r * (cardHeight + padding)) + offsetY;
            positions.push({ x, y });
         }
      }
      return positions;
   }

   loadLevel(level) {
      
      if (this.pauseButton) {
         this.pauseButton.setVisible(false); 
      }
      
      this.moves = 0;
      this.health = 4;
      this.timerValue = 90;
      this.isBoardLocked = true; 
      this.flippedCards = [];
      this.totalPairsFound = 0;
      this.currentLevel = level;
      
      if (this.timerEvent) {
         this.timerEvent.destroy();
      }
      
      this.healthText.setText(`x${this.health}`);
      this.timeText.setText(`${this.timerValue}s`);
      this.movesText.setText(`${this.moves}`);

      if (this.cards) {
         this.cards.destroy(true, true);
      }
      this.cards = this.add.group(); 

      if (this.tutorialContainer) {
         this.tutorialContainer.destroy();
      }
      
      this.showTutorialScreen();
   }

   showTutorialScreen() {
      const { width, height } = this.sys.game.config;
      
      this.tutorialContainer = this.add.container(width / 2, (height / 2) - 100);

      const tutorPanel = this.add.image(0, 10, 'tutorPanel').setScale(0.95);
      
      const mulaiBtn = this.add.image(20, 420, 'mulaiBtn'); 
      
      mulaiBtn.setInteractive();

      mulaiBtn.on('pointerover', () => {
         this.tweens.add({
            targets: mulaiBtn,
            scale: 1.00,
            duration: 100,
            ease: 'Power1'
         })
      })

      mulaiBtn.on('pointerout',() => {
         this.tweens.add({
            targets: mulaiBtn,
            scale: 0.95,
            duration: 100,
            ease: 'Power1'
         })
      })

      mulaiBtn.on('pointerdown', () => {
         if (this.tutorialContainer) {
            this.tutorialContainer.destroy();
         }
         this.tutorialContainer = null;
         this.mulaiButton = null;
         this.resetHover(); 
         this.startCountdown(); 
      });
      
      this.tutorialContainer.add([tutorPanel, mulaiBtn]);
      this.mulaiButton = mulaiBtn;
   }

   startCountdown() {
      const { width, height } = this.sys.game.config;
      
      const countdownText = this.add.text(width / 2, height / 2, '3', { 
         fontFamily: 'LilitaOne', 
         fontSize: '128px', 
         color: '#ffffff' 
      }).setOrigin(0.5);

      let count = 3;
      countdownText.setText(String(count));

      this.time.addEvent({
         delay: 1000,
         repeat: 2, 
         callback: () => {
            count--;
            countdownText.setText(String(count));
         }
      });
      
      this.time.delayedCall(3000, () => {
         countdownText.destroy();
         this.initializeCardGame(this.currentLevel); 
      });
   }
   
   initializeCardGame(level) {
      
      let numFruitPairs = 0;
      let numEmptyCards = 0;
      let numCols = 0;
      let numRows = 0;
      let scaleFactor = 1.0; 

      switch (level) {
         case 1:
            numFruitPairs = 1;
            numEmptyCards = 2;
            this.totalPairsInLevel = 1; 
            numCols = 2;
            numRows = 2;
            break;
         case 2:
            numFruitPairs = 2;
            numEmptyCards = 2;
            this.totalPairsInLevel = 2; 
            numCols = 3;
            numRows = 2;
            break;
         case 3:
            numFruitPairs = 4;
            numEmptyCards = 4;
            this.totalPairsInLevel = 4; 
            numCols = 6; 
            numRows = 2;
            scaleFactor = 0.75;
            break;
      }
      
      let deck = [];
      
      let shuffledFruits = this.shuffle(this.cardAssetKeys).slice(0, numFruitPairs);
      for (const id of shuffledFruits) {
         deck.push(id); 
         deck.push(id);
      }
      
      for (let i = 0; i < numEmptyCards; i++) {
         deck.push("CardEmpty");
      }
      
      this.shuffle(deck);

      const refTexture = this.textures.get(this.cardBacks[0]); 
      let cardWidth = refTexture.getSourceImage().width;
      let cardHeight = refTexture.getSourceImage().height;
      let padding = 30;

      const gridCardWidth = cardWidth * scaleFactor;
      const gridCardHeight = cardHeight * scaleFactor;
      const gridPadding = padding * scaleFactor;

      const positions = this.generateCenteredGrid(numCols, numRows, gridCardWidth, gridCardHeight, gridPadding);

      positions.forEach((pos, index) => {
         if (index < deck.length) {
            const cardID = deck[index];
            
            const backTexture = this.cardBacks[1]; 

            const card = this.add.sprite(pos.x, pos.y, backTexture);

            card.setScale(scaleFactor);

            card.setInteractive();

            card.setData('id', cardID); 
            card.setData('frontTexture', cardID);
            card.setData('backTexture', backTexture); 
            card.setData('isFlipped', false);
            card.setData('isMatched', false);
            card.setData('baseScale', scaleFactor);
            card.setData('baseWidth', cardWidth);
            card.setData('baseHeight', cardHeight);
            
            this.cards.add(card); 
         }
      });

      const allCards = this.cards.getChildren();
      let openTweensCompleted = 0; 

      allCards.forEach((card, index) => {
         
         this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: this.FLIP_ANIM_DURATION / 2,
            ease: 'Linear',
            delay: index * 100, 
            onComplete: () => {
               
               const frontTexture = card.getData('frontTexture');
               const baseWidth = card.getData('baseWidth');
               const baseHeight = card.getData('baseHeight');
               const textureToFlip = (frontTexture === "CardEmpty") ? "CardEmpty" : frontTexture;
               
               const frontImg = this.textures.get(textureToFlip).getSourceImage();
               const scaleX_fit = baseWidth / frontImg.width;
               const scaleY_fit = baseHeight / frontImg.height;
               const newScale = Math.min(scaleX_fit, scaleY_fit);
               const finalScale = newScale * card.getData('baseScale');

               card.setTexture(textureToFlip);
               card.scaleY = finalScale;

               this.tweens.add({
                  targets: card,
                  scaleX: finalScale,
                  duration: this.FLIP_ANIM_DURATION / 2,
                  ease: 'Linear',
                  onComplete: () => {
                     
                     openTweensCompleted++;
                     if (openTweensCompleted === allCards.length) {
                        
                        this.time.delayedCall(3000, () => {
                           
                           let closeTweensCompleted = 0; 

                           allCards.forEach((cardToClose, closeIndex) => {
                              
                              this.tweens.add({
                                 targets: cardToClose,
                                 scaleX: 0,
                                 duration: this.FLIP_ANIM_DURATION / 2,
                                 ease: 'Linear',
                                 delay: (allCards.length - 1 - closeIndex) * 50, 
                                 onComplete: () => {
                                    
                                    cardToClose.setTexture(cardToClose.getData('backTexture'));
                                    cardToClose.scaleY = cardToClose.getData('baseScale'); 

                                    this.tweens.add({
                                       targets: cardToClose,
                                       scaleX: cardToClose.getData('baseScale'),
                                       duration: this.FLIP_ANIM_DURATION / 2,
                                       ease: 'Linear',
                                       onComplete: () => {
                                          
                                          closeTweensCompleted++;
                                          if (closeTweensCompleted === allCards.length) {
                                             
                                             this.isBoardLocked = false;
                                             
                                             if (this.pauseButton) {
                                                this.pauseButton.setVisible(true);
                                             }
                                             
                                             this.timerEvent = this.time.addEvent({
                                                delay: 1000,
                                                callback: this.updateTimer,
                                                callbackScope: this,
                                                loop: true
                                             });
                                          }
                                       }
                                    });
                                 }
                              });
                           });
                        });
                     }
                  }
               });
            }
         });
      });
   }

   updateTimer() {
      
      this.timerValue--;
      this.timeText.setText(`${this.timerValue}s`);

      if (this.timerValue <= 0) {
         this.timerEvent.destroy();
         this.endGame(false, "Waktu Habis!");
      }
   }

   checkHover() {
      if (this.isBoardLocked) {
         this.resetHover();
         return;
      }

      let overlappingCardFlippable = null;
      let overlappingCardFlipped = null;

      const cursorBounds = this.handCursor.getBounds();

      this.cards.getChildren().forEach(card => {
         if (card.getData('isMatched')) return; 
         
         const cardBounds = card.getBounds();
         if (Phaser.Geom.Intersects.RectangleToRectangle(cursorBounds, cardBounds)) {
            if (card.getData('isFlipped')) {
               overlappingCardFlipped = card;
            } else {
               overlappingCardFlippable = card;
            }
         }
      });

      if (overlappingCardFlippable) {
         
         this.handCursor.setAlpha(1.0); 

         if (this.currentHover.element === overlappingCardFlippable) {
            
            const elapsedTime = Date.now() - this.currentHover.startTime;
            
            if (this.handLoader) {
               this.handLoader.setVisible(true);
               
               const progress = Phaser.Math.Clamp(elapsedTime / this.HOVER_DURATION, 0, 1);
               this.updateLoaderMask(progress); 
            }

            if (elapsedTime >= this.HOVER_DURATION) {
               this.flipCard(overlappingCardFlippable);
               this.resetHover();
            }
         } else {
            this.resetHover(); 
            this.currentHover.element = overlappingCardFlippable;
            this.currentHover.startTime = Date.now();
         }
      } else if (overlappingCardFlipped) {
         
         this.resetHover(); 
         this.handCursor.setAlpha(0.5); 
      } else {
         
         this.resetHover(); 
         this.handCursor.setAlpha(1.0); 
      }
   }

   resetHover() {
      this.currentHover.element = null;
      this.currentHover.startTime = null;
      if(this.handCursor) {
         this.handCursor.setAlpha(1.0);
         if (this.handLoader) {
            this.handLoader.setVisible(false);
         }
         if (this.handLoaderMask) {
            this.handLoaderMask.clear();
         }
      }
   }

   flipCard(card) {
      if (this.isBoardLocked || card.getData('isFlipped')) {
         return;
      }

      this.isBoardLocked = true;
      card.setData('isFlipped', true);
      this.flippedCards.push(card);

      const frontTexture = card.getData('frontTexture');
      const baseWidth = card.getData('baseWidth');
      const baseHeight = card.getData('baseHeight'); 

      const textureToFlip = (frontTexture === "CardEmpty") ? "CardEmpty" : frontTexture;
      
      const frontImg = this.textures.get(textureToFlip).getSourceImage();
      
      const scaleX = baseWidth / frontImg.width;
      const scaleY = baseHeight / frontImg.height;
      const newScale = Math.min(scaleX, scaleY);
      
      const baseScale = card.getData('baseScale');
      const finalScale = newScale * baseScale;

      this.tweens.add({
         targets: card,
         scaleX: 0,
         
         duration: this.FLIP_ANIM_DURATION / 2,
         ease: 'Linear',
         onComplete: () => {
            card.setTexture(textureToFlip); 

            card.scaleY = finalScale; 
            
            this.tweens.add({
               targets: card,
               scaleX: finalScale,
               duration: this.FLIP_ANIM_DURATION / 2,
               ease: 'Linear',
               onComplete: () => {
                  if (this.flippedCards.length === 2) {
                     this.time.delayedCall(500, this.checkForMatch, [], this);
                  } else {
                     this.isBoardLocked = false;
                  }
               }
            });
         }
      });
   }

   checkForMatch() {
      const [card1, card2] = this.flippedCards;
      const id1 = card1.getData('id');
      const id2 = card2.getData('id');

      const isMatch = (id1 === id2 && id1 !== 'CardEmpty'); 
      
      if (isMatch) {
         
         this.moves += 1;
         this.movesText.setText(`${this.moves}`);

         this.totalPairsFound++;
         
         this.disableCards();

         if (this.totalPairsFound === this.totalPairsInLevel) {
            this.time.delayedCall(500, () => this.endGame(true, "Level Selesai!"), [], this);
         }

      } else {
         
         this.health--;
         this.healthText.setText(`x${this.health}`);
         
         this.unflipCards(); 

         if (this.health <= 0) {
            this.time.delayedCall(500, () => this.endGame(false, "Nyawa Habis!"), [], this);
         }
      }
   }

   disableCards() {
      
      this.flippedCards.forEach(card => {
         card.setData('isMatched', true);

         this.tweens.add({
            targets: card,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
               card.destroy();
            }
         });
      });
      this.resetTurn();
   }

   unflipCards() {
      
      this.flippedCards.forEach(card => {
         card.setData('isFlipped', false);
         
         const baseScale = card.getData('baseScale'); 
         const backTexture = this.cardBacks[0]; 
         card.setData('backTexture', backTexture); 

         this.tweens.add({
            targets: card,
            scaleX: 0,
            
            duration: this.FLIP_ANIM_DURATION / 2,
            ease: 'Linear',
            onComplete: () => {
               card.setTexture(backTexture);
               
               card.scaleY = baseScale;

               this.tweens.add({
                  targets: card,
                  scaleX: baseScale,
                  duration: this.FLIP_ANIM_DURATION / 2,
                  ease: 'Linear',
                  onComplete: () => {
                     if (this.flippedCards.indexOf(card) === this.flippedCards.length - 1) {
                        this.resetTurn();
                     }
                  }
               });
            }
         });
      });
   }

   resetTurn() {
      this.flippedCards = [];
      this.isBoardLocked = false;
   }

   endGame(isWin, message) {
      if (!this.scene.isActive(this.scene.key)) {
         return;
      }
      if (this.isBoardLocked) {
         return;
      }
      
      this.isBoardLocked = true;
      if (this.timerEvent) {
         this.timerEvent.destroy();
      }
      
      if (this.pauseButton) {
         this.pauseButton.setVisible(false);
      }
      if (this.handCursor) {
         this.handCursor.setVisible(false);
         this.resetHover();
      }

      let stars = 0;
      if (isWin) {
         if (this.health >= 3) stars = 3;
         else if (this.health >= 2) stars = 2;
         else if (this.health >= 1) stars = 1;
      }

      const storageKey = `level_${this.currentLevel}_stars`;
      const currentSavedStars = this.registry.get(storageKey) || 0;

      if (stars > currentSavedStars) {
         this.registry.set(storageKey, stars);
      }
      
      // --- START ANALYTICS IMPLEMENTATION ---
      if (stars >= 1) {
         const muridId = this.registry.get('currentMuridId');
         const memoryScore = this.health * 25;
         const totalPlayTime = 90 - this.timerValue; 

         const analyticsReport = {
             id_profil: muridId,
             id_games_dashboard: 4,
             level: this.currentLevel,
             win: isWin,
             totalPlayTimeSeconds: totalPlayTime,
             metrics: {
                 memori: memoryScore.toString()
             },
             rawHeatmap: null
         };
         
         this.sendAnalyticsToAPI(analyticsReport);
      }
      // --- END ANALYTICS IMPLEMENTATION ---

      const { width, height } = this.sys.game.config;
      
      const bg = this.add.graphics({ x: 0, y: 0 })
         .fillStyle(0x000000, 0.7)
         .fillRect(0, 0, width, height)
         .setDepth(199) 
         .setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains); 
      
      const popupContainer = this.add.container(width / 2, height / 2).setDepth(200);

      const starKey = `star${stars}`;
      const starImage = this.add.image(165, 80, starKey).setScale(1.4);         
      popupContainer.add(starImage);       
      const homeBtn = this.add.image(0, 150, 'HomeButton').setInteractive();
      const retryBtn = this.add.image(0, 150, 'RetryButton').setInteractive();
      const cleanup = () => {
         popupContainer.destroy();
         bg.destroy();
         
         if (this.pauseButton) {
            this.pauseButton.setVisible(true); 
         }
      };

      homeBtn.on('pointerdown', () => {
         this.scene.start('home');
      });

      retryBtn.on('pointerdown', () => {
         cleanup();
         this.loadLevel(this.currentLevel); 
      });

      if (isWin && stars > 0 && this.currentLevel < 3) {
         homeBtn.x = -150;
         retryBtn.x = 0;
         const nextBtn = this.add.image(150, 150, 'nextLevel').setInteractive();
         
         nextBtn.on('pointerdown', () => {
            cleanup();
            this.loadLevel(this.currentLevel + 1);
         });
         
         popupContainer.add([homeBtn, retryBtn, nextBtn]);
      } else {
         homeBtn.x = -100;
         retryBtn.x = 100;
         popupContainer.add([homeBtn, retryBtn]);
      }
   }

   shuffle(array) {
      let currentIndex = array.length, randomIndex;
      while (currentIndex != 0) {
         randomIndex = Math.floor(Math.random() * currentIndex);
         currentIndex--;
         [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
      }
      return array;
   }

   // --- API FUNCTION ---
   async sendAnalyticsToAPI(data) {
      const apiEndpoint = `${API_BASE_URL}/v1/analytics/save`; 

      console.log('Mengirim data ke API:', data);

      try {
          const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
          });

          if (!response.ok) {
              throw new Error(`API Error: ${response.status}`);
          }

          const result = await response.json();
          console.log('API Sukses:', result);

      } catch (error) {
          console.error('API Gagal Nembak:', error);
      }
   }

   shutdown() {
      if (this.mediapipe) {
         this.mediapipe.destroy();
      }
   }
}