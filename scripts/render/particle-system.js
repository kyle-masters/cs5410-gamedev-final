// --------------------------------------------------------------
//
// Renders the particles in a particle system
//
// --------------------------------------------------------------
MyGame.render.ParticleSystem = function(system, graphics, assets) {
    'use strict';

    let particleImages = {
            fire: assets['fire'],
            blueFire: assets['blueFire'],
            smoke: assets['smoke'],
            coin: assets['coin'],
    };


    //------------------------------------------------------------------
    //
    // Render all particles
    //
    //------------------------------------------------------------------
    function render() {
        Object.getOwnPropertyNames(system.particles).forEach( function(value) {
            let particle = system.particles[value];
            graphics.drawTexture(particleImages[particle.imageSrc], particle.center, particle.rotation, particle.size);
        });
    }

    let api = {
        render: render
    };

    return api;
};
