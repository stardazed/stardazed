// pipeline-desc - render pipeline descriptors
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { va } from "math/veclib";
import { VertexAttributeRole } from "mesh/types";
import { PixelFormat } from "render/pixelformat";

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


export interface ColourBlendingDescriptor {
	enabled: boolean;

	rgbBlendOp: BlendOperation;
	alphaBlendOp: BlendOperation;

	sourceRGBFactor: BlendFactor;
	sourceAlphaFactor: BlendFactor;
	destRGBFactor: BlendFactor;
	destAlphaFactor: BlendFactor;

	constantColour: va.Float4;
}


export interface ColourWriteMask {
	red: boolean;
	green: boolean;
	blue: boolean;
	alpha: boolean;
}


export type AttributeNameMap = Map<VertexAttributeRole, string>;


export interface PipelineDescriptor {
	colourPixelFormats: PixelFormat[];

	writeMask: ColourWriteMask;
	depthMask: boolean;
	blending: ColourBlendingDescriptor;

	depthPixelFormat: PixelFormat;
	stencilPixelFormat: PixelFormat;

	vertexShader?: WebGLShader;
	fragmentShader?: WebGLShader;

	attributeNames: AttributeNameMap;
}


export function makeColourBlendingDescriptor(): ColourBlendingDescriptor {
	return {
		enabled: false,

		rgbBlendOp: BlendOperation.Add,
		alphaBlendOp: BlendOperation.Add,

		sourceRGBFactor: BlendFactor.One,
		sourceAlphaFactor: BlendFactor.One,
		destRGBFactor: BlendFactor.Zero,
		destAlphaFactor: BlendFactor.Zero,

		constantColour: [0, 0, 0, 1]
	};
}


export function makeColourWriteMask(): ColourWriteMask {
	return {
		red: true,
		green: true,
		blue: true,
		alpha: true
	};
}


export function makePipelineDescriptor(): PipelineDescriptor {
	const cpf: PixelFormat[] = [];
	for (let k = 0; k < 8; ++k) {
		cpf.push(PixelFormat.None);
	}
	Object.seal(cpf); // fixed length array FIXME: necessary?

	return {
		colourPixelFormats: cpf,
		depthPixelFormat: PixelFormat.None,
		stencilPixelFormat: PixelFormat.None,

		writeMask: makeColourWriteMask(),
		depthMask: true,
		blending: makeColourBlendingDescriptor(),

		attributeNames: new Map<VertexAttributeRole, string>()
	};
}
