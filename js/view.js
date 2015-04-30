var container, stats;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED;
var _ = require('lodash');

var cubes = {};

var AddCube = function (cube) {
  var cubeMesh;
  if (_.has(cubes, cube.id)) {
    cubeMesh = cubes[cube.id];
  } else {
    var material =  new THREE.MeshLambertMaterial( { color: cube.color, shading: THREE.FlatShading } );
    var geometry = new THREE.BoxGeometry(WORLD_SCALE, WORLD_SCALE, WORLD_SCALE);
    cubeMesh = new THREE.Mesh(geometry, material);
    scene.add(cubeMesh);
  }
  cubes[cube.id] = cubeMesh;

  cubeMesh.position.x = cube.position.x;
  cubeMesh.position.y = cube.position.y;
  cubeMesh.position.z = cube.position.z;
  cubeMesh.material.color = cube.color;
};

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  stats.update();

  render();
}

function init() {
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 500;

  controls = new THREE.OrbitControls( camera );
  controls.damping = 0.2;
  controls.addEventListener( 'change', render );

  scene = new THREE.Scene();
  // world

  // lights

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( -1, -1, -1 );
  scene.add( light );

  light = new THREE.AmbientLight( 0x222222 );
  scene.add( light );

  raycaster = new THREE.Raycaster();

  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.sortObjects = false;

  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild( stats.domElement );

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  animate();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {

  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


function render() {
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children );

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      var color = INTERSECTED.material.emissive;
      INTERSECTED.material.emissive = color.offsetHSL(0, 0.3, 0.3);

    }

  } else {
    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    INTERSECTED = null;

  }

  renderer.render( scene, camera );
  stats.update();
}
