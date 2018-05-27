/**
 * math/projection - simple projection utils
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { ConstFloat3, ConstFloat4x4, Float4x4 } from "@stardazed/core";
export interface Viewport {
    originX: number;
    originY: number;
    width: number;
    height: number;
    nearZ: number;
    farZ: number;
}
export declare function makeViewport(): Viewport;
export declare function viewportMatrix(x: number, y: number, w: number, h: number, n: number, f: number): Float4x4;
export interface ProjectionSetup {
    projectionMatrix: Float4x4;
    viewMatrix: Float4x4;
    viewProjMatrix: Float4x4;
}
export declare class Camera implements ProjectionSetup {
    private viewport_;
    private proj_;
    private view_;
    private viewProj_;
    constructor(viewportWidth: number, viewportHeight: number);
    resizeViewport(newWidth: number, newHeight: number): void;
    updateViewProjMatrix(): void;
    perspective(fovDegrees: number, nearZ: number, farZ: number, aspect?: number): void;
    ortho2D(left: number, top: number, right: number, bottom: number): void;
    setViewMatrix(v: ConstFloat4x4): void;
    lookAt(eye: ConstFloat3, target: ConstFloat3, up: ConstFloat3): void;
    readonly projectionMatrix: Float4x4;
    readonly viewMatrix: ConstFloat4x4;
    readonly viewProjMatrix: ConstFloat4x4;
    readonly viewport: Readonly<Viewport>;
}
