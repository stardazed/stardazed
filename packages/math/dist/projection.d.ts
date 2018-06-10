/**
 * math/projection - simple projection utils
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Float3, Float4x4, MutFloat4x4 } from "@stardazed/core";
export interface Viewport {
    originX: number;
    originY: number;
    width: number;
    height: number;
    nearZ: number;
    farZ: number;
}
export declare function makeViewport(): Viewport;
export declare function viewportMatrix(x: number, y: number, w: number, h: number, n: number, f: number): MutFloat4x4;
export interface ProjectionSetup {
    projectionMatrix: MutFloat4x4;
    viewMatrix: MutFloat4x4;
    viewProjMatrix: MutFloat4x4;
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
    setViewMatrix(v: Float4x4): void;
    lookAt(eye: Float3, target: Float3, up: Float3): void;
    readonly projectionMatrix: Float4x4;
    readonly viewMatrix: Float4x4;
    readonly viewProjMatrix: Float4x4;
    readonly viewport: Readonly<Viewport>;
}
