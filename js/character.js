export default class Character extends Phaser.GameObjects.Sprite {
    constructor(
        scene,
        x,
        y,
        texture,
        soundKey,
        idleAnimKey,
        playingAnimKey,
        trackLength
    ) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.setInteractive();
        this.soundKey = soundKey;
        this.isPlaying = false;

        this.idleAnimKey = idleAnimKey;
        this.playingAnimKey = playingAnimKey;
        this.trackLength = trackLength;

        this.on('pointerdown', this.togglePlay, this);

        this.setAlpha(0.5);
        this.anims.play(this.idleAnimKey);
    }

    togglePlay() {
        if (this.isPlaying) {
            this.scene.sound.stopByKey(this.soundKey);
            this.setAlpha(0.5);
            this.anims.play(this.idleAnimKey);
            this.isPlaying = false;
    
            this.scene.armedCharacters = this.scene.armedCharacters.filter(c => c !== this);
            this.scene.stopLoopTimerIfEmpty();
            return;
        }
    
        const someonePlaying = [...this.scene.characters, ...this.scene.extraCharacters].some(c => c.isPlaying);
    
        if (!someonePlaying) {
            this.startPlaying();
        
            this.scene.currentLoopIndex = 0;
            this.scene.updateLoopMeter();
            this.scene.startLoopTimer();
            return;
        }        
    
        if (!this.scene.armedCharacters.includes(this)) {
            this.scene.armedCharacters.push(this);
            this.setAlpha(0.75);
        }
    }    

    startPlaying() {
        this.scene.sound.play(this.soundKey, { loop: true });
        this.setAlpha(1);
        this.anims.play(this.playingAnimKey);
        this.isPlaying = true;
    }    
}
