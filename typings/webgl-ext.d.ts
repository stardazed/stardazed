// typings/webgl-ext - WebGL 1 extension definitions
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

interface WebGLRenderingContext {
	getExtension(name: "ANGLE_instanced_arrays"): ANGLEInstancedArrays;

	getExtension(name: "EXT_blend_minmax"): EXTBlendMinMax;
	getExtension(name: "EXT_color_buffer_half_float"): EXTColorBufferHalfFloat;
	getExtension(name: "EXT_frag_depth"): EXTFragDepth;
	getExtension(name: "EXT_sRGB"): EXTsRGB;
	getExtension(name: "EXT_shader_texture_lod"): EXTShaderTextureLOD;
	getExtension(name: "EXT_texture_filter_anisotropic"): EXTTextureFilterAnisotropic;

	getExtension(name: "OES_element_index_uint"): OESElementIndexUint;
	getExtension(name: "OES_standard_derivatives"): OESStandardDerivatives;
	getExtension(name: "OES_texture_float"): OESTextureFloat;
	getExtension(name: "OES_texture_float_linear"): OESTextureFloatLinear;
	getExtension(name: "OES_texture_half_float"): OESTextureHalfFloat;
	getExtension(name: "OES_texture_half_float_linear"): OESTextureHalfFloatLinear;
	getExtension(name: "OES_vertex_array_object"): OESVertexArrayObject;

	getExtension(name: "WEBGL_color_buffer_float"): WebGLColorBufferFloat;
	getExtension(name: "WEBGL_compressed_texture_atc"): WebGLCompressedTextureATC;
	getExtension(name: "WEBGL_compressed_texture_etc1"): WebGLCompressedTextureETC1;
	getExtension(name: "WEBGL_compressed_texture_pvrtc"): WebGLCompressedTexturePVRTC;
	getExtension(name: "WEBGL_compressed_texture_s3tc"): WebGLCompressedTextureS3TC;
	getExtension(name: "WEBGL_debug_renderer_info"): WebGLDebugRendererInfo;
	getExtension(name: "WEBGL_debug_shaders"): WebGLDebugShaders;
	getExtension(name: "WEBGL_depth_texture"): WebGLDepthTexture;
	getExtension(name: "WEBGL_draw_buffers"): WebGLDrawBuffers;
	getExtension(name: "WEBGL_lose_context"): WebGLLoseContext;

	// Prefixed versions appearing in the wild as per September 2015

	getExtension(name: "WEBKIT_EXT_texture_filter_anisotropic"): EXTTextureFilterAnisotropic;
	getExtension(name: "WEBKIT_WEBGL_compressed_texture_atc"): WebGLCompressedTextureATC;
	getExtension(name: "WEBKIT_WEBGL_compressed_texture_pvrtc"): WebGLCompressedTexturePVRTC;
	getExtension(name: "WEBKIT_WEBGL_compressed_texture_s3tc"): WebGLCompressedTextureS3TC;
	getExtension(name: "WEBKIT_WEBGL_depth_texture"): WebGLDepthTexture;
	getExtension(name: "WEBKIT_WEBGL_lose_context"): WebGLLoseContext;

	getExtension(name: "MOZ_WEBGL_compressed_texture_s3tc"): WebGLCompressedTextureS3TC;
	getExtension(name: "MOZ_WEBGL_depth_texture"): WebGLDepthTexture;
	getExtension(name: "MOZ_WEBGL_lose_context"): WebGLLoseContext;
}


// WebGL 1 Type Branding
interface WebGLObject { readonly __WebGLObject: void; }
interface WebGLBuffer { readonly __WebGLBuffer: void; }
interface WebGLFramebuffer { readonly __WebGLFramebuffer: void; }
interface WebGLProgram { readonly __WebGLProgram: void; }
interface WebGLRenderbuffer { readonly __WebGLRenderbuffer: void; }
interface WebGLShader { readonly __WebGLShader: void; }
interface WebGLTexture { readonly __WebGLTexture: void; }
interface WebGLUniformLocation { readonly __WebGLUniformLocation: void; }

// WebGL 1 Extensions
interface ANGLEInstancedArrays {
	readonly VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: number;

	drawArraysInstancedANGLE(mode: number, first: number, count: number, primcount: number): void;
	drawElementsInstancedANGLE(mode: number, count: number, type: number, offset: number, primcount: number): void;
	vertexAttribDivisorANGLE(index: number, divisor: number): void;
}

interface EXTBlendMinMax {
	readonly MIN_EXT: number;
	readonly MAX_EXT: number;
}

interface EXTColorBufferHalfFloat {
	readonly RGBA16F_EXT: number;
	readonly RGB16F_EXT: number;
	readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: number;
	readonly UNSIGNED_NORMALIZED_EXT: number;
}

interface EXTFragDepth {
	readonly __EXTFragDepth: void;
}

interface EXTsRGB {
	readonly SRGB_EXT: number;
	readonly SRGB_ALPHA_EXT: number;
	readonly SRGB8_ALPHA8_EXT: number;
	readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT: number;
}

interface EXTShaderTextureLOD {
	readonly __EXTShaderTextureLOD: void;
}

interface EXTTextureFilterAnisotropic {
	readonly TEXTURE_MAX_ANISOTROPY_EXT: number;
	readonly MAX_TEXTURE_MAX_ANISOTROPY_EXT: number;
}

interface OESElementIndexUint {
	readonly __OESElementIndexUint: void;
}

interface OESStandardDerivatives {
	readonly FRAGMENT_SHADER_DERIVATIVE_HINT_OES: number;
}

interface OESTextureFloat {
	readonly __OESTextureFloat: void;
}

interface OESTextureFloatLinear {
	readonly __OESTextureFloatLinear: void;
}

interface OESTextureHalfFloat {
	readonly HALF_FLOAT_OES: number;
}

interface OESTextureHalfFloatLinear {
	readonly __OESTextureHalfFloatLinear: void;
}

interface WebGLVertexArrayObject extends WebGLObject { // defined without OES suffix for compat with WebGL2
	readonly __WebGLVertexArrayObject: void;
}

interface OESVertexArrayObject {
	readonly VERTEX_ARRAY_BINDING_OES: number;

	createVertexArrayOES(): WebGLVertexArrayObject | null;
	deleteVertexArrayOES(arrayObject: WebGLVertexArrayObject): void;
	isVertexArrayOES(arrayObject: WebGLVertexArrayObject): boolean;
	bindVertexArrayOES(arrayObject: WebGLVertexArrayObject | null): void;
}

interface WebGLColorBufferFloat {
	readonly RGBA32F_EXT: number;
	readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: number;
	readonly UNSIGNED_NORMALIZED_EXT: number;
}

interface WebGLCompressedTextureATC {
	readonly COMPRESSED_RGB_ATC_WEBGL: number;
	readonly COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL: number;
	readonly COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL: number;
}

interface WebGLCompressedTextureETC1 {
	readonly COMPRESSED_RGB_ETC1_WEBGL: number;
}

interface WebGLCompressedTexturePVRTC {
	readonly COMPRESSED_RGB_PVRTC_4BPPV1_IMG: number;
	readonly COMPRESSED_RGB_PVRTC_2BPPV1_IMG: number;
	readonly COMPRESSED_RGBA_PVRTC_4BPPV1_IMG: number;
	readonly COMPRESSED_RGBA_PVRTC_2BPPV1_IMG: number;
}

interface WebGLCompressedTextureS3TC {
	readonly COMPRESSED_RGB_S3TC_DXT1_EXT: number;
	readonly COMPRESSED_RGBA_S3TC_DXT1_EXT: number;
	readonly COMPRESSED_RGBA_S3TC_DXT3_EXT: number;
	readonly COMPRESSED_RGBA_S3TC_DXT5_EXT: number;
}

interface WebGLDebugRendererInfo {
	readonly UNMASKED_VENDOR_WEBGL: number;
	readonly UNMASKED_RENDERER_WEBGL: number;
}

interface WebGLDebugShaders {
	getTranslatedShaderSource(shader: WebGLShader): string;
}

interface WebGLDepthTexture {
	readonly UNSIGNED_INT_24_8_WEBGL: number;
}

interface WebGLDrawBuffers {
	readonly COLOR_ATTACHMENT0_WEBGL: number;
	readonly COLOR_ATTACHMENT1_WEBGL: number;
	readonly COLOR_ATTACHMENT2_WEBGL: number;
	readonly COLOR_ATTACHMENT3_WEBGL: number;
	readonly COLOR_ATTACHMENT4_WEBGL: number;
	readonly COLOR_ATTACHMENT5_WEBGL: number;
	readonly COLOR_ATTACHMENT6_WEBGL: number;
	readonly COLOR_ATTACHMENT7_WEBGL: number;
	readonly COLOR_ATTACHMENT8_WEBGL: number;
	readonly COLOR_ATTACHMENT9_WEBGL: number;
	readonly COLOR_ATTACHMENT10_WEBGL: number;
	readonly COLOR_ATTACHMENT11_WEBGL: number;
	readonly COLOR_ATTACHMENT12_WEBGL: number;
	readonly COLOR_ATTACHMENT13_WEBGL: number;
	readonly COLOR_ATTACHMENT14_WEBGL: number;
	readonly COLOR_ATTACHMENT15_WEBGL: number;

	readonly DRAW_BUFFER0_WEBGL: number;
	readonly DRAW_BUFFER1_WEBGL: number;
	readonly DRAW_BUFFER2_WEBGL: number;
	readonly DRAW_BUFFER3_WEBGL: number;
	readonly DRAW_BUFFER4_WEBGL: number;
	readonly DRAW_BUFFER5_WEBGL: number;
	readonly DRAW_BUFFER6_WEBGL: number;
	readonly DRAW_BUFFER7_WEBGL: number;
	readonly DRAW_BUFFER8_WEBGL: number;
	readonly DRAW_BUFFER9_WEBGL: number;
	readonly DRAW_BUFFER10_WEBGL: number;
	readonly DRAW_BUFFER11_WEBGL: number;
	readonly DRAW_BUFFER12_WEBGL: number;
	readonly DRAW_BUFFER13_WEBGL: number;
	readonly DRAW_BUFFER14_WEBGL: number;
	readonly DRAW_BUFFER15_WEBGL: number;

	readonly MAX_COLOR_ATTACHMENTS_WEBGL: number;
	readonly MAX_DRAW_BUFFERS_WEBGL: number;

	drawBuffersWEBGL(buffers: number[]): void;
}

interface WebGLLoseContext {
	loseContext(): void;
	restoreContext(): void;
}
