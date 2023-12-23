export class Camera {
  constructor(elem) {
    const { clientWidth, clientHeight } = elem;
    const camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 1, 10000);
    camera.position.set(0, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 1));
    this.camera = camera;
  }
}
