/**
 * render/texture - engine-side textures
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { PixelDimensions, PixelFormat, PixelDataProvider } from "@stardazed/image";
import { RenderResourceBase } from "./resource";
export declare const enum TextureClass {
    Plain = 0,
    CubeMap = 1
}
export declare const enum MipMapMode {
    Source = 0,
    Strip = 1,
    Regenerate = 2
}
export declare const enum CubeMapFace {
    PosX = 0,
    NegX = 1,
    PosY = 2,
    NegY = 3,
    PosZ = 4,
    NegZ = 5
}
export interface MipMapRange {
    baseLevel: number;
    numLevels: number;
}
export declare function makeMipMapRange(baseLevel: number, numLevels: number): MipMapRange;
export interface Texture extends RenderResourceBase {
    textureClass: TextureClass;
    pixelFormat: PixelFormat;
    dim: PixelDimensions;
    mipmapMode: MipMapMode;
    maxMipLevel?: number;
    layers?: number;
    pixelData?: PixelDataProvider[];
}
export declare function maxMipLevelsForDimension(dim: number): number;
export declare function makeTexture(): Texture;
export declare function makeTex2D(pixelFormat: PixelFormat, width: number, height: number, mipmapMode?: MipMapMode): Texture;
export declare function makeTex2DFromProvider(provider: PixelDataProvider, mipmapMode?: MipMapMode): Texture;
export declare function makeTexCube(pixelFormat: PixelFormat, dimension: number, mipmapMode?: MipMapMode): Texture;
export declare function makeTexCubeFromProviders(sources: PixelDataProvider[], mipmapMode?: MipMapMode): Texture;
