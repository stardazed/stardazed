// render/renderpass - single framebuffer pass (command buffer)
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum FrontFaceWinding {
		Clockwise,
		CounterClockwise
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

	export function makeScissorRect(): ScissorRect {
		return {
			originX: 0,
			originY: 0,
			width: 32768,
			height: 32768
		};
	}


	export interface Viewport {
		originX: number;
		originY: number;
		width: number;
		height: number;
		nearZ: number;
		farZ: number;
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


	export interface RenderJob {
		pipeline: Pipeline;
		mesh: meshdata.MeshData;
		primGroup: meshdata.PrimitiveGroup;

		// shader properties
		textures: Texture[];
		samplers: Sampler[];
		constants: any[];
	}

	export interface RenderPass {
		readonly frameBuffer: FrameBuffer | null;
		readonly clearMask: ClearMask;

		// state management
		setScissor(rect: ScissorRect): void;
		setViewport(viewport: Viewport): void;
		setFrontFace(winding: FrontFaceWinding): void;

		// resource updates
		textureWrite(texture: Texture, offset: image.PixelCoordinate, dim: image.PixelDimensions, data: ReadonlyTypedArray): void;

		// drawing
		render(job: RenderJob, normalizedDepth: number): void;
	}

} // ns sd.render
