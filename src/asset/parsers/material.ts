// asset/parser/material - standard material assets
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../library.ts" />

namespace sd.asset {

	export namespace parser {

		export interface MaterialColourMetadata {
			type: "diffuse" | "diffuseSpecular" | "pbrMetallic" | "pbrSpecular";

			baseColour: Float3;
			specularFactor: Float3;
			specularExponent: number;
			metallic: number;
			roughness: number;

			colourTexture: RawAsset<TextureAssetMetadata>;
			metallicTexture: RawAsset<TextureAssetMetadata>;
			roughnessTexture: RawAsset<TextureAssetMetadata>;
			specularTexture: RawAsset<TextureAssetMetadata>;
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

			alphaTexture: RawAsset<TextureAssetMetadata>;
			emissiveTexture: RawAsset<TextureAssetMetadata>;
			normalTexture: RawAsset<TextureAssetMetadata>;
			heightTexture: RawAsset<TextureAssetMetadata>;
			ambientOcclusionTexture: RawAsset<TextureAssetMetadata>;
		}

		// ----------------

		type RawTextureRole = "colour" | "metallic" | "roughness" | "specular" | "alpha" | "emissive" | "normal" | "height" | "ao";

		class RawTextures {
			roles: RawTextureRole[] = [];
			rawAssets: RawAsset<TextureAssetMetadata>[] = [];

			add(role: RawTextureRole, tex: RawAsset<TextureAssetMetadata> | undefined) {
				if (tex !== void 0) {
					if (isRawAsset(tex) && tex.kind === "texture") {
						this.roles.push(role);
						this.rawAssets.push(tex);
					}
					else {
						console.warn(`Material parser: ignoring invalid texture asset`, tex);
					}
				}
			}

			resolve() {
				const uniques = new Map<string, { tex: RawAsset<TextureAssetMetadata>, roles: RawTextureRole[] }>();

				for (let ix = 0; ix < this.roles.length; ++ix) {
					const role = this.roles[ix];
					const tex = this.rawAssets[ix];
					const path = (tex.metadata.image && tex.metadata.image.dataPath) || "missing_image_path";
					const entry = uniques.get(path);
					if (! entry) {
						uniques.set(path, { tex, roles: [role] });
					}
					else {
						entry.roles.push(role);
					}
				}

				const result = new Map<RawAsset<TextureAssetMetadata>, RawTextureRole[]>();
				uniques.forEach(({ tex, roles }) => {
					result.set(tex, roles);
				});

				return result;
			}
		}

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

		function getDiffuseResponseData(meta: Partial<MaterialAssetMetadata>, rawTex: RawTextures) {
			const response = makeDiffuseResponse();
			const colour = meta.colour!;

			response.baseColour = getBaseColour(colour, response.baseColour);
			rawTex.add("colour", colour.colourTexture);

			return response;
		}

		function getDiffuseSpecularResponseData(meta: Partial<MaterialAssetMetadata>, rawTex: RawTextures) {
			const response = makeDiffuseSpecularResponse(getDiffuseResponseData(meta, rawTex));
			const colour = meta.colour!;
			
			response.specularFactor = getSpecularFactor(colour, response.specularFactor);
			response.specularExponent = getSpecularExponent(colour, response.specularExponent);
			rawTex.add("specular", colour.specularTexture);

			return response;
		}

		function getPBRMetallicResponseData(meta: Partial<MaterialAssetMetadata>, rawTex: RawTextures) {
			const response = makePBRMetallicResponse(getDiffuseResponseData(meta, rawTex));
			const colour = meta.colour!;

			response.metallic = getMetallicFactor(colour, response.metallic);
			response.roughness = getRoughnessFactor(colour, response.roughness);
			rawTex.add("metallic", colour.metallicTexture);
			rawTex.add("roughness", colour.roughnessTexture);

			return response;
		}

		function getPBRSpecularResponseData(meta: Partial<MaterialAssetMetadata>, rawTex: RawTextures) {
			const response = makePBRSpecularResponse(getDiffuseResponseData(meta, rawTex));
			const colour = meta.colour!;

			response.specularFactor = getSpecularFactor(colour, response.specularFactor);
			response.roughness = getRoughnessFactor(colour, response.roughness);
			rawTex.add("specular", colour.specularTexture);
			rawTex.add("roughness", colour.roughnessTexture);

			return response;
		}

		function assignTextures(mat: Material, textures: Texture2D[], rolesPerTex: RawTextureRole[][]) {
			for (let ix = 0; ix < textures.length; ++ix) {
				const tex = textures[ix];
				const roles = rolesPerTex[ix];
				for (const role of roles) {
					switch (role) {
						case "colour": mat.colour.colourTexture = tex; break;
						case "metallic": (mat.colour as PBRMetallicColourResponse).metallicTexture = tex; break;
						case "roughness": (mat.colour as PBRMetallicColourResponse).roughnessTexture = tex; break;
						case "specular": (mat.colour as PBRSpecularColourResponse).specularTexture = tex; break;
						case "alpha": mat.alphaTexture = tex; break;
						case "emissive": mat.emissiveTexture = tex; break;
						case "normal": mat.normalTexture = tex; break;
						case "height": mat.heightTexture = tex; break;
						case "ao": mat.ambientOcclusionTexture = tex; break;
					}
				}
			}
		}

		/**
		 * Create a standard Material.
		 * @param resource The source data to be parsed
		 */
		export function* parseMaterial(resource: RawAsset<MaterialAssetMetadata>) {
			const rawTex = new RawTextures();
			const meta = resource.metadata;

			let colour: ColourResponse;
			const colourType = meta.colour && meta.colour.type;
			switch (colourType) {
				case "diffuse": colour = getDiffuseResponseData(meta, rawTex); break;
				case "diffuseSpecular": colour = getDiffuseSpecularResponseData(meta, rawTex); break;
				case "pbrMetallic": colour = getPBRMetallicResponseData(meta, rawTex); break;
				case "pbrSpecular": colour = getPBRSpecularResponseData(meta, rawTex); break;
				default:
					throw new Error("Material parser: missing or invalid colour type.");
			}

			const mat = makeMaterial(resource.name, colour);
			mat.alphaCoverage = getAlphaCoverage(meta, mat.alphaCoverage);
			mat.alphaCutoff = getAlphaCutoff(meta, mat.alphaCutoff);
			mat.alphaFactor = getAlphaFactor(meta, mat.alphaFactor);
			mat.heightRange = getHeightRange(meta, mat.heightRange);
			mat.emissiveFactor = getEmissiveFactor(meta, mat.emissiveFactor);
			mat.doubleSided = getDoubleSided(meta, mat.doubleSided);
			mat.uvScale = getUVScale(meta, mat.uvScale);
			mat.uvOffset = getUVOffset(meta, mat.uvOffset);

			rawTex.add("alpha", meta.alphaTexture);
			rawTex.add("normal", meta.normalTexture);
			rawTex.add("height", meta.heightTexture);
			rawTex.add("ao", meta.ambientOcclusionTexture);
			rawTex.add("emissive", meta.emissiveTexture);

			const texBindings = rawTex.resolve();
			const texAssets = Array.from(texBindings.keys());
			const texRoles = Array.from(texBindings.values());
			const textures: Texture2D[] = yield texAssets;
			assignTextures(mat, textures, texRoles);
			
			return mat;
		}

	} // ns parser


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


	export interface Material extends Asset {
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

	export const makeMaterial = (name?: string, colour?: ColourResponse): Material => ({
		...makeAsset("material", name),
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

	export interface Library {
		loadMaterial(ra: parser.RawAsset): Promise<Material>;
		materialByName(name: string): Material | undefined;
	}
	registerAssetLoaderParser("material", parser.parseMaterial);

} // ns sd.asset
