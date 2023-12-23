export const MAX_SKELS = 4;


export const HEAD = 0;
export const NECK = 1;
export const SPINESHOULDER = 2;
export const SHOULDER_LEFT = 3;
export const ELBOW_LEFT = 4;
export const WRIST_LEFT = 5;
export const HAND_LEFT = 6;
export const SHOULDER_RIGHT = 7;
export const ELBOW_RIGHT = 8;
export const WRIST_RIGHT = 9;
export const HAND_RIGHT = 10;
export const SPINE = 11;
export const HIP_CENTER = 12;
export const HIP_LEFT = 13;
export const KNEE_LEFT = 14;
export const ANKLE_LEFT = 15;
export const FOOT_LEFT = 16;
export const HIP_RIGHT = 17;
export const KNEE_RIGHT = 18;
export const ANKLE_RIGHT = 19;
export const FOOT_RIGHT = 20;
export const NUM_JOINTS = 21;
export const BONES = [
  [HEAD, NECK],
  [NECK, SPINESHOULDER],
  [SPINESHOULDER, SHOULDER_LEFT],
  [SHOULDER_LEFT, ELBOW_LEFT],
  [ELBOW_LEFT, WRIST_LEFT],
  [WRIST_LEFT, HAND_LEFT],
  [SPINESHOULDER, SHOULDER_RIGHT],
  [SHOULDER_RIGHT, ELBOW_RIGHT],
  [ELBOW_RIGHT, WRIST_RIGHT],
  [WRIST_RIGHT, HAND_RIGHT],
  [SPINESHOULDER, SPINE],
  [SPINE, HIP_CENTER],
  [HIP_CENTER, HIP_LEFT],
  [HIP_LEFT, KNEE_LEFT],
  [KNEE_LEFT, ANKLE_LEFT],
  [ANKLE_LEFT, FOOT_LEFT],
  [HIP_CENTER, HIP_RIGHT],
  [HIP_RIGHT, KNEE_RIGHT],
  [KNEE_RIGHT, ANKLE_RIGHT],
  [ANKLE_RIGHT, FOOT_RIGHT]
];
export const DEFAULT_SKEL = [
  -178, 770, 1865,
  -167, 611, 1886,
  -164, 537, 1899,
  -312, 465, 1811,
  -346, 241, 1778,
  -229, 34, 1706,
  -178, -51, 1716,
  8, 481, 1965,
  47, 219, 2048,
  126, -18, 2010,
  155, -104, 1981,
  -154, 307, 1929,
  -140, -9, 1960,
  -210, -12, 1889,
  -251, -348, 1827,
  -451, -803, 1930,
  -435, -874, 1904,
  -64, -5, 1955,
  -11, -387, 1999,
  15, -814, 2117,
  50, -884, 2063
]; 
export const JOINT_SIZE = 30;
export const HEAD_SIZE = 80;
export const SPHERE_SEGMENTS = 10;
export const CYLINDER_SIZE = 25;
export const CYLINDER_SEGMENTS = 15;
export const DUMBBELL_BAR_THICKNESS = 20;
export const DUMBBELL_BAR_LENGTH = 150;
export const DUMBBELL_PLATE_THICKNESS = 80;
export const DUMBBELL_PLATE_LENGTH = 20;
export const SHININESS = 0.5;
export const COLOR = 0x2e3440; // 0x2e3440
export const DEPTH_OFFSET = -2000;
