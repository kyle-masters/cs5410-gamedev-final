MyGame.render.CreepSystem = function(system, graphics, assets) {
    'use strict';

    let creepImages = {
        images: {
            ground1: assets['ground1Creep'],
            ground2: assets['ground2Creep'],
            air: assets['airCreep']
        },
        info: {
            ground1: {up: 1, down: 0, left: 3, right: 2},
            ground2: {up: 0, down: 2, left: 3, right: 1},
            air: {width: 128, height: 128, up: 2, down: 0, left: 3, right: 1}
        }
    }

    function render() {
        Object.getOwnPropertyNames(system.creeps).forEach(function (value) {
            let creep = system.creeps[value];
            let sourceTopLeft = {
                x: creep.frame * (creepImages.images[creep.type].width / creep.maxFrames),
                y: creepImages.info[creep.type][creep.direction] * (creepImages.images[creep.type].height / 4)
            }
            let sourceSize = {
                width: creepImages.images[creep.type].width / creep.maxFrames,
                height: creepImages.images[creep.type].height / 4
            }
            graphics.drawAnimation(creepImages.images[creep.type], creep.center, 0, creep.size, sourceTopLeft, sourceSize);
            graphics.drawRect({
                style: 'red',
                center: {
                    x: creep.center.x,
                    y: creep.center.y - creep.size.height / 2
                },
                width: creep.size.width / 2,
                height: creep.size.height / 8,
                filled: true
            });
            graphics.drawRect({
                style: 'green',
                center: {
                    x: ((creep.center.x - creep.size.width / 4) + (creep.center.x - creep.size.width / 4 +
                        (creep.size.width / 2 * (creep.health / creep.maxHealth)))) / 2,
                    y: creep.center.y - creep.size.height / 2
                },
                width: (creep.size.width / 2) * (creep.health / creep.maxHealth),
                height: creep.size.height / 8,
                filled: true
            });
            graphics.drawRect({
                style: 'white',
                lineWidth: '2',
                center: {
                    x: creep.center.x,
                    y: creep.center.y - creep.size.height / 2
                },
                width: creep.size.width / 2,
                height: creep.size.height / 8,
                filled: false
            })
        });
    }

    let api = {
        render: render
    };

    return api;
};
