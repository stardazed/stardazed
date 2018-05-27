(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.sdMath = {})));
}(this, (function (exports) { 'use strict';

	/**
	 * math/common - shared elements
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	// constants
	const EPSILON = 0.000001;
	// functions
	function clamp(n, min, max) {
	    return Math.max(min, Math.min(max, n));
	}
	function clamp01(n) {
	    return Math.max(0.0, Math.min(1.0, n));
	}
	function mix(a, b, ratio) {
	    return a * (1 - ratio) + b * ratio;
	}
	function intRandom(maximum) {
	    return (Math.random() * (maximum + 1)) | 0;
	}
	function intRandomRange(minimum, maximum) {
	    const diff = (maximum - minimum) | 0;
	    return minimum + intRandom(diff);
	}
	function hertz(hz) {
	    return 1 / hz;
	}
	function deg2rad(deg) {
	    return deg * Math.PI / 180.0;
	}
	function rad2deg(rad) {
	    return rad * 180.0 / Math.PI;
	}
	function isPowerOf2(n) {
	    return (n & (n - 1)) === 0;
	}
	// roundUpPowerOf2
	// return closest powerOf2 number that is >= n
	// e.g.: 15 -> 16; 16 -> 16; 17 -> 32
	function roundUpPowerOf2(n) {
	    if (n <= 0) {
	        return 1;
	    }
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
	function alignUp(val, alignmentPow2) {
	    return (val + alignmentPow2 - 1) & (~(alignmentPow2 - 1));
	}
	// alignDown
	// round val down to closest alignmentPow2
	function alignDown(val, alignmentPow2) {
	    return val & (~(alignmentPow2 - 1));
	}

	/**
	 * math/vec2 - 2-element vector type
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	const ELEMENT_COUNT = 2;
	function create() {
	    const out = new Float32Array(ELEMENT_COUNT);
	    out[0] = 0;
	    out[1] = 0;
	    return out;
	}
	const zero = create;
	function one() {
	    const out = new Float32Array(ELEMENT_COUNT);
	    out[0] = 1;
	    out[1] = 1;
	    return out;
	}
	function clone(a) {
	    const out = new Float32Array(ELEMENT_COUNT);
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	}
	function fromValues(x, y) {
	    const out = new Float32Array(ELEMENT_COUNT);
	    out[0] = x;
	    out[1] = y;
	    return out;
	}
	function copy(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	}
	function set(out, x, y) {
	    out[0] = x;
	    out[1] = y;
	    return out;
	}
	function add(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    return out;
	}
	function subtract(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    return out;
	}
	const sub = subtract;
	function multiply(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    return out;
	}
	const mul = multiply;
	function divide(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    return out;
	}
	const div = divide;
	function ceil(out, a) {
	    out[0] = Math.ceil(a[0]);
	    out[1] = Math.ceil(a[1]);
	    return out;
	}
	function floor(out, a) {
	    out[0] = Math.floor(a[0]);
	    out[1] = Math.floor(a[1]);
	    return out;
	}
	function min(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    return out;
	}
	function max(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    return out;
	}
	function round(out, a) {
	    out[0] = Math.round(a[0]);
	    out[1] = Math.round(a[1]);
	    return out;
	}
	function scale(out, a, s) {
	    out[0] = a[0] * s;
	    out[1] = a[1] * s;
	    return out;
	}
	function scaleAndAdd(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    return out;
	}
	function distance(a, b) {
	    const x = b[0] - a[0];
	    const y = b[1] - a[1];
	    return Math.sqrt(x * x + y * y);
	}
	const dist = distance;
	function squaredDistance(a, b) {
	    const x = b[0] - a[0];
	    const y = b[1] - a[1];
	    return x * x + y * y;
	}
	const sqrDist = squaredDistance;
	function length(a) {
	    const x = a[0];
	    const y = a[1];
	    return Math.sqrt(x * x + y * y);
	}
	const len = length;
	function squaredLength(a) {
	    const x = a[0];
	    const y = a[1];
	    return x * x + y * y;
	}
	const sqrLen = squaredLength;
	function negate(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    return out;
	}
	function inverse(out, a) {
	    out[0] = 1.0 / a[0];
	    out[1] = 1.0 / a[1];
	    return out;
	}
	function normalize(out, a) {
	    const x = a[0];
	    const y = a[1];
	    let len = x * x + y * y; // tslint:disable-line:no-shadowed-variable
	    if (len > 0) {
	        // TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	    }
	    return out;
	}
	function dot(a, b) {
	    return a[0] * b[0] + a[1] * b[1];
	}
	function cross(out, a, b) {
	    const z = a[0] * b[1] - a[1] * b[0];
	    out[0] = out[1] = 0;
	    out[2] = z;
	    return out;
	}
	function lerp(out, a, b, t) {
	    const ax = a[0];
	    const ay = a[1];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    return out;
	}
	function random(out, scale = 1.0) {
	    const r = Math.random() * 2.0 * Math.PI;
	    out[0] = Math.cos(r) * scale;
	    out[1] = Math.sin(r) * scale;
	    return out;
	}
	function clamp$1(out, a, min, max) {
	    if (typeof min === "number") {
	        out[0] = clamp(a[0], min, max);
	        out[1] = clamp(a[1], min, max);
	    }
	    else {
	        out[0] = clamp(a[0], min[0], max[0]);
	        out[1] = clamp(a[1], min[1], max[1]);
	    }
	    return out;
	}
	function clamp01$1(out, a) {
	    out[0] = clamp01(a[0]);
	    out[1] = clamp01(a[1]);
	    return out;
	}
	function mix$1(out, a, b, ratio) {
	    if (typeof ratio === "number") {
	        out[0] = mix(a[0], b[0], ratio);
	        out[1] = mix(a[1], b[1], ratio);
	    }
	    else {
	        out[0] = mix(a[0], b[0], ratio[0]);
	        out[1] = mix(a[1], b[1], ratio[1]);
	    }
	    return out;
	}
	function sign(out, a) {
	    out[0] = Math.sign(a[0]);
	    out[1] = Math.sign(a[1]);
	    return out;
	}
	function transformMat2(out, a, m) {
	    const x = a[0];
	    const y = a[1];
	    out[0] = m[0] * x + m[2] * y;
	    out[1] = m[1] * x + m[3] * y;
	    return out;
	}
	function transformMat2d(out, a, m) {
	    const x = a[0];
	    const y = a[1];
	    out[0] = m[0] * x + m[2] * y + m[4];
	    out[1] = m[1] * x + m[3] * y + m[5];
	    return out;
	}
	function transformMat3(out, a, m) {
	    const x = a[0];
	    const y = a[1];
	    out[0] = m[0] * x + m[3] * y + m[6];
	    out[1] = m[1] * x + m[4] * y + m[7];
	    return out;
	}
	function transformMat4(out, a, m) {
	    const x = a[0];
	    const y = a[1];
	    out[0] = m[0] * x + m[4] * y + m[12];
	    out[1] = m[1] * x + m[5] * y + m[13];
	    return out;
	}
	function forEach(a, opt, fn, ...args) {
	    const stride = opt.stride || ELEMENT_COUNT;
	    const offset = opt.offset || 0;
	    const count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;
	    const vec = create();
	    for (let i = offset; i < count; i += stride) {
	        vec[0] = a[i];
	        vec[1] = a[i + 1];
	        fn(vec, vec, args);
	        a[i] = vec[0];
	        a[i + 1] = vec[1];
	    }
	    return a;
	}
	function str(a) {
	    return `vec2(${a[0]}, ${a[1]})`;
	}
	function exactEquals(a, b) {
	    return a[0] === b[0] && a[1] === b[1];
	}
	function equals(a, b) {
	    const a0 = a[0], a1 = a[1];
	    const b0 = b[0], b1 = b[1];
	    return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)));
	}

	var vec2 = /*#__PURE__*/Object.freeze({
		ELEMENT_COUNT: ELEMENT_COUNT,
		create: create,
		zero: zero,
		one: one,
		clone: clone,
		fromValues: fromValues,
		copy: copy,
		set: set,
		add: add,
		subtract: subtract,
		sub: sub,
		multiply: multiply,
		mul: mul,
		divide: divide,
		div: div,
		ceil: ceil,
		floor: floor,
		min: min,
		max: max,
		round: round,
		scale: scale,
		scaleAndAdd: scaleAndAdd,
		distance: distance,
		dist: dist,
		squaredDistance: squaredDistance,
		sqrDist: sqrDist,
		length: length,
		len: len,
		squaredLength: squaredLength,
		sqrLen: sqrLen,
		negate: negate,
		inverse: inverse,
		normalize: normalize,
		dot: dot,
		cross: cross,
		lerp: lerp,
		random: random,
		clamp: clamp$1,
		clamp01: clamp01$1,
		mix: mix$1,
		sign: sign,
		transformMat2: transformMat2,
		transformMat2d: transformMat2d,
		transformMat3: transformMat3,
		transformMat4: transformMat4,
		forEach: forEach,
		str: str,
		exactEquals: exactEquals,
		equals: equals
	});

	/**
	 * math/vec3 - 3-element vector type
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	const ELEMENT_COUNT$1 = 3;
	function create$1() {
	    const out = new Float32Array(ELEMENT_COUNT$1);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    return out;
	}
	const zero$1 = create$1;
	function one$1() {
	    const out = new Float32Array(ELEMENT_COUNT$1);
	    out[0] = 1;
	    out[1] = 1;
	    out[2] = 1;
	    return out;
	}
	function clone$1(a) {
	    const out = new Float32Array(ELEMENT_COUNT$1);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	}
	function fromValues$1(x, y, z) {
	    const out = new Float32Array(ELEMENT_COUNT$1);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	}
	function copy$1(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	}
	function set$1(out, x, y, z) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	}
	function add$1(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    return out;
	}
	function subtract$1(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    return out;
	}
	const sub$1 = subtract$1;
	function multiply$1(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    return out;
	}
	const mul$1 = multiply$1;
	function divide$1(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    return out;
	}
	const div$1 = divide$1;
	function ceil$1(out, a) {
	    out[0] = Math.ceil(a[0]);
	    out[1] = Math.ceil(a[1]);
	    out[2] = Math.ceil(a[2]);
	    return out;
	}
	function floor$1(out, a) {
	    out[0] = Math.floor(a[0]);
	    out[1] = Math.floor(a[1]);
	    out[2] = Math.floor(a[2]);
	    return out;
	}
	function min$1(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    return out;
	}
	function max$1(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    return out;
	}
	function round$1(out, a) {
	    out[0] = Math.round(a[0]);
	    out[1] = Math.round(a[1]);
	    out[2] = Math.round(a[2]);
	    return out;
	}
	function scale$1(out, a, s) {
	    out[0] = a[0] * s;
	    out[1] = a[1] * s;
	    out[2] = a[2] * s;
	    return out;
	}
	function scaleAndAdd$1(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    return out;
	}
	function distance$1(a, b) {
	    const x = b[0] - a[0];
	    const y = b[1] - a[1];
	    const z = b[2] - a[2];
	    return Math.sqrt(x * x + y * y + z * z);
	}
	const dist$1 = distance$1;
	function squaredDistance$1(a, b) {
	    const x = b[0] - a[0];
	    const y = b[1] - a[1];
	    const z = b[2] - a[2];
	    return x * x + y * y + z * z;
	}
	const sqrDist$1 = squaredDistance$1;
	function length$1(a) {
	    const x = a[0], y = a[1], z = a[2];
	    return Math.sqrt(x * x + y * y + z * z);
	}
	const len$1 = length$1;
	function squaredLength$1(a) {
	    const x = a[0];
	    const y = a[1];
	    const z = a[2];
	    return x * x + y * y + z * z;
	}
	const sqrLen$1 = squaredLength$1;
	function negate$1(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    return out;
	}
	function inverse$1(out, a) {
	    out[0] = 1.0 / a[0];
	    out[1] = 1.0 / a[1];
	    out[2] = 1.0 / a[2];
	    return out;
	}
	function normalize$1(out, a) {
	    const x = a[0];
	    const y = a[1];
	    const z = a[2];
	    let len = x * x + y * y + z * z; // tslint:disable-line:no-shadowed-variable
	    if (len > 0) {
	        // TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	        out[2] = a[2] * len;
	    }
	    return out;
	}
	function dot$1(a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}
	function cross$1(out, a, b) {
	    const ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];
	    out[0] = ay * bz - az * by;
	    out[1] = az * bx - ax * bz;
	    out[2] = ax * by - ay * bx;
	    return out;
	}
	function lerp$1(out, a, b, t) {
	    const ax = a[0], ay = a[1], az = a[2];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    return out;
	}
	function hermite(out, a, b, c, d, t) {
	    const factorTimes2 = t * t;
	    const factor1 = factorTimes2 * (2 * t - 3) + 1;
	    const factor2 = factorTimes2 * (t - 2) + t;
	    const factor3 = factorTimes2 * (t - 1);
	    const factor4 = factorTimes2 * (3 - 2 * t);
	    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
	    return out;
	}
	function bezier(out, a, b, c, d, t) {
	    const inverseFactor = 1 - t;
	    const inverseFactorTimesTwo = inverseFactor * inverseFactor;
	    const factorTimes2 = t * t;
	    const factor1 = inverseFactorTimesTwo * inverseFactor;
	    const factor2 = 3 * t * inverseFactorTimesTwo;
	    const factor3 = 3 * factorTimes2 * inverseFactor;
	    const factor4 = factorTimes2 * t;
	    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
	    return out;
	}
	function random$1(out, scale = 1.0) {
	    scale = scale || 1.0;
	    const r = Math.random() * 2.0 * Math.PI;
	    const z = (Math.random() * 2.0) - 1.0;
	    const zScale = Math.sqrt(1.0 - z * z) * scale;
	    out[0] = Math.cos(r) * zScale;
	    out[1] = Math.sin(r) * zScale;
	    out[2] = z * scale;
	    return out;
	}
	function clamp$2(out, a, min, max) {
	    if (typeof min === "number") {
	        out[0] = clamp(a[0], min, max);
	        out[1] = clamp(a[1], min, max);
	        out[2] = clamp(a[2], min, max);
	    }
	    else {
	        out[0] = clamp(a[0], min[0], max[0]);
	        out[1] = clamp(a[1], min[1], max[1]);
	        out[2] = clamp(a[2], min[2], max[2]);
	    }
	    return out;
	}
	function clamp01$2(out, a) {
	    out[0] = clamp01(a[0]);
	    out[1] = clamp01(a[1]);
	    out[2] = clamp01(a[2]);
	    return out;
	}
	function mix$2(out, a, b, ratio) {
	    if (typeof ratio === "number") {
	        out[0] = mix(a[0], b[0], ratio);
	        out[1] = mix(a[1], b[1], ratio);
	        out[2] = mix(a[2], b[2], ratio);
	    }
	    else {
	        out[0] = mix(a[0], b[0], ratio[0]);
	        out[1] = mix(a[1], b[1], ratio[1]);
	        out[2] = mix(a[2], b[2], ratio[2]);
	    }
	    return out;
	}
	function sign$1(out, a) {
	    out[0] = Math.sign(a[0]);
	    out[1] = Math.sign(a[1]);
	    out[2] = Math.sign(a[2]);
	    return out;
	}
	function transformMat3$1(out, a, m) {
	    const x = a[0], y = a[1], z = a[2];
	    out[0] = x * m[0] + y * m[3] + z * m[6];
	    out[1] = x * m[1] + y * m[4] + z * m[7];
	    out[2] = x * m[2] + y * m[5] + z * m[8];
	    return out;
	}
	function transformMat4$1(out, a, m) {
	    const x = a[0];
	    const y = a[1];
	    const z = a[2];
	    const w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
	    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
	    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
	    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
	    return out;
	}
	function transformQuat(out, a, q) {
	    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations
	    const x = a[0], y = a[1], z = a[2];
	    const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
	    // calculate quat * vec
	    const ix = qw * x + qy * z - qz * y;
	    const iy = qw * y + qz * x - qx * z;
	    const iz = qw * z + qx * y - qy * x;
	    const iw = -qx * x - qy * y - qz * z;
	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    return out;
	}
	function rotateX(out, a, b, c) {
	    const p = [];
	    const r = [];
	    // translate point to the origin
	    p[0] = a[0] - b[0];
	    p[1] = a[1] - b[1];
	    p[2] = a[2] - b[2];
	    // perform rotation
	    r[0] = p[0];
	    r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
	    r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);
	    // translate to correct position
	    out[0] = r[0] + b[0];
	    out[1] = r[1] + b[1];
	    out[2] = r[2] + b[2];
	    return out;
	}
	function rotateY(out, a, b, c) {
	    const p = [];
	    const r = [];
	    // translate point to the origin
	    p[0] = a[0] - b[0];
	    p[1] = a[1] - b[1];
	    p[2] = a[2] - b[2];
	    // perform rotation
	    r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
	    r[1] = p[1];
	    r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);
	    // translate to correct position
	    out[0] = r[0] + b[0];
	    out[1] = r[1] + b[1];
	    out[2] = r[2] + b[2];
	    return out;
	}
	function rotateZ(out, a, b, c) {
	    const p = [];
	    const r = [];
	    // translate point to the origin
	    p[0] = a[0] - b[0];
	    p[1] = a[1] - b[1];
	    p[2] = a[2] - b[2];
	    // perform rotation
	    r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
	    r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
	    r[2] = p[2];
	    // translate to correct position
	    out[0] = r[0] + b[0];
	    out[1] = r[1] + b[1];
	    out[2] = r[2] + b[2];
	    return out;
	}
	function reflect(out, a, normal) {
	    scale$1(out, normal, 2.0 * dot$1(a, normal));
	    return sub$1(out, a, out);
	}
	function arbitraryOrthogonalVec(a) {
	    const p = create$1();
	    const ax = Math.abs(a[0]);
	    const ay = Math.abs(a[1]);
	    const az = Math.abs(a[2]);
	    const dominantAxis = (ax > ay) ? (ax > az ? 0 : 2) : (ay > az ? 1 : 2);
	    switch (dominantAxis) {
	        case 0:
	            p[0] = -a[1] - a[2];
	            p[1] = a[0];
	            p[2] = a[0];
	            break;
	        case 1:
	            p[0] = a[1];
	            p[1] = -a[0] - a[2];
	            p[2] = a[1];
	            break;
	        case 2:
	            p[0] = a[2];
	            p[1] = a[2];
	            p[2] = -a[0] - a[1];
	            break;
	    }
	    return p;
	}
	function forEach$1(a, opt, fn, ...args) {
	    const stride = opt.stride || ELEMENT_COUNT$1;
	    const offset = opt.offset || 0;
	    const count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;
	    const vec = create$1();
	    for (let i = offset; i < count; i += stride) {
	        vec[0] = a[i];
	        vec[1] = a[i + 1];
	        vec[2] = a[i + 2];
	        fn(vec, vec, args);
	        a[i] = vec[0];
	        a[i + 1] = vec[1];
	        a[i + 2] = vec[2];
	    }
	    return a;
	}
	function angle(a, b) {
	    const tempA = clone$1(a);
	    const tempB = clone$1(b);
	    normalize$1(tempA, tempA);
	    normalize$1(tempB, tempB);
	    const cosine = dot$1(tempA, tempB);
	    if (cosine > 1.0) {
	        return 0;
	    }
	    else if (cosine < -1.0) {
	        return Math.PI;
	    }
	    else {
	        return Math.acos(cosine);
	    }
	}
	function str$1(a) {
	    return `vec3(${a[0]}, ${a[1]}, ${a[2]})`;
	}
	function exactEquals$1(a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
	}
	function equals$1(a, b) {
	    const a0 = a[0], a1 = a[1], a2 = a[2];
	    const b0 = b[0], b1 = b[1], b2 = b[2];
	    return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)));
	}

	var vec3 = /*#__PURE__*/Object.freeze({
		ELEMENT_COUNT: ELEMENT_COUNT$1,
		create: create$1,
		zero: zero$1,
		one: one$1,
		clone: clone$1,
		fromValues: fromValues$1,
		copy: copy$1,
		set: set$1,
		add: add$1,
		subtract: subtract$1,
		sub: sub$1,
		multiply: multiply$1,
		mul: mul$1,
		divide: divide$1,
		div: div$1,
		ceil: ceil$1,
		floor: floor$1,
		min: min$1,
		max: max$1,
		round: round$1,
		scale: scale$1,
		scaleAndAdd: scaleAndAdd$1,
		distance: distance$1,
		dist: dist$1,
		squaredDistance: squaredDistance$1,
		sqrDist: sqrDist$1,
		length: length$1,
		len: len$1,
		squaredLength: squaredLength$1,
		sqrLen: sqrLen$1,
		negate: negate$1,
		inverse: inverse$1,
		normalize: normalize$1,
		dot: dot$1,
		cross: cross$1,
		lerp: lerp$1,
		hermite: hermite,
		bezier: bezier,
		random: random$1,
		clamp: clamp$2,
		clamp01: clamp01$2,
		mix: mix$2,
		sign: sign$1,
		transformMat3: transformMat3$1,
		transformMat4: transformMat4$1,
		transformQuat: transformQuat,
		rotateX: rotateX,
		rotateY: rotateY,
		rotateZ: rotateZ,
		reflect: reflect,
		arbitraryOrthogonalVec: arbitraryOrthogonalVec,
		forEach: forEach$1,
		angle: angle,
		str: str$1,
		exactEquals: exactEquals$1,
		equals: equals$1
	});

	/**
	 * math/vec4 - 4-element vector type
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	const ELEMENT_COUNT$2 = 4;
	function create$2() {
	    const out = new Float32Array(ELEMENT_COUNT$2);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    return out;
	}
	const zero$2 = create$2;
	function one$2() {
	    const out = new Float32Array(ELEMENT_COUNT$2);
	    out[0] = 1;
	    out[1] = 1;
	    out[2] = 1;
	    out[3] = 1;
	    return out;
	}
	function clone$2(a) {
	    const out = new Float32Array(ELEMENT_COUNT$2);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	}
	function fromValues$2(x, y, z, w) {
	    const out = new Float32Array(ELEMENT_COUNT$2);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	}
	function copy$2(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	}
	function set$2(out, x, y, z, w) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	}
	function add$2(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    return out;
	}
	function subtract$2(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    return out;
	}
	const sub$2 = subtract$2;
	function multiply$2(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    out[3] = a[3] * b[3];
	    return out;
	}
	const mul$2 = multiply$2;
	function divide$2(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    out[3] = a[3] / b[3];
	    return out;
	}
	const div$2 = divide$2;
	function ceil$2(out, a) {
	    out[0] = Math.ceil(a[0]);
	    out[1] = Math.ceil(a[1]);
	    out[2] = Math.ceil(a[2]);
	    out[3] = Math.ceil(a[3]);
	    return out;
	}
	function floor$2(out, a) {
	    out[0] = Math.floor(a[0]);
	    out[1] = Math.floor(a[1]);
	    out[2] = Math.floor(a[2]);
	    out[3] = Math.floor(a[3]);
	    return out;
	}
	function min$2(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    out[3] = Math.min(a[3], b[3]);
	    return out;
	}
	function max$2(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    out[3] = Math.max(a[3], b[3]);
	    return out;
	}
	function round$2(out, a) {
	    out[0] = Math.round(a[0]);
	    out[1] = Math.round(a[1]);
	    out[2] = Math.round(a[2]);
	    out[3] = Math.round(a[3]);
	    return out;
	}
	function scale$2(out, a, s) {
	    out[0] = a[0] * s;
	    out[1] = a[1] * s;
	    out[2] = a[2] * s;
	    out[3] = a[3] * s;
	    return out;
	}
	function scaleAndAdd$2(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    return out;
	}
	function distance$2(a, b) {
	    const x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
	    return Math.sqrt(x * x + y * y + z * z + w * w);
	}
	const dist$2 = distance$2;
	function squaredDistance$2(a, b) {
	    const x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
	    return x * x + y * y + z * z + w * w;
	}
	const sqrDist$2 = squaredDistance$2;
	function length$2(a) {
	    const x = a[0], y = a[1], z = a[2], w = a[3];
	    return Math.sqrt(x * x + y * y + z * z + w * w);
	}
	const len$2 = length$2;
	function squaredLength$2(a) {
	    const x = a[0], y = a[1], z = a[2], w = a[3];
	    return x * x + y * y + z * z + w * w;
	}
	const sqrLen$2 = squaredLength$2;
	function negate$2(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = -a[3];
	    return out;
	}
	function inverse$2(out, a) {
	    out[0] = 1.0 / a[0];
	    out[1] = 1.0 / a[1];
	    out[2] = 1.0 / a[2];
	    out[3] = 1.0 / a[3];
	    return out;
	}
	function normalize$2(out, a) {
	    const x = a[0], y = a[1], z = a[2], w = a[3];
	    let len = x * x + y * y + z * z + w * w; // tslint:disable-line:no-shadowed-variable
	    if (len > 0) {
	        len = 1 / Math.sqrt(len);
	        out[0] = x * len;
	        out[1] = y * len;
	        out[2] = z * len;
	        out[3] = w * len;
	    }
	    return out;
	}
	function dot$2(a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	}
	function lerp$2(out, a, b, t) {
	    const ax = a[0], ay = a[1], az = a[2], aw = a[3];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    out[3] = aw + t * (b[3] - aw);
	    return out;
	}
	function random$2(out, length = 1.0) {
	    // TODO: This is a pretty awful way of doing this. Find something better.
	    out[0] = Math.random();
	    out[1] = Math.random();
	    out[2] = Math.random();
	    out[3] = Math.random();
	    normalize$2(out, out);
	    scale$2(out, out, length);
	    return out;
	}
	function clamp$3(out, a, min, max) {
	    if (typeof min === "number") {
	        out[0] = clamp(a[0], min, max);
	        out[1] = clamp(a[1], min, max);
	        out[2] = clamp(a[2], min, max);
	        out[3] = clamp(a[3], min, max);
	    }
	    else {
	        out[0] = clamp(a[0], min[0], max[0]);
	        out[1] = clamp(a[1], min[1], max[1]);
	        out[2] = clamp(a[2], min[2], max[2]);
	        out[3] = clamp(a[3], min[3], max[3]);
	    }
	    return out;
	}
	function clamp01$3(out, a) {
	    out[0] = clamp01(a[0]);
	    out[1] = clamp01(a[1]);
	    out[2] = clamp01(a[2]);
	    out[3] = clamp01(a[3]);
	    return out;
	}
	function mix$3(out, a, b, ratio) {
	    if (typeof ratio === "number") {
	        out[0] = mix(a[0], b[0], ratio);
	        out[1] = mix(a[1], b[1], ratio);
	        out[2] = mix(a[2], b[2], ratio);
	        out[3] = mix(a[3], b[3], ratio);
	    }
	    else {
	        out[0] = mix(a[0], b[0], ratio[0]);
	        out[1] = mix(a[1], b[1], ratio[1]);
	        out[2] = mix(a[2], b[2], ratio[2]);
	        out[3] = mix(a[3], b[3], ratio[3]);
	    }
	    return out;
	}
	function sign$2(out, a) {
	    out[0] = Math.sign(a[0]);
	    out[1] = Math.sign(a[1]);
	    out[2] = Math.sign(a[2]);
	    out[3] = Math.sign(a[3]);
	    return out;
	}
	function transformMat4$2(out, a, m) {
	    const x = a[0], y = a[1], z = a[2], w = a[3];
	    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	    return out;
	}
	function transformQuat$1(out, a, q) {
	    const x = a[0], y = a[1], z = a[2], qx = q[0], qy = q[1], qz = q[2], qw = q[3], 
	    // calculate quat * vec
	    ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    out[3] = a[3];
	    return out;
	}
	function forEach$2(a, opt, fn, ...args) {
	    const stride = opt.stride || ELEMENT_COUNT$2;
	    const offset = opt.offset || 0;
	    const count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;
	    const vec = create$2();
	    for (let i = offset; i < count; i += stride) {
	        vec[0] = a[i];
	        vec[1] = a[i + 1];
	        vec[2] = a[i + 2];
	        vec[3] = a[i + 3];
	        fn(vec, vec, args);
	        a[i] = vec[0];
	        a[i + 1] = vec[1];
	        a[i + 2] = vec[2];
	        a[i + 3] = vec[3];
	    }
	    return a;
	}
	function str$2(a) {
	    return `vec4(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
	}
	function exactEquals$2(a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
	}
	function equals$2(a, b) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	        Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
	}

	var vec4 = /*#__PURE__*/Object.freeze({
		ELEMENT_COUNT: ELEMENT_COUNT$2,
		create: create$2,
		zero: zero$2,
		one: one$2,
		clone: clone$2,
		fromValues: fromValues$2,
		copy: copy$2,
		set: set$2,
		add: add$2,
		subtract: subtract$2,
		sub: sub$2,
		multiply: multiply$2,
		mul: mul$2,
		divide: divide$2,
		div: div$2,
		ceil: ceil$2,
		floor: floor$2,
		min: min$2,
		max: max$2,
		round: round$2,
		scale: scale$2,
		scaleAndAdd: scaleAndAdd$2,
		distance: distance$2,
		dist: dist$2,
		squaredDistance: squaredDistance$2,
		sqrDist: sqrDist$2,
		length: length$2,
		len: len$2,
		squaredLength: squaredLength$2,
		sqrLen: sqrLen$2,
		negate: negate$2,
		inverse: inverse$2,
		normalize: normalize$2,
		dot: dot$2,
		lerp: lerp$2,
		random: random$2,
		clamp: clamp$3,
		clamp01: clamp01$3,
		mix: mix$3,
		sign: sign$2,
		transformMat4: transformMat4$2,
		transformQuat: transformQuat$1,
		forEach: forEach$2,
		str: str$2,
		exactEquals: exactEquals$2,
		equals: equals$2
	});

	/**
	 * math/mat3 - 3x3 matrix type
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	const ELEMENT_COUNT$3 = 9;
	function create$3() {
	    const out = new Float32Array(ELEMENT_COUNT$3);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	}
	function clone$3(a) {
	    const out = new Float32Array(ELEMENT_COUNT$3);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	}
	function copy$3(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	}
	function identity(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	}
	function fromValues$3(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
	    const out = new Float32Array(ELEMENT_COUNT$3);
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m02;
	    out[3] = m10;
	    out[4] = m11;
	    out[5] = m12;
	    out[6] = m20;
	    out[7] = m21;
	    out[8] = m22;
	    return out;
	}
	function set$3(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m02;
	    out[3] = m10;
	    out[4] = m11;
	    out[5] = m12;
	    out[6] = m20;
	    out[7] = m21;
	    out[8] = m22;
	    return out;
	}
	function transpose(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        const a01 = a[1], a02 = a[2], a12 = a[5];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a01;
	        out[5] = a[7];
	        out[6] = a02;
	        out[7] = a12;
	    }
	    else {
	        out[0] = a[0];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a[1];
	        out[4] = a[4];
	        out[5] = a[7];
	        out[6] = a[2];
	        out[7] = a[5];
	        out[8] = a[8];
	    }
	    return out;
	}
	function invert(out, a) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20;
	    // Calculate the determinant
	    let det = a00 * b01 + a01 * b11 + a02 * b21;
	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;
	    out[0] = b01 * det;
	    out[1] = (-a22 * a01 + a02 * a21) * det;
	    out[2] = (a12 * a01 - a02 * a11) * det;
	    out[3] = b11 * det;
	    out[4] = (a22 * a00 - a02 * a20) * det;
	    out[5] = (-a12 * a00 + a02 * a10) * det;
	    out[6] = b21 * det;
	    out[7] = (-a21 * a00 + a01 * a20) * det;
	    out[8] = (a11 * a00 - a01 * a10) * det;
	    return out;
	}
	function adjoint(out, a) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
	    out[0] = (a11 * a22 - a12 * a21);
	    out[1] = (a02 * a21 - a01 * a22);
	    out[2] = (a01 * a12 - a02 * a11);
	    out[3] = (a12 * a20 - a10 * a22);
	    out[4] = (a00 * a22 - a02 * a20);
	    out[5] = (a02 * a10 - a00 * a12);
	    out[6] = (a10 * a21 - a11 * a20);
	    out[7] = (a01 * a20 - a00 * a21);
	    out[8] = (a00 * a11 - a01 * a10);
	    return out;
	}
	function determinant(a) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
	    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
	}
	function multiply$3(out, a, b) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], b00 = b[0], b01 = b[1], b02 = b[2], b10 = b[3], b11 = b[4], b12 = b[5], b20 = b[6], b21 = b[7], b22 = b[8];
	    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
	    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
	    out[2] = b00 * a02 + b01 * a12 + b02 * a22;
	    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
	    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
	    out[5] = b10 * a02 + b11 * a12 + b12 * a22;
	    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
	    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
	    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
	    return out;
	}
	const mul$3 = multiply$3;
	function rotate(out, a, rad) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    out[0] = c * a00 + s * a10;
	    out[1] = c * a01 + s * a11;
	    out[2] = c * a02 + s * a12;
	    out[3] = c * a10 - s * a00;
	    out[4] = c * a11 - s * a01;
	    out[5] = c * a12 - s * a02;
	    out[6] = a20;
	    out[7] = a21;
	    out[8] = a22;
	    return out;
	}
	function scale$3(out, a, v2) {
	    const x = v2[0], y = v2[1];
	    out[0] = x * a[0];
	    out[1] = x * a[1];
	    out[2] = x * a[2];
	    out[3] = y * a[3];
	    out[4] = y * a[4];
	    out[5] = y * a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	}
	function translate(out, a, v2) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
	    const x = v2[0], y = v2[1];
	    out[0] = a00;
	    out[1] = a01;
	    out[2] = a02;
	    out[3] = a10;
	    out[4] = a11;
	    out[5] = a12;
	    out[6] = x * a00 + y * a10 + a20;
	    out[7] = x * a01 + y * a11 + a21;
	    out[8] = x * a02 + y * a12 + a22;
	    return out;
	}
	function fromRotation(out, rad) {
	    const s = Math.sin(rad), c = Math.cos(rad);
	    out[0] = c;
	    out[1] = s;
	    out[2] = 0;
	    out[3] = -s;
	    out[4] = c;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	}
	function fromScaling(out, v2) {
	    out[0] = v2[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = v2[1];
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	}
	function fromTranslation(out, v2) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = v2[0];
	    out[7] = v2[1];
	    out[8] = 1;
	    return out;
	}
	function fromMat2d(out, m2d) {
	    out[0] = m2d[0];
	    out[1] = m2d[1];
	    out[2] = 0;
	    out[3] = m2d[2];
	    out[4] = m2d[3];
	    out[5] = 0;
	    out[6] = m2d[4];
	    out[7] = m2d[5];
	    out[8] = 1;
	    return out;
	}
	function fromMat4(out, m4) {
	    out[0] = m4[0];
	    out[1] = m4[1];
	    out[2] = m4[2];
	    out[3] = m4[4];
	    out[4] = m4[5];
	    out[5] = m4[6];
	    out[6] = m4[8];
	    out[7] = m4[9];
	    out[8] = m4[10];
	    return out;
	}
	function fromQuat(out, q) {
	    const x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, yx = y * x2, yy = y * y2, zx = z * x2, zy = z * y2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
	    out[0] = 1 - yy - zz;
	    out[3] = yx - wz;
	    out[6] = zx + wy;
	    out[1] = yx + wz;
	    out[4] = 1 - xx - zz;
	    out[7] = zy - wx;
	    out[2] = zx - wy;
	    out[5] = zy + wx;
	    out[8] = 1 - xx - yy;
	    return out;
	}
	function normalFromMat4(out, m4) {
	    const a00 = m4[0], a01 = m4[1], a02 = m4[2], a03 = m4[3], a10 = m4[4], a11 = m4[5], a12 = m4[6], a13 = m4[7], a20 = m4[8], a21 = m4[9], a22 = m4[10], a23 = m4[11], a30 = m4[12], a31 = m4[13], a32 = m4[14], a33 = m4[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
	    // Calculate the determinant
	    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;
	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	    return out;
	}
	function str$3(a) {
	    return `mat3(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]}, ${a[6]}, ${a[7]}, ${a[8]})`;
	}
	function frob(a) {
	    return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) +
	        Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2));
	}
	function add$3(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    out[4] = a[4] + b[4];
	    out[5] = a[5] + b[5];
	    out[6] = a[6] + b[6];
	    out[7] = a[7] + b[7];
	    out[8] = a[8] + b[8];
	    return out;
	}
	function subtract$3(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    out[4] = a[4] - b[4];
	    out[5] = a[5] - b[5];
	    out[6] = a[6] - b[6];
	    out[7] = a[7] - b[7];
	    out[8] = a[8] - b[8];
	    return out;
	}
	const sub$3 = subtract$3;
	function multiplyScalar(out, a, scale) {
	    out[0] = a[0] * scale;
	    out[1] = a[1] * scale;
	    out[2] = a[2] * scale;
	    out[3] = a[3] * scale;
	    out[4] = a[4] * scale;
	    out[5] = a[5] * scale;
	    out[6] = a[6] * scale;
	    out[7] = a[7] * scale;
	    out[8] = a[8] * scale;
	    return out;
	}
	function multiplyScalarAndAdd(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    out[4] = a[4] + (b[4] * scale);
	    out[5] = a[5] + (b[5] * scale);
	    out[6] = a[6] + (b[6] * scale);
	    out[7] = a[7] + (b[7] * scale);
	    out[8] = a[8] + (b[8] * scale);
	    return out;
	}
	function exactEquals$3(a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] &&
	        a[3] === b[3] && a[4] === b[4] && a[5] === b[5] &&
	        a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
	}
	function equals$3(a, b) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8];
	    const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8];
	    return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	        Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
	        Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
	        Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
	        Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
	        Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
	        Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)));
	}

	var mat3 = /*#__PURE__*/Object.freeze({
		ELEMENT_COUNT: ELEMENT_COUNT$3,
		create: create$3,
		clone: clone$3,
		copy: copy$3,
		identity: identity,
		fromValues: fromValues$3,
		set: set$3,
		transpose: transpose,
		invert: invert,
		adjoint: adjoint,
		determinant: determinant,
		multiply: multiply$3,
		mul: mul$3,
		rotate: rotate,
		scale: scale$3,
		translate: translate,
		fromRotation: fromRotation,
		fromScaling: fromScaling,
		fromTranslation: fromTranslation,
		fromMat2d: fromMat2d,
		fromMat4: fromMat4,
		fromQuat: fromQuat,
		normalFromMat4: normalFromMat4,
		str: str$3,
		frob: frob,
		add: add$3,
		subtract: subtract$3,
		sub: sub$3,
		multiplyScalar: multiplyScalar,
		multiplyScalarAndAdd: multiplyScalarAndAdd,
		exactEquals: exactEquals$3,
		equals: equals$3
	});

	/**
	 * math/quat - quaternion type
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	const ELEMENT_COUNT$4 = 4;
	function create$4() {
	    const out = new Float32Array(ELEMENT_COUNT$4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	}
	const tmpVec3_ = create$1();
	const xUnitVec3_ = fromValues$1(1, 0, 0);
	const yUnitVec3_ = fromValues$1(0, 1, 0);
	function rotationTo(out, a, b) {
	    const dot = dot$1(a, b);
	    if (dot < (-1 + EPSILON)) {
	        cross$1(tmpVec3_, xUnitVec3_, a);
	        if (length$1(tmpVec3_) < EPSILON) {
	            cross$1(tmpVec3_, yUnitVec3_, a);
	        }
	        normalize$1(tmpVec3_, tmpVec3_);
	        setAxisAngle(out, tmpVec3_, Math.PI);
	        return out;
	    }
	    else if (dot > (1 - EPSILON)) {
	        out[0] = 0;
	        out[1] = 0;
	        out[2] = 0;
	        out[3] = 1;
	        return out;
	    }
	    else {
	        cross$1(tmpVec3_, a, b);
	        out[0] = tmpVec3_[0];
	        out[1] = tmpVec3_[1];
	        out[2] = tmpVec3_[2];
	        out[3] = 1 + dot;
	        return normalize$3(out, out);
	    }
	}
	const mat_ = create$3();
	function setAxes(out, view, right, up) {
	    mat_[0] = right[0];
	    mat_[3] = right[1];
	    mat_[6] = right[2];
	    mat_[1] = up[0];
	    mat_[4] = up[1];
	    mat_[7] = up[2];
	    mat_[2] = -view[0];
	    mat_[5] = -view[1];
	    mat_[8] = -view[2];
	    return normalize$3(out, fromMat3(out, mat_));
	}
	const clone$4 = clone$2;
	const fromValues$4 = fromValues$2;
	const copy$4 = copy$2;
	const set$4 = set$2;
	function identity$1(out) {
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	}
	function setAxisAngle(out, axis, rad) {
	    rad = rad * 0.5;
	    const s = Math.sin(rad);
	    out[0] = s * axis[0];
	    out[1] = s * axis[1];
	    out[2] = s * axis[2];
	    out[3] = Math.cos(rad);
	    return out;
	}
	function getAxisAngle(outAxis, q) {
	    const rad = Math.acos(q[3]) * 2.0;
	    const s = Math.sin(rad / 2.0);
	    if (s !== 0.0) {
	        outAxis[0] = q[0] / s;
	        outAxis[1] = q[1] / s;
	        outAxis[2] = q[2] / s;
	    }
	    else {
	        // If s is zero, return any axis (no rotation - axis does not matter)
	        outAxis[0] = 1;
	        outAxis[1] = 0;
	        outAxis[2] = 0;
	    }
	    return rad;
	}
	const add$4 = add$2;
	function multiply$4(out, a, b) {
	    const ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];
	    out[0] = ax * bw + aw * bx + ay * bz - az * by;
	    out[1] = ay * bw + aw * by + az * bx - ax * bz;
	    out[2] = az * bw + aw * bz + ax * by - ay * bx;
	    out[3] = aw * bw - ax * bx - ay * by - az * bz;
	    return out;
	}
	const mul$4 = multiply$4;
	const scale$4 = scale$2;
	function rotateX$1(out, a, rad) {
	    rad *= 0.5;
	    const ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = Math.sin(rad), bw = Math.cos(rad);
	    out[0] = ax * bw + aw * bx;
	    out[1] = ay * bw + az * bx;
	    out[2] = az * bw - ay * bx;
	    out[3] = aw * bw - ax * bx;
	    return out;
	}
	function rotateY$1(out, a, rad) {
	    rad *= 0.5;
	    const ax = a[0], ay = a[1], az = a[2], aw = a[3], by = Math.sin(rad), bw = Math.cos(rad);
	    out[0] = ax * bw - az * by;
	    out[1] = ay * bw + aw * by;
	    out[2] = az * bw + ax * by;
	    out[3] = aw * bw - ay * by;
	    return out;
	}
	function rotateZ$1(out, a, rad) {
	    rad *= 0.5;
	    const ax = a[0], ay = a[1], az = a[2], aw = a[3], bz = Math.sin(rad), bw = Math.cos(rad);
	    out[0] = ax * bw + ay * bz;
	    out[1] = ay * bw - ax * bz;
	    out[2] = az * bw + aw * bz;
	    out[3] = aw * bw - az * bz;
	    return out;
	}
	function calculateW(out, a) {
	    const x = a[0], y = a[1], z = a[2];
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
	    return out;
	}
	const dot$3 = dot$2;
	const lerp$3 = lerp$2;
	function slerp(out, a, b, t) {
	    // benchmarks:
	    //    http://jsperf.com/quaternion-slerp-implementations
	    const ax = a[0], ay = a[1], az = a[2], aw = a[3];
	    let bx = b[0], by = b[1], bz = b[2], bw = b[3];
	    let omega, cosom, sinom, scale0, scale1;
	    // calc cosine
	    cosom = ax * bx + ay * by + az * bz + aw * bw;
	    // adjust signs (if necessary)
	    if (cosom < 0.0) {
	        cosom = -cosom;
	        bx = -bx;
	        by = -by;
	        bz = -bz;
	        bw = -bw;
	    }
	    // calculate coefficients
	    if ((1.0 - cosom) > EPSILON) {
	        // standard case (slerp)
	        omega = Math.acos(cosom);
	        sinom = Math.sin(omega);
	        scale0 = Math.sin((1.0 - t) * omega) / sinom;
	        scale1 = Math.sin(t * omega) / sinom;
	    }
	    else {
	        // "from" and "to" quaternions are very close 
	        //  ... so we can do a linear interpolation
	        scale0 = 1.0 - t;
	        scale1 = t;
	    }
	    // calculate final values
	    out[0] = scale0 * ax + scale1 * bx;
	    out[1] = scale0 * ay + scale1 * by;
	    out[2] = scale0 * az + scale1 * bz;
	    out[3] = scale0 * aw + scale1 * bw;
	    return out;
	}
	const tempQ1_ = create$4();
	const tempQ2_ = create$4();
	function sqlerp(out, a, b, c, d, t) {
	    slerp(tempQ1_, a, d, t);
	    slerp(tempQ2_, b, c, t);
	    slerp(out, tempQ1_, tempQ2_, 2 * t * (1 - t));
	    return out;
	}
	function invert$1(out, a) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3, // tslint:disable-line:no-shadowed-variable
	    invDot = dot ? 1.0 / dot : 0;
	    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
	    out[0] = -a0 * invDot;
	    out[1] = -a1 * invDot;
	    out[2] = -a2 * invDot;
	    out[3] = a3 * invDot;
	    return out;
	}
	function conjugate(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = a[3];
	    return out;
	}
	const length$3 = length$2;
	const len$3 = length$3;
	const squaredLength$3 = squaredLength$2;
	const sqrLen$3 = squaredLength$3;
	const normalize$3 = normalize$2;
	function fromMat3(out, m) {
	    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	    // article "Quaternion Calculus and Fast Animation".
	    const fTrace = m[0] + m[4] + m[8];
	    let fRoot;
	    if (fTrace > 0.0) {
	        // |w| > 1/2, may as well choose w > 1/2
	        fRoot = Math.sqrt(fTrace + 1.0); // 2w
	        out[3] = 0.5 * fRoot;
	        fRoot = 0.5 / fRoot; // 1/(4w)
	        out[0] = (m[5] - m[7]) * fRoot;
	        out[1] = (m[6] - m[2]) * fRoot;
	        out[2] = (m[1] - m[3]) * fRoot;
	    }
	    else {
	        // |w| <= 1/2
	        let i = 0;
	        if (m[4] > m[0]) {
	            i = 1;
	        }
	        if (m[8] > m[i * 3 + i]) {
	            i = 2;
	        }
	        const j = (i + 1) % 3;
	        const k = (i + 2) % 3;
	        fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
	        out[i] = 0.5 * fRoot;
	        fRoot = 0.5 / fRoot;
	        out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
	        out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
	        out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
	    }
	    return out;
	}
	function fromEuler(yaw, pitch, roll) {
	    const y = yaw * 0.5;
	    const p = pitch * 0.5;
	    const r = roll * 0.5;
	    const siny = Math.sin(y), cosy = Math.cos(y);
	    const sinp = Math.sin(p), cosp = Math.cos(p);
	    const sinr = Math.sin(r), cosr = Math.cos(r);
	    // evaluated form of 3 Quat multiplications (of yaw, pitch and roll)
	    return normalize$3(new Float32Array(ELEMENT_COUNT$4), [
	        sinr * cosp * cosy - cosr * sinp * siny,
	        cosr * sinp * cosy + sinr * cosp * siny,
	        cosr * cosp * siny - sinr * sinp * cosy,
	        cosr * cosp * cosy + sinr * sinp * siny
	    ]);
	}
	function str$4(a) {
	    return `quat(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
	}
	const exactEquals$4 = exactEquals$2;
	const equals$4 = equals$2;

	var quat = /*#__PURE__*/Object.freeze({
		ELEMENT_COUNT: ELEMENT_COUNT$4,
		create: create$4,
		rotationTo: rotationTo,
		setAxes: setAxes,
		clone: clone$4,
		fromValues: fromValues$4,
		copy: copy$4,
		set: set$4,
		identity: identity$1,
		setAxisAngle: setAxisAngle,
		getAxisAngle: getAxisAngle,
		add: add$4,
		multiply: multiply$4,
		mul: mul$4,
		scale: scale$4,
		rotateX: rotateX$1,
		rotateY: rotateY$1,
		rotateZ: rotateZ$1,
		calculateW: calculateW,
		dot: dot$3,
		lerp: lerp$3,
		slerp: slerp,
		sqlerp: sqlerp,
		invert: invert$1,
		conjugate: conjugate,
		length: length$3,
		len: len$3,
		squaredLength: squaredLength$3,
		sqrLen: sqrLen$3,
		normalize: normalize$3,
		fromMat3: fromMat3,
		fromEuler: fromEuler,
		str: str$4,
		exactEquals: exactEquals$4,
		equals: equals$4
	});

	/**
	 * math/mat2 - 2x2 matrix type
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	const ELEMENT_COUNT$5 = 4;
	function create$5() {
	    const out = new Float32Array(ELEMENT_COUNT$5);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	}
	function clone$5(a) {
	    const out = new Float32Array(ELEMENT_COUNT$5);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	}
	function copy$5(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	}
	function identity$2(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	}
	function fromValues$5(m00, m01, m10, m11) {
	    const out = new Float32Array(ELEMENT_COUNT$5);
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m10;
	    out[3] = m11;
	    return out;
	}
	function set$5(out, m00, m01, m10, m11) {
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m10;
	    out[3] = m11;
	    return out;
	}
	function transpose$1(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        const a1 = a[1];
	        out[1] = a[2];
	        out[2] = a1;
	    }
	    else {
	        out[0] = a[0];
	        out[1] = a[2];
	        out[2] = a[1];
	        out[3] = a[3];
	    }
	    return out;
	}
	function invert$2(out, a) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    // Calculate the determinant
	    let det = a0 * a3 - a2 * a1;
	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;
	    out[0] = a3 * det;
	    out[1] = -a1 * det;
	    out[2] = -a2 * det;
	    out[3] = a0 * det;
	    return out;
	}
	function adjoint$1(out, a) {
	    // Caching this value is necessary if out == a
	    const a0 = a[0];
	    out[0] = a[3];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = a0;
	    return out;
	}
	function determinant$1(a) {
	    return a[0] * a[3] - a[2] * a[1];
	}
	function multiply$5(out, a, b) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    out[0] = a0 * b0 + a2 * b1;
	    out[1] = a1 * b0 + a3 * b1;
	    out[2] = a0 * b2 + a2 * b3;
	    out[3] = a1 * b2 + a3 * b3;
	    return out;
	}
	const mul$5 = multiply$5;
	function rotate$1(out, a, rad) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    out[0] = a0 * c + a2 * s;
	    out[1] = a1 * c + a3 * s;
	    out[2] = a0 * -s + a2 * c;
	    out[3] = a1 * -s + a3 * c;
	    return out;
	}
	function scale$5(out, a, v2) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    const v0 = v2[0], v1 = v2[1];
	    out[0] = a0 * v0;
	    out[1] = a1 * v0;
	    out[2] = a2 * v1;
	    out[3] = a3 * v1;
	    return out;
	}
	function fromRotation$1(out, rad) {
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    out[0] = c;
	    out[1] = s;
	    out[2] = -s;
	    out[3] = c;
	    return out;
	}
	function fromScaling$1(out, v2) {
	    out[0] = v2[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = v2[1];
	    return out;
	}
	function str$5(a) {
	    return `mat2(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]})`;
	}
	function frob$1(a) {
	    return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2));
	}
	function LDU(L, D, U, a) {
	    L[2] = a[2] / a[0];
	    U[0] = a[0];
	    U[1] = a[1];
	    U[3] = a[3] - L[2] * U[1];
	    return [L, D, U];
	}
	function add$5(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    return out;
	}
	function subtract$4(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    return out;
	}
	const sub$4 = subtract$4;
	function multiplyScalar$1(out, a, scale) {
	    out[0] = a[0] * scale;
	    out[1] = a[1] * scale;
	    out[2] = a[2] * scale;
	    out[3] = a[3] * scale;
	    return out;
	}
	function multiplyScalarAndAdd$1(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    return out;
	}
	function exactEquals$5(a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
	}
	function equals$5(a, b) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	        Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
	}

	var mat2 = /*#__PURE__*/Object.freeze({
		ELEMENT_COUNT: ELEMENT_COUNT$5,
		create: create$5,
		clone: clone$5,
		copy: copy$5,
		identity: identity$2,
		fromValues: fromValues$5,
		set: set$5,
		transpose: transpose$1,
		invert: invert$2,
		adjoint: adjoint$1,
		determinant: determinant$1,
		multiply: multiply$5,
		mul: mul$5,
		rotate: rotate$1,
		scale: scale$5,
		fromRotation: fromRotation$1,
		fromScaling: fromScaling$1,
		str: str$5,
		frob: frob$1,
		LDU: LDU,
		add: add$5,
		subtract: subtract$4,
		sub: sub$4,
		multiplyScalar: multiplyScalar$1,
		multiplyScalarAndAdd: multiplyScalarAndAdd$1,
		exactEquals: exactEquals$5,
		equals: equals$5
	});

	/**
	 * math/mat2d - 3x2 matrix type
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 *
	 * @description
	 * A mat2d contains six elements defined as:
	 * <pre>
	 * [a, c, tx,
	 *  b, d, ty]
	 * </pre>
	 * This is a short form for the 3x3 matrix:
	 * <pre>
	 * [a, c, tx,
	 *  b, d, ty,
	 *  0, 0, 1]
	 * </pre>
	 * The last row is ignored so the array is shorter and operations are faster.
	 */
	const ELEMENT_COUNT$6 = 6;
	function create$6() {
	    const out = new Float32Array(ELEMENT_COUNT$6);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	}
	function clone$6(a) {
	    const out = new Float32Array(ELEMENT_COUNT$6);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	}
	function copy$6(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	}
	function identity$3(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	}
	function fromValues$6(a, b, c, d, tx, ty) {
	    const out = new Float32Array(ELEMENT_COUNT$6);
	    out[0] = a;
	    out[1] = b;
	    out[2] = c;
	    out[3] = d;
	    out[4] = tx;
	    out[5] = ty;
	    return out;
	}
	function set$6(out, a, b, c, d, tx, ty) {
	    out[0] = a;
	    out[1] = b;
	    out[2] = c;
	    out[3] = d;
	    out[4] = tx;
	    out[5] = ty;
	    return out;
	}
	function invert$3(out, a) {
	    const aa = a[0], ab = a[1], ac = a[2], ad = a[3];
	    const atx = a[4], aty = a[5];
	    let det = aa * ad - ab * ac;
	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;
	    out[0] = ad * det;
	    out[1] = -ab * det;
	    out[2] = -ac * det;
	    out[3] = aa * det;
	    out[4] = (ac * aty - ad * atx) * det;
	    out[5] = (ab * atx - aa * aty) * det;
	    return out;
	}
	function determinant$2(a) {
	    return a[0] * a[3] - a[1] * a[2];
	}
	function multiply$6(out, a, b) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	    const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
	    out[0] = a0 * b0 + a2 * b1;
	    out[1] = a1 * b0 + a3 * b1;
	    out[2] = a0 * b2 + a2 * b3;
	    out[3] = a1 * b2 + a3 * b3;
	    out[4] = a0 * b4 + a2 * b5 + a4;
	    out[5] = a1 * b4 + a3 * b5 + a5;
	    return out;
	}
	const mul$6 = multiply$6;
	function rotate$2(out, a, rad) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    out[0] = a0 * c + a2 * s;
	    out[1] = a1 * c + a3 * s;
	    out[2] = a0 * -s + a2 * c;
	    out[3] = a1 * -s + a3 * c;
	    out[4] = a4;
	    out[5] = a5;
	    return out;
	}
	function scale$6(out, a, v2) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	    const v0 = v2[0], v1 = v2[1];
	    out[0] = a0 * v0;
	    out[1] = a1 * v0;
	    out[2] = a2 * v1;
	    out[3] = a3 * v1;
	    out[4] = a4;
	    out[5] = a5;
	    return out;
	}
	function translate$1(out, a, v2) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	    const v0 = v2[0], v1 = v2[1];
	    out[0] = a0;
	    out[1] = a1;
	    out[2] = a2;
	    out[3] = a3;
	    out[4] = a0 * v0 + a2 * v1 + a4;
	    out[5] = a1 * v0 + a3 * v1 + a5;
	    return out;
	}
	function fromRotation$2(out, rad) {
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    out[0] = c;
	    out[1] = s;
	    out[2] = -s;
	    out[3] = c;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	}
	function fromScaling$2(out, v2) {
	    out[0] = v2[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = v2[1];
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	}
	function fromTranslation$1(out, v2) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = v2[0];
	    out[5] = v2[1];
	    return out;
	}
	function str$6(a) {
	    return `mat2d(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]})`;
	}
	function frob$2(a) {
	    return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) +
	        Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1);
	}
	function add$6(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    out[4] = a[4] + b[4];
	    out[5] = a[5] + b[5];
	    return out;
	}
	function subtract$5(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    out[4] = a[4] - b[4];
	    out[5] = a[5] - b[5];
	    return out;
	}
	const sub$5 = subtract$5;
	function multiplyScalar$2(out, a, scale) {
	    out[0] = a[0] * scale;
	    out[1] = a[1] * scale;
	    out[2] = a[2] * scale;
	    out[3] = a[3] * scale;
	    out[4] = a[4] * scale;
	    out[5] = a[5] * scale;
	    return out;
	}
	function multiplyScalarAndAdd$2(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    out[4] = a[4] + (b[4] * scale);
	    out[5] = a[5] + (b[5] * scale);
	    return out;
	}
	function exactEquals$6(a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
	}
	function equals$6(a, b) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	    const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
	    return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	        Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
	        Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
	        Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)));
	}

	var mat2d = /*#__PURE__*/Object.freeze({
		ELEMENT_COUNT: ELEMENT_COUNT$6,
		create: create$6,
		clone: clone$6,
		copy: copy$6,
		identity: identity$3,
		fromValues: fromValues$6,
		set: set$6,
		invert: invert$3,
		determinant: determinant$2,
		multiply: multiply$6,
		mul: mul$6,
		rotate: rotate$2,
		scale: scale$6,
		translate: translate$1,
		fromRotation: fromRotation$2,
		fromScaling: fromScaling$2,
		fromTranslation: fromTranslation$1,
		str: str$6,
		frob: frob$2,
		add: add$6,
		subtract: subtract$5,
		sub: sub$5,
		multiplyScalar: multiplyScalar$2,
		multiplyScalarAndAdd: multiplyScalarAndAdd$2,
		exactEquals: exactEquals$6,
		equals: equals$6
	});

	/**
	 * math/mat4 - 4x4 matrix type
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	const ELEMENT_COUNT$7 = 16;
	function create$7() {
	    const out = new Float32Array(ELEMENT_COUNT$7);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	function clone$7(a) {
	    const out = new Float32Array(ELEMENT_COUNT$7);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	}
	function copy$7(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	}
	function identity$4(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	function fromValues$7(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
	    const out = new Float32Array(ELEMENT_COUNT$7);
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m02;
	    out[3] = m03;
	    out[4] = m10;
	    out[5] = m11;
	    out[6] = m12;
	    out[7] = m13;
	    out[8] = m20;
	    out[9] = m21;
	    out[10] = m22;
	    out[11] = m23;
	    out[12] = m30;
	    out[13] = m31;
	    out[14] = m32;
	    out[15] = m33;
	    return out;
	}
	function set$7(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m02;
	    out[3] = m03;
	    out[4] = m10;
	    out[5] = m11;
	    out[6] = m12;
	    out[7] = m13;
	    out[8] = m20;
	    out[9] = m21;
	    out[10] = m22;
	    out[11] = m23;
	    out[12] = m30;
	    out[13] = m31;
	    out[14] = m32;
	    out[15] = m33;
	    return out;
	}
	function transpose$2(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        const a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a01;
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a02;
	        out[9] = a12;
	        out[11] = a[14];
	        out[12] = a03;
	        out[13] = a13;
	        out[14] = a23;
	    }
	    else {
	        out[0] = a[0];
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a[1];
	        out[5] = a[5];
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a[2];
	        out[9] = a[6];
	        out[10] = a[10];
	        out[11] = a[14];
	        out[12] = a[3];
	        out[13] = a[7];
	        out[14] = a[11];
	        out[15] = a[15];
	    }
	    return out;
	}
	function invert$4(out, a) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
	    // Calculate the determinant
	    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;
	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
	    return out;
	}
	function adjoint$2(out, a) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	    out[0] = (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
	    out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
	    out[2] = (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
	    out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
	    out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
	    out[5] = (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
	    out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
	    out[7] = (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
	    out[8] = (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
	    out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
	    out[10] = (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
	    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
	    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
	    out[13] = (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
	    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
	    out[15] = (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
	    return out;
	}
	function determinant$3(a) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
	    // Calculate the determinant
	    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	}
	function multiply$7(out, a, b) {
	    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	    // Cache only the current line of the second matrix
	    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	    b0 = b[4];
	    b1 = b[5];
	    b2 = b[6];
	    b3 = b[7];
	    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	    b0 = b[8];
	    b1 = b[9];
	    b2 = b[10];
	    b3 = b[11];
	    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	    b0 = b[12];
	    b1 = b[13];
	    b2 = b[14];
	    b3 = b[15];
	    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	    return out;
	}
	const mul$7 = multiply$7;
	function rotate$3(out, a, rad, axis) {
	    let x = axis[0], y = axis[1], z = axis[2];
	    let len = Math.sqrt(x * x + y * y + z * z);
	    if (Math.abs(len) < EPSILON) {
	        return null;
	    }
	    len = 1 / len;
	    x *= len;
	    y *= len;
	    z *= len;
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    const t = 1 - c;
	    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
	    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
	    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
	    // Construct the elements of the rotation matrix
	    const b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s;
	    const b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s;
	    const b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;
	    // Perform rotation-specific matrix multiplication
	    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
	    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
	    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
	    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
	    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
	    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
	    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
	    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
	    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
	    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
	    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
	    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    return out;
	}
	function rotateX$2(out, a, rad) {
	    const s = Math.sin(rad), c = Math.cos(rad), a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[0] = a[0];
	        out[1] = a[1];
	        out[2] = a[2];
	        out[3] = a[3];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    // Perform axis-specific matrix multiplication
	    out[4] = a10 * c + a20 * s;
	    out[5] = a11 * c + a21 * s;
	    out[6] = a12 * c + a22 * s;
	    out[7] = a13 * c + a23 * s;
	    out[8] = a20 * c - a10 * s;
	    out[9] = a21 * c - a11 * s;
	    out[10] = a22 * c - a12 * s;
	    out[11] = a23 * c - a13 * s;
	    return out;
	}
	function rotateY$2(out, a, rad) {
	    const s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[4] = a[4];
	        out[5] = a[5];
	        out[6] = a[6];
	        out[7] = a[7];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c - a20 * s;
	    out[1] = a01 * c - a21 * s;
	    out[2] = a02 * c - a22 * s;
	    out[3] = a03 * c - a23 * s;
	    out[8] = a00 * s + a20 * c;
	    out[9] = a01 * s + a21 * c;
	    out[10] = a02 * s + a22 * c;
	    out[11] = a03 * s + a23 * c;
	    return out;
	}
	function rotateZ$2(out, a, rad) {
	    const s = Math.sin(rad), c = Math.cos(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[8] = a[8];
	        out[9] = a[9];
	        out[10] = a[10];
	        out[11] = a[11];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c + a10 * s;
	    out[1] = a01 * c + a11 * s;
	    out[2] = a02 * c + a12 * s;
	    out[3] = a03 * c + a13 * s;
	    out[4] = a10 * c - a00 * s;
	    out[5] = a11 * c - a01 * s;
	    out[6] = a12 * c - a02 * s;
	    out[7] = a13 * c - a03 * s;
	    return out;
	}
	function scale$7(out, a, v3) {
	    const x = v3[0], y = v3[1], z = v3[2];
	    out[0] = a[0] * x;
	    out[1] = a[1] * x;
	    out[2] = a[2] * x;
	    out[3] = a[3] * x;
	    out[4] = a[4] * y;
	    out[5] = a[5] * y;
	    out[6] = a[6] * y;
	    out[7] = a[7] * y;
	    out[8] = a[8] * z;
	    out[9] = a[9] * z;
	    out[10] = a[10] * z;
	    out[11] = a[11] * z;
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	}
	function translate$2(out, a, v3) {
	    const x = v3[0], y = v3[1], z = v3[2];
	    if (a === out) {
	        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
	        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
	        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
	        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	    }
	    else {
	        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
	        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
	        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
	        out[0] = a00;
	        out[1] = a01;
	        out[2] = a02;
	        out[3] = a03;
	        out[4] = a10;
	        out[5] = a11;
	        out[6] = a12;
	        out[7] = a13;
	        out[8] = a20;
	        out[9] = a21;
	        out[10] = a22;
	        out[11] = a23;
	        out[12] = a00 * x + a10 * y + a20 * z + a[12];
	        out[13] = a01 * x + a11 * y + a21 * z + a[13];
	        out[14] = a02 * x + a12 * y + a22 * z + a[14];
	        out[15] = a03 * x + a13 * y + a23 * z + a[15];
	    }
	    return out;
	}
	function fromRotation$3(out, rad, axis) {
	    let x = axis[0], y = axis[1], z = axis[2];
	    let len = Math.sqrt(x * x + y * y + z * z);
	    if (Math.abs(len) < EPSILON) {
	        return null;
	    }
	    len = 1 / len;
	    x *= len;
	    y *= len;
	    z *= len;
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    const t = 1 - c;
	    // Perform rotation-specific matrix multiplication
	    out[0] = x * x * t + c;
	    out[1] = y * x * t + z * s;
	    out[2] = z * x * t - y * s;
	    out[3] = 0;
	    out[4] = x * y * t - z * s;
	    out[5] = y * y * t + c;
	    out[6] = z * y * t + x * s;
	    out[7] = 0;
	    out[8] = x * z * t + y * s;
	    out[9] = y * z * t - x * s;
	    out[10] = z * z * t + c;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	function fromScaling$3(out, v3) {
	    out[0] = v3[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = v3[1];
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = v3[2];
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	function fromTranslation$2(out, v3) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = v3[0];
	    out[13] = v3[1];
	    out[14] = v3[2];
	    out[15] = 1;
	    return out;
	}
	function fromXRotation(out, rad) {
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    // Perform axis-specific matrix multiplication
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = c;
	    out[6] = s;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = -s;
	    out[10] = c;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	function fromYRotation(out, rad) {
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    // Perform axis-specific matrix multiplication
	    out[0] = c;
	    out[1] = 0;
	    out[2] = -s;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = s;
	    out[9] = 0;
	    out[10] = c;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	function fromZRotation(out, rad) {
	    const s = Math.sin(rad);
	    const c = Math.cos(rad);
	    // Perform axis-specific matrix multiplication
	    out[0] = c;
	    out[1] = s;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = -s;
	    out[5] = c;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	function fromRotationTranslation(out, q, v3) {
	    // Quaternion math
	    const x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
	    out[0] = 1 - (yy + zz);
	    out[1] = xy + wz;
	    out[2] = xz - wy;
	    out[3] = 0;
	    out[4] = xy - wz;
	    out[5] = 1 - (xx + zz);
	    out[6] = yz + wx;
	    out[7] = 0;
	    out[8] = xz + wy;
	    out[9] = yz - wx;
	    out[10] = 1 - (xx + yy);
	    out[11] = 0;
	    out[12] = v3[0];
	    out[13] = v3[1];
	    out[14] = v3[2];
	    out[15] = 1;
	    return out;
	}
	function fromRotationTranslationScale(out, q, v, s) {
	    // Quaternion math
	    const x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2, sx = s[0], sy = s[1], sz = s[2];
	    out[0] = (1 - (yy + zz)) * sx;
	    out[1] = (xy + wz) * sx;
	    out[2] = (xz - wy) * sx;
	    out[3] = 0;
	    out[4] = (xy - wz) * sy;
	    out[5] = (1 - (xx + zz)) * sy;
	    out[6] = (yz + wx) * sy;
	    out[7] = 0;
	    out[8] = (xz + wy) * sz;
	    out[9] = (yz - wx) * sz;
	    out[10] = (1 - (xx + yy)) * sz;
	    out[11] = 0;
	    out[12] = v[0];
	    out[13] = v[1];
	    out[14] = v[2];
	    out[15] = 1;
	    return out;
	}
	function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
	    // Quaternion math
	    const x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2, sx = s[0], sy = s[1], sz = s[2], ox = o[0], oy = o[1], oz = o[2];
	    out[0] = (1 - (yy + zz)) * sx;
	    out[1] = (xy + wz) * sx;
	    out[2] = (xz - wy) * sx;
	    out[3] = 0;
	    out[4] = (xy - wz) * sy;
	    out[5] = (1 - (xx + zz)) * sy;
	    out[6] = (yz + wx) * sy;
	    out[7] = 0;
	    out[8] = (xz + wy) * sz;
	    out[9] = (yz - wx) * sz;
	    out[10] = (1 - (xx + yy)) * sz;
	    out[11] = 0;
	    out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
	    out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
	    out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
	    out[15] = 1;
	    return out;
	}
	function fromQuat$1(out, q) {
	    const x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, yx = y * x2, yy = y * y2, zx = z * x2, zy = z * y2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
	    out[0] = 1 - yy - zz;
	    out[1] = yx + wz;
	    out[2] = zx - wy;
	    out[3] = 0;
	    out[4] = yx - wz;
	    out[5] = 1 - xx - zz;
	    out[6] = zy + wx;
	    out[7] = 0;
	    out[8] = zx + wy;
	    out[9] = zy - wx;
	    out[10] = 1 - xx - yy;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}
	function getTranslation(out, a) {
	    out[0] = a[12];
	    out[1] = a[13];
	    out[2] = a[14];
	    return out;
	}
	function getScaling(out, a) {
	    const m11 = a[0], m12 = a[1], m13 = a[2], m21 = a[4], m22 = a[5], m23 = a[6], m31 = a[8], m32 = a[9], m33 = a[10];
	    out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
	    out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
	    out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
	    return out;
	}
	function getRotation(out, a) {
	    // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
	    const trace = a[0] + a[5] + a[10];
	    let S;
	    if (trace > 0) {
	        S = Math.sqrt(trace + 1.0) * 2;
	        out[3] = 0.25 * S;
	        out[0] = (a[6] - a[9]) / S;
	        out[1] = (a[8] - a[2]) / S;
	        out[2] = (a[1] - a[4]) / S;
	    }
	    else if ((a[0] > a[5]) && (a[0] > a[10])) {
	        S = Math.sqrt(1.0 + a[0] - a[5] - a[10]) * 2;
	        out[3] = (a[6] - a[9]) / S;
	        out[0] = 0.25 * S;
	        out[1] = (a[1] + a[4]) / S;
	        out[2] = (a[8] + a[2]) / S;
	    }
	    else if (a[5] > a[10]) {
	        S = Math.sqrt(1.0 + a[5] - a[0] - a[10]) * 2;
	        out[3] = (a[8] - a[2]) / S;
	        out[0] = (a[1] + a[4]) / S;
	        out[1] = 0.25 * S;
	        out[2] = (a[6] + a[9]) / S;
	    }
	    else {
	        S = Math.sqrt(1.0 + a[10] - a[0] - a[5]) * 2;
	        out[3] = (a[1] - a[4]) / S;
	        out[0] = (a[8] + a[2]) / S;
	        out[1] = (a[6] + a[9]) / S;
	        out[2] = 0.25 * S;
	    }
	    return out;
	}
	function frustum(out, left, right, bottom, top, near, far) {
	    const rl = 1 / (right - left), tb = 1 / (top - bottom), nf = 1 / (near - far);
	    out[0] = (near * 2) * rl;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = (near * 2) * tb;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = (right + left) * rl;
	    out[9] = (top + bottom) * tb;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (far * near * 2) * nf;
	    out[15] = 0;
	    return out;
	}
	function perspective(out, fovy, aspect, near, far) {
	    const f = 1.0 / Math.tan(fovy / 2), nf = 1 / (near - far);
	    out[0] = f / aspect;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = f;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (2 * far * near) * nf;
	    out[15] = 0;
	    return out;
	}
	function perspectiveFromFieldOfView(out, fov, near, far) {
	    const upTan = Math.tan(fov.upDegrees * Math.PI / 180.0), downTan = Math.tan(fov.downDegrees * Math.PI / 180.0), leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0), rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0), xScale = 2.0 / (leftTan + rightTan), yScale = 2.0 / (upTan + downTan);
	    out[0] = xScale;
	    out[1] = 0.0;
	    out[2] = 0.0;
	    out[3] = 0.0;
	    out[4] = 0.0;
	    out[5] = yScale;
	    out[6] = 0.0;
	    out[7] = 0.0;
	    out[8] = -((leftTan - rightTan) * xScale * 0.5);
	    out[9] = ((upTan - downTan) * yScale * 0.5);
	    out[10] = far / (near - far);
	    out[11] = -1.0;
	    out[12] = 0.0;
	    out[13] = 0.0;
	    out[14] = (far * near) / (near - far);
	    out[15] = 0.0;
	    return out;
	}
	function ortho(out, left, right, bottom, top, near, far) {
	    const lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
	    out[0] = -2 * lr;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = -2 * bt;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 2 * nf;
	    out[11] = 0;
	    out[12] = (left + right) * lr;
	    out[13] = (top + bottom) * bt;
	    out[14] = (far + near) * nf;
	    out[15] = 1;
	    return out;
	}
	function lookAt(out, eye, center, up) {
	    const eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], centerx = center[0], centery = center[1], centerz = center[2];
	    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
	    if (Math.abs(eyex - centerx) < EPSILON &&
	        Math.abs(eyey - centery) < EPSILON &&
	        Math.abs(eyez - centerz) < EPSILON) {
	        return identity$4(out);
	    }
	    z0 = eyex - centerx;
	    z1 = eyey - centery;
	    z2 = eyez - centerz;
	    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	    z0 *= len;
	    z1 *= len;
	    z2 *= len;
	    x0 = upy * z2 - upz * z1;
	    x1 = upz * z0 - upx * z2;
	    x2 = upx * z1 - upy * z0;
	    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	    if (!len) {
	        x0 = 0;
	        x1 = 0;
	        x2 = 0;
	    }
	    else {
	        len = 1 / len;
	        x0 *= len;
	        x1 *= len;
	        x2 *= len;
	    }
	    y0 = z1 * x2 - z2 * x1;
	    y1 = z2 * x0 - z0 * x2;
	    y2 = z0 * x1 - z1 * x0;
	    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	    if (!len) {
	        y0 = 0;
	        y1 = 0;
	        y2 = 0;
	    }
	    else {
	        len = 1 / len;
	        y0 *= len;
	        y1 *= len;
	        y2 *= len;
	    }
	    out[0] = x0;
	    out[1] = y0;
	    out[2] = z0;
	    out[3] = 0;
	    out[4] = x1;
	    out[5] = y1;
	    out[6] = z1;
	    out[7] = 0;
	    out[8] = x2;
	    out[9] = y2;
	    out[10] = z2;
	    out[11] = 0;
	    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	    out[15] = 1;
	    return out;
	}
	function str$7(a) {
	    return `mat4(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]}, ${a[6]}, ${a[7]}, ${a[8]}, ${a[9]}, ${a[10]}, ${a[11]}, ${a[12]}, ${a[13]}, ${a[14]}, ${a[15]})`;
	}
	function frob$3(a) {
	    return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) +
	        Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) +
	        Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) +
	        Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2));
	}
	function add$7(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    out[4] = a[4] + b[4];
	    out[5] = a[5] + b[5];
	    out[6] = a[6] + b[6];
	    out[7] = a[7] + b[7];
	    out[8] = a[8] + b[8];
	    out[9] = a[9] + b[9];
	    out[10] = a[10] + b[10];
	    out[11] = a[11] + b[11];
	    out[12] = a[12] + b[12];
	    out[13] = a[13] + b[13];
	    out[14] = a[14] + b[14];
	    out[15] = a[15] + b[15];
	    return out;
	}
	function subtract$6(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    out[4] = a[4] - b[4];
	    out[5] = a[5] - b[5];
	    out[6] = a[6] - b[6];
	    out[7] = a[7] - b[7];
	    out[8] = a[8] - b[8];
	    out[9] = a[9] - b[9];
	    out[10] = a[10] - b[10];
	    out[11] = a[11] - b[11];
	    out[12] = a[12] - b[12];
	    out[13] = a[13] - b[13];
	    out[14] = a[14] - b[14];
	    out[15] = a[15] - b[15];
	    return out;
	}
	const sub$6 = subtract$6;
	function multiplyScalar$3(out, a, scale) {
	    out[0] = a[0] * scale;
	    out[1] = a[1] * scale;
	    out[2] = a[2] * scale;
	    out[3] = a[3] * scale;
	    out[4] = a[4] * scale;
	    out[5] = a[5] * scale;
	    out[6] = a[6] * scale;
	    out[7] = a[7] * scale;
	    out[8] = a[8] * scale;
	    out[9] = a[9] * scale;
	    out[10] = a[10] * scale;
	    out[11] = a[11] * scale;
	    out[12] = a[12] * scale;
	    out[13] = a[13] * scale;
	    out[14] = a[14] * scale;
	    out[15] = a[15] * scale;
	    return out;
	}
	function multiplyScalarAndAdd$3(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    out[4] = a[4] + (b[4] * scale);
	    out[5] = a[5] + (b[5] * scale);
	    out[6] = a[6] + (b[6] * scale);
	    out[7] = a[7] + (b[7] * scale);
	    out[8] = a[8] + (b[8] * scale);
	    out[9] = a[9] + (b[9] * scale);
	    out[10] = a[10] + (b[10] * scale);
	    out[11] = a[11] + (b[11] * scale);
	    out[12] = a[12] + (b[12] * scale);
	    out[13] = a[13] + (b[13] * scale);
	    out[14] = a[14] + (b[14] * scale);
	    out[15] = a[15] + (b[15] * scale);
	    return out;
	}
	function exactEquals$7(a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] &&
	        a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] &&
	        a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] &&
	        a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
	}
	function equals$7(a, b) {
	    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11], a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
	    const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
	    return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	        Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
	        Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
	        Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
	        Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
	        Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
	        Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
	        Math.abs(a9 - b9) <= EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
	        Math.abs(a10 - b10) <= EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
	        Math.abs(a11 - b11) <= EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
	        Math.abs(a12 - b12) <= EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
	        Math.abs(a13 - b13) <= EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
	        Math.abs(a14 - b14) <= EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
	        Math.abs(a15 - b15) <= EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15)));
	}

	var mat4 = /*#__PURE__*/Object.freeze({
		ELEMENT_COUNT: ELEMENT_COUNT$7,
		create: create$7,
		clone: clone$7,
		copy: copy$7,
		identity: identity$4,
		fromValues: fromValues$7,
		set: set$7,
		transpose: transpose$2,
		invert: invert$4,
		adjoint: adjoint$2,
		determinant: determinant$3,
		multiply: multiply$7,
		mul: mul$7,
		rotate: rotate$3,
		rotateX: rotateX$2,
		rotateY: rotateY$2,
		rotateZ: rotateZ$2,
		scale: scale$7,
		translate: translate$2,
		fromRotation: fromRotation$3,
		fromScaling: fromScaling$3,
		fromTranslation: fromTranslation$2,
		fromXRotation: fromXRotation,
		fromYRotation: fromYRotation,
		fromZRotation: fromZRotation,
		fromRotationTranslation: fromRotationTranslation,
		fromRotationTranslationScale: fromRotationTranslationScale,
		fromRotationTranslationScaleOrigin: fromRotationTranslationScaleOrigin,
		fromQuat: fromQuat$1,
		getTranslation: getTranslation,
		getScaling: getScaling,
		getRotation: getRotation,
		frustum: frustum,
		perspective: perspective,
		perspectiveFromFieldOfView: perspectiveFromFieldOfView,
		ortho: ortho,
		lookAt: lookAt,
		str: str$7,
		frob: frob$3,
		add: add$7,
		subtract: subtract$6,
		sub: sub$6,
		multiplyScalar: multiplyScalar$3,
		multiplyScalarAndAdd: multiplyScalarAndAdd$3,
		exactEquals: exactEquals$7,
		equals: equals$7
	});

	/**
	 * math/projection - simple projection utils
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	function makeViewport() {
	    return {
	        originX: 0,
	        originY: 0,
	        width: 0,
	        height: 0,
	        nearZ: 0,
	        farZ: 1
	    };
	}
	// tslint:disable:whitespace
	function viewportMatrix(x, y, w, h, n, f) {
	    return [
	        w / 2, 0, 0, 0,
	        0, h / 2, 0, 0,
	        0, 0, (f - n) / 2, 0,
	        w / 2 + x, h / 2 + y, (f + n) / 2, 1
	    ];
	}
	class Camera {
	    constructor(viewportWidth, viewportHeight) {
	        this.viewport_ = makeViewport();
	        this.viewport_.width = viewportWidth;
	        this.viewport_.height = viewportHeight;
	        this.viewport_.originX = 0;
	        this.viewport_.originY = 0;
	        this.proj_ = create$7();
	        this.view_ = create$7();
	        this.viewProj_ = create$7();
	    }
	    resizeViewport(newWidth, newHeight) {
	        this.viewport_.width = newWidth;
	        this.viewport_.height = newHeight;
	    }
	    updateViewProjMatrix() {
	        multiply$7(this.viewProj_, this.proj_, this.view_);
	    }
	    perspective(fovDegrees, nearZ, farZ, aspect) {
	        if (aspect === undefined) {
	            aspect = this.viewport_.width / this.viewport_.height;
	        }
	        const fov = deg2rad(fovDegrees);
	        this.viewport_.nearZ = nearZ;
	        this.viewport_.farZ = farZ;
	        perspective(this.proj_, fov, aspect, nearZ, farZ);
	        this.updateViewProjMatrix();
	    }
	    ortho2D(left, top, right, bottom) {
	        ortho(this.proj_, left, right, bottom, top, 1, 2);
	        this.updateViewProjMatrix();
	    }
	    setViewMatrix(v) {
	        copy$7(this.view_, v);
	        this.updateViewProjMatrix();
	    }
	    lookAt(eye, target, up) {
	        lookAt(this.view_, eye, target, up);
	        this.updateViewProjMatrix();
	    }
	    get projectionMatrix() { return this.proj_; }
	    get viewMatrix() { return this.view_; }
	    get viewProjMatrix() { return this.viewProj_; }
	    get viewport() { return this.viewport_; }
	}

	/**
	 * math/primitives - intersection tests of primitives
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 *
	 * Portions based on text and sources from Real-Time Collision Detection by Christer Ericson
	 */
	// a, b, c must be in CCW order
	function makePlaneFromPoints(a, b, c) {
	    const normal = normalize$1([], cross$1([], sub$1([], b, a), sub$1([], c, a)));
	    return {
	        normal,
	        d: dot$1(normal, a)
	    };
	}
	function makePlaneFromPointAndNormal(p, normal) {
	    const orthoNormal = arbitraryOrthogonalVec(normal);
	    const b = add$1([], p, orthoNormal);
	    const c = add$1([], p, cross$1([], normal, orthoNormal));
	    return makePlaneFromPoints(p, b, c);
	}
	function pointDistanceToPlane(point, plane) {
	    return dot$1(plane.normal, point) + plane.d;
	}
	function planesOfTransformedBox(center, size, _transMat4) {
	    // FIXME: investigate what the transMat4 was meant for again
	    const planes = [];
	    const extents = scale$1([], size, 0.5);
	    const cx = center[0], cy = center[1], cz = center[2];
	    const ex = extents[0], ey = extents[1], ez = extents[2];
	    const corners = [
	        fromValues$1(cx - ex, cy - ey, cz - ez),
	        fromValues$1(cx - ex, cy - ey, cz + ez),
	        fromValues$1(cx + ex, cy - ey, cz - ez),
	        fromValues$1(cx + ex, cy - ey, cz + ez),
	        fromValues$1(cx - ex, cy + ey, cz - ez),
	        fromValues$1(cx - ex, cy + ey, cz + ez),
	        fromValues$1(cx + ex, cy + ey, cz - ez),
	        fromValues$1(cx + ex, cy + ey, cz + ez)
	    ];
	    planes.push(makePlaneFromPoints(corners[2], corners[1], corners[0]));
	    return planes;
	}
	function intersectMovingSpherePlane(sphere, direction, plane) {
	    const result = { intersected: false };
	    const dist = dot$1(plane.normal, sphere.center) - plane.d;
	    if (Math.abs(dist) < sphere.radius) {
	        result.intersected = true;
	        result.t = 0;
	        result.point = clone$1(sphere.center);
	    }
	    else {
	        const denom = dot$1(plane.normal, direction);
	        if (denom * dist < 0) {
	            const radius = dist > 0 ? sphere.radius : -sphere.radius;
	            result.intersected = true;
	            result.t = (radius - dist) / denom;
	            result.point = scaleAndAdd$1([], sphere.center, direction, result.t);
	            scaleAndAdd$1(result.point, result.point, plane.normal, -radius);
	        }
	    }
	    return result;
	}
	// imported from now-dead tiled-light branch
	// used to determine what area of screenspace a (point) light would affect
	function screenSpaceBoundsForWorldCube(outBounds, position, halfDim, cameraDir, viewMatrix, projectionViewMatrix, viewportMatrix) {
	    const lx = position[0];
	    const ly = position[1];
	    const lz = position[2];
	    const camUp = normalize$1([], [viewMatrix[4], viewMatrix[5], viewMatrix[6]]);
	    const camLeft = cross$1([], camUp, cameraDir);
	    normalize$1(camLeft, camLeft);
	    const leftLight = transformMat4$2([], [
	        lx + halfDim * camLeft[0],
	        ly + halfDim * camLeft[1],
	        lz + halfDim * camLeft[2],
	        1.0
	    ], projectionViewMatrix);
	    const upLight = transformMat4$2([], [
	        lx + halfDim * camUp[0],
	        ly + halfDim * camUp[1],
	        lz + halfDim * camUp[2],
	        1.0
	    ], projectionViewMatrix);
	    const centerLight = transformMat4$2([], [lx, ly, lz, 1.0], projectionViewMatrix);
	    // perspective divide
	    scale$2(leftLight, leftLight, 1.0 / leftLight[3]);
	    scale$2(upLight, upLight, 1.0 / upLight[3]);
	    scale$2(centerLight, centerLight, 1.0 / centerLight[3]);
	    // project on 2d viewport
	    transformMat4$2(leftLight, leftLight, viewportMatrix);
	    transformMat4$2(upLight, upLight, viewportMatrix);
	    transformMat4$2(centerLight, centerLight, viewportMatrix);
	    const dw = subtract$2([], leftLight, centerLight);
	    const lenw = length$2(dw);
	    const dh = subtract$2([], upLight, centerLight);
	    const lenh = length$2(dh);
	    const leftx = centerLight[0] - lenw;
	    const bottomy = centerLight[1] - lenh;
	    const rightx = centerLight[0] + lenw;
	    const topy = centerLight[1] + lenh;
	    outBounds.left = leftx;
	    outBounds.right = rightx;
	    outBounds.bottom = bottomy;
	    outBounds.top = topy;
	}

	/**
	 * core/debug - debugging helpers
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	/**
	 * Traits of 32-bit floating point numbers.
	 */
	const Float = {
	    min: -340282346638528859811704183484516925440.0,
	    max: 340282346638528859811704183484516925440.0,
	    signed: true,
	    byteSize: 4,
	    arrayType: Float32Array
	};

	/**
	 * math/aabb - Axis-Aligned Bounding Box
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */
	function setCenterAndSize(min, max, center, size) {
	    scaleAndAdd$1(min, center, size, -0.5);
	    scaleAndAdd$1(max, center, size, 0.5);
	}
	function calculateCenterAndSize(center, size, min, max) {
	    subtract$1(size, max, min);
	    scaleAndAdd$1(center, min, size, 0.5);
	}
	function encapsulatePoint(min, max, pt) {
	    if (pt[0] < min[0]) {
	        min[0] = pt[0];
	    }
	    if (pt[0] > max[0]) {
	        max[0] = pt[0];
	    }
	    if (pt[1] < min[1]) {
	        min[1] = pt[1];
	    }
	    if (pt[1] > max[1]) {
	        max[1] = pt[1];
	    }
	    if (pt[2] < min[2]) {
	        min[2] = pt[2];
	    }
	    if (pt[2] > max[2]) {
	        max[2] = pt[2];
	    }
	}
	function encapsulateAABB(min, max, otherMin, otherMax) {
	    if (otherMin[0] < min[0]) {
	        min[0] = otherMin[0];
	    }
	    if (otherMax[0] > max[0]) {
	        max[0] = otherMax[0];
	    }
	    if (otherMin[1] < min[1]) {
	        min[1] = otherMin[1];
	    }
	    if (otherMax[1] > max[1]) {
	        max[1] = otherMax[1];
	    }
	    if (otherMin[2] < min[2]) {
	        min[2] = otherMin[2];
	    }
	    if (otherMax[2] > max[2]) {
	        max[2] = otherMax[2];
	    }
	}
	function containsPoint(min, max, pt) {
	    return pt[0] >= min[0] && pt[1] >= min[1] && pt[2] >= min[2] &&
	        pt[0] <= max[0] && pt[1] <= max[1] && pt[2] <= max[2];
	}
	function containsAABB(min, max, otherMin, otherMax) {
	    return otherMin[0] >= min[0] && otherMin[1] >= min[1] && otherMin[2] >= min[2] &&
	        otherMax[0] <= max[0] && otherMax[1] <= max[1] && otherMax[2] <= max[2];
	}
	function intersectsAABB(min, max, otherMin, otherMax) {
	    return otherMin[0] <= max[0] && otherMax[0] >= min[0] &&
	        otherMin[1] <= max[1] && otherMax[1] >= min[1] &&
	        otherMin[2] <= max[2] && otherMax[2] >= min[2];
	}
	function closestPoint(min, max, pt) {
	    return [
	        clamp(pt[0], min[0], max[0]),
	        clamp(pt[1], min[1], max[1]),
	        clamp(pt[2], min[2], max[2])
	    ];
	}
	function size(min, max) {
	    return subtract$1([0, 0, 0], max, min);
	}
	function extents(min, max) {
	    return scale$1([], size(min, max), 0.5);
	}
	function center(min, max) {
	    return add$1([], min, extents(min, max));
	}
	function transformMat3$2(destMin, destMax, sourceMin, sourceMax, mat) {
	    const destA = transformMat3$1([], sourceMin, mat);
	    const destB = transformMat3$1([], sourceMax, mat);
	    min$1(destMin, destA, destB);
	    max$1(destMax, destA, destB);
	}
	function transformMat4$3(destMin, destMax, sourceMin, sourceMax, mat) {
	    const destA = transformMat4$1([], sourceMin, mat);
	    const destB = transformMat4$1([], sourceMax, mat);
	    min$1(destMin, destA, destB);
	    max$1(destMax, destA, destB);
	}
	class AABB {
	    constructor(min, max) {
	        const data = new Float32Array(6);
	        this.min = data.subarray(0, 3);
	        this.max = data.subarray(3, 6);
	        if (min && max) {
	            this.min[0] = min[0];
	            this.min[1] = min[1];
	            this.min[2] = min[2];
	            this.max[0] = max[0];
	            this.max[1] = max[1];
	            this.max[2] = max[2];
	        }
	        else {
	            this.min[0] = Float.max;
	            this.min[1] = Float.max;
	            this.min[2] = Float.max;
	            this.max[0] = Float.min;
	            this.max[1] = Float.min;
	            this.max[2] = Float.min;
	        }
	    }
	    static fromCenterAndSize(center, size) {
	        const min = [];
	        const max = [];
	        setCenterAndSize(min, max, center, size);
	        return new AABB(min, max);
	    }
	    setCenterAndSize(center, size) {
	        setCenterAndSize(this.min, this.max, center, size);
	    }
	    setMinAndMax(min, max) {
	        this.min[0] = min[0];
	        this.min[1] = min[1];
	        this.min[2] = min[2];
	        this.max[0] = max[0];
	        this.max[1] = max[1];
	        this.max[2] = max[2];
	    }
	    encapsulatePoint(pt) {
	        encapsulatePoint(this.min, this.max, pt);
	    }
	    encapsulateAABB(bounds) {
	        encapsulateAABB(this.min, this.max, bounds.min, bounds.max);
	    }
	    // --
	    get size() { return size(this.min, this.max); }
	    get extents() { return extents(this.min, this.max); }
	    get center() { return center(this.min, this.max); }
	    // --
	    containsPoint(pt) {
	        return containsPoint(this.min, this.max, pt);
	    }
	    containsAABB(bounds) {
	        return containsAABB(this.min, this.max, bounds.min, bounds.max);
	    }
	    intersectsAABB(bounds) {
	        return intersectsAABB(this.min, this.max, bounds.min, bounds.max);
	    }
	    closestPoint(pt) {
	        return closestPoint(this.min, this.max, pt);
	    }
	}

	var aabb = /*#__PURE__*/Object.freeze({
		setCenterAndSize: setCenterAndSize,
		calculateCenterAndSize: calculateCenterAndSize,
		encapsulatePoint: encapsulatePoint,
		encapsulateAABB: encapsulateAABB,
		containsPoint: containsPoint,
		containsAABB: containsAABB,
		intersectsAABB: intersectsAABB,
		closestPoint: closestPoint,
		size: size,
		extents: extents,
		center: center,
		transformMat3: transformMat3$2,
		transformMat4: transformMat4$3,
		AABB: AABB
	});

	/**
	 * sd-math - common mathematical functions and types
	 * Part of Stardazed
	 * (c) 2015-Present by Arthur Langereis - @zenmumbler
	 * https://github.com/stardazed/stardazed
	 */

	exports.vec2 = vec2;
	exports.vec3 = vec3;
	exports.vec4 = vec4;
	exports.quat = quat;
	exports.mat2 = mat2;
	exports.mat2d = mat2d;
	exports.mat3 = mat3;
	exports.mat4 = mat4;
	exports.aabb = aabb;
	exports.EPSILON = EPSILON;
	exports.clamp = clamp;
	exports.clamp01 = clamp01;
	exports.mix = mix;
	exports.intRandom = intRandom;
	exports.intRandomRange = intRandomRange;
	exports.hertz = hertz;
	exports.deg2rad = deg2rad;
	exports.rad2deg = rad2deg;
	exports.isPowerOf2 = isPowerOf2;
	exports.roundUpPowerOf2 = roundUpPowerOf2;
	exports.alignUp = alignUp;
	exports.alignDown = alignDown;
	exports.makeViewport = makeViewport;
	exports.viewportMatrix = viewportMatrix;
	exports.Camera = Camera;
	exports.makePlaneFromPoints = makePlaneFromPoints;
	exports.makePlaneFromPointAndNormal = makePlaneFromPointAndNormal;
	exports.pointDistanceToPlane = pointDistanceToPlane;
	exports.planesOfTransformedBox = planesOfTransformedBox;
	exports.intersectMovingSpherePlane = intersectMovingSpherePlane;
	exports.screenSpaceBoundsForWorldCube = screenSpaceBoundsForWorldCube;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.umd.js.map
