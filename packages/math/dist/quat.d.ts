/**
 * math/quat - quaternion type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { ArrayOfConstNumber as ACN, ArrayOfNumber as AN } from "@stardazed/core";
import * as vec4 from "./vec4";
export declare const ELEMENT_COUNT = 4;
export declare function create(): Float32Array;
export declare function rotationTo(out: number[], a: ACN, b: ACN): number[];
export declare function rotationTo<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare function setAxes(out: number[], view: ACN, right: ACN, up: ACN): number[];
export declare function setAxes<T extends AN>(out: T, view: ACN, right: ACN, up: ACN): T;
export declare const clone: typeof vec4.clone;
export declare const fromValues: typeof vec4.fromValues;
export declare const copy: typeof vec4.copy;
export declare const set: typeof vec4.set;
export declare function identity(out: number[]): number[];
export declare function identity<T extends AN>(out: T): T;
export declare function setAxisAngle(out: number[], axis: ACN, rad: number): number[];
export declare function setAxisAngle<T extends AN>(out: T, axis: ACN, rad: number): T;
export declare function getAxisAngle(outAxis: AN, q: ACN): number;
export declare const add: typeof vec4.add;
export declare function multiply(out: number[], a: ACN, b: ACN): number[];
export declare function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare const mul: typeof multiply;
export declare const scale: typeof vec4.scale;
export declare function rotateX(out: number[], a: ACN, rad: number): number[];
export declare function rotateX<T extends AN>(out: T, a: ACN, rad: number): T;
export declare function rotateY(out: number[], a: ACN, rad: number): number[];
export declare function rotateY<T extends AN>(out: T, a: ACN, rad: number): T;
export declare function rotateZ(out: number[], a: ACN, rad: number): number[];
export declare function rotateZ<T extends AN>(out: T, a: ACN, rad: number): T;
export declare function calculateW(out: number[], a: ACN): number[];
export declare function calculateW<T extends AN>(out: T, a: ACN): T;
export declare const dot: typeof vec4.dot;
export declare const lerp: typeof vec4.lerp;
export declare function slerp(out: number[], a: ACN, b: ACN, t: number): number[];
export declare function slerp<T extends AN>(out: T, a: ACN, b: ACN, t: number): T;
export declare function sqlerp(out: number[], a: ACN, b: ACN, c: ACN, d: ACN, t: number): number[];
export declare function sqlerp<T extends AN>(out: AN, a: ACN, b: ACN, c: ACN, d: ACN, t: number): T;
export declare function invert(out: number[], a: ACN): number[];
export declare function invert<T extends AN>(out: T, a: ACN): T;
export declare function conjugate(out: number[], a: ACN): number[];
export declare function conjugate<T extends AN>(out: T, a: ACN): T;
export declare const length: typeof vec4.length;
export declare const len: typeof vec4.length;
export declare const squaredLength: typeof vec4.squaredLength;
export declare const sqrLen: typeof vec4.squaredLength;
export declare const normalize: typeof vec4.normalize;
export declare function fromMat3(out: number[], m: ACN): number[];
export declare function fromMat3<T extends AN>(out: T, m: ACN): T;
export declare function fromEuler(yaw: number, pitch: number, roll: number): Float32Array;
export declare function str(a: ACN): string;
export declare const exactEquals: typeof vec4.exactEquals;
export declare const equals: typeof vec4.equals;
