// image/pixelformat - pixel formats and traits
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.image {

	export interface PixelCoordinate {
		x: number;
		y: number;
	}

	export function makePixelCoordinate(x: number, y: number): PixelCoordinate {
		return { x: x, y: y };
	}

	export interface PixelDimensions {
		width: number;
		height: number;
		depth: number;
	}

	export function makePixelDimensions(width: number, height = 1, depth = 1): PixelDimensions {
		return { width, height, depth };
	}


	export function dataSizeBytesForPixelFormatAndDimensions(format: PixelFormat, dim: PixelDimensions) {
		const elementSize = pixelFormatBytesPerElement(format);
		let columns = dim.width;
		let rows = dim.height;

		if (pixelFormatIsCompressed(format)) {
			// DXT 1, 3, 5
			columns = ((dim.width + 3) / 4);
			rows    = ((dim.height + 3) / 4);
		}

		return dim.depth * rows * columns * elementSize;
	}


	export class PixelBuffer {
		readonly data: TextureImageData;
		readonly format: PixelFormat;
		readonly dim: Readonly<PixelDimensions>;

		constructor(data: TextureImageData, format: PixelFormat, dim: PixelDimensions) {
			this.data = data;
			this.format = format;
			this.dim = { ...dim };
		}

		bytesPerRow() {
			return dataSizeBytesForPixelFormatAndDimensions(this.format, makePixelDimensions(this.dim.width));
		}

		requiredRowAlignment() {
			const rowBytes = this.bytesPerRow();
			return Math.min(8, rowBytes & -rowBytes);
		}

		bytesPerLayer() {
			return dataSizeBytesForPixelFormatAndDimensions(this.format, makePixelDimensions(this.dim.width, this.dim.height));
		}

		sizeBytes() {
			return dataSizeBytesForPixelFormatAndDimensions(this.format, this.dim);
		}
	}

	export interface PixelDataProvider {
		format(): PixelFormat;
		dim(): PixelDimensions;
		mipMapCount(): number;

		pixelBufferForLevel(level: number): PixelBuffer | null;
	}

} // ns sd.image
