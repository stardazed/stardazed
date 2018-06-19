/**
 * render/command-buffer - typing and buildig command buffers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { TypedArray, Float4 } from "@stardazed/core";
import { PixelCoordinate, PixelDimensions } from "@stardazed/image";
import { PrimitiveGroup, PrimitiveType } from "@stardazed/geometry";
import { RenderResourceBase } from "./resource";
import { Sampler } from "./sampler";
import { Texture, CubeMapFace } from "./texture";
import { FrameBuffer } from "./framebuffer";
import { Mesh } from "./mesh";
import { Pipeline } from "./pipeline";
export declare const enum FrontFaceWinding {
    Clockwise = 0,
    CounterClockwise = 1
}
export declare const enum ClearMask {
    None = 0,
    Colour = 1,
    Depth = 2,
    Stencil = 4,
    ColourDepth = 3,
    DepthStencil = 6,
    All = 7
}
export interface ScissorRect {
    originX: number;
    originY: number;
    width: number;
    height: number;
}
export declare function makeScissorRect(): ScissorRect;
export interface Viewport {
    originX: number;
    originY: number;
    width: number;
    height: number;
    nearZ: number;
    farZ: number;
}
export declare function makeViewport(): Viewport;
export interface TEMPConstant {
    name: string;
    value: TypedArray;
}
export interface RenderJob {
    mesh: Mesh;
    primGroup: PrimitiveGroup;
    pipeline: Pipeline;
    textures: (Texture | undefined)[];
    samplers: (Sampler | undefined)[];
    constants: TEMPConstant[];
}
export declare const enum RenderCommandType {
    None = 0,
    Resource = 1,
    FrameBuffer = 2,
    Scissor = 3,
    Viewport = 4,
    FrontFace = 5,
    TextureWrite = 6,
    RenderJob = 7
}
export interface ResourceCommand {
    type: RenderCommandType.Resource;
    sortKey: number;
    alloc: RenderResourceBase[];
    free: RenderResourceBase[];
}
export interface ClearValues {
    colour: Float4;
    depth: number;
    stencil: number;
}
export interface FrameBufferCommand {
    type: RenderCommandType.FrameBuffer;
    sortKey: number;
    frameBufferHandle: number;
    clearMask: ClearMask;
    clearValues: ClearValues;
}
export interface ScissorCommand {
    type: RenderCommandType.Scissor;
    sortKey: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
}
export interface ViewportCommand {
    type: RenderCommandType.Viewport;
    sortKey: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
    nearZ: number;
    farZ: number;
}
export interface FrontFaceCommand {
    type: RenderCommandType.FrontFace;
    sortKey: number;
    frontFace: FrontFaceWinding;
}
export interface TextureWriteCommand {
    type: RenderCommandType.TextureWrite;
    sortKey: number;
    textureHandle: number;
    layer: CubeMapFace | number;
    x: number;
    y: number;
    width: number;
    height: number;
    pixels: TypedArray;
}
export interface RenderJobCommand {
    type: RenderCommandType.RenderJob;
    sortKey: number;
    meshHandle: number;
    primitiveType: PrimitiveType;
    fromElement: number;
    elementCount: number;
    pipeline: Pipeline;
    textureHandles: number[];
    samplerHandles: number[];
    constants: TEMPConstant[];
}
export declare type RenderCommand = ResourceCommand | FrameBufferCommand | ScissorCommand | ViewportCommand | FrontFaceCommand | TextureWriteCommand | RenderJobCommand;
export declare class RenderCommandBuffer {
    readonly commands: RenderCommand[];
    private resourceCommand;
    private getResourceCommand;
    allocate(resource: RenderResourceBase): void;
    free(resource: RenderResourceBase): void;
    setFrameBuffer(fb: FrameBuffer | null, clearMask: ClearMask, clearValues?: Partial<ClearValues>): void;
    setScissor(rect: ScissorRect | null): void;
    setViewport(viewport: Viewport): void;
    setFrontFace(winding: FrontFaceWinding): void;
    textureWrite(texture: Texture, layer: CubeMapFace | number, offset: PixelCoordinate, dim: PixelDimensions, pixels: TypedArray): void;
    render(job: RenderJob, _normalizedDepth: number): void;
}
