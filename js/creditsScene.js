export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreditsScene' });
    }

    preload() {
        this.load.audio('creditsMusic', 'assets/music/MM.mp3');
    }

    create() {
        this.sound.stopAll();

        this.music = this.sound.add('creditsMusic', { loop: true, volume: 0.5 });
        this.music.play();

        this.add.rectangle(0, 0, this.scale.width * 2, this.scale.height * 2, 0x000000)
            .setOrigin(0)
            .setDepth(0);

        this.add.text(this.scale.width / 2, 100, 'Credits', {
            fontFamily: 'MainText',
            fontSize: '60px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        const creditsLines = [
            'Game Design: Golden',
            'Programming: Golden',
            'Art: Golden',
            'Music: Golden',
            'Opening Narrator: Linus',
            'Beginning Voice: Mar',
            'Special Thanks: My girlfriend, for "The Flamingo"'
        ];

        const startY = 200;
        const spacing = 50;

        creditsLines.forEach((line, index) => {
            this.add.text(this.scale.width / 2, startY + index * spacing, line, {
                fontFamily: 'MainText',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        });

        const returnY = startY + creditsLines.length * spacing + 100;

        const returnText = this.add.text(this.scale.width / 2, returnY, 'Return to Main Menu', {
            fontFamily: 'MainText',
            fontSize: '28px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => returnText.setColor('#ff0'))
          .on('pointerout', () => returnText.setColor('#ffffff'))
          .on('pointerdown', () => {
            this.music.stop();
            window.close();
        })
    }
}
