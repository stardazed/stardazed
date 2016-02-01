// asset-lwo.ts - Lightwave OBJ mesh file import
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="core.ts" />
/// <reference path="meshdata.ts" />

namespace sd.asset {

	export interface Material {
		ambientColor?: Float3;
		diffuseColor?: Float3;
		specularColor?: Float3;
	}

	export type MaterialSet = { [matName: string]: Material };


	function parseLWMaterialSource(text: string): MaterialSet {
		var lines = text.split("\n");
		var materials: MaterialSet = {};
		var curMat: Material = null;

		lines.forEach(function(line) {
			var tokens = line.split(" ");
			switch (tokens[0]) {
				case "newmtl":
					curMat = materials[tokens[1]] = {};
					break;
				case "Ka":
					curMat.ambientColor = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
					break;
				case "Kd":
					curMat.diffuseColor = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
					break;
				case "Ks":
					curMat.specularColor = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
					break;
				default:
					break;
			}
		});

		return materials;
	}


	export interface LWDrawGroup {
		materialName: string;
		fromIndex: number;
		indexCount: number;
	}

	export interface LWMeshData {
		mtlFileName: string;
		mesh: mesh.MeshData;
		materials: MaterialSet;
		drawGroups: LWDrawGroup[];
	}


	function genColorEntriesFromDrawGroups(drawGroups: LWDrawGroup[], materials: MaterialSet, colourView: mesh.VertexBufferAttributeView) {
		var lastGroup = drawGroups[drawGroups.length - 1];
		var totalIndexes = lastGroup.indexCount + lastGroup.fromIndex;

		drawGroups.forEach((group: LWDrawGroup) => {
			var curIndex = group.fromIndex;
			var maxIndex = group.fromIndex + group.indexCount;
			var mat = materials[group.materialName];
			assert(mat, "material " + group.materialName + " not found");

			while (curIndex < maxIndex) {
				vec3.copy(colourView.item(curIndex), mat.diffuseColor);
				curIndex++;
			}
		});
	}


	function parseLWObjectSource(text: string): LWMeshData {
		var t0 = performance.now();
		var lines = text.split("\n");
		var vv: number[][] = [], nn: number[][] = [], tt: number[][] = [];

		var mtlFileName = "";
		var materialGroups: LWDrawGroup[] = [];
		var curMaterialGroup: LWDrawGroup = null;

		var meshData = new mesh.MeshData(mesh.AttrList.Pos3Norm3Colour3UV2());
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

			vec3.set(posView.item(vertexIx), v[0], v[1], v[2]);

			if (n) {
				assert(nx < nn.length, "nx out of bounds " + nx);
				vec3.set(normView.item(vertexIx), n[0], n[1], n[2]);
			}

			if (t) {
				assert(tx < tt.length, "tx out of bounds " + tx);
				vec2.set(uvView.item(vertexIx), t[0], t[1]);
			}

			++vertexIx;
		}

		// preflight
		var triCount = 0;
		lines.forEach((line) => {
			if (line.slice(0, 2) == "f ")
				triCount++;
		});

		vb.allocate(triCount * 3);
		posView = new mesh.VertexBufferAttributeView(vb, vb.attrByRole(mesh.VertexAttributeRole.Position));
		normView = new mesh.VertexBufferAttributeView(vb, vb.attrByRole(mesh.VertexAttributeRole.Normal));
		uvView = new mesh.VertexBufferAttributeView(vb, vb.attrByRole(mesh.VertexAttributeRole.UV));
		meshData.indexBuffer = null;

		// convert a face index to zero-based int or -1 for empty index	
		function fxtoi(fx: string) { return (+fx) - 1; }

		lines.forEach((line) => {
			var tokens = line.split(" ");
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
					tt.push([parseFloat(tokens[1]), parseFloat(tokens[2])]);
					break;
				case "f":
					vtx.apply(null, tokens[1].split("/").map(fxtoi));
					vtx.apply(null, tokens[2].split("/").map(fxtoi));
					vtx.apply(null, tokens[3].split("/").map(fxtoi));
					break;
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

		var t1 = performance.now();
		// console.info("obj v:", vv.length / 3, "t:", tt.length / 2, "took:", (t1-t0).toFixed(2), "ms");
		// console.info("mats:", materialGroups);
	
		return {
			mtlFileName: mtlFileName,
			mesh: meshData,
			drawGroups: materialGroups,
			materials: null
		};
	}


	function loadLWMaterialFile(filePath: string): Promise<MaterialSet> {
		return loadFile(filePath).then(
			function(text: string) {
				return parseLWMaterialSource(text);
			}
		);
	}


	export function loadLWObjectFile(filePath: string): Promise<LWMeshData> {
		var mtlResolve: any = null;
		var mtlProm = new Promise<MaterialSet>(function(resolve) {
			mtlResolve = resolve;
		});

		var objProm = loadFile(filePath).then(
			function(text: string) {
				return parseLWObjectSource(text);
			}
		).then(
			function(objData: LWMeshData) {
				assert(objData.mtlFileName.length > 0, "no MTL file?");
				var mtlFilePath = filePath.substr(0, filePath.lastIndexOf("/") + 1) + objData.mtlFileName;
				loadLWMaterialFile(mtlFilePath).then(
					function(materials: MaterialSet) {
						mtlResolve(materials);
					}
				);
				return objData;
			}
			);

		return Promise.all<any>([mtlProm, objProm]).then(
			function(values) {
				var materials: MaterialSet = values[0];
				var obj: LWMeshData = values[1];
				obj.materials = materials;
				var colourAttr = obj.mesh.primaryVertexBuffer.attrByRole(mesh.VertexAttributeRole.Colour);
				var colourView = new mesh.VertexBufferAttributeView(obj.mesh.primaryVertexBuffer, colourAttr);
				genColorEntriesFromDrawGroups(obj.drawGroups, materials, colourView);
				return obj;
			}
		);
	}

} // ns sd.asset
