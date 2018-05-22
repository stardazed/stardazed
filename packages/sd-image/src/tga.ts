/**
 * image/builtin - TGA image parser
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { ImageFrame, PixelDataProvider, makePixelDimensions, PixelDimensions } from "./provider";
import { PixelFormat } from "./pixelformat";

const enum TGAImageType /* uint8 */ {
	None = 0,
	Paletted = 1,
	RGB = 2,
	Grayscale = 3,
	ModeMask = 7,

	RLEBit = 8,
	CompressedBit = 32
}

const enum TGAFileOffsets {
	identLengthUnused = 0, // uint8
	usePalette = 1, // uint8
	imageType = 2, // TGAImageType
	firstPaletteIndex = 3, // uint16
	paletteEntryCount = 5, // uint16
	paletteBits = 7, // uint8
	originX = 8, // uint16
	originY = 10, // uint16
	width = 12, // uint16
	height = 14, // uint16
	bitDepth = 16, // uint8
	flagsUnused = 17, // uint8,
	pixelData = 18,
}

function loadTGAImageFromBufferView(view: ArrayBufferView): Promise<ImageData> {
	return new Promise((resolve, reject) => {
		const headerView = new DataView(view.buffer, view.byteOffset, 18);
		const identLengthUnused = headerView.getUint8(TGAFileOffsets.identLengthUnused);
		const usePalette = headerView.getUint8(TGAFileOffsets.usePalette);
		const imageType: TGAImageType = headerView.getUint8(TGAFileOffsets.imageType);

		// we only support a subset of TGA image types
		if (identLengthUnused !== 0) {
			return reject("Unknown or inconsistent TGA image type");
		}
		if (usePalette !== 0) {
			return reject("Paletted TGA images are not supported.");
		}
		if ((imageType & TGAImageType.CompressedBit) !== 0) {
			return reject("Compressed TGA images are not supported.");
		}

		const width = headerView.getUint16(TGAFileOffsets.width, true);
		const height = headerView.getUint16(TGAFileOffsets.height, true);
		const bitDepth = headerView.getUint8(TGAFileOffsets.bitDepth);
		let bytesPerPixel = 0;

		const imageMode = imageType & TGAImageType.ModeMask;
		if (imageMode === TGAImageType.RGB) {
			if (bitDepth === 24) {
				bytesPerPixel = 3;
			}
			else if (bitDepth === 32) {
				bytesPerPixel = 4;
			}
			else {
				return reject("Only 24 or 32 bit RGB TGA images are supported.");
			}
		}
		else if (imageMode === TGAImageType.Grayscale) {
			bytesPerPixel = 1;
			if (bitDepth !== 8) {
				return reject("Only 8-bit grayscale TGA images are supported.");
			}
		}
		else {
			return reject("Unknown or inconsistent TGA image type");
		}

		const imageData = document.createElement("canvas").getContext("2d")!.createImageData(width, height);
		const sourcePixels = new Uint8ClampedArray(view.buffer, view.byteOffset + TGAFileOffsets.pixelData);
		const destPixels = imageData.data;
		let sourceOffset = 0;
		let destOffset = (height - 1) * width * 4;
		let pixelsLeft = width * height;
		let pixelRunLeft = imageType & TGAImageType.RLEBit ? 0 : pixelsLeft;
		let pixelRunRaw = true;
		let linePixelsLeft = width;

		const writePixel: () => void =
			(bytesPerPixel === 1) ? () => {
				// 8-bit Grayscale pixels
				const gray = sourcePixels[sourceOffset];
				destPixels[destOffset]     = gray;
				destPixels[destOffset + 1] = gray;
				destPixels[destOffset + 2] = gray;
				destPixels[destOffset + 3] = 255;
			}
			: (bytesPerPixel === 3) ? () => {
				// 24-bit BGR pixels
				destPixels[destOffset] = sourcePixels[sourceOffset + 2];
				destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
				destPixels[destOffset + 2] = sourcePixels[sourceOffset];
				destPixels[destOffset + 3] = 255;
			}
			: /* bytesPerPixel === 4 */ () => {
				// 32-bit BGRA pixels
				destPixels[destOffset] = sourcePixels[sourceOffset + 2];
				destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
				destPixels[destOffset + 2] = sourcePixels[sourceOffset];
				destPixels[destOffset + 3] = sourcePixels[sourceOffset + 3];
			};

		while (pixelsLeft > 0) {
			if (pixelRunLeft === 0) {
				const ctrl = sourcePixels[sourceOffset];
				pixelRunRaw = (ctrl & 0x80) === 0;
				pixelRunLeft = 1 + (ctrl & 0x7f);
				sourceOffset += 1;
			}

			writePixel();

			pixelRunLeft -= 1;
			pixelsLeft -= 1;
			if (pixelRunRaw || pixelRunLeft === 0) {
				sourceOffset += bytesPerPixel;
			}
			destOffset += 4;
			linePixelsLeft -= 1;
			if (linePixelsLeft === 0) {
				destOffset -= 2 * width * 4;
				linePixelsLeft = width;
			}
		}

		resolve(imageData);
	});
}


export class TGADataProvider implements PixelDataProvider {
	private data_: ImageData;

	constructor(source: ArrayBufferView) {
		this.data_ = loadTGAImageFromBufferView(source);
	}

	get pixelFormat() { return PixelFormat.RGBA8; }
	get mipMapCount() { return 1; }
	get dim(): PixelDimensions { return makePixelDimensions(this.data_.width, this.data_.height); }

	imageFrameAtLevel(level: number): ImageFrame | undefined {
		if (level !== 0) {
			return undefined;
		}
		return {
			pixelFormat: this.pixelFormat,
			dim: { ...this.dim },
			data: this.data_
		};
	}
}
