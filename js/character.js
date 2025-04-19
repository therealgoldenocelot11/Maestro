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
        const playingCharacters = this.scene.characters.filter(
            (c) => c.isPlaying
        );

        if (this.isPlaying) {
            this.scene.sound.stopByKey(this.soundKey);
            this.setAlpha(0.5);
            this.anims.play(this.idleAnimKey);
            this.isPlaying = false;
            return;
        }

        if (playingCharacters.length === 0) {
            this.startPlaying();
        } else {
            const firstPlayingCharacter = playingCharacters[0];
            const firstTrack = this.scene.sound.get(
                firstPlayingCharacter.soundKey
            );

            if (firstTrack) {
                const trackDuration = firstTrack.duration;
                const currentTime = firstTrack.seek || 0;
                const timeRemaining = (trackDuration - currentTime) * 1000;

                this.scene.time.delayedCall(timeRemaining, () => {
                    if (!this.isPlaying) {
                        this.startPlaying();
                    }
                });
            } else {
                this.startPlaying();
            }
        }
    }

    startPlaying() {
        this.scene.sound.play(this.soundKey, { loop: true });
        this.setAlpha(1);
        this.anims.play(this.playingAnimKey);
        this.isPlaying = true;
    }
}
