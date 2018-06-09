/**
 * math/primitives - intersection tests of primitives
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 *
 * Portions based on text and sources from Real-Time Collision Detection by Christer Ericson
 */
import { MutFloat3, MutFloat4x4 } from "@stardazed/core";
export interface Sphere {
    center: MutFloat3;
    radius: number;
}
export interface Plane {
    normal: MutFloat3;
    d: number;
}
export interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export declare function makePlaneFromPoints(a: MutFloat3, b: MutFloat3, c: MutFloat3): Plane;
export declare function makePlaneFromPointAndNormal(p: MutFloat3, normal: MutFloat3): Plane;
export declare function pointDistanceToPlane(point: MutFloat3, plane: Plane): number;
export interface SpherePlaneIntersection {
    intersected: boolean;
    t?: number;
    point?: MutFloat3;
}
export declare function planesOfTransformedBox(center: MutFloat3, size: MutFloat3, _transMat4: MutFloat4x4): Plane[];
export declare function intersectMovingSpherePlane(sphere: Sphere, direction: MutFloat3, plane: Plane): SpherePlaneIntersection;
export declare function screenSpaceBoundsForWorldCube(outBounds: Rect, position: MutFloat3, halfDim: number, cameraDir: MutFloat3, viewMatrix: MutFloat4x4, projectionViewMatrix: MutFloat4x4, viewportMatrix: MutFloat4x4): void;
//# sourceMappingURL=primitives.d.ts.map