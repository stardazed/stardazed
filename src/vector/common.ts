/**
 * vector/common - shared types for vector ops
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

namespace sd {

/** @internal */
export const VEC_EPSILON = 0.000001;

// (strided) iteration of vecN types
export interface VecArrayIterationOptions {
	stride?: number;
	offset?: number;
	count?: number;
}

export type VecArrayIterationFunction = (out: MutNumArray, a: NumArray, ...args: any[]) => void;

} // ns sd
