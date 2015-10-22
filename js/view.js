var container, stats;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED;
var _ = require('lodash');

var cubes = {};

var COLORS = ['(255,0,0)', '(0,255,0)', '(0,0,255)', '(255,255,255)']
var INDEX = 0;

setInterval(function () {
  _.each(cubes, function (cube) {
    if (cube.nextColor != undefined) {
      BroadcastCubeWithIdAndColor(cube.name, cube.nextColor);
    }
  })
}, 1000);


var NextColor = function (currentColor) {

  // var r = Math.floor(Math.random() * 255);
  // var g = Math.floor(Math.random() * 255);
  // var b = Math.floor(Math.random() * 255);
  // var result = '(' + [r, g, b].join(',') + ')';
  INDEX = (INDEX + 1) % COLORS.length;
  return COLORS[INDEX];
};

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
  //cubeMesh.material.color = cube.color;

  cubeMesh.name = cube.id;
};

function buildAxis( src, dst, colorHex, dashed ) {
  var geom = new THREE.Geometry(),
      mat;

  if(dashed) {
          mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
  } else {
          mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
  }

  geom.vertices.push( src.clone() );
  geom.vertices.push( dst.clone() );
  geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

  var axis = new THREE.Line( geom, mat, THREE.LinePieces );

  return axis;
}

function buildAxes( length ) {
  var axes = new THREE.Object3D();

  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

  return axes;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  stats.update();

  render();
}

function init() {
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.y = -500;
  camera.position.x = 500;
  camera.position.z = 200;
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);

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

  axes = buildAxes( 1000 );
  scene.add(axes);

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
  window.addEventListener('click', onClick, false);

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

function onClick (event) {
  event.preventDefault();
  if (INTERSECTED) {
    var cubeId = INTERSECTED.name;
    var currentHex = INTERSECTED.material.color.getHex();
    var nextColor = NextColor(currentHex);

    if (cubeId == "4000") {
      INTERSECTED.nextColor = COLORS[INDEX+1];
    } else {
      INTERSECTED.nextColor = nextColor;
    }
    INTERSECTED.material.color = new THREE.Color('rgb' + nextColor);
    BroadcastCubeWithIdAndColor(cubeId, nextColor);
  }
}

serialPort.on('data', function(data) {
  var cubeA = [cubes["4000"]
  , cubes["3000"]
  , cubes["2000"]]
  if (data < 0 || data > 9) {
    return;
  }
  data --;
  var index = Math.floor(data / 3);
  var cube = cubeA[index];

  if (cube) {
     cube.nextColor = index == 0 ? COLORS[(data+1) % 3] : COLORS[data % 3];
     cube.material.color = new THREE.Color('rgb' + COLORS[data %3]);
  }
});

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
