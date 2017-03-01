// render/interface - engine-side view of render constructs
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	const enum ResourceType {
		Texture = 1,
		Sampler,
		RenderTarget,
		VertexLayout,
		VertexStream,
		IndexStream,
		ConstantBuffer,
		Shader
	}

	interface RenderResourceCommandBuffer {
		alloc(tex: TextureDescriptor): void;
		alloc(sampler: SamplerDescriptor): void;
	}

	interface RenderDevice {

	}

} // ns sd
