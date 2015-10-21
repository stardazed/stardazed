// Type definitions for gl-matrix 2.3.1
// Project: http://glmatrix.net/
// Definitions by: chuntaro <https://github.com/chuntaro/>
// Definitions: https://github.com/chuntaro/gl-matrix.d.ts


interface glMatrix {
  EPSILON: number;
  ARRAY_TYPE: Float32Array | Array<number>;
  RANDOM: () => number;
  setMatrixArrayType<T>(type: T): void;
  toRadian(a: number): number;
}
declare var glMatrix: glMatrix;


declare type ArrayOfNumber = ArrayLike<number>;


interface vec2 {
  create(): Float32Array;
  clone(a: ArrayOfNumber): Float32Array;
  fromValues(x: number, y: number): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  subtract(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  sub(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  divide(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  div(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  min(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  max(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfNumber, b: number): ArrayOfNumber;
  scaleAndAdd(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, scale: number): ArrayOfNumber;
  distance(a: ArrayOfNumber, b: ArrayOfNumber): number;
  dist(a: ArrayOfNumber, b: ArrayOfNumber): number;
  squaredDistance(a: ArrayOfNumber, b: ArrayOfNumber): number;
  sqrDist(a: ArrayOfNumber, b: ArrayOfNumber): number;
  length(a: ArrayOfNumber): number;
  len(a: ArrayOfNumber): number;
  squaredLength(a: ArrayOfNumber): number;
  sqrLen(a: ArrayOfNumber): number;
  negate(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  inverse(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  normalize(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  dot(a: ArrayOfNumber, b: ArrayOfNumber): number;
  cross(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  lerp(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, t: number): ArrayOfNumber;
  random(out: ArrayOfNumber, scale: number): ArrayOfNumber;
  transformMat2(out: ArrayOfNumber, a: ArrayOfNumber, m: ArrayOfNumber): ArrayOfNumber;
  transformMat2d(out: ArrayOfNumber, a: ArrayOfNumber, m: ArrayOfNumber): ArrayOfNumber;
  transformMat3(out: ArrayOfNumber, a: ArrayOfNumber, m: ArrayOfNumber): ArrayOfNumber;
  transformMat4(out: ArrayOfNumber, a: ArrayOfNumber, m: ArrayOfNumber): ArrayOfNumber;
  forEach<T>(a: ArrayOfNumber[], stride: number, offset: number, count: number, fn: (a: ArrayOfNumber, b: ArrayOfNumber, arg: T) => void, arg: T): ArrayOfNumber[];
  str(a: ArrayOfNumber): string;
}
declare var vec2: vec2;


interface vec3 {
  create(): Float32Array;
  clone(a: ArrayOfNumber): Float32Array;
  fromValues(x: number, y: number, z: number): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number, z: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  subtract(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  sub(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  divide(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  div(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  min(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  max(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfNumber, b: number): ArrayOfNumber;
  scaleAndAdd(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, scale: number): ArrayOfNumber;
  distance(a: ArrayOfNumber, b: ArrayOfNumber): number;
  dist(a: ArrayOfNumber, b: ArrayOfNumber): number;
  squaredDistance(a: ArrayOfNumber, b: ArrayOfNumber): number;
  sqrDist(a: ArrayOfNumber, b: ArrayOfNumber): number;
  length(a: ArrayOfNumber): number;
  len(a: ArrayOfNumber): number;
  squaredLength(a: ArrayOfNumber): number;
  sqrLen(a: ArrayOfNumber): number;
  negate(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  inverse(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  normalize(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  dot(a: ArrayOfNumber, b: ArrayOfNumber): number;
  cross(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  lerp(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, t: number): ArrayOfNumber;
  hermite(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, c: ArrayOfNumber, d: ArrayOfNumber, t: number): ArrayOfNumber;
  bezier(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, c: ArrayOfNumber, d: ArrayOfNumber, t: number): ArrayOfNumber;
  random(out: ArrayOfNumber, scale: number): ArrayOfNumber;
  transformMat4(out: ArrayOfNumber, a: ArrayOfNumber, m: ArrayOfNumber): ArrayOfNumber;
  transformMat3(out: ArrayOfNumber, a: ArrayOfNumber, m: ArrayOfNumber): ArrayOfNumber;
  transformQuat(out: ArrayOfNumber, a: ArrayOfNumber, q: ArrayOfNumber): ArrayOfNumber;
  rotateX(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, c: number): ArrayOfNumber;
  rotateY(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, c: number): ArrayOfNumber;
  rotateZ(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, c: number): ArrayOfNumber;
  forEach<T>(a: ArrayOfNumber[], stride: number, offset: number, count: number, fn: (a: ArrayOfNumber, b: ArrayOfNumber, arg: T) => void, arg: T): ArrayOfNumber[];
  angle(a: ArrayOfNumber, b: ArrayOfNumber): number;
  str(a: ArrayOfNumber): string;
}
declare var vec3: vec3;


interface vec4 {
  create(): Float32Array;
  clone(a: ArrayOfNumber): Float32Array;
  fromValues(x: number, y: number, z: number, w: number): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number, z: number, w: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  subtract(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  sub(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  divide(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  div(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  min(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  max(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfNumber, b: number): ArrayOfNumber;
  scaleAndAdd(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, scale: number): ArrayOfNumber;
  distance(a: ArrayOfNumber, b: ArrayOfNumber): number;
  dist(a: ArrayOfNumber, b: ArrayOfNumber): number;
  squaredDistance(a: ArrayOfNumber, b: ArrayOfNumber): number;
  sqrDist(a: ArrayOfNumber, b: ArrayOfNumber): number;
  length(a: ArrayOfNumber): number;
  len(a: ArrayOfNumber): number;
  squaredLength(a: ArrayOfNumber): number;
  sqrLen(a: ArrayOfNumber): number;
  negate(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  inverse(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  normalize(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  dot(a: ArrayOfNumber, b: ArrayOfNumber): number;
  lerp(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, t: number): ArrayOfNumber;
  random(out: ArrayOfNumber, scale: number): ArrayOfNumber;
  transformMat4(out: ArrayOfNumber, a: ArrayOfNumber, m: ArrayOfNumber): ArrayOfNumber;
  transformQuat(out: ArrayOfNumber, a: ArrayOfNumber, q: ArrayOfNumber): ArrayOfNumber;
  forEach<T>(a: ArrayOfNumber[], stride: number, offset: number, count: number, fn: (a: ArrayOfNumber, b: ArrayOfNumber, arg: T) => void, arg: T): ArrayOfNumber[];
  str(a: ArrayOfNumber): string;
}
declare var vec4: vec4;


interface mat2 {
  create(): Float32Array;
  clone(a: ArrayOfNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  transpose(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  adjoint(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  determinant(a: ArrayOfNumber): number;
  multiply(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ArrayOfNumber, rad: number): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  str(a: ArrayOfNumber): string;
  frob(a: ArrayOfNumber): number;
  LDU(L: ArrayOfNumber, D: ArrayOfNumber, U: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber[];
}
declare var mat2: mat2;


interface mat2d {
  create(): Float32Array;
  clone(a: ArrayOfNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  determinant(a: ArrayOfNumber): number;
  multiply(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ArrayOfNumber, rad: number): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  translate(out: ArrayOfNumber, a: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  fromTranslation(out: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  str(a: ArrayOfNumber): string;
  frob(a: ArrayOfNumber): number;
}
declare var mat2d: mat2d;


interface mat3 {
  create(): Float32Array;
  fromMat4(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  clone(a: ArrayOfNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  transpose(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  adjoint(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  determinant(a: ArrayOfNumber): number;
  multiply(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  translate(out: ArrayOfNumber, a: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ArrayOfNumber, rad: number): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  fromTranslation(out: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  fromMat2d(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  fromQuat(out: ArrayOfNumber, q: ArrayOfNumber): ArrayOfNumber;
  normalFromMat4(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  str(a: ArrayOfNumber): string;
  frob(a: ArrayOfNumber): number;
}
declare var mat3: mat3;


interface mat4 {
  create(): Float32Array;
  clone(a: ArrayOfNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  transpose(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  adjoint(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  determinant(a: ArrayOfNumber): number;
  multiply(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  translate(out: ArrayOfNumber, a: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ArrayOfNumber, rad: number, axis: ArrayOfNumber): ArrayOfNumber;
  rotateX(out: ArrayOfNumber, a: ArrayOfNumber, rad: number): ArrayOfNumber;
  rotateY(out: ArrayOfNumber, a: ArrayOfNumber, rad: number): ArrayOfNumber;
  rotateZ(out: ArrayOfNumber, a: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromTranslation(out: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number, axis: ArrayOfNumber): ArrayOfNumber;
  fromXRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromYRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromZRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromRotationTranslation(out: ArrayOfNumber, q: ArrayOfNumber, v: ArrayOfNumber): ArrayOfNumber;
  fromRotationTranslationScale(out: ArrayOfNumber, q: ArrayOfNumber, v: ArrayOfNumber, s: ArrayOfNumber): ArrayOfNumber;
  fromRotationTranslationScaleOrigin(out: ArrayOfNumber, q: ArrayOfNumber, v: ArrayOfNumber, s: ArrayOfNumber, o: ArrayOfNumber): ArrayOfNumber;
  fromQuat(out: ArrayOfNumber, q: ArrayOfNumber): ArrayOfNumber;
  frustum(out: ArrayOfNumber, left: number, right: number, bottom: number, top: number, near: number, far: number): ArrayOfNumber;
  perspective(out: ArrayOfNumber, fovy: number, aspect: number, near: number, far: number): ArrayOfNumber;
  perspectiveFromFieldOfView(out: ArrayOfNumber, fov: number, near: number, far: number): ArrayOfNumber;
  ortho(out: ArrayOfNumber, left: number, right: number, bottom: number, top: number, near: number, far: number): ArrayOfNumber;
  lookAt(out: ArrayOfNumber, eye: ArrayOfNumber, center: ArrayOfNumber, up: ArrayOfNumber): ArrayOfNumber;
  str(a: ArrayOfNumber): string;
  frob(a: ArrayOfNumber): number;
}
declare var mat4: mat4;


interface quat {
  create(): Float32Array;
  rotationTo(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  setAxes(out: ArrayOfNumber, view: ArrayOfNumber, right: ArrayOfNumber, up: ArrayOfNumber): ArrayOfNumber;
  clone(a: ArrayOfNumber): Float32Array;
  fromValues(x: number, y: number, z: number, w: number): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number, z: number, w: number): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  setAxisAngle(out: ArrayOfNumber, axis: ArrayOfNumber, rad: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfNumber, b: number): ArrayOfNumber;
  rotateX(out: ArrayOfNumber, a: ArrayOfNumber, rad: number): ArrayOfNumber;
  rotateY(out: ArrayOfNumber, a: ArrayOfNumber, rad: number): ArrayOfNumber;
  rotateZ(out: ArrayOfNumber, a: ArrayOfNumber, rad: number): ArrayOfNumber;
  calculateW(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  dot(a: ArrayOfNumber, b: ArrayOfNumber): number;
  lerp(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, t: number): ArrayOfNumber;
  slerp(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, t: number): ArrayOfNumber;
  sqlerp(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, c: ArrayOfNumber, d: ArrayOfNumber, t: number): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  conjugate(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  length(a: ArrayOfNumber): number;
  len(a: ArrayOfNumber): number;
  squaredLength(a: ArrayOfNumber): number;
  sqrLen(a: ArrayOfNumber): number;
  normalize(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
  fromMat3(out: ArrayOfNumber, m: ArrayOfNumber): ArrayOfNumber;
  str(a: ArrayOfNumber): string;
}
declare var quat: quat;

