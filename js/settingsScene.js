export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
        this.buttons = [];
    }

    create() {
        this.titleText = this.add
            .text(640, 100, 'Settings', {
                fontSize: '96px',
                fill: '#fff',
                fontFamily: 'MainText',
            })
            .setOrigin(0.5);

        this.musicText = this.add
            .text(540, 300, 'Music Volume', {
                fontSize: '36px',
                fill: '#fff',
                fontFamily: 'MainText',
            })
            .setOrigin(0.5);

        this.volumeText = this.add
            .text(790, 300, '50%', {
                fontSize: '36px',
                fill: '#fff',
                fontFamily: 'MainText',
            })
            .setOrigin(0.5);

        this.createButton('-', 320, 300, () => this.adjustVolume(-10));
        this.createButton('+', 880, 300, () => this.adjustVolume(10));

        this.createButton('Back', 640, 600, () =>
            this.scene.start('MenuScene')
        );
    }

    createButton(text, x, y, callback) {
        const button = this.add
            .text(x, y, text, {
                fontSize: '48px',
                fill: '#fff',
                fontFamily: 'MainText',
            })
            .setOrigin(0.5)
            .setInteractive();

        this.buttons.push(button);

        button.on('pointerdown', callback);
        button.on('pointerover', () => button.setStyle({ fill: '#ff0' }));
        button.on('pointerout', () => button.setStyle({ fill: '#fff' }));
    }

    adjustVolume(change) {
        const currentVolume = parseInt(this.volumeText.text);
        let newVolume = Phaser.Math.Clamp(currentVolume + change, 0, 100);
        this.volumeText.setText(`${newVolume}%`);

        const music = this.sound
            .getAllPlaying()
            .find((sound) => sound.key === 'menuMusic');
        if (music) {
            music.setVolume(newVolume / 100);
        }
    }
}
