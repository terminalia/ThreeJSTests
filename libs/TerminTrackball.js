/**
 * CREATED BY L. Zanconi
 * A SIMPLE ARCBALL IMPLEMENTATION ROTATING THE OBJECT INSTEAD OF CAMERA
 */
window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.Trackball = function Trackball() {

    var self = this;
    self.last_x = 0;
    self.last_y = 0;
    self.rot_x = 0;
    self.rot_y = 0;
    self.leftPressed = false;
    self.object = null;

    function rotateObject(enabled, x, y) {
        console.log(x,y)
        var diff_x = x - self.last_x;
        var diff_y = y - self.last_y;
        self.last_x = x;
        self.last_y = y;

        if (enabled) {
            self.rot_x += 0.005 * diff_x;
            self.rot_y += 0.005 * diff_y;

            console.log(self.last_x, self.last_y);
            self.object.rotation.set(self.rot_y, self.rot_x, 0);
        }
    }

    function addRotationToObject(object) {
        self.object = object;
    }

    self.rotateObject = rotateObject;
    self.addRotationToObject = addRotationToObject;
}
