// render/gl1/device - WebGL1 implementation of RenderDevice
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../../../typings/webgl.d.ts"/>

namespace sd.render.gl1 {

	function glTypeForIndexElementType(rd: GL1RenderDevice, iet: meshdata.IndexElementType): number {
		switch (iet) {
			case meshdata.IndexElementType.UInt8: return rd.gl.UNSIGNED_BYTE;
			case meshdata.IndexElementType.UInt16: return rd.gl.UNSIGNED_SHORT;
			case meshdata.IndexElementType.UInt32:
				return rd.ext32bitIndexes ? rd.gl.UNSIGNED_INT : rd.gl.NONE;

			default:
				assert(false, "Invalid IndexElementType");
				return rd.gl.NONE;
		}
	}

	function glTypeForVertexField(rd: GL1RenderDevice, vf: meshdata.VertexField) {
		switch (vf) {
			case meshdata.VertexField.Float:
			case meshdata.VertexField.Floatx2:
			case meshdata.VertexField.Floatx3:
			case meshdata.VertexField.Floatx4:
				return rd.gl.FLOAT;

			case meshdata.VertexField.UInt32:
			case meshdata.VertexField.UInt32x2:
			case meshdata.VertexField.UInt32x3:
			case meshdata.VertexField.UInt32x4:
				return rd.gl.UNSIGNED_INT;

			case meshdata.VertexField.SInt32:
			case meshdata.VertexField.SInt32x2:
			case meshdata.VertexField.SInt32x3:
			case meshdata.VertexField.SInt32x4:
				return rd.gl.INT;

			case meshdata.VertexField.UInt16x2:
			case meshdata.VertexField.Norm_UInt16x2:
			case meshdata.VertexField.UInt16x3:
			case meshdata.VertexField.Norm_UInt16x3:
			case meshdata.VertexField.UInt16x4:
			case meshdata.VertexField.Norm_UInt16x4:
				return rd.gl.UNSIGNED_SHORT;

			case meshdata.VertexField.SInt16x2:
			case meshdata.VertexField.Norm_SInt16x2:
			case meshdata.VertexField.SInt16x3:
			case meshdata.VertexField.Norm_SInt16x3:
			case meshdata.VertexField.SInt16x4:
			case meshdata.VertexField.Norm_SInt16x4:
				return rd.gl.SHORT;

			case meshdata.VertexField.UInt8x2:
			case meshdata.VertexField.Norm_UInt8x2:
			case meshdata.VertexField.UInt8x3:
			case meshdata.VertexField.Norm_UInt8x3:
			case meshdata.VertexField.UInt8x4:
			case meshdata.VertexField.Norm_UInt8x4:
				return rd.gl.UNSIGNED_BYTE;

			case meshdata.VertexField.SInt8x2:
			case meshdata.VertexField.Norm_SInt8x2:
			case meshdata.VertexField.SInt8x3:
			case meshdata.VertexField.Norm_SInt8x3:
			case meshdata.VertexField.SInt8x4:
			case meshdata.VertexField.Norm_SInt8x4:
				return rd.gl.BYTE;

			default:
				assert(false, "Invalid mesh.VertexField");
				return rd.gl.NONE;
		}
	}

	const rr2mr: { [rr: string]: meshdata.VertexAttributeRole } = {
		"position": meshdata.VertexAttributeRole.Position,
		"normal": meshdata.VertexAttributeRole.Normal,
		"tangent": meshdata.VertexAttributeRole.Tangent,
		"colour": meshdata.VertexAttributeRole.Colour,
		"material": meshdata.VertexAttributeRole.Material,
		"uv0": meshdata.VertexAttributeRole.UV0,
		"uv1": meshdata.VertexAttributeRole.UV1,
		"uv2": meshdata.VertexAttributeRole.UV2,
		"uv3": meshdata.VertexAttributeRole.UV3,
		"weightedPos0": meshdata.VertexAttributeRole.WeightedPos0,
		"weightedPos1": meshdata.VertexAttributeRole.WeightedPos1,
		"weightedPos2": meshdata.VertexAttributeRole.WeightedPos2,
		"weightedPos3": meshdata.VertexAttributeRole.WeightedPos3,
		"jointIndexes": meshdata.VertexAttributeRole.JointIndexes
	};


	function encodeResourceHandle(type: ResourceType, index: number) {
		return (type << 24) | index;
	}

	function decodeResourceHandle(handle: number) {
		const index = handle & 0x00FFFFFF;
		const type = (handle >> 24) as ResourceType;
		return { type, index };
	}

	class ReusableResourceArray<C extends RenderResourceBase, R> {
		readonly resources: (R | undefined)[] = [];
		private freedIndexes_: number[] = [];
		private nextIndex_ = 0;

		constructor(public readonly resourceType: ResourceType) {}

		insert(clientResource: C, resource: R) {
			let index: number;
			if (this.freedIndexes_.length) {
				index = this.freedIndexes_.pop()!;
			}
			else {
				index = this.nextIndex_;
				this.nextIndex_ += 1;
			}

			this.resources[index] = resource;
			clientResource.renderResourceHandle = encodeResourceHandle(this.resourceType, index);
			return index;
		}

		find(clientResource: C): R | undefined {
			const handle = clientResource.renderResourceHandle;
			if (! handle) {
				return;
			}
			const { index } = decodeResourceHandle(handle);
			return this.resources[index];
		}

		remove(clientResource: C) {
			const { index } = decodeResourceHandle(clientResource.renderResourceHandle!);
			clientResource.renderResourceHandle = 0;

			this.resources[index] = undefined;
			this.freedIndexes_.push(index);
			return index;
		}
	}

	// ----

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


		generateStandardShader(options: StandardShaderOptions) {
			return makeStandardShader(options);
		}


		// TEMPORARY
		render(proj: Float4x4, view: Float4x4, mesh: meshdata.MeshData, shader: Shader) {
			const gl = this.gl;
			let vao = (mesh as any).vao as WebGLVertexArrayObjectOES | undefined;
			if (! vao) {
				vao = this.extVAO.createVertexArrayOES()!;
				(mesh as any).vao = vao;
				this.extVAO.bindVertexArrayOES(vao);

				const lay = mesh.layout.layouts[0];
				const vb = this.vertexStreams_.find(mesh.vertexBuffers[0])!;
				const ib = this.indexStreams_.find(mesh.indexBuffer!)!;

				gl.bindBuffer(gl.ARRAY_BUFFER, vb);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);

				for (const f of shader.vertexFunction.in) {
					const va = lay.attrByRole(rr2mr[f.role]);
					if (va) {
						const elementCount = meshdata.vertexFieldElementCount(va.field);
						const normalized = meshdata.vertexFieldIsNormalized(va.field);
						const glElementType = glTypeForVertexField(this, va.field);

						gl.enableVertexAttribArray(f.index);
						gl.vertexAttribPointer(f.index, elementCount, glElementType, normalized, lay.stride, va.offset);
					}
				}
			}
			else {
				this.extVAO.bindVertexArrayOES(vao);
			}

			const prog = this.shaders_.find(shader)!;
			gl.useProgram(prog);
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			const mvp = mat4.multiply(new Float32Array(16), proj, view);
			const mvpU = gl.getUniformLocation(prog, shader.vertexFunction.constantBlocks![0].constants[0].name)!;
			gl.uniformMatrix4fv(mvpU, false, mvp);

			const sub = mesh.subMeshes[0];
			gl.drawElements(gl.TRIANGLES, sub.elementCount, glTypeForIndexElementType(this, mesh.indexBuffer!.indexElementType), 0);

			this.extVAO.bindVertexArrayOES(null);
		}
		// TEMPORARY


		dispatch(_rcb: RenderCommandBuffer | RenderCommandBuffer[]) {
		}

		dispatchResource(rrcb: RenderResourceCommandBuffer | RenderResourceCommandBuffer[]) {
			if (! Array.isArray(rrcb)) {
				rrcb = [rrcb];
			}
			for (const cb of rrcb) {
				for (const resource of cb.freeList) {
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
						case ResourceType.Shader:
							this.freeShader(resource as Shader);
							break;
						case ResourceType.VertexLayout:
							this.freeVertexLayout(resource as meshdata.VertexLayout);
							break;
						case ResourceType.VertexStream:
							this.freeVertexStream(resource as meshdata.VertexBuffer);
							break;
						case ResourceType.IndexStream:
							this.freeIndexStream(resource as meshdata.IndexBuffer);
							break;
						case ResourceType.Mesh:
							this.freeMesh(resource as meshdata.MeshData);
							break;
						default:
							break;
					}
				}

				for (const resource of cb.allocList) {
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
						case ResourceType.Shader:
							this.allocShader(resource as Shader);
							break;
						case ResourceType.VertexLayout:
							this.allocVertexLayout(resource as meshdata.VertexLayout);
							break;
						case ResourceType.VertexStream:
							this.allocVertexStream(resource as meshdata.VertexBuffer);
							break;
						case ResourceType.IndexStream:
							this.allocIndexStream(resource as meshdata.IndexBuffer);
							break;
						case ResourceType.Mesh:
							this.allocMesh(resource as meshdata.MeshData);
							break;
						default:
							break;
					}
				}
			}
		}

		// -- Sampler

		private samplers_ = new ReusableResourceArray<Sampler, Sampler>(ResourceType.Sampler);

		private allocSampler(sampler: Sampler) {
			this.samplers_.insert(sampler, sampler);
		}

		private freeSampler(sampler: Sampler) {
			this.samplers_.remove(sampler);
		}

		// -- Texture

		private textures_ = new ReusableResourceArray<Texture, WebGLTexture>(ResourceType.Texture);
		private linkedSamplers_: number[] = [];

		private allocTexture(texture: Texture) {
			const glTex = gl1CreateTexture(this, texture); // TODO: handle allocation failure
			const index = this.textures_.insert(texture, glTex);
			this.linkedSamplers_[index] = 0;
		}

		private freeTexture(texture: Texture) {
			const index = this.textures_.remove(texture);
			this.linkedSamplers_[index] = 0;
		}

		// -- Shader

		private shaders_ = new ReusableResourceArray<Shader, WebGLProgram>(ResourceType.Shader);

		private allocShader(shader: Shader) {
			const gl1Prog = makeProgram(this, shader)!; // TODO: handle failures
			this.shaders_.insert(shader, gl1Prog);
		}

		private freeShader(shader: Shader) {
			this.shaders_.remove(shader);
		}

		// -- VertexLayout

		private vertexLayouts_ = new ReusableResourceArray<meshdata.VertexLayout, meshdata.VertexLayout>(ResourceType.VertexLayout);

		private allocVertexLayout(layout: meshdata.VertexLayout) {
			this.vertexLayouts_.insert(layout, layout);
		}

		private freeVertexLayout(layout: meshdata.VertexLayout) {
			this.vertexLayouts_.remove(layout);
		}

		// -- VertexStream

		private vertexStreams_ = new ReusableResourceArray<meshdata.VertexBuffer, WebGLBuffer>(ResourceType.VertexStream);

		private allocVertexStream(buffer: meshdata.VertexBuffer) {
			const gl = this.gl;
			const stream = gl.createBuffer()!; // TODO: handle allocation failure
			gl.bindBuffer(gl.ARRAY_BUFFER, stream);
			gl.bufferData(gl.ARRAY_BUFFER, buffer.storage, gl.STATIC_DRAW);
			this.vertexStreams_.insert(buffer, stream);
		}

		private freeVertexStream(buffer: meshdata.VertexBuffer) {
			this.vertexStreams_.remove(buffer);
		}

		// -- IndexStream

		private indexStreams_ = new ReusableResourceArray<meshdata.IndexBuffer, WebGLBuffer>(ResourceType.IndexStream);

		private allocIndexStream(buffer: meshdata.IndexBuffer) {
			const gl = this.gl;
			const stream = gl.createBuffer()!; // TODO: handle allocation failure
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stream);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer.storage, gl.STATIC_DRAW);
			this.indexStreams_.insert(buffer, stream);
		}

		private freeIndexStream(buffer: meshdata.IndexBuffer) {
			this.indexStreams_.remove(buffer);
		}

		// -- Mesh

		private meshes_ = new ReusableResourceArray<meshdata.MeshData, WeakMap<Shader, WebGLVertexArrayObjectOES>>(ResourceType.Mesh);

		private allocMesh(mesh: meshdata.MeshData) {
			const vaoMap = new WeakMap<Shader, WebGLVertexArrayObjectOES>();
			this.meshes_.insert(mesh, vaoMap);
		}

		private freeMesh(mesh: meshdata.MeshData) {
			this.meshes_.remove(mesh);
		}
	}

} // ns sd.render.gl1
