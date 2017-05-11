// render/commandbuffer - client-side command buffer
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


	export interface RenderCommand {
		sortKey: number;
		flags: number;
		data: any;
	}

	export interface RenderJob {
		shader: any;
		mesh: meshdata.MeshData;
		primGroup: meshdata.PrimitiveGroup;
		textures: Texture[];
		samplers: Sampler[];
		constants: any[];
	}

	export class RenderCommandBuffer {
		textureWrite(_texture: Texture, _offset: image.PixelCoordinate, _dim: image.PixelDimensions, _data: ReadonlyTypedArray) {

		}

		render(_job: RenderJob, _normalizedDepth: number) {

		}
	}

} // ns sd.render
