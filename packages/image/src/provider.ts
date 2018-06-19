/**
 * image/provider - providers and buffers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { TypedArray } from "@stardazed/core";
import { isPowerOf2 } from "@stardazed/math";
import { PixelFormat, pixelFormatBytesForDimension } from "@stardazed/pixel-format";

export interface PixelCoordinate {
	x: number;
	y: number;
}

export function makePixelCoordinate(x: number, y: number): PixelCoordinate {
	return { x, y };
}

export interface PixelDimensions {
	width: number;
	height: number;
	depth: number;
}

export function makePixelDimensions(width: number, height = 1, depth = 1): PixelDimensions {
	return { width, height, depth };
}

export function dimensionAtMipLevel(dim: number, level: number) {
	return Math.max(1, (dim | 0) >> (level | 0));
}

export function isNonPowerOfTwo(dim: PixelDimensions) {
	return !(isPowerOf2(dim.width) && isPowerOf2(dim.height));
}


export type ImageFrameSource = ImageData | ImageBitmap | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
export type ImageFrameData = ImageFrameSource | TypedArray | DataView;

export interface ImageFrame {
	readonly pixelFormat: PixelFormat;
	readonly dim: Readonly<PixelDimensions>;
	readonly data: ImageFrameData;
}

export function imageFrameSizeBytes(frame: ImageFrame) {
	return pixelFormatBytesForDimension(frame.pixelFormat, frame.dim.width, frame.dim.height) * frame.dim.depth;
}


export interface PixelDataProvider {
	readonly dim: Readonly<PixelDimensions>;
	readonly mipMapCount: number;
	readonly pixelFormat: PixelFormat;

	imageFrameAtLevel(level: number): ImageFrame | undefined;
}

export interface PixelDataProviderClass {
	new (...args: any[]): PixelDataProvider;
}

export function providerForSingleFrame(frame: ImageFrame): PixelDataProvider {
	return {
		pixelFormat: frame.pixelFormat,
		dim: frame.dim,
		mipMapCount: 1,
		imageFrameAtLevel: (level) => level === 0 ? frame : undefined
	};
}
