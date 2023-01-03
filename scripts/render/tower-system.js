MyGame.render.TowerSystem = function (system, graphics, assets) {
    'use strict'

    let towerImages = {
        base: assets['towerBase'],
        projectile1: assets['projectile1Tower'],
        projectile2: assets['projectile2Tower'],
        projectile3: assets['projectile3Tower'],
        guided1: assets['guided1Tower'],
        guided2: assets['guided2Tower'],
        guided3: assets['guided3Tower'],
        bomb1: assets['bomb1Tower'],
        bomb2: assets['bomb2Tower'],
        bomb3: assets['bomb3Tower'],
        mixed1: assets['mixed1Tower'],
        mixed2: assets['mixed2Tower'],
        mixed3: assets['mixed3Tower'],
    }


    function render() {
        Object.getOwnPropertyNames(system.towers).forEach(function (value) {
            let tower = system.towers[value];
            if (tower.selected) {
                graphics.drawRect({
                    center: tower.center,
                    width: graphics.canvas.height / 16,
                    height: graphics.canvas.height / 16,
                    style: 'rgba(0, 255, 100, 0.5)',
                    filled: true
                });
            }
            graphics.drawTexture(
                towerImages.base,
                tower.center,
                0,
                {width: graphics.canvas.height / 16, height: graphics.canvas.height / 16}
            );
            graphics.drawTexture(
                towerImages[tower.type + tower.level.toString()],
                tower.center,
                tower.rotation,
                {width: graphics.canvas.height / 24, height: graphics.canvas.height / 24}
            );
        });
    }

    let api = {
        render: render
    };

    return api;
}