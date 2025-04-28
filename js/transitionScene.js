import Phaser from 'phaser';

export default class TransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TransitionScene' });
    }

    preload() {
        this.load.spritesheet('shoot', 'assets/sprites/shoot-sheet.png', {
            frameWidth: 852,
            frameHeight: 480,
        });
        this.load.spritesheet('die', 'assets/sprites/dying-sheet.png', {
            frameWidth: 852,
            frameHeight: 480,
        });

        this.load.audio('gunshot', 'assets/sound effects/gunshot.wav');
        this.load.audio('gunshot2', 'assets/sound effects/gunshot.mp3');
        this.load.audio('beg', 'assets/sound effects/beg.wav');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        const introText = this.add
            .text(
                this.scale.width / 2,
                this.scale.height / 2,
                "Some people aren't fit to be a Maestro.",
                {
                    fontSize: '32px',
                    color: '#ffffff',
                    fontFamily: 'MainText',
                }
            )
            .setOrigin(0.5);

        const begSound = this.sound.add('beg', { volume: 0.3 });
        begSound.play();

        begSound.once('complete', () => {
            introText.destroy();

            this.anims.create({
                key: 'shootAnim',
                frames: this.anims.generateFrameNumbers('shoot', {
                    start: 0,
                    end: 44,
                }),
                frameRate: 12,
                repeat: 0,
            });

            this.anims.create({
                key: 'dieAnim',
                frames: this.anims.generateFrameNumbers('die', {
                    start: 0,
                    end: 71,
                }),
                frameRate: 12,
                repeat: 0,
            });

            this.shootSprite = this.add
                .sprite(this.scale.width / 2, this.scale.height / 2, 'shoot')
                .setOrigin(0.5)
                .setScale(1)
                .play('shootAnim');

            this.time.delayedCall(2700, () => {
                for (let i = 0; i < 4; i++) {
                    this.time.delayedCall(i * 300, () => {
                        this.sound.play('gunshot2');
                    });
                }
            });

            this.shootSprite.on('animationcomplete', () => {
                this.shootSprite.destroy();

                this.dieSprite = this.add
                    .sprite(this.scale.width / 2, this.scale.height / 2, 'die')
                    .setOrigin(0.5)
                    .setScale(1)
                    .play('dieAnim');

                this.time.delayedCall(600, () => {
                    for (let i = 0; i < 4; i++) {
                        this.time.delayedCall(i * 300, () => {
                            this.sound.play('gunshot');
                        });
                    }
                });

                this.dieSprite.on('animationcomplete', () => {
                    this.dieSprite.destroy();
                    this.scene.stop('TransitionScene');
                    this.scene.start('CreditsScene');
                });
            });
        });
    }
}
