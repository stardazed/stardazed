// render/gl1/texture - WebGL1 implementation of textures
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	import PixelFormat = image.PixelFormat;

	function gl1ImageFormatForPixelFormat(rd: GL1RenderDevice, format: PixelFormat) {
		const gl = rd.gl;

		switch (format) {
			case PixelFormat.Alpha:
				return gl.ALPHA;

			case PixelFormat.RGB8:
				return gl.RGB;
			case PixelFormat.RGBA8:
				return gl.RGBA;

			// sRGB -- silently fall back to standard RGB if not available (availability in browsers is ~100%)
			case PixelFormat.SRGB8:
				return rd.extSRGB ? rd.extSRGB.SRGB_EXT : gl.RGB;
			case PixelFormat.SRGB8_Alpha8:
				return rd.extSRGB ? rd.extSRGB.SRGB_ALPHA_EXT : gl.RGB;

			// Float
			case PixelFormat.RGBA16F:
				return rd.extTextureHalfFloat ? gl.RGBA : gl.NONE;
			case PixelFormat.RGBA32F:
				return gl.RGBA;

			// Packed
			case PixelFormat.RGB_5_6_5:
				return gl.RGB;
			case PixelFormat.RGBA_4_4_4_4:
			case PixelFormat.RGBA_5_5_5_1:
				return gl.RGBA;

			// Depth / Stencil
			case PixelFormat.Depth16I:
			case PixelFormat.Depth24I:
				return gl.DEPTH_COMPONENT;

			case PixelFormat.Stencil8:
				return gl.STENCIL_INDEX;

			case PixelFormat.Depth24_Stencil8:
				return gl.DEPTH_STENCIL;

			// S3TC
			case PixelFormat.RGB_DXT1:
				return rd.extS3TC ? rd.extS3TC.COMPRESSED_RGB_S3TC_DXT1_EXT : gl.NONE;
			case PixelFormat.RGBA_DXT1:
				return rd.extS3TC ? rd.extS3TC.COMPRESSED_RGBA_S3TC_DXT1_EXT : gl.NONE;
			case PixelFormat.RGBA_DXT3:
				return rd.extS3TC ? rd.extS3TC.COMPRESSED_RGBA_S3TC_DXT3_EXT : gl.NONE;
			case PixelFormat.RGBA_DXT5:
				return rd.extS3TC ? rd.extS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT : gl.NONE;

			default:
				assert(false, "GL1: unhandled pixel format");
				return gl.NONE;
		}
	}


	function gl1PixelDataTypeForPixelFormat(rd: GL1RenderDevice, format: PixelFormat) {
		const gl = rd.gl;

		if (image.pixelFormatIsCompressed(format)) {
			return gl.NONE;
		}

		switch (format) {
			case PixelFormat.Alpha:
			case PixelFormat.RGB8:
			case PixelFormat.Stencil8:
			case PixelFormat.RGBA8:
				return gl.UNSIGNED_BYTE;

			case PixelFormat.SRGB8:
			case PixelFormat.SRGB8_Alpha8:
				return gl.UNSIGNED_BYTE;

			case PixelFormat.RGB_5_6_5:
				return gl.UNSIGNED_SHORT_5_6_5;
			case PixelFormat.RGBA_4_4_4_4:
				return gl.UNSIGNED_SHORT_4_4_4_4;
			case PixelFormat.RGBA_5_5_5_1:
				return gl.UNSIGNED_SHORT_5_5_5_1;

			case PixelFormat.RGBA16F:
				return rd.extTextureHalfFloat ? rd.extTextureHalfFloat.HALF_FLOAT_OES : gl.NONE;

			case PixelFormat.RGBA32F:
				return gl.FLOAT;

			case PixelFormat.Depth16I:
				return gl.UNSIGNED_SHORT;
			case PixelFormat.Depth24I:
				return gl.UNSIGNED_INT;

			case PixelFormat.Depth24_Stencil8:
				return rd.extDepthTexture ? rd.extDepthTexture.UNSIGNED_INT_24_8_WEBGL : gl.NONE;

			default:
				assert(false, "GL1: unsupported pixel format");
				return gl.NONE;
		}
	}


	function gl1TargetForTexture(rd: GL1RenderDevice, texture: Texture) {
		if (texture.layers! > 1 || texture.textureClass === TextureClass.Tex3D) {
			assert(false, "GL1: unsupported texture format");
			return rd.gl.NONE;
		}
		if (texture.textureClass === TextureClass.Tex2D) {
			return rd.gl.TEXTURE_2D;
		}
		if (texture.textureClass === TextureClass.TexCube) {
			return rd.gl.TEXTURE_CUBE_MAP;
		}
		return rd.gl.NONE;
	}


	function glTextureRepeatMode(rd: GL1RenderDevice, repeat: TextureRepeatMode) {
		switch (repeat) {
			case TextureRepeatMode.Repeat: return rd.gl.REPEAT;
			case TextureRepeatMode.MirroredRepeat: return rd.gl.MIRRORED_REPEAT;
			case TextureRepeatMode.ClampToEdge: return rd.gl.CLAMP_TO_EDGE;

			default:
				assert(false, "GL1: unsupported TextureRepeatMode");
				return rd.gl.NONE;
		}
	}


	function gl1TextureMinificationFilter(rd: GL1RenderDevice, minFilter: TextureSizingFilter, mipFilter: TextureMipFilter) {
		let glSizingFilter: number;

		if (mipFilter == TextureMipFilter.None) {
			if (minFilter == TextureSizingFilter.Nearest) {
				glSizingFilter = rd.gl.NEAREST;
			}
			else {
				glSizingFilter = rd.gl.LINEAR;
			}
		}
		else if (mipFilter == TextureMipFilter.Nearest) {
			if (minFilter == TextureSizingFilter.Nearest) {
				glSizingFilter = rd.gl.NEAREST_MIPMAP_NEAREST;
			}
			else {
				glSizingFilter = rd.gl.LINEAR_MIPMAP_NEAREST;
			}
		}
		else {
			if (minFilter == TextureSizingFilter.Nearest) {
				glSizingFilter = rd.gl.NEAREST_MIPMAP_LINEAR;
			}
			else {
				glSizingFilter = rd.gl.LINEAR_MIPMAP_LINEAR;
			}
		}

		return glSizingFilter;
	}


	function gl1TextureMagnificationFilter(rd: GL1RenderDevice, magFilter: TextureSizingFilter) {
		if (magFilter == TextureSizingFilter.Nearest) {
			return rd.gl.NEAREST;
		}
		else {
			return rd.gl.LINEAR;
		}
	}


	const textureLimits = {
		maxDimension: 0,
		maxDimensionCube: 0,
		maxAnisotropy: 0
	};


	function maxTextureDimension(rd: GL1RenderDevice, texClass: TextureClass) {
		if (textureLimits.maxDimension == 0) {
			textureLimits.maxDimension = rd.gl.getParameter(rd.gl.MAX_TEXTURE_SIZE);
			textureLimits.maxDimensionCube = rd.gl.getParameter(rd.gl.MAX_CUBE_MAP_TEXTURE_SIZE);
		}

		if (texClass == TextureClass.TexCube) {
			return textureLimits.maxDimensionCube;
		}
		return textureLimits.maxDimension;
	}


	function maxAllowedAnisotropy(rd: GL1RenderDevice) {
		if (textureLimits.maxAnisotropy == 0) {
			textureLimits.maxAnisotropy =
				rd.extTexAnisotropy ?
				rd.gl.getParameter(rd.extTexAnisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) :
				1;
		}

		return textureLimits.maxAnisotropy;
	}


	function applySampler(rd: GL1RenderDevice, texture: Texture, sampler: Sampler) {
		const gl = rd.gl;
		const target = gl1TargetForTexture(rd, texture);

		// -- WebGL 1 imposes several restrictions on Non-Power-of-Two textures
		const npot = !(math.isPowerOf2(texture.dim.width) && math.isPowerOf2(texture.dim.height));
		if (npot) {
			if (sampler.repeatS != TextureRepeatMode.ClampToEdge || sampler.repeatT != TextureRepeatMode.ClampToEdge) {
				console.warn("NPOT textures cannot repeat, overriding with ClampToEdge", texture);
				sampler.repeatS = TextureRepeatMode.ClampToEdge;
				sampler.repeatT = TextureRepeatMode.ClampToEdge;
			}
			if (this.mipmaps_ > 1) {
				console.warn("NPOT textures cannot have mipmaps, setting levels to 1", texture);
				this.mipmaps_ = 1;
			}
			if (sampler.mipFilter != TextureMipFilter.None) {
				console.warn("NPOT textures cannot have mipmaps, overriding with MipFilter.None", texture);
				sampler.mipFilter = TextureMipFilter.None;
			}
		}

		gl.bindTexture(target, this.resource_);

		// -- wrapping
		gl.texParameteri(target, gl.TEXTURE_WRAP_S, glTextureRepeatMode(rd, sampler.repeatS));
		gl.texParameteri(target, gl.TEXTURE_WRAP_T, glTextureRepeatMode(rd, sampler.repeatS));

		// -- mini-/magnification
		if (this.mipmaps_ === 1) {
			sampler.mipFilter = TextureMipFilter.None;
		}
		gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl1TextureMinificationFilter(rd, sampler.minFilter, sampler.mipFilter));
		gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl1TextureMagnificationFilter(rd, sampler.magFilter));

		// -- anisotropy
		if (rd.extTexAnisotropy) {
			const anisotropy = math.clamp(sampler.maxAnisotropy, 1, maxAllowedAnisotropy(rd));
			gl.texParameterf(target, rd.extTexAnisotropy.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
		}

		rd.gl.bindTexture(target, null);
	}


	function applyMipMaps(rd: GL1RenderDevice) {

	}


	function createTex2D(rd: GL1RenderDevice, texture: Texture) {
		const gl = rd.gl;
		const pixelData = texture.pixelData;

		// -- input checks
		assert((pixelData == null) || (pixelData.length == 1), "GL1: Tex2D pixelData array must contain 1 item or be omitted completely.");
		const texPixelData = (pixelData && pixelData[0]) || null;

		const glPixelFormat = gl1ImageFormatForPixelFormat(rd, texture.pixelFormat);
		const glPixelType = gl1PixelDataTypeForPixelFormat(rd, texture.pixelFormat);

		if (image.pixelFormatIsCompressed(this.pixelFormat_)) {
			assert(texPixelData && ("byteLength" in texPixelData), "GL1: Compressed textures MUST provide pixelData");
		}

		// -- create resource
		const { width: w, height: h } = texture.dim;
		assert(w == h, "GL1: TexCube textures MUST have the same width and height");
		const tex = gl.createTexture()!; // TODO: handle resource allocation failure
		const target = gl.TEXTURE_2D;
		gl.bindTexture(target, tex);

		// -- allocate and fill pixel storage
		if (image.pixelFormatIsCompressed(texture.pixelFormat)) {
			gl.compressedTexImage2D(target, 0, glPixelFormat, w, h, 0, <ArrayBufferView>texPixelData);
		}
		else {
			if ((texPixelData == null) || ("byteLength" in texPixelData)) {
				// either no data or raw pixel data
				gl.texImage2D(target, 0, glPixelFormat, w, h, 0, glPixelFormat, glPixelType, <ArrayBufferView>texPixelData);
			}
			else {
				// a TexImageSource was provided
				const tis = <TextureImageSource>texPixelData;
				assert((tis.width == w) && (tis.height == h), "GL1: Tex2D imageSource's size does not match descriptor");
				gl.texImage2D(target, 0, glPixelFormat, glPixelFormat, glPixelType, <any>tis);
			}
		}

		// -- generate mipmaps if requested (TODO: user provided mipmaps not supported)
		if (texture.mipmaps_ > 1) {
			gl.generateMipmap(target);
		}

		gl.bindTexture(target, null);
	}


	function createTexCube(rd: GL1RenderDevice, texture: Texture) {
		const gl = rd.gl;
		const pixelData = texture.pixelData;

		// -- input checks
		assert((pixelData == null) || (pixelData.length == 6), "GL1: TexCube pixelData array must contain 6 items or be omitted completely.");

		const glPixelFormat = gl1ImageFormatForPixelFormat(rd, texture.pixelFormat);
		const glPixelType = gl1PixelDataTypeForPixelFormat(rd, texture.pixelFormat);

		// -- create resource
		const { width: w, height: h } = texture.dim;
		const tex = gl.createTexture()!; // TODO: handle resource allocation failure
		const target = gl.TEXTURE_CUBE_MAP;
		gl.bindTexture(target, tex);

		// -- allocate and fill pixel storage
		if (image.pixelFormatIsCompressed(texture.pixelFormat)) {
			assert(pixelData && (pixelData.length == 6), "GL1: Compressed textures MUST provide pixelData");

			for (let layer = 0; layer < 6; ++layer) {
				const layerPixels = pixelData![layer];
				assert(layerPixels && ("byteLength" in layerPixels), `GL1: pixelData source ${layer} for compressed TexCube is not an ArrayBufferView`);
				gl.compressedTexImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer, 0, glPixelFormat, w, h, 0, <ArrayBufferView>layerPixels);
			}
		}
		else {
			for (let layer = 0; layer < 6; ++layer) {
				const texPixelData = (pixelData && pixelData[layer]) || null;

				if ((texPixelData == null) || ("byteLength" in texPixelData)) {
					// either no data or raw pixel data
					gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer, 0, glPixelFormat, w, h, 0, glPixelFormat, glPixelType, <ArrayBufferView>texPixelData);
				}
				else {
					// a TexImageSource was provided
					const tis = <TextureImageSource>texPixelData;
					assert((tis.width == w) && (tis.height == h), `GL1: TexCube pixelData ${layer}'s size does not match descriptor`);
					gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer, 0, glPixelFormat, glPixelFormat, glPixelType, <any>texPixelData);
				}
			}
		}

		// -- generate mipmaps if requested (TODO: user provided mipmaps not supported)
		if (this.mipmaps_ > 1) {
			gl.generateMipmap(this.glTarget_);
		}

		gl.bindTexture(target, null);
	}


	function socko(rd: GL1RenderDevice, texture: Texture) {
		// -- check input
		assert(this.mipmaps_ > 0);
		assert(this.width > 0);
		assert(this.height > 0);

		assert(this.width <= maxTextureDimension(rd, this.textureClass_));
		assert(this.height <= maxTextureDimension(rd, this.textureClass_));

		// -- WebGL imposes several restrictions on Non-Power-of-Two textures
		const npot = !(math.isPowerOf2(this.width) && math.isPowerOf2(this.height));
		if (npot) {
			if (this.sampler_.repeatS != TextureRepeatMode.ClampToEdge || this.sampler_.repeatT != TextureRepeatMode.ClampToEdge) {
				console.warn("NPOT textures cannot repeat, overriding with ClampToEdge", texture);
				this.sampler_.repeatS = TextureRepeatMode.ClampToEdge;
				this.sampler_.repeatT = TextureRepeatMode.ClampToEdge;
			}
			if (this.mipmaps_ > 1) {
				console.warn("NPOT textures cannot have mipmaps, setting levels to 1", texture);
				this.mipmaps_ = 1;
			}
			if (this.sampler_.mipFilter != TextureMipFilter.None) {
				console.warn("NPOT textures cannot have mipmaps, overriding with MipFilter.None", texture);
				this.sampler_.mipFilter = TextureMipFilter.None;
			}
		}

		const gl = rd.gl;

		// -- create resource
		if (texture.textureClass == TextureClass.Tex2D) {
			this.createTex2D(texture.pixelData);
		}
		else {
			this.createTexCube(texture.pixelData);
		}

		// -- apply sampling parameters
		gl.bindTexture(this.glTarget_, this.resource_);

		// -- wrapping
		gl.texParameteri(this.glTarget_, gl.TEXTURE_WRAP_S, glTextureRepeatMode(rd, this.sampler_.repeatS));
		gl.texParameteri(this.glTarget_, gl.TEXTURE_WRAP_T, glTextureRepeatMode(rd, this.sampler_.repeatS));

		// -- mini-/magnification
		if (this.mipmaps_ == 1) {
			this.sampler_.mipFilter = TextureMipFilter.None;
		}
		gl.texParameteri(this.glTarget_, gl.TEXTURE_MIN_FILTER, gl1TextureMinificationFilter(rd, this.sampler_.minFilter, this.sampler_.mipFilter));
		gl.texParameteri(this.glTarget_, gl.TEXTURE_MAG_FILTER, gl1TextureMagnificationFilter(rd, this.sampler_.magFilter));

		// -- anisotropy
		if (rd.extTexAnisotropy) {
			const anisotropy = math.clamp(this.sampler_.maxAnisotropy, 1, maxAllowedAnisotropy(rd));
			gl.texParameterf(this.glTarget_, rd.extTexAnisotropy.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
		}

		rd.gl.bindTexture(this.glTarget_, null);
	}

} // ns sd.render
