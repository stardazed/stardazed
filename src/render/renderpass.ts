// render/commandbuffer - render command buffer
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


	// ---- initial implementation for RenderCommand: use discriminated unions

	export const enum RenderCommandType {
		None,
		StartFrame,
		Scissor,
		Viewport,
		FrontFace,
		TextureWrite,
		RenderJob
	}

	export interface StartFrameCommand {
		type: RenderCommandType.StartFrame;
		sortKey: number;
		frameBufferHandle: number;
		clearMask: ClearMask;
	}

	export interface ScissorCommand {
		type: RenderCommandType.Scissor;
		sortKey: number;
		originX: number;
		originY: number;
		width: number;
		height: number;
	}

	export interface ViewportCommand {
		type: RenderCommandType.Viewport;
		sortKey: number;
		originX: number;
		originY: number;
		width: number;
		height: number;
		nearZ: number;
		farZ: number;
	}

	export interface FrontFaceCommand {
		type: RenderCommandType.FrontFace;
		sortKey: number;
		frontFace: FrontFaceWinding;
	}

	export interface TextureWriteCommand {
		type: RenderCommandType.TextureWrite;
		sortKey: number;
		textureHandle: number;
		x: number;
		y: number;
		width: number;
		height: number;
		pixels: ReadonlyTypedArray;
	}

	export interface RenderJobCommand {
		type: RenderCommandType.RenderJob;
		sortKey: number;

		pipeline: Pipeline;
		meshHandle: number;
		primitiveType: meshdata.PrimitiveType;
		fromElement: number;
		elementCount: number;

		// shader properties
		textureHandles: number[];
		samplerHandles: number[];
		constants: any[];
	}

	export type RenderCommand = StartFrameCommand | ScissorCommand | ViewportCommand | FrontFaceCommand | TextureWriteCommand | RenderJobCommand;


	export class RenderCommandBuffer {
		readonly commands: RenderCommand[] = [];

		setFrameBuffer(fb: FrameBuffer | null, clearMask: ClearMask) {
			this.commands.push({
				type: RenderCommandType.StartFrame,
				sortKey: 0,
				frameBufferHandle: fb ? fb.renderResourceHandle : 0,
				clearMask
			});
		}

		setScissor(rect: ScissorRect) {
			this.commands.push({
				type: RenderCommandType.Scissor,
				sortKey: 0,
				...rect
			});
		}

		setViewport(viewport: Viewport) {
			this.commands.push({
				type: RenderCommandType.Viewport,
				sortKey: 0,
				...viewport
			});
		}

		setFrontFace(winding: FrontFaceWinding) {
			this.commands.push({
				type: RenderCommandType.FrontFace,
				sortKey: 0,
				frontFace: winding
			});

		}

		textureWrite(texture: Texture, offset: image.PixelCoordinate, dim: image.PixelDimensions, pixels: ReadonlyTypedArray) {
			this.commands.push({
				type: RenderCommandType.TextureWrite,
				sortKey: 0,
				textureHandle: texture.renderResourceHandle,
				x: offset.x,
				y: offset.y,
				width: dim.width,
				height: dim.height,
				pixels
			});
		}

		render(job: RenderJob, _normalizedDepth: number) {
			this.commands.push({
				type: RenderCommandType.RenderJob,
				sortKey: 0,
				pipeline: job.pipeline,
				meshHandle: job.mesh.renderResourceHandle,
				primitiveType: job.primGroup.type,
				fromElement: job.primGroup.fromElement,
				elementCount: job.primGroup.elementCount,
				textureHandles: job.textures.map(t => t.renderResourceHandle),
				samplerHandles: job.samplers.map(s => s.renderResourceHandle),
				constants: job.constants
			});
		}
	}

} // ns sd.render
