MyGame.screens['high-scores'] = (function(game) {
    'use strict';

    function initialize() {

        document.getElementById('high-scores-back-button').addEventListener(
            'click',
            function() {game.showScreen('main-menu');});
    }

    // Sets high scores to current high scores when screen is shown
    function run() {
        let scores = game.scores;
        for (let i = 0; i < 5; i++) {
            let name = 'high-score-' + (i+1);
            document.getElementById(name).innerText = scores[i];
        }
    }

    return {
        initialize : initialize,
        run : run
    };
}(MyGame.main));