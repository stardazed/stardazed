// render/device - engine-side view of render constructs
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum ResourceType {
		Texture = 1,
		Sampler,
		FrameBuffer,
		VertexLayout,
		VertexStream,
		IndexStream,
		Mesh,
		// ConstantBuffer,
		Shader
	}

	export interface RenderResourceBase {
		readonly renderResourceType: ResourceType;
		renderResourceHandle: number;
	}

	export type RenderResource =
		Texture | Sampler | Shader | FrameBuffer |
		meshdata.VertexLayout | meshdata.VertexBuffer | meshdata.IndexBuffer | meshdata.MeshData;


	export interface RenderResourceCommandBuffer {
		alloc(resource: RenderResource): void;
		free(resource: RenderResource): void;
	}

	export interface RenderDevice {
		// current dimensions of screen rendertarget
		readonly drawableWidth: number;
		readonly drawableHeight: number;

		// capabilities
		readonly supportsArrayTextures: boolean;
		readonly supportsDepthTextures: boolean;
		readonly maxColourAttachments: number;

		// gpu resource management
		makeResourceCommandBuffer(): RenderResourceCommandBuffer;
		dispatchResource(rrcb: RenderResourceCommandBuffer | RenderResourceCommandBuffer[]): void;

		dispatch(pass: RenderPass | RenderPass[]): void;
	}

} // ns sd.render
