/**
 * render/pipeline - shader variant and configuration
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Float4 } from "@stardazed/core";
import { Shader } from "./shader";

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

	constantColour: Float4;
}


export interface ColourWriteMask {
	red: boolean;
	green: boolean;
	blue: boolean;
	alpha: boolean;
}


export function makeColourBlending(): ColourBlending {
	return {
		rgbBlendOp: BlendOperation.Add,
		alphaBlendOp: BlendOperation.Add,

		sourceRGBFactor: BlendFactor.One,
		sourceAlphaFactor: BlendFactor.One,
		destRGBFactor: BlendFactor.Zero,
		destAlphaFactor: BlendFactor.Zero,

		constantColour: [0, 0, 0, 1]
	};
}


export function makeColourWriteMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): ColourWriteMask {
	return {
		red, green,	blue, alpha
	};
}


export interface Pipeline {
	colourWriteMask?: ColourWriteMask;
	depthWrite: boolean;
	depthTest: DepthTest;
	blending?: ColourBlending;
	faceCulling: FaceCulling;
	shader: Shader;
}
