/*
render/gl-context - WebGL 1/2 device implementation
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

import { GLState } from "./gl-state";

export class RenderDeviceWebGL {
	readonly gl: WebGLRenderingContext;
	readonly state: GLState;

	readonly extDrawBuffers: WEBGL_draw_buffers;
	readonly extVAO: OES_vertex_array_object;
	readonly extInstancedArrays: ANGLE_instanced_arrays;

	/**
	 * @throws {RangeError} if the runtime does not support minimum WebGL requirements
	 */
	constructor(canvas: HTMLCanvasElement) {
		try {
			// try and create the 3D context
			const contextAttrs: WebGLContextAttributes = {
				antialias: false,
				depth: false,
				alpha: false,
				premultipliedAlpha: false,
				failIfMajorPerformanceCaveat: true,
				powerPreference: "high-performance"
			};

			let creationError: string | undefined;

			function onContextCreationError(evt: Event) {
				creationError = (evt as WebGLContextEvent).statusMessage;
			}
			canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);

			const gl = canvas.getContext("webgl", contextAttrs);
			if (! gl) {
				throw new DOMException(creationError || "WebGL1 is not supported or is disabled.", "NotSupportedError");
			}

			// check for all required extensions, these are the commonly supported
			// subset of extensions supported by Safari, Firefox and Chrome, most of
			// these are part of core in WebGL2.
			const assertEnableExtensions = (names: string[]) => {
				for (const name of names) {
					const ext = gl.getExtension(name);
					if (! ext) {
						throw new DOMException(`WebGL1 does not support required extension: ${name}`, "NotSupportedError");
					}
				}
			};
			assertEnableExtensions([
				"ANGLE_instanced_arrays",
				"EXT_blend_minmax",
				"EXT_color_buffer_half_float",
				"EXT_frag_depth",
				"EXT_shader_texture_lod",
				"EXT_sRGB",
				"EXT_texture_filter_anisotropic",
				"OES_element_index_uint",
				"OES_standard_derivatives",
				"OES_texture_float",
				"OES_texture_float_linear",
				"OES_texture_half_float",
				"OES_texture_half_float_linear",
				"OES_vertex_array_object",
				"WEBGL_color_buffer_float",
				"WEBGL_compressed_texture_s3tc",
				"WEBGL_depth_texture",
				"WEBGL_draw_buffers"
			]);

			// a few extensions expose additional APIs that must be accessed through their resp. extension objects
			this.extDrawBuffers = gl.getExtension("WEBGL_draw_buffers")!;
			this.extVAO = gl.getExtension("OES_vertex_array_object")!;
			this.extInstancedArrays = gl.getExtension("ANGLE_instanced_arrays")!;

			// manage state changes by proxy to avoid unneeded gl state updates
			this.gl = gl;
			this.state = new GLState(gl);
		}
		catch (err) {
			if (err instanceof Error) {
				throw err;
			}
			throw new DOMException("Could not initialise WebGL1 context..", "UnknownError");
		}
	}
}
