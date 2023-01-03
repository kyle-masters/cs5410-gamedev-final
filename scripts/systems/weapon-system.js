MyGame.systems.WeaponSystem = function (size) {
    'use strict'
    let nextName = 1;
    let bullets = {};

    let bulletSizes = {
        projectile: {width: size/48/9, height: size/48},
        guided: {width: size/48, height: size/48},
        bomb: {width: size/48, height: size/48},
        mixed: {width: size/64, height: size/32}
    }

    function clear() {
        nextName = 1;
        bullets = {};
    }

    function create(myBullets) {
        function createBullet(name, type, start, end, damage, splash) {

            let direction = calculateAngle(start, end);
            let myEnd;
            if (type === "projectile" || type === "mixed") {
                myEnd = {
                    x: end.x - (bulletSizes[type].width/2 * direction.x),
                    y: end.y - (bulletSizes[type].height/2 * direction.y)
                }
            }
            else {
                myEnd = {
                    x: end.x,
                    y: end.y
                }
            }

            let b = {
                center: {
                    x: start.x,
                    y: start.y
                },
                start: start,
                end: myEnd,
                size: {
                    width: bulletSizes[type].width,
                    height: bulletSizes[type].height
                },
                type: type,
                damage: damage,
                splash: splash,
                direction: direction,
                rotation: direction.angle,
                speed: size/4,
                progress: 0,
                targetName: name,
            }

            bullets[nextName++] = b;
        }

        myBullets.forEach(value => {
            createBullet(value.name, value.type, value.start, value.end, value.damage, value.splash);
        });
    }

    function update(elapsedTime, creeps) {
        let removeMe = [];
        let toDamage = [];
        let bombTrail = [];
        let guidedTrail = [];
        let bombExplode = [];
        let guidedExplode = [];

        //
        // We work with time in seconds, elapsedTime comes in as milliseconds
        elapsedTime = elapsedTime / 1000;

        Object.getOwnPropertyNames(bullets).forEach(function(value) {
            let bullet = bullets[value];

            if (bullet.type === "projectile" || bullet.type === "bomb" || bullet.type === "mixed") {
                bullet.progress += 2 * elapsedTime;

                bullet.center.x = bullet.start.x + (bullet.end.x - bullet.start.x) * bullet.progress;
                bullet.center.y = bullet.start.y + (bullet.end.y - bullet.start.y) * bullet.progress;

                if (bullet.progress >= 1) {
                    removeMe.push(value);
                    toDamage.push({name: bullet.targetName, amount: bullet.damage, splash: bullet.splash});
                    if (bullet.type === "bomb") {
                        bombExplode.push(bullet.center);
                    }
                }
                if (bullet.type === "bomb") {
                    bombTrail.push(bullet.center);
                }
            }
            else if (bullet.type === "guided") {
                if (!!creeps[bullet.targetName]) {
                    bullet.direction = calculateAngle(bullet.center, creeps[bullet.targetName].center);

                    bullet.center.x += elapsedTime * bullet.speed * bullet.direction.x;
                    bullet.center.y += elapsedTime * bullet.speed * bullet.direction.y;

                    if (Math.abs(bullet.center.x - creeps[bullet.targetName].center.x) < size/80 &&
                        Math.abs(bullet.center.y - creeps[bullet.targetName].center.y) <size/80) {
                        removeMe.push(value);
                        toDamage.push({name: bullet.targetName, amount: bullet.damage, splash: bullet.splash});
                        guidedExplode.push(bullet.center);
                    }
                    guidedTrail.push(bullet.center);
                }
                else removeMe.push(value);
            }
        });

        for (let bullet = 0; bullet < removeMe.length; bullet++) {
            delete bullets[removeMe[bullet]];
        }

        removeMe.length = 0;
        return {toDamage: toDamage, bombTrails: bombTrail, guidedTrails: guidedTrail, bombExplode: bombExplode, guidedExplode: guidedExplode};
    }

    function killBullets(names) {
        let removeMe = [];

        Object.getOwnPropertyNames(bullets).forEach(function(value) {
            let bullet = bullets[value];

            for (let name in names) {
                if (bullet.targetName === names[name]) {
                    removeMe.push(value);
                }
            }
        });

        for (let bullet = 0; bullet < removeMe.length; bullet++) {
            delete bullets[removeMe[bullet]];
        }

        removeMe.length = 0;

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
            x: Math.cos(angle - Math.PI/2),
            y: Math.sin(angle - Math.PI/2)
        };
    }

    return {
        clear: clear,
        create: create,
        update: update,
        killBullets: killBullets,
        get bullets() { return bullets; }
    }
}