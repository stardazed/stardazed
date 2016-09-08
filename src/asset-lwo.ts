// asset-lwo.ts - Wavefront OBJ mesh file import
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	function parseLWMaterialSource(group: AssetGroup, filePath: string, text: string) {
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
						case "Ke": // custom Clara.io extension
							if (checkArgCount(3)) {
								var colour = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
								vec3.copy((<{[s:string]:Float3}>{
									"Kd": curMat.baseColour,
									"Ks": curMat.specularColour,
									"Ke": curMat.emissiveColour
								})[directive], colour);
							}
							break;

						// Single value directives
						case "Pr":
						case "Pm":
						case "aniso":
						case "d":
						case "Tr":
							if (checkArgCount(1)) {
								var value = parseFloat(tokens[1]);
								if (directive === "Pr") { curMat.roughness = value; }
								else if (directive === "Pm") { curMat.metallic = value; }
								else if (directive === "aniso") { curMat.anisotropy = value; }
								else if (directive === "d") { curMat.opacity = value; }
								else if (directive === "Tr") { curMat.opacity = 1.0 - value; }
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
									filePath: tokens[1],
									useMipMaps: render.UseMipMaps.Yes
								};
								if (directive === "map_Kd") { curMat.albedoTexture = texAsset; }
								else if (directive === "map_Ks") { curMat.specularTexture = texAsset; }
								else if (directive === "map_Ke") { curMat.emissiveTexture = texAsset; }
								else if (directive === "map_Pr") { curMat.roughnessTexture = texAsset; }
								else if (directive === "map_Pm") { curMat.metallicTexture = texAsset; }
								else if (directive === "norm") { curMat.normalTexture = texAsset; }
								else if (directive === "map_d" || directive === "map_Tr") { curMat.transparencyTexture = texAsset; }
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


	interface LWDrawGroup {
		materialName: string;
		fromIndex: number;
		indexCount: number;
	}

	interface LWMetaData {
		mtlFileName: string;
		drawGroups: LWDrawGroup[];
	}


	function genColorEntriesFromDrawGroups(group: AssetGroup, drawGroups: LWDrawGroup[]) {
		/*
		drawGroups.forEach((group: LWDrawGroup) => {
			var curIndex = group.fromIndex;
			var maxIndex = group.fromIndex + group.indexCount;
			var mat = materials[group.materialName];
			assert(mat, "material " + group.materialName + " not found");

			while (curIndex < maxIndex) {
				vec3.copy(colourView.refItem(curIndex), mat.diffuseColour);
				curIndex++;
			}
		});
		*/
	}


	function parseLWObjectSource(group: AssetGroup, text: string, hasColourAttr: boolean): LWMetaData {
		var lines = text.split("\n");
		var vv: number[][] = [], nn: number[][] = [], tt: number[][] = [];

		var mtlFileName = "";
		var materialGroups: LWDrawGroup[] = [];
		var curMaterialGroup: LWDrawGroup | null = null;

		var meshData = new mesh.MeshData(hasColourAttr ? mesh.AttrList.Pos3Norm3Colour3UV2() : mesh.AttrList.Pos3Norm3UV2());
		var vb = meshData.primaryVertexBuffer;

		var posView: mesh.VertexBufferAttributeView;
		var normView: mesh.VertexBufferAttributeView;
		var uvView: mesh.VertexBufferAttributeView;
		var vertexIx = 0;

		function vtx(vx: number, tx: number, nx: number) {
			assert(vx < vv.length, "vx out of bounds " + vx);

			var v = vv[vx],
				n = nx > -1 ? nn[nx] : null,
				t = tx > -1 ? tt[tx] : null;

			vec3.set(posView.refItem(vertexIx), v[0], v[1], v[2]);

			if (n) {
				assert(nx < nn.length, "nx out of bounds " + nx);
				vec3.set(normView.refItem(vertexIx), n[0], n[1], n[2]);
			}

			if (t) {
				assert(tx < tt.length, "tx out of bounds " + tx);
				vec2.set(uvView.refItem(vertexIx), t[0], t[1]);
			}

			++vertexIx;
		}

		// preflight
		var triCount = 0;
		lines.forEach((line) => {
			if (line.slice(0, 2) == "f ") {
				var parts = line.trim().split(/ +/);
				triCount += parts.length - 3;
			}
		});

		vb.allocate(triCount * 3);
		posView = new mesh.VertexBufferAttributeView(vb, vb.attrByRole(mesh.VertexAttributeRole.Position)!);
		normView = new mesh.VertexBufferAttributeView(vb, vb.attrByRole(mesh.VertexAttributeRole.Normal)!);
		uvView = new mesh.VertexBufferAttributeView(vb, vb.attrByRole(mesh.VertexAttributeRole.UV)!);
		meshData.indexBuffer = null;

		// convert a face index to zero-based int or -1 for empty index	
		function fxtoi(fx: string) { return (+fx) - 1; }

		for (const line of lines) {
			var tokens = line.trim().split(/ +/);
			switch (tokens[0]) {
				case "mtllib":
					mtlFileName = tokens[1];
					break;
				case "v":
					vv.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
					break;
				case "vn":
					nn.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
					break;
				case "vt":
					tt.push([parseFloat(tokens[1]), -parseFloat(tokens[2])]);
					break;
				case "f": {
					var vaf = tokens[1].split("/").map(fxtoi);
					var vbf = tokens[2].split("/").map(fxtoi);
					var vcf = tokens[3].split("/").map(fxtoi);

					vtx.apply(null, vaf);
					vtx.apply(null, vbf);
					vtx.apply(null, vcf);

					if (tokens.length == 5) {
						vtx.apply(null, vaf);
						vtx.apply(null, vcf);
						vtx.apply(null, tokens[4].split("/").map(fxtoi));
					}
					break;
				}
				case "usemtl":
					if (curMaterialGroup) {
						curMaterialGroup.indexCount = vertexIx - curMaterialGroup.fromIndex;
					}
					curMaterialGroup = {
						materialName: tokens[1],
						fromIndex: vertexIx,
						indexCount: 0
					};
					materialGroups.push(curMaterialGroup);
					break;

				default: break;
			}
		}

		// finalise last draw group
		if (curMaterialGroup) {
			curMaterialGroup.indexCount = vertexIx - curMaterialGroup.fromIndex;
		}

		// single primitive group
		meshData.primitiveGroups.push({ fromPrimIx: 0, primCount: vertexIx / 3, materialIx: 0 });

		group.addMesh({ name: "obj1", streams: [], meshData: meshData });
	
		return {
			mtlFileName: mtlFileName,
			drawGroups: materialGroups
		};
	}


	function loadLWMaterialFile(group: AssetGroup, filePath: string): Promise<void> {
		return loadFile(filePath).then((text: string) => {
			return parseLWMaterialSource(group, filePath, text);
		});
	}


	export function loadLWObjectFile(filePath: string, materialsAsColours = false): Promise<AssetGroup> {
		var group = new AssetGroup();

		return loadFile(filePath).then((text: string) => {
			return parseLWObjectSource(group, text, materialsAsColours);
		})
		.then(meta => {
			if (meta.mtlFileName) {
				var mtlFilePath = filePath.substr(0, filePath.lastIndexOf("/") + 1) + meta.mtlFileName;
				return loadLWMaterialFile(group, mtlFilePath).then(() => {
					return meta;
				});
			}
			return meta;
		})
		.then(meta => {
			if (materialsAsColours) {
				genColorEntriesFromDrawGroups(group, meta.drawGroups);
			}

			return group;
		});
	}

} // ns sd.asset
