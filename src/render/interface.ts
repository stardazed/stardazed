// render/interface - engine-side view of render constructs
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum ResourceType {
		Texture = 1,
		Sampler,
		RenderTarget,
		VertexLayout,
		VertexStream,
		IndexStream,
		ConstantBuffer,
		Shader
	}

	export interface RenderResourceCommandBuffer {
		alloc(tex: Texture): void;
		alloc(sampler: Sampler): void;
	}

	export interface RenderDevice {

	}

} // ns sd
