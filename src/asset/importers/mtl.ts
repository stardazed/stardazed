// asset/importers/mtl - Wavefront MTL material file importer
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../importer.ts" />

namespace sd.asset.importer {

	export function importMTLData(data: Blob, uri: string) {
		return io.BlobReader.readAsText(data).then(text =>
			parseMTLSource(text, uri)
		);
	}

	registerImporter(importMTLData, "application/wavefront-mtl", "mtl");

	// ---------------

	type TextureAsset = Asset<Texture2D, parse.TextureAssetMetadata>;
	type MaterialAsset = Asset<StandardMaterial, parse.MaterialAssetMetadata>;
	interface TextureDependencies { [name: string]: TextureAsset | undefined; }

	interface MTLMaterial {
		name: string;
		colours: { [type: string]: Float3 | undefined };
		textures: { [type: string]: TextureAsset | undefined };
		specularExponent?: number;
		opacity?: number;
		roughness?: number;
		metallic?: number;
		anisotropy?: number;
		uvScale: [number, number];
		uvOffset: [number, number];
	}

	const makeMTLMaterial = (name: string): MTLMaterial => ({
		name,
		colours: {},
		textures: {},
		uvScale: [1, 1],
		uvOffset: [0, 0]
	});


	function resolveMTLColourResponse(mtl: MTLMaterial, dependencies: TextureDependencies) {
		const allMTLKeys = Object.keys(mtl).concat(Object.keys(mtl.colours)).concat(Object.keys(mtl.textures));
		const mtlIncludesSome = (tests: string[]) =>
			tests.some(t => allMTLKeys.indexOf(t) > -1);

		const colour: Partial<parse.MaterialColourMetadata> = {};

		if (mtlIncludesSome(["metallic", "roughness", "map_Pr", "map_Pm"])) {
			// PBR colour response
			if (mtlIncludesSome(["metallic", "map_Pm"])) {
				// PBR Metallic
				colour.type = "pbrMetallic";
				if (mtl.metallic !== undefined) {
					colour.metallic = mtl.metallic;
				}
				if (mtl.textures["map_Pm"]) {
					dependencies.metallicTexture = mtl.textures["map_Pm"]!;
				}
			}
			else {
				// PBR Specular
				colour.type = "pbrSpecular";
				if (mtl.textures["map_Ks"]) {
					dependencies.specularTexture = mtl.textures["map_Ks"]!;
				}
				if (mtl.colours["Ks"]) {
					colour.specularFactor = mtl.colours["Ks"];
				}
			}

			if (mtl.roughness !== void 0) {
				colour.roughness = mtl.roughness;
			}
			if (mtl.textures["map_Pr"]) {
				dependencies.roughnessTexture = mtl.textures["map_Pm"]!;
			}
		}
		else {
			// Non-PBR "classic" colour response
			if (mtlIncludesSome(["Ks", "specularExponent", "map_Ks"])) {
				// Diffuse-Specular
				colour.type = "diffuseSpecular";
				if (mtl.textures["map_Ks"]) {
					dependencies.specularTexture = mtl.textures["map_Ks"]!;
				}
				if (mtl.colours["Ks"]) {
					colour.specularFactor = mtl.colours["Ks"];
				}
				colour.specularExponent = mtl.specularExponent || 1;
			}
			else {
				// Diffuse
				colour.type = "diffuse";
			}
		}

		// shared among all colour response types
		if (mtl.textures["map_Kd"]) {
			dependencies.colourTexture = mtl.textures["map_Kd"]!;
		}
		if (mtl.colours["Kd"]) {
			colour.baseColour = mtl.colours["Kd"];
		}
		return colour;
	}


	function resolveMTLMaterial(mtl: MTLMaterial): MaterialAsset {
		const metadata: Partial<parse.MaterialAssetMetadata> = {};
		const dependencies: TextureDependencies = {};
		const material: MaterialAsset = {
			kind: "material",
			name: mtl.name,
			metadata,
			dependencies
		};

		metadata.colour = resolveMTLColourResponse(mtl, dependencies);

		// alpha, can be same as colour texture
		if (mtl.textures["map_d"]) {
			metadata.alphaCoverage = "mask";
			metadata.alphaCutoff = 0.5;
			dependencies.alphaTexture = mtl.textures["map_d"];
		}

		// normal and height
		if (mtl.textures["norm"]) {
			dependencies.normalTexture = mtl.textures["norm"];
		}
		if (mtl.textures["disp"]) {
			metadata.heightRange = 0.04;
			dependencies.heightTexture = mtl.textures["disp"];
		}

		// emissive
		if (mtl.textures["map_Ke"] || mtl.colours["Ke"]) {
			if (mtl.colours["Ke"]) {
				metadata.emissiveFactor = mtl.colours["Ke"];
			}
			if (mtl.textures["map_Ke"]) {
				dependencies.emissiveTexture = mtl.textures["map_Ke"];
			}
		}

		// anisotropy
		// TODO: apply mtl.anisotropy to all textures
		metadata.uvScale = mtl.uvScale;
		metadata.uvOffset = mtl.uvOffset;

		return material;
	}

	interface MTLTexture {
		texAsset: Asset<Texture2D>;
		uvScale: Float2 | undefined;
		uvOffset: Float2 | undefined;
	}

	function parseMTLTextureSpec(directive: string, basePath: string, line: string[]): MTLTexture | undefined {
		// only the arguments, please
		const tokens = line.slice(1);

		// the last token is the relative path of the texture (no spaces allowed)
		let relPath = tokens.pop();
		if (! relPath) {
			return undefined;
		}

		// adjust Windows-style paths to unix/web style by changing all \ to /
		relPath = relPath.replace(/\\/g, "/");

		const texAsset: TextureAsset = {
			kind: "texture",
			metadata: {
				mipmaps: "regenerate",
			},
			dependencies: {
				image: {
					uri: io.resolveRelativePath(relPath, basePath),
					metadata: {
						colourSpace: (["map_Kd", "map_Ks", "map_Ke"].indexOf(directive) > -1) ? "srgb" : "linear"
					}
				}
			}
		};

		let uvScale: Float2 | undefined;
		let uvOffset: Float2 | undefined;

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
								uvOffset = xy;
							}
							else { // -s
								uvScale = xy;
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

		return {
			texAsset,
			uvScale,
			uvOffset
		};
	}


	function parseMTLSource(text: string, path: string) {
		const lines = text.split("\n");
		let tokens: string[];
		let curMat: MTLMaterial | undefined;
		const materials: { [name: string]: MaterialAsset } = {};

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

			if (directive === "#" || directive === "") {
				continue;
			}

			if (directive === "newmtl") {
				if (checkArgCount(directive, 1)) {
					if (curMat) {
						materials[curMat.name] = resolveMTLMaterial(curMat);
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
									curMat.textures[texType] = texSpec.texAsset;
									if (texSpec.uvOffset) {
										vec2.copy(curMat.uvOffset, texSpec.uvOffset);
									}
									if (texSpec.uvScale) {
										vec2.copy(curMat.uvScale, texSpec.uvScale);
									}
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
			materials[curMat.name] = resolveMTLMaterial(curMat);
		}

		return materials;
	}

} // ns sd.asset.importer
