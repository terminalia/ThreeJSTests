/**
 * CREATED BY L. Zanconi
 * A SIMPLE ARCBALL IMPLEMENTATION ROTATING THE OBJECT INSTEAD OF CAMERA
 */
window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.Trackball = function Trackball(rot_offset) {

    var self = this;
    self.last_x = 0;
    self.last_y = 0;
    self.rot_x = 0;
    self.rot_y = 0;
    self.object = null;
    self.leftPressed = false;
    self.offset = 20;
    self.enabled = true;

    function onMouseDown(x, y) {
        self.leftPressed = true;
        self.last_x = x;
        self.last_y = y;
        console.log("Mouse Down", self.leftPressed);
    }

    function onMouseUp() {
        self.leftPressed = false;
    }

    function onMouseMove(x, y) {
        var diff_x = x - last_x;
        var diff_y = y - last_y;
        last_x = x;
        last_y = y;

        if (self.leftPressed && self.enabled) {
            console.log("Mouse Move");
            rot_x += diff_x;
            rot_y += diff_y;

            self.object.rotation.set(radians(self.offset), radians(rot_x), 0);
        }
    }

    function addRotationToObject(object) {
        self.object = object;
        console.log(self.object);
    }

    function radians(degrees) {
        return degrees * Math.PI / 180;
    }

    self.onMouseDown = onMouseDown;
    self.onMouseUp = onMouseUp;
    self.onMouseMove = onMouseMove;
    self.addRotationToObject = addRotationToObject;
}
