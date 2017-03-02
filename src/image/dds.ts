// image/dds - DDS (DXT 1, 3, 5) image provider
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.image {

	const enum DDSPixelFormatOffset {
		dwSize = 0, // uint32
		dwFlags = 4, // uint32
		dwFourCC = 8, // uint32
		dwRGBBitCount = 12, // uint32
		dwRBitMask = 16, // uint32
		dwGBitMask = 20, // uint32
		dwBBitMask = 24, // uint32
		dwABitMask = 28, // uint32
	};

	const enum DDSOffset {
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
	};


	function fourCharCode(fcc: string) {
		return (fcc.charCodeAt(3) << 24) | (fcc.charCodeAt(2) << 16) | (fcc.charCodeAt(1) << 8) | fcc.charCodeAt(0);
	}

	export class DDSDataProvider implements PixelDataProvider {
		private width_: number;
		private height_: number;
		private mipMaps_: number;
		private format_: PixelFormat;
		private data_: ArrayBufferView;

		constructor(view: ArrayBufferView) {
			const headerView = new DataView(view.buffer, view.byteOffset, 128);

			const cookie = headerView.getUint32(DDSOffset.dwCookie, true);
			assert(cookie === fourCharCode("DDS "), "Not a DDS document");

			let dataSize = headerView.getUint32(DDSOffset.dwPitchOrLinearSize, true);
			if (headerView.getUint32(DDSOffset.dwMipMapCount, true) > 1) {
				dataSize *= 2;
			}

			this.data_ = new Uint8ClampedArray(view.buffer, view.byteOffset + 128, dataSize);

			switch (headerView.getUint32(DDSOffset.ddspf + DDSPixelFormatOffset.dwFourCC, true)) {
				case fourCharCode("DXT1"): this.format_ = PixelFormat.RGBA_DXT1; break;
				case fourCharCode("DXT3"): this.format_ = PixelFormat.RGBA_DXT3; break;
				case fourCharCode("DXT5"): this.format_ = PixelFormat.RGBA_DXT5; break;
				default:
					assert(false, "unknown data format of DDS file");
					this.format_ = PixelFormat.None;
					break;
			}

			this.mipMaps_ = headerView.getUint32(DDSOffset.dwMipMapCount, true);
			this.width_ = headerView.getUint32(DDSOffset.dwWidth, true);
			this.height_ = headerView.getUint32(DDSOffset.dwHeight, true);
		}

		get format() { return this.format_; }
		get colourSpace() { return ColourSpace.Linear; }
		get mipMapCount() { return this.mipMaps_; }
		get dim() { return makePixelDimensions(this.width_, this.height_); }

		dataSizeForLevel(level: number) {
			const mipWidth = dimensionAtMipLevel(this.width_, level);
			const mipHeight = dimensionAtMipLevel(this.height_, level);

			return dataSizeBytesForPixelFormatAndDimensions(this.format_, makePixelDimensions(mipWidth, mipHeight));
		}

		pixelBufferForLevel(level: number): PixelBuffer | null {
			if (level < 0 || level >= this.mipMaps_) {
				return null;
			}

			// FIXME: return empty image if imageformat is none
			let offset = 0;
			for (let lv = 0; lv < level; ++lv) {
				offset += this.dataSizeForLevel(lv);
			}

			const mipWidth = dimensionAtMipLevel(this.width_, level);
			const mipHeight = dimensionAtMipLevel(this.height_, level);

			return {
				format: this.format,
				colourSpace: this.colourSpace,
				dim: makePixelDimensions(mipWidth, mipHeight),
				data: new Uint8ClampedArray(this.data_.buffer, this.data_.byteOffset + offset, this.dataSizeForLevel(level))
			};
		}
	}

} // ns sd.image
