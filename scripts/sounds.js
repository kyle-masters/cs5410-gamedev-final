MyGame.sounds = (function(assets) {
    'use strict';

    let that = {};
    let soundPlayedLast = {
        'audio/build': 0,
        'audio/bombFire': 0,
        'audio/guidedFire': 0,
        'audio/projectileFire': 0,
        'audio/mixedFire': 0,
        'audio/upgrade1': 0,
        'audio/upgrade2': 0,
        'audio/explosion': 0,
        'audio/sell': 0,
        'audio/death': 0,
        'audio/music': 0,
    };

    function initialize() {

        function loadSounds() {
            that['audio/build'] = assets['buildSound'];
            that['audio/bombFire'] = assets['bombFireSound'];
            that['audio/death'] = assets['deathSound'];
            that['audio/explosion'] = assets['explodeSound'];
            that['audio/guidedFire'] = assets['guidedFireSound'];
            that['audio/projectileFire'] = assets['projectileFireSound'];
            that['audio/mixedFire'] = assets['mixedFireSound'];
            that['audio/sell'] = assets['sellSound'];
            that['audio/upgrade1'] = assets['upgrade1Sound'];
            that['audio/upgrade2'] = assets['upgrade2Sound'];
            that['audio/music'] = assets['music'];
            that['audio/music'].loop = true;
        }

        loadSounds();
    }

    function pauseSound(whichSound) {
        that[whichSound].pause();
    }

    function playSound(whichSound, time) {
        if (time - soundPlayedLast[whichSound] >= 100) {
            soundPlayedLast[whichSound] = time;
            that[whichSound].cloneNode(false).play();
        }
    }

    function toggleMusic() {
        if (that['audio/music'].paused) {
            that['audio/music'].play();
        }
        else {
            that['audio/music'].pause();
            that['audio/music'].currentTime = 0;
        }
    }

    function stopMusic() {
        that['audio/music'].pause();
        that['audio/music'].currentTime = 0;
    }

    initialize();

    return {
        playSound : playSound,
        pauseSound : pauseSound,
        toggleMusic: toggleMusic,
        stopMusic: stopMusic,
        get sounds() { return that; }
    };
}(MyGame.assets));
