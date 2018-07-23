/**
 * render/resource - resource types in the render engine
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export const enum ResourceType {
	Texture = 1,
	Sampler,
	FrameBuffer,
	Mesh,
	Shader,
	// ConstantBuffer,
}

export interface RenderResourceBase {
	readonly renderResourceType: ResourceType;
	renderResourceHandle: number;
}
