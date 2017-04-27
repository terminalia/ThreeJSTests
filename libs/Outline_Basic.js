var Outline_Basic = function(scene, utilities, svg){

	var silouette_basic;
	var silouette_box;

	var sub_container = new THREE.Object3D();
	scene.add(sub_container);


	var shape = utilities.transformSVGPath(svg.select("#out path").attr("d"));


	var geometry = new THREE.ShapeGeometry( shape );
	var material = new THREE.LineBasicMaterial( { color: 0x41b9e6, linewidth:2 } );
	var materialMesh = new THREE.MeshLambertMaterial();
	materialMesh.color = 0xfffff;
	material.side = THREE.DoubleSide;
	silouette_basic = new THREE.Mesh( geometry, material );
	silouette_basic.scale.set(0.5, 0.5, 0.5);
	silouette_basic.rotation.x = Math.PI/2;
	silouette_basic.position.x = -300;
	silouette_basic.position.z = -50;
	//silouette_basic.position.z = -1;
		
	sub_container.add(silouette_basic);

	silouette_box = new THREE.Box3().setFromObject( silouette_basic );
	var shiftx = silouette_box.getSize().x/2 * -1
	var shifty = silouette_box.getSize().y/2 * -1
	//sub_container.applyMatrix( new THREE.Matrix4().makeTranslation( shiftx, shifty, 0 ) );


	silouette_basic.visible = true;
	silouette_basic.material.opacity=1.0;
}