// asset/parser/group-obj - Wavefront OBJ mesh file parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="./group.ts" />

namespace sd.asset.parser {

	export const parseOBJGroup = (resource: RawAsset<GroupAssetOptions>): Promise<AssetGroup> =>
		parseGenericText(resource)
			.then(text =>
				preflightOBJSource(resource.path, text)
			)
			.then(preproc => {
				const group = parseOBJSource(preproc, false);

				// add the linked object as a Model to the group
				const model = asset.makeModel(`obj_${objSequenceNumber}_model`);
				model.mesh = group.meshes[0];
				model.materials = group.materials;
				model.transform = asset.makeTransform();
				group.addModel(model);

				objSequenceNumber += 1;
				return group;
			});

	registerFileExtension("obj", "application/wavefront-obj");
	registerGroupParser(parseOBJGroup, "application/wavefront-obj");

	
	interface OBJPreProcSource {
		lines: string[];

		positionCount: number;
		normalCount: number;
		uvCount: number;

		polyCount: number;
		vertexCount: number;
	}


	function preflightOBJSource(path: string, text: string) {
		let mtlFilePath = "";
		const preproc: OBJPreProcSource = {
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
					mtlFilePath = io.resolveRelativePath(tokens[1], path);
				}
				else {
					console.warn("OBJ parser: ignoring empty mtllib reference.");
				}
			}
		}

		if (mtlFileRelPath.length) {
			// return parseMTLGroup(new URL(mtlFileRelPath, filePath), group).then(_ => {
				// return preproc;
			// });
			return Promise.resolve(preproc);
		}
		else {
			return Promise.resolve(preproc);
		}
	}


	let objSequenceNumber = 0;

	function parseOBJSource(preproc: OBJPreProcSource, hasColourAttr: boolean) {
		const group = new AssetGroup();

		const positions: Float32Array = new Float32Array(preproc.positionCount * 3);
		const positionIndexes = new Uint32Array(preproc.vertexCount);
		const streams: meshdata.VertexAttributeStream[] = [];
		let normalValues: Float32Array | undefined;
		let uvValues: Float32Array | undefined;
		let colourValues: Float32Array | undefined;
		let normalIndexes: Uint32Array | undefined;
		let uvIndexes: Uint32Array | undefined;
		let colourIndexes: Uint32Array | undefined;
		let posIx = 0, normIx = 0, uvIx = 0, vertexIx = 0, curMatIx = 0;

		// map each material's name to its index
		const matNameIndexMap = new Map<string, number>();
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
				container.setIndexedVec3(colourValues, matIx, group.materials[matIx].colour.baseColour);
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
					if (colourIndexes) {
						colourIndexes[builder.curPolygonIndex] = curMatIx;
					}

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
						// issue an error/warning
						console.warn(`Tried to set material to non-existent name: ${tokens[1]}`);
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

} // ns sd.asset.parser
