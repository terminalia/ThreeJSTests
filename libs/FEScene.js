window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.FEScene = function FEScene(container, CustomShaders) {

    var self = this;
    self.TerminUtils = null;
    self.renderer = null;
    self.camera = null;
    self.cameraOrtho = null;
    self.orbit_controls = null;
    self.scene = null;
    self.sceneOrtho = null;
    self.stats = null;
    self.container = null;
    self.reflectionMap = null;
    self.pinsGroup = null;
    self.glarePlaneSize = 312;
    self.customShaders = CustomShaders;
    self.dirLight = null;
    self.cameraAnimation = null;
    self.worldAnimation = null;
    self.world = null;

    init(container)
    
    //CONSTRUCTOR
    function init(container) {
        self.container = container;
        self.renderer = new THREE.WebGLRenderer({ antialias: true });
        self.renderer.setClearColor(new THREE.Color(0x0555fa))
        self.renderer.setPixelRatio(window.devicePixelRatio);
        self.renderer.autoClear = false;
        self.renderer.setSize(self.container.offsetWidth, self.container.offsetHeight);
        self.container.appendChild(self.renderer.domElement);
        self.TerminUtils =  new TERMINALIA.TerminUtils();
        
        initScene();
    }

    //INIT THE SCENE
    function initScene() {
        self.scene = new THREE.Scene();
        self.sceneOrtho = new THREE.Scene();
        self.pinsGroup = new THREE.Group();
        initOrbitCamera();
        initOrthoCamera();
        addLights();
        addCubeMap('/assets/textures/cubemaps/parliament/', '.jpg');
        addAssets();
        addPins();
        addOrthoAssets();
        addInfoFlags();
        addHUD();
    }

    //###########################################################################################################
    // CAMERAS
    //###########################################################################################################

    //Init borbit camera
    function initOrbitCamera() {
        self.camera = new THREE.PerspectiveCamera( 60, self.container.offsetWidth/self.container.offsetHeight, 0.1, 6000 );
        self.camera.position.set(2, 1, 3);
        self.camera.updateProjectionMatrix();
        self.orbit_controls = new THREE.OrbitControls(self.camera, self.renderer.domElement);
        self.orbit_controls.maxPolarAngle = Math.PI/2 - 0.1;
        self.orbit_controls.enableZoom = true;
        self.orbit_controls.target.set(0, 0, 0);
    }

    //Init ortho camera
    function initOrthoCamera() {
        var width = self.container.offsetWidth;
        var height = self.container.offsetHeight;
        self.cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
        self.cameraOrtho.position.z = 10;
    }

    //Render routine
    function render() {
        TWEEN.update();
        self.renderer.clear();
        self.renderer.render(self.scene, self.camera);
        self.renderer.clearDepth();
        self.renderer.render(self.sceneOrtho, self.cameraOrtho);
        requestAnimationFrame(render);
        self.stats.update();
    }

    //###########################################################################################################
    // EVENTS
    //###########################################################################################################

    //Called when container is resized
    function resize() {
        self.camera.aspect = self.container.offsetWidth/self.container.offsetHeight;
        self.camera.updateProjectionMatrix();
        self.cameraOrtho.left = - self.container.offsetWidth / 2;
        self.cameraOrtho.right = self.container.offsetWidth / 2;
        self.cameraOrtho.top = self.container.offsetHeight / 2;
        self.cameraOrtho.bottom = - self.container.offsetHeight / 2;
        self.cameraOrtho.updateProjectionMatrix();

        updateOrthoAssetsSize();
        self.renderer.setSize(self.container.offsetWidth, self.container.offsetHeight);
    }

    //Find object using raycaster when user click/tap on an object
    function findObjectOnClick(event) {
        event.preventDefault();
        var vector = new THREE.Vector3( ( event.clientX / container.offsetWidth ) * 2 - 1, - ( event.clientY / container.offsetHeight ) * 2 + 1, 0.5 );
        vector.unproject(self.camera);
        var raycaster = new THREE.Raycaster(self.camera.position,vector.sub(self.camera.position).normalize());
        var intersected = raycaster.intersectObjects(self.pinsGroup.children);

        if (intersected.length > 0) {
            for (var i=0; i<self.pinsGroup.children.length; i++) {
                if (intersected[0].object.name === self.pinsGroup.children[i].name) {
                    switch (i) {
                        case 0:
                            createAnimation(new THREE.Vector3(2, 1, 4));
                        break;

                        case 1:
                            createAnimation(new THREE.Vector3(3, 3, 0.8));
                        break;

                        case 2:
                            createAnimation(new THREE.Vector3(2, 3, -3));
                        break;
                    }
                    break;
                }
            }
        }
    }

    //###########################################################################################################
    // LIGTHS & ENVIRONMENT
    //###########################################################################################################

    //Add lights to the scene
    function addLights() {
        var ambientLight = new THREE.AmbientLight(0xfaebd7);
        self.scene.add(ambientLight);
    }

    //Add reflection cubemap
    function addCubeMap(path, format) {
        self.reflectionMap = self.TerminUtils.createCubeMapTexture(path, format);
        self.reflectionMap.format = THREE.RGBFormat;
    }

    //###########################################################################################################
    // ASSETS
    //###########################################################################################################
    
    function addAssets() {
        addCar();
        addCircuit();

        addWorld();
    }

    //Add assets to create the car
    function addCar() {
        //BODY
        var carGroup = new THREE.Group();

        var carBodyMat = self.TerminUtils.createTextureReflectiveMaterial('assets/textures/car_body.png', self.reflectionMap, .5);
        var carBody = self.TerminUtils.loadObjModel("CarBody", 'assets/models/obj/carbody.obj', carBodyMat);
        carGroup.add(carBody);

        //MECHANICAL
        var carMechanicalMat = self.TerminUtils.createTextureReflectiveMaterial('assets/textures/car_mechanical.png', self.reflectionMap, .5);
        var carMechanical = self.TerminUtils.loadObjModel("CarMechanical", 'assets/models/obj/carmechanical.obj', carMechanicalMat);
        carGroup.add(carMechanical);

        //WHEELS
        var carWheelsMat = self.TerminUtils.createTextureMaterial('assets/textures/car_wheels.jpg');
        var carWheels = self.TerminUtils.loadObjModel("CarWheels", 'assets/models/obj/carwheels.obj', carWheelsMat);
        carGroup.add(carWheels);

        //TYRES
        var carTyresMat = new THREE.MeshLambertMaterial( { color: 0xcbcfd6, envMap: self.reflectionMap, combine: THREE.MixOperation, reflectivity: 1.0} );
        var carTyres = self.TerminUtils.loadObjModel("CarWheels", 'assets/models/obj/cartyres.obj', carTyresMat);
        carGroup.add(carTyres);

        //ADD SHADOW MAP
        var shadowMap = self.TerminUtils.createTexture("assets/textures/car_shadow_bake.png");
        var shadowMapMaterial = new THREE.MeshBasicMaterial({map: shadowMap, color: 0xffffff});
        shadowMapMaterial.transparent = true;
        shadowMapMaterial.opacity = 0.7;
        var plane = self.TerminUtils.loadObjModel("ShadowPlane", 'assets/models/obj/ShadowPlane.obj', shadowMapMaterial);
        carGroup.add(plane);

        self.scene.add(carGroup);
    }
    
    //Add clickable pins
    function addPins() {
        var pin1 = self.TerminUtils.createSprite('Pin1', 'assets/textures/circle_icon1.png');
        pin1.scale.set(0.3, 0.3, 0.3);
        pin1.position.set(0.3, 0.7, 2.3);           
        self.pinsGroup.add(pin1);
        console.log(self.pinsGroup.children[0].name)

        var pin2 = self.TerminUtils.createSprite('Pin2', 'assets/textures/circle_icon2.png');
        pin2.scale.set(0.3, 0.3, 0.3);
        pin2.position.set(0.8, 0.8, 0);
        self.pinsGroup.add(pin2);

        var pin3 = self.TerminUtils.createSprite('Pin3', 'assets/textures/circle_icon3.png');
        pin3.scale.set(0.3, 0.3, 0.3);
        pin3.position.set(0, 1.2, -2);
        self.pinsGroup.add(pin3);

        self.scene.add(self.pinsGroup);
    }

    //Add info flags
    function addInfoFlags() {
        var flagSize = new THREE.Vector3(1.5, 1.5, 1.5);
        var powerFlag = self.TerminUtils.createSprite('Sprite4', 'assets/textures/bandiera_power.png');
        powerFlag.scale.set(flagSize.x, flagSize.y, flagSize.z);
        powerFlag.position.set(0, 1.2, 1);
        self.scene.add(powerFlag);

        var speedFlag = self.TerminUtils.createSprite('Sprite4', 'assets/textures/bandiera_speed.png');
        speedFlag.scale.set(flagSize.x, flagSize.y, flagSize.z);
        speedFlag.position.set(0, 1.2, -2);
        self.scene.add(speedFlag);
    }

    //Add circuit buildings
    function addCircuit() {
        var toonShader = self.customShaders['ToonShader'];
        var uniforms_ = THREE.UniformsUtils.clone(toonShader.uniforms);

        var vs = toonShader.vertexShader;
        var fs = toonShader.fragmentShader;

        //We add here a light because custom toon shader needs a light
        var dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(0, 10, -25);
        self.scene.add(dirLight);
        var helper = new THREE.DirectionalLightHelper( dirLight);
        self.scene.add(helper);

        var toonMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms_,
            vertexShader: vs,
            fragmentShader: fs,
        });

        //0x0555fc
        toonMaterial.uniforms.uMaterialColor.value = new THREE.Color(0x0555fc);
        toonMaterial.uniforms.uTone1.value = 0.76;
        toonMaterial.uniforms.uTone2.value = 0.76;
        toonMaterial.uniforms.uDirLightPos.value = dirLight.position;
        toonMaterial.uniforms.uDirLightColor.value = dirLight.color;

        var circuit = self.TerminUtils.loadObjModel('Circuit', 'assets/models/obj/berlin_04.obj', toonMaterial);
        circuit.scale.set(50, 50, 50);
        circuit.rotation.set(0, radians(180), 0);
        self.scene.add(circuit);
    }

    function addWorld() {
        var worldTexture = self.TerminUtils.createTexture('assets/textures/world_white.png');
        var worldMaterial = new THREE.MeshBasicMaterial({map: worldTexture});
        worldMaterial.transparent = true;
        worldMaterial.opacity = 0;
        //self.world = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 20, 20), worldMaterial);
        self.world = self.TerminUtils.loadObjModel('World', 'assets/models/obj/World.obj', worldMaterial);
        self.world.scale.set(3000, 3000, 3000);
        self.world.position.set(0, -10001, 0);
        self.world.rotation.set(0, 0, radians(90))
        self.scene.add(self.world);
    }

    //###########################################################################################################
    // ANIMATIONS
    //###########################################################################################################

    //Create and start a new animation passing a new position
    function createAnimation(new_position) {
        self.cameraAnimation = new TWEEN.Tween(self.camera.position)
            .to({x: new_position.x, y: new_position.y, z: new_position.z}, 2000)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(function () {
                self.camera.position.set(this.x, this.y, this.z);
                self.orbit_controls.update();
            })
        .onComplete(function() {
        });

        self.cameraAnimation.start();
    }

    //Create and start a new animation taking an array as argument
    function startCameraAnimation(new_position) {
        var newPos = new THREE.Vector3(new_position[0], new_position[1], new_position[2]);
        createAnimation(newPos);
    }

    function startCameraWorldAnimation(index, new_camera_position, new_world_position, new_world_rotation, world_anim_duration) {
        var counter = 0;
        var new_camera_pos = new THREE.Vector3(new_camera_position[0], new_camera_position[1], new_camera_position[2]);
        var new_world_pos = new THREE.Vector3(new_world_position[0], new_world_position[1], new_world_position[2]);
        var new_world_rot = new THREE.Vector3(new_world_rotation[0], new_world_rotation[1], new_world_rotation[2]);

        self.world.children[0].children[0].material.opacity = 1;
        var worldRotAnimation = new TWEEN.Tween(self.world.rotation)
            .to({x: radians(new_world_rot.x), y: radians(new_world_rot.y), z: radians(new_world_rot.z)}
            , world_anim_duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(function(){
            })
            .onComplete(function(){
            });

        var worlPosAnimation = new TWEEN.Tween(self.world.position)
            .to({
                x: new_world_pos.x, 
                y: new_world_pos.y, 
                z: new_world_pos.z
                }, world_anim_duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(function () {
                self.world.position.set(this.x, this.y, this.z);
            })
            .onComplete(function() {
                
            });

        self.cameraAnimation = new TWEEN.Tween(self.camera.position)
            .to({x: new_camera_pos.x, y: new_camera_pos.y, z: new_camera_pos.z}, 2000)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(function () {
                counter++;
                if (counter === 20) {
                    if (index !== 2)
                        worldRotAnimation.start();
                    worlPosAnimation.start();
                }
                self.camera.position.set(this.x, this.y, this.z);
                self.orbit_controls.update();
            })
        .onComplete(function() {
            if (index === 2)
                    worldRotAnimation.start();
        });
        self.cameraAnimation.start();
    }

    //###########################################################################################################
    // ORTHOGRAPHIC LAYER
    //###########################################################################################################

    //Add ortho assets to the scene
    function addOrthoAssets() {
        var width = self.container.offsetWidth;
        var height = self.container.offsetHeight;

        var gradientMap = self.TerminUtils.createTexture("assets/textures/test_gradient_ortho.png");
        var gradientMaterial = new THREE.MeshBasicMaterial({map: gradientMap});
        gradientMaterial.transparent = true;
        gradientMaterial.opacity = 1;

        var size =  (width / height) * self.glarePlaneSize;

        var orthoGlarePlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 1), gradientMaterial);
        orthoGlarePlane.scale.set(size, size, 1);
        orthoGlarePlane.position.set(-width/2 + size/2, height/2 - size/2, 1);
        self.sceneOrtho.add(orthoGlarePlane);
    }

    //Update ortho assets size when container is resized
    function updateOrthoAssetsSize() {
        var width = self.container.offsetWidth;
        var height = self.container.offsetHeight;

        var size = (width/height) * self.glarePlaneSize;

        for (var i=0; i<self.sceneOrtho.children.length; i++) {
            self.sceneOrtho.children[i].scale.set(size, size, 1);
            self.sceneOrtho.children[i].position.set(-width/2 + size/2, height/2 - size/2, 1);
        }
    }

    //###########################################################################################################
    // HUD & UI
    //###########################################################################################################

    //Add UI elements
    function addHUD() {
        self.stats = new Stats();
        self.container.appendChild(self.stats.domElement);
    }

    function rotateWorld(angle) {
        self.world.rotateY(radians(angle));
    }    
    
    function radians(degrees) {
        return degrees * Math.PI / 180;
    }

    function getCameraPosition() {
        console.log(self.camera.position);
    }

    this.render = render;
    this.resize = resize;
    this.findObjectOnClick = findObjectOnClick;
    this.startCameraAnimation = startCameraAnimation;
    this.getCameraPosition = getCameraPosition;
    this.startCameraWorldAnimation = startCameraWorldAnimation;
    this.rotateWorld = rotateWorld;
}