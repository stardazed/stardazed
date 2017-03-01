// render/pipeline-desc - render pipeline descriptors
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

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


	export type AttributeNameMap = Map<meshdata.VertexAttributeRole, string>;


	export interface PipelineDescriptor {
		colourMask?: ColourWriteMask;
		depthMask: boolean;
		blending?: ColourBlendingDescriptor;

		vertexShader?: WebGLShader;
		fragmentShader?: WebGLShader;

		attributeNames: AttributeNameMap;
	}


	export function makeColourBlendingDescriptor(): ColourBlendingDescriptor {
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


	export function makeColourWriteMask(): ColourWriteMask {
		return {
			red: true,
			green: true,
			blue: true,
			alpha: true
		};
	}


	export function makePipelineDescriptor(): PipelineDescriptor {
		return {
			colourMask: undefined,
			depthMask: true,
			blending: undefined,

			attributeNames: new Map<meshdata.VertexAttributeRole, string>()
		};
	}

} // ns stardazed
