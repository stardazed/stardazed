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

		constantColour: Float4;
	}


	export interface ColourWriteMask {
		red: boolean;
		green: boolean;
		blue: boolean;
		alpha: boolean;
	}


	export type AttributeNameMap = Map<mesh.VertexAttributeRole, string>;


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
		var cpf: PixelFormat[] = [];
		for (let k = 0; k < 8; ++k) {
			cpf.push(PixelFormat.None);
		}
		Object.seal(cpf); // fixed length array

		return {
			colourPixelFormats: cpf,
			depthPixelFormat: PixelFormat.None,
			stencilPixelFormat: PixelFormat.None,

			writeMask: makeColourWriteMask(),
			depthMask: true,
			blending: makeColourBlendingDescriptor(),

			attributeNames: new Map<mesh.VertexAttributeRole, string>()
		};
	}

} // ns stardazed
