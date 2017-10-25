// asset/importer/image-dds - DDS (DXT 1, 3, 5) image importer
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../importer.ts" />

namespace sd.asset.importer {

	export function importDDSImage(data: Blob, _uri: string) {
		return getArrayBuffer(data).then(buffer => {
			return {
				image: {
					kind: "image",
					item: new DDSDataProvider(new Uint8ClampedArray(buffer))
				}
			};
		});
	}

	registerImporter(importDDSImage, "image/dds", "dds");


	const enum DDSPixelFormatOffsets {
		dwSize = 0, // uint32
		dwFlags = 4, // uint32
		dwFourCC = 8, // uint32
		dwRGBBitCount = 12, // uint32
		dwRBitMask = 16, // uint32
		dwGBitMask = 20, // uint32
		dwBBitMask = 24, // uint32
		dwABitMask = 28, // uint32
	}

	const enum DDSOffsets {
		dwCookie = 0, // fourcc
		dwSize = 4, // uint32
		dwFlags = 8, // uint32
		dwHeight = 12, // uint32
		dwWidth = 16, // uint32
		dwPitchOrLinearSize = 20, // uint32
		dwDepth = 24, // uint32
		dwMipMapCount = 28, // uint32
		dwReserved1 = 32, // uint32[11]
		ddspf = 76, // DDS_PIXELFORMAT
		dwCaps = 108, // uint32
		dwCaps2 = 112, // uint32
		dwCaps3 = 116, // uint32
		dwCaps4 = 120, // uint32
		dwReserved2 = 124, // uint32
	}


	function fourCharCode(fcc: string) {
		return (fcc.charCodeAt(3) << 24) | (fcc.charCodeAt(2) << 16) | (fcc.charCodeAt(1) << 8) | fcc.charCodeAt(0);
	}

	export class DDSDataProvider implements image.PixelDataProvider {
		private width_: number;
		private height_: number;
		private mipMaps_: number;
		private format_: image.PixelFormat;
		private data_: ArrayBufferView;

		constructor(view: ArrayBufferView) {
			const headerView = new DataView(view.buffer, view.byteOffset, 128);

			const cookie = headerView.getUint32(DDSOffsets.dwCookie, true);
			assert(cookie === fourCharCode("DDS "), "Not a DDS document");

			this.width_ = headerView.getUint32(DDSOffsets.dwWidth, true);
			this.height_ = headerView.getUint32(DDSOffsets.dwHeight, true);

			switch (headerView.getUint32(DDSOffsets.ddspf + DDSPixelFormatOffsets.dwFourCC, true)) {
				case fourCharCode("DXT1"): this.format_ = image.PixelFormat.RGBA_DXT1; break;
				case fourCharCode("DXT3"): this.format_ = image.PixelFormat.RGBA_DXT3; break;
				case fourCharCode("DXT5"): this.format_ = image.PixelFormat.RGBA_DXT5; break;
				default:
					assert(false, "Unsupported pixel format of DDS file");
					this.format_ = image.PixelFormat.None;
					break;
			}

			this.mipMaps_ = headerView.getUint32(DDSOffsets.dwMipMapCount, true);
			const dataSize = this.dataOffsetForLevel(this.mipMaps_);

			this.data_ = new Uint8ClampedArray(view.buffer, view.byteOffset + 128, dataSize);
		}

		get pixelFormat() { return this.format_; }
		get colourSpace() { return image.ColourSpace.Linear; }
		set colourSpace(_ignored: image.ColourSpace) { /* ignored */ }
		get mipMapCount() { return this.mipMaps_; }
		get dim() { return image.makePixelDimensions(this.width_, this.height_); }

		private dataSizeForLevel(level: number) {
			const mipWidth = image.dimensionAtMipLevel(this.width_, level);
			const mipHeight = image.dimensionAtMipLevel(this.height_, level);

			return image.dataSizeBytesForPixelFormatAndDimensions(this.format_, image.makePixelDimensions(mipWidth, mipHeight));
		}

		private dataOffsetForLevel(level: number) {
			let mipOffset = 0;
			for (let lv = 0; lv < level; ++lv) {
				mipOffset += this.dataSizeForLevel(lv);
			}
			return mipOffset;
		}

		pixelBufferForLevel(level: number): image.PixelBuffer | undefined {
			if (level < 0 || level >= this.mipMaps_ || this.format_ === image.PixelFormat.None) {
				return undefined;
			}

			let mipOffset = 0;
			for (let lv = 0; lv < level; ++lv) {
				mipOffset += this.dataSizeForLevel(lv);
			}

			const mipWidth = image.dimensionAtMipLevel(this.width_, level);
			const mipHeight = image.dimensionAtMipLevel(this.height_, level);

			return {
				pixelFormat: this.pixelFormat,
				colourSpace: this.colourSpace,
				dim: image.makePixelDimensions(mipWidth, mipHeight),
				data: new Uint8ClampedArray(this.data_.buffer, this.data_.byteOffset + mipOffset, this.dataSizeForLevel(level))
			};
		}
	}

} // ns sd.asset.importer
