// meshdata/indexbuffer - indexbuffer and triangleview for indexbuffer
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.meshdata {

	export const enum IndexElementType {
		None,

		UInt8,
		UInt16,
		UInt32
	}


	export const enum PrimitiveType {
		None,

		Point,
		Line,
		LineStrip,
		Triangle,
		TriangleStrip
	}


	export type TypedIndexArray = Uint32Array | Uint16Array | Uint8Array;


	export function indexElementTypeSizeBytes(iet: IndexElementType): number {
		switch (iet) {
			case IndexElementType.UInt8:
				return Uint8Array.BYTES_PER_ELEMENT;
			case IndexElementType.UInt16:
				return Uint16Array.BYTES_PER_ELEMENT;
			case IndexElementType.UInt32:
				return Uint32Array.BYTES_PER_ELEMENT;
			default:
				assert(false, "Invalid IndexElementType");
				return 0;
		}
	}


	export function minimumIndexElementTypeForVertexCount(vertexCount: number): IndexElementType {
		if (vertexCount <= UInt8.max) {
			return IndexElementType.UInt8;
		}
		if (vertexCount <= UInt16.max) {
			return IndexElementType.UInt16;
		}

		return IndexElementType.UInt32;
	}


	export function bytesRequiredForIndexCount(elementType: IndexElementType, indexCount: number) {
		return indexElementTypeSizeBytes(elementType) * indexCount;
	}


	export function elementOffsetForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number) {
		switch (primitiveType) {
			case PrimitiveType.Point:
				return primitiveCount;
			case PrimitiveType.Line:
				return primitiveCount * 2;
			case PrimitiveType.LineStrip:
				return primitiveCount;
			case PrimitiveType.Triangle:
				return primitiveCount * 3;
			case PrimitiveType.TriangleStrip:
				return primitiveCount;

			default:
				assert(false, "Unknown primitive type");
				return 0;
		}
	}


	export function elementCountForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number) {
		switch (primitiveType) {
			case PrimitiveType.Point:
				return primitiveCount;
			case PrimitiveType.Line:
				return primitiveCount * 2;
			case PrimitiveType.LineStrip:
				return primitiveCount + 1;
			case PrimitiveType.Triangle:
				return primitiveCount * 3;
			case PrimitiveType.TriangleStrip:
				return primitiveCount + 2;

			default:
				assert(false, "Unknown primitive type");
				return 0;
		}
	}


	export function primitiveCountForElementCount(primitiveType: PrimitiveType, elementCount: number) {
		switch (primitiveType) {
			case PrimitiveType.Point:
				return elementCount;
			case PrimitiveType.Line:
				return (elementCount / 2) | 0;
			case PrimitiveType.LineStrip:
				return elementCount - 1;
			case PrimitiveType.Triangle:
				return (elementCount / 3) | 0;
			case PrimitiveType.TriangleStrip:
				return elementCount - 2;

			default:
				assert(false, "Unknown primitive type");
				return 0;
		}
	}


	export class IndexBuffer implements ClientBuffer {
		private indexElementType_ = IndexElementType.None;
		private indexCount_ = 0;
		private indexElementSizeBytes_ = 0;
		private storage_: ArrayBuffer | null = null;
		private storageOffsetBytes_ = 0;

		allocate(elementType: IndexElementType, elementCount: number) {
			this.indexElementType_ = elementType;
			this.indexElementSizeBytes_ = indexElementTypeSizeBytes(this.indexElementType_);
			this.indexCount_ = elementCount;

			this.storage_ = new ArrayBuffer(this.bufferSizeBytes);
			this.storageOffsetBytes_ = 0;
		}

		suballocate(elementType: IndexElementType, indexCount: number, insideBuffer: ArrayBuffer, atByteOffset: number) {
			this.indexElementType_ = elementType;
			this.indexElementSizeBytes_ = indexElementTypeSizeBytes(this.indexElementType_);
			this.indexCount_ = indexCount;

			this.storage_ = insideBuffer;
			this.storageOffsetBytes_ = atByteOffset;
		}


		// -- observers
		get indexElementType() { return this.indexElementType_; }
		get indexCount() { return this.indexCount_; }
		get indexElementSizeBytes() { return this.indexElementSizeBytes_; }

		get bufferSizeBytes() { return this.indexCount_ * this.indexElementSizeBytes_; }
		get bufferLocalOffsetBytes() { return this.storageOffsetBytes_; }
		get buffer() { return this.storage_; }

		bufferView(): ArrayBufferView | null {
			if (this.storage_) {
				return new Uint8Array(this.storage_, this.storageOffsetBytes_, this.bufferSizeBytes);
			}

			return null;
		}


		// -- read/write indexes
		typedBasePtr(baseIndexNr: number, elementCount: number): TypedIndexArray {
			assert(this.storage_, "No storage allocated yet!");
			let offsetBytes = this.storageOffsetBytes_ + this.indexElementSizeBytes_ * baseIndexNr;

			if (this.indexElementType_ === IndexElementType.UInt32) {
				return new Uint32Array(this.storage_!, offsetBytes, elementCount);
			}
			else if (this.indexElementType_ === IndexElementType.UInt16) {
				return new Uint16Array(this.storage_!, offsetBytes, elementCount);
			}
			else {
				return new Uint8Array(this.storage_!, offsetBytes, elementCount);
			}
		}

		copyIndexes(baseIndexNr: number, outputCount: number, outputPtr: Uint32Array) {
			assert(baseIndexNr < this.indexCount_);
			assert(baseIndexNr + outputCount <= this.indexCount_);
			assert(outputPtr.length >= outputCount);

			const typedBasePtr = this.typedBasePtr(baseIndexNr, outputCount);
			for (let ix = 0; ix < outputCount; ++ix) {
				outputPtr[ix] = typedBasePtr[ix];
			}
		}

		index(indexNr: number): number {
			const typedBasePtr = this.typedBasePtr(indexNr, 1);
			return typedBasePtr[0];
		}

		setIndexes(baseIndexNr: number, sourceCount: number, sourcePtr: ArrayOfNumber) {
			assert(baseIndexNr < this.indexCount_);
			assert(baseIndexNr + sourceCount <= this.indexCount_);
			assert(sourcePtr.length >= sourceCount);

			const typedBasePtr = this.typedBasePtr(baseIndexNr, sourceCount);
			for (let ix = 0; ix < sourceCount; ++ix) {
				typedBasePtr[ix] = sourcePtr[ix];
			}
		}

		setIndex(indexNr: number, newValue: number) {
			const typedBasePtr = this.typedBasePtr(indexNr, 1);
			typedBasePtr[0] = newValue;
		}
	}


	export class IndexedTriangleProxy implements MutableTriangleProxy {
		private data_: TypedIndexArray;

		constructor(data: TypedIndexArray, triangleIndex: number) {
			this.data_ = data.subarray(triangleIndex * 3, (triangleIndex + 1) * 3);
		}

		index(index: number) { return this.data_[index]; }
		a() { return this.data_[0]; }
		b() { return this.data_[1]; }
		c() { return this.data_[2]; }

		setIndex(index: number, newValue: number) {
			this.data_[index] = newValue;
		}
		setA(newValue: number) { this.data_[0] = newValue; }
		setB(newValue: number) { this.data_[1] = newValue; }
		setC(newValue: number) { this.data_[2] = newValue; }
	}


	export class IndexBufferTriangleView implements TriangleView {
		constructor(private indexBuffer_: IndexBuffer, private fromTriangle_ = -1, private toTriangle_ = -1) {
			// clamp range to available primitives, default to all triangles
			const primitiveCount = primitiveCountForElementCount(PrimitiveType.Triangle, this.indexBuffer_.indexCount);

			if (this.fromTriangle_ < 0) {
				this.fromTriangle_ = 0;
			}
			if (this.fromTriangle_ >= primitiveCount) {
				this.fromTriangle_ = primitiveCount - 1;
			}
			if ((this.toTriangle_ < 0) || (this.toTriangle_ > primitiveCount)) {
				this.toTriangle_ = primitiveCount;
			}
		}

		forEach(callback: (proxy: IndexedTriangleProxy) => void) {
			const primCount = this.toTriangle_ - this.fromTriangle_;
			const basePtr = this.indexBuffer_.typedBasePtr(this.fromTriangle_ * 3, primCount * 3);

			for (let tix = 0; tix < primCount; ++tix) {
				callback(new IndexedTriangleProxy(basePtr, tix));
			}
		}

		refItem(triangleIndex: number) {
			return this.indexBuffer_.typedBasePtr((triangleIndex + this.fromTriangle_) * 3, 3);
		}

		subView(fromTriangle: number, triangleCount: number) {
			return new IndexBufferTriangleView(this.indexBuffer_, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + fromTriangle + triangleCount);
		}

		get count() {
			return this.toTriangle_ - this.fromTriangle_;
		}

		get mutable() { return false; }
	}

} // ns sd.meshdata
