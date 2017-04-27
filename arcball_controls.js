window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.ArcballControls = function arcballControls(object, domElement) {
    
    var self = this;
    this.camera = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    this.position = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.up = new THREE.Vector3();
    this.right = new THREE.Vector3();
    
    this.radius = 15.0;
    this.phi = 0.0;
    this.theta = 0.0;
    
    this.leftPressed = false;
    this.rightPressed = false;
    this.enabled = true;
    this.mouseSensitivity = 0.0009;
    this.lastMouseX = 0.0;
    this.lastMousey = 0.0;

    function rotate(x, y) {
        self.phi += y;
        if (self.up.y < 0.0) {
            self.theta -= x;
        }
        else {
            self.theta += x;
        }

        computePosition();
    }

    function pan(x, y) {
        right = new THREE.Vector3(self.right);
        up = new THREE.Vector3(self.up);

        right.multiplyScalar(x);
        up.multiplyScalar(y);
        self.target.add(right).add(up);
        
        computePosition();
    }

    function zoom(distance) {
        radius -= distance;
        if (radius < 0.1) {
            radius = 0.1;
        }

        computePosition();
    }
    
    function computePosition() {
        var camPosX = Math.cos(self.theta) * Math.cos(self.phi) * self.radius;
        var camPosY = Math.sin(self.phi) * self.radius;
        var camPosZ = Math.sin(self.theta) * Math.cos(self.phi) * self.radius;

        self.position = new THREE.Vector3(camPosX, camPosY, camPosZ);
        self.position.addVectors(self.target, self.position);
        self.right = new THREE.Vector3(Math.cos(self.theta + Math.radians(90.0)), 
            0, 
            Math.sin(self.theta + Math.radians(90.0)));
        self.up.crossVectors(self.right, self.position);

        
    }

    function update() {
        this.camera.position = self.position;
        this.camera.up = self.up;
        //this.camera.objectSidewaysDirection = self.right;
        this.camera.target = self.target;
        this.camera.updateProjectionMatrix();
        //this.camera.lookAt(self.target);
        console.log(self.position);
    }

    function mousedown(event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.button == 0) {
            this.leftPressed = true;
        }
    }

    function mouseup(event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.button == 0) {
            this.leftPressed = false;
        }
    }

    function mousemove(event) {
        if (this.leftPressed) {
            var x_offset = event.clientX - lastMouseX;
            var y_offset = event.clientY - lastMouseY;

            //x_offset *= mouseSensitivity;
            //y_offset *= mouseSensitivity;

            rotate(x_offset, y_offset);
        }

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }

    this.domElement.addEventListener('contextmenu', function(event) { event.preventDefault(); });
    this.domElement.addEventListener('mousedown', mousedown, false);
    this.domElement.addEventListener('mouseup', mouseup, false);
    this.domElement.addEventListener('mousemove', mousemove, false);
    

    Math.radians = function(degrees) {
        return degrees * Math.PI / 180;
    };
 
    // Converts from radians to degrees.
    Math.degrees = function(radians) {
        return radians * 180 / Math.PI;
    };

    this.rotate = rotate;
    this.pan = pan;
    this.zoom = zoom;
    this.update = update;
}

