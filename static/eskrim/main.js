import { Game } from "./scenes/game.js";
import { Preloader } from "./scenes/preloader.js";
import { MainMenu } from "./scenes/mainMenu.js";
import { LevelMenu } from "./scenes/levelMenu.js";
import { Result } from "./scenes/result.js";

const config = {
    type: Phaser.AUTO,
    title: 'CloudsUp',
    description: '',
    parent: 'game-container',
    width: 1920,
    height: 1080,
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

new Phaser.Game(config);