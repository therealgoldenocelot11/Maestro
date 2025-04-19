export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.menuMusic = null;
        this.buttons = [];
    }

    preload() {
        this.load.image('menuBackground', 'assets/images/mainbg.png');
        this.load.audio('menuMusic', 'assets/music/testMain.ogg');
        this.load.audio('marStart', 'assets/sound effects/marStart.ogg');
    }

    create() {
        this.bg = this.add.image(0, 0, 'menuBackground').setOrigin(0, 0);
        this.bg.setDisplaySize(1280, 720);

        if (!this.menuMusic) {
            this.menuMusic = this.sound.add('menuMusic', {
                loop: true,
                volume: 0.5,
            });
            this.menuMusic.play();
        }

        this.title = this.add
            .text(640, 150, 'Maestro', {
                fontSize: '96px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
            })
            .setOrigin(0.5);

        this.title.setShadow(2, 2, '#000000', 5);
        this.title.setStroke('#000000', 8);

        this.createButton('Play', 0, 100, () => this.playMusicAndStartGame());
        this.createButton('Settings', 0, 180, () =>
            this.scene.start('SettingsScene')
        );
        this.createButton('Credits', 0, 260, () =>
            this.scene.start('CreditsScene')
        );
    }

    createButton(text, xOffset, yOffset, callback) {
        const button = this.add
            .text(640 + xOffset, 300 + yOffset, text, {
                fontSize: '48px',
                fill: '#fff',
            })
            .setOrigin(0.5)
            .setInteractive();

        this.buttons.push(button);

        button.on('pointerdown', callback);
        button.on('pointerover', () => button.setStyle({ fill: '#ff0' }));
        button.on('pointerout', () => button.setStyle({ fill: '#fff' }));

        button.setShadow(2, 2, '#000000', 5);
        button.setStroke('#000000', 8);
    }

    playMusicAndStartGame() {
        this.menuMusic.stop();

        this.marStart = this.sound.add('marStart', {
            loop: false,
            volume: 0.5,
        });
        this.marStart.play();

        this.time.delayedCall(
            this.marStart.duration * 1000,
            () => {
                this.transitionToJazzScene();
            },
            [],
            this
        );
    }

    transitionToJazzScene() {
        this.tweens.add({
            targets: [...this.buttons, this.bg, this.title],
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    this.scene.start('JazzScene');
                });
            },
        });
    }
}
