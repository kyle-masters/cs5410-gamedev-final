MyGame.render.WeaponSystem = function (system, graphics, assets) {

    let weaponImages = {
        projectile: assets['projectileBullet'],
        guided: assets['guidedBullet'],
        bomb: assets['bombBullet'],
        mixed: assets['mixedBullet']
    }

    function render() {
        Object.getOwnPropertyNames(system.bullets).forEach(function (value) {
            let bullet = system.bullets[value];

            graphics.drawTexture(
                weaponImages[bullet.type],
                bullet.center,
                bullet.rotation,
                {width: bullet.size.width, height: bullet.size.height}
            );
        });
    }

    let api = {
        render: render
    };

    return api;
}