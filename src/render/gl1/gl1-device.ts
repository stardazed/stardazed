// render/gl1/device - WebGL1 implementation of RenderDevice
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../../../typings/webgl.d.ts"/>

namespace sd.render {

	export class GL1RenderDevice implements RenderDevice {
		gl: WebGLRenderingContext;

		ext32bitIndexes: OESElementIndexUint;
		extDrawBuffers: WebGLDrawBuffers;
		extDepthTexture: WebGLDepthTexture;
		extTextureFloat: OESTextureFloat;
		extTextureFloatLinear: OESTextureFloatLinear;
		extTextureHalfFloat: OESTextureHalfFloat;
		extTextureHalfFloatLinear: OESTextureHalfFloatLinear;
		extS3TC: WebGLCompressedTextureS3TC;
		extMinMax: EXTBlendMinMax;
		extTexAnisotropy: EXTTextureFilterAnisotropic;
		extVAO: OESVertexArrayObject;
		extInstancedArrays: ANGLEInstancedArrays;
		extDerivatives: OESStandardDerivatives;
		extFragmentLOD: EXTShaderTextureLOD;
		extFragDepth: EXTFragDepth;
		extSRGB: EXTsRGB;

		private maxColourAttachments_ = 0;

		constructor(canvas: HTMLCanvasElement) {
			let gl: WebGLRenderingContext | null;

			// try and create the 3D context
			const contextAttrs: WebGLContextAttributes = {
				antialias: false,
				depth: true,
				alpha: false
			};

			try {
				gl = canvas.getContext("webgl", contextAttrs);
				if (! gl) {
					gl = canvas.getContext("experimental-webgl", contextAttrs);
				}
			} catch (e) {
				gl = null;
			}

			if (! gl) {
				throw new Error("WebGL 1 is not supported or disabled.");
			}
			this.gl = gl;

			// enable large indexed meshes
			this.ext32bitIndexes = gl.getExtension("OES_element_index_uint");

			// we'd like more colour attachments
			this.extDrawBuffers = gl.getExtension("WEBGL_draw_buffers");

			// enable extended depth textures
			this.extDepthTexture = gl.getExtension("WEBGL_depth_texture") ||
						gl.getExtension("WEBKIT_WEBGL_depth_texture") ||
						gl.getExtension("MOZ_WEBGL_depth_texture");

			// (half) float textures
			this.extTextureFloat = gl.getExtension("OES_texture_float");
			this.extTextureFloatLinear = gl.getExtension("OES_texture_float_linear");
			this.extTextureHalfFloat = gl.getExtension("OES_texture_half_float");
			this.extTextureHalfFloatLinear = gl.getExtension("OES_texture_half_float_linear");

			// enable S3TC (desktop only)
			this.extS3TC = gl.getExtension("WEBGL_compressed_texture_s3tc") ||
						gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") ||
						gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");

			// enable MIN and MAX blend modes
			this.extMinMax = gl.getExtension("EXT_blend_minmax");

			// enable texture anisotropy
			this.extTexAnisotropy = gl.getExtension("EXT_texture_filter_anisotropic") ||
						gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

			// enable Vertex Array Objects
			this.extVAO = gl.getExtension("OES_vertex_array_object");

			// enable instanced draw calls
			this.extInstancedArrays = gl.getExtension("ANGLE_instanced_arrays");

			// enable texture gradient calc and *Lod and *Grad texture calls in fragment shaders
			this.extDerivatives = gl.getExtension("OES_standard_derivatives");
			this.extFragmentLOD = gl.getExtension("EXT_shader_texture_lod");

			// enable explicit setting of fragment depth
			this.extFragDepth = gl.getExtension("EXT_frag_depth");

			// enable sRGB textures and renderbuffers
			this.extSRGB = gl.getExtension("EXT_sRGB");
		}


		// -- capabilities
		get supportsArrayTextures() { return false; }
		get supportsDepthTextures() { return false; }

		get maxColourAttachments() {
			if (this.maxColourAttachments_ === 0) {
				this.maxColourAttachments_ = this.extDrawBuffers ? this.gl.getParameter(this.extDrawBuffers.MAX_COLOR_ATTACHMENTS_WEBGL) : 1;
			}
			return this.maxColourAttachments_;
		}


		makeShader(type: number, sourceText: string) {
			const shader = this.gl.createShader(type)!; // TODO: handle resource allocation failure
			this.gl.shaderSource(shader, sourceText);
			this.gl.compileShader(shader);

			if (! this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
				const errorLog = this.gl.getShaderInfoLog(shader);
				console.error("Shader compilation failed:", errorLog);
				console.error("Source", sourceText);
				assert(false, "bad shader");
			}

			return shader;
		}


		makeProgram(vertexShader?: WebGLShader, fragmentShader?: WebGLShader) {
			const program = this.gl.createProgram()!; // TODO: handle resource allocation failure
			if (vertexShader) {
				this.gl.attachShader(program, vertexShader);
			}
			if (fragmentShader) {
				this.gl.attachShader(program, fragmentShader);
			}
			this.gl.linkProgram(program);

			if (! this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
				const errorLog = this.gl.getProgramInfoLog(program);
				console.error("Program link failed:", errorLog);
				assert(false, "bad program");
			}

			return program;
		}


		dispatch(_rcb: RenderCommandBuffer) {

		}


		dispatchResource(rrcb: RenderResourceCommandBuffer[]) {
			for (const cb of rrcb) {
				for (const resource of cb.allocList) {
					if (resource.renderResourceHandle) {
						console.warn("alloc: resource was already GPU allocated.", resource);
						return;
					}
					switch (resource.renderResourceType) {
						case ResourceType.Sampler:
							this.allocSampler(resource as Sampler);
							break;
						case ResourceType.Texture:
							this.allocTexture(resource as Texture);
							break;
						default:
							break;
					}
				}

				for (const resource of cb.freeList) {
					if (! resource.renderResourceHandle) {
						console.warn("free: resource was not GPU allocated.", resource);
						return;
					}
					switch (resource.renderResourceType) {
						case ResourceType.Sampler:
							this.freeSampler(resource as Sampler);
							break;
						case ResourceType.Texture:
							this.freeTexture(resource as Texture);
							break;
						default:
							break;
					}
				}
			}
		}

		// -- Handles

		private encodeHandle(type: ResourceType, index: number) {
			return (type << 24) | index;
		}

		private decodeHandle(handle: number) {
			const index = handle & 0x00FFFFFF;
			const type = (handle >> 24) as ResourceType;
			return { type, index };
		}

		// -- Sampler

		private samplers_: Sampler[] = [];
		private nextSamplerIndex_ = 0;
		private freedSamplers_: number[] = [];

		private allocSampler(sampler: Sampler) {
			let index: number;
			if (this.freedSamplers_.length) {
				index = this.freedSamplers_.pop()!;
			}
			else {
				index = this.nextSamplerIndex_;
				this.nextSamplerIndex_ += 1;
			}

			this.samplers_[index] = sampler;
			sampler.renderResourceHandle = this.encodeHandle(ResourceType.Sampler, index);
		}

		private freeSampler(sampler: Sampler) {
			const resourceInfo = this.decodeHandle(sampler.renderResourceHandle!);
			sampler.renderResourceHandle = 0;
			this.freedSamplers_.push(resourceInfo.index);
		}

		// -- Texture

		private textures_: (WebGLTexture | undefined)[] = [];
		private nextTextureIndex_ = 0;
		private freedTextures_: number[] = [];
		private linkedSamplers_: number[] = [];

		private allocTexture(texture: Texture) {
			let index: number;
			if (this.freedTextures_.length) {
				index = this.freedTextures_.pop()!;
			}
			else {
				index = this.nextTextureIndex_;
				this.nextTextureIndex_ += 1;
			}

			this.linkedSamplers_[index] = 0;
			this.textures_[index] = gl1CreateTexture(this, texture); // TODO: handle allocation failure
			texture.renderResourceHandle = this.encodeHandle(ResourceType.Texture, index);
		}

		private freeTexture(texture: Texture) {
			const { index } = this.decodeHandle(texture.renderResourceHandle!);
			texture.renderResourceHandle = 0;

			this.gl.deleteTexture(this.textures_[index]!);
			this.linkedSamplers_[index] = 0;
			this.freedTextures_.push(index);
		}
	}

} // ns sd.render
