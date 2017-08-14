// render/core/gl1/texture - WebGL1 implementation of textures
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	function gl1TargetForTexture(texture: Texture) {
		if (texture.textureClass === TextureClass.Plain) {
			return GLConst.TEXTURE_2D;
		}

		return GLConst.TEXTURE_CUBE_MAP;
	}


	const textureLimits = {
		maxDimension: 0,
		maxDimensionCube: 0
	};


	function gl1MaxTextureDimension(rd: GL1RenderDevice, texClass: TextureClass) {
		if (textureLimits.maxDimension === 0) {
			textureLimits.maxDimension = rd.gl.getParameter(GLConst.MAX_TEXTURE_SIZE);
			textureLimits.maxDimensionCube = rd.gl.getParameter(GLConst.MAX_CUBE_MAP_TEXTURE_SIZE);
		}

		if (texClass === TextureClass.CubeMap) {
			return textureLimits.maxDimensionCube;
		}
		return textureLimits.maxDimension;
	}


	function gl1CalcMipLevels(texture: Texture, provider: image.PixelDataProvider | undefined) {
		if (texture.mipmapMode === MipMapMode.Strip) {
			return {
				providerMips: 1,
				generatedMips: 0
			};
		}

		const mipLimit = Math.min(texture.maxMipLevel || 255, maxMipLevelsForDimension(Math.max(texture.dim.width, texture.dim.height)));
		let providerMips = provider ? provider.mipMapCount : 1;
		let generatedMips = 0;

		if (texture.mipmapMode === MipMapMode.Source) {
			providerMips = Math.min(providerMips, mipLimit);
		}
		else {
			// mipmapMode === Regenerate
			providerMips = 1;
			generatedMips = mipLimit - 1;
		}

		// WebGL 1 disallows mipmaps on Non-Power-of-Two textures
		const npot = image.isNonPowerOfTwo(texture.dim);
		if (npot) {
			if (providerMips + generatedMips > 1) {
				console.warn("GL1: restricting NPOT texture to 1 mip", texture);
				providerMips = 1;
				generatedMips = 0;
			}
		}

		return { providerMips, generatedMips };
	}


	function allocTextureLayer(rd: GL1RenderDevice, texture: Texture, provider: image.PixelDataProvider | undefined, providerMips: number, target: number) {
		const gl = rd.gl;

		const { width, height } = texture.dim;
		const glTexPixelFormat = gl1ImageFormatForPixelFormat(rd, texture.pixelFormat);
		const glTexPixelType = gl1PixelDataTypeForPixelFormat(rd, texture.pixelFormat);

		if (image.pixelFormatIsCompressed(texture.pixelFormat)) {
			assert(provider !== undefined, "GL1: Compressed textures MUST provide pixelData");

			for (let mip = 0; mip < providerMips; ++mip) {
				const pixBuf = provider!.pixelBufferForLevel(mip)!;
				gl.compressedTexImage2D(target, mip, glTexPixelFormat, pixBuf.dim.width, pixBuf.dim.height, 0, pixBuf.data as ArrayBufferView);
			}
		}
		else {
			for (let mip = 0; mip < providerMips; ++mip) {
				const pixBuf = provider ? provider.pixelBufferForLevel(mip) : undefined;
				const pixData = pixBuf ? pixBuf.data : null;

				if ((pixData === null) || ("byteLength" in pixData)) {
					// either no data or raw pixel data
					gl.texImage2D(target, mip, glTexPixelFormat, pixBuf ? pixBuf.dim.width : width, pixBuf ? pixBuf.dim.height : height, 0, glTexPixelFormat, glTexPixelType, pixData as (ArrayBufferView | null));
				} 
				else {
					// a TexImageSource was provided
					const tis = pixData as TextureImageSource;
					assert((tis.width === width) && (tis.height === height), "GL1: imageSource's size does not match descriptor");
					gl.texImage2D(target, mip, glTexPixelFormat, glTexPixelFormat, glTexPixelType, tis);
				}
			}
		}
	}


	function createPlainTexture(rd: GL1RenderDevice, texture: Texture) {
		const gl = rd.gl;
		const pixelData = texture.pixelData;

		// -- input checks
		assert((pixelData == null) || (pixelData.length === 1), "GL1: Normal pixelData array must contain 1 item or be omitted completely.");

		// -- create resource
		const tex = gl.createTexture()!; // TODO: handle resource allocation failure
		const target = GLConst.TEXTURE_2D;
		gl.bindTexture(target, tex);

		// -- allocate and fill pixel storage
		const provider = pixelData && pixelData[0];
		const { providerMips, generatedMips } = gl1CalcMipLevels(texture, provider);
		allocTextureLayer(rd, texture, provider, providerMips, target);

		// -- generate mipmaps if requested
		if (generatedMips > 0) {
			gl.generateMipmap(target);
		}

		gl.bindTexture(target, null);
		return {
			texture: tex,
			mipmapped: providerMips + generatedMips > 1
		};
	}


	function createCubeMapTexture(rd: GL1RenderDevice, texture: Texture) {
		const gl = rd.gl;
		const pixelData = texture.pixelData;

		// -- input checks
		const { width, height } = texture.dim;
		assert(width === height, "GL1: TexCube textures MUST have the same width and height");
		assert((pixelData == null) || (pixelData.length === 6), "GL1: CubeMap pixelData array must contain 6 items or be omitted completely.");

		// -- create resource
		const tex = gl.createTexture()!; // TODO: handle resource allocation failure
		const target = GLConst.TEXTURE_CUBE_MAP;
		gl.bindTexture(target, tex);

		// -- allocate and fill pixel storage
		let shouldGenMips = false;
		let hasMips = false;
		for (let layer = 0; layer < 6; ++layer) {
			const provider = pixelData && pixelData[layer];
			const { providerMips, generatedMips } = gl1CalcMipLevels(texture, provider);
			hasMips = providerMips + generatedMips > 1;
			if (generatedMips > 0) {
				shouldGenMips = true;
			}
			allocTextureLayer(rd, texture, provider, providerMips, GLConst.TEXTURE_CUBE_MAP_POSITIVE_X + layer);
		}

		// -- generate mipmaps if requested
		if (shouldGenMips) {
			gl.generateMipmap(target);
		}

		gl.bindTexture(target, null);
		return {
			texture: tex,
			mipmapped: hasMips
		};
	}

	export interface GL1TextureData {
		texture: WebGLTexture;
		target: GLConst.TEXTURE_2D | GLConst.TEXTURE_CUBE_MAP;
		format: image.PixelFormat;
		mipmapped: boolean;
		nonPowerOfTwoDim: boolean;
		linkedSamplerHandle: number;
	}

	export function createTexture(rd: GL1RenderDevice, texture: Texture): GL1TextureData {
		// -- general validity checks
		assert(texture.dim.width > 0);
		assert(texture.dim.height > 0);
		assert(texture.dim.depth === 1); // GL1 does not support 3D textures
		assert(texture.layers === undefined || texture.layers === 1); // GL1 only supports single-layer textures

		assert(texture.dim.width <= gl1MaxTextureDimension(rd, texture.textureClass));
		assert(texture.dim.height <= gl1MaxTextureDimension(rd, texture.textureClass));

		let texResult: { texture: WebGLTexture; mipmapped: boolean };
		if (texture.textureClass === TextureClass.CubeMap) {
			texResult = createCubeMapTexture(rd, texture);
		}
		else {
			texResult = createPlainTexture(rd, texture);
		}

		return {
			texture: texResult.texture,
			target: gl1TargetForTexture(texture),
			format: texture.pixelFormat,
			mipmapped: texResult.mipmapped,
			nonPowerOfTwoDim: image.isNonPowerOfTwo(texture.dim),
			linkedSamplerHandle: 0
		};
	}

} // ns sd.render.gl1
