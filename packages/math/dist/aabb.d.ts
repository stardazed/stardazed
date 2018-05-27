/**
 * math/aabb - Axis-Aligned Bounding Box
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { ConstFloat3, ConstFloat3x3, ConstFloat4x4, Float3 } from "@stardazed/core";
export declare function setCenterAndSize(min: ConstFloat3, max: ConstFloat3, center: ConstFloat3, size: ConstFloat3): void;
export declare function calculateCenterAndSize(center: ConstFloat3, size: ConstFloat3, min: ConstFloat3, max: ConstFloat3): void;
export declare function encapsulatePoint(min: Float3, max: Float3, pt: ConstFloat3): void;
export declare function encapsulateAABB(min: Float3, max: Float3, otherMin: ConstFloat3, otherMax: ConstFloat3): void;
export declare function containsPoint(min: ConstFloat3, max: ConstFloat3, pt: ConstFloat3): boolean;
export declare function containsAABB(min: ConstFloat3, max: ConstFloat3, otherMin: ConstFloat3, otherMax: ConstFloat3): boolean;
export declare function intersectsAABB(min: ConstFloat3, max: ConstFloat3, otherMin: ConstFloat3, otherMax: ConstFloat3): boolean;
export declare function closestPoint(min: ConstFloat3, max: ConstFloat3, pt: ConstFloat3): number[];
export declare function size(min: ConstFloat3, max: ConstFloat3): number[];
export declare function extents(min: ConstFloat3, max: ConstFloat3): number[];
export declare function center(min: ConstFloat3, max: ConstFloat3): number[];
export declare function transformMat3(destMin: Float3, destMax: Float3, sourceMin: ConstFloat3, sourceMax: ConstFloat3, mat: ConstFloat3x3): void;
export declare function transformMat4(destMin: Float3, destMax: ConstFloat3, sourceMin: ConstFloat3, sourceMax: ConstFloat3, mat: ConstFloat4x4): void;
export declare class AABB {
    min: Float32Array;
    max: Float32Array;
    constructor();
    constructor(min: Float3, max: Float3);
    static fromCenterAndSize(center: ConstFloat3, size: ConstFloat3): AABB;
    setCenterAndSize(center: ConstFloat3, size: ConstFloat3): void;
    setMinAndMax(min: ConstFloat3, max: ConstFloat3): void;
    encapsulatePoint(pt: ConstFloat3): void;
    encapsulateAABB(bounds: AABB): void;
    readonly size: number[];
    readonly extents: number[];
    readonly center: number[];
    containsPoint(pt: ConstFloat3): boolean;
    containsAABB(bounds: AABB): boolean;
    intersectsAABB(bounds: AABB): boolean;
    closestPoint(pt: ConstFloat3): number[];
}
