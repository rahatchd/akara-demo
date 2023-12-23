import * as SKEL from '../constants/SKEL.js';

const {
  HEAD,
  NUM_JOINTS,
  DEFAULT_SKEL,
  BONES,
  JOINT_SIZE,
  HEAD_SIZE,
  SPHERE_SEGMENTS,
  CYLINDER_SIZE,
  CYLINDER_SEGMENTS,
  SHININESS,
  COLOR,
  DEPTH_OFFSET,
} = SKEL;

export class Skel {
  static getJointLocation(joint, frame) {
    const loc = new THREE.Vector3(
      frame[(3 * joint)],
      frame[(3 * joint) + 1] ,
      frame[(3 * joint) + 2] + DEPTH_OFFSET
    )
    return loc;
  }

  static Joints(frame = DEFAULT_SKEL) {
    const joints = [];
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(HEAD_SIZE, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
      new THREE.MeshPhongMaterial({ shininess: SHININESS, color: COLOR })
    );
    head.castShadow = true;
    head.position.copy(Skel.getJointLocation(HEAD, frame));
    joints.push(head);
    for (let i = 1; i < NUM_JOINTS; ++i) {
      const joint = new THREE.Mesh(
        new THREE.SphereGeometry(JOINT_SIZE, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
        new THREE.MeshPhongMaterial({ shininess: SHININESS, color: COLOR })
      );
      joint.castShadow = true;
      joint.position.copy(Skel.getJointLocation(i, frame));
      joints.push(joint);
    }
    return joints;
  }

  static getBoneOrientation(joints, frame) {
    const start = Skel.getJointLocation(joints[0], frame);
    const end = Skel.getJointLocation(joints[1], frame);
    const diff = new THREE.Vector3().subVectors(end, start); 
    const dir = diff.clone().normalize(); 
    const pos = start.addScaledVector(diff, 0.5);
    const len = diff.length();
    return { dir, pos, len };
  }

  static Bones(frame = DEFAULT_SKEL) {
    const bones = [];
    const axis = new THREE.Vector3(0, 1, 0);
    BONES.forEach(BONE => {
      const{ dir, pos, len } = Skel.getBoneOrientation(BONE, frame);
      const bone = new THREE.Mesh(
        new THREE.CylinderGeometry(CYLINDER_SIZE, CYLINDER_SIZE, len, CYLINDER_SEGMENTS),
        new THREE.MeshPhongMaterial({ shininess: SHININESS, color: COLOR })
      );
      bone.castShadow = true;
      bone.quaternion.setFromUnitVectors(axis, dir);
      bone.position.copy(pos);
      bones.push(bone);
    });
    return bones;
  }

  positionJoints(frame) {
    this.joints.forEach((joint, id) => {
      joint.position.copy(Skel.getJointLocation(id, frame));
    });
  }

  alignBones(frame) {
    BONES.forEach((BONE, id) => {
      const { dir, pos, len } = Skel.getBoneOrientation(BONE, frame);
      const arrow = new THREE.ArrowHelper(dir);
      this.bones[id].position.copy(pos);
      this.bones[id].rotation.copy(arrow.rotation);
    })
  }

  constructor(x = 0, y = 0, z = 0) {
    const object3d = new THREE.Object3D();
    const joints = Skel.Joints();
    joints.forEach(joint => {
      object3d.add(joint);
    });
    this.joints = joints;
    const bones = Skel.Bones();
    bones.forEach(bone => {
      object3d.add(bone);
    });
    this.bones = bones;
    object3d.castShadow = true;
    object3d.position.set(x, y, z);
    this.object3d = object3d;
  }

  updateFrame(frame = null) {
    if (frame) {
      this.positionJoints(frame);
      this.alignBones(frame);
    }
  }
}
