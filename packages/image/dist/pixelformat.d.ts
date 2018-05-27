export declare const enum PixelFormat {
    None = 0,
    R8 = 1,
    RG8 = 2,
    RGB8 = 3,
    RGBA8 = 4,
    SRGB8 = 5,
    SRGB8_Alpha8 = 6,
    R16F = 7,
    RG16F = 8,
    RGB16F = 9,
    RGBA16F = 10,
    R32F = 11,
    RG32F = 12,
    RGB32F = 13,
    RGBA32F = 14,
    RGB_5_6_5 = 15,
    RGBA_4_4_4_4 = 16,
    RGBA_5_5_5_1 = 17,
    Depth16I = 18,
    Depth24I = 19,
    Stencil8 = 20,
    Depth24_Stencil8 = 21,
    RGB_DXT1 = 256,
    RGBA_DXT1 = 257,
    RGBA_DXT3 = 258,
    RGBA_DXT5 = 259,
}
export declare function pixelFormatIsCompressed(format: PixelFormat): boolean;
export declare function pixelFormatIsDepthFormat(format: PixelFormat): boolean;
export declare function pixelFormatIsStencilFormat(format: PixelFormat): boolean;
export declare function pixelFormatIsDepthStencilFormat(format: PixelFormat): boolean;
export declare function pixelFormatBytesPerElement(format: PixelFormat): 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 0;
