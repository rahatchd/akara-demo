export class Spotlight {
    constructor({ x, y, z } = { x: 3000, y: 3000, z:-1 }, intensity=4, max_dist=6000) {
      const spotlight = new THREE.PointLight(0xffffff, intensity, max_dist, 1);
      spotlight.position.set(x, y, z);
      this.spotlight = spotlight;
    }
  }
  
  export class Moonlight {
    constructor() {
      this.moonlight = new THREE.AmbientLight(0xffffff);
    }
  }