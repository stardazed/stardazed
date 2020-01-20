/*
core/math - mathematical helper functions
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

/**
 * Clamp a number to the range min..max inclusive.
 */
export function clampf(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

/**
 * Clamp a number to the range 0..1 inclusive.
 */
export function clamp01f(n: number): number {
	return Math.max(0.0, Math.min(1.0, n));
}

/**
 * Linearly interpolate between a and b given a ratio.
 * If ratio < 0 or ratio > 1 then the value will be extrapolated.
 *
 * @example mixf(2, 4, 0) = 2
 * @example mixf(2, 4, 1) = 4
 * @example mixf(10, 20, 0.5) = 15
 * @example mixf(10, 20, -1) = 0
 */
export function mixf(a: number, b: number, ratio: number): number {
	return (b - a) * ratio + a;
}

/**
 * Performs smooth Hermite interpolation between 0 and 1 when edge0 < n < edge1.
 * @expects edge1 > edge0
 */
export function smoothStep(edge0: number, edge1: number, n: number) {
	const t = clamp01f((n - edge0) / (edge1 - edge0));
	return t * t * (3.0 - 2.0 * t);
}

/**
 * Generate a pseudo-random integer value between 0 and upTo exclusive.
 * @param upTo One beyond the maximum number that will be generated
 * @expects upTo >= 0
 */
export function intRandom(upTo: number): number {
	return (Math.random() * upTo) | 0;
}

/**
 * Generate a pseudo-random integer value between from and upTo exclusive.
 * @param from The low end of the range, inclusive
 * @param upTo The high end of the range, exclusive
 * @expects upTo >= from
 */
export function intRandomRange(from: number, upTo: number): number {
	const diff = (upTo - from) | 0;
	return from + intRandom(diff);
}

/**
 * Convert a frequency expressed in hertz to seconds
 */
export function hertz(hz: number) {
	return 1 / hz;
}

/**
 * Convert an angle expressed in degrees to radians
 */
export function deg2rad(deg: number): number {
	return deg * Math.PI / 180.0;
}

/**
 * Convert an angle expressed in radians to degrees
 */
export function rad2deg(rad: number): number {
	return rad * 180.0 / Math.PI;
}

/**
 * Is the provided number an integer?
 */
export function isInteger(n: number) {
	return (n | 0) === n;
}

/**
 * Is the provided number a power of 2?
 */
export function isPowerOf2(n: number) {
	return (n & (n - 1)) === 0;
}

/**
 * Return closest powerOf2 number that is >= n
 * @example 15 -> 16; 16 -> 16; 17 -> 32
 */
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

/**
 * Round val up to closest multiple of alignmentPow2
 * @param val number to align up
 * @param alignmentPow2 power-of-2 alignment border that val will be rounded up towards
 * @expects {audit} isPowerOf2(alignmentPow2)
 */
export function alignUp(val: number, alignmentPow2: number) {
	return (val + alignmentPow2 - 1) & (~(alignmentPow2 - 1));
}

/**
 * Round val down to closest multiple of alignmentPow2
 * @param val number to align up
 * @param alignmentPow2 power-of-2 alignment border that val will be rounded down towards
 * @expects {audit} isPowerOf2(alignmentPow2)
 */
export function alignDown(val: number, alignmentPow2: number) {
	return val & (~(alignmentPow2 - 1));
}

/**
 * Round val up to the power-of-2 adjusted value of minAlign.
 * Use when you have a minimum value to align to which may not be a power of 2.
 * @param val number to align up
 * @param minAlign minimum alignment border that will be rounded up towards the next power of 2 before being used as alignment for val
 */
export function alignUpMinumumAlignment(val: number, minAlign: number) {
	const mask = roundUpPowerOf2(minAlign) - 1;
	return (val + mask) & ~mask;
}
