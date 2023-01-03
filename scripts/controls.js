MyGame.screens['controls'] = (function(game) {
    'use strict';

    // Set button names from keyBindings, add listeners that can change keyBindings
    function initialize() {

        document.getElementById('upgrade-tower-button').innerText += game.keyBindings.keys.upgrade;
        document.getElementById('sell-tower-button').innerText += game.keyBindings.keys.sell;
        document.getElementById('start-next-level-button').innerText += game.keyBindings.keys.nextWave;
        document.getElementById('mute-music-button').innerText += game.keyBindings.keys.muteMusic;

        document.getElementById('upgrade-tower-button').addEventListener(
            'click',
            function() {
                window.addEventListener('keydown', setUpgrade);
            }
        )

        document.getElementById('sell-tower-button').addEventListener(
            'click',
            function() {
                window.addEventListener('keydown', setSell);
            }
        )

        document.getElementById('start-next-level-button').addEventListener(
            'click',
            function() {
                window.addEventListener('keydown', setNextWave);
            }
        )

        document.getElementById('mute-music-button').addEventListener(
            'click',
            function() {
                window.addEventListener('keydown', setMute);
            }
        )

        document.getElementById('controls-back-button').addEventListener(
            'click',
            function() {game.showScreen('main-menu');});
    }

    function setUpgrade(e) {
        game.keyBindings.keys.upgrade = e.key;
        localStorage.setItem('upgrade', e.key);
        document.getElementById('upgrade-tower-button').innerText = "Upgrade Tower - " + e.key;
        window.removeEventListener('keydown', setUpgrade);
    }

    function setSell(e) {
        game.keyBindings.keys.sell = e.key;
        localStorage.setItem('sell', e.key);
        document.getElementById('sell-tower-button').innerText = "Sell Tower - " + e.key;
        window.removeEventListener('keydown', setSell);
    }

    function setNextWave(e) {
        game.keyBindings.keys.nextWave = e.key;
        localStorage.setItem('nextWave', e.key);
        document.getElementById('start-next-level-button').innerText = "Start Next Level - " + e.key;
        window.removeEventListener('keydown', setNextWave);
    }

    // Sets mute music to pressed key, persists to browser
    function setMute(e) {
        game.keyBindings.keys.muteMusic = e.key;
        localStorage.setItem('muteMusic', e.key);
        document.getElementById('mute-music-button').innerText = "Mute Music - " + e.key;
        window.removeEventListener('keydown', setMute);
    }

    function run() {}

    return {
        initialize : initialize,
        run : run
    };
}(MyGame.main));