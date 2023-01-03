MyGame = {
    systems: {},
    screens: {},
    input: {},
    objects: {},
    render: [],
    assets: {}
};

//------------------------------------------------------------------
//
// Purpose of this code is to bootstrap (maybe I should use that as the name)
// the rest of the application.  Only this file is specified in the index.html
// file, then the code in this file gets all the other code and assets
// loaded.
//
//------------------------------------------------------------------
MyGame.loader = (function() {
    'use strict';
    let scriptOrder = [{
        scripts: ['sounds'],
        message: 'Sound system loaded',
        onComplete: null
    }, {
        scripts: ['objects/background'],
        message: 'Background image object loaded',
        onComplete: null
    }, {
        scripts: ['objects/text'],
        message: 'Text object loaded',
        onComplete: null
    }, {
        scripts: ['random'],
        message: 'Random functions loaded',
        onComplete: null
    }, {
        scripts: ['systems/particle-system'],
        message: 'Particle system model loaded',
        onComplete: null
    }, {
        scripts: ['systems/tower-system'],
        message: 'Tower system model loaded',
        onComplete: null
    }, {
        scripts: ['systems/creep-system'],
        message: 'Creep system model loaded',
        onComplete: null
    }, {
        scripts: ['systems/weapon-system'],
        message: 'Bullets system model loaded',
        onComplete: null
    }, {
        scripts: ['render/renderer'],
        message: 'Rendering core loaded',
        onComplete: null
    }, {
        scripts: ['render/background'],
        message: 'Background image renderer loaded',
        onComplete: null
    }, {
        scripts: ['render/particle-system'],
        message: 'Particle system renderer loaded',
        onComplete: null
    }, {
        scripts: ['render/tower-system'],
        message: 'Tower system renderer loaded',
        onComplete: null
    }, {
        scripts: ['render/creep-system'],
        message: 'Creep system renderer loaded',
        onComplete: null
    }, {
        scripts: ['render/weapon-system'],
        message: 'Bullets system renderer loaded',
        onComplete: null
    }, {
        scripts: ['render/text'],
        message: 'Text renderer loaded',
        onComplete: null
    }, {
        scripts: ['input-keyboard'],
        message: 'Keyboard input model loaded',
        onComplete: null
    }, {
        scripts: ['input-mouse'],
        message: 'Mouse input model loaded',
        onComplete: null
    }, {
        scripts: ['main'],
        message: 'Core loaded',
        onComplete: null
    }, {
        scripts: ['mainmenu'],
        message: 'Main menu screen loaded',
        onComplete: null
    }, {
        scripts: ['game-play'],
        message: 'Game loop and model loaded',
        onComplete: null
    }, {
        scripts: ['highscores'],
        message: 'High score screen loaded',
        onComplete: null
    }, {
        scripts: ['controls'],
        message: 'Controls screen loaded',
        onComplete: null
    }, {
        scripts: ['credits'],
        message: 'Credits screen loaded',
        onComplete: null
    },];

    let assetOrder = [{
        key: 'airCreep',
        source: '/assets/32x32-bat-sprite.png'
    }, {
        key: 'projectileBullet',
        source: '/assets/Arrow.png'
    }, {
        key: 'gameBackground',
        source: '/assets/background.png'
    }, {
        key: 'ground1Creep',
        source: '/assets/beetle5.PNG'
    }, {
        key: 'blueFire',
        source: '/assets/bluefire.png'
    }, {
        key: 'bombBullet',
        source: '/assets/bomb100.png'
    }, {
        key: 'bomb1Tower',
        source: '/assets/BombTower1.png'
    }, {
        key: 'bomb2Tower',
        source: '/assets/BombTower2.png'
    }, {
        key: 'bomb3Tower',
        source: '/assets/BombTower3.png'
    }, {
        key: 'button',
        source: '/assets/Button.png'
    }, {
        key: 'coin',
        source: '/assets/coin.png'
    }, {
        key: 'fire',
        source: '/assets/fire.png'
    }, {
        key: 'guided1Tower',
        source: '/assets/GuidedTower1.png'
    }, {
        key: 'guided2Tower',
        source: '/assets/GuidedTower2.png'
    }, {
        key: 'guided3Tower',
        source: '/assets/GuidedTower3.png'
    }, {
        key: 'ground2Creep',
        source: '/assets/king_cobra-blue.png'
    }, {
        key: 'mixedBullet',
        source: '/assets/laser.png'
    }, {
        key: 'gameMenuBackground',
        source: '/assets/menuBackground.png'
    }, {
        key: 'mixed1Tower',
        source: '/assets/MixedTower1.png'
    }, {
        key: 'mixed2Tower',
        source: '/assets/MixedTower2.png'
    }, {
        key: 'mixed3Tower',
        source: '/assets/MixedTower3.png'
    }, {
        key: 'guidedBullet',
        source: '/assets/orb_blue.png'
    }, {
        key: 'projectile1Tower',
        source: '/assets/ProjectileTower1.png'
    }, {
        key: 'projectile2Tower',
        source: '/assets/ProjectileTower2.png'
    }, {
        key: 'projectile3Tower',
        source: '/assets/ProjectileTower3.png'
    }, {
        key: 'menuBackground',
        source: '/assets/ScreenBackground.png'
    }, {
        key: 'smoke',
        source: '/assets/smoke.png'
    }, {
        key: 'towerBase',
        source: '/assets/TowerBase.png'
    }, {
        key: 'bombFireSound',
        source: '/assets/BombFire.mp3'
    }, {
        key: 'buildSound',
        source: '/assets/build.mp3'
    }, {
        key: 'deathSound',
        source: '/assets/death.mp3'
    }, {
        key: 'explodeSound',
        source: '/assets/explosion.mp3'
    }, {
        key: 'guidedFireSound',
        source: '/assets/GuidedFire.mp3'
    }, {
        key: 'mixedFireSound',
        source: '/assets/MixedFire.mp3'
    }, {
        key: 'projectileFireSound',
        source: '/assets/ProjectileFire.mp3'
    }, {
        key: 'sellSound',
        source: '/assets/SellTower.mp3'
    }, {
        key: 'upgrade1Sound',
        source: '/assets/upgrade1.mp3'
    }, {
        key: 'upgrade2Sound',
        source: '/assets/upgrade2.mp3'
    }, {
        key: 'music',
        source: '/assets/Woodland Fantasy.mp3'
    }];

    //------------------------------------------------------------------
    //
    // Helper function used to load scripts in the order specified by the
    // 'scripts' parameter.  'scripts' expects an array of objects with
    // the following format...
    //    {
    //        scripts: [script1, script2, ...],
    //        message: 'Console message displayed after loading is complete',
    //        onComplete: function to call when loading is complete, may be null
    //    }
    //
    //------------------------------------------------------------------
    function loadScripts(scripts, onComplete) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (scripts.length > 0) {
            let entry = scripts[0];
            require(entry.scripts, function() {
                console.log(entry.message);
                if (entry.onComplete) {
                    entry.onComplete();
                }
                scripts.shift();    // Alternatively: scripts.splice(0, 1);
                loadScripts(scripts, onComplete);
            });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // Helper function used to load assets in the order specified by the
    // 'assets' parameter.  'assets' expects an array of objects with
    // the following format...
    //    {
    //        key: 'asset-1',
    //        source: 'asset/.../asset.png'
    //    }
    //
    // onSuccess is invoked per asset as: onSuccess(key, asset)
    // onError is invoked per asset as: onError(error)
    // onComplete is invoked once per 'assets' array as: onComplete()
    //
    //------------------------------------------------------------------
    function loadAssets(assets, onSuccess, onError, onComplete) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (assets.length > 0) {
            let entry = assets[0];
            loadAsset(entry.source,
                function(asset) {
                    onSuccess(entry, asset);
                    assets.shift();    // Alternatively: assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                },
                function(error) {
                    onError(error);
                    assets.shift();    // Alternatively: assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // This function is used to asynchronously load image and audio assets.
    // On success the asset is provided through the onSuccess callback.
    // Reference: http://www.html5rocks.com/en/tutorials/file/xhr2/
    //
    //------------------------------------------------------------------
    function loadAsset(source, onSuccess, onError) {
        let xhr = new XMLHttpRequest();
        let fileExtension = source.substr(source.lastIndexOf('.') + 1);    // Source: http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript

        if (fileExtension) {
            xhr.open('GET', source, true);
            xhr.responseType = 'blob';

            xhr.onload = function() {
                let asset = null;
                if (xhr.status === 200) {
                    if (fileExtension === 'PNG' || fileExtension === 'png' || fileExtension === 'jpg') {
                        asset = new Image();
                        asset.isImage = true
                    } else if (fileExtension === 'mp3') {
                        asset = new Audio();
                        asset.isImage = false;
                    } else {
                        if (onError) { onError('Unknown file extension: ' + fileExtension); }
                    }
                    asset.onload = function() {
                        window.URL.revokeObjectURL(asset.src);
                    };
                    asset.src = window.URL.createObjectURL(xhr.response);
                    if (onSuccess) { onSuccess(asset); }
                } else {
                    if (onError) { onError('Failed to retrieve: ' + source); }
                }
            };
        } else {
            if (onError) { onError('Unknown file extension: ' + fileExtension); }
        }

        xhr.send();
    }

    //------------------------------------------------------------------
    //
    // Called when all the scripts are loaded, it kicks off the demo app.
    //
    //------------------------------------------------------------------
    function mainComplete() {
        console.log('It is all loaded up');
        MyGame.main.initialize();
    }

    //
    // Start with loading the assets, then the scripts.
    console.log('Starting to dynamically load project assets');
    loadAssets(assetOrder,
        function(source, asset) {    // Store it on success
            MyGame.assets[source.key] = asset;
        },
        function(error) {
            console.log(error);
        },
        function() {
            console.log('All game assets loaded');
            console.log('Starting to dynamically load project scripts');
            loadScripts(scriptOrder, mainComplete);
        }
    );

}());
