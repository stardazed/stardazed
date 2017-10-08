// asset/parser/mesh - mesh asset parser
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../parser.ts" />

namespace sd.asset {

	export interface CacheAccess {
		(kind: "mesh", name: string): meshdata.MeshData;
	}

} // ns sd.asset

namespace sd.asset.parse {

	export type VertexElementType = "uint8" | "sint8" | "uint16" | "sint16" | "uint32" | "sint32" | "float";

	export type VertexRole = "position" | "normal" | "tangent" | "colour" | "uv" | "weight" | "jointref" | "material";

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

	export const parseMesh = async (asset: Asset<meshdata.MeshData, MeshAssetMetadata>) => {
		const { dependencies, metadata } = asset;
		if (metadata === void 0) {
			throw new Error("Mesh parser: metadata is missing");
		}
		if (dependencies === void 0) {
			throw new Error("Mesh parser: dependencies are missing");
		}

		if (metadata.type === "streams") {
			asset.item = parseStreamMesh(metadata, dependencies);
		}
		else if (metadata.type === "compiled") {
			throw new Error("Mesh parser: compiled mesh assets are not implemented yet");
		}
		else {
			throw new Error(`Mesh parser: invalid or missing mesh type ${metadata.type}`);
		}
	};

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

		if (! Array.isArray(groups)) {
			throw new Error(`Mesh parser: at least one triangle group must be provided`);
		}
		const resolvedGroups = parseGroups(groups);

		return buildMesh(attrStreams, resolvedGroups, triangleBuffer ? new Uint32Array(triangleBuffer) : undefined);
	};

	const parseVertexStream = (stream: VertexStream, deps: AssetDependencies): meshdata.VertexAttributeStream => {
		const field = parseVertexField(stream.elementType, stream.elementCount, stream.elementNormalized);
		const role = parseVertexRole(stream.role, stream.roleSubscript);
		const mapping = parseStreamMapping(stream.mapping);

		if (! stream.valuesBufferKey) {
			throw new Error(`Mesh parser: a stream must specify a valuesBufferKey`);
		}
		const valuesBuffer = getBufferDependency(stream.valuesBufferKey, deps)!;
		const indexesBuffer = stream.indexesBufferKey ? getBufferDependency(stream.indexesBufferKey, deps, true) : undefined;

		return {
			name: stream.name,
			attr: { field, role },
			mapping,
			includeInMesh: role !== meshdata.VertexAttributeRole.Material,
			controlsGrouping: role === meshdata.VertexAttributeRole.Material,

			values: new Float32Array(valuesBuffer), // FIXME: create TypedArray based no field type
			indexes: indexesBuffer && new Uint32Array(indexesBuffer)
		};
	};

	const parseVertexField = (element: VertexElementType | undefined, count: number | undefined, normalized: boolean | undefined): meshdata.VertexField => {
		if (typeof count !== "number" || count < 1 || count > 4) {
			throw new Error(`Mesh parser: a stream's elementCount value must be a number between 1 and 4 inclusive, got "${count}"`);
		}
		if (normalized !== true && normalized !== false) {
			if (normalized !== void 0) {
				console.warn(`Mesh parser: ignoring invalid elementNormalized value ${normalized}`);
			}
			normalized = false;
		}

		let field: meshdata.VertexField;
		switch (element) {
			case "uint8": field = meshdata.VertexField.UInt8 + count - 1; if (normalized) { field |= 0x80; } break;
			case "sint8": field = meshdata.VertexField.SInt8 + count - 1; if (normalized) { field |= 0x80; } break;
			case "uint16": field = meshdata.VertexField.UInt16 + count - 1; if (normalized) { field |= 0x80; } break;
			case "sint16": field = meshdata.VertexField.SInt16 + count - 1; if (normalized) { field |= 0x80; } break;
			case "uint32": field = meshdata.VertexField.UInt32 + count - 1; break;
			case "sint32": field = meshdata.VertexField.SInt32 + count - 1; break;
			case "float": field = meshdata.VertexField.Float + count - 1; break;
			default:
				throw new Error(`Mesh parser: invalid stream elementType "${element}"`);
		}

		return field;
	};

	const parseVertexRole = (role: VertexRole | undefined, subscript: number | undefined): meshdata.VertexAttributeRole => {
		let vertexRole: meshdata.VertexAttributeRole;
		switch (role) {
			case "position": vertexRole = meshdata.VertexAttributeRole.Position; break;
			case "normal": vertexRole = meshdata.VertexAttributeRole.Normal; break;
			case "tangent": vertexRole = meshdata.VertexAttributeRole.Tangent; break;
			case "colour": vertexRole = meshdata.VertexAttributeRole.Colour; break;
			case "uv": vertexRole = meshdata.VertexAttributeRole.UV; break;
			case "weight": vertexRole = meshdata.VertexAttributeRole.WeightedPos0; break;
			case "jointref": vertexRole = meshdata.VertexAttributeRole.JointIndexes; break;
			case "material": vertexRole = meshdata.VertexAttributeRole.Material; break;
			default:
				throw new Error(`Mesh parser: invalid or missing stream role "${role}"`);
		}

		if (typeof subscript !== "number") {
			if (subscript !== void 0) {
				console.warn(`Mesh parser: ignoring non-numerical stream roleSubscript`, subscript);
			}
			subscript = 0;
		}
		else {
			if (subscript < 0 || subscript > 3) {
				console.warn(`Mesh parser: ignoring out-of-bounds stream roleSubscript (${subscript}), must be between 0 and 3 inclusive`);
				subscript = 0;
			}
		}
		if (subscript > 0 && (vertexRole === meshdata.VertexAttributeRole.UV || vertexRole === meshdata.VertexAttributeRole.WeightedPos0)) {
			vertexRole += subscript;
		}
		return vertexRole;
	};

	const parseStreamMapping = (mapping: VertexStreamMapping | undefined): meshdata.VertexAttributeMapping => {
		switch (mapping) {
			case "vertex": return meshdata.VertexAttributeMapping.Vertex;
			case "polygonvertex": return meshdata.VertexAttributeMapping.PolygonVertex;
			case "polygon": return meshdata.VertexAttributeMapping.Polygon;
			case "singlevalue": return meshdata.VertexAttributeMapping.SingleValue;
			default:
				throw new Error(`Mesh parser: invalid stream mapping "${mapping}"`);
		}
	};

	const parseGroup = (group: Partial<TriangleGroup>): TriangleGroup => {
		if (typeof group.fromElement !== "number" || group.fromElement < 0 || ((group.fromElement | 0) !== group.fromElement)) {
			throw new Error(`Mesh parser: a stream's fromElement must be present, >= 0 and an integer`);
		}
		if (typeof group.elementCount !== "number" || group.elementCount <= 0 || ((group.elementCount % 3) !== 0)) {
			throw new Error(`Mesh parser: a stream's elementCount must be present, > 0 and a multiple of 3`);
		}
		let materialIndex = 0;
		if (typeof group.materialIndex !== "number") {
			if (group.materialIndex !== void 0) {
				console.warn(`Mesh parser: ignoring non-numerical group materialIndex ${group.materialIndex}`);
			}
		}
		else {
			if (group.materialIndex >= 0 && ((group.materialIndex | 0) === group.materialIndex)) {
				materialIndex = group.materialIndex;
			}
			else {
				console.warn(`Mesh parser: ignoring invalid group materialIndex ${group.materialIndex}, must be >= 0 and an integer`);
			}
		}

		return {
			fromElement: group.fromElement,
			elementCount: group.elementCount,
			materialIndex
		};
	};

	const parseGroups = (groups: Partial<TriangleGroup>[]) =>
		groups.map(g => parseGroup(g));

	const getBufferDependency = (bufferKey: string, deps: AssetDependencies, optional = false) => {
		const buffer = deps[bufferKey];
		if (typeof buffer !== "object" || buffer === null) {
			if (optional && buffer === void 0) {
				return undefined;
			}
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

} // ns sd.asset.parse
