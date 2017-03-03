// render/interface - engine-side view of render constructs
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum ResourceType {
		Texture = 1,
		Sampler,
		// RenderTarget,
		// VertexLayout,
		// VertexStream,
		// IndexStream,
		// ConstantBuffer,
		// Shader
	}

	export interface RenderResourceBase {
		readonly renderResourceType: ResourceType;
		renderResourceHandle?: number;
	}

	export type RenderResource = Texture | Sampler;

	export class RenderResourceCommandBuffer {
		constructor() {

		}

		alloc(resource: RenderResource) {

		}

		dealloc(resource: RenderResource) {

		}
	}

	export interface RenderDevice {
		dispatch(rrcb: RenderResourceCommandBuffer): void;
	}

} // ns sd.render
