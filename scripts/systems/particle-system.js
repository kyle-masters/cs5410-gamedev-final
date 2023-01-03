//------------------------------------------------------------------
//
// This is the particle system use by the game code
//
//------------------------------------------------------------------
MyGame.systems.ParticleSystem = function() {
    'use strict';
    let nextName = 1;       // Unique identifier for the next particle
    let particles = {};

    let types = {
        creepDeath: {
            amount: 100,
            direction: {mean: 0, stdev: Math.PI},
            center: {x: 0, y: 0},
            size: {mean: 6, stdev: 1},
            speed: {mean: 30, stdev: 10},
            lifetime: {mean: 0.25, stdev: .05},
            imageSrc: 'fire'
        },
        bombTrail: {
            amount: 2,
            direction: {mean: 0, stdev: Math.PI},
            center: {x: 0, y: 0},
            size: {mean: 6, stdev: 1},
            speed: {mean: 3, stdev: 0.75},
            lifetime: {mean: 0.1, stdev: .02},
            imageSrc: 'smoke'
        },
        guidedTrail: {
            amount: 2,
            direction: {mean: 0, stdev: Math.PI},
            center: {x: 0, y: 0},
            size: {mean: 10, stdev: 3},
            speed: {mean: 5, stdev: 1},
            lifetime: {mean: 0.25, stdev: .05},
            imageSrc: 'blueFire'
        },
        bombExplosion: {
            amount: 100,
            direction: {mean: 0, stdev: Math.PI},
            center: {x: 0, y: 0},
            size: {mean: 4, stdev: 1},
            speed: {mean: 60, stdev: 30},
            lifetime: {mean: 0.25, stdev: .05},
            imageSrc: 'smoke'
        },
        guidedExplosion: {
            amount: 100,
            direction: {mean: 0, stdev: Math.PI},
            center: {x: 0, y: 0},
            size: {mean: 4, stdev: 1},
            speed: {mean: 60, stdev: 15},
            lifetime: {mean: 0.25, stdev: .05},
            imageSrc: 'blueFire'
        },
        sellTower: {
            amount: 50,
            direction: {mean: 0, stdev: Math.PI},
            center: {x: 0, y: 0},
            size: {mean: 8, stdev: 2},
            speed: {mean: 10, stdev: 20},
            lifetime: {mean: 0.5, stdev: .1},
            imageSrc: 'coin'
        }
    }

    function clear() {
        nextName = 1;
        particles = {};
    }

    //------------------------------------------------------------------
    //
    // This creates one new particle
    //
    //------------------------------------------------------------------
    function create(type) {
        let size = Random.nextGaussian(types[type].size.mean, types[type].size.stdev);
        return {
            center: {x: types[type].center.x, y: types[type].center.y},
            size: {width: size, height: size},
            direction: Random.nextAngle(Random.nextGaussian(types[type].direction.mean, types[type].direction.stdev)),
            speed: Random.nextGaussian(types[type].speed.mean, types[type].speed.stdev), // pixels per second
            rotation: 0,
            lifetime: Random.nextGaussian(types[type].lifetime.mean, types[type].lifetime.stdev),    // How long the particle should live, in seconds
            alive: 0,    // How long the particle has been alive, in seconds
            imageSrc: types[type].imageSrc
        };
    }

    function addParticles(center, type) {
        types[type].center = center;

        for (let particle = 0; particle < types[type].amount; particle++) {
            particles[nextName++] = create(type);
        }
    }

    //------------------------------------------------------------------
    //
    // Update the state of all particles.  This includes removing any that have exceeded their lifetime.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        let removeMe = [];

        //
        // We work with time in seconds, elapsedTime comes in as milliseconds
        elapsedTime = elapsedTime / 1000;

        Object.getOwnPropertyNames(particles).forEach(function(value, index, array) {
            let particle = particles[value];
            //
            // Update how long it has been alive
            particle.alive += elapsedTime;

            //
            // Update its center
            particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
            particle.center.y += (elapsedTime * particle.speed * particle.direction.y);

            //
            // Rotate proportional to its speed
            particle.rotation += particle.speed / 500;

            //
            // If the lifetime has expired, identify it for removal
            if (particle.alive > particle.lifetime) {
                removeMe.push(value);
            }
        });

        //
        // Remove all of the expired particles
        for (let particle = 0; particle < removeMe.length; particle++) {
            delete particles[removeMe[particle]];
        }
        removeMe.length = 0;

        //
        // Generate some new particles

    }


    let api = {
        clear: clear,
        update: update,
        addParticles: addParticles,
        get particles() { return particles; },
    };

    return api;
}
