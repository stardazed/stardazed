/**
 * @stardazed/math - mathematical helper functions
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

export function clamp01(n: number): number {
	return Math.max(0.0, Math.min(1.0, n));
}

export function mix(a: number, b: number, ratio: number): number {
	return a * (1 - ratio) + b * ratio;
}

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
