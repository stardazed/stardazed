/**
 * image/builtin - browser built-in images
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { PixelFormat } from "./pixelformat";
import { PixelDimensions, PixelDataProvider, ImageFrame } from "./provider";
export declare class HTMLImageDataProvider implements PixelDataProvider {
    private image_;
    readonly dim: PixelDimensions;
    readonly mipMapCount: number;
    constructor(image_: HTMLImageElement);
    readonly pixelFormat: PixelFormat;
    imageFrameAtLevel(level: number): ImageFrame | undefined;
}
