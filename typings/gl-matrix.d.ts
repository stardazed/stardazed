// Type definitions for gl-matrix 2.3.1
// Project: http://glmatrix.net/

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


interface vecBase {

}


interface vec2 {
	create(): Float32Array;
	clone(a: ArrayOfConstNumber): Float32Array;
	fromValues(x: number, y: number): Float32Array;

	copy(out: number[], a: ArrayOfConstNumber): number[];
	copy<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	set(out: number[], x: number, y: number): number[];
	set<T extends ArrayOfNumber>(out: T, x: number, y: number): T;
	add(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	add<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	subtract(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	subtract<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	sub(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	sub<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	multiply(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	multiply<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	mul(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	mul<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	divide(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	divide<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	div(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	div<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	min(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	min<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	max(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	max<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	scale(out: number[], a: ArrayOfConstNumber, b: number): number[];
	scale<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: number): T;
	scaleAndAdd(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, scale: number): number[];
	scaleAndAdd<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, scale: number): T;

	distance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	dist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	squaredDistance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	sqrDist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	length(a: ArrayOfConstNumber): number;
	len(a: ArrayOfConstNumber): number;
	squaredLength(a: ArrayOfConstNumber): number;
	sqrLen(a: ArrayOfConstNumber): number;
	negate(out: number[], a: ArrayOfConstNumber): number[];
	negate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	inverse(out: number[], a: ArrayOfConstNumber): number[];
	inverse<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	normalize(out: number[], a: ArrayOfConstNumber): number[];
	normalize<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	dot(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	cross(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	cross<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	lerp(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): number[];
	lerp<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): T;
	random(out: number[], scale: number): number[];
	random<T extends ArrayOfNumber>(out: T, scale: number): T;

	transformMat2(out: number[], a: ArrayOfConstNumber, m: ArrayOfConstNumber): number[];
	transformMat2<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, m: ArrayOfConstNumber): T;
	transformMat2d(out: number[], a: ArrayOfConstNumber, m: ArrayOfConstNumber): number[];
	transformMat2d<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, m: ArrayOfConstNumber): T;
	transformMat3(out: number[], a: ArrayOfConstNumber, m: ArrayOfConstNumber): number[];
	transformMat3<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, m: ArrayOfConstNumber): T;
	transformMat4(out: number[], a: ArrayOfConstNumber, m: ArrayOfConstNumber): number[];
	transformMat4<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, m: ArrayOfConstNumber): T;

	forEach<T>(a: ArrayOfConstNumber[], stride: number, offset: number, count: number, fn: (a: ArrayOfConstNumber, b: ArrayOfConstNumber, arg: T) => void, arg: T): ArrayOfNumber[];
	str(a: ArrayOfConstNumber): string;
}
declare const vec2: vec2;


interface vec3 {
	create(): Float32Array;
	clone(a: ArrayOfConstNumber): Float32Array;
	fromValues(x: number, y: number, z: number): Float32Array;

	copy(out: number[], a: ArrayOfConstNumber): number[];
	copy<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	set(out: number[], x: number, y: number, z: number): number[];
	set<T extends ArrayOfNumber>(out: T, x: number, y: number, z: number): T;
	add(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	add<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	subtract(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	subtract(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	subtract<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	sub(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	sub<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	multiply(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	multiply<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	mul(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	mul<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	divide(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	divide<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	div(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	div<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	min(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	min<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	max(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	max<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	scale(out: number[], a: ArrayOfConstNumber, b: number): number[];
	scale<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: number): T;
	scaleAndAdd(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, scale: number): number[];
	scaleAndAdd<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, scale: number): T;
	distance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	dist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	squaredDistance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	sqrDist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	length(a: ArrayOfConstNumber): number;
	len(a: ArrayOfConstNumber): number;
	squaredLength(a: ArrayOfConstNumber): number;
	sqrLen(a: ArrayOfConstNumber): number;
	negate(out: number[], a: ArrayOfConstNumber): number[];
	negate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	inverse(out: number[], a: ArrayOfConstNumber): number[];
	inverse<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	normalize(out: number[], a: ArrayOfConstNumber): number[];
	normalize<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	dot(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	cross(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	cross<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	lerp(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): number[];
	lerp<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): T;
	hermite(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: ArrayOfConstNumber, d: ArrayOfConstNumber, t: number): number[];
	hermite<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: ArrayOfConstNumber, d: ArrayOfConstNumber, t: number): T;
	bezier(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: ArrayOfConstNumber, d: ArrayOfConstNumber, t: number): number[];
	bezier<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: ArrayOfConstNumber, d: ArrayOfConstNumber, t: number): T;
	random(out: number[], scale: number): number[];
	random<T extends ArrayOfNumber>(out: T, scale: number): T;
	transformMat4(out: number[], a: ArrayOfConstNumber, m: ArrayOfConstNumber): number[];
	transformMat4<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, m: ArrayOfConstNumber): T;
	transformMat3(out: number[], a: ArrayOfConstNumber, m: ArrayOfConstNumber): number[];
	transformMat3<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, m: ArrayOfConstNumber): T;
	transformQuat(out: number[], a: ArrayOfConstNumber, q: ArrayOfConstNumber): number[];
	transformQuat<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, q: ArrayOfConstNumber): T;
	rotateX(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: number): number[];
	rotateX<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: number): T;
	rotateY(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: number): number[];
	rotateY<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: number): T;
	rotateZ(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: number): number[];
	rotateZ<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: number): T;
	forEach<T>(a: ArrayOfConstNumber[], stride: number, offset: number, count: number, fn: (a: ArrayOfConstNumber, b: ArrayOfConstNumber, arg: T) => void, arg: T): ArrayOfNumber[];
	angle(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	str(a: ArrayOfConstNumber): string;
}
declare var vec3: vec3;


interface vec4 {
	create(): Float32Array;
	clone(a: ArrayOfConstNumber): Float32Array;
	fromValues(x: number, y: number, z: number, w: number): Float32Array;

	copy(out: number[], a: ArrayOfConstNumber): number[];
	copy<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	set(out: number[], x: number, y: number, z: number, w: number): number[];
	set<T extends ArrayOfNumber>(out: T, x: number, y: number, z: number, w: number): T;
	add(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	add<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	subtract(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	subtract<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	sub(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	sub<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	multiply(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	multiply<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	mul(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	mul<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	divide(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	divide<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	div(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	div<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	min(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	min<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	max(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	max<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	scale(out: number[], a: ArrayOfConstNumber, b: number): number[];
	scale<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: number): T;
	scaleAndAdd(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, scale: number): number[];
	scaleAndAdd<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, scale: number): T;

	distance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	dist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	squaredDistance(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	sqrDist(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	length(a: ArrayOfConstNumber): number;
	len(a: ArrayOfConstNumber): number;
	squaredLength(a: ArrayOfConstNumber): number;
	sqrLen(a: ArrayOfConstNumber): number;
	negate(out: number[], a: ArrayOfConstNumber): number[];
	negate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	inverse(out: number[], a: ArrayOfConstNumber): number[];
	inverse<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	normalize(out: number[], a: ArrayOfConstNumber): number[];
	normalize<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	dot(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;


	lerp(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): number[];
	lerp<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): T;
	random(out: number[], scale: number): number[];
	random<T extends ArrayOfNumber>(out: T, scale: number): T;

	transformMat4(out: number[], a: ArrayOfConstNumber, m: ArrayOfConstNumber): number[];
	transformMat4<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, m: ArrayOfConstNumber): T;
	transformQuat(out: number[], a: ArrayOfConstNumber, q: ArrayOfConstNumber): number[];
	transformQuat<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, q: ArrayOfConstNumber): T;

	forEach<T>(a: ArrayOfConstNumber[], stride: number, offset: number, count: number, fn: (a: ArrayOfConstNumber, b: ArrayOfConstNumber, arg: T) => void, arg: T): ArrayOfNumber[];
	str(a: ArrayOfConstNumber): string;
}
declare var vec4: vec4;


interface mat2 {
	create(): Float32Array;
	clone(a: ArrayOfConstNumber): Float32Array;
	copy(out: number[], a: ArrayOfConstNumber): number[];
	copy<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	identity(out: ArrayOfNumber): ArrayOfNumber;
	transpose(out: number[], a: ArrayOfConstNumber): number[];
	transpose<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	invert(out: number[], a: ArrayOfConstNumber): number[];
	invert<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	adjoint(out: number[], a: ArrayOfConstNumber): number[];
	adjoint<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	determinant(a: ArrayOfConstNumber): number;
	multiply(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	multiply<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	mul(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	mul<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	rotate(out: number[], a: ArrayOfConstNumber, rad: number): number[];
	rotate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number): T;
	scale(out: number[], a: ArrayOfConstNumber, v: ArrayOfConstNumber): number[];
	scale<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, v: ArrayOfConstNumber): T;
	fromRotation(out: number[], rad: number): number[];
	fromRotation<T extends ArrayOfNumber>(out: T, rad: number): T;
	fromScaling(out: number[], v: ArrayOfConstNumber): number[];
	fromScaling<T extends ArrayOfNumber>(out: T, v: ArrayOfConstNumber): T;
	str(a: ArrayOfConstNumber): string;
	frob(a: ArrayOfConstNumber): number;
	LDU(L: ArrayOfConstNumber, D: ArrayOfConstNumber, U: ArrayOfConstNumber, a: ArrayOfConstNumber): ArrayOfNumber[];
}
declare var mat2: mat2;


interface mat2d {
	create(): Float32Array;
	clone(a: ArrayOfConstNumber): Float32Array;
	copy(out: number[], a: ArrayOfConstNumber): number[];
	copy<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	identity(out: ArrayOfNumber): ArrayOfNumber;
	invert(out: number[], a: ArrayOfConstNumber): number[];
	invert<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	determinant(a: ArrayOfConstNumber): number;
	multiply(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	multiply<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	mul(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	mul<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	rotate(out: number[], a: ArrayOfConstNumber, rad: number): number[];
	rotate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number): T;
	scale(out: number[], a: ArrayOfConstNumber, v: ArrayOfConstNumber): number[];
	scale<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, v: ArrayOfConstNumber): T;
	translate(out: number[], a: ArrayOfConstNumber, v: ArrayOfConstNumber): number[];
	translate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, v: ArrayOfConstNumber): T;
	fromRotation(out: number[], rad: number): number[];
	fromRotation<T extends ArrayOfNumber>(out: T, rad: number): T;
	fromScaling(out: number[], v: ArrayOfConstNumber): number[];
	fromScaling<T extends ArrayOfNumber>(out: T, v: ArrayOfConstNumber): T;
	fromTranslation(out: number[], v: ArrayOfConstNumber): number[];
	fromTranslation<T extends ArrayOfNumber>(out: T, v: ArrayOfConstNumber): T;
	str(a: ArrayOfConstNumber): string;
	frob(a: ArrayOfConstNumber): number;
}
declare var mat2d: mat2d;


interface mat3 {
	create(): Float32Array;
	fromMat4(out: number[], a: ArrayOfConstNumber): number[];
	fromMat4<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	clone(a: ArrayOfConstNumber): Float32Array;
	copy(out: number[], a: ArrayOfConstNumber): number[];
	copy<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	identity(out: ArrayOfNumber): ArrayOfNumber;
	transpose(out: number[], a: ArrayOfConstNumber): number[];
	transpose<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	invert(out: number[], a: ArrayOfConstNumber): number[];
	invert<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	adjoint(out: number[], a: ArrayOfConstNumber): number[];
	adjoint<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	determinant(a: ArrayOfConstNumber): number;
	multiply(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	multiply<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	mul(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	mul<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	translate(out: number[], a: ArrayOfConstNumber, v: ArrayOfConstNumber): number[];
	translate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, v: ArrayOfConstNumber): T;
	rotate(out: number[], a: ArrayOfConstNumber, rad: number): number[];
	rotate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number): T;
	scale(out: number[], a: ArrayOfConstNumber, v: ArrayOfConstNumber): number[];
	scale<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, v: ArrayOfConstNumber): T;
	fromTranslation(out: number[], v: ArrayOfConstNumber): number[];
	fromTranslation<T extends ArrayOfNumber>(out: T, v: ArrayOfConstNumber): T;
	fromRotation(out: number[], rad: number): number[];
	fromRotation<T extends ArrayOfNumber>(out: T, rad: number): T;
	fromScaling(out: number[], v: ArrayOfConstNumber): number[];
	fromScaling<T extends ArrayOfNumber>(out: T, v: ArrayOfConstNumber): T;
	fromMat2d(out: number[], a: ArrayOfConstNumber): number[];
	fromMat2d<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	fromQuat(out: number[], q: ArrayOfConstNumber): number[];
	fromQuat<T extends ArrayOfNumber>(out: T, q: ArrayOfConstNumber): T;
	normalFromMat4(out: number[], a: ArrayOfConstNumber): number[];
	normalFromMat4<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	str(a: ArrayOfConstNumber): string;
	frob(a: ArrayOfConstNumber): number;
}
declare var mat3: mat3;


interface mat4 {
	create(): Float32Array;
	clone(a: ArrayOfConstNumber): Float32Array;
	copy(out: number[], a: ArrayOfConstNumber): number[];
	copy<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	identity(out: ArrayOfNumber): ArrayOfNumber;
	transpose(out: number[], a: ArrayOfConstNumber): number[];
	transpose<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	invert(out: number[], a: ArrayOfConstNumber): number[];
	invert<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	adjoint(out: number[], a: ArrayOfConstNumber): number[];
	adjoint<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	determinant(a: ArrayOfConstNumber): number;
	multiply(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	multiply<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	mul(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	mul<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	translate(out: number[], a: ArrayOfConstNumber, v: ArrayOfConstNumber): number[];
	translate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, v: ArrayOfConstNumber): T;
	scale(out: number[], a: ArrayOfConstNumber, v: ArrayOfConstNumber): number[];
	scale<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, v: ArrayOfConstNumber): T;
	rotate(out: number[], a: ArrayOfConstNumber, rad: number, axis: ArrayOfConstNumber): number[];
	rotate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number, axis: ArrayOfConstNumber): T;
	rotateX(out: number[], a: ArrayOfConstNumber, rad: number): number[];
	rotateX<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number): T;
	rotateY(out: number[], a: ArrayOfConstNumber, rad: number): number[];
	rotateY<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number): T;
	rotateZ(out: number[], a: ArrayOfConstNumber, rad: number): number[];
	rotateZ<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number): T;
	fromTranslation(out: number[], v: ArrayOfConstNumber): number[];
	fromTranslation<T extends ArrayOfNumber>(out: T, v: ArrayOfConstNumber): T;
	fromScaling(out: number[], v: ArrayOfConstNumber): number[];
	fromScaling<T extends ArrayOfNumber>(out: T, v: ArrayOfConstNumber): T;
	fromRotation(out: number[], rad: number, axis: ArrayOfConstNumber): number[];
	fromRotation<T extends ArrayOfNumber>(out: T, rad: number, axis: ArrayOfConstNumber): T;
	fromXRotation(out: number[], rad: number): number[];
	fromXRotation<T extends ArrayOfNumber>(out: T, rad: number): T;
	fromYRotation(out: number[], rad: number): number[];
	fromYRotation<T extends ArrayOfNumber>(out: T, rad: number): T;
	fromZRotation(out: number[], rad: number): number[];
	fromZRotation<T extends ArrayOfNumber>(out: T, rad: number): T;
	fromRotationTranslation(out: number[], q: ArrayOfConstNumber, v: ArrayOfConstNumber): number[];
	fromRotationTranslation<T extends ArrayOfNumber>(out: T, q: ArrayOfConstNumber, v: ArrayOfConstNumber): T;
	fromRotationTranslationScale(out: number[], q: ArrayOfConstNumber, v: ArrayOfConstNumber, s: ArrayOfConstNumber): number[];
	fromRotationTranslationScale<T extends ArrayOfNumber>(out: T, q: ArrayOfConstNumber, v: ArrayOfConstNumber, s: ArrayOfConstNumber): T;
	fromRotationTranslationScaleOrigin(out: number[], q: ArrayOfConstNumber, v: ArrayOfConstNumber, s: ArrayOfConstNumber, o: ArrayOfConstNumber): number[];
	fromRotationTranslationScaleOrigin<T extends ArrayOfNumber>(out: T, q: ArrayOfConstNumber, v: ArrayOfConstNumber, s: ArrayOfConstNumber, o: ArrayOfConstNumber): T;
	fromQuat(out: number[], q: ArrayOfConstNumber): number[];
	fromQuat<T extends ArrayOfNumber>(out: T, q: ArrayOfConstNumber): T;
	frustum(out: number[], left: number, right: number, bottom: number, top: number, near: number, far: number): number[];
	frustum<T extends ArrayOfNumber>(out: T, left: number, right: number, bottom: number, top: number, near: number, far: number): T;
	perspective(out: number[], fovy: number, aspect: number, near: number, far: number): number[];
	perspective<T extends ArrayOfNumber>(out: T, fovy: number, aspect: number, near: number, far: number): T;
	perspectiveFromFieldOfView(out: number[], fov: number, near: number, far: number): number[];
	perspectiveFromFieldOfView<T extends ArrayOfNumber>(out: T, fov: number, near: number, far: number): T;
	ortho(out: number[], left: number, right: number, bottom: number, top: number, near: number, far: number): number[];
	ortho<T extends ArrayOfNumber>(out: T, left: number, right: number, bottom: number, top: number, near: number, far: number): T;
	lookAt(out: number[], eye: ArrayOfConstNumber, center: ArrayOfConstNumber, up: ArrayOfConstNumber): number[];
	lookAt<T extends ArrayOfNumber>(out: T, eye: ArrayOfConstNumber, center: ArrayOfConstNumber, up: ArrayOfConstNumber): T;
	str(a: ArrayOfConstNumber): string;
	frob(a: ArrayOfConstNumber): number;
}
declare var mat4: mat4;


interface quat {
	create(): Float32Array;
	rotationTo(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	rotationTo<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	setAxes(out: number[], view: ArrayOfConstNumber, right: ArrayOfConstNumber, up: ArrayOfConstNumber): number[];
	setAxes<T extends ArrayOfNumber>(out: T, view: ArrayOfConstNumber, right: ArrayOfConstNumber, up: ArrayOfConstNumber): T;
	clone(a: ArrayOfConstNumber): Float32Array;
	fromValues(x: number, y: number, z: number, w: number): Float32Array;

	copy(out: number[], a: ArrayOfConstNumber): number[];
	copy<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	set(out: number[], x: number, y: number, z: number, w: number): number[];
	set<T extends ArrayOfNumber>(out: T, x: number, y: number, z: number, w: number): T;
	identity(out: ArrayOfNumber): ArrayOfNumber;
	setAxisAngle(out: number[], axis: ArrayOfConstNumber, rad: number): number[];
	setAxisAngle<T extends ArrayOfNumber>(out: T, axis: ArrayOfConstNumber, rad: number): T;
	add(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	add<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	multiply(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	multiply<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	mul(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber): number[];
	mul<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber): T;
	scale(out: number[], a: ArrayOfConstNumber, b: number): number[];
	scale<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: number): T;
	rotateX(out: number[], a: ArrayOfConstNumber, rad: number): number[];
	rotateX<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number): T;
	rotateY(out: number[], a: ArrayOfConstNumber, rad: number): number[];
	rotateY<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number): T;
	rotateZ(out: number[], a: ArrayOfConstNumber, rad: number): number[];
	rotateZ<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, rad: number): T;
	calculateW(out: number[], a: ArrayOfConstNumber): number[];
	calculateW<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	dot(a: ArrayOfConstNumber, b: ArrayOfConstNumber): number;
	lerp(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): number[];
	lerp<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): T;
	slerp(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): number[];
	slerp<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, t: number): T;
	sqlerp(out: number[], a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: ArrayOfConstNumber, d: ArrayOfConstNumber, t: number): number[];
	sqlerp<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber, b: ArrayOfConstNumber, c: ArrayOfConstNumber, d: ArrayOfConstNumber, t: number): T;
	invert(out: number[], a: ArrayOfConstNumber): number[];
	invert<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	conjugate(out: number[], a: ArrayOfConstNumber): number[];
	conjugate<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	length(a: ArrayOfConstNumber): number;
	len(a: ArrayOfConstNumber): number;
	squaredLength(a: ArrayOfConstNumber): number;
	sqrLen(a: ArrayOfConstNumber): number;
	normalize(out: number[], a: ArrayOfConstNumber): number[];
	normalize<T extends ArrayOfNumber>(out: T, a: ArrayOfConstNumber): T;
	fromMat3(out: number[], m: ArrayOfConstNumber): number[];
	fromMat3<T extends ArrayOfNumber>(out: T, m: ArrayOfConstNumber): T;
	str(a: ArrayOfConstNumber): string;
}
declare var quat: quat;

