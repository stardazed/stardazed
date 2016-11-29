// rendercontext - gl interfaces
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="../../typings/webgl-ext.d.ts"/>

namespace sd.render {

	export interface RenderContext {
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
	}


	const contextLimits = {
		maxColourAttachments: 0,
		maxDrawBuffers: 0
	};


	export function maxColourAttachments(rc: RenderContext) {
		if (contextLimits.maxColourAttachments == 0) {
			contextLimits.maxColourAttachments = rc.extDrawBuffers ? rc.gl.getParameter(rc.extDrawBuffers.MAX_COLOR_ATTACHMENTS_WEBGL) : 1;
		}

		return contextLimits.maxColourAttachments;
	}


	export function maxDrawBuffers(rc: RenderContext) {
		if (contextLimits.maxDrawBuffers == 0) {
			contextLimits.maxDrawBuffers = rc.extDrawBuffers ? rc.gl.getParameter(rc.extDrawBuffers.MAX_DRAW_BUFFERS_WEBGL) : 1;
		}

		return contextLimits.maxDrawBuffers;
	}


	export function makeShader(rc: RenderContext, type: number, sourceText: string) {
		const shader = rc.gl.createShader(type)!; // TODO: handle resource allocation failure
		rc.gl.shaderSource(shader, sourceText);
		rc.gl.compileShader(shader);

		if (! rc.gl.getShaderParameter(shader, rc.gl.COMPILE_STATUS)) {
			const errorLog = rc.gl.getShaderInfoLog(shader);
			alert(`COMPILE FAILED\n\n${errorLog}`);
			console.error("Shader compilation failed:", errorLog);
			console.error("Source", sourceText);
			assert(false, "bad shader");
		}

		return shader;
	}


	export function makeProgram(rc: RenderContext, vertexShader?: WebGLShader, fragmentShader?: WebGLShader) {
		const program = rc.gl.createProgram()!; // TODO: handle resource allocation failure
		if (vertexShader) {
			rc.gl.attachShader(program, vertexShader);
		}
		if (fragmentShader) {
			rc.gl.attachShader(program, fragmentShader);
		}
		rc.gl.linkProgram(program);

		if (! rc.gl.getProgramParameter(program, rc.gl.LINK_STATUS)) {
			const errorLog = rc.gl.getProgramInfoLog(program);
			alert(`LINK FAILED\n\n${errorLog}`);
			console.error("Program link failed:", errorLog);
			assert(false, "bad program");
		}

		return program;
	}


	export function makeRenderContext(canvas: HTMLCanvasElement): RenderContext | null {
		let gl: WebGLRenderingContext | null;

		// try and create the 3D context
		const contextAttrs: WebGLContextAttributes = {
			antialias: true
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
			return null;
		}


		// enable large indexed meshes
		const eiu = gl.getExtension("OES_element_index_uint");

		// we'd like more colour attachments
		const mdb = gl.getExtension("WEBGL_draw_buffers");

		// enable extended depth textures
		const dte = gl.getExtension("WEBGL_depth_texture") ||
					gl.getExtension("WEBKIT_WEBGL_depth_texture") ||
					gl.getExtension("MOZ_WEBGL_depth_texture");

		// (half) float textures
		const ftx = gl.getExtension("OES_texture_float");
		const ftl = gl.getExtension("OES_texture_float_linear");
		const htx = gl.getExtension("OES_texture_half_float");
		const htl = gl.getExtension("OES_texture_half_float_linear");

		// enable S3TC (desktop only)
		const s3tc = gl.getExtension("WEBGL_compressed_texture_s3tc") ||
					gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") ||
					gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");

		// enable MIN and MAX blend modes
		const bmm = gl.getExtension("EXT_blend_minmax");

		// enable texture anisotropy
		const txa = gl.getExtension("EXT_texture_filter_anisotropic") ||
					gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

		// enable Vertex Array Objects
		const vao = gl.getExtension("OES_vertex_array_object");

		// enable instanced draw calls
		const aia = gl.getExtension("ANGLE_instanced_arrays");

		// enable texture gradient calc and *Lod and *Grad texture calls in fragment shaders
		const drv = gl.getExtension("OES_standard_derivatives");
		const fsl = gl.getExtension("EXT_shader_texture_lod");

		// enable explicit setting of fragment depth
		const fgz = gl.getExtension("EXT_frag_depth");

		// enable sRGB textures and renderbuffers
		const srgb = gl.getExtension("EXT_sRGB");


		return {
			gl: gl,

			ext32bitIndexes: eiu,
			extDrawBuffers: mdb,
			extDepthTexture: dte,
			extTextureFloat: ftx,
			extTextureFloatLinear: ftl,
			extTextureHalfFloat: htx,
			extTextureHalfFloatLinear: htl,
			extS3TC: s3tc,
			extMinMax: bmm,
			extTexAnisotropy: txa,
			extVAO: vao,
			extInstancedArrays: aia,
			extDerivatives: drv,
			extFragmentLOD: fsl,
			extFragDepth: fgz,
			extSRGB: srgb
		};
	}

} // ns sd.render
