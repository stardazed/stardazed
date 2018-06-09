/**
 * math/mat4 - 4x4 matrix type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { NumArray as ACN, MutNumArray as AN } from "@stardazed/core";
export declare const ELEMENT_COUNT = 16;
export declare function create(): Float32Array;
export declare function clone(a: ACN): Float32Array;
export declare function copy(out: number[], a: ACN): number[];
export declare function copy<T extends AN>(out: T, a: ACN): T;
export declare function identity(out: number[]): number[];
export declare function identity<T extends AN>(out: T): T;
export declare function fromValues(m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): Float32Array;
export declare function set(out: number[], m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): number[];
export declare function set<T extends AN>(out: T, m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): T;
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
export declare function rotate(out: number[], a: ACN, rad: number, axis: ACN): number[];
export declare function rotate<T extends AN>(out: T, a: ACN, rad: number, axis: ACN): T;
export declare function rotateX(out: number[], a: ACN, rad: number): number[];
export declare function rotateX<T extends AN>(out: T, a: ACN, rad: number): T;
export declare function rotateY(out: number[], a: ACN, rad: number): number[];
export declare function rotateY<T extends AN>(out: T, a: ACN, rad: number): T;
export declare function rotateZ(out: number[], a: ACN, rad: number): number[];
export declare function rotateZ<T extends AN>(out: T, a: ACN, rad: number): T;
export declare function scale(out: number[], a: ACN, v3: ACN): number[];
export declare function scale<T extends AN>(out: T, a: ACN, v3: ACN): T;
export declare function translate(out: number[], a: ACN, v3: ACN): number[];
export declare function translate<T extends AN>(out: T, a: ACN, v3: ACN): T;
export declare function fromRotation(out: number[], rad: number, axis: ACN): number[];
export declare function fromRotation<T extends AN>(out: T, rad: number, axis: ACN): T;
export declare function fromScaling(out: number[], v3: ACN): number[];
export declare function fromScaling<T extends AN>(out: T, v3: ACN): T;
export declare function fromTranslation(out: number[], v3: ACN): number[];
export declare function fromTranslation<T extends AN>(out: T, v3: ACN): T;
export declare function fromXRotation(out: number[], rad: number): number[];
export declare function fromXRotation<T extends AN>(out: T, rad: number): T;
export declare function fromYRotation(out: number[], rad: number): number[];
export declare function fromYRotation<T extends AN>(out: T, rad: number): T;
export declare function fromZRotation(out: number[], rad: number): number[];
export declare function fromZRotation<T extends AN>(out: T, rad: number): T;
export declare function fromRotationTranslation(out: number[], q: ACN, v3: ACN): number[];
export declare function fromRotationTranslation<T extends AN>(out: T, q: ACN, v3: ACN): T;
export declare function fromRotationTranslationScale(out: number[], q: ACN, v: ACN, s: ACN): number[];
export declare function fromRotationTranslationScale<T extends AN>(out: T, q: ACN, v: ACN, s: ACN): T;
export declare function fromRotationTranslationScaleOrigin(out: number[], q: ACN, v: ACN, s: ACN, o: ACN): number[];
export declare function fromRotationTranslationScaleOrigin<T extends AN>(out: T, q: ACN, v: ACN, s: ACN, o: ACN): T;
export declare function fromQuat(out: number[], q: ACN): number[];
export declare function fromQuat<T extends AN>(out: T, q: ACN): T;
export declare function getTranslation(out: number[], a: ACN): number[];
export declare function getTranslation<T extends AN>(out: T, a: ACN): T;
export declare function getScaling(out: number[], a: ACN): number[];
export declare function getScaling<T extends AN>(out: T, a: ACN): T;
export declare function getRotation(out: number[], a: ACN): number[];
export declare function getRotation<T extends AN>(out: T, a: ACN): T;
export declare function frustum(out: number[], left: number, right: number, bottom: number, top: number, near: number, far: number): number[];
export declare function frustum<T extends AN>(out: T, left: number, right: number, bottom: number, top: number, near: number, far: number): T;
export declare function perspective(out: number[], fovy: number, aspect: number, near: number, far: number): number[];
export declare function perspective<T extends AN>(out: T, fovy: number, aspect: number, near: number, far: number): T;
export interface FieldOfViewDegrees {
    upDegrees: number;
    downDegrees: number;
    leftDegrees: number;
    rightDegrees: number;
}
export declare function perspectiveFromFieldOfView(out: number[], fov: FieldOfViewDegrees, near: number, far: number): number[];
export declare function perspectiveFromFieldOfView<T extends AN>(out: T, fov: FieldOfViewDegrees, near: number, far: number): T;
export declare function ortho(out: number[], left: number, right: number, bottom: number, top: number, near: number, far: number): number[];
export declare function ortho<T extends AN>(out: T, left: number, right: number, bottom: number, top: number, near: number, far: number): T;
export declare function lookAt(out: number[], eye: ACN, center: ACN, up: ACN): number[];
export declare function lookAt<T extends AN>(out: T, eye: ACN, center: ACN, up: ACN): T;
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
//# sourceMappingURL=mat4.d.ts.map