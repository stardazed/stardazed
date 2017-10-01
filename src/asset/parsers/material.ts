// asset/parser/material - standard material asset parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parser.ts" />

namespace sd.asset {

	export const enum AlphaCoverage {
		Ignore,
		Mask,
		Transparent
	}

	export interface DiffuseColourResponse {
		type: "diffuse";
		baseColour: Float3;
		colourTexture?: Texture2D;
	}

	export interface DiffuseSpecularColourResponse {
		type: "diffusespecular";
		baseColour: Float3;
		colourTexture?: Texture2D;

		specularFactor: Float3;
		specularExponent: number;
		specularTexture?: Texture2D;
	}

	export interface PBRMetallicColourResponse {
		type: "pbrmetallic";
		baseColour: Float3;
		colourTexture?: Texture2D;

		metallic: number; // 0: fully di-electric, 1: fully metallic
		metallicTexture?: Texture2D;

		roughness: number; // 0: fully smooth, 1: fully rough
		roughnessTexture?: Texture2D;
	}

	export interface PBRSpecularColourResponse {
		type: "pbrspecular";
		baseColour: Float3;
		colourTexture?: Texture2D;

		specularFactor: Float3;
		specularTexture?: Texture2D;
		
		roughness: number; // 0: fully smooth (default), 1: fully rough
		roughnessTexture?: Texture2D;
	}

	export type ColourResponse = DiffuseColourResponse | DiffuseSpecularColourResponse | PBRMetallicColourResponse | PBRSpecularColourResponse;
	export type AnyColourResponse = DiffuseColourResponse & DiffuseSpecularColourResponse & PBRMetallicColourResponse & PBRSpecularColourResponse;

	export const makeDiffuseResponse = (): DiffuseColourResponse => ({
		type: "diffuse",
		baseColour: [1, 1, 1]
	});

	export const makeDiffuseSpecularResponse = (source?: DiffuseColourResponse): DiffuseSpecularColourResponse => ({
		...(source || makeDiffuseResponse()),
		type: "diffusespecular",

		specularFactor: [0, 0, 0],
		specularExponent: 0,
	});

	export const makePBRMetallicResponse = (source?: DiffuseColourResponse): PBRMetallicColourResponse => ({
		...(source || makeDiffuseResponse()),
		type: "pbrmetallic",

		metallic: 1,
		roughness: 1,
	});

	export const makePBRSpecularResponse = (source?: DiffuseColourResponse): PBRSpecularColourResponse => ({
		...(source || makeDiffuseResponse()),
		type: "pbrspecular",

		specularFactor: [1, 1, 1],
		roughness: 1,
	});

	export interface Material {
		materialID: string;
	}

	export interface StandardMaterial extends Material {
		colour: ColourResponse;
		
		alphaCoverage: AlphaCoverage;
		alphaCutoff: number;
		alphaFactor: number;
		alphaTexture?: Texture2D;

		normalTexture?: Texture2D;
		ambientOcclusionTexture?: Texture2D;

		heightRange: number;
		heightTexture?: Texture2D;

		emissiveFactor: Float3;
		emissiveTexture?: Texture2D;

		doubleSided: boolean;
		uvScale: Float2;
		uvOffset: Float2;
	}

	export const makeStandardMaterial = (colour?: ColourResponse): StandardMaterial => ({
		materialID: "standard",

		colour: colour || makeDiffuseResponse(),

		alphaCoverage: AlphaCoverage.Ignore,
		alphaCutoff: 0,
		alphaFactor: 1,

		heightRange: 0,

		emissiveFactor: [0, 0, 0],

		doubleSided: false,
		uvScale: [1, 1],
		uvOffset: [0, 0]
	});

	export interface CacheAccess {
		(kind: "material", name: string): Material;
	}


	export namespace parser {

		export interface MaterialColourMetadata {
			type: "diffuse" | "diffuseSpecular" | "pbrMetallic" | "pbrSpecular";

			baseColour: Float3;
			specularFactor: Float3;
			specularExponent: number;
			metallic: number;
			roughness: number;
		}

		export interface MaterialAssetMetadata {
			colour: Partial<MaterialColourMetadata>;

			doubleSided: boolean;
			uvScale: Float2;
			uvOffset: Float2;

			alphaCoverage: "ignore" | "mask" | "transparent";
			alphaFactor: number;
			alphaCutoff: number;

			emissiveFactor: Float3;
			heightRange: number;
		}

		type TextureAsset = Asset<Texture2D, TextureAssetMetadata>;

		interface MaterialDependencies {
			colourTexture?: TextureAsset;
			metallicTexture?: TextureAsset;
			roughnessTexture?: TextureAsset;
			specularTexture?: TextureAsset;
			alphaTexture?: TextureAsset;
			emissiveTexture?: TextureAsset;
			normalTexture?: TextureAsset;
			heightTexture?: TextureAsset;
			ambientOcclusionTexture?: TextureAsset;
		}

		export function parseMaterial(asset: Asset<StandardMaterial, MaterialAssetMetadata>) {
			const meta = asset.metadata || {};
			const deps = (asset.dependencies || {}) as any as MaterialDependencies;

			let colour: ColourResponse;
			const colourType = meta.colour && meta.colour.type;
			switch (colourType) {
				case "diffuse": colour = getDiffuseResponseData(meta, deps); break;
				case "diffuseSpecular": colour = getDiffuseSpecularResponseData(meta, deps); break;
				case "pbrMetallic": colour = getPBRMetallicResponseData(meta, deps); break;
				case "pbrSpecular": colour = getPBRSpecularResponseData(meta, deps); break;
				default:
					throw new Error("Material parser: missing or invalid colour type.");
			}

			const mat = makeStandardMaterial(colour);
			mat.alphaCoverage = getAlphaCoverage(meta, mat.alphaCoverage);
			mat.alphaCutoff = getAlphaCutoff(meta, mat.alphaCutoff);
			mat.alphaFactor = getAlphaFactor(meta, mat.alphaFactor);
			mat.heightRange = getHeightRange(meta, mat.heightRange);
			mat.emissiveFactor = getEmissiveFactor(meta, mat.emissiveFactor);
			mat.doubleSided = getDoubleSided(meta, mat.doubleSided);
			mat.uvScale = getUVScale(meta, mat.uvScale);
			mat.uvOffset = getUVOffset(meta, mat.uvOffset);

			mat.alphaTexture = validTexAssetOrFallback(deps.alphaTexture, mat.alphaTexture);
			mat.normalTexture = validTexAssetOrFallback(deps.normalTexture, mat.normalTexture);
			mat.heightTexture = validTexAssetOrFallback(deps.heightTexture, mat.heightTexture);
			mat.ambientOcclusionTexture = validTexAssetOrFallback(deps.ambientOcclusionTexture, mat.ambientOcclusionTexture);
			mat.emissiveTexture = validTexAssetOrFallback(deps.emissiveTexture, mat.emissiveTexture);

			asset.item = mat;
			return Promise.resolve(asset);
		}

		registerParser("material", parseMaterial);

		// ----------------

		/**
		 * Try to interpret the passed value as a float array.
		 * Returns undefined in case of failure.
		 * @param f3 A value presumed to be a valid Float3
		 * @param len The required length of the vector
		 */
		const parseFloatArray = (fx: any, len: number) => {
			let res: Float32Array | undefined;
			if (Array.isArray(fx) && fx.length === len) {
				res = new Float32Array(fx);
				if (fx.some(f => isNaN(f))) {
					res = undefined;
				}
			}
			return res;
		};

		const parseFloatValue = (f: any) => {
			const res = parseFloat(f);
			if (typeof res === "number" && !isNaN(res)) {
				return res;
			}
			return undefined;
		};

		const getBaseColour = (colour: Partial<MaterialColourMetadata>, def: Float3) => {
			if (colour.baseColour !== void 0) {
				const f3 = parseFloatArray(colour.baseColour, 3);
				if (f3 && f3.every(f => f >= 0)) {
					return f3;
				}
				console.warn(`Material parser: ignoring invalid baseColour`, colour.baseColour);
			}
			return def;
		};

		const getSpecularFactor = (colour: Partial<MaterialColourMetadata>, def: Float3) => {
			if (colour.specularFactor !== void 0) {
				const f3 = parseFloatArray(colour.specularFactor, 3);
				if (f3 && f3.every(f => f >= 0)) {
					return f3;
				}
				console.warn(`Material parser: ignoring invalid specularFactor`, colour.specularFactor);
			}
			return def;
		};

		const getSpecularExponent = (colour: Partial<MaterialColourMetadata>, def: number) => {
			if (colour.specularExponent !== void 0) {
				const f = parseFloatValue(colour.specularExponent);
				if (f !== void 0 && f > 0 && f < 256) {
					return f;
				}
				console.warn(`Material parser: ignoring invalid specularExponent`, colour.specularExponent);
			}
			return def;
		};

		const getMetallicFactor = (colour: Partial<MaterialColourMetadata>, def: number) => {
			if (colour.metallic !== void 0) {
				const f = parseFloatValue(colour.metallic);
				if (f !== void 0 && f >= 0 && f <= 1) {
					return f;
				}
				console.warn(`Material parser: ignoring invalid metallicFactor`, colour.metallic);
			}
			return def;
		};

		const getRoughnessFactor = (colour: Partial<MaterialColourMetadata>, def: number) => {
			if (colour.roughness !== void 0) {
				const f = parseFloatValue(colour.roughness);
				if (f !== void 0 && f >= 0) {
					return f;
				}
				console.warn(`Material parser: ignoring invalid roughnessFactor`, colour.roughness);
			}
			return def;
		};

		const getAlphaCoverage = (meta: Partial<MaterialAssetMetadata>, def: AlphaCoverage) => {
			switch (meta.alphaCoverage) {
				case "ignore": return AlphaCoverage.Ignore;
				case "mask": return AlphaCoverage.Mask;
				case "transparent": return AlphaCoverage.Transparent;
				case void 0: return def;
			}
			console.warn(`Material parser: ignoring invalid alphaCoverage`, meta.alphaCoverage);
			return def;
		};

		const getAlphaCutoff = (meta: Partial<MaterialAssetMetadata>, def: number) => {
			if (meta.alphaCutoff !== void 0) {
				const f = parseFloatValue(meta.alphaCutoff);
				if (f !== void 0 && f >= 0 && f <= 1) {
					return f;
				}
				console.warn(`Material parser: ignoring invalid alphaCutoff`, meta.alphaCutoff);
			}
			return def;
		};

		const getAlphaFactor = (meta: Partial<MaterialAssetMetadata>, def: number) => {
			if (meta.alphaFactor !== void 0) {
				const f = parseFloatValue(meta.alphaFactor);
				if (f !== void 0 && f >= 0) {
					return f;
				}
				console.warn(`Material parser: ignoring invalid alphaFactor`, meta.alphaFactor);
			}
			return def;
		};

		const getHeightRange = (meta: Partial<MaterialAssetMetadata>, def: number) => {
			if (meta.heightRange !== void 0) {
				const f = parseFloatValue(meta.heightRange);
				if (f !== void 0) {
					return f;
				}
				console.warn(`Material parser: ignoring invalid heightRange`, meta.heightRange);
			}
			return def;
		};

		const getEmissiveFactor = (meta: Partial<MaterialAssetMetadata>, def: Float3) => {
			if (meta.emissiveFactor !== void 0) {
				const f3 = parseFloatArray(meta.emissiveFactor, 3);
				if (f3 && f3.every(f => f >= 0)) {
					return f3;
				}
				console.warn(`Material parser: ignoring invalid emissiveFactor`, meta.emissiveFactor);
			}
			return def;
		};

		const getDoubleSided = (meta: Partial<MaterialAssetMetadata>, def: boolean) => {
			if (meta.doubleSided !== void 0) {
				if (meta.doubleSided === true || meta.doubleSided === false) {
					return meta.doubleSided;
				}
				console.warn(`Material parser: ignoring invalid doubleSided`, meta.doubleSided);
			}
			return def;
		};

		const getUVScale = (meta: Partial<MaterialAssetMetadata>, def: Float2) => {
			if (meta.uvScale !== void 0) {
				const f2 = parseFloatArray(meta.uvScale, 2);
				if (f2) {
					return f2;
				}
				console.warn(`Material parser: ignoring invalid uvScale`, meta.uvScale);
			}
			return def;
		};

		const getUVOffset = (meta: Partial<MaterialAssetMetadata>, def: Float2) => {
			if (meta.uvOffset !== void 0) {
				const f2 = parseFloatArray(meta.uvOffset, 2);
				if (f2) {
					return f2;
				}
				console.warn(`Material parser: ignoring invalid uvOffset`, meta.uvOffset);
			}
			return def;
		};

		// ------------

		const validTexAssetOrFallback = (asset: Asset<Texture2D> | undefined, original: Texture2D | undefined) => {
			if (asset) {
				if (asset.kind === "texture") {
					if (asset.item) {
						return asset.item;
					}
					else {
						console.warn(`Material parser: texture dependency was not loaded, skipping.`, asset);
					}
				}
				else {
					console.warn(`Material parser: dependency is not a texture, skipping.`, asset);
				}
			}
			return original;
		};

		function getDiffuseResponseData(meta: Partial<MaterialAssetMetadata>, deps: MaterialDependencies) {
			const response = makeDiffuseResponse();
			const colour = meta.colour!;

			response.baseColour = getBaseColour(colour, response.baseColour);
			response.colourTexture = validTexAssetOrFallback(deps.colourTexture, response.colourTexture);

			return response;
		}

		function getDiffuseSpecularResponseData(meta: Partial<MaterialAssetMetadata>, deps: MaterialDependencies) {
			const response = makeDiffuseSpecularResponse(getDiffuseResponseData(meta, deps));
			const colour = meta.colour!;
			
			response.specularFactor = getSpecularFactor(colour, response.specularFactor);
			response.specularExponent = getSpecularExponent(colour, response.specularExponent);
			response.specularTexture = validTexAssetOrFallback(deps.specularTexture, response.specularTexture);

			return response;
		}

		function getPBRMetallicResponseData(meta: Partial<MaterialAssetMetadata>, deps: MaterialDependencies) {
			const response = makePBRMetallicResponse(getDiffuseResponseData(meta, deps));
			const colour = meta.colour!;

			response.metallic = getMetallicFactor(colour, response.metallic);
			response.roughness = getRoughnessFactor(colour, response.roughness);
			response.metallicTexture = validTexAssetOrFallback(deps.metallicTexture, response.metallicTexture);
			response.roughnessTexture = validTexAssetOrFallback(deps.roughnessTexture, response.roughnessTexture);

			return response;
		}

		function getPBRSpecularResponseData(meta: Partial<MaterialAssetMetadata>, deps: MaterialDependencies) {
			const response = makePBRSpecularResponse(getDiffuseResponseData(meta, deps));
			const colour = meta.colour!;

			response.specularFactor = getSpecularFactor(colour, response.specularFactor);
			response.roughness = getRoughnessFactor(colour, response.roughness);
			response.specularTexture = validTexAssetOrFallback(deps.specularTexture, response.specularTexture);
			response.roughnessTexture = validTexAssetOrFallback(deps.roughnessTexture, response.roughnessTexture);

			return response;
		}

	} // ns parser

} // ns sd.asset
