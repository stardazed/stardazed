// renderpass-desc - decscriptors and enums relating to RenderPass objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="pixelformat.ts"/>
/// <reference path="math.ts"/>

namespace sd.render {

	export const enum FrontFaceWinding {
		Clockwise,
		CounterClockwise
	}


	export const enum TriangleFillMode {
		Fill,
		Line
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


	export interface DepthStencilTestDescriptor {
		depthTest: DepthTest;
		// TODO: add stencil setup
	}


	export interface RenderPassDescriptor {
		clearMask: ClearMask;

		clearColour: ArrayOfNumber;
		clearDepth: number;
		clearStencil: number;		
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


	export function makeDepthStencilTestDescriptor(): DepthStencilTestDescriptor {
		return {
			depthTest: DepthTest.AllowAll
		};
	}


	export function makeRenderPassDescriptor(): RenderPassDescriptor {
		return {
			clearMask: ClearMask.All,
			clearColour: [0, 0, 0, 1],
			clearDepth: 1.0,
			clearStencil: 0
		};
	}

} // ns sd.render
