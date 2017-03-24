// render/shader - Shader resource
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export type ShaderValueType =
		"int" | "int2" | "int3" | "int4" |
		"float" | "float2" | "float3" | "float4" |
		"mat2" | "mat3" | "mat4";

	export type ShaderAttributeRole =
		"position" | "normal" | "tangent" |
		"colour" |  "material" |
		"uv0" | "uv1" | "uv2" | "uv3" |
		"weightedPos0" | "weightedPos1" | "weightedPos2" | "weightedPos3" |
		"jointIndexes";

	export interface TextureSlot {
		name: string;
		type: TextureClass;
		index: number;
	}

	export interface ShaderConstant {
		name: string;
		type: ShaderValueType;
		length?: number;            // optional: array length
	}

	export interface ShaderAttribute {
		name: string;
		type: ShaderValueType;
	}

	export interface ShaderVertexAttribute extends ShaderAttribute {
		role: ShaderAttributeRole;
		index: number;
	}

	export interface VertexFunction {
		in: ShaderVertexAttribute[];
		out?: ShaderAttribute[];
		textures?: TextureSlot[];
		constants?: ShaderConstant[];
	}

	export interface FragmentFunction {
		in?: ShaderAttribute[];
		outCount: number;
		textures?: TextureSlot[];
		constants?: ShaderConstant[];
	}

	export interface Shader extends RenderResourceBase {
		readonly allTextures: TextureSlot[];    // combined textures
		readonly allConstants: ShaderConstant[]; // combined constants
		vertexFunction: VertexFunction;
		fragmentFunction: FragmentFunction;
	}

} // ns sd.render
