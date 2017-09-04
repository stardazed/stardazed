// asset/parser/image-tga - TGA image parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./image.ts" />

namespace sd.asset.parser {

	export function parseTGAImage(blob: Blob, _path: string, _options: ImageAssetOptions) {
		return io.BlobReader.readAsArrayBuffer(blob)
			.then(buf => {
				return new TGADataProvider(new Uint8ClampedArray(buf));
			});
	}

	registerFileExtension("tga", "image/tga");
	registerImageParser(parseTGAImage, "image/tga");

	const enum TGAImageType /* uint8 */ {
		None = 0,
		Paletted = 1,
		RGB = 2,
		Grayscale = 3,

		RLEBit = 8,
		CompressedBit = 32
	}

	const enum TGAFileHeader {
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
		flagsUnused = 17, // uint8
	}

	function loadTGAImageFromBufferView(view: ArrayBufferView): ImageData {
		const headerView = new DataView(view.buffer, view.byteOffset, 18);
		const identLengthUnused = headerView.getUint8(TGAFileHeader.identLengthUnused);
		const usePalette = headerView.getUint8(TGAFileHeader.usePalette);
		const imageType: TGAImageType = headerView.getUint8(TGAFileHeader.imageType);

		// -- we only support a subset of TGA image types, namely those used in game pipelines
		assert(identLengthUnused === 0, "Unsupported TGA format.");
		assert(usePalette === 0, "Paletted TGA images are not supported.");
		assert((imageType & TGAImageType.CompressedBit) === 0, "Compressed TGA images are not supported.");

		const width = headerView.getUint16(TGAFileHeader.width, true);
		const height = headerView.getUint16(TGAFileHeader.height, true);
		const bitDepth = headerView.getUint8(TGAFileHeader.bitDepth);
		let bytesPerPixel = 0;

		if ((imageType & 7) === TGAImageType.RGB) {
			if (bitDepth === 24) {
				bytesPerPixel = 3;
			}
			else if (bitDepth === 32) {
				bytesPerPixel = 4;
			}
			else {
				throw new Error("Only 24 or 32 bit RGB TGA images are supported.");
			}
		}
		else if ((imageType & 7) === TGAImageType.Grayscale) {
			bytesPerPixel = 1;
			assert(bitDepth === 8, "Only 8-bit grayscale TGA images are supported.");
		}
		else {
			throw new Error("Unknown or inconsistent TGA image type");
		}

		const imageData = document.createElement("canvas").getContext("2d")!.createImageData(width, height);
		const sourcePixels = new Uint8ClampedArray(view.buffer, view.byteOffset + 18);
		const destPixels = imageData.data;
		let sourceOffset = 0;
		let destOffset = (height - 1) * width * 4;
		let pixelsLeft = width * height;
		let pixelRunLeft = imageType & TGAImageType.RLEBit ? 0 : pixelsLeft;
		let pixelRunRaw = true;
		let linePixelsLeft = width;

		if (bytesPerPixel === 1) {
			// 8-bit Grayscale pixels
			while (pixelsLeft > 0) {
				if (pixelRunLeft === 0) {
					const ctrl = sourcePixels[sourceOffset];
					pixelRunRaw = (ctrl & 0x80) === 0;
					pixelRunLeft = 1 + (ctrl & 0x7f);
					sourceOffset += 1;
				}

				const gray = sourcePixels[sourceOffset];
				destPixels[destOffset]     = gray;
				destPixels[destOffset + 1] = gray;
				destPixels[destOffset + 2] = gray;
				destPixels[destOffset + 3] = 255;

				pixelRunLeft -= 1;
				pixelsLeft -= 1;
				if (pixelRunRaw || pixelRunLeft === 0) {
					sourceOffset += 1;
				}
				destOffset += 4;
				linePixelsLeft -= 1;
				if (linePixelsLeft === 0) {
					destOffset -= 2 * width * 4;
					linePixelsLeft = width;
				}
			}
		}
		else if (bytesPerPixel === 3) {
			// 24-bit BGR pixels
			while (pixelsLeft > 0) {
				if (pixelRunLeft === 0) {
					const ctrl = sourcePixels[sourceOffset];
					pixelRunRaw = (ctrl & 0x80) === 0;
					pixelRunLeft = 1 + (ctrl & 0x7f);
					sourceOffset += 1;
				}

				destPixels[destOffset] = sourcePixels[sourceOffset + 2];
				destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
				destPixels[destOffset + 2] = sourcePixels[sourceOffset];
				destPixels[destOffset + 3] = 255;

				pixelRunLeft -= 1;
				pixelsLeft -= 1;
				if (pixelRunRaw || pixelRunLeft === 0) {
					sourceOffset += 3;
				}
				destOffset += 4;
				linePixelsLeft -= 1;
				if (linePixelsLeft === 0) {
					destOffset -= 2 * width * 4;
					linePixelsLeft = width;
				}
			}
		}
		else if (bytesPerPixel === 4) {
			// 32-bit BGRA pixels
			while (pixelsLeft > 0) {
				if (pixelRunLeft === 0) {
					const ctrl = sourcePixels[sourceOffset];
					pixelRunRaw = (ctrl & 0x80) === 0;
					pixelRunLeft = 1 + (ctrl & 0x7f);
					sourceOffset += 1;
				}

				destPixels[destOffset] = sourcePixels[sourceOffset + 2];
				destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
				destPixels[destOffset + 2] = sourcePixels[sourceOffset];
				destPixels[destOffset + 3] = sourcePixels[sourceOffset + 3];

				pixelRunLeft -= 1;
				pixelsLeft -= 1;
				if (pixelRunRaw || pixelRunLeft === 0) {
					sourceOffset += 4;
				}
				destOffset += 4;
				linePixelsLeft -= 1;
				if (linePixelsLeft === 0) {
					destOffset -= 2 * width * 4;
					linePixelsLeft = width;
				}
			}
		}

		return imageData;
	}


	export class TGADataProvider implements image.PixelDataProvider {
		private data_: ImageData;

		constructor(source: ArrayBufferView) {
			this.data_ = loadTGAImageFromBufferView(source);
		}

		get pixelFormat() { return image.PixelFormat.RGBA8; }
		get colourSpace() { return image.ColourSpace.Linear; }
		get mipMapCount() { return 1; }
		get dim() { return image.makePixelDimensions(this.data_.width, this.data_.height); }

		pixelBufferForLevel(level: number): image.PixelBuffer | undefined {
			if (level !== 0) {
				return undefined;
			}
			return {
				pixelFormat: this.pixelFormat,
				colourSpace: this.colourSpace,
				dim: { ...this.dim },
				data: this.data_
			};
		}
	}

} // ns sd.asset.parser
