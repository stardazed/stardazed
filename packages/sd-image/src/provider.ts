/**
 * image/provider - providers and buffers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { TypedArray } from "sd-core";
import { isPowerOf2 } from "sd-math";
import { ColourSpace, PixelFormat, pixelFormatBytesPerElement, pixelFormatIsCompressed } from "./pixelformat";

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


export function dataSizeBytesForPixelFormatAndDimensions(format: PixelFormat, dim: PixelDimensions) {
	const elementSize = pixelFormatBytesPerElement(format);
	let columns = dim.width;
	let rows = dim.height;

	if (pixelFormatIsCompressed(format)) {
		// DXT 1, 3, 5
		columns = ((dim.width + 3) >> 2);
		rows    = ((dim.height + 3) >> 2);
	}

	return dim.depth * rows * columns * elementSize;
}


export type ImageFrameSource = ImageData | ImageBitmap | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
export type ImageFrameData = ImageFrameSource | TypedArray | DataView;

export interface ImageFrame {
	readonly pixelFormat: PixelFormat;
	readonly colourSpace: ColourSpace;
	readonly dim: Readonly<PixelDimensions>;
	readonly data: ImageFrameData;
}

export function imageFrameBytesPerRow(frame: ImageFrame) {
	return dataSizeBytesForPixelFormatAndDimensions(frame.pixelFormat, makePixelDimensions(frame.dim.width));
}

export function imageFrameRequiredRowAlignment(frame: ImageFrame) {
	const rowBytes = imageFrameBytesPerRow(frame);
	return Math.min(8, rowBytes & -rowBytes);
}

export function imageFrameSizeBytes(frame: ImageFrame) {
	return dataSizeBytesForPixelFormatAndDimensions(frame.pixelFormat, frame.dim);
}


export interface PixelDataProvider {
	readonly dim: Readonly<PixelDimensions>;
	readonly mipMapCount: number;
	readonly pixelFormat: PixelFormat;
	colourSpace: ColourSpace;

	imageFrameAtLevel(level: number): ImageFrame | undefined;
}

export interface PixelDataProviderClass {
	new (...args: any[]): PixelDataProvider;
}

export function providerForSingleFrame(frame: ImageFrame): PixelDataProvider {
	return {
		colourSpace: buffer.colourSpace,
		pixelFormat: frame.pixelFormat,
		dim: frame.dim,
		mipMapCount: 1,
		imageFrameAtLevel: (level) => level === 0 ? frame : undefined
	};
}
