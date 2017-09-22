// asset/parser/mesh - mesh asset parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parser.ts" />

namespace sd.asset.parser {

	export type VertexElementType = "uint8" | "sint8" | "uint16" | "sint16" | "uint32" | "sint32" | "float" | "double";

	export type VertexRole = "position" | "normal" | "tangent" | "colour" | "material" | "uv" | "weight" | "jointref";

	export type VertexStreamMapping = "vertex" | "polygonvertex" | "polygon" | "singlevalue";

	export interface VertexStream {
		name?: string;

		elementType?: VertexElementType;
		elementCount?: number;
		elementNormalized?: boolean;

		role?: VertexRole;
		roleSubscript?: number;
		
		mapping?: VertexStreamMapping;
		valuesBufferKey?: string;
		indexesBufferKey?: string;
	}

	export interface TriangleGroup {
		fromElement: number;
		elementCount: number;
		materialIndex: number;
	}

	export interface VertexStreamMeshData {
		type: "streams";
		streams?: VertexStream[];
		triangleBufferKey?: string;
		groups?: Partial<TriangleGroup>[];
	}

	export interface CompiledMeshData {
		type: "compiled";
	}

	export type MeshAssetMetadata = VertexStreamMeshData | CompiledMeshData;

	export const parseMesh = (asset: Asset<meshdata.MeshData, MeshAssetMetadata>) =>
		new Promise<Asset>((resolve, reject) => {
			const { dependencies, metadata } = asset;
			if (metadata === void 0) {
				return reject("Mesh parser: metadata is missing");
			}
			if (dependencies === void 0) {
				return reject("Mesh parser: dependencies are missing");
			}

			if (metadata.type === "streams") {
				asset.item = parseStreamMesh(metadata, dependencies);
				resolve(asset);
			}
			else if (metadata.type === "compiled") {
				reject("Mesh parser: compiled mesh assets are not implemented yet");
			}
			else {
				reject("Mesh parser: invalid or missing mesh type ${metadata.type}");
			}
		});

	registerParser("mesh", parseMesh);

	// ------------------

	const parseStreamMesh = (metadata: Partial<VertexStreamMeshData>, deps: AssetDependencies) => {
		const { streams } = metadata;
		if (! (Array.isArray(streams) && streams.length > 0)) {
			throw new Error(`Mesh parser: no vertex streams provided`);
		}

		const attrStreams = streams.map(vs => parseVertexStream(vs, deps));
		const isIndexed = attrStreams.some(ats => ats.indexes !== null);
		
		const { triangleBufferKey, groups } = metadata;
		let triangleBuffer: ArrayBuffer | undefined;

		if (triangleBufferKey === void 0) {
			if (isIndexed) {
				throw new Error(`Mesh parser: indexed mesh streams require explicit triangles`);
			}
		}
		else {
			triangleBuffer = getBufferDependency(triangleBufferKey, deps);
		}

		let resolvedGroups: TriangleGroup[];
		if (groups === void 0) {
			resolvedGroups = [{
				fromElement: 0,
				elementCount: -1,
				materialIndex: 0
			}];
		}
		else {
			resolvedGroups = parseGroups(groups);
		}

		return buildMesh(attrStreams, resolvedGroups, triangleBuffer ? new Uint32Array(triangleBuffer) : undefined);
	};

	const parseVertexStream = (stream: VertexStream, deps: AssetDependencies): meshdata.VertexAttributeStream => {

	};

	const parseGroup = (group: Partial<TriangleGroup>): TriangleGroup => {
		
	};

	const parseGroups = (groups: Partial<TriangleGroup>[]) =>
		groups.map(g => parseGroup(g));

	const getBufferDependency = (bufferKey: string, deps: AssetDependencies) => {
		const buffer = deps[bufferKey];
		if (typeof buffer !== "object" || buffer === null) {
			throw new Error(`Mesh parser: buffer dependency "${bufferKey}" missing"`);
		}
		if (buffer.kind !== "buffer" || !(buffer.item instanceof ArrayBuffer)) {
			throw new Error(`Mesh parser: buffer dependency "${bufferKey}" is invalid or empty"`);
		}
		return buffer.item;
	};

	const buildMesh = (attrStreams: meshdata.VertexAttributeStream[], groups: TriangleGroup[], triangleView: Uint32Array | undefined) => {
		const positionStreamIndex = attrStreams.findIndex(
			ats => ats.attr!.role === meshdata.VertexAttributeRole.Position
		);
		if (positionStreamIndex < 0) {
			throw new Error(`Mesh parser: position vertex stream is missing`);
		}
		const positionStream = attrStreams.splice(positionStreamIndex, 1)[0];

		const hasGroupingStream = attrStreams.some(ats => ats.controlsGrouping === true);
		const builder = new meshdata.MeshBuilder(positionStream.values!, positionStream.indexes || null, attrStreams);

		const polygonVertexIndexes = [0, 0, 0];
		const vertexIndexes = [0, 0, 0];

		for (const group of groups) {
			if (! hasGroupingStream) {
				builder.setGroup(group.materialIndex);
			}
			const startElement = group.fromElement;
			const endElement = startElement + group.elementCount;

			if (triangleView) {
				for (let tri = startElement; tri < endElement; tri += 3) {
					polygonVertexIndexes[0] = tri;
					polygonVertexIndexes[1] = tri + 1;
					polygonVertexIndexes[2] = tri + 2;
					vertexIndexes[0] = triangleView[tri];
					vertexIndexes[1] = triangleView[tri + 1];
					vertexIndexes[2] = triangleView[tri + 2];
					builder.addPolygon(polygonVertexIndexes, vertexIndexes);
				}
			}
			else {
				for (let tri = startElement; tri < endElement; tri += 3) {
					polygonVertexIndexes[0] = tri;
					polygonVertexIndexes[1] = tri + 1;
					polygonVertexIndexes[2] = tri + 2;
					builder.addPolygon(polygonVertexIndexes, polygonVertexIndexes);
				}
			}
		}

		return builder.complete();
	};

} // ns sd.asset.parser
