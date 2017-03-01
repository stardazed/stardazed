// image/tga - TGA image provider
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.image {

	let nativeTGASupport: boolean | null = null;

	function checkNativeTGASupport(): Promise<boolean> {
		if (nativeTGASupport === null) {
			return new Promise((resolve, _) => {
				const img = new Image();
				img.onload = () => { nativeTGASupport = true; resolve(true); };
				img.onerror = () => { nativeTGASupport = false; resolve(false); };
				img.src = "data:image/tga;base64,AAACAAAAAAAAAAAAAQABABgA////";
			});
		}

		return Promise.resolve(nativeTGASupport);
	}


	const enum TGAImageType /* uint8 */ {
		None = 0,
		Paletted = 1,
		RGB = 2,
		Grayscale = 3,

		RLEBit = 8,
		CompressedBit = 32
	}

	/*
		struct TGAFileHeader {
		0	uint8  identLengthUnused;
		1	uint8  usePalette;
		2	TGAImageType imageType;
		3	uint16 firstPaletteIndex;
		5	uint16 paletteEntryCount;
		7	uint8  paletteBits;
		8	uint16 originX;
		10	uint16 originY;
		12	uint16 width;
		14	uint16 height;
		16	uint8  bitDepth;
		17	uint8  flagsUnused;
		} __attribute__((__packed__));
	*/

	export function loadTGAImageFromBufferView(view: ArrayBufferView): ImageData {
		const headerView = new DataView(view.buffer, view.byteOffset, 18);
		const identLengthUnused = headerView.getUint8(0);
		const usePalette = headerView.getUint8(1);
		const imageType: TGAImageType = headerView.getUint8(2);

		// -- we only support a subset of TGA image types, namely those used in game pipelines
		assert(identLengthUnused === 0, "Unsupported TGA format.");
		assert(usePalette === 0, "Paletted TGA images are not supported.");
		assert((imageType & TGAImageType.CompressedBit) === 0, "Compressed TGA images are not supported.");

		const width = headerView.getUint16(12, true);
		const height = headerView.getUint16(14, true);
		const bitDepth = headerView.getUint8(16);
		let bytesPerPixel = 0;

		if ((imageType & 7) == TGAImageType.RGB) {
			if (bitDepth == 24) {
				bytesPerPixel = 3;
			}
			else if (bitDepth == 32) {
				bytesPerPixel = 4;
			}
			else {
				throw new Error("Only 24 or 32 bit RGB TGA images are supported.");
			}
		}
		else if ((imageType & 7) == TGAImageType.Grayscale) {
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

		if (bytesPerPixel == 1) {
			// 8-bit Grayscale pixels
			while (pixelsLeft > 0) {
				if (pixelRunLeft == 0) {
					const ctrl = sourcePixels[sourceOffset];
					pixelRunRaw = (ctrl & 0x80) == 0;
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
				if (pixelRunRaw || pixelRunLeft == 0) {
					sourceOffset += 1;
				}
				destOffset += 4;
				linePixelsLeft -= 1;
				if (linePixelsLeft == 0) {
					destOffset -= 2 * width * 4;
					linePixelsLeft = width;
				}
			}
		}
		else if (bytesPerPixel == 3) {
			// 24-bit BGR pixels
			while (pixelsLeft > 0) {
				if (pixelRunLeft == 0) {
					const ctrl = sourcePixels[sourceOffset];
					pixelRunRaw = (ctrl & 0x80) == 0;
					pixelRunLeft = 1 + (ctrl & 0x7f);
					sourceOffset += 1;
				}

				destPixels[destOffset] = sourcePixels[sourceOffset + 2];
				destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
				destPixels[destOffset + 2] = sourcePixels[sourceOffset];
				destPixels[destOffset + 3] = 255;

				pixelRunLeft -= 1;
				pixelsLeft -= 1;
				if (pixelRunRaw || pixelRunLeft == 0) {
					sourceOffset += 3;
				}
				destOffset += 4;
				linePixelsLeft -= 1;
				if (linePixelsLeft == 0) {
					destOffset -= 2 * width * 4;
					linePixelsLeft = width;
				}
			}
		}
		else if (bytesPerPixel == 4) {
			// 32-bit BGRA pixels
			while (pixelsLeft > 0) {
				if (pixelRunLeft == 0) {
					const ctrl = sourcePixels[sourceOffset];
					pixelRunRaw = (ctrl & 0x80) == 0;
					pixelRunLeft = 1 + (ctrl & 0x7f);
					sourceOffset += 1;
				}

				destPixels[destOffset] = sourcePixels[sourceOffset + 2];
				destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
				destPixels[destOffset + 2] = sourcePixels[sourceOffset];
				destPixels[destOffset + 3] = sourcePixels[sourceOffset + 3];

				pixelRunLeft -= 1;
				pixelsLeft -= 1;
				if (pixelRunRaw || pixelRunLeft == 0) {
					sourceOffset += 4;
				}
				destOffset += 4;
				linePixelsLeft -= 1;
				if (linePixelsLeft == 0) {
					destOffset -= 2 * width * 4;
					linePixelsLeft = width;
				}
			}
		}

		return imageData;
	}


	export class TGADataProvider implements PixelDataProvider {
		constructor(private data_: HTMLImageElement | ImageData) {}

		get format() { return PixelFormat.RGBA8; }
		get colourSpace() { return ColourSpace.Linear; }
		get mipMapCount() { return 1; }
		get dim() { return makePixelDimensions(this.data_.width, this.data_.height); }

		pixelBufferForLevel(level: number): PixelBuffer | null {
			if (level !== 0) {
				return null;
			}
			return {
				format: this.format,
				colourSpace: this.colourSpace,
				dim: { ...this.dim },
				data: this.data_
			};
		}
	}


	export function tgaLoader(source: URL | ArrayBufferView): Promise<PixelDataProvider> {
		if (source instanceof URL) {
			return checkNativeTGASupport().then(supported => {
				if (supported) {
					return loadBuiltInImageFromURL(source).then(image => {
						return image;
					});
				}
				else {
					return loadFile(source.href, { responseType: FileLoadType.ArrayBuffer }).then((buf: ArrayBuffer) => {
						return loadTGAImageFromBufferView(buf);
					});
				}
			});
		}
		else {
			return checkNativeTGASupport().then(supported => {
				if (supported) {
					return loadBuiltInImageFromBuffer(source, mimeType).then(image => {
						return image;
					});
				}
				else {
					return Promise.resolve(loadTGAImageFromBufferView(source));
				}
			});
		}
	}

} // ns sd.image
