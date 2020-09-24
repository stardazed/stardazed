/*
Global WebGPU types
Part of Stardazed
(c) 2020-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

// numeric type aliases
/** Unsigned 32-bit integer */
type GPUBufferDynamicOffset = number;
/** Unsigned 64-bit integer */
type GPUFenceValue = number; // use/allow bigint?
/** Unsigned 32-bit integer */
type GPUStencilValue = number;
/** Unsigned 32-bit integer */
type GPUSampleMask = number;
/** Signed 32-bit integer */
type GPUDepthBias = number;

/** Unsigned 64-bit integer */
type GPUSize64 = number; // use/allow bigint?
/** Unsigned 32-bit integer */
type GPUIntegerCoordinate = number;
/** Unsigned 32-bit integer */
type GPUIndex32 = number;
/** Unsigned 32-bit integer */
type GPUSize32 = number;
/** Signed 32-bit integer */
type GPUSignedOffset32 = number;


interface GPUObjectDescriptorBase {
	label?: string;
}

interface GPUObjectBase {
	label?: string;
}

type GPUColor = number[] | {
	r: number;
	g: number;
	b: number;
	a: number;
};

type GPUOrigin2D = GPUIntegerCoordinate[] | {
	x?: GPUIntegerCoordinate;
	y?: GPUIntegerCoordinate;
};

type GPUOrigin3D = GPUIntegerCoordinate[] | {
	x?: GPUIntegerCoordinate;
	y?: GPUIntegerCoordinate;
	z?: GPUIntegerCoordinate;
};

type GPUExtent3D = GPUIntegerCoordinate[] | {
	width: GPUIntegerCoordinate;
	height: GPUIntegerCoordinate;
	depth: GPUIntegerCoordinate;
};

type GPUTextureFormat =
	// 8-bit formats
	"r8unorm" |
	"r8snorm" |
	"r8uint" |
	"r8sint" |
	// 16-bit formats
	"r16uint" |
	"r16sint" |
	"r16float" |
	"rg8unorm" |
	"rg8snorm" |
	"rg8uint" |
	"rg8sint" |
	// 32-bit formats
	"r32uint" |
	"r32sint" |
	"r32float" |
	"rg16uint" |
	"rg16sint" |
	"rg16float" |
	"rgba8unorm" |
	"rgba8unorm-srgb" |
	"rgba8snorm" |
	"rgba8uint" |
	"rgba8sint" |
	"bgra8unorm" |
	"bgra8unorm-srgb" |
	// Packed 32-bit formats
	"rgb9e5ufloat" |
	"rgb10a2unorm" |
	"rg11b10ufloat" |
	// 64-bit formats
	"rg32uint" |
	"rg32sint" |
	"rg32float" |
	"rgba16uint" |
	"rgba16sint" |
	"rgba16float" |
	// 128-bit formats
	"rgba32uint" |
	"rgba32sint" |
	"rgba32float" |
	// Depth and stencil formats
	"stencil8" |
	"depth16unorm" |
	"depth24plus" |
	"depth24plus-stencil8" |
	"depth32float" |
	// BC compressed formats usable if "texture-compression-bc" is both
    // supported by the device/user agent and enabled in createDevice.
	"bc1-rgba-unorm" |
	"bc1-rgba-unorm-srgb" |
	"bc2-rgba-unorm" |
	"bc2-rgba-unorm-srgb" |
	"bc3-rgba-unorm" |
	"bc3-rgba-unorm-srgb" |
	"bc4-r-unorm" |
	"bc4-r-snorm" |
	"bc5-rg-unorm" |
	"bc5-rg-snorm" |
	"bc6h-rgb-ufloat" |
	"bc6h-rgb-float" |
	"bc7-rgba-unorm" |
	"bc7-rgba-unorm-srgb" |

	/** requires "depth24unorm-stencil8" extension */
	"depth24unorm-stencil8" |

	/** requires "depth32float-stencil8" extension */
	"depth32float-stencil8";

declare const enum GPUBufferUsageFlags {
	MAP_READ = 0x0001,
	MAP_WRITE = 0x0002,
	COPY_SRC = 0x0004,
	COPY_DST = 0x0008,
	INDEX = 0x0010,
	VERTEX = 0x0020,
	UNIFORM = 0x0040,
	STORAGE = 0x0080,
	INDIRECT = 0x0100,
	QUERY_RESOLVE = 0x0200
}

interface GPUBufferDescriptor extends GPUObjectDescriptorBase {
	size: GPUSize64;
	usage: GPUBufferUsageFlags;
	mappedAtCreation?: boolean;
}

declare const enum GPUMapModeFlags {
	READ  = 0x0001,
	WRITE = 0x0002
}

interface GPUBuffer extends GPUObjectBase {
	mapAsync(mode: GPUMapModeFlags, offset?: GPUSize64, size?: GPUSize64): Promise<void>;
	getMappedRange(offset?: GPUSize64, size?: GPUSize64): ArrayBuffer;

	unmap(): void;
	destroy(): void;
}


type GPUTextureDimension = "1d" | "2d" | "3d";

declare const enum GPUTextureUsageFlags {
	COPY_SRC = 0x01,
	COPY_DST = 0x02,
	SAMPLED = 0x04,
	STORAGE = 0x08,
	OUTPUT_ATTACHMENT = 0x10,
}

interface GPUTextureDescriptor extends GPUObjectDescriptorBase {
	size: GPUExtent3D;
	mipLevelCount?: GPUIntegerCoordinate;
	sampleCount?: GPUSize32;
	dimension?: GPUTextureDimension;
	format: GPUTextureFormat;
	usage: GPUTextureUsageFlags;
}

interface GPUTexture extends GPUObjectBase {
	createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
	destroy(): void;
}


type GPUTextureAspect = "all" | "stencil-only" | "depth-only";

type GPUTextureViewDimension = "1d" | "2d" | "2d-array" | "cube" | "cube-array" | "3d";

interface GPUTextureViewDescriptor extends GPUObjectDescriptorBase {
	format?: GPUTextureFormat;
	dimension?: GPUTextureViewDimension;
	aspect?: GPUTextureAspect;
	baseMipLevel?: GPUIntegerCoordinate;
	mipLevelCount?: GPUIntegerCoordinate;
	baseArrayLayer?: GPUIntegerCoordinate;
	arrayLayerCount?: GPUIntegerCoordinate;
}

interface GPUTextureView extends GPUObjectBase {
	// no properties, added branding field for TS disambiguation
	readonly __WEBGPU_TEXTUREVIEW__?: never;
}


type GPUAddressMode = "clamp-to-edge" | "repeat" | "mirror-repeat";

type GPUFilterMode = "nearest" | "linear";

type GPUCompareFunction = "never" | "less" | "equal" | "less-equal" | "greater" | "not-equal" | "greater-equal" | "always";

interface GPUSamplerDescriptor extends GPUObjectDescriptorBase {
	addressModeU?: GPUAddressMode;
	addressModeV?: GPUAddressMode;
	addressModeW?: GPUAddressMode;
	magFilter?: GPUFilterMode;
	minFilter?: GPUFilterMode;
	mipmapFilter?: GPUFilterMode;
	lodMinClamp?: number;
	lodMaxClamp?: number;
	compare?: GPUCompareFunction;
	maxAnisotropy?: number;
}

interface GPUSampler extends GPUObjectBase {
	// no properties, added branding field for TS disambiguation
	readonly __WEBGPU_SAMPLER__?: never;
}


type GPUTextureComponentType =
	"float" |
	"sint" |
	"uint" |
	/** texture is used with comparison sampling only */
	"depth-comparison";

declare const enum GPUShaderStageFlags {
	VERTEX = 0x1,
	FRAGMENT = 0x2,
	COMPUTE = 0x4
}

type GPUBindingType =
	"uniform-buffer" |
	"storage-buffer" |
	"readonly-storage-buffer" |
	"sampler" |
	"comparison-sampler" |
	"sampled-texture" |
	"multisampled-texture" |
	"readonly-storage-texture" |
	"writeonly-storage-texture";

interface GPUBindGroupLayoutEntry {
	binding: GPUIndex32;
	visibility: GPUShaderStageFlags;
	type: GPUBindingType;

	// Used for uniform buffer and storage buffer bindings.
	hasDynamicOffset?: boolean;
	minBufferBindingSize?: GPUSize64;

	// Used for sampled texture and storage texture bindings.
	viewDimension?: GPUTextureDimension;

	// Used for sampled texture bindings.
	textureComponentType?: GPUTextureComponentType;

	// Used for storage texture bindings.
	storageTextureFormat?: GPUTextureFormat;
}

interface GPUBindGroupLayoutDescriptor extends GPUObjectDescriptorBase {
	entries: GPUBindGroupLayoutEntry[];
}

interface GPUBindGroupLayout extends GPUObjectBase {
	// no properties, added branding field for TS disambiguation
	readonly __WEBGPU_BINDGROUPLAYOUT__?: never;
}


interface GPUBufferBinding {
	buffer: GPUBuffer;
	offset?: GPUSize64;
	size?: GPUSize64;
}

type GPUBindingResource = GPUSampler | GPUTextureView | GPUBufferBinding;

interface GPUBindGroupEntry {
	binding: GPUIndex32;
	resource: GPUBindingResource;
}

interface GPUBindGroupDescriptor extends GPUObjectDescriptorBase {
	layout: GPUBindGroupLayout;
	entries: GPUBindGroupEntry[];
}

interface GPUBindGroup extends GPUObjectBase {
	// no properties, added branding field for TS disambiguation
	readonly __WEBGPU_BINDGROUP__?: never;
}


interface GPUPipelineLayoutDescriptor extends GPUObjectDescriptorBase {
	bindGroupLayouts: GPUBindGroupLayout[];
}

interface GPUPipelineLayout extends GPUObjectBase {
	// no properties, added branding field for TS disambiguation
	readonly __WEBGPU_PIPELINELAYOUT__?: never;
}


interface GPUShaderModuleDescriptor extends GPUObjectDescriptorBase {
	code: string;
	sourceMap?: object;
}

type GPUCompilationMessageType =
	"error" |
	"warning" |
	"info";

interface GPUCompilationMessage {
	readonly message: string;
	readonly type: GPUCompilationMessageType;
	readonly lineNum: number;
	readonly linePos: number;
}

interface GPUCompilationInfo {
	readonly messages: ReadonlyArray<GPUCompilationMessage>;
}

interface GPUShaderModule extends GPUObjectBase {
	compilationInfo(): Promise<GPUCompilationInfo>;
}


interface GPUPipelineDescriptorBase extends GPUObjectDescriptorBase {
	layout?: GPUPipelineLayout;
}

interface GPUPipelineBase {
	getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUProgrammableStageDescriptor {
	module: GPUShaderModule;
	entryPoint: string;
}


interface GPUComputePipelineDescriptor extends GPUPipelineDescriptorBase {
	computeStage: GPUProgrammableStageDescriptor;
}

interface GPUComputePipeline extends GPUObjectBase, GPUPipelineBase {
	// no properties, added branding field for TS disambiguation
	readonly __WEBGPU_COMPUTEPIPELINE__?: never;
}


type GPUBlendOperation = "add" | "subtract" | "reverse-subtract" | "min" | "max";

type GPUBlendFactor =
	"zero" |
	"one" |
	"src-color" |
	"one-minus-src-color" |
	"src-alpha" |
	"one-minus-src-alpha" |
	"dst-color" |
	"one-minus-dst-color" |
	"dst-alpha" |
	"one-minus-dst-alpha" |
	"src-alpha-saturated" |
	"blend-color" |
	"one-minus-blend-color";

interface GPUBlendDescriptor {
	srcFactor?: GPUBlendFactor;
	dstFactor?: GPUBlendFactor;
	operation?: GPUBlendOperation;
}

declare const enum GPUColorWriteFlags {
	RED = 0x1,
	GREEN = 0x2,
	BLUE = 0x4,
	ALPHA = 0x8,
	ALL = 0xF,
}

interface GPUColorStateDescriptor {
	format: GPUTextureFormat;
	alphaBlend?: GPUBlendDescriptor;
	colorBlend?: GPUBlendDescriptor;
	writeMask?: GPUColorWriteFlags;
}

type GPUFrontFace = "ccw" | "cw";

type GPUCullMode = "none" | "front" | "back";

interface GPURasterizationStateDescriptor {
	frontFace?: GPUFrontFace;
	cullMode?: GPUCullMode;
	clampDepth?: boolean; // requires "depth-clamping" extension
	depthBias?: GPUDepthBias;
	depthBiasSlopeScale?: number;
	depthBiasClamp?: number;
}


type GPUStencilOperation = "keep" | "zero" | "replace" | "invert" | "increment-clamp" | "decrement-clamp" | "increment-wrap" | "decrement-wrap";

interface GPUStencilStateFaceDescriptor {
	compare?: GPUCompareFunction;
	failOp?: GPUStencilOperation;
	depthFailOp?: GPUStencilOperation;
	passOp?: GPUStencilOperation;
}

interface GPUDepthStencilStateDescriptor {
	format: GPUTextureFormat;
	depthWriteEnabled?: boolean;
	depthCompare?: GPUCompareFunction;
	stencilFront?: GPUStencilStateFaceDescriptor;
	stencilBack?: GPUStencilStateFaceDescriptor;
	stencilReadMask?: GPUStencilValue;
	stencilWriteMask?: GPUStencilValue;
}


type GPUIndexFormat = "uint16" | "uint32";

type GPUVertexFormat =
	"uchar2" | "uchar4" |
	"char2" | "char4" |
	"uchar2norm" | "uchar4norm" |
	"char2norm" | "char4norm" |
	"ushort2" | "ushort4" |
	"short2" | "short4" |
	"ushort2norm" | "ushort4norm" |
	"short2norm" | "short4norm" |
	"half2" | "half4" |
	"float" | "float2" | "float3" | "float4" |
	"uint" | "uint2" | "uint3" | "uint4" |
	"int" | "int2" | "int3" | "int4";

type GPUInputStepMode = "vertex" | "instance";

interface GPUVertexAttributeDescriptor {
	format: GPUVertexFormat;
	offset: GPUSize64;
	shaderLocation: GPUIndex32;
}

interface GPUVertexBufferLayoutDescriptor {
	arrayStride?: GPUSize64;
	attributes?: GPUVertexAttributeDescriptor[];
	stepMode?: GPUInputStepMode;
}

interface GPUVertexStateDescriptor {
	indexFormat?: GPUIndexFormat;
	vertexBuffers?: GPUVertexBufferLayoutDescriptor[];
}


type GPUPrimitiveTopology = "point-list" | "line-list" | "line-strip" | "triangle-list" | "triangle-strip";

interface GPURenderPipelineDescriptor extends GPUPipelineDescriptorBase {
	vertexStage: GPUProgrammableStageDescriptor;
	fragmentStage?: GPUProgrammableStageDescriptor;
	primitiveTopology: GPUPrimitiveTopology;
	rasterizationState?: GPURasterizationStateDescriptor;
	colorStates?: GPUColorStateDescriptor[];
	depthStencilState?: GPUDepthStencilStateDescriptor;
	vertexState?: GPUVertexStateDescriptor;
	sampleCount?: GPUSize32;
	sampleMask?: GPUSampleMask;
	alphaToCoverageEnabled?: boolean;
}

interface GPURenderPipeline extends GPUObjectBase, GPUPipelineBase {
	// no properties, added branding field for TS disambiguation
	readonly __WEBGPU_RENDERPIPELINE__?: never;
}


interface GPUCommandBufferDescriptor extends GPUObjectBase {
	// no properties, no need for branding
}

interface GPUCommandBuffer extends GPUObjectBase {
	readonly executionTime: Promise<number>;
}


interface GPUTextureDataLayout {
	offset?: GPUSize64;
	bytesPerRow?: GPUSize32;
	rowsPerImage?: GPUSize32;
}

interface GPUBufferCopyView extends GPUTextureDataLayout {
	buffer: GPUBuffer;
}

interface GPUTextureCopyView {
	texture: GPUTexture;
	mipLevel?: GPUIntegerCoordinate;
	origin?: GPUOrigin3D;
}

interface GPUImageBitmapCopyView {
	imageBitmap: ImageBitmap;
	origin: GPUOrigin2D;
}

interface GPUProgrammablePassEncoder {
	setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffets?: GPUBufferDynamicOffset[]): void;
	setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsetsData: Uint32Array,
		dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32): void;

	pushDebugGroup(groupLabel: string): void;
	popDebugGroup(): void;
	insertDebugMarker(markerLabel: string): void;
}

interface GPUComputePassDescriptor extends GPUObjectDescriptorBase {
	// no properties, no need for branding
}

interface GPUComputePassEncoder extends GPUObjectBase, GPUProgrammablePassEncoder {
	setPipeline(pipeline: GPUComputePipeline): void;
	dispatch(x: GPUSize32, y?: GPUSize32, z?: GPUSize32): void;
	dispatchIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;

	beginPipelineStatisticsQuery(querySet: GPUQuerySet, queryIndex: GPUSize32): void;
	endPipelineStatisticsQuery(querySet: GPUQuerySet, queryIndex: GPUSize32): void;

	writeTimestamp(querySet: GPUQuerySet, queryIndex: GPUSize32): void;

	endPass(): void;
}


interface GPURenderEncoderBase {
	setPipeline(pipeline: GPURenderPipeline): void;

	setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, offset?: GPUSize64, size?: GPUSize64): void;
	setVertexBuffer(slot: GPUIndex32, buffer: GPUBuffer, offset?: GPUSize64, size?: GPUSize64): void;

	draw(vertexCount: GPUSize32, instanceCount?: GPUSize32, firstVertex?: GPUSize32, firstInstance?: GPUSize32): void;
	drawIndexed(indexCount: GPUSize32, instanceCount?: GPUSize32, firstIndex?: GPUSize32, baseVertex?: GPUSignedOffset32, firstInstance?: GPUSize32): void;

	drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;
	drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;
}

type GPULoadOp = "load";

type GPUStoreOp = "store" | "clear";

interface GPURenderPassColorAttachmentDescriptor {
	attachment: GPUTextureView;
	resolveTarget?: GPUTextureView;

	loadValue: GPULoadOp | GPUColor;
	storeOp?: GPUStoreOp;
}

interface GPURenderPassDepthStencilAttachmentDescriptor {
	attachment: GPUTextureView;

	depthLoadValue: GPULoadOp | number;
	depthStoreOp: GPUStoreOp;
	depthReadOnly?: boolean;

	stencilLoadValue: GPULoadOp | GPUStencilValue;
	stencilStoreOp: GPUStoreOp;
	stencilStoreOnly?: boolean;
}

interface GPURenderPassDescriptor extends GPUObjectDescriptorBase {
	colorAttachments: GPURenderPassColorAttachmentDescriptor[];
	depthStencilAttachment?: GPURenderPassDepthStencilAttachmentDescriptor;
	occlusionQuerySet?: GPUQuerySet;
}

interface GPURenderPassEncoder extends GPUObjectBase, GPUProgrammablePassEncoder, GPURenderEncoderBase {
	setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number): void;
	setScissorRect(x: GPUIntegerCoordinate, y: GPUIntegerCoordinate, width: GPUIntegerCoordinate, height: GPUIntegerCoordinate): void;
	setBlendColor(color: GPUColor): void;
	setStencilReference(reference: GPUStencilValue): void;

	beginOcclusionQuery(queryIndex: GPUSize32): void;
	endOcclusionQuery(): void;

	beginPipelineStatisticsQuery(querySet: GPUQuerySet, queryIndex: GPUSize32): void;
	endPipelineStatisticsQuery(querySet: GPUQuerySet, queryIndex: GPUSize32): void;

	writeTimestamp(querySet: GPUQuerySet, queryIndex: GPUSize32): void;

	executeBundles(bundles: GPURenderBundle[]): void;
	endPass(): void;
}


interface GPUCommandEncoderDescriptor extends GPUObjectDescriptorBase {
	measureExecutionTime?: boolean;
}

interface GPUCommandEncoder extends GPUObjectBase {
	beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
	beginComputePass(descriptor: GPUComputePassDescriptor): GPUComputePassEncoder;

	copyBufferToBuffer(
		source: GPUBuffer, sourceOffset: GPUSize64,
		desination: GPUBuffer, destinationOffset: GPUSize64,
		size: GPUSize64
	): void;
	copyBufferToTexture(
		source: GPUBufferCopyView,
		destination: GPUTextureCopyView,
		copySize: GPUExtent3D
	): void;
	copyTextureToBuffer(
		source: GPUTextureCopyView,
		destination: GPUBufferCopyView,
		copySize: GPUExtent3D
	): void;
	copyTextureToTexture(
		source: GPUTextureCopyView,
		destination: GPUTextureCopyView,
		copySize: GPUExtent3D
	): void;

	pushDebugGroup(groupLabel: string): void;
	popDebugGroup(): void;
	insertDebugMarker(markerLabel: string): void;

	writeTimestamp(querySet: GPUQuerySet, queryIndex: GPUSize32): void;

	resolveQuerySet(
		querySet: GPUQuerySet,
		firstIndex: GPUSize32,
		queryCount: GPUSize32,
		destination: GPUBuffer,
		destinationOffset: GPUSize64
	): void;

	finish(descriptor?: GPUCommandBufferDescriptor): GPUCommandBuffer;
}


interface GPURenderBundleDescriptor extends GPUObjectDescriptorBase {
	// no properties, no need for branding
}

interface GPURenderBundle extends GPUObjectBase {
	// no properties, added branding field for TS disambiguation
	readonly __WEBGPU_RENDERBUNDLE__?: never;
}

interface GPURenderBundleEncoderDescriptor extends GPUObjectDescriptorBase {
	colorFormats: GPUTextureFormat[];
	depthStencilFormat?: GPUTextureFormat;
	sampleCount?: GPUSize32;
}

interface GPURenderBundleEncoder extends GPUObjectBase, GPUProgrammablePassEncoder, GPURenderEncoderBase {
	finish(descriptor?: GPURenderBundleDescriptor): GPURenderBundle;
}


interface GPUQueue extends GPUObjectBase {
	submit(commandBuffers: GPUCommandBuffer[]): void;

	createFence(descriptor?: GPUFenceDescriptor): GPUFence;
	signal(fence: GPUFence, signalValue: GPUFenceValue): void;

	writeBuffer(
		buffer: GPUBuffer,
		bufferOffset: GPUSize64,
		data: BufferSource,
		dataOffset?: GPUSize64,
		size?: GPUSize64
	): void;

	writeTexture(
		destination: GPUTextureCopyView,
		data: BufferSource,
		dataLayout: GPUTextureDataLayout,
		size: GPUExtent3D
	): void;
	 
	copyImageBitmapToTexture(
		source: GPUImageBitmapCopyView,
		destination: GPUTextureCopyView,
		copySize: GPUExtent3D
	): void;
}


interface GPUFenceDescriptor extends GPUObjectDescriptorBase {
	initialValue?: GPUFenceValue;
}

interface GPUFence extends GPUObjectBase {
	getCompletedValue(): GPUFenceValue;
	onCompletion(completionValue: GPUFenceValue): Promise<void>;
}


type GPUQueryType =
	"occlusion" |
	"pipeline-statistics" |
	"timestamp";

type GPUPipelineStatisticName =
	"vertex-shader-invocations" |
	"clipper-invocations" |
	"clipper-primitives-out" |
	"fragment-shader-invocations" |
	"compute-shader-invocations";

interface GPUQuerySetDescriptor extends GPUObjectDescriptorBase {
	type: GPUQueryType;
	count: GPUSize32;
	pipelineStatistics?: GPUPipelineStatisticName[];
}

interface GPUQuerySet extends GPUObjectBase {
	destroy(): void;
}


interface GPUCanvasContext {
	configureSwapChain(descriptor: GPUSwapChainDescriptor): GPUSwapChain;
	getSwapChainPreferredFormat(device: GPUDevice): Promise<GPUTextureFormat>;
}

interface GPUSwapChainDescriptor extends GPUObjectDescriptorBase {
	device: GPUDevice;
	format: GPUTextureFormat;
	usage?: GPUTextureUsageFlags;
}

interface GPUSwapChain extends GPUObjectBase {
	getCurrentTexture(): GPUTexture;
}

interface HTMLCanvasElement {
	getContext(contextId: "gpu"): GPUCanvasContext | null;
}


interface GPUDeviceLostInfo {
	readonly message: string;
}

interface GPUOutOfMemoryError {
	// no properties, added branding field for TS disambiguation
	readonly __WEBGPU_OUTOFMEMORYERROR__?: never;
}
interface GPUOutOfMemoryErrorConstructor {
	new(): GPUOutOfMemoryError;
}
declare const GPUOutOfMemoryError: GPUOutOfMemoryErrorConstructor;

interface GPUValidationError {
	readonly message: string;
	readonly __WEBGPU_VALIDATIONERROR__?: never;
}
interface GPUValidationErrorConstructor {
	new(message: string): GPUValidationError;
}
declare const GPUValidationError: GPUValidationErrorConstructor;

type GPUError = GPUOutOfMemoryError | GPUValidationError;

type GPUErrorFilter = "out-of-memory" | "validation";


interface GPUUncapturedErrorEvent extends Event {
	readonly error: GPUError;
}
interface GPUUncapturedErrorEventInit extends EventInit {
	error: GPUError;
}
interface GPUUncapturedErrorEventConstructor {
	new(type: string, gpuUncapturedErrorEventInitDict: GPUUncapturedErrorEventInit): GPUUncapturedErrorEvent;
}
declare const GPUUncapturedErrorEvent: GPUUncapturedErrorEventConstructor;


type GPUExtensionName =
	"depth-clamping" |
	"depth24unorm-stencil8" |
	"depth32float-stencil8" |
	"pipeline-statistics-query" |
	"texture-compression-bc" |
	"timestamp-query";

interface GPULimits {
	maxBindGroups?: GPUSize32;
	maxDynamicUniformBuffersPerPipelineLayout?: GPUSize32;
	maxDynamicStorageBuffersPerPipelineLayout?: GPUSize32;
	maxSampledTexturesPerShaderStage?: GPUSize32;
	maxSamplersPerShaderStage?: GPUSize32;
	maxStorageBuffersPerShaderStage?: GPUSize32;
	maxStorageTexturesPerShaderStage?: GPUSize32;
	maxUniformBuffersPerShaderStage?: GPUSize32;
	maxUniformBufferBindingSize?: GPUSize32;
}

interface GPUDeviceDescriptor {
	extensions?: GPUExtensionName[];
	limits?: GPULimits;
}

interface GPUDevice extends GPUObjectBase, EventTarget {
	readonly adapter: GPUAdapter;
	readonly extensions: ReadonlyArray<GPUExtensionName>;
	readonly limits: GPULimits;
	readonly defaultQueue: GPUQueue;

	createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
	createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
	createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler;
	createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
	createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
	createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
	createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
	createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
	createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
	createReadyComputePipeline(descriptor: GPUComputePipelineDescriptor): Promise<GPUComputePipeline>;
	createReadyRenderPipeline(descriptor: GPURenderPipelineDescriptor): Promise<GPURenderPipeline>;

	createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
	createRenderBundleEncoder(descriptor: GPURenderBundleEncoderDescriptor): GPURenderBundleEncoder;

	createQuerySet(descriptor: GPUQuerySetDescriptor): GPUQuerySet;

	// fatal errors (§20.1)
	readonly lost: Promise<GPUDeviceLostInfo>;

	// error scopes (§20.2)
	pushErrorScope(filter: GPUErrorFilter): void;
	popErrorScope(): Promise<GPUError | void>;

	// telemetry (§20.3)
	onuncapturederror: ((event: GPUUncapturedErrorEvent) => any) | null;
}


type GPUPowerPreference = "low-power" | "high-performance";

interface GPURequestAdapterOptions {
	powerPreference?: GPUPowerPreference;
}

interface GPUAdapter {
	readonly name: string;
	readonly extensions: ReadonlyArray<GPUExtensionName>;

	requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice | null>;
}

interface GPU {
	requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
}

interface Navigator {
	readonly gpu: GPU;
}
