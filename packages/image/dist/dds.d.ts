/**
 * image/dds - DDS (DXT 1, 3, 5) image importer
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { PixelFormat } from "./pixelformat";
import { PixelDataProvider, ImageFrame, PixelDimensions } from "./provider";
export declare class DDSDataProvider implements PixelDataProvider {
    private width_;
    private height_;
    private mipMaps_;
    private format_;
    private data_;
    constructor(view: ArrayBufferView);
    readonly pixelFormat: PixelFormat;
    readonly mipMapCount: number;
    readonly dim: PixelDimensions;
    private dataSizeForLevel;
    private dataOffsetForLevel;
    imageFrameAtLevel(level: number): ImageFrame | undefined;
}
