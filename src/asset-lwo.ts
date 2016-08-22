// asset-lwo.ts - Wavefront OBJ mesh file import
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	function parseLWMaterialSource(group: AssetGroup, text: string): AssetGroup {
		var lines = text.split("\n");
		var materials: MaterialSet = {};
		var curMat: Material | null = null;

		lines.forEach(function(line) {
			var tokens = line.trim().split(/ +/);
			switch (tokens[0]) {
				case "newmtl":
					if (tokens.length === 2) {
						var matName = tokens[1];
						curMat = materials[matName] = makeMaterial();
						curMat.name = matName;
					}
					// FIXME: else unexpected()
					break;
				case "Kd":
					if (curMat && tokens.length === 4) {
						vec3.copy(curMat.diffuseColour, [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
					}
					// FIXME: else unexpected()
					break;
				case "Ks":
					if (curMat && tokens.length === 4) {
						vec3.copy(curMat.specularColour, [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
					}
					// FIXME: else unexpected()
					break;
				case "Ke": // custom Clara.io extension
					if (curMat && tokens.length === 4) {
						vec3.copy(curMat.emissiveColour, [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
					}
					// FIXME: else unexpected()
					break;
				case "Ns":
					if (curMat && tokens.length === 2) {
						curMat.specularExponent = parseFloat(tokens[1]);
					}
					// FIXME: else unexpected()
					break;
				case "d":
				case "Tr":
					if (curMat && tokens.length === 2) {
						var opacity = parseFloat(tokens[1]);
						if (tokens[0] === "Tr") {
							opacity = 1.0 - opacity;
						}
						curMat.opacity = math.clamp01(opacity);
					}
					// FIXME: else unexpected()
					break;
				default:
					break;
			}
		});

		return group;
	}


	export interface LWDrawGroup {
		materialName: string;
		fromIndex: number;
		indexCount: number;
	}

	export interface LWMeshData {
		mtlFileName: string;
		mesh: mesh.MeshData;
		materials: MaterialSet | null;
		drawGroups: LWDrawGroup[];
	}


	function genColorEntriesFromDrawGroups(drawGroups: LWDrawGroup[], materials: MaterialSet, colourView: mesh.VertexBufferAttributeView) {
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
	}


	function parseLWObjectSource(text: string, hasColourAttr: boolean): LWMeshData {
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

		lines.forEach((line) => {
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
		});

		// finalise last draw group
		if (curMaterialGroup) {
			curMaterialGroup.indexCount = vertexIx - curMaterialGroup.fromIndex;
		}

		// single primitive group
		meshData.primitiveGroups.push({ fromPrimIx: 0, primCount: vertexIx / 3, materialIx: 0 });
	
		return {
			mtlFileName: mtlFileName,
			mesh: meshData,
			drawGroups: materialGroups,
			materials: null
		};
	}


	function loadLWMaterialFile(group: AssetGroup, filePath: string): Promise<AssetGroup> {
		return loadFile(filePath).then((text: string) => {
			return parseLWMaterialSource(group, text);
		});
	}


	export function loadLWObjectFile(filePath: string, materialsAsColours = false): Promise<AssetGroup> {
		var group = new AssetGroup();

		var mtlResolve: any = null;
		var mtlProm = new Promise<AssetGroup>(function(resolve) {
			mtlResolve = resolve;
		});

		var objProm = loadFile(filePath).then((text: string) => {
			return parseLWObjectSource(text, materialsAsColours);
		}).then((objData: LWMeshData) => {
			if (objData.mtlFileName) {
				var mtlFilePath = filePath.substr(0, filePath.lastIndexOf("/") + 1) + objData.mtlFileName;
				loadLWMaterialFile(group, mtlFilePath).then(mtlResolve);
			}
			else {
				mtlResolve(null);
			}
			return objData;
		});

		return Promise.all<any>([mtlProm, objProm]).then(values => {
			var materials: MaterialSet = values[0];
			var obj: LWMeshData = values[1];
			obj.materials = materials;

			if (materialsAsColours) {
				var colourAttr = obj.mesh.primaryVertexBuffer.attrByRole(mesh.VertexAttributeRole.Colour);
				if (colourAttr) {
					var colourView = new mesh.VertexBufferAttributeView(obj.mesh.primaryVertexBuffer, colourAttr);
					genColorEntriesFromDrawGroups(obj.drawGroups, materials, colourView);
				}
			}

			return group;
		});
	}

} // ns sd.asset
