MyGame.render.Background = (function (graphics) {
    'use strict';

    function render(spec) {
        graphics.drawTexture(spec.image, spec.center, spec.rotation, spec.size)
    }

    return {
        render : render
    }
}(MyGame.graphics));