class FaceMeshManager {
  constructor(videoElement, onResultsCallback) {
    // 1. Cek Instance Lama (Singleton)
    if (FaceMeshManager._instance) {
      const inst = FaceMeshManager._instance;
      inst.videoElement = videoElement;
      
      // Update callback agar nyambung ke scene baru
      inst.faceMesh.onResults(onResultsCallback); 
      
      console.log("[FaceMesh] Restarting Camera...");
      inst.camera.start();
      return inst;
    }

    // 2. Safety Check
    if (!window.FaceMesh || !window.Camera) {
        console.error("CRITICAL: Library FaceMesh tidak ditemukan di window!");
        return;
    }

    this.videoElement = videoElement;

    // 3. Init FaceMesh
    this.faceMesh = new window.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      // [PENTING] Ubah ke FALSE agar deteksi jauh lebih cepat/ringan
      refineLandmarks: false, 
      minDetectionConfidence: 0.5, // Turunkan dikit biar lebih gampang kedetek
      minTrackingConfidence: 0.5
    });

    this.faceMesh.onResults(onResultsCallback);

    // 4. Init Camera
    this.camera = new window.Camera(videoElement, {
      onFrame: async () => {
        if (this.faceMesh) {
            await this.faceMesh.send({ image: videoElement });
        }
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
      // Stop kamera fisik untuk menghemat resource
      this.camera.stop();
    }
  }
}

export default FaceMeshManager;