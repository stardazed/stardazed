// render/interface - engine-side view of render constructs
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum FrontFaceWinding {
		Clockwise,
		CounterClockwise
	}


	export const enum FaceCulling {
		Disabled,

		Front,
		Back
	}


	export const enum DepthTest {
		Disabled,

		AllowAll,
		DenyAll,

		Less,
		LessOrEqual,
		Equal,
		NotEqual,
		GreaterOrEqual,
		Greater
	}


	export const enum ClearMask {
		None         = 0,
		Colour       = 1,
		Depth        = 2,
		Stencil      = 4,
		ColourDepth  = Colour | Depth,
		DepthStencil = Depth | Stencil,
		All          = Colour | Depth | Stencil
	}


	export interface ScissorRect {
		originX: number;
		originY: number;
		width: number;
		height: number;
	}


	export interface Viewport {
		originX: number;
		originY: number;
		width: number;
		height: number;
		nearZ: number;
		farZ: number;
	}


	export function makeScissorRect(): ScissorRect {
		return {
			originX: 0,
			originY: 0,
			width: 32768,
			height: 32768
		};
	}


	export function makeViewport(): Viewport {
		return {
			originX: 0,
			originY: 0,
			width: 0,
			height: 0,
			nearZ: 0,
			farZ: 1
		};
	}


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


	export class RenderCommandBuffer {
		
	}


	export interface RenderDevice {
		readonly supportsArrayTextures: boolean;
		readonly supportsDepthTextures: boolean;

		readonly maxColourAttachments: number;

		dispatchResource(rrcb: RenderResourceCommandBuffer[]): void;
		dispatch(rcb: RenderCommandBuffer): void;
	}

} // ns sd.render
