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

	export interface SamplerSlot {
		name: string;
		type: TextureClass;
		index: number;
	}

	export interface ShaderConstant {
		name: string;
		type: ShaderValueType;
		length?: number;            // optional: fixed array length
	}

	export interface ShaderConstantBlock {
		blockName: string;
		constants: ShaderConstant[];
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
		// feedback?: any;
		textures?: SamplerSlot[];
		constantBlocks?: ShaderConstantBlock[];
	}

	export interface FragmentFunction {
		in?: ShaderAttribute[];
		outCount: number;
		samplers?: SamplerSlot[];
		constantBlocks?: ShaderConstantBlock[];
	}

	export interface Shader extends RenderResourceBase {
		vertexFunction: VertexFunction;
		fragmentFunction: FragmentFunction;
	}

	// ----

	export type VertexSkinning = "2bone" | "4bone";
	export type VertexColours = "per-vertex";

	export type DynamicLighting = "vertex" | "phong" | "blinn" | "cooktorrance";
	export type IBLLighting = "singlecube";
	export type LightMapping = "plain";
	export type ShadowMapping = "vsm";

	export type NormalMapping = "perturb";
	export type HeightMapping = "simple" | "parallax"; // | "conic"

	export type ValueChannel = "fixed" | "map";

	export interface PBRMetallicResponse {
		name: "pbr-metallic";
		albedo: ValueChannel;
		roughness: ValueChannel;
		metallic: ValueChannel;
	}

	export interface PBRSpecularResponse {
		name: "pbr-specular";
		albedo: ValueChannel;
		specular: ValueChannel;
		roughness: ValueChannel;
	}

	export type ColourResponse = PBRMetallicResponse | PBRSpecularResponse;

	export interface StandardShaderOptions {
		// vertex features
		vertexSkinning?: VertexSkinning;
		vertexColours?: VertexColours;

		// lighting
		dynamicLighting?: DynamicLighting;
		iblLighting?: IBLLighting;
		lightMapping?: LightMapping;
		shadowMapping?: ShadowMapping;

		// bump / height
		normalMapping?: NormalMapping;
		heightMapping?: HeightMapping;

		// colour
		colour: ColourResponse;
		emissive?: ValueChannel;
		alpha?: ValueChannel;
	}

} // ns sd.render
