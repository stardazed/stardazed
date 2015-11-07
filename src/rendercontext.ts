// rendercontext - gl interfaces
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/webgl-ext.d.ts"/>
/// <reference path="pixelformat.ts"/>

namespace sd.render {

	export interface RenderContext {
		gl: WebGLRenderingContext;

		ext32bitIndexes: OESElementIndexUint;
		extDrawBuffers: WebGLDrawBuffers;
		extDepthTexture: WebGLDepthTexture;
		extS3TC: WebGLCompressedTextureS3TC;
		extMinMax: EXTBlendMinMax;
		extTexAnisotropy: EXTTextureFilterAnisotropic;
	}


	var contextLimits = {
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
	

	export function makeRenderContext(canvas: HTMLCanvasElement): RenderContext {
		var gl: WebGLRenderingContext;

		// try and create the 3D context
		try {
			gl = canvas.getContext("webgl");
			if (!gl)
				gl = canvas.getContext("experimental-webgl");
		} catch (e) {
			gl = null;
		}
		if (!gl) {
			assert(false, "WebGL context is unsupported or disabled.");
			return null;
		}


		// enable large indexed meshes
		var eiu = gl.getExtension("OES_element_index_uint");

		// we'd like more colour attachments
		var mdb = gl.getExtension("WEBGL_draw_buffers");

		// enable extended depth textures
		var dte = gl.getExtension("WEBGL_depth_texture");
		dte = dte || gl.getExtension("WEBKIT_WEBGL_depth_texture");
		dte = dte || gl.getExtension("MOZ_WEBGL_depth_texture");

		// enable S3TC (desktop only)
		var s3tc = gl.getExtension("WEBGL_compressed_texture_s3tc");
		s3tc = s3tc || gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
		s3tc = s3tc || gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");

		// enable MIN and MAX blend modes
		var bmm = gl.getExtension("EXT_blend_minmax");

		// enable texture anisotropy
		var txa = gl.getExtension("EXT_texture_filter_anisotropic");
		txa = txa || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");


		// -- FIXME: Temporary setup
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);

		return {
			gl: gl,

			ext32bitIndexes: eiu,
			extDrawBuffers: mdb,
			extDepthTexture: dte,
			extS3TC: s3tc,
			extMinMax: bmm,
			extTexAnisotropy: txa
		};
	}

} // ns sd.render
