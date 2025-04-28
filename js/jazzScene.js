import Character from './character.js';

export default class JazzScene extends Phaser.Scene {
    constructor() {
        super({ key: 'JazzScene' });
        this.characters = [];
        this.extraCharacters = [];
        this.currentLoopIndex = 0;
    }

    preload() {
        this.loadAssets();
    }

    create() {
        this.loopDuration = 8000;
        this.armedCharacters = [];
        this.loopTimer = null;

        this.setupBackground();
        this.createTitle();
        this.createAnimations();
        this.createCharacters();
        this.createExtraCharacters();
        this.createUIButtons();
        this.createCurtain();
        this.createLoopMeter();
    }

    createLoopMeter() {
        this.loopLights = [];

        const total = 8;
        const spacing = 120;
        const startX = this.cameras.main.centerX - (spacing * (total - 1)) / 2;
        const y = 40;

        for (let i = 0; i < total; i++) {
            const light = this.add
                .image(startX + i * spacing, y, 'loop_light')
                .setAlpha(0.1)
                .setScale(0.1)
                .setDepth(10);
            this.loopLights.push(light);
        }

        this.currentLoopIndex = 0;
    }

    updateLoopMeter() {
        this.loopLights.forEach((light, i) => {
            light.setAlpha(i === this.currentLoopIndex ? 0.5 : 0.1);
        });
    }

    startLoopTimer() {
        if (this.loopTimer) return;

        const beatInterval = this.loopDuration / 8;

        this.loopTimer = this.time.addEvent({
            delay: beatInterval,
            loop: true,
            callback: () => {
                this.currentLoopIndex = (this.currentLoopIndex + 1) % 8;
                this.updateLoopMeter();

                if (this.currentLoopIndex === 0) {
                    this.startArmedCharacters();
                }
            },
        });
    }

    stopLoopTimerIfEmpty() {
        const anyPlaying = [...this.characters, ...this.extraCharacters].some(
            (c) => c.isPlaying
        );
        if (!anyPlaying) {
            this.loopTimer?.remove();
            this.loopTimer = null;

            this.armedCharacters = [];
            this.currentLoopIndex = 0;

            this.loopLights.forEach((light) => light.setAlpha(0.1));
        }
    }

    startArmedCharacters() {
        this.armedCharacters.forEach((char) => {
            if (!char.isPlaying) {
                char.startPlaying();
            }
        });
        this.armedCharacters = [];
    }

    createCurtain() {
        this.curtain = this.add
            .image(this.cameras.main.centerX, -720, 'curtain')
            .setOrigin(0.5, 0.5)
            .setDepth(1000);
    }

    loadAssets() {
        this.load.image('theFlam', 'assets/images/theflamingo.png');
        this.load.image('curtain', 'assets/images/curtain.png');
        this.load.image('loop_light', 'assets/images/loop_light.png');
        this.load.audio('glitch', 'assets/sound effects/glitch.wav');

        const extraCharacters = [
            { name: 'jazz_2_bass', sprite: 'bassist' },
            { name: 'jazz_2_celeste', sprite: 'bell' },
            { name: 'jazz_2_drums', sprite: 'drummer' },
            { name: 'jazz_2_organ', sprite: 'piano' },
            { name: 'jazz_2_sax', sprite: 'sax' },
            { name: 'jazz_2_trump', sprite: 'trump' },
        ];

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

        extraCharacters.forEach(({ name }) =>
            this.load.audio(name, `assets/sound effects/${name}.ogg`)
        );

        const characters = [
            'drummer',
            'bassist',
            'elec_piano',
            'piano',
            'sax',
            'trom',
            'bell',
            'trump',
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
                'The Flamingo Club',
                {
                    fontFamily: 'MainText',
                    fontSize: '80px',
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
            'bell',
            'trump',
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

    createExtraCharacters() {
        const startX = 110;
        const spacing = 205;

        const data = [
            { name: 'jazz_2_drums', sprite: 'drummer' },
            { name: 'jazz_2_bass', sprite: 'bassist' },
            { name: 'jazz_2_celeste', sprite: 'bell' },
            { name: 'jazz_2_organ', sprite: 'piano' },
            { name: 'jazz_2_sax', sprite: 'sax' },
            { name: 'jazz_2_trump', sprite: 'trump' },
        ];

        data.forEach(({ name, sprite }, i) => {
            const character = new Character(
                this,
                startX + i * spacing,
                480,
                sprite,
                name,
                `${sprite}_idle`,
                `${sprite}_playing`,
                8
            );
            character.setDisplaySize(225, 225);
            character.setVisible(false);
            this.extraCharacters.push(character);
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
            this.playCurtainTransition(() => {
                this.stopAllCharacters();
                this.cleanupTimers();
                this.extraCharacters.forEach((c) => c.setVisible(false));
                this.characters.forEach((c) => c.setVisible(true));
            });
        } else if (label === 'Song 2') {
            console.log('Song 2 Clicked');
            this.playCurtainTransition(() => {
                this.stopAllCharacters();
                this.cleanupTimers();
                this.characters.forEach((c) => c.setVisible(false));
                this.extraCharacters.forEach((c) => c.setVisible(true));
            });
        } else if (label === 'Next Genre') {
            this.switchToSubway();
        }
    }

    async switchToSubway() {
        this.sound.play('glitch');

        this.input.enabled = false;
        this.stopAllCharacters();
        this.cleanupTimers();

        this.cameras.main.fadeOut(1, 0, 0, 0);

        this.time.delayedCall(1000, async () => {
            this.cameras.main.resetFX();
            this.cameras.main.setBackgroundColor('#000000');

            this.add
                .rectangle(
                    0,
                    0,
                    this.scale.width * 2,
                    this.scale.height * 2,
                    0x000000
                )
                .setOrigin(0)
                .setDepth(9998);

            this.add
                .text(
                    this.scale.width / 2,
                    this.scale.height / 2,
                    'Find the gun.',
                    {
                        fontFamily: 'MainText',
                        fontSize: '48px',
                        color: '#ffffff',
                    }
                )
                .setOrigin(0.5)
                .setDepth(10000);

            this.time.delayedCall(3000, async () => {
                const module = await import('./subwayScene.js');
                const SubwayScene = module.default;

                if (!this.scene.get('SubwayScene')) {
                    this.scene.add('SubwayScene', SubwayScene);
                }

                this.scene.start('SubwayScene');
            });
        });
    }

    stopAllCharacters() {
        [...this.characters, ...this.extraCharacters].forEach((c) => {
            if (c.isPlaying) {
                this.sound.stopByKey(c.soundKey);
                c.setAlpha(0.5);
                c.anims.play(c.idleAnimKey);
                c.isPlaying = false;
            }
        });
    }

    playCurtainTransition(switchCallback) {
        this.currentBeat = 0;
        [...this.characters, ...this.extraCharacters].forEach((c) =>
            c.updateBeat?.(this.currentBeat)
        );

        this.tweens.add({
            targets: this.curtain,
            y: 360,
            duration: 500,
            ease: 'Sine.easeIn',
            onComplete: () => {
                switchCallback();
                this.time.delayedCall(400, () => {
                    this.tweens.add({
                        targets: this.curtain,
                        y: -720,
                        duration: 500,
                        ease: 'Sine.easeOut',
                    });
                });
            },
        });
    }

    cleanupTimers() {
        if (this.loopTimer) {
            this.loopTimer.remove();
            this.loopTimer = null;
        }

        this.armedCharacters = [];
        this.currentLoopIndex = 0;

        if (this.loopLights) {
            this.loopLights.forEach((l) => l.setAlpha(0.1));
        }
    }
}
