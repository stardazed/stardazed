/**
 * geometry/builder - construct Geometry from normalized sources
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

namespace sd {

export const enum VertexAttributeMapping {
	Undefined,

	Vertex,
	PolygonVertex,
	Polygon,
	SingleValue
}

export interface VertexAttributeStream {
	name?: string;
	attr?: VertexAttribute;
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

	readonly indexCount: number;
}

/*
VertexIndexMapping method A was to test a growing single array technique used
in native code, but in JS it lost out (badly) to method B, which is just to
use a Map with a lot of small arrays in it. Left here to test in the future.

class VertexIndexMappingA implements VertexIndexMapping {
	private offsets_: number[] = [];
	private values_: number[] = [];
	private highest_ = -1;

	get indexCount() { return this.offsets_.length; }

	add(from: number, to: number) {
		if (from > this.highest_) {
			fill(this.offsets_, this.values_.length, from - this.highest_, this.highest_ + 1);
			this.highest_ = from;
		}
		const fromOff = this.offsets_[from];
		this.values_.splice(fromOff, 0, to);
		for (let n = from + 1; n <= this.highest_; ++n) {
			this.offsets_[n]++;
		}
	}

	mappedValues(forIndex: number) {
		const offA = this.offsets_[forIndex];
		const offB = (forIndex < this.offsets_.length - 1) ? this.offsets_[forIndex + 1] : this.values_.length;
		return this.values_.slice(offA, offB);
	}
}
*/

class VertexIndexMappingB implements VertexIndexMapping {
	private data_ = new Map<number, number[]>();

	get indexCount() { return this.data_.size; }

	add(from: number, to: number) {
		if (! this.data_.has(from)) {
			this.data_.set(from, [to]);
		}
		else {
			const mapped = this.data_.get(from)!;
			if (mapped.indexOf(to) === -1) {
				mapped.push(to);
			}
			this.data_.set(from, mapped);
		}
	}

	mappedValues(forIndex: number) {
		return this.data_.get(forIndex)!;
	}
}

export class GeometryBuilder {
	private vertexData_: number[][];

	private sourcePolygonIndex_ = 0;
	private streamCount_ = 0;
	private vertexCount_ = 0;
	private triangleCount_ = 0;
	private vertexMapping_: Map<string, number>;
	private indexMap_: VertexIndexMapping;

	private groupIndex_: number;
	private groupIndexStreams_: Map<number, number[]>;
	private groupIndexesRef_: number[];

	private streams_: VertexAttributeStream[];

	/**
	 * Try to create a GeometryBuilder, will reject if the streams config is invalid.
	 */
	static create(positions: Float32Array | Float64Array, positionIndexes: Uint32Array | null, streams: VertexAttributeStream[]) {
		return new Promise<GeometryBuilder>(resolve => {
			resolve(new this(positions, positionIndexes, streams));
		});
	}

	private constructor(positions: Float32Array | Float64Array, positionIndexes: Uint32Array | null, streams: VertexAttributeStream[]) {
		// create a local copy of the streams array so we can modify it
		this.streams_ = streams.slice(0);

		// create the positions stream, which is needed for both simple and rigged models
		const positionStream: VertexAttributeStream = {
			attr: { role: VertexAttributeRole.Position, field: VertexField.Floatx3 },
			mapping: VertexAttributeMapping.Vertex,
			includeInMesh: true,
			values: positions,
			indexes: positionIndexes === null ? undefined : positionIndexes
		};

		// add positions stream at the beginning for simple models and at end for rigged models
		if (this.streams_.find(s => s.attr!.role === VertexAttributeRole.JointIndexes)) {
			this.streams_.push(positionStream);
		}
		else {
			this.streams_.unshift(positionStream);
		}

		// sort attr streams ensuring ones that are not to be included in the geometry
		// end up at the end.
		stableSort(this.streams_, (sA, sB) => {
			if (sA.includeInMesh === sB.includeInMesh) {
				return 0;
			}
			return sA.includeInMesh ? -1 : 1;
		});


		// minor optimization as the element count will be requested many times
		// also check for ambigious or incorrect grouping
		let groupers = 0;
		for (const s of this.streams_) {
			s.elementCount = vertexFieldElementCount(s.attr!.field);
			if (s.controlsGrouping === true) {
				if (s.elementCount !== 1) {
					throw new Error("A grouping stream must use a single element field");
				}
				const groupNumType = vertexFieldNumericType(s.attr!.field);
				if (! (groupNumType && groupNumType.integer)) {
					throw new Error("A grouping stream must use an integer element");
				}
				groupers++;
			}
		}
		if (groupers > 1) {
			throw new Error("More than 1 attr stream indicates it's the grouping stream");
		}

		// start at group 0 in case there is no explicit initial group set
		this.groupIndexStreams_ = new Map<number, number[]>();
		this.groupIndexStreams_.set(0, []);
		this.groupIndex_ = 0;
		this.groupIndexesRef_ = this.groupIndexStreams_.get(0)!;

		// output and de-duplication data
		this.vertexData_ = this.streams_.map(_ => []);
		this.vertexMapping_ = new Map<string, number>();
		this.indexMap_ = new VertexIndexMappingB();
		this.streamCount_ = this.streams_.length;
	}


	private streamIndexesForPVI(polygonVertexIndex: number, vertexIndex: number, polygonIndex: number) {
		const res: number[] = [];

		for (const stream of this.streams_) {
			let index: number;
			if (stream.mapping === VertexAttributeMapping.Vertex) {
				index = vertexIndex;
			}
			else if (stream.mapping === VertexAttributeMapping.PolygonVertex) {
				index = polygonVertexIndex;
			}
			else if (stream.mapping === VertexAttributeMapping.Polygon) {
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

	/**
	 * @expects isPositiveInteger(newGroupIndex)
	 */
	setGroup(newGroupIndex: number) {
		this.groupIndex_ = newGroupIndex;
		if (! this.groupIndexStreams_.has(newGroupIndex)) {
			this.groupIndexStreams_.set(newGroupIndex, []);
		}

		this.groupIndexesRef_ = this.groupIndexStreams_.get(newGroupIndex)!;
	}


	private getVertexIndex(streamIndexes: number[]): number {
		const key = streamIndexes.join("|");
		if (this.vertexMapping_.has(key)) {
			return this.vertexMapping_.get(key)!;
		}
		else {
			for (let streamIx = 0; streamIx < this.streamCount_; ++streamIx) {
				const stream = this.streams_[streamIx];
				const elemCount = stream.elementCount!;
				const array = this.vertexData_[streamIx];
				const fieldIndex = streamIndexes[streamIx];
				let values: NumArray = stream.values!; // TODO: is this guaranteed to exist in this loop?
				let fieldOffset = elemCount * fieldIndex;

				// This is slowest on all browsers (by a mile)
				// array.push.apply(array, stream.values.subarray(fieldOffset, fieldOffset + stream.elementCount));

				// This is 20% faster in Firefox
				// for (let el = 0; el < elemCount; ++el) {
				// 	array.push(values[fieldOffset + el]);
				// }

				// in FBX it is apparently valid to have -1 indexes to indicate absence of a value
				// we replace that with a 0-filled value
				if (fieldOffset < 0) {
					values = [0, 0, 0, 0];
					fieldOffset = 0;
				}

				// This is 20% faster in Webkit
				if (elemCount === 3) {
					array.push(values[fieldOffset], values[fieldOffset + 1], values[fieldOffset + 2]);
				}
				else if (elemCount === 2) {
					array.push(values[fieldOffset], values[fieldOffset + 1]);
				}
				else if (elemCount === 4) {
					array.push(values[fieldOffset], values[fieldOffset + 1], values[fieldOffset + 2], values[fieldOffset + 3]);
				}
				else if (elemCount === 1) {
					array.push(values[fieldOffset]);

					if (stream.controlsGrouping) {
						const gi = values[fieldOffset];
						if (gi !== this.groupIndex_) {
							this.setGroup(gi);
						}
					}
				}
			}

			const vertexIndex = this.vertexCount_;
			this.vertexCount_++;
			this.vertexMapping_.set(key, vertexIndex);

			return vertexIndex;
		}
	}


	private addTriangle(polygonVertexIndexes: NumArray, vertexIndexes: NumArray) {
		const indexesA = this.streamIndexesForPVI(polygonVertexIndexes[0], vertexIndexes[0], this.sourcePolygonIndex_);
		const indexesB = this.streamIndexesForPVI(polygonVertexIndexes[1], vertexIndexes[1], this.sourcePolygonIndex_);
		const indexesC = this.streamIndexesForPVI(polygonVertexIndexes[2], vertexIndexes[2], this.sourcePolygonIndex_);

		const dstVIxA = this.getVertexIndex(indexesA);
		const dstVIxB = this.getVertexIndex(indexesB);
		const dstVIxC = this.getVertexIndex(indexesC);

		this.indexMap_.add(vertexIndexes[0], dstVIxA);
		this.indexMap_.add(vertexIndexes[1], dstVIxB);
		this.indexMap_.add(vertexIndexes[2], dstVIxC);

		this.groupIndexesRef_.push(dstVIxA, dstVIxB, dstVIxC);
		this.triangleCount_++;
	}


	addPolygon(polygonVertexIndexes: NumArray, vertexIndexes: NumArray) {
		if (polygonVertexIndexes.length === 3) {
			this.addTriangle(polygonVertexIndexes, vertexIndexes);
		}
		else {
			const polyPoints = vertexIndexes.length;
			const pv0 = polygonVertexIndexes[0];
			const v0 = vertexIndexes[0];
			let polyNext = 2;

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

	get curPolygonIndex() { return this.sourcePolygonIndex_; }
	get indexMap() { return this.indexMap_; }

	complete() {
		// Create Geometry with a VB with the streams marked for inclusion in the
		// final geometry data. Because we sorted the non-included streams to the end
		// of the list the order of this filtered list will still be the same as
		// of the vertexData arrays, so no need for mapping etc.
		const meshAttributeStreams = this.streams_.filter(s => s.includeInMesh);
		const attrs = meshAttributeStreams.map(s => s.attr!);

		// allocate as single buffer
		const geom = allocateGeometry({
			layout: makeStandardGeometryLayout(attrs),
			vertexCount: this.vertexCount_,
			indexCount: this.triangleCount_ * 3
		});
		const layout = geom.layout.layouts[0];

		// copy vertex streams
		for (let six = 0; six < meshAttributeStreams.length; ++six) {
			const streamData = this.vertexData_[six];
			const attribute = layout.attrByIndex(six);
			if (attribute) {
				const view = new VertexAttributeView(geom.vertexBuffers[0], attribute);
				view.copyValuesFrom(streamData, this.vertexCount_);
			}
			// FIXME else unexpected()
		}

		// All triangles with the same material were merged, create full index buffer
		// and primitive groups
		const mergedIndexes: number[] = [];
		let nextElementIndex = 0;

		for (const [group, indexes] of this.groupIndexStreams_) {
			if (indexes.length) {
				appendArrayInPlace(mergedIndexes, indexes);
				const groupElementCount = indexes.length;

				geom.subMeshes.push({
					type: PrimitiveType.Triangle,
					fromElement: nextElementIndex,
					elementCount: groupElementCount,
					materialIx: group
				});

				nextElementIndex += groupElementCount;
			}
		}

		const indexView = indexBufferRangeView(geom.indexBuffer!, 0, mergedIndexes.length);
		copyElementRange(indexView, 0, mergedIndexes, 0, mergedIndexes.length);
		// geom.indexBuffer!.setIndexes(0, mergedIndexes.length, mergedIndexes);

		return geom;
	}
}

} // ns sd
