/**
 * render/sampler - engine-side samplers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { RenderResourceBase } from "./resource";
export declare const enum TextureRepeatMode {
    Repeat = 0,
    MirroredRepeat = 1,
    ClampToEdge = 2
}
export declare const enum TextureSizingFilter {
    Nearest = 0,
    Linear = 1
}
export declare const enum TextureMipFilter {
    None = 0,
    Nearest = 1,
    Linear = 2
}
export interface Sampler extends RenderResourceBase {
    repeatS: TextureRepeatMode;
    repeatT: TextureRepeatMode;
    repeatR: TextureRepeatMode;
    minFilter: TextureSizingFilter;
    magFilter: TextureSizingFilter;
    mipFilter: TextureMipFilter;
    lodMinClamp: number;
    lodMaxClamp: number;
    maxAnisotropy: number;
}
export declare function makeSampler(): Sampler;
export declare function makeCubemapSampler(mipmapped: boolean): Sampler;
export declare function makeLookupTableSampler(): Sampler;
