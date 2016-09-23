  // Type definitions for gl-matrix 2.3.1
// Project: http://glmatrix.net/
// Definitions by: chuntaro <https://github.com/chuntaro/>
// Definitions: https://github.com/chuntaro/gl-matrix.d.ts
// Definitions made usable by Arthur Langereis (@zenmumbler)


interface glMatrix {
  EPSILON: number;
  ARRAY_TYPE: Float32Array | Array<number>;
  RANDOM: () => number;
  setMatrixArrayType<T>(type: T): void;
  toRadian(a: number): number;
}
declare var glMatrix: glMatrix;


interface MutableArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}

declare type ArrayOfConstNumber = ArrayLike<number>;
declare type ArrayOfNumber = MutableArrayLike<number>;



interface vec2 {
  create(): Float32Array;
  clone(a: ArrayOfConstNumber): Float32Array;
  fromValues(x: number, y: number): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  subtract(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  sub(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  divide(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  div(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  min(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  max(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfConstNumber, b: number): ArrayOfNumber;
  scaleAndAdd(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, scale: number): ArrayOfNumber;
  distance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  dist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  squaredDistance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  sqrDist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  length(a: ArrayOfConstNumber): number;
  len(a: ArrayOfConstNumber): number;
  squaredLength(a: ArrayOfConstNumber): number;
  sqrLen(a: ArrayOfConstNumber): number;
  negate(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  inverse(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  normalize(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  dot(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  cross(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  lerp(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): ArrayOfNumber;
  random(out: ArrayOfNumber, scale: number): ArrayOfNumber;
  transformMat2(out: ArrayOfNumber, a: ArrayOfConstNumber, m: ArrayOfConstNumber): ArrayOfNumber;
  transformMat2d(out: ArrayOfNumber, a: ArrayOfConstNumber, m: ArrayOfConstNumber): ArrayOfNumber;
  transformMat3(out: ArrayOfNumber, a: ArrayOfConstNumber, m: ArrayOfConstNumber): ArrayOfNumber;
  transformMat4(out: ArrayOfNumber, a: ArrayOfConstNumber, m: ArrayOfConstNumber): ArrayOfNumber;
  forEach<T>(a: ArrayOfConstNumber[], stride: number, offset: number, count: number, fn: (a: ArrayOfConstNumber, b: ArrayOfConstNumber, arg: T) => void, arg: T): ArrayOfNumber[];
  str(a: ArrayOfConstNumber): string;
}
declare var vec2: vec2;


interface vec3 {
  create(): Float32Array;
  clone(a: ArrayOfConstNumber): Float32Array;
  fromValues(x: number, y: number, z: number): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number, z: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  subtract(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  sub(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  divide(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  div(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  min(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  max(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfConstNumber, b: number): ArrayOfNumber;
  scaleAndAdd(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, scale: number): ArrayOfNumber;
  distance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  dist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  squaredDistance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  sqrDist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  length(a: ArrayOfConstNumber): number;
  len(a: ArrayOfConstNumber): number;
  squaredLength(a: ArrayOfConstNumber): number;
  sqrLen(a: ArrayOfConstNumber): number;
  negate(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  inverse(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  normalize(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  dot(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  cross(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  lerp(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): ArrayOfNumber;
  hermite(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: ArrayOfConstNumber, d: ArrayOfConstNumber, t: number): ArrayOfNumber;
  bezier(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: ArrayOfConstNumber, d: ArrayOfConstNumber, t: number): ArrayOfNumber;
  random(out: ArrayOfNumber, scale: number): ArrayOfNumber;
  transformMat4(out: ArrayOfNumber, a: ArrayOfConstNumber, m: ArrayOfConstNumber): ArrayOfNumber;
  transformMat3(out: ArrayOfNumber, a: ArrayOfConstNumber, m: ArrayOfConstNumber): ArrayOfNumber;
  transformQuat(out: ArrayOfNumber, a: ArrayOfConstNumber, q: ArrayOfConstNumber): ArrayOfNumber;
  rotateX(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: number): ArrayOfNumber;
  rotateY(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: number): ArrayOfNumber;
  rotateZ(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: number): ArrayOfNumber;
  forEach<T>(a: ArrayOfConstNumber[], stride: number, offset: number, count: number, fn: (a: ArrayOfConstNumber, b: ArrayOfConstNumber, arg: T) => void, arg: T): ArrayOfNumber[];
  angle(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  str(a: ArrayOfConstNumber): string;
}
declare var vec3: vec3;


interface vec4 {
  create(): Float32Array;
  clone(a: ArrayOfConstNumber): Float32Array;
  fromValues(x: number, y: number, z: number, w: number): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number, z: number, w: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  subtract(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  sub(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  divide(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  div(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  min(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  max(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfConstNumber, b: number): ArrayOfNumber;
  scaleAndAdd(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, scale: number): ArrayOfNumber;
  distance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  dist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  squaredDistance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  sqrDist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  length(a: ArrayOfConstNumber): number;
  len(a: ArrayOfConstNumber): number;
  squaredLength(a: ArrayOfConstNumber): number;
  sqrLen(a: ArrayOfConstNumber): number;
  negate(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  inverse(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  normalize(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  dot(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  lerp(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): ArrayOfNumber;
  random(out: ArrayOfNumber, scale: number): ArrayOfNumber;
  transformMat4(out: ArrayOfNumber, a: ArrayOfConstNumber, m: ArrayOfConstNumber): ArrayOfNumber;
  transformQuat(out: ArrayOfNumber, a: ArrayOfConstNumber, q: ArrayOfConstNumber): ArrayOfNumber;
  forEach<T>(a: ArrayOfConstNumber[], stride: number, offset: number, count: number, fn: (a: ArrayOfConstNumber, b: ArrayOfConstNumber, arg: T) => void, arg: T): ArrayOfNumber[];
  str(a: ArrayOfConstNumber): string;
}
declare var vec4: vec4;


interface mat2 {
  create(): Float32Array;
  clone(a: ArrayOfConstNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  transpose(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  adjoint(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  determinant(a: ArrayOfConstNumber): number;
  multiply(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfConstNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  str(a: ArrayOfConstNumber): string;
  frob(a: ArrayOfConstNumber): number;
  LDU(L: ArrayOfConstNumber, D: ArrayOfConstNumber, U: ArrayOfConstNumber, a: ArrayOfConstNumber): ArrayOfNumber[];
}
declare var mat2: mat2;


interface mat2d {
  create(): Float32Array;
  clone(a: ArrayOfConstNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  determinant(a: ArrayOfConstNumber): number;
  multiply(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfConstNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  translate(out: ArrayOfNumber, a: ArrayOfConstNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  fromTranslation(out: ArrayOfNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  str(a: ArrayOfConstNumber): string;
  frob(a: ArrayOfConstNumber): number;
}
declare var mat2d: mat2d;


interface mat3 {
  create(): Float32Array;
  fromMat4(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  clone(a: ArrayOfConstNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  transpose(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  adjoint(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  determinant(a: ArrayOfConstNumber): number;
  multiply(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  translate(out: ArrayOfNumber, a: ArrayOfConstNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfConstNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  fromTranslation(out: ArrayOfNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  fromMat2d(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  fromQuat(out: ArrayOfNumber, q: ArrayOfConstNumber): ArrayOfNumber;
  normalFromMat4(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  str(a: ArrayOfConstNumber): string;
  frob(a: ArrayOfConstNumber): number;
}
declare var mat3: mat3;


interface mat4 {
  create(): Float32Array;
  clone(a: ArrayOfConstNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  transpose(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  adjoint(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  determinant(a: ArrayOfConstNumber): number;
  multiply(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  translate(out: ArrayOfNumber, a: ArrayOfConstNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfConstNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number, axis: ArrayOfConstNumber): ArrayOfNumber;
  rotateX(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  rotateY(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  rotateZ(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  fromTranslation(out: ArrayOfNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number, axis: ArrayOfConstNumber): ArrayOfNumber;
  fromXRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromYRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromZRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromRotationTranslation(out: ArrayOfNumber, q: ArrayOfConstNumber, v: ArrayOfConstNumber): ArrayOfNumber;
  fromRotationTranslationScale(out: ArrayOfNumber, q: ArrayOfConstNumber, v: ArrayOfConstNumber, s: ArrayOfConstNumber): ArrayOfNumber;
  fromRotationTranslationScaleOrigin(out: ArrayOfNumber, q: ArrayOfConstNumber, v: ArrayOfConstNumber, s: ArrayOfConstNumber, o: ArrayOfConstNumber): ArrayOfNumber;
  fromQuat(out: ArrayOfNumber, q: ArrayOfConstNumber): ArrayOfNumber;
  frustum(out: ArrayOfNumber, left: number, right: number, bottom: number, top: number, near: number, far: number): ArrayOfNumber;
  perspective(out: ArrayOfNumber, fovy: number, aspect: number, near: number, far: number): ArrayOfNumber;
  perspectiveFromFieldOfView(out: ArrayOfNumber, fov: number, near: number, far: number): ArrayOfNumber;
  ortho(out: ArrayOfNumber, left: number, right: number, bottom: number, top: number, near: number, far: number): ArrayOfNumber;
  lookAt(out: ArrayOfNumber, eye: ArrayOfConstNumber, center: ArrayOfConstNumber, up: ArrayOfConstNumber): ArrayOfNumber;
  str(a: ArrayOfConstNumber): string;
  frob(a: ArrayOfConstNumber): number;
}
declare var mat4: mat4;


interface quat {
  create(): Float32Array;
  rotationTo(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  setAxes(out: ArrayOfNumber, view: ArrayOfConstNumber, right: ArrayOfConstNumber, up: ArrayOfConstNumber): ArrayOfNumber;
  clone(a: ArrayOfConstNumber): Float32Array;
  fromValues(x: number, y: number, z: number, w: number): Float32Array;
  copy(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number, z: number, w: number): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  setAxisAngle(out: ArrayOfNumber, axis: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ArrayOfConstNumber, b: number): ArrayOfNumber;
  rotateX(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  rotateY(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  rotateZ(out: ArrayOfNumber, a: ArrayOfConstNumber, rad: number): ArrayOfNumber;
  calculateW(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  dot(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
  lerp(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): ArrayOfNumber;
  slerp(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): ArrayOfNumber;
  sqlerp(out: ArrayOfNumber, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: ArrayOfConstNumber, d: ArrayOfConstNumber, t: number): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  conjugate(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  length(a: ArrayOfConstNumber): number;
  len(a: ArrayOfConstNumber): number;
  squaredLength(a: ArrayOfConstNumber): number;
  sqrLen(a: ArrayOfConstNumber): number;
  normalize(out: ArrayOfNumber, a: ArrayOfConstNumber): ArrayOfNumber;
  fromMat3(out: ArrayOfNumber, m: ArrayOfConstNumber): ArrayOfNumber;
  str(a: ArrayOfConstNumber): string;
}
declare var quat: quat;

