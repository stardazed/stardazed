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


	export interface VertexIndexMapping {
		add(from: number, to: number): void;
		mappedValues(forIndex: number): number[];

		indexCount: number;
	}


	class VertexIndexMappingA implements VertexIndexMapping {
		private offsets_: number[] = [];
		private values_: number[] = [];
		private highest_ = -1;

		get indexCount() { return this.offsets_.length; }

		add(from: number, to: number) {
			if (from > this.highest_) {
				container.fill(this.offsets_, this.values_.length, from - this.highest_, this.highest_ + 1);
				this.highest_ = from;
			}
			var fromOff = this.offsets_[from];
			this.values_.splice(fromOff, 0, to);
			for (var n = from + 1; n <= this.highest_; ++n) {
				this.offsets_[n]++;
			}
		}

		mappedValues(forIndex: number) {
			var offA = this.offsets_[forIndex];
			var offB = (forIndex < this.offsets_.length - 1) ? this.offsets_[forIndex + 1] : this.values_.length;
			return this.values_.slice(offA, offB);
		}
	}


	class VertexIndexMappingB implements VertexIndexMapping {
		private data_ = new Map<number, number[]>();

		get indexCount() { return this.data_.size; }

		add(from: number, to: number) {
			if (! this.data_.has(from)) {
				this.data_.set(from, [to]);
			}
			else {
				var mapped = this.data_.get(from);
				mapped.push(to);
				this.data_.set(from, mapped);
			}
		}

		mappedValues(forIndex: number) {
			return this.data_.get(forIndex);
		}
	}


	export class MeshBuilder {
		private vertexData_: number[][];
		private indexes_: number[] = [];

		private sourcePolygonIndex_ = 0;
		private streamCount_ = 0;
		private vertexCount_ = 0;
		private triangleCount_ = 0;
		private vertexMapping_: Map<string, number>;
		private indexMap_: VertexIndexMapping;

		private groupIndex_ = -1;
		private groupFirstTriangleIndex_ = 0;
		private curGroup_: mesh.PrimitiveGroup = null;
		private groups_: mesh.PrimitiveGroup[] = [];

		private streams_: VertexAttributeStream[];


		constructor(positions: Float32Array, streams: VertexAttributeStream[]) {
			// sort attr streams ensuring ones that are not to be included in the mesh
			// end up at the end. Try to keep the array as stable as possible by not
			// moving streams if not needed.
			this.streams_ = streams.slice(0).sort((sA, sB) => {
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
			this.streams_.unshift(positionStream);

			// minor optimization as the element count will be requested many times
			// also check for ambigious or incorrect grouping
			var groupers = 0;
			for (var s of this.streams_) {
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
			this.vertexData_ = this.streams_.map(s => []);
			this.vertexMapping_ = new Map<string, number>();
			this.indexMap_ = new VertexIndexMappingB();
			this.streamCount_ = this.streams_.length;
		}


		private streamIndexesForPVI(polygonVertexIndex: number, vertexIndex: number, polygonIndex: number) {
			var res: number[] = [];

			for (var stream of this.streams_) {
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


		nextGroup(newGroupIndex: number) {
			if (this.curGroup_) {
				this.curGroup_.primCount = this.triangleCount_ - this.groupFirstTriangleIndex_ + 1;
				if (this.curGroup_.primCount > 0) {
					this.groups_.push(this.curGroup_);
				}
			}

			this.curGroup_ = {
				materialIx: newGroupIndex,
				fromPrimIx: this.triangleCount_,
				primCount: 0
			};
			this.groupIndex_ = newGroupIndex;
			this.groupFirstTriangleIndex_ = this.triangleCount_ + 1;
		}


		private getVertexIndex(streamIndexes: number[]): number {
			const key = streamIndexes.join("|");
			if (this.vertexMapping_.has(key)) {
				return this.vertexMapping_.get(key);
			}
			else {
				for (var streamIx = 0; streamIx < this.streamCount_; ++streamIx) {
					var stream = this.streams_[streamIx];
					var fieldIndex = streamIndexes[streamIx];
					var elemCount = stream.elementCount;
					var fieldOffset = elemCount * fieldIndex;
					var values = stream.values;
					var array = this.vertexData_[streamIx];

					// This is slowest on all browsers (by a mile)
					// array.push.apply(array, stream.values.subarray(fieldOffset, fieldOffset + stream.elementCount));

					// This is 20% faster in Firefox
					// for (var el = 0; el < elemCount; ++el) {
					// 	array.push(values[fieldOffset + el]);
					// }

					// This is 20% faster in Webkit
					if (elemCount == 3) {
						array.push(values[fieldOffset], values[fieldOffset + 1], values[fieldOffset + 2]);
					}
					else if (elemCount == 2) {
						array.push(values[fieldOffset], values[fieldOffset + 1]);
					}
					else if (elemCount == 4) {
						array.push(values[fieldOffset], values[fieldOffset + 1], values[fieldOffset + 2], values[fieldOffset + 3]);
					}
					else if (elemCount == 1) {
						array.push(values[fieldOffset]);

						if (stream.controlsGrouping) {
							var gi = values[fieldOffset];
							if (gi != this.groupIndex_) {
								this.nextGroup(gi);
							}
						}
					}
				}

				var vertexIndex = this.vertexCount_;
				this.vertexCount_++;
				this.vertexMapping_.set(key, vertexIndex);

				return vertexIndex;
			}
		}


		private addTriangle(polygonVertexIndexes: ArrayOfNumber, vertexIndexes: ArrayOfNumber) {
			var indexesA = this.streamIndexesForPVI(polygonVertexIndexes[0], vertexIndexes[0], this.sourcePolygonIndex_);
			var indexesB = this.streamIndexesForPVI(polygonVertexIndexes[1], vertexIndexes[1], this.sourcePolygonIndex_);
			var indexesC = this.streamIndexesForPVI(polygonVertexIndexes[2], vertexIndexes[2], this.sourcePolygonIndex_);

			var dstVIxA = this.getVertexIndex(indexesA);
			var dstVIxB = this.getVertexIndex(indexesB);
			var dstVIxC = this.getVertexIndex(indexesC);

			this.indexMap_.add(vertexIndexes[0], dstVIxA);
			this.indexMap_.add(vertexIndexes[1], dstVIxB);
			this.indexMap_.add(vertexIndexes[2], dstVIxC);

			this.indexes_.push(dstVIxA, dstVIxB, dstVIxC);
			this.triangleCount_++;
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

			this.sourcePolygonIndex_++;
		}


		get indexMap() { return this.indexMap_; }


		complete() {
			// Create MeshData with a VB with the streams marked for inclusion in the
			// final mesh data. Because we sorted the non-included streams to the end
			// of the list the order of this filtered list will still be the same as
			// of the vertexData arrays, so no need for mapping etc.
			var meshAttributeStreams = this.streams_.filter(s => s.includeInMesh);
			var attrs = meshAttributeStreams.map(s => s.attr);
			var meshData = new MeshData();

			var vb = new VertexBuffer(attrs);
			meshData.vertexBuffers.push(vb);
			vb.allocate(this.vertexMapping_.size);
			for (var six = 0; six < meshAttributeStreams.length; ++six) {
				let streamData = this.vertexData_[six];
				let view = new VertexBufferAttributeView(vb, vb.attrByIndex(six));
				view.copyValuesFrom(streamData, this.vertexCount_);
			}

			var indexElemType = mesh.minimumIndexElementTypeForVertexCount(this.vertexCount_);
			meshData.indexBuffer.allocate(PrimitiveType.Triangle, indexElemType, this.triangleCount_);
			meshData.indexBuffer.setIndexes(0, this.indexes_.length, this.indexes_);

			this.nextGroup(-1);
			meshData.primitiveGroups = this.groups_.slice(0);

			return meshData;
		}
	}

} // ns sd.mesh
