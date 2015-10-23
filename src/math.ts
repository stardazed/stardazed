// math - general purpose functions, equations, RNG, etc.
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

function intRandom(maximum: number): number {
	return (Math.random() * (maximum + 1)) << 0;
}


function intRandomRange(minimum: number, maximum: number): number {
	var diff = (maximum - minimum) << 0;
	return minimum + intRandom(diff);
}


function deg2rad(deg: number): number {
	return deg * Math.PI / 180.0;
}


function rad2deg(rad: number): number {
	return rad * 180.0 / Math.PI;
}


function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}


function clamp01(n: number): number {
	return Math.max(0.0, Math.min(1.0, n));
}


interface Math {
	sign(n: number): number;
}
