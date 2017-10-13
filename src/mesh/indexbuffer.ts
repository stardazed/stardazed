// meshdata/indexbuffer - indexbuffer
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

	export const indexElementTypeSizeBytes = makeLUT<IndexElementType, number>(
		IndexElementType.UInt8, Uint8Array.BYTES_PER_ELEMENT,
		IndexElementType.UInt16, Uint16Array.BYTES_PER_ELEMENT,
		IndexElementType.UInt32, Uint32Array.BYTES_PER_ELEMENT
	);

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
		return indexElementTypeSizeBytes[elementType] * indexCount;
	}


	export type TypedIndexArray = Uint32Array | Uint16Array | Uint8ClampedArray;

	export function typedIndexArrayClassForIndexElement(elementType: IndexElementType): TypedArrayConstructor {
		switch (elementType) {
			case IndexElementType.UInt8: return Uint8ClampedArray;
			case IndexElementType.UInt16: return Uint16Array;
			case IndexElementType.UInt32: return Uint32Array;
			default:
				throw new Error("Invalid IndexElementType");
		}
	}


	export const enum PrimitiveType {
		None,

		Point,
		Line,
		LineStrip,
		Triangle,
		TriangleStrip
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
		assert(primitiveCount >= 0);

		switch (primitiveType) {
			case PrimitiveType.Point:
				return primitiveCount;
			case PrimitiveType.Line:
				return primitiveCount * 2;
			case PrimitiveType.LineStrip:
				return primitiveCount > 0 ? primitiveCount + 1 : 0;
			case PrimitiveType.Triangle:
				return primitiveCount * 3;
			case PrimitiveType.TriangleStrip:
				return primitiveCount > 0 ? primitiveCount + 2 : 0;

			default:
				assert(false, "Unknown primitive type");
				return 0;
		}
	}


	export function primitiveCountForElementCount(primitiveType: PrimitiveType, elementCount: number) {
		assert(elementCount >= 0);

		switch (primitiveType) {
			case PrimitiveType.Point:
				return elementCount;
			case PrimitiveType.Line:
				return (elementCount / 2) | 0;
			case PrimitiveType.LineStrip:
				return elementCount > 0 ? elementCount - 1 : 0;
			case PrimitiveType.Triangle:
				return (elementCount / 3) | 0;
			case PrimitiveType.TriangleStrip:
				return elementCount > 0 ? elementCount - 2 : 0;

			default:
				assert(false, "Unknown primitive type");
				return 0;
		}
	}


	export class IndexBuffer {
		readonly indexElementType: IndexElementType;
		readonly indexCount: number;
		readonly storage: Uint8ClampedArray;
		private indexElementSizeBytes_: number;

		constructor(elementType: IndexElementType, indexCount: number, usingStorage?: Uint8ClampedArray) {
			assert(indexCount > 0, "Invalid indexCount, must be > 0");

			this.indexElementType = elementType;
			this.indexElementSizeBytes_ = indexElementTypeSizeBytes[elementType];
			this.indexCount = indexCount;

			if (usingStorage) {
				assert(usingStorage.byteLength >= this.sizeBytes, "Not enough space in supplied storage");
				this.storage = usingStorage;
			}
			else {
				this.storage = new Uint8ClampedArray(this.sizeBytes);
			}
		}

		get sizeBytes() { return this.indexCount * this.indexElementSizeBytes_; }


		// -- direct (sub-)array access
		typedBasePtr(baseIndexNr: number, indexCount: number): TypedIndexArray {
			assert(baseIndexNr < this.indexCount);
			assert(baseIndexNr + indexCount <= this.indexCount);

			const offsetBytes = this.storage.byteOffset + this.indexElementSizeBytes_ * baseIndexNr;
			const arrayClass = typedIndexArrayClassForIndexElement(this.indexElementType);
			return new arrayClass(this.storage.buffer, offsetBytes, indexCount) as TypedIndexArray;
		}
	}

} // ns sd.meshdata
