import { ImageFrame, PixelDataProvider, PixelDimensions } from "./provider";
import { PixelFormat } from "./pixelformat";
export declare class TGADataProvider implements PixelDataProvider {
    private data_;
    constructor(source: ArrayBufferView);
    readonly pixelFormat: PixelFormat;
    readonly mipMapCount: number;
    readonly dim: PixelDimensions;
    imageFrameAtLevel(level: number): ImageFrame | undefined;
}
