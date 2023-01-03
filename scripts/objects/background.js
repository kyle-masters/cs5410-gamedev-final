MyGame.objects.Background = function(spec) {
    'use strict';

    let rotation = 0;
    let image = MyGame.assets[spec.imageSrc]

    let api = {
        get rotation() { return rotation; },
        get image() { return image; },
        get center() { return spec.center; },
        get size() { return spec.size; }
    };

    return api;
}