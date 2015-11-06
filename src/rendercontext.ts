// rendercontext - gl interfaces
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/webgl-ext.d.ts"/>
/// <reference path="pixelformat.ts"/>

namespace sd.render {

	export interface RenderContext {
		canvas: HTMLCanvasElement;
		gl: WebGLRenderingContext;

		ext32bitIndexes: OESElementIndexUint;
		extDepthTexture: WebGLDepthTexture;
		extS3TC: WebGLCompressedTextureS3TC;
		extMinMax: EXTBlendMinMax;
		extTexAnisotropy: EXTTextureFilterAnisotropic;
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
			assert(false, "Could not initialise WebGL");
			return;
		}


		// enable large indexed meshes
		var eiu = gl.getExtension("OES_element_index_uint");

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
		gl.clearColor(0.0, 0.0, 0.3, 1.0);
		gl.enable(gl.DEPTH_TEST);

		return {
			canvas: canvas,
			gl: gl,

			ext32bitIndexes: eiu,
			extDepthTexture: dte,
			extS3TC: s3tc,
			extMinMax: bmm,
			extTexAnisotropy: txa
		};
	}

} // ns sd.render
