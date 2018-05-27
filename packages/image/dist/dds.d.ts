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
    private dataSizeForLevel(level);
    private dataOffsetForLevel(level);
    imageFrameAtLevel(level: number): ImageFrame | undefined;
}
