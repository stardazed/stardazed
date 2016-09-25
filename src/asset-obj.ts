// asset-obj.ts - Wavefront OBJ mesh file + MTL material file import
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.asset {

	function parseMTLSource(group: AssetGroup, filePath: string, text: string) {
		const basePath = filePath.substr(0, filePath.lastIndexOf("/") + 1);
		const lines = text.split("\n");
		var curMat: Material | null = null;
		var tokens: string[] = [];

		const checkArgCount = function(c: number) {
			var ok = c === tokens.length - 1;
			if (! ok) {
				// TODO: emit warning in asset loader
			}
			return ok;
		};

		for (const line of lines) {
			tokens = line.trim().split(/ +/);
			var directive = tokens[0];

			if (directive === "newmtl") {
				if (checkArgCount(1)) {
					if (curMat) {
						group.addMaterial(curMat);
					}
					var matName = tokens[1];
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
						case "disp":
							if (checkArgCount(1)) {
								var texAsset: Texture2D = {
									name: curMat.name + "_" + directive,
									filePath: basePath + tokens[1],
									useMipMaps: render.UseMipMaps.Yes
								};
								if (directive === "map_Kd") { curMat.albedoTexture = texAsset; }
								else if (directive === "map_Ks") { curMat.specularTexture = texAsset; }
								else if (directive === "map_Ke") {
									curMat.emissiveTexture = texAsset;
									curMat.flags |= MaterialFlags.usesEmissive;
								}
								else if (directive === "map_Pr") { curMat.roughnessTexture = texAsset; }
								else if (directive === "map_Pm") { curMat.metallicTexture = texAsset; }
								else if (directive === "norm") { curMat.normalTexture = texAsset; }
								else if (directive === "map_d") {
									curMat.transparencyTexture = texAsset;
									curMat.flags |= MaterialFlags.isTranslucent;
								}
								else if (directive === "map_Tr") { /* warn: not supported */ }
								else if (directive === "bump" || directive === "disp") { curMat.heightTexture = texAsset; }
							}
							break;

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
	}


	function loadMTLFile(group: AssetGroup, filePath: string): Promise<void> {
		return loadFile(filePath).then((text: string) => {
			return parseMTLSource(group, filePath, text);
		});
	}


	interface OBJPreProcSource {
		lines: string[];

		positionCount: number;
		normalCount: number;
		uvCount: number;

		polyCount: number;
		vertexCount: number;
	}


	function preflightOBJSource(group: AssetGroup, filePath: string, text: string) {
		var mtlFileName = "";
		var preproc: OBJPreProcSource = {
			lines: [],
			positionCount: 0,
			normalCount: 0,
			uvCount: 0,
			polyCount: 0,
			vertexCount: 0
		};

		// split text into lines and remove trailing/leading whitespace and empty lines
		preproc.lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

		// scan for the mtllib declaration (if any) and do a counting preflight
		for (const line of preproc.lines) {
			const tokens = line.split(/ +/);
			var directive = tokens[0];
			if (directive === "v") { preproc.positionCount += 1; }
			else if (directive === "vn") { preproc.normalCount += 1; }
			else if (directive === "vt") { preproc.uvCount += 1; }
			else if (directive === "f") {
				preproc.polyCount += 1;
				preproc.vertexCount += tokens.length - 1;
			}
			else if (directive === "mtllib") {
				mtlFileName = tokens[1] || "";
			}
		}

		if (mtlFileName.length) {
			var mtlFilePath = filePath.substr(0, filePath.lastIndexOf("/") + 1) + mtlFileName;
			return loadMTLFile(group, mtlFilePath).then(() => {
				return preproc;
			});
		}
		else {
			return Promise.resolve(preproc);
		}
	}


	function parseOBJSource(group: AssetGroup, preproc: OBJPreProcSource, hasColourAttr: boolean) {
		var positions: Float32Array = new Float32Array(preproc.positionCount * 3);
		var normalValues: Float32Array | undefined;
		var uvValues: Float32Array | undefined;
		var colourValues: Float32Array | undefined;
		var positionIndexes = new Uint32Array(preproc.vertexCount);
		var normalIndexes: Uint32Array | undefined;
		var uvIndexes: Uint32Array | undefined;
		var colourIndexes: Uint32Array | undefined;
		var posIx = 0, normIx = 0, uvIx = 0, vertexIx = 0, curMatIx = 0;
		var streams: meshdata.VertexAttributeStream[] = [];

		// map each material's name to its index
		var matNameIndexMap = new Map<string, number>();
		for (let matIx = 0; matIx < group.materials.length; ++matIx) {
			matNameIndexMap.set(group.materials[matIx].name, matIx);
		}

		if (preproc.normalCount > 0) {
			normalValues = new Float32Array(preproc.normalCount * 3);
			normalIndexes = new Uint32Array(preproc.vertexCount);

			streams.push({
				name: "normals",
				includeInMesh: true,
				mapping: meshdata.VertexAttributeMapping.Vertex,
				attr: { field: meshdata.VertexField.Floatx3, role: meshdata.VertexAttributeRole.Normal },
				values: normalValues,
				indexes: normalIndexes
			});
		}
		if (preproc.uvCount > 0) {
			uvValues = new Float32Array(preproc.uvCount * 2);
			uvIndexes = new Uint32Array(preproc.vertexCount);

			streams.push({
				name: "uvs",
				includeInMesh: true,
				mapping: meshdata.VertexAttributeMapping.Vertex,
				attr: { field: meshdata.VertexField.Floatx2, role: meshdata.VertexAttributeRole.UV },
				values: uvValues,
				indexes: uvIndexes
			});
		}
		if (hasColourAttr && group.materials.length > 0) {
			colourValues = new Float32Array(group.materials.length * 3);
			colourIndexes = new Uint32Array(preproc.polyCount);

			// fill the colourValues list with the baseColour of each material
			for (let matIx = 0; matIx < group.materials.length; ++matIx) {
				container.setIndexedVec3(colourValues, matIx, group.materials[matIx].baseColour);
			}

			streams.push({
				name: "colours",
				includeInMesh: true,
				mapping: meshdata.VertexAttributeMapping.Polygon,
				attr: { field: meshdata.VertexField.Floatx3, role: meshdata.VertexAttributeRole.Colour },
				values: colourValues,
				indexes: colourIndexes
			});
		}

		var builder = new meshdata.MeshBuilder(positions, positionIndexes, streams);


		// convert a face index to zero-based int or -1 for empty index	
		function fxtoi(fx: string) { return (+fx) - 1; }

		for (const line of preproc.lines) {
			const tokens = line.split(/ +/);
			switch (tokens[0]) {
				case "v":
					positions[posIx] = parseFloat(tokens[1]);
					positions[posIx + 1] = parseFloat(tokens[2]);
					positions[posIx + 2] = parseFloat(tokens[3]);
					posIx += 3;
					break;
				case "vn":
					normalValues![normIx] = parseFloat(tokens[1]);
					normalValues![normIx + 1] = parseFloat(tokens[2]);
					normalValues![normIx + 2] = parseFloat(tokens[3]);
					normIx += 3;
					break;
				case "vt":
					uvValues![uvIx] = parseFloat(tokens[1]);
					uvValues![uvIx + 1] = -parseFloat(tokens[2]);
					uvIx += 2;
					break;
				case "f": {
					if (colourIndexes) {
						colourIndexes[builder.curPolygonIndex] = curMatIx;
					}

					let vi: number[] = [];
					for (let fvix = 1; fvix < tokens.length; ++fvix) {
						const fix = tokens[fvix].split("/").map(fxtoi);
						positionIndexes[vertexIx] = fix[0];
						if (uvIndexes && fix[1] > -1) {
							uvIndexes[vertexIx] = fix[1];
						}
						if (normalIndexes && fix[2] > -1) {
							normalIndexes[vertexIx] = fix[2];
						}
						vi.push(vertexIx);
						vertexIx += 1;
					}

					builder.addPolygon(vi, vi);
					break;
				}
				case "usemtl":
					var newMatIx = matNameIndexMap.get(tokens[1]);
					if (newMatIx === undefined) {
						// issue an error/warning
						console.warn("Tried to set material to non-existent name: " + tokens[1]);
					}
					else {
						curMatIx = newMatIx;
					}
					builder.setGroup(curMatIx);
					break;

				default: break;
			}
		}

		group.addMesh({
			name: "obj model",
			meshData: builder.complete(),
			indexMap: builder.indexMap
		});
	}


	export function loadOBJFile(filePath: string, materialsAsColours = false): Promise<AssetGroup> {
		var group = new AssetGroup();

		return loadFile(filePath).then((text: string) => {
			return preflightOBJSource(group, filePath, text);
		})
		.then(preproc => {
			parseOBJSource(group, preproc, materialsAsColours);
			return group;
		});
	}

} // ns sd.asset
