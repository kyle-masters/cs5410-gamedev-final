MyGame.main = (function (screens){
    'use strict';

    let scores = [];

    let keyBindings = {
        keys: {}
    }

    function showScreen(id) {

        let active = document.getElementsByClassName('active');
        for (let screen = 0; screen < active.length; screen++) {
            active[screen].classList.remove('active');
        }

        screens[id].run();

        document.getElementById(id).classList.add('active');
    }

    function insertScore(score) {
        let currScore = score;
        for (let i = 0; i < 5; i++) {
            if (currScore > scores[i] || scores[i] === "") {
                let tempScore = scores[i];
                scores[i] = currScore;
                currScore = tempScore;
                localStorage.setItem('score' + (i+1), scores[i]);
            }
        }
    }

    function initialize() {
        // Set thrust, left rotate, and right rotate from browser storage
        keyBindings.keys.upgrade = localStorage.getItem('upgrade');
        keyBindings.keys.sell = localStorage.getItem('sell');
        keyBindings.keys.nextWave = localStorage.getItem('nextWave');
        keyBindings.keys.muteMusic = localStorage.getItem('muteMusic');

        // If any are null, set to defaults and save to browser
        if (keyBindings.keys.upgrade === null) {
            keyBindings.keys.upgrade = 'u';
            localStorage.setItem('upgrade', 'u');
        }
        if (keyBindings.keys.sell === null) {
            keyBindings.keys.sell = 's';
            localStorage.setItem('sell', 's');
        }
        if (keyBindings.keys.nextWave === null) {
            keyBindings.keys.nextWave = 'g';
            localStorage.setItem('nextWave', 'g');
        }
        if (keyBindings.keys.muteMusic === null) {
            keyBindings.keys.muteMusic = 'm';
            localStorage.setItem('muteMusic', 'm');
        }

        // Sets high scores from browser
        for (let i = 0; i < 5; i++) {
            let name = 'score' + (i + 1);
            scores[i] = localStorage.getItem(name);
            if (scores[i] === null) {
                scores[i] = "";
                localStorage.setItem(name, "");
            }
        }

        let screen = null;

        for (screen in screens) {
            if (screens.hasOwnProperty(screen)) {
                screens[screen].initialize();
            }
        }

        showScreen('main-menu');
    }

    return {
        initialize: initialize,
        showScreen : showScreen,
        insertScore : insertScore,
        get keyBindings() { return keyBindings; },
        get scores() { return scores; }
    }

}(MyGame.screens));