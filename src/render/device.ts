// render/device - engine-side view of render constructs
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum ResourceType {
		Texture = 1,
		Sampler,
		FrameBuffer,
		Mesh,
		// ConstantBuffer,
		Shader
	}

	export interface RenderResourceBase {
		readonly renderResourceType: ResourceType;
		renderResourceHandle: number;
	}

	export type RenderResource =
		Texture | Sampler | FrameBuffer | meshdata.MeshData | Shader;


	export class RenderResourceCommandBuffer {
		private readonly allocList_: RenderResource[] = [];
		private readonly freeList_: RenderResource[] = [];

		alloc(resource: RenderResource) {
			this.allocList_.push(resource);
		}

		free(resource: RenderResource) {
			this.freeList_.push(resource);
		}

		get allocList() { return this.allocList_; }
		get freeList() { return this.freeList_; }
	}


	export interface RenderDevice {
		readonly name: string;

		// current dimensions of screen rendertarget
		readonly drawableWidth: number;
		readonly drawableHeight: number;

		// capabilities
		readonly supportsArrayTextures: boolean;
		readonly supportsDepthTextures: boolean;
		readonly maxColourAttachments: number;

		// command dispatch
		dispatchResource(rrcb: RenderResourceCommandBuffer | RenderResourceCommandBuffer[]): void;
		dispatchCommand(pass: RenderCommandBuffer | RenderCommandBuffer[]): void;

		// run all drawing commands
		renderFrame(): void;
	}

} // ns sd.render
