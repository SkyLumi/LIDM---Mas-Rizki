class MediaPipeManager {
  constructor(videoElement, onResultsCallback) {
    if (MediaPipeManager._instance) {
        console.log("[MediaPipe] Sudah ada instance aktif, pakai ulang.");
        const inst = MediaPipeManager._instance;

        inst.videoElement = videoElement;
        inst.hands.onResults(onResultsCallback);

        console.log("[MediaPipe] Kamera mati, nyalakan ulang...");
        inst.camera.start();

      return inst;
    }

    console.log("[MediaPipe] Membuat instance baru...");
    this.videoElement = videoElement;

    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true
    });

    this.hands.onResults(onResultsCallback);

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement });
      },
      width: 640,
      height: 480,
      facingMode: 'user',
    });

    this.camera.start();
    MediaPipeManager._instance = this;
  }

  static getInstance() {
    return MediaPipeManager._instance;
  }

  destroy() {
    if (this.camera) {
      this.camera.stop();
    }
  }
}

export default MediaPipeManager;
