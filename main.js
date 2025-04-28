import { enable3d, Canvas } from '@enable3d/phaser-extension';

import MenuScene from './js/menuScene.js';
import SettingsScene from './js/settingsScene.js';
import JazzScene from './js/jazzScene.js';
import TransitionScene from './js/transitionScene.js';

window.addEventListener('load', () => {
    const video = document.getElementById('introVideo');
    const clickOverlay = document.getElementById('clickToStart');
    const skipButton = document.getElementById('skipButton');
    const volumeControl = document.getElementById('volumeControl');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeText = document.getElementById('volumeText');

    clickOverlay.addEventListener('click', () => {
        clickOverlay.style.display = 'none';
        video.style.display = 'block';
        skipButton.style.display = 'block';
        volumeControl.style.display = 'flex';
        video.volume = volumeSlider.value;
        video.play();
    });

    volumeSlider.addEventListener('input', (event) => {
        const value = event.target.value;
        video.volume = value;
        volumeText.textContent = `${Math.round(value * 100)}%`;
    });

    function createFadeOverlay() {
        const fadeOverlay = document.createElement('div');
        fadeOverlay.id = 'fadeOverlay';
        Object.assign(fadeOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            opacity: '1',
            transition: 'opacity 1.5s ease',
            zIndex: '9999',
            pointerEvents: 'none',
        });
        document.body.appendChild(fadeOverlay);
        return fadeOverlay;
    }

    const fadeToGame = () => {
        video.pause();
        video.style.display = 'none';
        skipButton.style.display = 'none';
        volumeControl.style.display = 'none';

        const fadeOverlay = createFadeOverlay();

        startGame();

        setTimeout(() => {
            fadeOverlay.style.opacity = '0';
        }, 500);

        setTimeout(() => {
            fadeOverlay.remove();
        }, 2000);
    };

    video.addEventListener('ended', fadeToGame);
    skipButton.addEventListener('click', fadeToGame);
});

function startGame() {
    const config = {
        type: Phaser.WEBGL,
        transparent: true,
        width: 1280,
        height: 720,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1280,
            height: 720,
        },
        scene: [MenuScene, SettingsScene, JazzScene, TransitionScene],
        ...Canvas(),
    };

    console.log('Starting Game');

    enable3d(() => new Phaser.Game(config)).withPhysics('assets/ammo');
}
