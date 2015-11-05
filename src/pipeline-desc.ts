// pipeline-desc - render pipeline descriptors
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="pixelformat.ts"/>

namespace sd.render {

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
	}


	export interface ColourWriteMask {
		red: boolean;
		green: boolean;
		blue: boolean;
		alpha: boolean;
	}


	export interface PipelineColourAttachmentDescriptor {
		pixelFormat: PixelFormat;
		writeMask: ColourWriteMask;
		blending: ColourBlendingDescriptor;
	}


	export interface PipelineDescriptor {
		colourAttachments: PipelineColourAttachmentDescriptor[];
		depthPixelFormat: PixelFormat;
		stencilPixelFormat: PixelFormat;

		vertexShader: WebGLShader;
		fragmentShader: WebGLShader;
	}


	export function makeColourBlendingDescriptor(): ColourBlendingDescriptor {
		return {
			enabled: false,

			rgbBlendOp: BlendOperation.Add,
			alphaBlendOp: BlendOperation.Add,

			sourceRGBFactor: BlendFactor.One,
			sourceAlphaFactor: BlendFactor.One,
			destRGBFactor: BlendFactor.Zero,
			destAlphaFactor: BlendFactor.Zero
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


	export function makePipelineColourAttachmentDescriptor(): PipelineColourAttachmentDescriptor {
		return {
			pixelFormat: PixelFormat.None,
			writeMask: makeColourWriteMask(),
			blending: makeColourBlendingDescriptor()
		};
	}


	export function makePipelineDescriptor(): PipelineDescriptor {
		var ca: PipelineColourAttachmentDescriptor[] = [];
		for (let k = 0; k < 8; ++k)
			ca.push(makePipelineColourAttachmentDescriptor());

		return {
			colourAttachments: ca,
			depthPixelFormat: PixelFormat.None,
			stencilPixelFormat: PixelFormat.None,

			vertexShader: null,
			fragmentShader: null
		};
	}

} // ns stardazed
