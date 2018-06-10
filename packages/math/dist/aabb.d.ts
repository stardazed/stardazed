/**
 * math/aabb - Axis-Aligned Bounding Box
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Float3, Float3x3, Float4x4, MutFloat3 } from "@stardazed/core";
export declare function setCenterAndSize(min: Float3, max: Float3, center: Float3, size: Float3): void;
export declare function calculateCenterAndSize(center: Float3, size: Float3, min: Float3, max: Float3): void;
export declare function encapsulatePoint(min: MutFloat3, max: MutFloat3, pt: Float3): void;
export declare function encapsulateAABB(min: MutFloat3, max: MutFloat3, otherMin: Float3, otherMax: Float3): void;
export declare function containsPoint(min: Float3, max: Float3, pt: Float3): boolean;
export declare function containsAABB(min: Float3, max: Float3, otherMin: Float3, otherMax: Float3): boolean;
export declare function intersectsAABB(min: Float3, max: Float3, otherMin: Float3, otherMax: Float3): boolean;
export declare function closestPoint(min: Float3, max: Float3, pt: Float3): number[];
export declare function size(min: Float3, max: Float3): number[];
export declare function extents(min: Float3, max: Float3): number[];
export declare function center(min: Float3, max: Float3): number[];
export declare function transformMat3(destMin: MutFloat3, destMax: MutFloat3, sourceMin: Float3, sourceMax: Float3, mat: Float3x3): void;
export declare function transformMat4(destMin: MutFloat3, destMax: MutFloat3, sourceMin: Float3, sourceMax: Float3, mat: Float4x4): void;
export declare class AABB {
    min: Float32Array;
    max: Float32Array;
    constructor();
    constructor(min: Float3, max: Float3);
    static fromCenterAndSize(center: Float3, size: Float3): AABB;
    setCenterAndSize(center: Float3, size: Float3): void;
    setMinAndMax(min: Float3, max: Float3): void;
    encapsulatePoint(pt: Float3): void;
    encapsulateAABB(bounds: AABB): void;
    readonly size: number[];
    readonly extents: number[];
    readonly center: number[];
    containsPoint(pt: Float3): boolean;
    containsAABB(bounds: AABB): boolean;
    intersectsAABB(bounds: AABB): boolean;
    closestPoint(pt: Float3): number[];
}
