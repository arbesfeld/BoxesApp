var Cube = function (info) {
  this.id = info.id;
  this.position = (new THREE.Vector3(info.x, info.y, info.z)).multiplyScalar(WORLD_SCALE);
  this.color = new THREE.Color(info.r, info.g, info.b);

  return this;
};