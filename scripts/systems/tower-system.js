MyGame.systems.TowerSystem = function(size) {
    'use strict'

    let typeDictionary = {
        projectile: {
            1: {
                fireRate: 1,
                damage: 10,
                range: 2.5,
                splash: false,
                targetsAir: false,
                targetsGround: true,
                cost: 100
            },
            2: {
                fireRate: 0.8,
                damage: 15,
                range: 2.75,
                splash: false,
                cost: 200
            },
            3: {
                fireRate: 0.5,
                damage: 20,
                range: 3,
                splash: false,
                cost: 400
            }
        },
        guided: {
            1: {
                fireRate: 1,
                damage: 10,
                range: 3.5,
                splash: false,
                targetsAir: true,
                targetsGround: false,
                cost: 100
            },
            2: {
                fireRate: 1,
                damage: 20,
                range: 3.75,
                splash: false,
                cost: 200
            },
            3: {
                fireRate: 1,
                damage: 30,
                range: 4,
                splash: false,
                cost: 400
            }
        },
        bomb: {
            1: {
                fireRate: 1,
                damage: 8,
                range: 2.5,
                splash: 1,
                targetsAir: false,
                targetsGround: true,
                cost: 150
            },
            2: {
                fireRate: 1,
                damage: 16,
                range: 3,
                splash: 1.25,
                cost: 350
            },
            3: {
                fireRate: 1,
                damage: 24,
                range: 3.5,
                splash: 1.5,
                cost: 650
            },
        },
        mixed: {
            1 : {
                fireRate: 1/3,
                damage: 2,
                range: 3,
                splash: false,
                targetsAir: true,
                targetsGround: true,
                cost: 200
            },
            2 : {
                fireRate: 1/6,
                damage: 2,
                range: 3.25,
                splash: false,
                cost: 400
            },
            3 : {
                fireRate: 1/15,
                damage: 2,
                range: 3.5,
                splash: false,
                cost: 1000
            },
        }
    }

    let towers = {};
    let selectedName;
    let towerSelected = false;
    let cellSize = size;

    function clear() {
        selectedName = null;
        towerSelected = false;
        towers = {};
    }

    function add(type, x, y, center) {
        let name = parseInt(x).toString().padStart(2, '0') + parseInt(y).toString().padStart(2, '0');
        if (towers[name]) return false;
        towers[name] = {
            type: type,
            level: 1,
            fireRate: typeDictionary[type][1].fireRate,
            damage: typeDictionary[type][1].damage,
            range: typeDictionary[type][1].range,
            splash: typeDictionary[type][1].splash,
            targetsAir: typeDictionary[type][1].targetsAir,
            targetsGround: typeDictionary[type][1].targetsGround,
            cost: typeDictionary[type][2].cost,
            sellPrice: typeDictionary[type][1].cost/2,
            coolDown: 0,
            rotation: 0,
            coordinates: {x: x, y: y},
            center: center,
            selected: false
        }
        return true;
    }

    function upgrade(x, y) {
        let name = parseInt(x).toString().padStart(2, '0') + parseInt(y).toString().padStart(2, '0');
        towers[name].level += 1;
        towers[name].fireRate = typeDictionary[towers[name].type][towers[name].level].fireRate;
        towers[name].damage = typeDictionary[towers[name].type][towers[name].level].damage;
        towers[name].range = typeDictionary[towers[name].type][towers[name].level].range;
        towers[name].splash = typeDictionary[towers[name].type][towers[name].level].splash;
        if (towers[name].level < 3) towers[name].cost = typeDictionary[towers[name].type][towers[name].level + 1].cost;
        towers[name].sellPrice += typeDictionary[towers[name].type][towers[name].level].cost/2;
    }

    function remove(x, y) {
        let name = parseInt(x).toString().padStart(2, '0') + parseInt(y).toString().padStart(2, '0');
        delete towers[name];
        deSelectTower();
    }

    function selectTower(name) {
        selectedName = name;
        towerSelected = true;
    }

    function deSelectTower() {
        selectedName = null;
        towerSelected = false;
    }

    function isTowerAt(x, y) {
        let name = parseInt(x).toString().padStart(2, '0') + parseInt(y).toString().padStart(2, '0');
        return !!towers[name];
    }

    function update(elapsedTime, creeps) {
        let bullets = [];
        Object.getOwnPropertyNames(towers).forEach(function(name, index, array) {
            if (!name.startsWith("-")) {
                towers[name].coolDown -= elapsedTime / 1000;
                let target = null;
                let creepName;
                Object.getOwnPropertyNames(creeps.creeps).forEach(function (value, index, array) {
                    if((creeps.creeps[value].air && towers[name].targetsAir) || (!creeps.creeps[value].air && towers[name].targetsGround)) {
                        let loc = creeps.guessCreepLocation(value, 0.5);
                        if (loc !== null) {
                            if (isInRange(name, loc)) {
                                if (target === null) {
                                    target = creeps.guessCreepLocation(value, 0.5);
                                    creepName = value;
                                } else {
                                    if (creeps.creeps[creepName].distanceAway > creeps.creeps[value].distanceAway) {
                                        target = creeps.guessCreepLocation(value, 0.5);
                                        creepName = value;
                                    }
                                }
                            }
                        }
                    }});


                if (target !== null) {
                    let end = target;
                    let start = towers[name].center;
                    if (towers[name].coolDown <= 0) {
                        bullets.push({
                            name: creepName,
                            type: towers[name].type,
                            start: start,
                            end: end,
                            damage: towers[name].damage,
                            splash: towers[name].splash
                        });
                        towers[name].coolDown = towers[name].fireRate;
                    }

                    let direction = calculateAngle(start, end);
                    towers[name].rotation = direction.angle;
                }
            }
        });
        return bullets;
    }

    function isInRange(name, center) {
        if (name.startsWith("-")) return false;
        let x_0 = towers[name].center.x;
        let y_0 = towers[name].center.y;
        let rad = towers[name].range * cellSize;
        if (center.x >= x_0 - rad && center.x <= x_0 + rad) {
            if (center.y >= y_0 - Math.sqrt(Math.pow(rad, 2) - Math.pow(center.x - x_0, 2)) &&
            center.y <= y_0 + Math.sqrt(Math.pow(rad, 2) - Math.pow(center.x - x_0, 2))) {
                return true;
            }
        }
        return false;
    }

    function calculateAngle(start, end) {
        let xChange = end.x - start.x;
        let yChange = end.y - start.y;
        let relativeAngle, yDir, angle;
        if (xChange === 0) {
            relativeAngle = 0;
        }
        else {
            relativeAngle = Math.atan(xChange/yChange);
        }
        if (yChange === 0) {
            yDir = 0;
        }
        else {
            yDir = yChange/Math.abs(yChange);
        }

        if (yDir === -1) angle = -relativeAngle;
        else angle = Math.PI - relativeAngle;

        return {
            angle: angle,
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    let api = {
        clear: clear,
        update: update,
        add: add,
        upgrade: upgrade,
        selectTower: selectTower,
        deSelectTower: deSelectTower,
        isTowerAt: isTowerAt,
        remove: remove,
        get towers() { return towers; },
        get selectedTower() { return selectedName; },
        get isTowerSelected() { return towerSelected; },
        get info() {return typeDictionary; }
    }

    return api;
}