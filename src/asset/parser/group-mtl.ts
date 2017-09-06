// asset/parser/group-mtl - Wavefront MTL material file parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./group.ts" />

namespace sd.asset.parser {

	export const parseMTLGroup = (blob: Blob, path: string, _options: Partial<GroupAssetOptions>) =>
		io.BlobReader.readAsText(blob).then(text =>
			parseMTLSource(path, text)
		);

	registerFileExtension("mtl", "application/wavefront-mtl");
	registerGroupParser(parseMTLGroup, "application/wavefront-mtl");
		

	interface MTLTextureSpec {
		relPath: string;
		texOffset?: number[];
		texScale?: number[];
	}

	function parseMTLTextureSpec(line: string[]): MTLTextureSpec | null {
		if (line.length < 2) {
			return null;
		}

		// only the arguments, please
		const tokens = line.slice(1);

		const spec: MTLTextureSpec = {
			// the last token is the relative path of the texture (no spaces allowed)
			relPath: tokens.pop()!
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
							// TODO: report invalid vector
						}
						else {
							if (opt === "-o") {
								spec.texOffset = xy;
							}
							else {
								spec.texScale = xy;
							}
						}
					}
					else {
						// TODO: report invalid option
					}
					break;
				default:
					break;
			}

			tix += 1;
		}

		return spec;
	}


	function parseMTLSource(path: string, text: string) {
		const group = new AssetGroup();

		const lines = text.split("\n");
		let tokens: string[];
		let curMat: Material | null = null;
		const urlTexMap = new Map<string, asset.Texture2D>();

		const checkArgCount = (c: number) => {
			const ok = (c === tokens.length - 1);
			if (! ok) {
				// TODO: emit warning in asset loader
			}
			return ok;
		};

		for (const line of lines) {
			tokens = line.trim().split(/ +/);
			const directive = tokens[0];

			if (directive === "newmtl") {
				if (checkArgCount(1)) {
					if (curMat) {
						group.addMaterial(curMat);
					}
					const matName = tokens[1];
					curMat = makeMaterial(matName);
				}
			}
			else {
				if (! curMat) {
					// TODO: emit warning in asset loader
				}
				else {
					switch (directive) {
						// Single colour directives
						case "Kd":
						case "Ks":
						case "Ke":
							if (checkArgCount(3)) {
								const colour = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
								const nonBlack = vec3.length(colour) > 0;

								if (directive === "Kd") {
									vec3.copy(curMat.baseColour, colour);
								}
								else if (nonBlack) {
									if (directive === "Ks") {
										vec3.copy(curMat.specularColour, colour);
										curMat.specularIntensity = 1;
										curMat.flags |= MaterialFlags.usesSpecular;
									}
									else if (directive === "Ke") {
										vec3.copy(curMat.emissiveColour, colour);
										curMat.emissiveIntensity = 1;
										curMat.flags |= MaterialFlags.usesEmissive;
									}
								}
							}
							break;

						// Single value directives
						case "Ns":
						case "Pr":
						case "Pm":
						case "aniso":
							if (checkArgCount(1)) {
								const value = parseFloat(tokens[1]);
								if (directive === "Ns") { curMat.specularExponent = value; }
								else if (directive === "Pr") { curMat.roughness = value; }
								else if (directive === "Pm") { curMat.metallic = value; }
								else if (directive === "aniso") { curMat.anisotropy = value; }
							}
							break;
						case "d":
						case "Tr":
							if (checkArgCount(1)) {
								let opacity = parseFloat(tokens[1]);
								if (directive === "Tr") { opacity = 1.0 - opacity; }
								opacity = math.clamp01(opacity);

								if (opacity < 1) {
									curMat.opacity = opacity;
									curMat.flags |= MaterialFlags.isTranslucent;
								}
							}
							break;

						// Texture map directives (only file paths, options not supported)
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
							const texSpec = parseMTLTextureSpec(tokens);
							if (texSpec) {
								const texURL = new URL(texSpec.relPath, path);
								const texAsset: Texture2D = (urlTexMap.has(texURL.href))
									? urlTexMap.get(texURL.href)!
									: {
										name: `${curMat.name}_${directive}`,
										url: texURL,
										mipMapMode: render.MipMapMode.Regenerate,
										colourSpace: (["map_Kd", "map_Ks", "map_Ke"].indexOf(directive) > -1 ? image.ColourSpace.sRGB : image.ColourSpace.Linear),
									};

								// SD only supports a single offset/scale pair so these will overwrite previous ones
								if (texSpec.texOffset) {
									curMat.textureOffset = texSpec.texOffset;
								}
								if (texSpec.texScale) {
									curMat.textureScale = texSpec.texScale;
								}

								if (directive === "map_Kd") { curMat.albedoTexture = texAsset; }
								else if (directive === "map_Ks") { curMat.specularTexture = texAsset; }
								else if (directive === "map_Ke") {
									curMat.emissiveTexture = texAsset;
									curMat.flags |= MaterialFlags.usesEmissive;
								}
								else if (directive === "map_Pr") { curMat.roughnessTexture = texAsset; }
								else if (directive === "map_Pm") { curMat.metallicTexture = texAsset; }
								else if (directive === "norm") {
									curMat.normalTexture = texAsset;
									if (curMat.normalTexture === curMat.heightTexture) {
										curMat.flags |= MaterialFlags.normalAlphaIsHeight;
									}
								}
								else if (directive === "map_d") {
									curMat.transparencyTexture = texAsset;
									curMat.flags |= MaterialFlags.isTranslucent;
								}
								else if (directive === "map_Tr") { /* warn: not supported */ }
								else if (directive === "bump" || directive === "disp") {
									curMat.heightTexture = texAsset;
									if (curMat.normalTexture === curMat.heightTexture) {
										curMat.flags |= MaterialFlags.normalAlphaIsHeight;
									}
								}

								if (! urlTexMap.has(texURL.href)) {
									urlTexMap.set(texURL.href, texAsset);
									group.addTexture(texAsset);
								}
							}
							else {
								// TODO: warn
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
			group.addMaterial(curMat);
		}

		return group;
	}

} // ns sd.asset.parser
