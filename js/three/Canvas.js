import {
  WIDTH,
  HEIGHT,
  DEPTH
} from '../constants/CANVAS.js'

export class Canvas {
  constructor(elem) {
    const { clientWidth, clientHeight } = elem;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x2e3440);
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.shadowMap.enabled = true;
    elem.appendChild(this.renderer.domElement);
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(WIDTH, HEIGHT),
      new THREE.MeshPhongMaterial({ color: 0x81a1c1 })
    );
    wall.rotateY(Math.PI);
    wall.position.set(0, 0, DEPTH);
    wall.receiveShadow = true;
    this.scene.add(wall);
    // this.scene.add(new THREE.AxesHelper(5000));
  }
}
