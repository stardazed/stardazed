// math - general purpose functions, equations, RNG, etc.
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

// common functions
export function intRandom(maximum: number): number {
	return (Math.random() * (maximum + 1)) | 0;
}


export function intRandomRange(minimum: number, maximum: number): number {
	const diff = (maximum - minimum) | 0;
	return minimum + intRandom(diff);
}


export function hertz(hz: number) {
	return 1 / hz;
}


export function deg2rad(deg: number): number {
	return deg * Math.PI / 180.0;
}


export function rad2deg(rad: number): number {
	return rad * 180.0 / Math.PI;
}


export function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}


export function clamp01(n: number): number {
	return Math.max(0.0, Math.min(1.0, n));
}


export function isPowerOf2(n: number) {
	return (n & (n - 1)) == 0;
}


// roundUpPowerOf2
// return closest powerOf2 number that is >= n
// e.g.: 15 -> 16; 16 -> 16; 17 -> 32

export function roundUpPowerOf2(n: number) {
	if (n <= 0) { return 1; }
	n = (n | 0) - 1;
	n |= n >> 1;
	n |= n >> 2;
	n |= n >> 4;
	n |= n >> 8;
	n |= n >> 16;
	return n + 1;
}


// alignUp
// round val up to closest alignmentPow2

export function alignUp(val: number, alignmentPow2: number) {
	return (val + alignmentPow2 - 1) & (~(alignmentPow2 - 1));
}


// alignDown
// round val down to closest alignmentPow2

export function alignDown(val: number, alignmentPow2: number) {
	return val & (~(alignmentPow2 - 1));
}



// --- Float vector types

export class Vec2 {
	static get zero() { return new Float32Array([0, 0]); }
	static get one() { return new Float32Array([1, 1]); }

	static elementCount = 2;
	static byteSize = Float.byteSize * Vec2.elementCount;
}

export class Vec3 {
	static get zero() { return new Float32Array([0, 0, 0]); }
	static get one() { return new Float32Array([1, 1, 1]); }

	static elementCount = 3;
	static byteSize = Float.byteSize * Vec3.elementCount;
}

export class Vec4 {
	static get zero() { return new Float32Array([0, 0, 0, 0]); }
	static get one() { return new Float32Array([1, 1, 1, 1]); }

	static elementCount = 4;
	static byteSize = Float.byteSize * Vec4.elementCount;
}

export class Quat {
	static get identity() { return new Float32Array([0, 0, 0, 1]); }

	static elementCount = 4;
	static byteSize = Float.byteSize * Quat.elementCount;
}

export class Mat3 {
	static get identity() {
		return new Float32Array([
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		]);
	}

	static elementCount = 9;
	static byteSize = Float.byteSize * Mat3.elementCount;
}

export class Mat4 {
	static get identity() {
		return new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}

	static elementCount = 16;
	static byteSize = Float.byteSize * Mat4.elementCount;
}


// ----

export function reflectVec3(v3: Float3, normal: Float3) {
	return vec3.sub([], v3, vec3.scale([], normal, 2 * vec3.dot(v3, normal)));
}


export function arbitraryOrthogonalVec3(v: Float3): Float3 {
	const ax = Math.abs(v[0]);
	const ay = Math.abs(v[1]);
	const az = Math.abs(v[2]);

	const dominantAxis = (ax > ay) ? (ax > az ? 0 : 2) : (ay > az ? 1 : 2);

	const p: Float3 = [];
	switch(dominantAxis) {
		case 0:
			p[0] = -v[1] - v[2];
			p[1] = v[0];
			p[2] = v[0];
			break;
		case 1:
			p[0] = v[1];
			p[1] = -v[0] - v[2];
			p[2] = v[1];
			break;
		case 2:
			p[0] = v[2];
			p[1] = v[2];
			p[2] = -v[0] - v[1];
			break;
	}

	return p;
}
