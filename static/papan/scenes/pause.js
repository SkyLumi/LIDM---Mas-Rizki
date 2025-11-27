export class Pause extends Phaser.Scene {
    constructor() {
        super('Pause');
    }

    init(data) {
        this.gameSceneKey = data.gameSceneKey;
    }

    create() {
        const { width, height } = this.sys.game.config;
        const screenCenterX = width / 2;
        const screenCenterY = height / 2;

        // 1. Background Gelap Transparan
        this.add.rectangle(screenCenterX, screenCenterY, width, height, 0x000000, 0.5)
            .setInteractive();

        // 2. Panel Pause
        this.add.image(screenCenterX, screenCenterY, 'pausePanel')
            .setScale(1); 

        // 3. Container Tombol
        const buttonContainer = this.add.container(screenCenterX, screenCenterY + 30);

        // --- KONFIGURASI UKURAN & JARAK ---
        const btnScale = 0.75; // Diperkecil (tadi 1)
        const btnGap = 200;   
        const btnY = 20

        // --- TOMBOL 1: CONTINUE (Kiri) ---
        // Posisi X minus (-) untuk kiri
        const resumeButton = this.add.image(-btnGap, btnY, 'continue-btn')
            .setInteractive()
            .setScale(btnScale); 

        resumeButton.on('pointerdown', () => {
            this.scene.stop(); 
            this.scene.resume(this.gameSceneKey); 
        });

        // --- TOMBOL 2: HOME (Tengah) ---
        // Posisi X 0 untuk tengah
        const homeButton = this.add.image(0, btnY, 'home-btn')
            .setInteractive()
            .setScale(btnScale);

        homeButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.stop(this.gameSceneKey);
            this.scene.start('MainMenu'); 
        });

        // --- TOMBOL 3: RETRY (Kanan) ---
        // Posisi X positif (+) untuk kanan
        const retryButton = this.add.image(btnGap, btnY , 'retry-btn')
            .setInteractive()
            .setScale(btnScale);

        retryButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.stop(this.gameSceneKey);
            this.scene.start(this.gameSceneKey); 
        });

        // Masukkan semua tombol ke dalam container
        buttonContainer.add([resumeButton, homeButton, retryButton]);
    }
}