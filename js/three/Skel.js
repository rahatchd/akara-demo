import * as SKEL from '../constants/SKEL.js';

const {
  HEAD,
  DEFAULT_SKEL,
  JOINTS,
  BONES,
  JOINT_SIZE,
  HEAD_SIZE,
  SPHERE_SEGMENTS,
  CYLINDER_SIZE,
  CYLINDER_SEGMENTS,
  SHININESS,
  JOINT_COLOR,
  BONE_COLOR,
  DUMBBELL_COLOR,
  DUMBBELLS,
  DUMBBELL_BAR_THICKNESS,
  DUMBBELL_BAR_LENGTH,
  DUMBBELL_PLATE_THICKNESS,
  DUMBBELL_PLATE_LENGTH,
  INITIAL_ROTATION,
} = SKEL;

export class Skel {
  //Move the skeleton to the center of the frame, and face it forward
  static normalize(frame) {
    let new_frame = frame.slice();
    const joint_sum = new THREE.Vector3().addVectors(Skel.getJointLocation(SKEL.SPINESHOULDER, frame), Skel.getJointLocation(SKEL.HIP_CENTER, frame));
    const joint_average = joint_sum.multiplyScalar(0.5);
    let joint_cross = new THREE.Vector3().crossVectors(
      new THREE.Vector3().subVectors(Skel.getJointLocation(SKEL.HIP_LEFT, frame), Skel.getJointLocation(SKEL.HIP_RIGHT, frame)),
      new THREE.Vector3(0, 1, 0),
    ).normalize();
    const desired_rotation = Math.atan2(joint_cross.x, -joint_cross.z);
    const cos_val = Math.cos(desired_rotation);
    const sin_val = Math.sin(desired_rotation);
    for (let i = 0; i < frame.length; i += 3) {
      new_frame[i] -= joint_average.x;
      new_frame[i + 2] -= joint_average.z;
      const new_x = new_frame[i] * cos_val + new_frame[i + 2] * sin_val;
      new_frame[i + 2] = -new_frame[i] * sin_val + new_frame[i + 2] * cos_val;
      new_frame[i] = -new_x;
    }
    return new_frame;
  }

  static getJointLocation(joint, frame) {
    return new THREE.Vector3(
      frame[(3 * joint)],
      frame[(3 * joint) + 1],
      frame[(3 * joint) + 2]
    );
  }

  static Joints(frame = DEFAULT_SKEL) {
    const joints = [];
    // Create the head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(HEAD_SIZE, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
      new THREE.MeshPhongMaterial({ shininess: SHININESS, color: JOINT_COLOR })
    );
    head.position.copy(Skel.getJointLocation(HEAD, frame));
    joints.push(head);
    // Create spheres for each joint
    for (let i = 1; i < JOINTS.length; ++i) {
      const joint = new THREE.Mesh(
        new THREE.SphereGeometry(JOINT_SIZE, SPHERE_SEGMENTS, SPHERE_SEGMENTS),
        new THREE.MeshPhongMaterial({ shininess: SHININESS, color: JOINT_COLOR })
      );
      joint.position.copy(Skel.getJointLocation(JOINTS[i], frame));
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
      const { dir, pos, len } = Skel.getBoneOrientation(BONE, frame);
      const bone = new THREE.Mesh(
        new THREE.CylinderGeometry(CYLINDER_SIZE, CYLINDER_SIZE, 1, CYLINDER_SEGMENTS),
        new THREE.MeshPhongMaterial({ shininess: SHININESS, color: BONE_COLOR })
      );
      bone.quaternion.setFromUnitVectors(axis, dir);
      bone.position.copy(pos);
      bone.scale.y = len;
      bones.push(bone);
    });
    return bones;
  }

  static getDumbbellOrientation(joints, frame) {
    const forearm = new THREE.Vector3().subVectors(Skel.getJointLocation(joints[0], frame), Skel.getJointLocation(joints[1], frame));
    const upperarm = new THREE.Vector3().subVectors(Skel.getJointLocation(joints[1], frame), Skel.getJointLocation(joints[2], frame));
    const dir = new THREE.Vector3().subVectors(
      forearm.clone().multiplyScalar(forearm.dot(upperarm)),
      upperarm.clone().multiplyScalar(forearm.dot(forearm))
    ).normalize();
    const pos = Skel.getJointLocation(joints[0], frame);
    const off = dir.clone().multiplyScalar((DUMBBELL_BAR_LENGTH + DUMBBELL_PLATE_LENGTH) / 2);
    return { dir, pos, off };
  }

  static Dumbbells(frame = DEFAULT_SKEL) {
    // Add dumbbells to each hand
    // Dumbbells are always perpendicular to forearm, in the same plane as the forearm X upper arm
    const dumbbells = [];
    const bar_geometry = new THREE.CylinderGeometry(DUMBBELL_BAR_THICKNESS, DUMBBELL_BAR_THICKNESS, DUMBBELL_BAR_LENGTH, CYLINDER_SEGMENTS, 1);
    const plate_geometry = new THREE.CylinderGeometry(DUMBBELL_PLATE_THICKNESS, DUMBBELL_PLATE_THICKNESS, DUMBBELL_PLATE_LENGTH, CYLINDER_SEGMENTS, 1);
    const material = new THREE.MeshPhongMaterial({ shininess: SHININESS, color: DUMBBELL_COLOR });
    for (let i = 0; i < 2; i++) {
      dumbbells.push(new THREE.Mesh(bar_geometry, material));
      dumbbells.push(new THREE.Mesh(plate_geometry, material));
      dumbbells.push(new THREE.Mesh(plate_geometry, material));
      let { dir, pos, off } = Skel.getDumbbellOrientation(DUMBBELLS[i], frame);
      dumbbells[3 * i].position.copy(pos);
      let arrow = new THREE.ArrowHelper(dir);
      dumbbells[3 * i].rotation.copy(arrow.rotation);
      dumbbells[3 * i + 1].position.copy(new THREE.Vector3().addVectors(pos, off));
      dumbbells[3 * i + 1].rotation.copy(arrow.rotation);
      dumbbells[3 * i + 2].position.copy(new THREE.Vector3().subVectors(pos, off));
      dumbbells[3 * i + 2].rotation.copy(arrow.rotation);
    }
    return dumbbells;
  }

  positionDumbbells(frame) {
    // Dumbbells are always perpendicular to forearm, in the same plane as the forearm X upper arm
    for (let i = 0; i < 2; i += 1) {
      let { dir, pos, off } = Skel.getDumbbellOrientation(DUMBBELLS[i], frame);
      this.dumbbells[3 * i].position.copy(pos);
      let arrow = new THREE.ArrowHelper(dir);
      this.dumbbells[3 * i].rotation.copy(arrow.rotation);
      this.dumbbells[3 * i + 1].position.copy(new THREE.Vector3().addVectors(pos, off));
      this.dumbbells[3 * i + 1].rotation.copy(arrow.rotation);
      this.dumbbells[3 * i + 2].position.copy(new THREE.Vector3().subVectors(pos, off));
      this.dumbbells[3 * i + 2].rotation.copy(arrow.rotation);
    }
  }

  positionJoints(frame) {
    this.joints.forEach((joint, id) => {
      joint.position.copy(Skel.getJointLocation(JOINTS[id], frame));
    });
  }

  alignBones(frame) {
    BONES.forEach((BONE, id) => {
      const { dir, pos, len } = Skel.getBoneOrientation(BONE, frame);
      const arrow = new THREE.ArrowHelper(dir);
      this.bones[id].position.copy(pos);
      this.bones[id].rotation.copy(arrow.rotation);
      this.bones[id].scale.y = len;
    })
  }

  constructor(position = new THREE.Vector3(0, 0, 0), rotation = INITIAL_ROTATION) {
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
    const dumbbells = Skel.Dumbbells();
    dumbbells.forEach(dumbbell => {
      object3d.add(dumbbell);
    });
    this.dumbbells = dumbbells;
    object3d.position.set(position.x, position.y, position.z);
    this.object3d = object3d;

    this.object3d.rotation.setFromVector3(new THREE.Vector3(0, -rotation, 0));
  }

  rotate(rotation) {
    this.object3d.rotation.setFromVector3(new THREE.Vector3(0, -rotation, 0));
  }

  updateFrame(frame = null) {
    if (frame) {
      this.positionJoints(frame);
      this.alignBones(frame);
      this.positionDumbbells(frame);
    }
  }
}
