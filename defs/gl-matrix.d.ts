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

declare type ConstArrayOfNumber = ArrayLike<number>;
declare type ArrayOfNumber = MutableArrayLike<number>;



interface vec2 {
  create(): Float32Array;
  clone(a: ConstArrayOfNumber): Float32Array;
  fromValues(x: number, y: number): Float32Array;
  copy(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  subtract(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  sub(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  divide(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  div(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  min(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  max(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ConstArrayOfNumber, b: number): ArrayOfNumber;
  scaleAndAdd(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, scale: number): ArrayOfNumber;
  distance(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  dist(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  squaredDistance(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  sqrDist(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  length(a: ConstArrayOfNumber): number;
  len(a: ConstArrayOfNumber): number;
  squaredLength(a: ConstArrayOfNumber): number;
  sqrLen(a: ConstArrayOfNumber): number;
  negate(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  inverse(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  normalize(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  dot(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  cross(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  lerp(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, t: number): ArrayOfNumber;
  random(out: ArrayOfNumber, scale: number): ArrayOfNumber;
  transformMat2(out: ArrayOfNumber, a: ConstArrayOfNumber, m: ConstArrayOfNumber): ArrayOfNumber;
  transformMat2d(out: ArrayOfNumber, a: ConstArrayOfNumber, m: ConstArrayOfNumber): ArrayOfNumber;
  transformMat3(out: ArrayOfNumber, a: ConstArrayOfNumber, m: ConstArrayOfNumber): ArrayOfNumber;
  transformMat4(out: ArrayOfNumber, a: ConstArrayOfNumber, m: ConstArrayOfNumber): ArrayOfNumber;
  forEach<T>(a: ConstArrayOfNumber[], stride: number, offset: number, count: number, fn: (a: ConstArrayOfNumber, b: ConstArrayOfNumber, arg: T) => void, arg: T): ArrayOfNumber[];
  str(a: ConstArrayOfNumber): string;
}
declare var vec2: vec2;


interface vec3 {
  create(): Float32Array;
  clone(a: ConstArrayOfNumber): Float32Array;
  fromValues(x: number, y: number, z: number): Float32Array;
  copy(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number, z: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  subtract(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  sub(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  divide(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  div(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  min(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  max(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ConstArrayOfNumber, b: number): ArrayOfNumber;
  scaleAndAdd(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, scale: number): ArrayOfNumber;
  distance(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  dist(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  squaredDistance(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  sqrDist(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  length(a: ConstArrayOfNumber): number;
  len(a: ConstArrayOfNumber): number;
  squaredLength(a: ConstArrayOfNumber): number;
  sqrLen(a: ConstArrayOfNumber): number;
  negate(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  inverse(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  normalize(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  dot(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  cross(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  lerp(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, t: number): ArrayOfNumber;
  hermite(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, c: ConstArrayOfNumber, d: ConstArrayOfNumber, t: number): ArrayOfNumber;
  bezier(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, c: ConstArrayOfNumber, d: ConstArrayOfNumber, t: number): ArrayOfNumber;
  random(out: ArrayOfNumber, scale: number): ArrayOfNumber;
  transformMat4(out: ArrayOfNumber, a: ConstArrayOfNumber, m: ConstArrayOfNumber): ArrayOfNumber;
  transformMat3(out: ArrayOfNumber, a: ConstArrayOfNumber, m: ConstArrayOfNumber): ArrayOfNumber;
  transformQuat(out: ArrayOfNumber, a: ConstArrayOfNumber, q: ConstArrayOfNumber): ArrayOfNumber;
  rotateX(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, c: number): ArrayOfNumber;
  rotateY(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, c: number): ArrayOfNumber;
  rotateZ(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, c: number): ArrayOfNumber;
  forEach<T>(a: ConstArrayOfNumber[], stride: number, offset: number, count: number, fn: (a: ConstArrayOfNumber, b: ConstArrayOfNumber, arg: T) => void, arg: T): ArrayOfNumber[];
  angle(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  str(a: ConstArrayOfNumber): string;
}
declare var vec3: vec3;


interface vec4 {
  create(): Float32Array;
  clone(a: ConstArrayOfNumber): Float32Array;
  fromValues(x: number, y: number, z: number, w: number): Float32Array;
  copy(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number, z: number, w: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  subtract(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  sub(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  divide(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  div(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  min(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  max(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ConstArrayOfNumber, b: number): ArrayOfNumber;
  scaleAndAdd(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, scale: number): ArrayOfNumber;
  distance(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  dist(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  squaredDistance(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  sqrDist(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  length(a: ConstArrayOfNumber): number;
  len(a: ConstArrayOfNumber): number;
  squaredLength(a: ConstArrayOfNumber): number;
  sqrLen(a: ConstArrayOfNumber): number;
  negate(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  inverse(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  normalize(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  dot(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  lerp(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, t: number): ArrayOfNumber;
  random(out: ArrayOfNumber, scale: number): ArrayOfNumber;
  transformMat4(out: ArrayOfNumber, a: ConstArrayOfNumber, m: ConstArrayOfNumber): ArrayOfNumber;
  transformQuat(out: ArrayOfNumber, a: ConstArrayOfNumber, q: ConstArrayOfNumber): ArrayOfNumber;
  forEach<T>(a: ConstArrayOfNumber[], stride: number, offset: number, count: number, fn: (a: ConstArrayOfNumber, b: ConstArrayOfNumber, arg: T) => void, arg: T): ArrayOfNumber[];
  str(a: ConstArrayOfNumber): string;
}
declare var vec4: vec4;


interface mat2 {
  create(): Float32Array;
  clone(a: ConstArrayOfNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  transpose(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  adjoint(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  determinant(a: ConstArrayOfNumber): number;
  multiply(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ConstArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  str(a: ConstArrayOfNumber): string;
  frob(a: ConstArrayOfNumber): number;
  LDU(L: ConstArrayOfNumber, D: ConstArrayOfNumber, U: ConstArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber[];
}
declare var mat2: mat2;


interface mat2d {
  create(): Float32Array;
  clone(a: ConstArrayOfNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  determinant(a: ConstArrayOfNumber): number;
  multiply(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ConstArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  translate(out: ArrayOfNumber, a: ConstArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  fromTranslation(out: ArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  str(a: ConstArrayOfNumber): string;
  frob(a: ConstArrayOfNumber): number;
}
declare var mat2d: mat2d;


interface mat3 {
  create(): Float32Array;
  fromMat4(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  clone(a: ConstArrayOfNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  transpose(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  adjoint(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  determinant(a: ConstArrayOfNumber): number;
  multiply(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  translate(out: ArrayOfNumber, a: ConstArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ConstArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  fromTranslation(out: ArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  fromMat2d(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  fromQuat(out: ArrayOfNumber, q: ConstArrayOfNumber): ArrayOfNumber;
  normalFromMat4(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  str(a: ConstArrayOfNumber): string;
  frob(a: ConstArrayOfNumber): number;
}
declare var mat3: mat3;


interface mat4 {
  create(): Float32Array;
  clone(a: ConstArrayOfNumber): Float32Array;
  copy(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  transpose(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  adjoint(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  determinant(a: ConstArrayOfNumber): number;
  multiply(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  translate(out: ArrayOfNumber, a: ConstArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ConstArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  rotate(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number, axis: ConstArrayOfNumber): ArrayOfNumber;
  rotateX(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  rotateY(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  rotateZ(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  fromTranslation(out: ArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  fromScaling(out: ArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  fromRotation(out: ArrayOfNumber, rad: number, axis: ConstArrayOfNumber): ArrayOfNumber;
  fromXRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromYRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromZRotation(out: ArrayOfNumber, rad: number): ArrayOfNumber;
  fromRotationTranslation(out: ArrayOfNumber, q: ConstArrayOfNumber, v: ConstArrayOfNumber): ArrayOfNumber;
  fromRotationTranslationScale(out: ArrayOfNumber, q: ConstArrayOfNumber, v: ConstArrayOfNumber, s: ConstArrayOfNumber): ArrayOfNumber;
  fromRotationTranslationScaleOrigin(out: ArrayOfNumber, q: ConstArrayOfNumber, v: ConstArrayOfNumber, s: ConstArrayOfNumber, o: ConstArrayOfNumber): ArrayOfNumber;
  fromQuat(out: ArrayOfNumber, q: ConstArrayOfNumber): ArrayOfNumber;
  frustum(out: ArrayOfNumber, left: number, right: number, bottom: number, top: number, near: number, far: number): ArrayOfNumber;
  perspective(out: ArrayOfNumber, fovy: number, aspect: number, near: number, far: number): ArrayOfNumber;
  perspectiveFromFieldOfView(out: ArrayOfNumber, fov: number, near: number, far: number): ArrayOfNumber;
  ortho(out: ArrayOfNumber, left: number, right: number, bottom: number, top: number, near: number, far: number): ArrayOfNumber;
  lookAt(out: ArrayOfNumber, eye: ConstArrayOfNumber, center: ConstArrayOfNumber, up: ConstArrayOfNumber): ArrayOfNumber;
  str(a: ConstArrayOfNumber): string;
  frob(a: ConstArrayOfNumber): number;
}
declare var mat4: mat4;


interface quat {
  create(): Float32Array;
  rotationTo(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  setAxes(out: ArrayOfNumber, view: ConstArrayOfNumber, right: ConstArrayOfNumber, up: ConstArrayOfNumber): ArrayOfNumber;
  clone(a: ConstArrayOfNumber): Float32Array;
  fromValues(x: number, y: number, z: number, w: number): Float32Array;
  copy(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  set(out: ArrayOfNumber, x: number, y: number, z: number, w: number): ArrayOfNumber;
  identity(out: ArrayOfNumber): ArrayOfNumber;
  setAxisAngle(out: ArrayOfNumber, axis: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  add(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  multiply(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  mul(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber): ArrayOfNumber;
  scale(out: ArrayOfNumber, a: ConstArrayOfNumber, b: number): ArrayOfNumber;
  rotateX(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  rotateY(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  rotateZ(out: ArrayOfNumber, a: ConstArrayOfNumber, rad: number): ArrayOfNumber;
  calculateW(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  dot(a: ConstArrayOfNumber, b: ConstArrayOfNumber): number;
  lerp(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, t: number): ArrayOfNumber;
  slerp(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, t: number): ArrayOfNumber;
  sqlerp(out: ArrayOfNumber, a: ConstArrayOfNumber, b: ConstArrayOfNumber, c: ConstArrayOfNumber, d: ConstArrayOfNumber, t: number): ArrayOfNumber;
  invert(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  conjugate(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  length(a: ConstArrayOfNumber): number;
  len(a: ConstArrayOfNumber): number;
  squaredLength(a: ConstArrayOfNumber): number;
  sqrLen(a: ConstArrayOfNumber): number;
  normalize(out: ArrayOfNumber, a: ConstArrayOfNumber): ArrayOfNumber;
  fromMat3(out: ArrayOfNumber, m: ConstArrayOfNumber): ArrayOfNumber;
  str(a: ConstArrayOfNumber): string;
}
declare var quat: quat;

