/**
 * image/provider - providers and buffers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { TypedArray } from "sd-core";
import { PixelFormat } from "./pixelformat";
export interface PixelCoordinate {
    x: number;
    y: number;
}
export declare function makePixelCoordinate(x: number, y: number): PixelCoordinate;
export interface PixelDimensions {
    width: number;
    height: number;
    depth: number;
}
export declare function makePixelDimensions(width: number, height?: number, depth?: number): PixelDimensions;
export declare function dimensionAtMipLevel(dim: number, level: number): number;
export declare function isNonPowerOfTwo(dim: PixelDimensions): boolean;
export declare function dataSizeBytesForPixelFormatAndDimensions(format: PixelFormat, dim: PixelDimensions): number;
export declare type ImageFrameSource = ImageData | ImageBitmap | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
export declare type ImageFrameData = ImageFrameSource | TypedArray | DataView;
export interface ImageFrame {
    readonly pixelFormat: PixelFormat;
    readonly dim: Readonly<PixelDimensions>;
    readonly data: ImageFrameData;
}
export declare function imageFrameBytesPerRow(frame: ImageFrame): number;
export declare function imageFrameRequiredRowAlignment(frame: ImageFrame): number;
export declare function imageFrameSizeBytes(frame: ImageFrame): number;
export interface PixelDataProvider {
    readonly dim: Readonly<PixelDimensions>;
    readonly mipMapCount: number;
    readonly pixelFormat: PixelFormat;
    imageFrameAtLevel(level: number): ImageFrame | undefined;
}
export interface PixelDataProviderClass {
    new (...args: any[]): PixelDataProvider;
}
export declare function providerForSingleFrame(frame: ImageFrame): PixelDataProvider;
