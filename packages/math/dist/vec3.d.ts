/**
 * math/vec3 - 3-element vector type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { NumArray as ACN, MutNumArray as AN } from "@stardazed/core";
import { VecArrayIterationFunction, VecArrayIterationOptions } from "./common";
export declare const ELEMENT_COUNT = 3;
export declare function create(): Float32Array;
export declare const zero: typeof create;
export declare function one(): Float32Array;
export declare function clone(a: ACN): Float32Array;
export declare function fromValues(x: number, y: number, z: number): Float32Array;
export declare function copy(out: number[], a: ACN): number[];
export declare function copy<T extends AN>(out: T, a: ACN): T;
export declare function set(out: number[], x: number, y: number, z: number): number[];
export declare function set<T extends AN>(out: T, x: number, y: number, z: number): T;
export declare function add(out: number[], a: ACN, b: ACN): number[];
export declare function add<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare function subtract(out: number[], a: ACN, b: ACN): number[];
export declare function subtract<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare const sub: typeof subtract;
export declare function multiply(out: number[], a: ACN, b: ACN): number[];
export declare function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare const mul: typeof multiply;
export declare function divide(out: number[], a: ACN, b: ACN): number[];
export declare function divide<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare const div: typeof divide;
export declare function ceil(out: number[], a: ACN): number[];
export declare function ceil<T extends AN>(out: T, a: ACN): T;
export declare function floor(out: number[], a: ACN): number[];
export declare function floor<T extends AN>(out: T, a: ACN): T;
export declare function min(out: number[], a: ACN, b: ACN): number[];
export declare function min<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare function max(out: number[], a: ACN, b: ACN): number[];
export declare function max<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare function round(out: number[], a: ACN): number[];
export declare function round<T extends AN>(out: T, a: ACN): T;
export declare function scale(out: number[], a: ACN, s: number): number[];
export declare function scale<T extends AN>(out: T, a: ACN, s: number): T;
export declare function scaleAndAdd(out: number[], a: ACN, b: ACN, scale: number): number[];
export declare function scaleAndAdd<T extends AN>(out: T, a: ACN, b: ACN, scale: number): T;
export declare function distance(a: ACN, b: ACN): number;
export declare const dist: typeof distance;
export declare function squaredDistance(a: ACN, b: ACN): number;
export declare const sqrDist: typeof squaredDistance;
export declare function length(a: ACN): number;
export declare const len: typeof length;
export declare function squaredLength(a: ACN): number;
export declare const sqrLen: typeof squaredLength;
export declare function negate(out: number[], a: ACN): number[];
export declare function negate<T extends AN>(out: T, a: ACN): T;
export declare function inverse(out: number[], a: ACN): number[];
export declare function inverse<T extends AN>(out: T, a: ACN): T;
export declare function normalize(out: number[], a: ACN): number[];
export declare function normalize<T extends AN>(out: T, a: ACN): T;
export declare function dot(a: ACN, b: ACN): number;
export declare function cross(out: number[], a: ACN, b: ACN): number[];
export declare function cross<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare function lerp(out: number[], a: ACN, b: ACN, t: number): number[];
export declare function lerp<T extends AN>(out: T, a: ACN, b: ACN, t: number): T;
export declare function hermite(out: AN, a: ACN, b: ACN, c: ACN, d: ACN, t: number): AN;
export declare function bezier(out: AN, a: ACN, b: ACN, c: ACN, d: ACN, t: number): AN;
export declare function random(out: number[], scale: number): number[];
export declare function random<T extends AN>(out: T, scale: number): T;
export declare function clamp(out: number[], a: ACN, min: number, max: number): number[];
export declare function clamp<T extends AN>(out: AN, a: ACN, min: number, max: number): T;
export declare function clamp(out: number[], a: ACN, min: ACN, max: ACN): number[];
export declare function clamp<T extends AN>(out: AN, a: ACN, min: ACN, max: ACN): T;
export declare function clamp01(out: number[], a: ACN): number[];
export declare function clamp01<T extends AN>(out: T, a: ACN): T;
export declare function mix(out: number[], a: ACN, b: ACN, ratio: number | ACN): number[];
export declare function mix<T extends AN>(out: T, a: ACN, b: ACN, ratio: number | ACN): T;
export declare function sign(out: number[], a: ACN): number[];
export declare function sign<T extends AN>(out: T, a: ACN): T;
export declare function transformMat3(out: number[], a: ACN, m: ACN): number[];
export declare function transformMat3<T extends AN>(out: T, a: ACN, m: ACN): T;
export declare function transformMat4(out: number[], a: ACN, m: ACN): number[];
export declare function transformMat4<T extends AN>(out: T, a: ACN, m: ACN): T;
export declare function transformQuat(out: number[], a: ACN, m: ACN): number[];
export declare function transformQuat<T extends AN>(out: T, a: ACN, m: ACN): T;
export declare function rotateX(out: number[], a: ACN, b: ACN, c: number): number[];
export declare function rotateX<T extends AN>(out: T, a: ACN, b: ACN, c: number): T;
export declare function rotateY(out: number[], a: ACN, b: ACN, c: number): number[];
export declare function rotateY<T extends AN>(out: T, a: ACN, b: ACN, c: number): T;
export declare function rotateZ(out: number[], a: ACN, b: ACN, c: number): number[];
export declare function rotateZ<T extends AN>(out: T, a: ACN, b: ACN, c: number): T;
export declare function reflect(out: number[], a: ACN, normal: ACN): number[];
export declare function reflect<T extends AN>(out: T, a: ACN, normal: ACN): T;
export declare function arbitraryOrthogonalVec(a: ACN): Float32Array;
export declare function forEach(a: number[], opt: VecArrayIterationOptions, fn: VecArrayIterationFunction, ...args: any[]): number[];
export declare function forEach<T extends AN>(a: T, opt: VecArrayIterationOptions, fn: VecArrayIterationFunction, ...args: any[]): T;
export declare function angle(a: ACN, b: ACN): number;
export declare function str(a: ACN): string;
export declare function exactEquals(a: ACN, b: ACN): boolean;
export declare function equals(a: ACN, b: ACN): boolean;
//# sourceMappingURL=vec3.d.ts.map