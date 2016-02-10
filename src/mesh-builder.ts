// mesh-builder.ts - construct MeshData from normalized sources such as assets
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.mesh {

	export const enum VertexAttributeMapping {
		Undefined,

		Vertex,
		PolygonVertex,
		Polygon,
		SingleValue
	}


	export interface VertexAttributeStream {
		name?: string;
		attr: VertexAttribute;
		mapping: VertexAttributeMapping;
		includeInMesh: boolean;
		controlsGrouping?: boolean;

		values?: TypedArray;
		indexes?: TypedArray;

		elementCount?: number;
	}


	export class MeshBuilder {
		private vertexData: number[][];
		private indexes: number[] = [];

		private sourcePolygonIndex = 0;
		private streamCount = 0;
		private vertexCount = 0;
		private triangleCount = 0;
		private vertexMapping: Map<string, number>;

		private groupIndex = 0;
		private groupFirstTriangleIndex = 0;
		private groups: mesh.PrimitiveGroup[] = [];

		private streams: VertexAttributeStream[];


		constructor(positions: Float32Array, streams: VertexAttributeStream[]) {
			// sort attr streams ensuring ones that are not to be included in the mesh
			// end up at the end. Try to keep the array as stable as possible by not
			// moving streams if not needed.
			this.streams = streams.slice(0).sort((sA, sB) => {
				if (sA.includeInMesh == sB.includeInMesh)
					return 0;
				else
					return sA.includeInMesh ? -1 : 1;
			});

			// add the positions stream at the beginning to ensure it is always at index 0
			var positionStream: VertexAttributeStream = {
				attr: { role: VertexAttributeRole.Position, field: VertexField.Floatx3 },
				mapping: VertexAttributeMapping.Vertex,
				includeInMesh: true,
				values: positions
			};
			this.streams.unshift(positionStream);

			// minor optimization as the element count will be requested many times
			// also check for ambigious or incorrect grouping
			var groupers = 0;
			for (var s of this.streams) {
				s.elementCount = vertexFieldElementCount(s.attr.field);
				if (s.controlsGrouping === true) {
					assert(s.elementCount == 1, "A grouping stream must use a single element field");
					var groupNumType = vertexFieldNumericType(s.attr.field);
					assert(groupNumType != Float && groupNumType != Double, "A grouping stream must use an integer element");
					groupers++;
				}
			}
			assert(groupers < 2, "More than 1 attr stream indicates it's the grouping stream");

			// output and de-duplication data
			this.vertexData = this.streams.map(s => []);
			this.vertexMapping = new Map<string, number>();
			this.streamCount = this.streams.length;
		}


		private streamIndexesForPVI(polygonVertexIndex: number, vertexIndex: number, polygonIndex: number) {
			var res: number[] = [];

			for (var stream of this.streams) {
				var index: number;
				if (stream.mapping == VertexAttributeMapping.Vertex) {
					index = vertexIndex;
				}
				else if (stream.mapping == VertexAttributeMapping.PolygonVertex) {
					index = polygonVertexIndex;
				}
				else if (stream.mapping == VertexAttributeMapping.Polygon) {
					index = polygonIndex;
				}
				else {
					index = 0;
				}

				if (stream.indexes) {
					index = stream.indexes[index];
				}
				res.push(index);
			}

			return res;
		}


		private getVertexIndex(streamIndexes: number[]): number {
			const key = streamIndexes.join("|");
			if (this.vertexMapping.has(key)) {
				return this.vertexMapping.get(key);
			}
			else {
				for (var streamIx = 0; streamIx < this.streamCount; ++streamIx) {
					var stream = this.streams[streamIx];
					var fieldIndex = streamIndexes[streamIx];
					var fieldOffset = stream.elementCount * fieldIndex;

					var array = this.vertexData[streamIx];
					array.push.apply(array, stream.values.subarray(fieldOffset, fieldOffset + stream.elementCount));
				}

				var vertexIndex = this.vertexCount;
				this.vertexCount++;
				this.vertexMapping.set(key, vertexIndex);
				return vertexIndex;
			}
		}


		private addTriangle(polygonVertexIndexes: ArrayOfNumber, vertexIndexes: ArrayOfNumber) {
			var indexesA = this.streamIndexesForPVI(polygonVertexIndexes[0], vertexIndexes[0], this.sourcePolygonIndex);
			var indexesB = this.streamIndexesForPVI(polygonVertexIndexes[1], vertexIndexes[1], this.sourcePolygonIndex);
			var indexesC = this.streamIndexesForPVI(polygonVertexIndexes[2], vertexIndexes[2], this.sourcePolygonIndex);

			var dstVIxA = this.getVertexIndex(indexesA);
			var dstVIxB = this.getVertexIndex(indexesB);
			var dstVIxC = this.getVertexIndex(indexesC);

			this.indexes.push(dstVIxA, dstVIxB, dstVIxC);
			this.triangleCount++;
		}


		addPolygon(polygonVertexIndexes: ArrayOfNumber, vertexIndexes: ArrayOfNumber) {
			if (polygonVertexIndexes.length == 3) {
				this.addTriangle(polygonVertexIndexes, vertexIndexes);
			}
			else {
				var polyPoints = vertexIndexes.length;
				var polyNext = 2;
				const pv0 = polygonVertexIndexes[0];
				const v0 = vertexIndexes[0];

				while (polyNext < polyPoints) {
					this.addTriangle(
						[pv0, polygonVertexIndexes[polyNext - 1], polygonVertexIndexes[polyNext]],
						[v0, vertexIndexes[polyNext - 1], vertexIndexes[polyNext]]
					);
					polyNext++;
				}
			}

			this.sourcePolygonIndex++;
		}


		complete() {
			// Create MeshData with a VB with the streams marked for inclusion in the
			// final mesh data. Because we sorted the non-included streams to the end
			// of the list the order of this filtered list will still be the same as
			// of the vertexData arrays, so no need for mapping etc.
			var meshAttributeStreams = this.streams.filter(s => s.includeInMesh);
			var attrs = meshAttributeStreams.map(s => s.attr);
			var meshData = new MeshData();

			var vb = new VertexBuffer(attrs);
			meshData.vertexBuffers.push(vb);
			vb.allocate(this.vertexMapping.size);
			for (var six = 0; six < meshAttributeStreams.length; ++six) {
				let streamData = this.vertexData[six];
				let view = new VertexBufferAttributeView(vb, vb.attrByIndex(six));
				view.copyValuesFrom(streamData, this.vertexCount);
			}

			var indexElemType = mesh.minimumIndexElementTypeForVertexCount(this.vertexCount);
			meshData.indexBuffer.allocate(PrimitiveType.Triangle, indexElemType, this.triangleCount);
			meshData.indexBuffer.setIndexes(0, this.indexes.length, this.indexes);
			meshData.primitiveGroups.push({ materialIx: 0, fromPrimIx: 0, primCount: this.triangleCount });

			return meshData;
		}
	}

} // ns sd.mesh
