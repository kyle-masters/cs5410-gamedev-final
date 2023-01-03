MyGame.screens['game-play'] = (function(sounds, systems, game, objects, renderer, graphics, input, assets) {
    'use strict';

    let lastTimeStamp;
    let currentCell = null;
    let highlightedCell = null;
    let levelTime, levelCountDown, waveCountDown, currentLevel, currentWave, nextWaveCountDownStart, isLastWave, inLevel,
        onLastWave, speed, levelClear, upgradeCost, sellPrice, score, livesRemaining, gold, prices, gameOver, upgradePressed,
        gameWon, cancelNextRequest, scoreSubmitted;
    let mute = false;

    let myKeyboard = input.Keyboard();
    let myMouse = input.Mouse();

    let leftRightPath, rightLeftPath, topBottomPath, bottomTopPath;

    let myBackground = objects.Background({
        imageSrc: 'gameBackground',
        center: {x: graphics.canvas.width/2, y: graphics.canvas.height/2},
        size: {width: graphics.canvas.width, height: graphics.canvas.height}
    });

    let myMenuBackground = objects.Background({
        imageSrc: 'gameMenuBackground',
        center: {x: 11*graphics.canvas.width/12, y: graphics.canvas.height/2},
        size: {width: graphics.canvas.width/6, height: graphics.canvas.height}
    })

    let towers = systems.TowerSystem(graphics.canvas.height/16);
    let creeps = systems.CreepSystem(graphics.canvas.height);
    let bullets = systems.WeaponSystem(graphics.canvas.height);
    let particles = systems.ParticleSystem();

    let renderTowers = renderer.TowerSystem(towers, graphics, assets);
    let renderCreeps = renderer.CreepSystem(creeps, graphics, assets);
    let renderBullets = renderer.WeaponSystem(bullets, graphics, assets);
    let renderParticles = renderer.ParticleSystem(particles, graphics, assets);

    let floatingTexts = [];

    let gameOverText = [
        objects.Text({
            text: 'Game over!',
            font: '40pt arial',
            fillStyle: 'rgba(255, 255, 100, 1)',
            strokeStyle: 'rgba(255, 255, 100, 1)',
            position: {x: 5 * graphics.canvas.width/12, y: graphics.canvas.height/4},
            textAlign: 'center'
        }),
        objects.Text({
            text: 'Final score - 0',
            font: '40pt arial',
            fillStyle: 'rgba(255, 255, 100, 1)',
            strokeStyle: 'rgba(255, 255, 100, 1)',
            position: {x: 5 * graphics.canvas.width/12, y: graphics.canvas.height/4 + 2*graphics.canvas.height/16},
            textAlign: 'center'
        }),
        objects.Text({
            text: 'Press escape to quit',
            font: '40pt arial',
            fillStyle: 'rgba(255, 255, 100, 1)',
            strokeStyle: 'rgba(255, 255, 100, 1)',
            position: {x: 5 * graphics.canvas.width/12, y: graphics.canvas.height/4 + 6*graphics.canvas.height/16},
            textAlign: 'center'
        }),

    ]


    let menu = [
        {type: 'text',
            content: objects.Text({
                text: 'Projectile  - 100g',
                font: '14pt arial',
                fillStyle: 'rgba(255, 255, 100, 1)',
                strokeStyle: 'rgba(255, 255, 100, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: 'Guided  - 100g',
                font: '14pt arial',
                fillStyle: 'rgba(255, 255, 100, 1)',
                strokeStyle: 'rgba(255, 255, 100, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 17 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: 'Bomb  - 100g',
                font: '14pt arial',
                fillStyle: 'rgba(255, 255, 100, 1)',
                strokeStyle: 'rgba(255, 255, 100, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 33 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: 'Mixed  - 100g',
                font: '14pt arial',
                fillStyle: 'rgba(255, 255, 100, 1)',
                strokeStyle: 'rgba(255, 255, 100, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 49 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'image',
            content: objects.Background({
                imageSrc: 'button',
                center: {x: 11*graphics.canvas.width/12, y: 9 * graphics.canvas.height/16},
                size: {width: 0.8 * graphics.canvas.width/6, height: 0.4 * graphics.canvas.width/6}
            }),
            shown: false
        },
        {type: 'text',
            content: objects.Text({
                text: 'Upgrade',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 68.5 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: false
        },
        {type: 'text',
            content: objects.Text({
                text: '100g',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 72.75 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: false
        },
        {type: 'image',
            content: objects.Background({
                imageSrc: 'button',
                center: {x: 11*graphics.canvas.width/12, y: 10.5 * graphics.canvas.height/16},
                size: {width: 0.8 * graphics.canvas.width/6, height: 0.4 * graphics.canvas.width/6}
            }),
            shown: false
        },
        {type: 'text',
            content: objects.Text({
                text: 'Sell Tower',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 80.5 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: false
        },
        {type: 'text',
            content: objects.Text({
                text: '100g',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 84.75 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: false
        },
        {type: 'image',
            content: objects.Background({
                imageSrc: 'button',
                center: {x: 11*graphics.canvas.width/12, y: 12 * graphics.canvas.height/16},
                size: {width: 0.8 * graphics.canvas.width/6, height: 0.4 * graphics.canvas.width/6}
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: 'Next Level',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 94.5 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'image',
            content: objects.Background({
                imageSrc: 'button',
                center: {x: 11*graphics.canvas.width/12, y: 14.5 * graphics.canvas.height/16},
                size: {width: 0.8 * graphics.canvas.width/6, height: (12/16) * 0.8 * graphics.canvas.width/6}
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: 'Gold: 2000',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 110.5 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: 'Lives: 20',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 114.5 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: 'Score: 0',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 118.5 * graphics.canvas.height/128},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'image',
            content: objects.Background({
                imageSrc: 'button',
                center: {x: 11*graphics.canvas.width/12 - (0.3 * graphics.canvas.width/6), y: 13.09375 * graphics.canvas.height/16},
                size: {width: 0.2 * graphics.canvas.width/6, height: 0.2 * graphics.canvas.width/6}
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: '1x',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11*graphics.canvas.width/12 - (0.3 * graphics.canvas.width/6), y: 12.9375 * graphics.canvas.height/16},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'image',
            content: objects.Background({
                imageSrc: 'button',
                center: {x: 11*graphics.canvas.width/12, y: 13.09375 * graphics.canvas.height/16},
                size: {width: 0.2 * graphics.canvas.width/6, height: 0.2 * graphics.canvas.width/6}
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: '3x',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11 * graphics.canvas.width/12, y: 12.9375 * graphics.canvas.height/16},
                textAlign: 'center'
            }),
            shown: true
        },
        {type: 'image',
            content: objects.Background({
                imageSrc: 'button',
                center: {x: 11*graphics.canvas.width/12 + (0.3 * graphics.canvas.width/6), y: 13.09375 * graphics.canvas.height/16},
                size: {width: 0.2 * graphics.canvas.width/6, height: 0.2 * graphics.canvas.width/6}
            }),
            shown: true
        },
        {type: 'text',
            content: objects.Text({
                text: '5x',
                font: '14pt arial',
                fillStyle: 'rgba(0, 0, 0, 1)',
                strokeStyle: 'rgba(0, 0, 0, 1)',
                position: {x: 11*graphics.canvas.width/12 + (0.3 * graphics.canvas.width/6), y: 12.9375 * graphics.canvas.height/16},
                textAlign: 'center'
            }),
            shown: true
        },

    ]

    let levels = [
        [
            {
                startTime: 0,
                enemies: [
                    {type: 'ground2', entrance: 'left', health: 75, speed: 1,
                        startSecs: 0, intervalSecs: 3, amount: 10, intervalSecsPassed: 3, amountSpawned: 0,
                        intervalMean: 3, intervalStdev: 0.75, score: 30,},
                ]
            },
            {
                startTime: 30,
                enemies: [
                    {type: 'ground1', entrance: 'top', health: 75, speed: 1.5,
                        startSecs: 0, intervalSecs: 3, amount: 10, intervalSecsPassed: 3, amountSpawned: 0,
                        intervalMean: 3, intervalStdev: 0.75, score: 30},
                ]
            },
            {
                startTime: 60,
                enemies: [
                    {type: 'air', entrance: 'left', health: 75, speed: 1,
                        startSecs: 0, intervalSecs: 3, amount: 10, intervalSecsPassed: 3, amountSpawned: 0,
                        intervalMean: 3, intervalStdev: 0.75, score: 40},
                    {type: 'ground2', entrance: 'top', health: 100, speed: 1,
                        startSecs: 10, intervalSecs: 5, amount: 5, intervalSecsPassed: 5, amountSpawned: 0,
                        intervalMean: 3, intervalStdev: 0.75, score: 50},
                ]
            },
            {
                startTime: 90,
                enemies: [
                    {type: 'air', entrance: 'random', health: 100, speed: 1,
                        startSecs: 0, intervalSecs: 2, amount: 15, intervalSecsPassed: 2, amountSpawned: 0,
                        intervalMean: 2, intervalStdev: 0.5, score: 40, entrances: ['left', 'right']},
                    {type: 'ground1', entrance: 'random', health: 75, speed: 1.5,
                        startSecs: 0, intervalSecs: 3, amount: 10, intervalSecsPassed: 3, amountSpawned: 0,
                        intervalMean: 3, intervalStdev: 0.75, score: 30, entrances: ['top', 'bottom']},
                ]
            }
        ],
        [
            {
                startTime: 0,
                enemies : [
                    {type: 'ground2', entrance: 'random', health: 100, speed: 2,
                        startSecs: 0, intervalSecs: 1.5, amount: 30, intervalSecsPassed: 1.5, amountSpawned: 0,
                        intervalMean: 1.5, intervalStdev: 0.5, score: 40, entrances: ['top', 'bottom', 'left', 'right']}
                ]
            },
            {
                startTime: 45,
                enemies: [
                    {type: 'air', entrance: 'random', health: 100, speed: 2,
                        startSecs: 0, intervalSecs: 1.5, amount: 30, intervalSecsPassed: 1.5, amountSpawned: 0,
                        intervalMean: 1.5, intervalStdev: 0.5, score: 40, entrances: ['top', 'bottom', 'left', 'right']},
                ]
            },
            {
                startTime: 90,
                enemies: [
                    {type: 'air', entrance: 'random', health: 125, speed: 2,
                        startSecs: 0, intervalSecs: 1.5, amount: 20, intervalSecsPassed: 1.5, amountSpawned: 0,
                        intervalMean: 1.5, intervalStdev: 0.5, score: 60, entrances: ['top', 'bottom', 'left', 'right']},
                    {type: 'ground2', entrance: 'random', health: 125, speed: 2,
                        startSecs: 0.75, intervalSecs: 1.5, amount: 20, intervalSecsPassed: 1.5, amountSpawned: 0,
                        intervalMean: 1.5, intervalStdev: 0.5, score: 60, entrances: ['top', 'bottom', 'left', 'right']}
                ]
            },
            {
                startTime: 120,
                enemies: [
                    {type: 'ground2', entrance: 'random', health: 125, speed: 2,
                        startSecs: 0, intervalSecs: 0.5, amount: 60, intervalSecsPassed: 0.75, amountSpawned: 0,
                        intervalMean: 0.75, intervalStdev: 0.25, score: 50, entrances: ['top', 'bottom', 'left', 'right']}
                ]
            }
        ],
        [
            {
                startTime: 0,
                enemies : [
                    {type: 'ground2', entrance: 'random', health: 100, speed: 2,
                        startSecs: 0, intervalSecs: 1, amount: 30, intervalSecsPassed: 1, amountSpawned: 0,
                        intervalMean: 1, intervalStdev: 0.3, score: 50, entrances: ['top', 'left', 'right']},
                    {type: 'air', entrance: 'bottom', health: 100, speed: 2,
                        startSecs: 0, intervalSecs: 1, amount: 30, intervalSecsPassed: 1, amountSpawned: 0,
                        intervalMean: 1, intervalStdev: 0.3, score: 50,},
                ]
            },
            {
                startTime: 30,
                enemies: [
                    {type: 'ground1', entrance: 'random', health: 100, speed: 2,
                        startSecs: 0, intervalSecs: 0.5, amount: 40, intervalSecsPassed: 0.5, amountSpawned: 0,
                        intervalMean: 0.5, intervalStdev: 0.1, score: 50, entrances: ['top', 'bottom', 'left', 'right']},
                ]
            },
            {
                startTime: 50,
                enemies: [
                    {type: 'ground2', entrance: 'left', health: 300, speed: 1.5,
                        startSecs: 0, intervalSecs: 3, amount: 10, intervalSecsPassed: 3, amountSpawned: 0,
                        intervalMean: 3, intervalStdev: .75, score: 200},
                    {type: 'ground1', entrance: 'random', health: 100, speed: 2,
                        startSecs: 0, intervalSecs: 1, amount: 30, intervalSecsPassed: 1, amountSpawned: 0,
                        intervalMean: 1, intervalStdev: 0.3, score: 50, entrances: ['top', 'bottom', 'right']},
                ]
            },
            {
                startTime: 90,
                enemies: [
                    {type: 'ground2', entrance: 'top', health: 400, speed: 2,
                        startSecs: 0, intervalSecs: 3, amount: 10, intervalSecsPassed: 3, amountSpawned: 0,
                        intervalMean: 3, intervalStdev: 0.75, score: 60},
                    {type: 'air', entrance: 'random', health: 120, speed: 2,
                        startSecs: 0, intervalSecs: 1, amount: 30, intervalSecsPassed: 1, amountSpawned: 0,
                        intervalMean: 1, intervalStdev: 0.3, score: 50, entrances: ['left', 'bottom', 'right']},
                ]
            }
        ]
    ]

    let waveCountDownText = objects.Text({
        text: 'Wave x starting in x',
        font: 'bold 32pt monospace',
        fillStyle: 'rgba(255, 255, 100, 1)',
        strokeStyle: 'rgba(0, 0, 0, 1)',
        position: {x: 5* graphics.canvas.width/12, y: graphics.canvas.height/8},
        textAlign: 'center'
    })

    function runLevel(elapsedTime) {
        elapsedTime = elapsedTime / 1000;
        if (levelCountDown > 0) {
            levelCountDown -= elapsedTime;
            waveCountDownText.setText('Wave 1 starting in ' + Math.ceil(levelCountDown));
            if (levelCountDown <= 0) {
                elapsedTime = - levelCountDown;
                levelCountDown = 0;
                levelTime = 0;
                changeWave();
                runLevel(elapsedTime);
            }
        }
        else {
            levelTime += elapsedTime;
            let wave = levels[currentLevel][currentWave];
            let toSpawn = []
            wave.enemies.forEach(enemy => {
                if (enemy.amountSpawned < enemy.amount && (levelTime - wave.startTime) > enemy.startSecs) {
                    enemy.intervalSecsPassed += elapsedTime;
                    while (enemy.intervalSecsPassed >= enemy.intervalSecs) {
                        enemy.intervalSecsPassed -= enemy.intervalSecs;
                        if (enemy.entrance === 'random') {
                            toSpawn.push({type: enemy.type, entrance: enemy.entrances[Math.floor(Math.random()*enemy.entrances.length)],
                                health: enemy.health, speed: enemy.speed, score: enemy.score});
                        }
                        else {
                            toSpawn.push({type: enemy.type, entrance: enemy.entrance, health: enemy.health, speed: enemy.speed, score: enemy.score});
                        }
                        enemy.amountSpawned++;
                        enemy.intervalSecs = Random.nextGaussian(enemy.intervalMean, enemy.intervalStdev);
                    }

                }
            });
            for (let i = 0; i < toSpawn.length; i++) {
                creeps.create(toSpawn[i].type, toSpawn[i].entrance, toSpawn[i].health, toSpawn[i].speed, toSpawn[i].score);
            }
            if (onLastWave) {
                inLevel = false;
                wave.enemies.forEach(enemy => {
                    if (enemy.amountSpawned < enemy.amount) {
                        inLevel = true;
                    }
                });
                for (let key in creeps.creeps) {
                    inLevel = true;
                }
            }
            if (nextWaveCountDownStart !== -1 && levelTime >= nextWaveCountDownStart) {
                waveCountDown = 3 - (levelTime - nextWaveCountDownStart);
                if (isLastWave) waveCountDownText.setText('Last wave starting in ' + Math.ceil(waveCountDown));
                else waveCountDownText.setText('Wave ' + (currentWave+2) + ' starting in ' + Math.ceil(waveCountDown));
                if (waveCountDown <= 0) {
                    elapsedTime = -waveCountDown;
                    changeWave();
                    runLevel(elapsedTime);
                }
            }

            if (inLevel === false) {
                if (levels.length - 1 === currentLevel) {
                    gameOver = true;
                    gameWon = true;
                }
                else {
                    waveCountDownText.setText('Level ' + (currentLevel+1) + ' clear!');
                    levelClear = 3;
                    menu[10].shown = true;
                    menu[11].shown = true;
                }
            }
        }
    }

    function startLevel() {
        currentLevel++;
        currentWave = -1;
        levelCountDown = 3;
        waveCountDown = 0;
        inLevel = true;
        menu[10].shown = false;
        menu[11].shown = false;
    }


    function changeWave() {
        let level = levels[currentLevel];
        currentWave++;
        isLastWave = level.length === currentWave + 2;
        onLastWave = level.length === currentWave + 1;
        if (!onLastWave) {
            nextWaveCountDownStart = level[currentWave + 1].startTime - 3;
        }
        else nextWaveCountDownStart = -1;
    }

    function particleGeneration(deadCreepsPos, bombTrail, guidedTrail, bombExplode, guidedExplode) {
        for (let i = 0; i < deadCreepsPos.length; i++) {
            particles.addParticles(deadCreepsPos[i].center, 'creepDeath');
        }
        for (let i = 0; i < bombTrail.length; i++) {
            particles.addParticles(bombTrail[i], 'bombTrail');
        }
        for (let i = 0; i < guidedTrail.length; i++) {
            particles.addParticles(guidedTrail[i], 'guidedTrail');
        }
        for (let i = 0; i < bombExplode.length; i++) {
            particles.addParticles(bombExplode[i], 'bombExplosion');
        }
        for (let i = 0; i < guidedExplode.length; i++) {
            particles.addParticles(guidedExplode[i], 'guidedExplosion');
        }
    }

    function updateFloatingScores(elapsedTime, deadCreeps) {
        let toRemove = []

        for (let i = 0; i < floatingTexts.length; i++) {
            floatingTexts[i].alive += elapsedTime / 1000;
            if (floatingTexts[i].alive > 1) toRemove.push(i);
            else {
                let pos = floatingTexts[i].text.position;
                floatingTexts[i].text.setPos({
                    x: pos.x,
                    y: pos.y - ((elapsedTime / 1000) * graphics.canvas.height/16)
                });
            }
        }

        for (let i = 0; i < toRemove.length; i++) {
            floatingTexts.splice(toRemove[i], 1);
        }

        for (let i = 0; i < deadCreeps.length; i++) {
            score += deadCreeps[i].score;
            gold += deadCreeps[i].score;
            menu[13].content.setText('Gold: ' + gold);
            menu[15].content.setText('Score: ' + score);

            floatingTexts.push(
                {
                    text: objects.Text({
                        text: deadCreeps[i].score,
                        font: 'bold 16pt monospace',
                        fillStyle: 'rgba(0, 255, 255, 1)',
                        strokeStyle: 'rgba(0, 0, 255, 1)',
                        position: {x: deadCreeps[i].center.x, y: deadCreeps[i].center.y - graphics.canvas.height/64},
                        textAlign: 'center'
                    }),
                    alive: 0,
                });
        }
    }

    function playSounds(deadCreeps, bombExplosions, guidedExplosions, bulletsFired) {
        for (let i = 0; i < deadCreeps.length; i++) {
            MyGame.sounds.playSound('audio/death', lastTimeStamp);
        }
        for (let i = 0; i < bombExplosions.length; i++) {
            MyGame.sounds.playSound('audio/explosion', lastTimeStamp);
        }
        for (let i = 0; i < guidedExplosions.length; i++) {
            MyGame.sounds.playSound('audio/explosion', lastTimeStamp);
        }
        for (let i = 0; i < bulletsFired.length; i++) {
            let bulletType = bulletsFired[i].type;
            MyGame.sounds.playSound('audio/' + bulletType + 'Fire', lastTimeStamp);
        }
    }

    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
        myMouse.update(elapsedTime);
    }

    function update(elapsedTime) {
        if (!gameOver) {
            if (levelClear > 0) levelClear -= elapsedTime / 1000;
            if (inLevel) runLevel(elapsedTime);
            let creepUpdateInfo = creeps.update(elapsedTime);
            livesRemaining -= creepUpdateInfo.escapedCreeps.length;
            for (let i = 0; i < creepUpdateInfo.escapedCreeps.length; i++) {
                score -= creepUpdateInfo.escapedCreeps[i].score;
                if (score < 0 ) score = 0;
                menu[15].content.setText('Score: ' + score);
            }
            if (livesRemaining <= 0) {
                gameOver = true;
                gameWon = false;
            }
            menu[14].content.setText('Lives: ' + livesRemaining);
            bullets.killBullets(creepUpdateInfo.stopBullets);
            let bulletsUpdateInfo = bullets.update(elapsedTime, creeps.creeps);
            let creepDamageInfo = creeps.dealDamage(bulletsUpdateInfo.toDamage);
            bullets.killBullets(creepDamageInfo.stopBullets);
            let bulletsToCreate = towers.update(elapsedTime, creeps)
            bullets.create(bulletsToCreate);
            particles.update(elapsedTime);
            particleGeneration(creepDamageInfo.deadCreepsPos, bulletsUpdateInfo.bombTrails, bulletsUpdateInfo.guidedTrails,
                bulletsUpdateInfo.bombExplode, bulletsUpdateInfo.guidedExplode);
            playSounds(creepDamageInfo.deadCreepsPos, bulletsUpdateInfo.bombExplode, bulletsUpdateInfo.guidedExplode, bulletsToCreate);
            updateFloatingScores(elapsedTime, creepDamageInfo.deadCreepsPos);
        }
        if (gameOver) {
            if (gameWon) {
                gameOverText[0].setText("Game over! You win!");
            }
            else {
                gameOverText[0].setText("Game over, better luck next time!")
            }
            gameOverText[1].setText("Final score - " + score);
            if (!scoreSubmitted) {
                game.insertScore(Math.trunc(score));
                scoreSubmitted = true;
            }
        }
    }

    function render() {
        graphics.clear();
        renderer.Background.render(myBackground);
        if (highlightedCell !== null) {
            graphics.drawRect(highlightedCell.square);
            graphics.drawCircle(highlightedCell.circle);
        }
        renderer.Background.render(myMenuBackground);
        for(let i = 0; i < menu.length; i++) {
            if (menu[i].shown) {
                if (menu[i].type === "text") {
                    renderer.Text.render(menu[i].content);
                } else if (menu[i].type === "image") {
                    renderer.Background.render(menu[i].content)
                }
            }
        }
        renderTowers.render();
        renderCreeps.render();
        renderParticles.render();
        renderBullets.render();
        for (let i = 0; i < floatingTexts.length; i++) {
            renderer.Text.render(floatingTexts[i].text);
        }
        if (levelCountDown > 0 || waveCountDown > 0 || levelClear > 0) renderer.Text.render(waveCountDownText);
        if (gameOver) {
            graphics.drawRect({
                style: 'rgba(255, 255, 255, 0.5)',
                center: {
                    x: graphics.canvas.width/2,
                    y: graphics.canvas.height/2,
                },
                width: graphics.canvas.width,
                height: graphics.canvas.height,
                filled: true
            })
            for (let i = 0; i < gameOverText.length; i++) {
                renderer.Text.render(gameOverText[i]);
            }
        }

    }

    function gameLoop(time) {
        let elapsedTime = (time - lastTimeStamp);
        lastTimeStamp = time;

        processInput(elapsedTime);
        update(speed*elapsedTime);
        render();

        if (!cancelNextRequest) {
            requestAnimationFrame(gameLoop);
        }
    }

    function placeTower() {
        if(towers.isTowerSelected) {
            if(towers.towers[towers.selectedTower].coordinates.x === -1 &&
                highlightedCell !== null && gold >= prices[towers.towers[towers.selectedTower].type]) {
                let towerX = highlightedCell.pos.x;
                let towerY = highlightedCell.pos.y;
                let towerCenter = {
                    x: ((towerX + 1) * graphics.canvas.height/16),
                    y: ((towerY + 1) * graphics.canvas.height/16)
                }
                if (towers.add(towers.towers[towers.selectedTower].type, towerX, towerY, towerCenter)) {
                    creeps.moveCreepsFromPos({row: towerY, col: towerX});
                    calculatePaths();
                    gold -= prices[towers.towers[towers.selectedTower].type];
                    menu[13].content.setText('Gold: ' + gold);
                    MyGame.sounds.playSound('audio/build', lastTimeStamp);
                    return true;
                }
            }
        }
        return false;
    }

    function clickOnTower(x, y) {
        let clickedTower = false;

        Object.getOwnPropertyNames(towers.towers).forEach(function(value) {
            towers.towers[value].selected = x >= towers.towers[value].center.x - graphics.canvas.height / 32 &&
                x <= towers.towers[value].center.x + graphics.canvas.height / 32 &&
                y >= towers.towers[value].center.y - graphics.canvas.height / 32 &&
                y <= towers.towers[value].center.y + graphics.canvas.height / 32;
            if (towers.towers[value].selected) {
                towers.selectTower(value);
                clickedTower = true;
                if (!value.startsWith("-")) {
                    if (towers.towers[value].level < 3) {
                        menu[4].shown = true;
                        menu[5].shown = true;
                        menu[6].shown = true;
                        upgradeCost = towers.towers[value].cost;
                        menu[6].content.setText(upgradeCost + 'g');
                    }
                    menu[7].shown = true;
                    menu[8].shown = true;
                    menu[9].shown = true;
                    sellPrice = towers.towers[value].sellPrice
                    menu[9].content.setText(sellPrice + 'g');
                }
                else {
                    menu[4].shown = false;
                    menu[5].shown = false;
                    menu[6].shown = false;
                    menu[7].shown = false;
                    menu[8].shown = false;
                    menu[9].shown = false;
                }
            }
        });

        if (!clickedTower) {
            towers.deSelectTower();
            menu[4].shown = false;
            menu[5].shown = false;
            menu[6].shown = false;
            menu[7].shown = false;
            menu[8].shown = false;
            menu[9].shown = false;
        }
    }

    function highlightCell(x, y) {
        if (currentCell !== null && isValidTowerPlacement()) {
            highlightedCell = {
                pos: {
                    x: Math.floor((x - graphics.canvas.height/32)/(graphics.canvas.height/16)),
                    y: Math.floor((y - graphics.canvas.height/32)/(graphics.canvas.height/16))
                },
                square: {
                    style: 'white',
                    lineWidth: '2',
                    center: {
                        x: ((Math.floor((x - graphics.canvas.height/32)/(graphics.canvas.height/16)) + 1) * graphics.canvas.height/16),
                        y: ((Math.floor((y - graphics.canvas.height/32)/(graphics.canvas.height/16)) + 1) * graphics.canvas.height/16)
                    },
                    width: graphics.canvas.height/16,
                    height: graphics.canvas.height/16,
                    filled: false
                },
                circle: {
                    style: 'blue',
                    lineWidth: '2',
                    center: {
                        x: ((Math.floor((x - graphics.canvas.height/32)/(graphics.canvas.height/16)) + 1) * graphics.canvas.height/16),
                        y: ((Math.floor((y - graphics.canvas.height/32)/(graphics.canvas.height/16)) + 1) * graphics.canvas.height/16)
                    },
                    rad: towers.towers[towers.selectedTower].range * graphics.canvas.height/16
                }
            };
        }
        else {
            highlightedCell = null;
        }
    }

    function isValidTowerPlacement() {
        let tPath = aStarSearchAlgorithm2({row: 0, col: 7}, {row: 14, col: 7}, false);
        let bPath = aStarSearchAlgorithm2({row: 14, col: 7}, {row: 0, col: 7}, false);
        let lPath = aStarSearchAlgorithm2({row: 7, col: 0}, {row: 7, col: 14}, false);
        let rPath = aStarSearchAlgorithm2({row: 7, col: 14}, {row: 7, col: 0}, false);
        if (!!tPath && !!bPath && !!lPath && !!rPath) {
            return creeps.checkPaths(lPath, rPath, tPath, bPath);
        }
        else return false;
    }

    function calculatePaths() {
        topBottomPath = aStarSearchAlgorithm2({row: 0, col: 7}, {row: 14, col: 7}, false);
        bottomTopPath = aStarSearchAlgorithm2({row: 14, col: 7}, {row: 0, col: 7}, false);
        leftRightPath = aStarSearchAlgorithm2({row: 7, col: 0}, {row: 7, col: 14}, false);
        rightLeftPath = aStarSearchAlgorithm2({row: 7, col: 14}, {row: 7, col: 0}, false);
        return creeps.changePaths(leftRightPath, rightLeftPath, topBottomPath, bottomTopPath);
    }

    // From https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode
    function reconstructPath(cameFrom, current, start) {
        let totalPath = [];
        while(current !== null) {
            totalPath.push(current)
            current = cameFrom[current.col][current.row];
        }
        totalPath.reverse();

        let path;
        let lastNode;
        totalPath.forEach((value, index) => {
            let currentNode = {pos: value};
            if (index === 0) {
                path = currentNode;
            }
            else if (index < totalPath.length) {
                lastNode.next = currentNode;
            }
            if (index === totalPath.length - 1) {
                currentNode.next = null;
            }
            lastNode = currentNode;
        });

        return path;

    }

    // From https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode
    function aStarSearchAlgorithm2(start, end, ignoreTowers) {

        if (currentCell !== null && currentCell.x === start.col && currentCell.y === start.row) {
            return false;
        }
        let openSet = new Set();
        openSet.add(start);

        function h(node) {
            return Math.abs(node.row - end.row) + Math.abs(node.col - end.col);
        }
        function isObjectInSet(node, set) {
            function isNodeEqual(obj1, obj2) {
                return (obj1.row === obj2.row && obj1.col === obj2.col);
            }
            set.forEach(setNode => {
                if (isNodeEqual(node, setNode)) return true;
            });
            return false;
        }
        function deleteObjectFromSet(node, set) {
            function isNodeEqual(obj1, obj2) {
                return (obj1.row === obj2.row && obj1.col === obj2.col);
            }
            set.forEach(setNode => {
                if (isNodeEqual(node, setNode)) set.delete(setNode);
            });
            return set;
        }

        let cameFrom = [];
        let gScore = [];
        let fScore = [];
        for(let col = 0; col < 15; col++) {
            cameFrom[col] = [];
            gScore[col] = [];
            fScore[col] = [];
            for(let row = 0; row < 15; row++) {
                cameFrom[col][row] = null;
                gScore[col][row] = Number.MAX_SAFE_INTEGER;
                fScore[col][row] = Number.MAX_SAFE_INTEGER;
            }
        }

        gScore[start.col][start.row] = 0;
        fScore[start.col][start.row] = h(start);

        while (openSet.size > 0) {
            let currentScore = Number.MAX_SAFE_INTEGER;
            let current = {row: 0, col: 0};
            openSet.forEach(node => {
                if (fScore[node.col][node.row] < currentScore) {
                    currentScore = fScore[node.col][node.row];
                    current = {row: node.row, col: node.col};
                }
            });

            if (current.row === end.row && current.col === end.col) {
                return reconstructPath(cameFrom, current, start);
            }

            openSet = deleteObjectFromSet(current, openSet);

            let neighbors = [
                {row: current.row - 1, col: current.col},
                {row: current.row + 1, col: current.col},
                {row: current.row, col: current.col - 1},
                {row: current.row, col: current.col + 1}
            ]

            neighbors.forEach(neighbor => {
                if (neighbor.row >= 0 && neighbor.row <= 14 && neighbor.col >= 0 && neighbor.col <= 14) {
                    if (ignoreTowers || !towers.isTowerAt(neighbor.col, neighbor.row))
                    {
                        if (currentCell === null || (currentCell.x !== neighbor.col || currentCell.y !== neighbor.row)) {
                            let tentative_gScore = gScore[current.col][current.row] + 1;
                            if (tentative_gScore < gScore[neighbor.col][neighbor.row]) {
                                cameFrom[neighbor.col][neighbor.row] = current;
                                gScore[neighbor.col][neighbor.row] = tentative_gScore;
                                fScore[neighbor.col][neighbor.row] = tentative_gScore + h(neighbor);
                                if (!isObjectInSet(neighbor, openSet)) {
                                    openSet.add(neighbor);
                                }
                            }
                        }
                    }
                }
            });
        }
        return false;
    }

    function findCurrentCellChanged(x, y) {
        if (x >= graphics.canvas.height/32 &&
            x < 31*graphics.canvas.height/32 &&
            y >= graphics.canvas.height/32 &&
            y < 31*graphics.canvas.height/32) {
            let cell = {
                x: Math.floor((x - graphics.canvas.height/32)/(graphics.canvas.height/16)),
                y: Math.floor((y - graphics.canvas.height/32)/(graphics.canvas.height/16))
            }
            if (currentCell === null || cell.x !== currentCell.x || cell.y !== currentCell.y) {
                currentCell = cell;
                return true;
            }
            else return false;
        }
        else {
            if (currentCell === null) return false;
            else {
                currentCell = null
                return true;
            }
        }
    }

    function initialize() {
        // myMouse.register('mousedown'), function(e, elapsedTime) {
        //
        // }

    }

    function clickOnButton(x, y) {
        let buttons = [menu[4], menu[7], menu[10], menu[16], menu[18], menu[20]];
        buttons[0].function = tryUpgrade;
        buttons[1].function = sellTower;
        buttons[2].function = startLevel;
        buttons[3].function = function() { speed = 1; }
        buttons[4].function = function() { speed = 3; }
        buttons[5].function = function() { speed = 5; }

        function findBoundaries(object) {
            let minX, maxX, minY, maxY;
            minX = object.center.x - object.size.width/2;
            maxX = object.center.x + object.size.width/2;
            minY = object.center.y - object.size.height/2;
            maxY = object.center.y + object.size.height/2;

            return {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
        }

        for (let i = 0; i < buttons.length; i++) {
            let buttonBoundaries = findBoundaries(buttons[i].content);
            if (x <= buttonBoundaries.maxX && x >= buttonBoundaries.minX &&
                y <= buttonBoundaries.maxY && y >= buttonBoundaries.minY) {
                if (buttons[i].shown === true) {
                    buttons[i].function();
                    return true;
                }
            }
        }
        return false;
    }

    function tryUpgrade() {
        let x = towers.selectedTower.substring(0, 2);
        let y = towers.selectedTower.substring(2, 4);
        if (x !== "-1" && towers.towers[towers.selectedTower].level < 3 && gold >= upgradeCost) {
            gold -= upgradeCost;
            menu[13].content.setText('Gold: ' + gold);
            towers.upgrade(x, y);
            if (towers.towers[towers.selectedTower].level === 3) {
                menu[4].shown = false;
                menu[5].shown = false;
                menu[6].shown = false;
            }
            else {
                upgradeCost = towers.towers[towers.selectedTower].cost;
                menu[6].content.setText(upgradeCost + 'g');
            }
            sellPrice = towers.towers[towers.selectedTower].sellPrice
            menu[9].content.setText(sellPrice + 'g');
            if (towers.towers[towers.selectedTower].level === 2) {
                MyGame.sounds.playSound('audio/upgrade1', lastTimeStamp);
            }
            else {
                MyGame.sounds.playSound('audio/upgrade2', lastTimeStamp);
            }
        }
    }

    function sellTower() {
        let x = towers.selectedTower.substring(0, 2);
        let y = towers.selectedTower.substring(2, 4);
        if (x !== "-1") {
            let center = towers.towers[towers.selectedTower].center;
            gold += sellPrice;
            menu[13].content.setText('Gold: ' + gold);
            menu[4].shown = false;
            menu[5].shown = false;
            menu[6].shown = false;
            menu[7].shown = false;
            menu[8].shown = false;
            menu[9].shown = false;
            towers.remove(x, y);
            MyGame.sounds.playSound('audio/sell', lastTimeStamp);
            particles.addParticles(center, 'sellTower')
            calculatePaths();
        }
    }

    function run() {
        if (!mute) {
            MyGame.sounds.toggleMusic();
        }

        let canvas = document.getElementById('myCanvas');
        let escapePressed = false;
        let mutePressed = false;
        myKeyboard = input.Keyboard();
        myMouse = input.Mouse();



        towers.add('projectile', -1, 0, {x: 11* graphics.canvas.width / 12, y: graphics.canvas.height / 16});
        towers.add('guided', -1, 1, {x: 11* graphics.canvas.width / 12, y: 3* graphics.canvas.height / 16});
        towers.add('bomb', -1, 2, {x: 11* graphics.canvas.width / 12, y: 5* graphics.canvas.height / 16});
        towers.add('mixed', -1, 3, {x: 11* graphics.canvas.width / 12, y: 7 * graphics.canvas.height / 16});

        myMouse.register('mousedown', function(e) {
            if (!clickOnButton(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop)) {
                if (!placeTower(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop)) {
                    clickOnTower(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
                }
                if (towers.isTowerSelected && towers.selectedTower.substring(0, 2) === "-1") {
                    highlightCell(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
                } else highlightedCell = null;
            }
        });

        myMouse.register('mousemove', function(e) {
            if (towers.isTowerSelected && towers.selectedTower.substring(0, 2) === "-1") {
                if (findCurrentCellChanged(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop)) {
                    highlightCell(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
                }
            }
            else highlightedCell = null;
        });

        myKeyboard.register(game.keyBindings.keys.nextWave, function(e) {
            if (!inLevel) startLevel();
        });

        myKeyboard.register(game.keyBindings.keys.sell, function (e) {
            if(towers.isTowerSelected) {
                sellTower();
            }
        });

        myKeyboard.register('Escape', function () {
            if (!escapePressed) {
                game.showScreen('main-menu');
                sounds.stopMusic();
                escapePressed = true;
                towers.clear();
                creeps.clear();
                bullets.clear();
                particles.clear();
                cancelNextRequest = true;
            }
            window.addEventListener('keyup', function (e) {
                if (e.key === 'Escape') escapePressed = false;
            });
        });

        myKeyboard.register(game.keyBindings.keys.upgrade, function (e) {
            if (towers.isTowerSelected && !upgradePressed) {
                tryUpgrade();
                upgradePressed = true;
            }
            window.addEventListener('keyup', function (e) {
                if (e.key === game.keyBindings.keys.upgrade) upgradePressed = false;
            });
        });

        myKeyboard.register(game.keyBindings.keys.muteMusic, function(e) {
            if (!mutePressed) {
                sounds.toggleMusic();
                mutePressed = true;
                mute = !mute;
            }

            window.addEventListener('keyup', function (e) {
                if (e.key === game.keyBindings.keys.muteMusic) mutePressed = false;
            });
        });




        calculatePaths();
        creeps.generateAirpaths();

        levelTime = 0;
        levelCountDown = 0;
        waveCountDown = 0;
        currentLevel = -1;
        currentWave = -1;
        nextWaveCountDownStart = -1;
        isLastWave = false;
        inLevel = false;
        onLastWave = false;
        speed = 1;
        levelClear = 0;
        upgradePressed = false;
        gold = 10000;
        score = 0;
        livesRemaining = 20;

        menu[13].content.setText('Gold: ' + gold);
        menu[15].content.setText('Score: ' + score);
        menu[14].content.setText('Lives: ' + livesRemaining)

        gameOver = false;
        gameWon = false;
        cancelNextRequest = false;
        scoreSubmitted = false;
        floatingTexts = [];

        prices = {
            projectile: towers.info.projectile[1].cost,
            guided: towers.info.guided[1].cost,
            bomb: towers.info.bomb[1].cost,
            mixed: towers.info.mixed[1].cost
        };

        for (let i = 0; i < levels.length; i++) {
            for (let j = 0; j < levels[i].length; j++) {
                for (let k = 0; k < levels[i][j].enemies.length; k++) {
                    levels[i][j].enemies[k].amountSpawned = 0;
                    levels[i][j].enemies[k].intervalSecs = levels[i][j].enemies[k].intervalMean;
                    levels[i][j].enemies[k].intervalSecsPassed = levels[i][j].enemies[k].intervalMean;
                }
            }
        }

        menu[10].shown = true;
        menu[11].shown = true;
        menu[0].content.setText('Projectile - ' + prices.projectile);
        menu[1].content.setText('Guided - ' + prices.guided);
        menu[2].content.setText('Bomb - ' + prices.bomb);
        menu[3].content.setText('Mixed - ' + prices.mixed);

        lastTimeStamp = performance.now();
        highlightedCell = null
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize : initialize,
        run : run,
        aStarSearchAlgorithm2: aStarSearchAlgorithm2
    };

}(MyGame.sounds, MyGame.systems, MyGame.main, MyGame.objects, MyGame.render, MyGame.graphics, MyGame.input, MyGame.assets));