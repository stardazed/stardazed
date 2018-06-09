/**
 * math/mat3 - 3x3 matrix type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { NumArray as ACN, MutNumArray as AN } from "@stardazed/core";
export declare const ELEMENT_COUNT = 9;
export declare function create(): Float32Array;
export declare function clone(a: ACN): Float32Array;
export declare function copy(out: number[], a: ACN): number[];
export declare function copy<T extends AN>(out: T, a: ACN): T;
export declare function identity(out: number[]): number[];
export declare function identity<T extends AN>(out: T): T;
export declare function fromValues(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): Float32Array;
export declare function set(out: number[], m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): number[];
export declare function set<T extends AN>(out: T, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): T;
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
export declare function translate(out: number[], a: ACN, v2: ACN): number[];
export declare function translate<T extends AN>(out: T, a: ACN, v2: ACN): T;
export declare function fromRotation(out: number[], rad: number): number[];
export declare function fromRotation<T extends AN>(out: T, rad: number): T;
export declare function fromScaling(out: number[], v2: ACN): number[];
export declare function fromScaling<T extends AN>(out: T, v2: ACN): T;
export declare function fromTranslation(out: number[], v2: ACN): number[];
export declare function fromTranslation<T extends AN>(out: T, v2: ACN): T;
export declare function fromMat2d(out: number[], m2d: ACN): number[];
export declare function fromMat2d<T extends AN>(out: T, m2d: ACN): T;
export declare function fromMat4(out: number[], m4: ACN): number[];
export declare function fromMat4<T extends AN>(out: T, m4: ACN): T;
export declare function fromQuat(out: number[], q: ACN): number[];
export declare function fromQuat<T extends AN>(out: T, q: ACN): T;
export declare function normalFromMat4(out: number[], m4: ACN): number[];
export declare function normalFromMat4<T extends AN>(out: T, m4: ACN): T;
export declare function str(a: ACN): string;
export declare function frob(a: ACN): number;
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
//# sourceMappingURL=mat3.d.ts.map