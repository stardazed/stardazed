// render/core/gl1/device - WebGL1 implementation of RenderDevice
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../../../../typings/webgl.d.ts"/>
/// <reference path="gl1-constants.ts"/>

namespace sd.render.gl1 {

	export class GL1RenderDevice implements RenderDevice {
		readonly name = "gl1";

		readonly gl: WebGLRenderingContext;
		readonly state: GL1State;

		readonly ext32bitIndexes: OES_element_index_uint | null;
		readonly extDrawBuffers: WEBGL_draw_buffers | null;
		readonly extDepthTexture: WEBGL_depth_texture | null;
		readonly extTextureFloat: OES_texture_float | null;
		readonly extTextureFloatLinear: OES_texture_float_linear | null;
		readonly extTextureHalfFloat: OES_texture_half_float | null;
		readonly extTextureHalfFloatLinear: OES_texture_half_float_linear | null;
		readonly extS3TC: WEBGL_compressed_texture_s3tc | null;
		readonly extMinMax: EXT_blend_minmax | null;
		readonly extTexAnisotropy: EXT_texture_filter_anisotropic | null;
		readonly extVAO: OES_vertex_array_object; // required extension
		readonly extInstancedArrays: ANGLE_instanced_arrays | null;
		readonly extDerivatives: OES_standard_derivatives | null;
		readonly extFragmentLOD: EXT_shader_texture_lod | null;
		readonly extFragDepth: EXT_frag_depth | null;
		readonly extSRGB: EXT_sRGB | null;

		private maxColourAttachments_ = 0;

		commandList_: RenderCommand[] = [];

		constructor(canvas: HTMLCanvasElement) {
			let gl: WebGLRenderingContext | null;

			// try and create the 3D context
			const contextAttrs: WebGLContextAttributes = {
				antialias: false,
				depth: true,
				alpha: false,
				premultipliedAlpha: false
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

			this.state = new GL1State(gl);

			// sensible defaults
			gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, GLConst.NONE);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, GLConst.ZERO);

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
			this.extVAO = gl.getExtension("OES_vertex_array_object")!; // Assert presence, SD won't run without

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


		// -- current final drawable dimensions
		get drawableWidth() {
			return this.gl.drawingBufferWidth;
		}
		get drawableHeight() {
			return this.gl.drawingBufferHeight;
		}

		// -- capabilities
		get supportsSRGBTextures() {
			return this.extSRGB !== undefined;
		}
		get supportsArrayTextures() { return false; }
		get supportsDepthTextures() { return false; }

		get maxColourAttachments() {
			if (this.maxColourAttachments_ === 0) {
				this.maxColourAttachments_ = this.extDrawBuffers ? this.gl.getParameter(this.extDrawBuffers.MAX_COLOR_ATTACHMENTS_WEBGL) : 1;
			}
			return this.maxColourAttachments_;
		}


		// -- render commands
		dispatch(cmds: RenderCommandBuffer | RenderCommandBuffer[]) {
			if (Array.isArray(cmds)) {
				for (const cb of cmds) {
					this.commandList_ = this.commandList_.concat(cb.commands);
				}
			}
			else {
				this.commandList_ = this.commandList_.concat(cmds.commands);
			}
		}

		// processFrame is defined out-of-line in gl1-render.ts
		processFrame = processFrame;

		discardFrame() {
			this.commandList_ = [];
		}

		//  ___                                
		// | _ \___ ___ ___ _  _ _ _ __ ___ ___
		// |   / -_|_-</ _ \ || | '_/ _/ -_|_-<
		// |_|_\___/__/\___/\_,_|_| \__\___/__/
		//                                     

		processResourceCommand(rrc: ResourceCommand) {
			for (const resource of rrc.free) {
				if (! resource.renderResourceHandle) {
					console.warn("free: resource was not GPU allocated.", resource);
					continue;
				}
				switch (resource.renderResourceType) {
					case ResourceType.Sampler:
						this.freeSampler(resource as Sampler);
						break;
					case ResourceType.Texture:
						this.freeTexture(resource as Texture);
						break;
					case ResourceType.FrameBuffer:
						this.freeFrameBuffer(resource as FrameBuffer);
						break;
					case ResourceType.Shader:
						this.freeShader(resource as Shader);
						break;
					case ResourceType.Mesh:
						this.freeGeometry(resource as geometry.Geometry);
						break;
					default:
						break;
				}
			}

			for (const resource of rrc.alloc) {
				if (resource.renderResourceHandle) {
					console.warn("alloc: resource was already GPU allocated.", resource);
					continue;
				}
				switch (resource.renderResourceType) {
					case ResourceType.Sampler:
						this.allocSampler(resource as Sampler);
						break;
					case ResourceType.Texture:
						this.allocTexture(resource as Texture);
						break;
					case ResourceType.FrameBuffer:
						this.allocFrameBuffer(resource as FrameBuffer);
						break;
					case ResourceType.Shader:
						this.allocShader(resource as Shader);
						break;
					case ResourceType.Mesh:
						this.allocGeometry(resource as geometry.Geometry);
						break;
					default:
						break;
				}
			}
		}

		// -- Sampler

		readonly samplers_ = new ReusableResourceArray<Sampler, Sampler>(ResourceType.Sampler);

		private allocSampler(sampler: Sampler) {
			this.samplers_.insert(sampler, sampler);
		}

		private freeSampler(sampler: Sampler) {
			this.samplers_.remove(sampler);
		}

		// -- Texture

		readonly textures_ = new ReusableResourceArray<Texture, GL1TextureData>(ResourceType.Texture);

		private allocTexture(texture: Texture) {
			const glTex = createTexture(this, texture); // TODO: handle allocation failure
			this.textures_.insert(texture, glTex);
		}

		private freeTexture(texture: Texture) {
			const tex = this.textures_.find(texture);
			if (tex) {
				this.gl.deleteTexture(tex.texture);
				this.textures_.remove(texture);
			}
		}

		// -- FrameBuffer

		readonly frameBuffers_ = new ReusableResourceArray<FrameBuffer, WebGLFramebuffer>(ResourceType.FrameBuffer);

		private allocFrameBuffer(frameBuffer: FrameBuffer) {
			const fbo = createFrameBuffer(this, frameBuffer);
			this.frameBuffers_.insert(frameBuffer, fbo);
		}

		private freeFrameBuffer(frameBuffer: FrameBuffer) {
			const fb = this.frameBuffers_.find(frameBuffer);
			if (fb) {
				this.gl.deleteFramebuffer(fb);
				this.frameBuffers_.remove(frameBuffer);
			}
		}

		// -- Shader

		readonly shaders_ = new ReusableResourceArray<Shader, GL1ShaderData>(ResourceType.Shader);

		private allocShader(shader: Shader) {
			const gl1Shader = createShader(this, shader)!; // TODO: handle failures
			this.shaders_.insert(shader, gl1Shader);
		}

		private freeShader(shader: Shader) {
			const prog = this.shaders_.find(shader);
			if (prog) {
				prog.combinedConstants = {};
				this.gl.deleteProgram(prog.program);
				this.shaders_.remove(shader);
			}
		}

		// -- Mesh

		readonly meshes_ = new ReusableResourceArray<geometry.Geometry, GL1MeshData>(ResourceType.Mesh);

		private allocGeometry(geom: geometry.Geometry) {
			const gpuMesh = createMesh(this, geom);
			this.meshes_.insert(geom, gpuMesh);
		}

		private freeGeometry(geom: geometry.Geometry) {
			const gpuMesh = this.meshes_.find(geom);
			if (gpuMesh) {
				destroyMesh(this, gpuMesh);
				this.meshes_.remove(geom);
			}
		}
	}

} // ns sd.render.gl1
