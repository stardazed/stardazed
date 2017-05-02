// system/scenerenderer - the default scene rendering system
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	export interface MaterialProperty {
		group?: string;
		key: string;
		label: string;

		type: "enum" | "value" | "map" | "map-or-value";
		
		mapping?: "rgb" | "rgba" | "r" | "g" | "b" | "a";
		valueDefault?: number | number[];

		// only for single-channel props
		valueMin?: number;
		valueMax?: number;
	}

	export interface MaterialInstance {
		readonly materialName: string;
		name: string;
	}

	export interface MaterialClass<T extends MaterialInstance> {
		name: string;
		properties: MaterialProperty[];
		makeInstance(name: string): T;
	}

	// ----

	export const enum AlphaMode {
		Opaque,
		Cutout,
		Transparent,
		Fade
	}

	export interface StandardMaterialData extends MaterialInstance {
		alphaMode: AlphaMode;

		tintColour: Float4;
		albedoTexture?: render.Texture;  // rgb
		alphaTexture?: render.Texture;   // a

		alphaCutoff: number;

		emissiveColour: Float3;
		emissiveIntensity: number;
		emissiveTexture?: render.Texture;

		normalTexture: render.Texture;	// rgb
		heightTexture: render.Texture;	// a

		roughness: number;
		metallic: number;
		roughnessTexture?: render.Texture;       // r
		metallicTexture?: render.Texture;        // g
		ambientOcclusionTexture: render.Texture; // b

		texScaleOffset: Float4;
	}

	export class StandardMaterialClass implements MaterialClass<StandardMaterialData> {
		name: "standard";
		properties: MaterialProperty[] = [
			{
				key: "alphaMode",
				label: "Alpha Mode",
				type: "enum",
				valueDefault: 0,
				valueMin: 0,
				valueMax: 3
			},

			{
				group: "colour",
				key: "tintColour",
				label: "Tint Colour",
				type: "value",
				valueDefault: [1, 1, 1, 1]
			},
			{
				group: "colour",
				key: "albedoTexture",
				label: "Albedo Map",
				type: "map",
				mapping: "rgb"
			},
			{
				group: "colour",
				key: "alphaTexture",
				label: "Alpha Map",
				type: "map",
				mapping: "a"
			},
			{
				key: "alphaCutoff",
				label: "Alpha Cutoff",
				type: "value",
				valueDefault: 1,
				valueMin: 0,
				valueMax: 1
			},

			{
				group: "emissive",
				key: "emissiveColour",
				label: "Emissive Colour",
				type: "map-or-value",
				mapping: "rgb"
			},
			{
				key: "emissiveIntensity",
				label: "Emissive Intensity",
				type: "value",
				valueDefault: 0,
				valueMin: 0
			},

			{
				group: "bump",
				key: "normalTexture",
				label: "Normal Map",
				type: "map",
				mapping: "rgb"
			},
			{
				group: "bump",
				key: "heightTexture",
				label: "Height Map",
				type: "map",
				mapping: "a"
			},

			{
				group: "roughMetal",
				key: "roughness",
				label: "Roughness",
				type: "map-or-value",
				mapping: "r",
				valueDefault: 0,
				valueMin: 0,
				valueMax: 1
			},
			{
				group: "roughMetal",
				key: "metallic",
				label: "Metallic",
				type: "map-or-value",
				mapping: "g",
				valueDefault: 0,
				valueMin: 0,
				valueMax: 1
			},
			{
				key: "ambientOcclusionTexture",
				label: "Ambient Occlusion",
				type: "map",
				mapping: "b"
			},

			{
				key: "texScaleOffset",
				label: "Texture Scale / Offset",
				type: "value",
				valueDefault: [1, 1, 0, 0]
			}
		];

		makeInstance() {
			return {} as StandardMaterialData;
		}
	}

} // ns sd
