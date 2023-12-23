export class Spotlight {
  constructor({ x, y, z } = { x: 0, y: 0, z:-200 }) {
    const spotlight = new THREE.PointLight(0x2e3440);
    spotlight.position.set(x, y, z);
    spotlight.castShadow = true;
    this.spotlight = spotlight;
    this.spotlightHelper = new THREE.PointLightHelper(spotlight);
  }
}

export class Moonlight {
  constructor() {
    this.moonlight = new THREE.AmbientLight(0xffffff);
  }
}
