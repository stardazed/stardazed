// render/shader - Shader resource
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export const enum ShaderValueType {
		Int,
		Int2,
		Int3,
		Int4,
		Half,
		Half2,
		Half3,
		Half4,
		Float,
		Float2,
		Float3,
		Float4,
		Float2x2,
		Float3x3,
		Float4x4
	}

	export interface SamplerSlot {
		name: string;
		type: TextureClass;
		index: number;
	}

	export interface ShaderAttribute {
		name: string;
		type: ShaderValueType;
	}

	export interface ShaderVertexAttribute extends ShaderAttribute {
		role: meshdata.VertexAttributeRole;
		index: number;
	}

	export interface ShaderConstant {
		name: string;
		type: ShaderValueType;
		length?: number;
	}

	export interface VertexFunction {
		in: ShaderVertexAttribute[];
		out?: ShaderAttribute[];
		// feedback?: any;
		samplers?: SamplerSlot[];
		constants?: ShaderConstant[];
	}

	export interface FragmentFunction {
		in?: ShaderAttribute[];
		outCount: number;
		samplers?: SamplerSlot[];
		constants?: ShaderConstant[];
	}

	export interface Shader extends RenderResourceBase {
		vertexFunction: VertexFunction;
		fragmentFunction: FragmentFunction;
	}

} // ns sd.render
