/**
 * math/primitives - intersection tests of primitives
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 *
 * Portions based on text and sources from Real-Time Collision Detection by Christer Ericson
 */
import { Float3, Float4x4 } from "@stardazed/core";
export interface Sphere {
    center: Float3;
    radius: number;
}
export interface Plane {
    normal: Float3;
    d: number;
}
export interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export declare function makePlaneFromPoints(a: Float3, b: Float3, c: Float3): Plane;
export declare function makePlaneFromPointAndNormal(p: Float3, normal: Float3): Plane;
export declare function pointDistanceToPlane(point: Float3, plane: Plane): number;
export interface SpherePlaneIntersection {
    intersected: boolean;
    t?: number;
    point?: Float3;
}
export declare function planesOfTransformedBox(center: Float3, size: Float3, _transMat4: Float4x4): Plane[];
export declare function intersectMovingSpherePlane(sphere: Sphere, direction: Float3, plane: Plane): SpherePlaneIntersection;
export declare function screenSpaceBoundsForWorldCube(outBounds: Rect, position: Float3, halfDim: number, cameraDir: Float3, viewMatrix: Float4x4, projectionViewMatrix: Float4x4, viewportMatrix: Float4x4): void;
