import MediaPipeManager from "../../eskrim/scenes/mediapipeManager.js";

export class Game extends Phaser.Scene {
   constructor() {
      super('Game')
   }

   create() {
      const { width, height } = this.sys.game.config;

      let screenCenterX = width / 2;
      let screenCenterY = height / 2;

      this.videoElement = document.getElementById('webcam')
      this.mediapipe = new MediaPipeManager(this.videoElement, this.onMediaPipeResults.bind(this))
   }

   onMediaPipeResults(results) {

      if (!this.sys || !this.sys.game) return
      const { width, height } = this.sys.game.config

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
         if (results.multiHandLandmarks.length === 2) {
               const wrist1 = results.multiHandLandmarks[0][0]
               const wrist2 = results.multiHandLandmarks[1][0]
               this.targetConePos.x = ((wrist1.x + wrist2.x) / 2) * width
               this.targetConePos.y = (Math.min(wrist1.y, wrist2.y) * height) - 100
         }
      }
      
   }

   shutdown() {
      this.mediapipe.destroy()
   }
}