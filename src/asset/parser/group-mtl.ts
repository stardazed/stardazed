// asset/parser/group-mtl - Wavefront MTL material file parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./group.ts" />

namespace sd.asset.parser {

	export const parseMTLGroup = (resource: RawAsset<GroupAssetMetadata>) =>
		getText(resource).then(text =>
			parseMTLSource(resource.dataPath || "", text)
		);

	registerFileExtension("mtl", "application/wavefront-mtl");
	registerGroupParser(parseMTLGroup as any, "application/wavefront-mtl");
		

	interface MTLMaterial {
		name: string;
		colours: { [type: string]: Float3 | undefined };
		textures: { [type: string]: RawAsset<TextureAssetMetadata> | undefined };
		specularExponent?: number;
		opacity?: number;
		roughness?: number;
		metallic?: number;
		anisotropy?: number;
	}

	const makeMTLMaterial = (name: string): MTLMaterial => ({
		name,
		colours: {},
		textures: {}
	});

	function* resolveMTLColourResponse(mtl: MTLMaterial) {
		const allMTLKeys = Object.keys(mtl).concat(Object.keys(mtl.colours)).concat(Object.keys(mtl.textures));
		const mtlIncludesSome = (tests: string[]) =>
			tests.some(t => allMTLKeys.indexOf(t) > -1);

		let colour: DiffuseColourResponse | DiffuseSpecularColourResponse |
			PBRMetallicColourResponse | PBRSpecularColourResponse;

		if (mtlIncludesSome(["metallic", "roughness", "map_Pr", "map_Pm"])) {
			// PBR colour response
			let pbr: PBRMetallicColourResponse | PBRSpecularColourResponse;
			let metallicTexAsset: RawAsset | undefined;
			let roughnessTexAsset: RawAsset | undefined;

			if (mtlIncludesSome(["metallic", "map_Pm"])) {
				// PBR Metallic
				pbr = makePBRMetallicResponse();
				if (mtl.metallic !== undefined) {
					pbr.metallic = mtl.metallic;
				}
				if (mtl.textures["map_Pm"]) {
					metallicTexAsset = mtl.textures["map_Pm"]!;
				}
			}
			else {
				// PBR Specular
				pbr = makePBRSpecularResponse();
				const specTex = mtl.textures["map_Ks"];
				if (specTex) {
					pbr.specularTexture = yield mtl.textures["map_Ks"]!;
				}

				const defaultSpecularColour = [1, 1, 1];
				pbr.specularFactor = mtl.colours["Ks"] || defaultSpecularColour;
			}

			if (mtl.roughness !== undefined) {
				pbr.roughness = mtl.roughness;
			}
			if (mtl.textures["map_Pr"]) {
				roughnessTexAsset = mtl.textures["map_Pm"]!;
			}

			// resolve potentially shared RM texture
			if (metallicTexAsset || roughnessTexAsset) {
				if (metallicTexAsset && roughnessTexAsset && metallicTexAsset.dataPath === roughnessTexAsset.dataPath) {
					pbr.roughnessTexture = (pbr as PBRMetallicColourResponse).metallicTexture = yield roughnessTexAsset;
				}
				else {
					if (metallicTexAsset) {
						(pbr as PBRMetallicColourResponse).metallicTexture = yield metallicTexAsset;
					}
					if (roughnessTexAsset) {
						pbr.roughnessTexture = yield roughnessTexAsset;
					}
				}
			}

			colour = pbr;
		}
		else {
			// Non-PBR "classic" colour response
			let classic: DiffuseColourResponse | DiffuseSpecularColourResponse;
			if (mtlIncludesSome(["Ks", "specularExponent", "map_Ks"])) {
				// Diffuse-Specular
				classic = makeDiffuseSpecularResponse();
				const specTex = mtl.textures["map_Ks"];
				if (specTex) {
					classic.specularTexture = yield mtl.textures["map_Ks"]!;
				}

				const defaultSpecularColour = [1, 1, 1];
				classic.specularFactor = mtl.colours["Ks"] || defaultSpecularColour;
				classic.specularExponent = mtl.specularExponent || 1;
			}
			else {
				// Diffuse
				classic = makeDiffuseResponse();
			}
			colour = classic;
		}

		// shared among all colour response types
		if (mtl.textures["map_Kd"]) {
			colour.colourTexture = yield mtl.textures["map_Kd"]!;
		}
		colour.baseColour = mtl.colours["Kd"] || [1, 1, 1];
		return colour;
	}

	function* resolveMTLMaterial(mtl: MTLMaterial) {
		const colour = yield* resolveMTLColourResponse(mtl);
		const material = makeMaterial(mtl.name, colour);

		// alpha, can be same as colour texture
		if (mtl.textures["map_d"]) {
			material.alphaCoverage = AlphaCoverage.Mask;
			material.alphaCutoff = 0.5;
			
			const alphaTexAsset = mtl.textures["map_d"]!;
			const colourTexAsset = mtl.textures["map_Kd"];
			if (colourTexAsset && colourTexAsset.dataPath === alphaTexAsset.dataPath) {
				material.alphaTexture = colour.colourTexture;
			}
			else {
				material.alphaTexture = yield alphaTexAsset;
			}
		}

		// normal and height
		const normalTexAsset = mtl.textures["norm"];
		const heightTexAsset = mtl.textures["disp"];
		if (heightTexAsset) {
			material.heightRange = 0.04;
		}
		if (normalTexAsset && heightTexAsset && normalTexAsset.dataPath === heightTexAsset.dataPath) {
			material.normalTexture = material.heightTexture = yield normalTexAsset;
		}
		else {
			if (normalTexAsset) {
				material.normalTexture = yield normalTexAsset;
			}
			if (heightTexAsset) {
				material.heightTexture = yield heightTexAsset;
			}
		}

		// emissive
		if (mtl.textures["map_Ke"] || mtl.colours["Ke"]) {
			material.emissiveFactor = mtl.colours["Ke"] || [1, 1, 1];
			if (mtl.textures["map_Ke"]) {
				material.emissiveTexture = yield mtl.textures["map_Ke"]!;
			}
		}

		// anisotropy
		// TODO: apply mtl.anisotropy to all textures

		return material;
	}


	function parseMTLTextureSpec(directive: string, basePath: string, line: string[]): RawAsset | undefined {
		if (line.length < 2) {
			return undefined;
		}
		// only the arguments, please
		const tokens = line.slice(1);

		// the last token is the relative path of the texture (no spaces allowed)
		const relPath = tokens.pop()!;

		const spec: RawAsset<TextureAssetMetadata> = {
			kind: "texture",
			metadata: {
				mipmaps: "regenerate",
				image: {
					kind: "image",
					dataPath: io.resolveRelativePath(relPath, basePath),
					metadata: {
						colourSpace: (["map_Kd", "map_Ks", "map_Ke"].indexOf(directive) > -1) ? "srgb" : "linear",
					}
				},	
			}
		};

		// what remains are texture options
		// SD only supports -o and -s for now and only with both u and v values
		let tix = 0;
		while (tix < tokens.length) {
			const opt = tokens[tix];
			switch (opt) {
				case "-o": // offset
				case "-s": // scale
					if (tix < tokens.length - 2) {
						const xy = [
							parseFloat(tokens[++tix]),
							parseFloat(tokens[++tix])
						];
						if (isNaN(xy[0]) || isNaN(xy[1])) {
							console.warn(`MTL parser: invalid vector for texture option ${opt} in line "${line.join(" ")}" in asset ${basePath}"`);
						}
						else {
							// TODO: collect scale and offset data and place in material
							if (opt === "-o") {
								// spec.metadata.uvOffset = xy;
							}
							else { // -s
								// spec.metadata.uvScale = xy;
							}
						}
					}
					else {
						// malformed options probably means big trouble so return nothing, warning is issued in calling function
						return undefined;
					}
					break;
				default:
					break;
			}

			tix += 1;
		}

		return spec;
	}


	function* parseMTLSource(path: string, text: string) {
		const group = new AssetGroup();

		const lines = text.split("\n");
		let tokens: string[];
		let curMat: MTLMaterial | undefined;

		const checkArgCount = (cmd: string, count: number) => {
			const ok = count === tokens.length - 1;
			if (! ok) {
				console.warn(`MTL parser: invalid args for "${cmd}" for material "${curMat!.name}" in asset "${path}"`);
			}
			return ok;
		};

		const getFloatArgs = (cmd: string, count: number) => {
			let result: number[] | undefined;
			if (checkArgCount(cmd, count)) {
				result = tokens.slice(1).map(sv => parseFloat(sv));
				if (! result.every(v => !isNaN(v))) {
					console.warn(`MTL parser: invalid args for "${cmd}" for material "${curMat!.name}" in asset "${path}"`);
					return undefined;
				}
			}
			return result;
		};

		for (const line of lines) {
			tokens = line.trim().split(/ +/);
			const directive = tokens[0];

			if (directive === "newmtl") {
				if (checkArgCount(directive, 1)) {
					if (curMat) {
						group.addMaterial(yield* resolveMTLMaterial(curMat));
					}
					const matName = tokens[1];
					curMat = makeMTLMaterial(matName);
				}
			}
			else {
				if (! curMat) {
					throw new Error(`MTL parser: invalid MTL data, first directive must be "newmtl", but got "${directive}"`);
				}
				else {
					switch (directive) {
						// colour directives
						case "Kd":
						case "Ks":
						case "Ke": {
							const colour = getFloatArgs(directive, 3);
							if (colour) {
								const nonBlack = vec3.length(colour) > 0;
								if (directive === "Kd" || nonBlack) {
									curMat.colours[directive] = vec3.copy([], colour);
								}
							}
							break;
						}

						// single value directives
						case "Ns":
						case "Pr":
						case "Pm":
						case "aniso": {
							const value = getFloatArgs(directive, 1);
							if (value) {
								if (directive === "Ns") {
									const specFraction = (tokens[1].split(".")[1]) || "";
									// Handle case where many old mtl files have a now meaningless spec exponent
									// with a very precise fraction, usually something like 96.078431.
									// These values will be ignored here, so keep your exponents reasonable.
									// Also checks for <= 0 as those are not usable exponents.
									if (value[0] > 0 && (value[0] < 90 || specFraction.length < 5)) {
										curMat.specularExponent = math.clamp(value[0], 0, 128);
									}
									else {
										console.info(`MTL parser: ignoring invalid or legacy Ns value for material "${curMat.name}" in asset "${path}"`);
									}
								}
								else if (directive === "Pr") { curMat.roughness = math.clamp01(value[0]); }
								else if (directive === "Pm") { curMat.metallic = math.clamp01(value[0]); }
								else if (directive === "aniso") { curMat.anisotropy = math.clamp(value[0], 1, 16); }
							}
							break;
						}

						// opacity
						case "d":
						case "Tr": {
							const opacity = getFloatArgs(directive, 1);
							if (opacity) {
								// the Tr directive is the inverse of the d directive
								if (directive === "Tr") {
									opacity[0] = 1.0 - opacity[0];
								}

								// don't do special processing for default opacity
								opacity[0] = math.clamp01(opacity[0]);
								if (opacity[0] < 1) {
									curMat.opacity = opacity[0];
								}
							}
							break;
						}

						// texture map directives
						case "map_Kd":
						case "map_Ks":
						case "map_Ke":
						case "map_Pr":
						case "map_Pm":
						case "map_d":
						case "map_Tr":
						case "norm":
						case "bump":
						case "disp": {
							const texSpec = parseMTLTextureSpec(directive, path, tokens);
							if (texSpec) {
								if (directive === "map_Tr") {
									console.warn(`MTL parser: unsupported map_Tr texture (convert to a map_d) for material "${curMat.name}" in asset "${path}"`);
								}
								else {
									const texType = directive === "bump" ? "norm" : directive;
									curMat.textures[texType] = texSpec;
								}
							}
							else {
								console.warn(`MTL parser: invalid texture "${directive}" for material "${curMat.name}" in asset "${path}"`);
							}
							break;
						}

						default:
							// other fields are either esoteric or filled with nonsense data
							break;
					}
				}
			}
		}

		if (curMat) {
			group.addMaterial(yield* resolveMTLMaterial(curMat));
		}

		return group;
	}

} // ns sd.asset.parser
