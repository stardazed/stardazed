// render/core/commandbuffer - render command buffer
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
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

	export interface TEMPConstant {
		name: string;
		value: TypedArray;
	}

	export interface RenderJob {
		geom: geometry.Geometry;
		primGroup: geometry.PrimitiveGroup;

		pipeline: Pipeline;

		textures: (Texture | undefined)[];
		samplers: (Sampler | undefined)[];
		constants: TEMPConstant[];
	}


	// -- initial implementation for RenderCommand: use discriminated unions

	export const enum RenderCommandType {
		None,
		Resource,
		FrameBuffer,
		Scissor,
		Viewport,
		FrontFace,
		TextureWrite,
		RenderJob
	}

	export interface ResourceCommand {
		type: RenderCommandType.Resource;
		sortKey: number;
		alloc: RenderResource[];
		free: RenderResource[];
	}

	export interface ClearValues {
		colour: Float4;
		depth: number;
		stencil: number;
	}

	export interface FrameBufferCommand {
		type: RenderCommandType.FrameBuffer;
		sortKey: number;
		frameBufferHandle: number;
		clearMask: ClearMask;
		clearValues: ClearValues;
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
		layer: CubeMapFace | number;
		x: number;
		y: number;
		width: number;
		height: number;
		pixels: TypedArray;
	}

	export interface RenderJobCommand {
		type: RenderCommandType.RenderJob;
		sortKey: number;

		meshHandle: number;
		primitiveType: geometry.PrimitiveType;
		fromElement: number;
		elementCount: number;

		// TODO: add instancing parameters

		// shader properties
		pipeline: Pipeline;
		textureHandles: number[];
		samplerHandles: number[];
		constants: TEMPConstant[];
	}

	export type RenderCommand = 
		ResourceCommand |
		FrameBufferCommand | ScissorCommand | ViewportCommand | FrontFaceCommand |
		TextureWriteCommand |
		RenderJobCommand;

	const defaultClearColour_: Float4 = [0, 0, 0, 1];

	export class RenderCommandBuffer {
		readonly commands: RenderCommand[] = [];

		private resourceCommand: ResourceCommand | undefined;
		private getResourceCommand(): ResourceCommand {
			if (! this.resourceCommand) {
				this.resourceCommand = {
					type: RenderCommandType.Resource,
					sortKey: 0,
					alloc: [],
					free: []
				};
				this.commands.push(this.resourceCommand);
			}
			return this.resourceCommand;
		}

		allocate(resource: RenderResource) {
			const cmd = this.getResourceCommand();
			cmd.alloc.push(resource);
		}

		free(resource: RenderResource) {
			const cmd = this.getResourceCommand();
			cmd.free.push(resource);
		}

		setFrameBuffer(fb: FrameBuffer | null, clearMask: ClearMask, clearValues?: Partial<ClearValues>) {
			this.commands.push({
				type: RenderCommandType.FrameBuffer,
				sortKey: 1,
				frameBufferHandle: fb ? fb.renderResourceHandle : 0,
				clearMask,
				clearValues: {
					colour: (clearValues && clearValues.colour) ? clearValues.colour : defaultClearColour_,
					depth: (clearValues && (clearValues.depth !== undefined)) ? clearValues.depth : 1.0,
					stencil: (clearValues && (clearValues.stencil !== undefined)) ? clearValues.stencil : 0,
				}
			});
		}

		setScissor(rect: ScissorRect | null) {
			if (rect === null) {
				rect = { originX: -1, originY: -1, width: -1, height: -1 };
			}
			// TODO: else assert >0-ness of all fields
			this.commands.push({
				type: RenderCommandType.Scissor,
				sortKey: 1,
				...rect
			});
		}

		setViewport(viewport: Viewport) {
			this.commands.push({
				type: RenderCommandType.Viewport,
				sortKey: 1,
				...viewport
			});
		}

		setFrontFace(winding: FrontFaceWinding) {
			this.commands.push({
				type: RenderCommandType.FrontFace,
				sortKey: 1,
				frontFace: winding
			});
		}

		textureWrite(texture: Texture, layer: CubeMapFace | number, offset: image.PixelCoordinate, dim: image.PixelDimensions, pixels: TypedArray) {
			this.commands.push({
				type: RenderCommandType.TextureWrite,
				sortKey: 1,
				textureHandle: texture.renderResourceHandle,
				layer,
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
				sortKey: 1,
				pipeline: job.pipeline,
				meshHandle: job.geom.renderResourceHandle,
				primitiveType: job.primGroup.type,
				fromElement: job.primGroup.fromElement,
				elementCount: job.primGroup.elementCount,
				textureHandles: job.textures.map(t => t ? t.renderResourceHandle : 0),
				samplerHandles: job.samplers.map(s => s ? s.renderResourceHandle : 0),
				constants: job.constants
			});
		}
	}

} // ns sd.render
