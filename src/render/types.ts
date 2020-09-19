/*
render/types - data structures and make functions for render state info
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { Vector4 } from "stardazed/vector";

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

export const enum BlendOperation {
	Add,
	Subtract,
	ReverseSubtract,

	Min,
	Max
}

export const enum BlendFactor {
	Zero,
	One,

	SourceColour,
	OneMinusSourceColour,

	DestColour,
	OneMinusDestColour,

	SourceAlpha,
	OneMinusSourceAlpha,
	SourceAlphaSaturated,

	DestAlpha,
	OneMinusDestAlpha,

	ConstantColour,
	OneMinusConstantColour,
	ConstantAlpha,
	OneMinusConstantAlpha
}

export interface ColourBlending {
	rgbBlendOp: BlendOperation;
	alphaBlendOp: BlendOperation;

	sourceRGBFactor: BlendFactor;
	sourceAlphaFactor: BlendFactor;
	destRGBFactor: BlendFactor;
	destAlphaFactor: BlendFactor;

	constantColour: Vector4;
}

export function makeColourBlending(): ColourBlending {
	return {
		rgbBlendOp: BlendOperation.Add,
		alphaBlendOp: BlendOperation.Add,

		sourceRGBFactor: BlendFactor.One,
		sourceAlphaFactor: BlendFactor.One,
		destRGBFactor: BlendFactor.Zero,
		destAlphaFactor: BlendFactor.Zero,

		constantColour: new Vector4(0, 0, 0, 1)
	};
}

export interface ColourWriteMask {
	red: boolean;
	green: boolean;
	blue: boolean;
	alpha: boolean;
}

export function makeColourWriteMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): ColourWriteMask {
	return {
		red, green,	blue, alpha
	};
}

export const enum FaceWinding {
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

export const enum TextureRepeatMode {
	Repeat,
	MirroredRepeat,
	ClampToEdge
}


export const enum TextureSizingFilter {
	Nearest,
	Linear
}


export const enum TextureMipFilter {
	None,
	Nearest,
	Linear
}
