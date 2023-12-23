export class Camera {
  constructor(elem, spotlight, renderer) {
    const { clientWidth, clientHeight } = elem;
    const camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 1, 20000);
    camera.position.set(0, 0, -1);
    camera.lookAt(new THREE.Vector3(0, 0, 1));
    this.camera = camera;
    //this.controls = new THREE.OrbitControls(this.camera, renderer.domElement);
    this.cameraHelper = new THREE.CameraHelper(spotlight.shadow.camera);
  }
}
