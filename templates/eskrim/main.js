import { Game } from "phaser";
import { Preloader } from "./scenes/preloadImage";

const config = {
    type: Phaser.AUTO,
    title: 'CloudsUp',
    description: '',
    parent: 'game-container',
    width: 1920,
    height: 1080,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Game,
        Preloader,
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);

let hands = null;
let camera = null;
let leftPinPos = { x: config.width / 4, y: config.height / 2 };
let rightPinPos = { x: config.width * 3 / 4, y: config.height / 2 };