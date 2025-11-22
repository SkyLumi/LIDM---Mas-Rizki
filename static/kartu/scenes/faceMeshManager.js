class FaceMeshManager {
  constructor(videoElement, onResultsCallback) {
    // --- 1. LOGIKA SINGLETON ---
    if (FaceMeshManager._instance) {
      console.log("[FaceMesh] Sudah ada instance aktif, pakai ulang.");
      const inst = FaceMeshManager._instance;

      inst.videoElement = videoElement;
      inst.faceMesh.onResults(onResultsCallback); 

      console.log("[FaceMesh] Kamera mati, nyalakan ulang...");
      inst.camera.start();

      return inst;
    }

    // --- 2. INISIALISASI BARU ---
    console.log("[FaceMesh] Membuat instance baru...");
    this.videoElement = videoElement;

    this.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // false = lebih ringan
      minDetectionConfidence: 0.95,
      minTrackingConfidence: 0.95
    });

    this.faceMesh.onResults(onResultsCallback);

    // --- 3. KAMERA (SAMA PERSIS) ---
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.faceMesh.send({ image: videoElement });
      },
      width: 640,
      height: 480,
      facingMode: 'user',
    });

    this.camera.start();
    FaceMeshManager._instance = this;
  }

  static getInstance() {
    return FaceMeshManager._instance;
  }

  stop() {
    if (this.camera) {
      console.log("[FaceMesh] Kamera dihentikan.");
      this.camera.stop();
    }
  }
}

export default FaceMeshManager;