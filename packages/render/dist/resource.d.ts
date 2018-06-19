/**
 * render/resource - resource types in the render engine
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
export declare const enum ResourceType {
    Texture = 1,
    Sampler = 2,
    FrameBuffer = 3,
    Mesh = 4,
    Shader = 5
}
export interface RenderResourceBase {
    readonly renderResourceType: ResourceType;
    renderResourceHandle: number;
}
