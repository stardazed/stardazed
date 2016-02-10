// mesh-builder.ts - construct MeshData from normalized sources such as assets
// Part of Stardazed TX
// (c) 2015-6 by Arthur Langereis - @zenmumbler

namespace sd.mesh {

	export const enum VertexAttributeMapping {
		Undefined,

		PolygonVertex,
		Polygon,
		SingleValue
	}


	export interface VertexAttributeStream {
		name?: string;
		attr: VertexAttribute;
		mapping: VertexAttributeMapping;

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

		streams: VertexAttributeStream[];

		constructor(positions: Float32Array, streams: VertexAttributeStream[]) {
			var positionStream: VertexAttributeStream = {
				attr: { role: VertexAttributeRole.Position, field: VertexField.Floatx3 },
				mapping: VertexAttributeMapping.PolygonVertex,
				values: positions
			};	
			this.streams = [positionStream].concat(streams.slice(0));

			this.vertexData = this.streams.map(s => []);
			this.vertexMapping = new Map<string, number>();
			this.streamCount = this.streams.length;

			for (var s of this.streams) {
				s.elementCount = vertexFieldElementCount(s.attr.field);
			}
		}


		private streamIndexesForPVI(polygonVertexIndex: number, polygonIndex: number) {
			var res: number[] = [];

			for (var stream of this.streams) {
				var index: number;
				if (stream.mapping == VertexAttributeMapping.PolygonVertex) {
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
		

		private addTriangle(srcVIxA: number, srcVIxB: number, srcVIxC: number) {
			var indexesA = this.streamIndexesForPVI(srcVIxA, this.sourcePolygonIndex);
			var indexesB = this.streamIndexesForPVI(srcVIxB, this.sourcePolygonIndex);
			var indexesC = this.streamIndexesForPVI(srcVIxC, this.sourcePolygonIndex);

			var dstVIxA = this.getVertexIndex(indexesA);
			var dstVIxB = this.getVertexIndex(indexesB);
			var dstVIxC = this.getVertexIndex(indexesC);

			this.indexes.push(dstVIxA, dstVIxB, dstVIxC);
			this.triangleCount++;
		}


		addPolygon(vertexIndexes: ArrayOfNumber) {
			var polyPoints = vertexIndexes.length;
			var polyNext = 3;
			const a = vertexIndexes[0];
			const b = vertexIndexes[1];
			const c = vertexIndexes[2];
			this.addTriangle(a, b, c);

			while (polyNext++ < polyPoints) {
				this.addTriangle(a, vertexIndexes[polyNext - 1], vertexIndexes[polyNext]);
			}

			this.sourcePolygonIndex++;
		}


		setMaterialIndex(matIndex: number) {
		}


		complete() {
			var attrs = this.streams.map(s => s.attr);
			var meshData = new MeshData();
			var vb = new VertexBuffer(attrs);
			meshData.vertexBuffers.push(vb);
			vb.allocate(this.vertexMapping.size);
			meshData.indexBuffer.allocate(PrimitiveType.Triangle, IndexElementType.UInt32, this.triangleCount);
			meshData.indexBuffer.setIndexes(0, this.indexes.length, this.indexes);
			meshData.primitiveGroups.push({ materialIx: 0, fromPrimIx: 0, primCount: this.triangleCount });
			return meshData;
		}
	}

} // ns sd.mesh
