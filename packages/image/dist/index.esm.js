/**
 * core/debug - debugging helpers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/**
 * asserts a condition to be true or throw an error otherwise
 * @param cond A condition that can be evaluated to true or false
 * @param msg Error message that will be thrown if cond is false
 */
function assert(cond, msg) {
    if (!cond) {
        console.error(msg || "assertion failed");
        throw new Error(msg || "assertion failed");
    }
}

/**
 * image/pixelformat - pixel formats and traits
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function pixelFormatIsCompressed(format) {
    return format >= 0x100;
}
function pixelFormatIsDepthFormat(format) {
    return format === 18 /* Depth16I */ ||
        format === 19 /* Depth24I */;
}
function pixelFormatIsStencilFormat(format) {
    return format === 20 /* Stencil8 */;
}
function pixelFormatIsDepthStencilFormat(format) {
    return format === 21 /* Depth24_Stencil8 */;
}
function pixelFormatBytesPerElement(format) {
    // Element means a pixel for non-compressed formats
    // and a block for compressed formats
    switch (format) {
        case 1 /* R8 */:
        case 20 /* Stencil8 */:
            return 1;
        case 2 /* RG8 */:
        case 15 /* RGB_5_6_5 */:
        case 16 /* RGBA_4_4_4_4 */:
        case 17 /* RGBA_5_5_5_1 */:
        case 7 /* R16F */:
        case 18 /* Depth16I */:
            return 2;
        case 3 /* RGB8 */:
        case 5 /* SRGB8 */:
            return 3;
        case 4 /* RGBA8 */:
        case 6 /* SRGB8_Alpha8 */:
        case 8 /* RG16F */:
        case 11 /* R32F */:
        case 19 /* Depth24I */:
        case 21 /* Depth24_Stencil8 */:
            return 4;
        case 9 /* RGB16F */:
            return 6;
        case 10 /* RGBA16F */:
        case 12 /* RG32F */:
            return 8;
        case 13 /* RGB32F */:
            return 12;
        case 14 /* RGBA32F */:
            return 16;
        // -- compressed formats
        case 256 /* RGB_DXT1 */:
        case 257 /* RGBA_DXT1 */:
            return 8;
        case 258 /* RGBA_DXT3 */:
        case 259 /* RGBA_DXT5 */:
            return 16;
        default:
            assert(false, "unhandled pixel buffer format");
            return 0;
    }
}

/**
 * math/common - shared elements
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function isPowerOf2(n) {
    return (n & (n - 1)) === 0;
}

/**
 * image/provider - providers and buffers
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function makePixelCoordinate(x, y) {
    return { x, y };
}
function makePixelDimensions(width, height = 1, depth = 1) {
    return { width, height, depth };
}
function dimensionAtMipLevel(dim, level) {
    return Math.max(1, (dim | 0) >> (level | 0));
}
function isNonPowerOfTwo(dim) {
    return !(isPowerOf2(dim.width) && isPowerOf2(dim.height));
}
function dataSizeBytesForPixelFormatAndDimensions(format, dim) {
    const elementSize = pixelFormatBytesPerElement(format);
    let columns = dim.width;
    let rows = dim.height;
    if (pixelFormatIsCompressed(format)) {
        // DXT 1, 3, 5
        columns = ((dim.width + 3) >> 2);
        rows = ((dim.height + 3) >> 2);
    }
    return dim.depth * rows * columns * elementSize;
}
function imageFrameBytesPerRow(frame) {
    return dataSizeBytesForPixelFormatAndDimensions(frame.pixelFormat, makePixelDimensions(frame.dim.width));
}
function imageFrameRequiredRowAlignment(frame) {
    const rowBytes = imageFrameBytesPerRow(frame);
    return Math.min(8, rowBytes & -rowBytes);
}
function imageFrameSizeBytes(frame) {
    return dataSizeBytesForPixelFormatAndDimensions(frame.pixelFormat, frame.dim);
}
function providerForSingleFrame(frame) {
    return {
        pixelFormat: frame.pixelFormat,
        dim: frame.dim,
        mipMapCount: 1,
        imageFrameAtLevel: (level) => level === 0 ? frame : undefined
    };
}

/**
 * image/builtin - browser built-in images
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class HTMLImageDataProvider {
    constructor(image_) {
        this.image_ = image_;
        this.mipMapCount = 1;
        this.dim = makePixelDimensions(image_.width, image_.height);
    }
    get pixelFormat() {
        // return (this.colourSpace === ColourSpace.sRGB) ? PixelFormat.SRGB8_Alpha8 : PixelFormat.RGBA8;
        return 4 /* RGBA8 */;
    }
    imageFrameAtLevel(level) {
        if (level !== 0) {
            return undefined;
        }
        return {
            pixelFormat: this.pixelFormat,
            dim: Object.assign({}, this.dim),
            data: this.image_
        };
    }
}

/**
 * image/dds - DDS (DXT 1, 3, 5) image importer
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function fourCharCode(fcc) {
    return (fcc.charCodeAt(3) << 24) | (fcc.charCodeAt(2) << 16) | (fcc.charCodeAt(1) << 8) | fcc.charCodeAt(0);
}
class DDSDataProvider {
    constructor(view) {
        const headerView = new DataView(view.buffer, view.byteOffset, 128);
        const cookie = headerView.getUint32(0 /* dwCookie */, true);
        assert(cookie === fourCharCode("DDS "), "Not a DDS document");
        this.width_ = headerView.getUint32(16 /* dwWidth */, true);
        this.height_ = headerView.getUint32(12 /* dwHeight */, true);
        switch (headerView.getUint32(76 /* ddspf */ + 8 /* dwFourCC */, true)) {
            case fourCharCode("DXT1"):
                this.format_ = 257 /* RGBA_DXT1 */;
                break;
            case fourCharCode("DXT3"):
                this.format_ = 258 /* RGBA_DXT3 */;
                break;
            case fourCharCode("DXT5"):
                this.format_ = 259 /* RGBA_DXT5 */;
                break;
            default:
                assert(false, "Unsupported pixel format of DDS file");
                this.format_ = 0 /* None */;
                break;
        }
        this.mipMaps_ = headerView.getUint32(28 /* dwMipMapCount */, true);
        const dataSize = this.dataOffsetForLevel(this.mipMaps_);
        this.data_ = new Uint8ClampedArray(view.buffer, view.byteOffset + 128, dataSize);
    }
    get pixelFormat() { return this.format_; }
    get mipMapCount() { return this.mipMaps_; }
    get dim() { return makePixelDimensions(this.width_, this.height_); }
    dataSizeForLevel(level) {
        const mipWidth = dimensionAtMipLevel(this.width_, level);
        const mipHeight = dimensionAtMipLevel(this.height_, level);
        return dataSizeBytesForPixelFormatAndDimensions(this.format_, makePixelDimensions(mipWidth, mipHeight));
    }
    dataOffsetForLevel(level) {
        let mipOffset = 0;
        for (let lv = 0; lv < level; ++lv) {
            mipOffset += this.dataSizeForLevel(lv);
        }
        return mipOffset;
    }
    imageFrameAtLevel(level) {
        if (level < 0 || level >= this.mipMaps_ || this.format_ === 0 /* None */) {
            return undefined;
        }
        let mipOffset = 0;
        for (let lv = 0; lv < level; ++lv) {
            mipOffset += this.dataSizeForLevel(lv);
        }
        const mipWidth = dimensionAtMipLevel(this.width_, level);
        const mipHeight = dimensionAtMipLevel(this.height_, level);
        return {
            pixelFormat: this.pixelFormat,
            dim: makePixelDimensions(mipWidth, mipHeight),
            data: new Uint8ClampedArray(this.data_.buffer, this.data_.byteOffset + mipOffset, this.dataSizeForLevel(level))
        };
    }
}

/**
 * image/builtin - TGA image parser
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function loadTGAFrameFromBufferView(view) {
    return new Promise((resolve, reject) => {
        const headerView = new DataView(view.buffer, view.byteOffset, 18);
        const identLengthUnused = headerView.getUint8(0 /* identLengthUnused */);
        const usePalette = headerView.getUint8(1 /* usePalette */);
        const imageType = headerView.getUint8(2 /* imageType */);
        // we only support a subset of TGA image types
        if (identLengthUnused !== 0) {
            return reject("Unknown or inconsistent TGA image type");
        }
        if (usePalette !== 0) {
            return reject("Paletted TGA images are not supported.");
        }
        if ((imageType & 32 /* CompressedBit */) !== 0) {
            return reject("Compressed TGA images are not supported.");
        }
        const width = headerView.getUint16(12 /* width */, true);
        const height = headerView.getUint16(14 /* height */, true);
        const bitDepth = headerView.getUint8(16 /* bitDepth */);
        let bytesPerPixel = 0;
        const imageMode = imageType & 7 /* ModeMask */;
        if (imageMode === 2 /* RGB */) {
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
        else if (imageMode === 3 /* Grayscale */) {
            bytesPerPixel = 1;
            if (bitDepth !== 8) {
                return reject("Only 8-bit grayscale TGA images are supported.");
            }
        }
        else {
            return reject("Unknown or inconsistent TGA image type");
        }
        const imageData = document.createElement("canvas").getContext("2d").createImageData(width, height);
        const sourcePixels = new Uint8ClampedArray(view.buffer, view.byteOffset + 18 /* pixelData */);
        const destPixels = imageData.data;
        let sourceOffset = 0;
        let destOffset = (height - 1) * width * 4;
        let pixelsLeft = width * height;
        let pixelRunLeft = imageType & 8 /* RLEBit */ ? 0 : pixelsLeft;
        let pixelRunRaw = true;
        let linePixelsLeft = width;
        const writePixel = (bytesPerPixel === 1) ? () => {
            // 8-bit Grayscale pixels
            const gray = sourcePixels[sourceOffset];
            destPixels[destOffset] = gray;
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
        resolve({
            pixelFormat: 4 /* RGBA8 */,
            dim: makePixelDimensions(width, height),
            data: imageData
        });
    });
}
/*
export class TGADataProvider implements PixelDataProvider {
    private data_: ImageData;

    constructor(source: ArrayBufferView) {
        this.data_ = loadTGAFrameFromBufferView(source);
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
*/

/**
 * @stardazed/image - image (meta)data representation
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { pixelFormatIsCompressed, pixelFormatIsDepthFormat, pixelFormatIsStencilFormat, pixelFormatIsDepthStencilFormat, pixelFormatBytesPerElement, makePixelCoordinate, makePixelDimensions, dimensionAtMipLevel, isNonPowerOfTwo, dataSizeBytesForPixelFormatAndDimensions, imageFrameBytesPerRow, imageFrameRequiredRowAlignment, imageFrameSizeBytes, providerForSingleFrame, HTMLImageDataProvider, DDSDataProvider, loadTGAFrameFromBufferView };
//# sourceMappingURL=index.esm.js.map
