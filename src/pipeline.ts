// pipeline - render pipeline descriptors
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="pixelformat.ts"/>

namespace sd.render {

	const enum BlendOperation {
		Add,
		Subtract,
		ReverseSubtract,
		Min,
		Max
	}


	const enum BlendFactor {
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


	interface ColourBlendingDescriptor {
		enabled: boolean;// = false;

		rgbBlendOp: BlendOperation;// = BlendOperation.Add;
		alphaBlendOp: BlendOperation;// = BlendOperation.Add;

		sourceRGBFactor: BlendFactor;// = BlendFactor.One;
		sourceAlphaFactor: BlendFactor;// = BlendFactor.One;
		destRGBFactor: BlendFactor;// = BlendFactor.Zero;
		destAlphaFactor: BlendFactor;// = BlendFactor.Zero;
	}


	interface ColourWriteMask {
		red: boolean;
		green: boolean;
		blue: boolean;
		alpha: boolean;
	}


	interface PipelineColourAttachmentDescriptor {
		pixelFormat: PixelFormat;
		writeMask: ColourWriteMask;
		blending: ColourBlendingDescriptor;
	};


	interface PipelineDescriptor {
		colourAttachments: PipelineColourAttachmentDescriptor[];
		depthPixelFormat: PixelFormat;
		stencilPixelFormat: PixelFormat;

		vertexShader: WebGLShader;
		fragmentShader: WebGLShader;
	}

} // ns stardazed
