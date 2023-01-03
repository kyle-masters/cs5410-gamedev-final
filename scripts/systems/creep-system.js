//------------------------------------------------------------------
//
// This is the particle system use by the game code
//
//------------------------------------------------------------------
MyGame.systems.CreepSystem = function(size) {
    'use strict';
    let nextName = 1;       // Unique identifier for the next particle
    let creeps = {};
    let paths = {};
    let creepFrames = {
        ground1: {frames: 3, frameTime: 0.150},
        ground2: {frames: 3, frameTime: 0.150},
        air: {frames: 4, frameTime: 0.150}
    }
    let airpaths;

    function clear() {
        nextName = 1;
        creeps = {};
    }

    function generateAirpaths() {
        airpaths = {
            top:    MyGame.screens['game-play'].aStarSearchAlgorithm2({row: 0, col: 7}, {row: 14, col: 7}, true),
            bottom: MyGame.screens['game-play'].aStarSearchAlgorithm2({row: 14, col: 7}, {row: 0, col: 7}, true),
            left:   MyGame.screens['game-play'].aStarSearchAlgorithm2({row: 7, col: 0}, {row: 7, col: 14}, true),
            right:  MyGame.screens['game-play'].aStarSearchAlgorithm2({row: 7, col: 14}, {row: 7, col: 0}, true)
        }
    }

    //------------------------------------------------------------------
    //
    // This creates one new particle
    //
    //------------------------------------------------------------------
    function create(type, entrance, health, speed, score) {
        let center, start, end, direction, path, air;

        switch (entrance) {
            case 'top':
                center = {x: size/2, y: 0};
                start = {x: 7, y: 0};
                end = {x: 7, y: 14};
                direction = 'down';
                break;
            case 'left':
                center = {x: 0, y: size/2};
                start = {x: 0, y: 7};
                end = {x: 14, y: 7};
                direction = 'right';
                break;
            case 'bottom':
                center = {x: size/2, y: size};
                start = {x: 7, y: 14};
                end = {x: 7, y: 0};
                direction = 'up';
                break;
            case 'right':
                center = {x: size, y: size/2};
                start = {x: 14, y: 7};
                end = {x: 0, y: 7};
                direction = 'left';
                break;
        }
        if (type === 'air') {
            path = airpaths[entrance];
            air = true;
        }
        else {
            path = paths[entrance];
            air = false;
        }
        let myPath = path;
        let distanceAway = 0;
        while (myPath !== null)
        {
            distanceAway += 1;
            myPath = myPath.next;
        }
        creeps[nextName++] = {
            center: center,
            size: {
                width: size / 16,
                height: size / 16
            },
            start: start,
            end: end,
            current: path,
            progress: 0,
            path: entrance,
            health: health,
            maxHealth: health,
            speed: speed,
            direction: direction,
            frame: 0,
            frameTime: 0,
            maxFrames: creepFrames[type].frames,
            type: type,
            distanceAway: distanceAway,
            air: air,
            score: score
        };
    }

    function changePaths(left, right, top, bottom) {
        paths.left = left;
        paths.right = right;
        paths.top = top;
        paths.bottom = bottom;
        paths.extra = [];

        Object.getOwnPropertyNames(creeps).forEach(function (value) {
            let creep = creeps[value];
            if (creep.type !== 'air') {
                let path = paths[creep.path];

                let foundPath = false;
                while (path !== null) {
                    if (creep.current.pos.row === path.pos.row && creep.current.pos.col === path.pos.col) {
                        creep.current = path;
                        foundPath = true;
                    }
                    path = path.next;
                }
                if (!foundPath) {
                    paths.extra.forEach(value => {
                        path = value;
                        while (path !== null) {
                            if (creep.current.pos.row === path.pos.row && creep.current.pos.col === path.pos.col) {
                                creep.current = path;
                                foundPath = true;
                            }
                            path = path.next;
                        }
                    });
                    if (!foundPath) {
                        let newPath = MyGame.screens['game-play'].aStarSearchAlgorithm2(creep.current.pos, {
                            row: creep.end.y,
                            col: creep.end.x
                        }, false);
                        if (!!newPath) {
                            creep.current = newPath;
                            foundPath = true;
                        } else {
                            return false;
                        }

                    }
                }
                if (foundPath) {
                    path = creep.current;
                    creep.distanceAway = 0;
                    while (path !== null) {
                        creep.distanceAway += 1;
                        path = path['next'];
                    }
                    creep.distanceAway -= creep.progress;
                }
            }
        });

        return true;
    }

    function checkPaths(left, right, top, bottom) {
        let newPaths = {};
        newPaths.left = left;
        newPaths.right = right;
        newPaths.top = top;
        newPaths.bottom = bottom;
        newPaths.extra = [];
        let goodPlacement = true;

        for (let value in creeps) {

            let creep = creeps[value];
            if (creep.type !== 'air') {
                let path = paths[creep.path];

                let foundPath = false;
                while (path !== null) {
                    if (creep.current.pos.row === path.pos.row && creep.current.pos.col === path.pos.col) {
                        foundPath = true;
                    }

                    path = path.next;
                }
                if (!foundPath) {
                    paths.extra.forEach(value => {
                        path = value;
                        while (path !== null) {
                            if (creep.current.pos.row === path.pos.row && creep.current.pos.col === path.pos.col) {
                                foundPath = true;
                            }
                            path = path.next;
                        }
                    })
                    if (!foundPath) {
                        let newPath = MyGame.screens['game-play'].aStarSearchAlgorithm2(creep.current.pos, {
                            row: creep.end.y,
                            col: creep.end.x
                        });
                        if (!newPath) {
                            goodPlacement = false;
                            break;
                        }
                    }
                }
            }
        }
        return goodPlacement;
    }

    function guessCreepLocation(name, secs) {
        let creep = {
            current: creeps[name].current,
            center: creeps[name].center,
            progress: creeps[name].progress,
            path: creeps[name].path,
            speed: creeps[name].speed,
            size: creeps[name].size
        }

        creep.progress += secs * creep.speed;

        while (creep.progress >= 1) {
            creep.progress -= 1;

            creep.current = creep.current.next;
            if (creep.current['next'] === null) {
                return null;
            }
        }

        if (creep.current['next'] !== null) {
            return {
                x: (creep.current.pos.col + ((creep.current['next'].pos.col - creep.current.pos.col) * creep.progress)) * creep.size.width + creep.size.width,
                y: (creep.current.pos.row  + ((creep.current['next'].pos.row - creep.current.pos.row) * creep.progress)) * creep.size.height + creep.size.height
            }
        }
    }

    function dealDamage(damages) {
        let removeMe = [];
        let stopBullets = [];
        let deadCreepPos = [];

        damages.forEach(damage => {
            if (creeps[damage.name] && !damage.splash && creeps[damage.name].health > 0) {
                creeps[damage.name].health -= damage.amount;
                if (creeps[damage.name].health <= 0) {
                    removeMe.push(damage.name);
                    stopBullets.push(damage.name);
                    deadCreepPos.push(creeps[damage.name]);
                }
            }
            else if (creeps[damage.name] && damage.splash && creeps[damage.name].health > 0) {
                let creepNames = findAllCreepsInRange(creeps[damage.name].center, damage.splash);
                for (let name in creepNames) {
                    let creep = creeps[creepNames[name]];
                    creep.health -= damage.amount;
                    if (creep.health <= 0) {
                        removeMe.push(creepNames[name]);
                        stopBullets.push(creepNames[name]);
                        deadCreepPos.push(creeps[creepNames[name]]);
                    }
                }
            }
        });

        for (let creep = 0; creep < removeMe.length; creep++) {
            delete creeps[removeMe[creep]];
        }

        removeMe.length = 0;

        return {stopBullets: stopBullets, deadCreepsPos: deadCreepPos};
    }

    function findAllCreepsInRange(center, range) {
        let creepsInRange = [];
        let x_0 = center.x;
        let y_0 = center.y;
        let rad = range * (size/16);


        Object.getOwnPropertyNames(creeps).forEach(function (value) {
            let creep = creeps[value];
            if (!creep.air) {
                if (creep.center.x >= x_0 - rad && creep.center.x <= x_0 + rad) {
                    if (creep.center.y >= y_0 - Math.sqrt(Math.pow(rad, 2) - Math.pow(creep.center.x - x_0, 2)) &&
                        creep.center.y <= y_0 + Math.sqrt(Math.pow(rad, 2) - Math.pow(creep.center.x - x_0, 2))) {
                        creepsInRange.push(value);
                    }
                }
            }
        });

        return creepsInRange;
    }

    function moveCreepsFromPos(pos) {
        Object.getOwnPropertyNames(creeps).forEach(function (value) {
            let creep = creeps[value];
            if (creep.current.pos.row === pos.row && creep.current.pos.col === pos.col) {
                creep.current = creep.current.next;
                creep.progress = 0;
            }
            else if (creep.current.next.pos.row === pos.row && creep.current.next.pos.col === pos.col) {
                creep.progress = 0;
            }
        })
    }

    //------------------------------------------------------------------
    //
    // Update the state of all particles.  This includes removing any that have exceeded their lifetime.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        let removeMe = [];
        let stopBullets = [];
        let escapedCreeps = [];

        //
        // We work with time in seconds, elapsedTime comes in as milliseconds
        elapsedTime = elapsedTime / 1000;

        Object.getOwnPropertyNames(creeps).forEach(function (value, index, array) {
            let creep = creeps[value];

            creep.frameTime += elapsedTime;
            if (creep.frameTime >= creepFrames[creep.type].frameTime) {
                 creep.frameTime -= creepFrames[creep.type].frameTime;
                 creep.frame = (creep.frame + 1) % creep.maxFrames;
            }

            creep.progress += elapsedTime * creep.speed;
            creep.distanceAway -= elapsedTime * creep.speed;

            if (creep.progress >= 1) {
                creep.progress -= 1;
                creep.current = creep.current['next'];
                if (creep.current['next'] === null) {
                    removeMe.push(value);
                    stopBullets.push(value);
                    escapedCreeps.push(creep);
                }
            }

            if (creep.current['next'] !== null) {
                creep.center = {
                    x: (creep.current.pos.col + ((creep.current['next'].pos.col - creep.current.pos.col) * creep.progress)) * creep.size.width + creep.size.width,
                    y: (creep.current.pos.row  + ((creep.current['next'].pos.row - creep.current.pos.row) * creep.progress)) * creep.size.height + creep.size.height
                }

                if (creep.current.next.pos.col > creep.current.pos.col) creep.direction = 'right';
                else if (creep.current.next.pos.col < creep.current.pos.col) creep.direction = 'left';
                else if (creep.current.next.pos.row > creep.current.pos.row) creep.direction = 'down';
                else creep.direction = 'up';
            }

        });

        //
        // Remove all of the expired particles
        for (let creep = 0; creep < removeMe.length; creep++) {
            delete creeps[removeMe[creep]];
        }
        removeMe.length = 0;

        return {stopBullets: stopBullets, escapedCreeps: escapedCreeps};
    }


    let api = {
        clear: clear,
        generateAirpaths: generateAirpaths,
        create: create,
        update: update,
        changePaths: changePaths,
        checkPaths: checkPaths,
        moveCreepsFromPos: moveCreepsFromPos,
        guessCreepLocation: guessCreepLocation,
        dealDamage: dealDamage,
        get creeps() { return creeps; }
    };

    return api;
}
