import { Game } from "./scenes/game.js"
import { LevelMenu } from "./scenes/levelMenu.js"
import { MainMenu } from "./scenes/mainMenu.js"
import { Preloader } from "./scenes/preloader.js"
import { Result } from "./scenes/result.js"

const config = {
   type: Phaser.AUTO,
   title: 'CloudsUp',
   description: '',
   parent: 'game-container',
   width: 1920,
   height: 1080,
   transparent: true,
   backgroundColor: '#000000',
   pixelArt: false,
   physics: {
      default: 'arcade',
      arcade: {
         gravity: { y: 0 },
      }
   },
   scene: [
      Preloader,
      MainMenu,
      LevelMenu,
      Game,
      Result,
   ],
   scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
   },
}

const game = new Phaser.Game(config)

const video = document.getElementById('webcam')

function matchVideoToCanvas() {
    
    const canvas = document.querySelector('#game-container canvas')
    
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    
    video.style.position = 'fixed'
    video.style.top = `${rect.top}px`
    video.style.left = `${rect.left}px`
    video.style.width = `${rect.width}px`
    video.style.height = `${rect.height}px`
    
    video.style.objectFit = 'cover'
    video.style.zIndex = -1
    video.style.visibility = 'visible'
    video.style.transform = 'scaleX(-1)'
}

game.events.on('ready', () => {
    
    matchVideoToCanvas();
    
    game.scale.on('resize', matchVideoToCanvas);
    
    document.addEventListener('fullscreenchange', () => {
        console.log('F11 ATAU FULLSCREEN API TERPENCET!');
        setTimeout(matchVideoToCanvas, 100);
    })
})