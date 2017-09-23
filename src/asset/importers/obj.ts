// asset/importers/obj - Wavefront OBJ mesh importer
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../importer.ts" />

namespace sd.asset.importer {

	export const importOBJData = (data: Blob, uri: string) =>
		io.BlobReader.readAsText(data).then(text =>
			parseOBJ(text, uri, false)
		);

	registerImporter(importOBJData, "obj", "application/wavefront-obj");


	interface OBJPreProcSource {
		uri: string;
		lines: string[];
		asset: Asset;

		positionCount: number;
		normalCount: number;
		uvCount: number;

		polyCount: number;
		vertexCount: number;
	}


	function preflightOBJSource(text: string, uri: string) {
		let mtlFilePath = "";
		const preproc: OBJPreProcSource = {
			uri,
			lines: [],
			asset: { kind: "model", dependencies: {} },
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
			const directive = tokens[0];
			if (directive === "v") { preproc.positionCount += 1; }
			else if (directive === "vn") { preproc.normalCount += 1; }
			else if (directive === "vt") { preproc.uvCount += 1; }
			else if (directive === "f") {
				preproc.polyCount += 1;
				preproc.vertexCount += tokens.length - 1;
			}
			else if (directive === "mtllib") {
				if (tokens[1]) {
					mtlFilePath = io.resolveRelativePath(tokens[1], uri);
				}
				else {
					console.warn("OBJ parser: ignoring empty mtllib reference.");
				}
			}
		}

		if (mtlFilePath.length) {
			preproc.asset.dependencies!["materials"] = { kind: "import", uri: mtlFilePath };
		}
		return preproc;
	}


	function parseOBJSource(preproc: OBJPreProcSource) {
		const asset = preproc.asset;

		const positions: Float32Array = new Float32Array(preproc.positionCount * 3);
		const positionIndexes = new Uint32Array(preproc.vertexCount);
		const streams: meshdata.VertexAttributeStream[] = [];
		let normalValues: Float32Array | undefined;
		let uvValues: Float32Array | undefined;
		let normalIndexes: Uint32Array | undefined;
		let uvIndexes: Uint32Array | undefined;
		let posIx = 0, normIx = 0, uvIx = 0, vertexIx = 0, curMatIx = 0;

		// map each material's name to its index
		const matNameIndexMap = new Map<string, number>();
		for (let matIx = 0; matIx < group.materials.length; ++matIx) {
			matNameIndexMap.set(group.materials[matIx].name!, matIx);
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

		const builder = new meshdata.MeshBuilder(positions, positionIndexes, streams);


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
					const vi: number[] = [];
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
					const newMatIx = matNameIndexMap.get(tokens[1]);
					if (newMatIx === undefined) {
						console.warn(`OBJ parser: referencing non-existent material: "${tokens[1]}" in asset "${preproc.uri}"`);
					}
					else {
						curMatIx = newMatIx;
					}
					builder.setGroup(curMatIx);
					break;

				default: break;
			}
		}

		group.addMesh(builder.complete());
		return group;
	}

	function parseOBJ(text: string, uri: string) {
		const preproc = preflightOBJSource(text, uri);
		const group = parseOBJSource(preproc);

		// add the linked object as a Model to the group
		const model = {};
		model.mesh = group.meshes[0];
		model.materials = group.materials;
		model.transform = asset.makeTransform();
		group.addModel(model);
		return group;
	}

} // ns sd.asset.parser
