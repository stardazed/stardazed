// asset-tga.ts - TGA image loader
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	var nativeTGASupport: boolean = null;

	export function hasNativeTGASupport(): Promise<boolean> {
		if (nativeTGASupport === null) {
			return new Promise((resolve, reject) => {
				var img = new Image();
				img.onload = () => { nativeTGASupport = true; resolve(true); };
				img.onerror = () => { nativeTGASupport = false; resolve(false); };
				img.src = "data:image/tga;base64,AAACAAAAAAAAAAAAAQABABgA////";
			});
		}

		return Promise.resolve(nativeTGASupport);
	}


	const enum TGAImageType /* uint8 */ {
		TGAIT_None = 0,
		TGAIT_Paletted = 1,
		TGAIT_RGB = 2,
		TGAIT_Grayscale = 3,

		TGAIT_RLEBit = 8,
		TGAIT_CompressedBit = 32
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
	
	export function loadTGAImageBuffer(buffer: ArrayBuffer): ImageData {
		var headerView = new DataView(buffer, 0, 18);
		var supported = true;
		var bytesPerPixel = 0;

		var identLengthUnused = headerView.getUint8(0);
		var usePalette = headerView.getUint8(1);
		var imageType: TGAImageType = headerView.getUint8(2);

		// -- we only support a subset of TGA image types, namely those used in game pipelines
		if (identLengthUnused != 0) supported = false;
		if (usePalette != 0) supported = false;
		if ((imageType & TGAImageType.TGAIT_CompressedBit) != 0) supported = false;

		var width = headerView.getUint16(12, true);
		var height = headerView.getUint16(14, true);
		var bitDepth = headerView.getUint8(16);

		if ((imageType & 7) == TGAImageType.TGAIT_RGB) {
			if (bitDepth == 24) {
				bytesPerPixel = 3;
			}
			else if (bitDepth == 32) {
				bytesPerPixel = 4;
			}
			else {
				supported = false;
			}
		}
		else if ((imageType & 7) == TGAImageType.TGAIT_Grayscale) {
			bytesPerPixel = 1;
			if (bitDepth != 8) supported = false;
		}
		else {
			console.warn("TGA: unknown or inconsistent image type");
			supported = false;
		}

		if (! supported) {
			return null;
		}

		var imageData = new ImageData(width, height);
		var sourcePixels = new Uint8ClampedArray(buffer, 18);
		var destPixels = imageData.data;
		var pixelCount = width * height;
		var sourceOffset = 0;
		var destOffset = 0;
		var pixelRunLeft = imageType & TGAImageType.TGAIT_RLEBit ? 0 : pixelCount;
		var pixelRunRaw = true;

		if (bytesPerPixel == 1) {
			// 8-bit Grayscale pixels
			while (pixelCount > 0) {
				if (pixelRunLeft == 0) {
					let ctrl = sourcePixels[sourceOffset];
					pixelRunRaw = (ctrl & 0x80) == 0;
					pixelRunLeft = 1 + (ctrl & 0x7f);
					sourceOffset += 1;
				}

				var gray = sourcePixels[sourceOffset];
				destPixels[destOffset]     = gray;
				destPixels[destOffset + 1] = gray;
				destPixels[destOffset + 2] = gray;
				destPixels[destOffset + 3] = 255;

				pixelRunLeft -= 1;
				pixelCount -= 1;
				if (pixelRunRaw || pixelRunLeft == 0) {
					sourceOffset += 1;
				}
				destOffset += 4;
			}
		}
		else if (bytesPerPixel == 3) {
			// 24-bit BGR pixels
			while (pixelCount > 0) {
				if (pixelRunLeft == 0) {
					let ctrl = sourcePixels[sourceOffset];
					pixelRunRaw = (ctrl & 0x80) == 0;
					pixelRunLeft = 1 + (ctrl & 0x7f);
					sourceOffset += 1;
				}
				
				destPixels[destOffset] = sourcePixels[sourceOffset + 2];
				destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
				destPixels[destOffset + 2] = sourcePixels[sourceOffset];
				destPixels[destOffset + 3] = 255;

				pixelRunLeft -= 1;
				pixelCount -= 1;
				if (pixelRunRaw || pixelRunLeft == 0) {
					sourceOffset += 3;
				}
				destOffset += 4;
			}
		}
		else if (bytesPerPixel == 4) {
			// 32-bit BGRA pixels
			while (pixelCount > 0) {
				if (pixelRunLeft == 0) {
					let ctrl = sourcePixels[sourceOffset];
					pixelRunRaw = (ctrl & 0x80) == 0;
					pixelRunLeft = 1 + (ctrl & 0x7f);
					sourceOffset += 1;
				}
				
				destPixels[destOffset] = sourcePixels[sourceOffset + 2];
				destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
				destPixels[destOffset + 2] = sourcePixels[sourceOffset];
				destPixels[destOffset + 3] = sourcePixels[sourceOffset + 3];

				pixelRunLeft -= 1;
				pixelCount -= 1;
				if (pixelRunRaw || pixelRunLeft == 0) {
					sourceOffset += 4;
				}
				destOffset += 4;
			}
		}

		return imageData;		
	}

} // ns sd.asset
