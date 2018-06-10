/**
 * math/common - shared elements
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { NumArray, MutNumArray } from "@stardazed/core";
export declare const EPSILON = 0.000001;
export declare function clamp(n: number, min: number, max: number): number;
export declare function clamp01(n: number): number;
export declare function mix(a: number, b: number, ratio: number): number;
export declare function intRandom(maximum: number): number;
export declare function intRandomRange(minimum: number, maximum: number): number;
export declare function hertz(hz: number): number;
export declare function deg2rad(deg: number): number;
export declare function rad2deg(rad: number): number;
export declare function isPowerOf2(n: number): boolean;
export declare function roundUpPowerOf2(n: number): number;
export declare function alignUp(val: number, alignmentPow2: number): number;
export declare function alignDown(val: number, alignmentPow2: number): number;
export interface VecArrayIterationOptions {
    stride?: number;
    offset?: number;
    count?: number;
}
export declare type VecArrayIterationFunction = (out: MutNumArray, a: NumArray, ...args: any[]) => void;
