// --------------------------------------------------------------
//
// Creates a Text object, with functions for managing state.
//
// spec = {
//    text: ,
//    font: ,
//    fillStyle: ,
//    strokeStyle: ,
//    position: { x: , y: }
// }
//
// --------------------------------------------------------------
MyGame.objects.Text = function(spec) {
    'use strict';

    let rotation = 0;
    let text = spec.text;

    function setText(newText) {
        text = newText;
    }

    function setPosition(newPos) {
        spec.position = newPos;
    }

    function updateRotation(howMuch) {
        rotation += howMuch;
    }

    let api = {
        updateRotation: updateRotation,
        setText: setText,
        setPos: setPosition,
        get rotation() { return rotation; },
        get position() { return spec.position; },
        get text() { return text; },
        get font() { return spec.font; },
        get fillStyle() { return spec.fillStyle; },
        get strokeStyle() { return spec.strokeStyle; },
        get textAlign() { return spec.textAlign; }
    };

    return api;
}
