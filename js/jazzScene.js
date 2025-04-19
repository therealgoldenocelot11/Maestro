import Character from './character.js';

export default class JazzScene extends Phaser.Scene {
    constructor() {
        super({ key: 'JazzScene' });
        this.characters = [];
    }

    preload() {
        this.loadAssets();
    }

    create() {
        this.setupBackground();
        this.createTitle();
        this.createAnimations();
        this.createCharacters();
        this.createUIButtons();
    }

    loadAssets() {
        this.load.image('theFlam', 'assets/images/theflamingo.png');

        const soundEffects = [
            'drum',
            'bass',
            'piano',
            'elec_piano',
            'trom',
            'sax',
        ];
        soundEffects.forEach((sound) =>
            this.load.audio(sound, `assets/sound effects/jazz_${sound}.ogg`)
        );

        const characters = [
            'drummer',
            'bassist',
            'elec_piano',
            'piano',
            'sax',
            'trom',
        ];
        characters.forEach((name) => {
            this.load.spritesheet(
                name,
                `assets/sprites/${name}_idle_sheet.png`,
                { frameWidth: 325, frameHeight: 325, endFrame: 2 }
            );
            this.load.spritesheet(
                `${name}_playing`,
                `assets/sprites/${name}_playing_sheet.png`,
                { frameWidth: 325, frameHeight: 325, endFrame: 2 }
            );
        });
    }

    setupBackground() {
        this.bg = this.add
            .image(0, 0, 'theFlam')
            .setOrigin(0, 0)
            .setDisplaySize(1280, 720);
    }

    createTitle() {
        this.title = this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 200,
                'Jazz Scene',
                {
                    fontSize: '96px',
                    fill: '#fff',
                    stroke: '#000',
                    strokeThickness: 8,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5 },
                }
            )
            .setOrigin(0.5);
    }

    createAnimations() {
        const instruments = [
            'drummer',
            'bassist',
            'elec_piano',
            'piano',
            'sax',
            'trom',
        ];
        instruments.forEach((name) => {
            this.anims.create({
                key: `${name}_idle`,
                frames: this.anims.generateFrameNumbers(name, {
                    start: 0,
                    end: 1,
                }),
                frameRate: 2,
                repeat: -1,
            });
            this.anims.create({
                key: `${name}_playing`,
                frames: this.anims.generateFrameNumbers(`${name}_playing`, {
                    start: 0,
                    end: 1,
                }),
                frameRate: 2,
                repeat: -1,
            });
        });
    }

    createCharacters() {
        const trackLength = 8;
        const characterData = [
            { x: 110, name: 'drummer', sound: 'drum' },
            { x: 315, name: 'bassist', sound: 'bass' },
            { x: 520, name: 'elec_piano', sound: 'elec_piano' },
            { x: 745, name: 'piano', sound: 'piano' },
            { x: 970, name: 'sax', sound: 'sax' },
            { x: 1195, name: 'trom', sound: 'trom' },
        ];

        characterData.forEach(({ x, name, sound }) => {
            const character = new Character(
                this,
                x,
                480,
                name,
                sound,
                `${name}_idle`,
                `${name}_playing`,
                trackLength
            );
            character.setDisplaySize(225, 225);
            this.characters.push(character);
        });
    }

    createUIButtons() {
        const buttonLabels = ['Song 1', 'Song 2', 'Next Genre'];
        const buttonWidth = 400;
        const buttonHeight = 80;
        const spacing = 20;
        const totalWidth =
            buttonWidth * buttonLabels.length +
            spacing * (buttonLabels.length - 1);
        const startX = this.cameras.main.width / 2 - totalWidth / 2;
        const y = 620;

        const barY = 592;
        const barHeight = 130;

        this.add
            .rectangle(
                this.cameras.main.centerX,
                barY + barHeight / 2,
                this.cameras.main.width,
                barHeight,
                0x111111
            )
            .setOrigin(0.5);

        this.buttons = [];

        buttonLabels.forEach((label, i) => {
            const x = startX + i * (buttonWidth + spacing);

            const button = this.add
                .rectangle(x, y, buttonWidth, buttonHeight, 0x333333)
                .setOrigin(0, 0)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => button.setFillStyle(0x555555))
                .on('pointerout', () => button.setFillStyle(0x333333))
                .on('pointerdown', () => this.handleButtonClick(label));

            const text = this.add
                .text(x + buttonWidth / 2, y + buttonHeight / 2, label, {
                    fontSize: '20px',
                    fill: '#ffffff',
                })
                .setOrigin(0.5);

            this.buttons.push(button);
            this.buttons.push(text);
        });
    }

    handleButtonClick(label) {
        if (label === 'Song 1') {
            console.log('Song 1 Clicked');
        } else if (label === 'Song 2') {
            console.log('Song 2 Clicked');
        } else if (label === 'Next Genre') {
            this.switchToSubway();
        }
    }

    async switchToSubway() {
        console.log('Loading SubwayScene...');
        const module = await import('./subwayScene.js');
        const SubwayScene = module.default;

        if (!this.scene.get('SubwayScene')) {
            this.scene.add('SubwayScene', SubwayScene);
        }

        this.scene.start('SubwayScene');
    }
}
