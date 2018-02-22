// render/core/device - engine-side view of render constructs
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./commandbuffer.ts" />


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
		Texture | Sampler | FrameBuffer | geometry.Geometry | Shader;


	export interface RenderDevice {
		readonly name: string;

		// current dimensions of screen rendertarget
		readonly drawableWidth: number;
		readonly drawableHeight: number;

		// capabilities
		readonly supportsSRGBTextures: boolean;
		readonly supportsArrayTextures: boolean;
		readonly supportsDepthTextures: boolean;
		readonly maxColourAttachments: number;

		// command dispatch
		dispatch(cmds: RenderCommandBuffer | RenderCommandBuffer[]): void;

		// run all commands
		processFrame(): void;
	}

} // ns sd.render
