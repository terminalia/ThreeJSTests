window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.FEScene = function FEScene(container) {

    var self = this;
    self.TerminUtils = null;
    self.renderer = null;
    self.camera = null;
    self.orbit_controls = null;
    self.scene = null;
    self.stats = null;
    self.container = null;

    init(container)
    
    function init(container) {
        self.container = container;
        self.renderer = new THREE.WebGLRenderer();
        //self.renderer.setClearColor(0xff3344);
        self.renderer.setPixelRatio(window.devicePixelRatio);
        self.renderer.setSize(self.container.offsetWidth, self.container.offsetHeight);
        self.container.appendChild(self.renderer.domElement);

        self.TerminUtils =  new TERMINALIA.TerminUtils();
        
        initScene();
    }

    function initOrbitCamera() {
        self.camera = new THREE.PerspectiveCamera( 60, self.container.offsetWidth/self.container.offsetHeight, 0.1, 10000 );
        self.camera.position.z = 5;
        self.orbit_controls = new THREE.OrbitControls(self.camera, self.renderer.domElement);
    }

    function initScene() {
        self.scene = new THREE.Scene();
        initOrbitCamera();
        addLights();
        addAssets();
        addHUD();
    }

    function render() {
        requestAnimationFrame(render);
        self.renderer.render(self.scene, self.camera);
        self.stats.update();
    }

    function resize() {
        self.camera.aspect = self.container.offsetWidth/self.container.offsetHeight;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize(self.container.offsetWidth, self.container.offsetHeight);
    }

    function addAssets() {
        var cubeMat = new THREE.MeshLambertMaterial({color: 0xff3344});
        var cube = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), cubeMat);
        self.scene.add(cube);
    }

    function addLights() {
        var ambientLight = new THREE.AmbientLight(0xfaebd7);
        self.scene.add(ambientLight);
    }

    function addHUD() {
        self.stats = new Stats();
        self.container.appendChild(self.stats.domElement);
    }

    this.render = render;
    this.resize = resize;
}