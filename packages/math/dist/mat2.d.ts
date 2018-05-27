/**
 * math/mat2 - 2x2 matrix type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { ArrayOfConstNumber as ACN, ArrayOfNumber as AN } from "@stardazed/core";
export declare const ELEMENT_COUNT = 4;
export declare function create(): Float32Array;
export declare function clone(a: ACN): Float32Array;
export declare function copy(out: number[], a: ACN): number[];
export declare function copy<T extends AN>(out: T, a: ACN): T;
export declare function identity(out: number[]): number[];
export declare function identity<T extends AN>(out: T): T;
export declare function fromValues(m00: number, m01: number, m10: number, m11: number): Float32Array;
export declare function set(out: number[], m00: number, m01: number, m10: number, m11: number): number[];
export declare function set<T extends AN>(out: T, m00: number, m01: number, m10: number, m11: number): T;
export declare function transpose(out: number[], a: ACN): number[];
export declare function transpose<T extends AN>(out: T, a: ACN): T;
export declare function invert(out: number[], a: ACN): number[];
export declare function invert<T extends AN>(out: T, a: ACN): T;
export declare function adjoint(out: number[], a: ACN): number[];
export declare function adjoint<T extends AN>(out: T, a: ACN): T;
export declare function determinant(a: ACN): number;
export declare function multiply(out: number[], a: ACN, b: ACN): number[];
export declare function multiply<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare const mul: typeof multiply;
export declare function rotate(out: number[], a: ACN, rad: number): number[];
export declare function rotate<T extends AN>(out: T, a: ACN, rad: number): T;
export declare function scale(out: number[], a: ACN, v2: ACN): number[];
export declare function scale<T extends AN>(out: T, a: ACN, v2: ACN): T;
export declare function fromRotation(out: number[], rad: number): number[];
export declare function fromRotation<T extends AN>(out: T, rad: number): T;
export declare function fromScaling(out: number[], v2: ACN): number[];
export declare function fromScaling<T extends AN>(out: T, v2: ACN): T;
export declare function str(a: ACN): string;
export declare function frob(a: ACN): number;
export declare function LDU(L: AN, D: ACN, U: AN, a: ACN): ACN[];
export declare function add(out: number[], a: ACN, b: ACN): number[];
export declare function add<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare function subtract(out: number[], a: ACN, b: ACN): number[];
export declare function subtract<T extends AN>(out: T, a: ACN, b: ACN): T;
export declare const sub: typeof subtract;
export declare function multiplyScalar(out: number[], a: ACN, scale: number): number[];
export declare function multiplyScalar<T extends AN>(out: T, a: ACN, scale: number): T;
export declare function multiplyScalarAndAdd(out: number[], a: ACN, b: ACN, scale: number): number[];
export declare function multiplyScalarAndAdd<T extends AN>(out: T, a: ACN, b: ACN, scale: number): T;
export declare function exactEquals(a: ACN, b: ACN): boolean;
export declare function equals(a: ACN, b: ACN): boolean;
