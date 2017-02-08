// typings/webgl - WebGL 1 extension definitions, WebGL 2 full definition and extensions
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

// WebGL Helper Types
type TextureImageSource = ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
type TextureImageData = ArrayBufferView | TextureImageSource;


interface HTMLCanvasElement {
	getContext(contextId: "webgl" | "experimental-webgl", contextAttributes?: WebGLContextAttributes): (WebGLRenderingContext & WebGL1Extensions) | null;
}

interface WebGL1Extensions {
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

	drawArraysInstancedANGLE(mode: number, first: number, count: number, instanceCount: number): void;
	drawElementsInstancedANGLE(mode: number, count: number, type: number, offset: number, instanceCount: number): void;
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

interface WebGLVertexArrayObjectOES extends WebGLObject {
	readonly __WebGLVertexArrayObjectOES: void;
}

interface OESVertexArrayObject {
	readonly VERTEX_ARRAY_BINDING_OES: number;

	createVertexArrayOES(): WebGLVertexArrayObjectOES | null;
	deleteVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
	isVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): boolean;
	bindVertexArrayOES(arrayObject: WebGLVertexArrayObjectOES | null): void;
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


// ------------------------------------------------------------------------
// __      __   _     ___ _      ___ 
// \ \    / /__| |__ / __| |    |_  )
//  \ \/\/ / -_) '_ \ (_ | |__   / / 
//   \_/\_/\___|_.__/\___|____| /___|
//                                   
// ------------------------------------------------------------------------

interface HTMLCanvasElement {
	getContext(contextId: "webgl2", contextAttributes?: WebGLContextAttributes): (WebGL2RenderingContext & WebGL2Extensions) | null;
}

interface WebGL2Extensions {
	getExtension(name: "EXT_color_buffer_float"): EXTColorBufferFloat;
	getExtension(name: "EXT_disjoint_timer_query"): EXTDisjointTimerQuery;
	getExtension(name: "EXT_texture_filter_anisotropic"): EXTTextureFilterAnisotropic;

	getExtension(name: "OES_texture_float_linear"): OESTextureFloatLinear;

	getExtension(name: "WEBGL_compressed_texture_atc"): WebGLCompressedTextureATC;
	getExtension(name: "WEBGL_compressed_texture_etc1"): WebGLCompressedTextureETC1;
	getExtension(name: "WEBGL_compressed_texture_pvrtc"): WebGLCompressedTexturePVRTC;
	getExtension(name: "WEBGL_compressed_texture_s3tc"): WebGLCompressedTextureS3TC;
	getExtension(name: "WEBGL_debug_renderer_info"): WebGLDebugRendererInfo;
	getExtension(name: "WEBGL_debug_shaders"): WebGLDebugShaders;
	getExtension(name: "WEBGL_lose_context"): WebGLLoseContext;

	getExtension(name: "MOZ_WEBGL_compressed_texture_s3tc"): WebGLCompressedTextureS3TC;
	getExtension(name: "MOZ_WEBGL_lose_context"): WebGLLoseContext;
}

interface EXTColorBufferFloat extends WebGLObject {
	readonly __EXTColorBufferFloat: void;
}

interface WebGLTimerQueryEXT extends WebGLObject {
	readonly __WebGLTimerQueryEXT: void;
}

interface EXTDisjointTimerQuery {
  readonly QUERY_COUNTER_BITS_EXT: number;
  readonly CURRENT_QUERY_EXT: number;
  readonly QUERY_RESULT_EXT: number;
  readonly QUERY_RESULT_AVAILABLE_EXT: number;
  readonly TIME_ELAPSED_EXT: number;
  readonly TIMESTAMP_EXT: number;
  readonly GPU_DISJOINT_EXT: number;

  createQueryEXT(): WebGLTimerQueryEXT | null;
  deleteQueryEXT(query: WebGLTimerQueryEXT | null): void;
  isQueryEXT(query: WebGLTimerQueryEXT | null): void;
  beginQueryEXT(target: number, query: WebGLTimerQueryEXT): void;
  endQueryEXT(target: number): void;
  queryCounterEXT(query: WebGLTimerQueryEXT, target: number): void;
  getQueryEXT(target: number, pname: number): any;
  getQueryObjectEXT(query: WebGLTimerQueryEXT, pname: number): any;
}


// WebGL 2 Type Branding
interface WebGLQuery extends WebGLObject { readonly __WebGLQuery: void; }
interface WebGLSampler extends WebGLObject { readonly __WebGLSampler: void; }
interface WebGLSync extends WebGLObject { readonly __WebGLSync: void; }
interface WebGLTransformFeedback extends WebGLObject { readonly __WebGLTransformFeedback: void; }
interface WebGLVertexArrayObject extends WebGLObject { readonly __WebGLVertexArrayObject: void; }


interface WebGL2RenderingContext extends WebGLRenderingContext {
	/* Buffer objects */
	// WebGL1:
    bufferData(target: number, sizeOrSource: number | ArrayBufferView | ArrayBuffer, usage: number): void;
	// WebGL2:
	bufferData(target: number, srcData: ArrayBufferView, usage: number, srcOffset: number, length?: number): void;

	// WebGL1:
    bufferSubData(target: number, dstByteOffset: number, data: ArrayBufferView | ArrayBuffer): void;
	// WebGL2:
	bufferSubData(target: number, dstByteOffset: number, data: ArrayBufferView, srcOffset: number, length?: number): void;

	copyBufferSubData(readTarget: number, writeTarget: number, readOffset: number, writeOffset: number, size: number): void;
	// MapBufferRange, in particular its read-only and write-modes: only,
	// can not be exposed safely to JavaScript. GetBufferSubData
	// replaces it for the purpose of fetching data back from the GPU.
	getBufferSubData(target: number, srcByteOffset: number, dstData: ArrayBufferView, dstOffset?: number, length?: number): void;

	/* Framebuffer objects */
	blitFramebuffer(srcX0: number, srcY0: number, srcX1: number, srcY1: number, dstX0: number, dstY0: number, dstX1: number, dstY1: number, mask: number, filter: number): void;
	framebufferTextureLayer(target: number, attachment: number, texture: WebGLTexture | null, level: number, layer: number): void;
	invalidateFramebuffer(target: number, attachments: number[]): void;
	invalidateSubFramebuffer(target: number, attachments: number[], x: number, y: number, width: number, height: number): void;
	readBuffer(src: number): void;

	/* Renderbuffer objects */
	getInternalformatParameter(target: number, internalformat: number, pname: number): any;
	renderbufferStorageMultisample(target: number, samples: number, internalformat: number, width: number, height: number): void;

	/* Texture objects */
	texStorage2D(target: number, levels: number, internalformat: number, width: number, height: number): void;
	texStorage3D(target: number, levels: number, internalformat: number, width: number, height: number, depth: number): void;

	// WebGL1 legacy entrypoints:
	texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, pixels: ArrayBufferView | null): void;
	texImage2D(target: number, level: number, internalformat: number, format: number, type: number, source: TextureImageSource); // May throw DOMException

	texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, pixels: ArrayBufferView | null): void;
	texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, format: number, type: number, source: TextureImageSource); // May throw DOMException

	// WebGL2 entrypoints:
	texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, pboOffset: number): void;
	texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, source: TextureImageSource); // May throw DOMException
	texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, srcData: ArrayBufferView, srcOffset: number): void;

	texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, pboOffset: number): void;
	texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, source: TextureImageSource); // May throw DOMException
	texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, srcData: ArrayBufferView | null): void;
	texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, srcData: ArrayBufferView, srcOffset: number): void;

	texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, pboOffset: number): void;
	texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, source: TextureImageSource); // May throw DOMException
	texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, srcData: ArrayBufferView, srcOffset: number): void;

	texSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, pboOffset: number): void;
	texSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, source: TextureImageSource); // May throw DOMException
	texSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, srcData: ArrayBufferView | null, srcOffset?: number): void;

	copyTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, x: number, y: number, width: number, height: number): void;

	compressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, offset: number): void;
	compressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;

	compressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, offset: number): void;
	compressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;

	compressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, offset: number): void;
	compressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;

	compressedTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, offset: number): void;
	compressedTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;

	/* Programs and shaders */
	getFragDataLocation(program: WebGLProgram, name: string): number;

	/* Uniforms */
	uniform1ui(location: WebGLUniformLocation, v0: number): void;
	uniform2ui(location: WebGLUniformLocation, v0: number, v1: number): void;
	uniform3ui(location: WebGLUniformLocation, v0: number, v1: number, v2: number): void;
	uniform4ui(location: WebGLUniformLocation, v0: number, v1: number, v2: number, v3: number): void;

	uniform1fv(location: WebGLUniformLocation, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniform2fv(location: WebGLUniformLocation, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniform3fv(location: WebGLUniformLocation, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniform4fv(location: WebGLUniformLocation, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;

	uniform1iv(location: WebGLUniformLocation, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniform2iv(location: WebGLUniformLocation, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniform3iv(location: WebGLUniformLocation, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniform4iv(location: WebGLUniformLocation, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;

	uniform1uiv(location: WebGLUniformLocation, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniform2uiv(location: WebGLUniformLocation, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniform3uiv(location: WebGLUniformLocation, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniform4uiv(location: WebGLUniformLocation, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;

	uniformMatrix2fv(location: WebGLUniformLocation, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniformMatrix3x2fv(location: WebGLUniformLocation, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniformMatrix4x2fv(location: WebGLUniformLocation, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;

	uniformMatrix2x3fv(location: WebGLUniformLocation, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniformMatrix3fv(location: WebGLUniformLocation, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniformMatrix4x3fv(location: WebGLUniformLocation, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;

	uniformMatrix2x4fv(location: WebGLUniformLocation, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniformMatrix3x4fv(location: WebGLUniformLocation, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;
	uniformMatrix4fv(location: WebGLUniformLocation, transpose: boolean, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;

	/* Vertex attribs */
	vertexAttribI4i(index: number, x: number, y: number, z: number, w: number): void;
	vertexAttribI4iv(index: number, values: Int32Array | number[]): void;
	vertexAttribI4ui(index: number, x: number, y: number, z: number, w: number): void;
	vertexAttribI4uiv(index: number, values: Uint32Array | number[]): void;
	vertexAttribIPointer(index: number, size: number, type: number, stride: number, offset: number): void;

	/* Writing to the drawing buffer */
	vertexAttribDivisor(index: number, divisor: number): void;
	drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void;
	drawElementsInstanced(mode: number, count: number, type: number, offset: number, instanceCount: number): void;
	drawRangeElements(mode: number, start: number, end: number, count: number, type: number, offset: number): void;

	/* Reading back pixels */
	// WebGL1:
	readPixels(x: number, y: number, width: number, height: number, format: number, type: number, dstData: ArrayBufferView | null): void;
	// WebGL2:
	readPixels(x: number, y: number, width: number, height: number, format: number, type: number, offset: number): void;
	readPixels(x: number, y: number, width: number, height: number, format: number, type: number, dstData: ArrayBufferView, dstOffset: number): void;

	/* Multiple Render Targets */
	drawBuffers(buffers: number[]): void;

	clearBufferfv(buffer: number, drawbuffer: number, values: Float32Array | number[], srcOffset?: number): void;
	clearBufferiv(buffer: number, drawbuffer: number, values: Int32Array | number[], srcOffset?: number): void;
	clearBufferuiv(buffer: number, drawbuffer: number, values: Uint32Array | number[], srcOffset?: number): void;

	clearBufferfi(buffer: number, drawbuffer: number, depth: number, stencil: number): void;

	/* Query Objects */
	createQuery(): WebGLQuery | null;
	deleteQuery(query: WebGLQuery | null): void;
	isQuery(query: WebGLQuery | null): boolean;
	beginQuery(target: number, query: WebGLQuery): void;
	endQuery(target: number): void;
	getQuery(target: number, pname: number): WebGLQuery | null;
	getQueryParameter(query: WebGLQuery, pname: number): any;

	/* Sampler Objects */
	createSampler(): WebGLSampler | null;
	deleteSampler(sampler: WebGLSampler | null): void;
	isSampler(sampler: WebGLSampler | null): boolean;
	bindSampler(unit: number, sampler: WebGLSampler | null): void;
	samplerParameteri(sampler: WebGLSampler, pname: number, param: number): void;
	samplerParameterf(sampler: WebGLSampler, pname: number, param: number): void;
	getSamplerParameter(sampler: WebGLSampler, pname: number): any;

	/* Sync objects */
	fenceSync(condition: number, flags: number): WebGLSync | null;
	isSync(sync: WebGLSync | null): boolean;
	deleteSync(sync: WebGLSync | null): void;
	clientWaitSync(sync: WebGLSync, flags: number, timeout: number): number;
	waitSync(sync: WebGLSync, flags: number, timeout: number): void;
	getSyncParameter(sync: WebGLSync, pname: number): any;

	/* Transform Feedback */
	createTransformFeedback(): WebGLTransformFeedback | null;
	deleteTransformFeedback(tf: WebGLTransformFeedback | null): void;
	isTransformFeedback(tf: WebGLTransformFeedback | null): boolean;
	bindTransformFeedback (target: number, tf: WebGLTransformFeedback | null): void;
	beginTransformFeedback(primitiveMode: number): void;
	endTransformFeedback(): void;
	transformFeedbackVaryings(program: WebGLProgram, varyings: string[], bufferMode: number): void;
	getTransformFeedbackVarying(program: WebGLProgram, index: number): WebGLActiveInfo | null;
	pauseTransformFeedback(): void;
	resumeTransformFeedback(): void;

	/* Uniform Buffer Objects and Transform Feedback Buffers */
	bindBufferBase(target: number, index: number, buffer: WebGLBuffer | null): void;
	bindBufferRange(target: number, index: number, buffer: WebGLBuffer | null, offset: number, size: number): void;
	getIndexedParameter(target: number, index: number): any;
	getUniformIndices(program: WebGLProgram, uniformNames: string[]): number[] | null;
	getActiveUniforms(program: WebGLProgram, uniformIndices: number[], pname: number): any;
	getUniformBlockIndex(program: WebGLProgram, uniformBlockName: string): number;
	getActiveUniformBlockParameter(program: WebGLProgram, uniformBlockIndex: number, pname: number): any;
	getActiveUniformBlockName(program: WebGLProgram, uniformBlockIndex: number): string | null;
	uniformBlockBinding(program: WebGLProgram, uniformBlockIndex: number, uniformBlockBinding: number): void;

	/* Vertex Array Objects */
	createVertexArray(): WebGLVertexArrayObject | null;
	deleteVertexArray(vertexArray: WebGLVertexArrayObject | null): void;
	isVertexArray(vertexArray: WebGLVertexArrayObject | null): boolean;
	bindVertexArray(array: WebGLVertexArrayObject | null): void;

	// New constants in WebGL 2
	readonly READ_BUFFER: number;
	readonly UNPACK_ROW_LENGTH: number;
	readonly UNPACK_SKIP_ROWS: number;
	readonly UNPACK_SKIP_PIXELS: number;
	readonly PACK_ROW_LENGTH: number;
	readonly PACK_SKIP_ROWS: number;
	readonly PACK_SKIP_PIXELS: number;
	readonly COLOR: number;
	readonly DEPTH: number;
	readonly STENCIL: number;
	readonly RED: number;
	readonly RGB8: number;
	readonly RGBA8: number;
	readonly RGB10_A2: number;
	readonly TEXTURE_BINDING_3D: number;
	readonly UNPACK_SKIP_IMAGES: number;
	readonly UNPACK_IMAGE_HEIGHT: number;
	readonly TEXTURE_3D: number;
	readonly TEXTURE_WRAP_R: number;
	readonly MAX_3D_TEXTURE_SIZE: number;
	readonly UNSIGNED_INT_2_10_10_10_REV: number;
	readonly MAX_ELEMENTS_VERTICES: number;
	readonly MAX_ELEMENTS_INDICES: number;
	readonly TEXTURE_MIN_LOD: number;
	readonly TEXTURE_MAX_LOD: number;
	readonly TEXTURE_BASE_LEVEL: number;
	readonly TEXTURE_MAX_LEVEL: number;
	readonly MIN: number;
	readonly MAX: number;
	readonly DEPTH_COMPONENT24: number;
	readonly MAX_TEXTURE_LOD_BIAS: number;
	readonly TEXTURE_COMPARE_MODE: number;
	readonly TEXTURE_COMPARE_FUNC: number;
	readonly CURRENT_QUERY: number;
	readonly QUERY_RESULT: number;
	readonly QUERY_RESULT_AVAILABLE: number;
	readonly STREAM_READ: number;
	readonly STREAM_COPY: number;
	readonly STATIC_READ: number;
	readonly STATIC_COPY: number;
	readonly DYNAMIC_READ: number;
	readonly DYNAMIC_COPY: number;
	readonly MAX_DRAW_BUFFERS: number;
	readonly DRAW_BUFFER0: number;
	readonly DRAW_BUFFER1: number;
	readonly DRAW_BUFFER2: number;
	readonly DRAW_BUFFER3: number;
	readonly DRAW_BUFFER4: number;
	readonly DRAW_BUFFER5: number;
	readonly DRAW_BUFFER6: number;
	readonly DRAW_BUFFER7: number;
	readonly DRAW_BUFFER8: number;
	readonly DRAW_BUFFER9: number;
	readonly DRAW_BUFFER10: number;
	readonly DRAW_BUFFER11: number;
	readonly DRAW_BUFFER12: number;
	readonly DRAW_BUFFER13: number;
	readonly DRAW_BUFFER14: number;
	readonly DRAW_BUFFER15: number;
	readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: number;
	readonly MAX_VERTEX_UNIFORM_COMPONENTS: number;
	readonly SAMPLER_3D: number;
	readonly SAMPLER_2D_SHADOW: number;
	readonly FRAGMENT_SHADER_DERIVATIVE_HINT: number;
	readonly PIXEL_PACK_BUFFER: number;
	readonly PIXEL_UNPACK_BUFFER: number;
	readonly PIXEL_PACK_BUFFER_BINDING: number;
	readonly PIXEL_UNPACK_BUFFER_BINDING: number;
	readonly FLOAT_MAT2x3: number;
	readonly FLOAT_MAT2x4: number;
	readonly FLOAT_MAT3x2: number;
	readonly FLOAT_MAT3x4: number;
	readonly FLOAT_MAT4x2: number;
	readonly FLOAT_MAT4x3: number;
	readonly SRGB: number;
	readonly SRGB8: number;
	readonly SRGB8_ALPHA8: number;
	readonly COMPARE_REF_TO_TEXTURE: number;
	readonly RGBA32F: number;
	readonly RGB32F: number;
	readonly RGBA16F: number;
	readonly RGB16F: number;
	readonly VERTEX_ATTRIB_ARRAY_INTEGER: number;
	readonly MAX_ARRAY_TEXTURE_LAYERS: number;
	readonly MIN_PROGRAM_TEXEL_OFFSET: number;
	readonly MAX_PROGRAM_TEXEL_OFFSET: number;
	readonly MAX_VARYING_COMPONENTS: number;
	readonly TEXTURE_2D_ARRAY: number;
	readonly TEXTURE_BINDING_2D_ARRAY: number;
	readonly R11F_G11F_B10F: number;
	readonly UNSIGNED_INT_10F_11F_11F_REV: number;
	readonly RGB9_E5: number;
	readonly UNSIGNED_INT_5_9_9_9_REV: number;
	readonly TRANSFORM_FEEDBACK_BUFFER_MODE: number;
	readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: number;
	readonly TRANSFORM_FEEDBACK_VARYINGS: number;
	readonly TRANSFORM_FEEDBACK_BUFFER_START: number;
	readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: number;
	readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: number;
	readonly RASTERIZER_DISCARD: number;
	readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: number;
	readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: number;
	readonly INTERLEAVED_ATTRIBS: number;
	readonly SEPARATE_ATTRIBS: number;
	readonly TRANSFORM_FEEDBACK_BUFFER: number;
	readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: number;
	readonly RGBA32UI: number;
	readonly RGB32UI: number;
	readonly RGBA16UI: number;
	readonly RGB16UI: number;
	readonly RGBA8UI: number;
	readonly RGB8UI: number;
	readonly RGBA32I: number;
	readonly RGB32I: number;
	readonly RGBA16I: number;
	readonly RGB16I: number;
	readonly RGBA8I: number;
	readonly RGB8I: number;
	readonly RED_INTEGER: number;
	readonly RGB_INTEGER: number;
	readonly RGBA_INTEGER: number;
	readonly SAMPLER_2D_ARRAY: number;
	readonly SAMPLER_2D_ARRAY_SHADOW: number;
	readonly SAMPLER_CUBE_SHADOW: number;
	readonly UNSIGNED_INT_VEC2: number;
	readonly UNSIGNED_INT_VEC3: number;
	readonly UNSIGNED_INT_VEC4: number;
	readonly INT_SAMPLER_2D: number;
	readonly INT_SAMPLER_3D: number;
	readonly INT_SAMPLER_CUBE: number;
	readonly INT_SAMPLER_2D_ARRAY: number;
	readonly UNSIGNED_INT_SAMPLER_2D: number;
	readonly UNSIGNED_INT_SAMPLER_3D: number;
	readonly UNSIGNED_INT_SAMPLER_CUBE: number;
	readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: number;
	readonly DEPTH_COMPONENT32F: number;
	readonly DEPTH32F_STENCIL8: number;
	readonly FLOAT_32_UNSIGNED_INT_24_8_REV: number;
	readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: number;
	readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: number;
	readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: number;
	readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: number;
	readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: number;
	readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: number;
	readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: number;
	readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: number;
	readonly FRAMEBUFFER_DEFAULT: number;
	readonly DEPTH_STENCIL_ATTACHMENT: number;
	readonly DEPTH_STENCIL: number;
	readonly UNSIGNED_INT_24_8: number;
	readonly DEPTH24_STENCIL8: number;
	readonly UNSIGNED_NORMALIZED: number;
	readonly DRAW_FRAMEBUFFER_BINDING: number; /* Same as FRAMEBUFFER_BINDING */
	readonly READ_FRAMEBUFFER: number;
	readonly DRAW_FRAMEBUFFER: number;
	readonly READ_FRAMEBUFFER_BINDING: number;
	readonly RENDERBUFFER_SAMPLES: number;
	readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: number;
	readonly MAX_COLOR_ATTACHMENTS: number;
	readonly COLOR_ATTACHMENT1: number;
	readonly COLOR_ATTACHMENT2: number;
	readonly COLOR_ATTACHMENT3: number;
	readonly COLOR_ATTACHMENT4: number;
	readonly COLOR_ATTACHMENT5: number;
	readonly COLOR_ATTACHMENT6: number;
	readonly COLOR_ATTACHMENT7: number;
	readonly COLOR_ATTACHMENT8: number;
	readonly COLOR_ATTACHMENT9: number;
	readonly COLOR_ATTACHMENT10: number;
	readonly COLOR_ATTACHMENT11: number;
	readonly COLOR_ATTACHMENT12: number;
	readonly COLOR_ATTACHMENT13: number;
	readonly COLOR_ATTACHMENT14: number;
	readonly COLOR_ATTACHMENT15: number;
	readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: number;
	readonly MAX_SAMPLES: number;
	readonly HALF_FLOAT: number;
	readonly RG: number;
	readonly RG_INTEGER: number;
	readonly R8: number;
	readonly RG8: number;
	readonly R16F: number;
	readonly R32F: number;
	readonly RG16F: number;
	readonly RG32F: number;
	readonly R8I: number;
	readonly R8UI: number;
	readonly R16I: number;
	readonly R16UI: number;
	readonly R32I: number;
	readonly R32UI: number;
	readonly RG8I: number;
	readonly RG8UI: number;
	readonly RG16I: number;
	readonly RG16UI: number;
	readonly RG32I: number;
	readonly RG32UI: number;
	readonly VERTEX_ARRAY_BINDING: number;
	readonly R8_SNORM: number;
	readonly RG8_SNORM: number;
	readonly RGB8_SNORM: number;
	readonly RGBA8_SNORM: number;
	readonly SIGNED_NORMALIZED: number;
	readonly COPY_READ_BUFFER: number;
	readonly COPY_WRITE_BUFFER: number;
	readonly COPY_READ_BUFFER_BINDING: number; /* Same as COPY_READ_BUFFER */
	readonly COPY_WRITE_BUFFER_BINDING: number; /* Same as COPY_WRITE_BUFFER */
	readonly UNIFORM_BUFFER: number;
	readonly UNIFORM_BUFFER_BINDING: number;
	readonly UNIFORM_BUFFER_START: number;
	readonly UNIFORM_BUFFER_SIZE: number;
	readonly MAX_VERTEX_UNIFORM_BLOCKS: number;
	readonly MAX_FRAGMENT_UNIFORM_BLOCKS: number;
	readonly MAX_COMBINED_UNIFORM_BLOCKS: number;
	readonly MAX_UNIFORM_BUFFER_BINDINGS: number;
	readonly MAX_UNIFORM_BLOCK_SIZE: number;
	readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: number;
	readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: number;
	readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: number;
	readonly ACTIVE_UNIFORM_BLOCKS: number;
	readonly UNIFORM_TYPE: number;
	readonly UNIFORM_SIZE: number;
	readonly UNIFORM_BLOCK_INDEX: number;
	readonly UNIFORM_OFFSET: number;
	readonly UNIFORM_ARRAY_STRIDE: number;
	readonly UNIFORM_MATRIX_STRIDE: number;
	readonly UNIFORM_IS_ROW_MAJOR: number;
	readonly UNIFORM_BLOCK_BINDING: number;
	readonly UNIFORM_BLOCK_DATA_SIZE: number;
	readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: number;
	readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: number;
	readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: number;
	readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: number;
	readonly INVALID_INDEX: number;
	readonly MAX_VERTEX_OUTPUT_COMPONENTS: number;
	readonly MAX_FRAGMENT_INPUT_COMPONENTS: number;
	readonly MAX_SERVER_WAIT_TIMEOUT: number;
	readonly OBJECT_TYPE: number;
	readonly SYNC_CONDITION: number;
	readonly SYNC_STATUS: number;
	readonly SYNC_FLAGS: number;
	readonly SYNC_FENCE: number;
	readonly SYNC_GPU_COMMANDS_COMPLETE: number;
	readonly UNSIGNALED: number;
	readonly SIGNALED: number;
	readonly ALREADY_SIGNALED: number;
	readonly TIMEOUT_EXPIRED: number;
	readonly CONDITION_SATISFIED: number;
	readonly WAIT_FAILED: number;
	readonly SYNC_FLUSH_COMMANDS_BIT: number;
	readonly VERTEX_ATTRIB_ARRAY_DIVISOR: number;
	readonly ANY_SAMPLES_PASSED: number;
	readonly ANY_SAMPLES_PASSED_CONSERVATIVE: number;
	readonly SAMPLER_BINDING: number;
	readonly RGB10_A2UI: number;
	readonly INT_2_10_10_10_REV: number;
	readonly TRANSFORM_FEEDBACK: number;
	readonly TRANSFORM_FEEDBACK_PAUSED: number;
	readonly TRANSFORM_FEEDBACK_ACTIVE: number;
	readonly TRANSFORM_FEEDBACK_BINDING: number;
	readonly TEXTURE_IMMUTABLE_FORMAT: number;
	readonly MAX_ELEMENT_INDEX: number;
	readonly TEXTURE_IMMUTABLE_LEVELS: number;

	readonly TIMEOUT_IGNORED: number;

	/* WebGL-specific enums */
	readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: number;
}
