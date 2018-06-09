/**
 * geometry-data/vertex-buffer-attribute-view - vertex attribute data access
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { assert, NumericType, TypedArrayConstructor, TypedArray, NumArray } from "@stardazed/core";
import { PositionedAttribute, vertexFieldElementCount, vertexFieldNumericType, VertexField, VertexBuffer } from "@stardazed/geometry";

export class VertexBufferAttributeView {
	private readonly vertexBuffer_: VertexBuffer;
	private readonly attr_: PositionedAttribute;
	private readonly stride_: number;
	private readonly fieldNumType_: NumericType;
	private readonly typedViewCtor_: TypedArrayConstructor;
	private readonly buffer_: ArrayBuffer;
	private readonly dataView_: DataView;
	
	readonly fromVertex: number;
	readonly toVertex: number;
	readonly vertexCount: number;
	readonly elementCount: number;

	constructor(vertexBuffer: VertexBuffer, attr: PositionedAttribute, fromVertex?: number, toVertex?: number) {
		this.vertexBuffer_ = vertexBuffer;
		this.attr_ = attr;
		this.stride_ = this.vertexBuffer_.stride;
		this.elementCount = vertexFieldElementCount(this.attr_.field);

		// validate or use default range
		const fullVertexCount = this.vertexBuffer_.vertexCount;
		if (fromVertex !== undefined) {
			if (fromVertex < 0 || fromVertex > fullVertexCount) {
				throw new Error("Invalid fromVertex index");
			}
			this.fromVertex = fromVertex;
		}
		else {
			this.fromVertex = 0;
		}
		if (toVertex !== undefined) {
			if ((toVertex < this.fromVertex) || (toVertex > fullVertexCount)) {
				throw new Error("Invalid toVertex index");
			}
			this.toVertex = toVertex;
		}
		else {
			this.toVertex = fullVertexCount;
		}

		this.vertexCount = this.toVertex - this.fromVertex;

		// save some often-used fields
		const fieldNumType = vertexFieldNumericType(this.attr_.field);
		if (! fieldNumType) {
			throw new Error("Invalid attribute field type");
		}
		this.fieldNumType_ = fieldNumType;
		this.typedViewCtor_ = this.fieldNumType_.arrayType;

		this.buffer_ = this.vertexBuffer_.storage.buffer as ArrayBuffer;
		this.dataView_ = new DataView(this.buffer_);
	}

	forEach(callback: (item: TypedArray) => void) {
		const max = this.vertexCount;
		for (let ix = 0; ix < max; ++ix) {
			callback(this.refItem(ix));
		}
	}

	copyValuesFrom(source: NumArray, valueCount: number, offset = 0) {
		assert(this.fromVertex + offset + valueCount <= this.vertexCount, "buffer overflow");
		assert(source.length >= valueCount * this.elementCount, "not enough elements in source");

		const buffer = this.buffer_;
		const stride = this.stride_;
		const elementSize = this.fieldNumType_.byteSize;
		const firstIndex = this.fromVertex + offset;
		let offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * firstIndex) + this.attr_.offset;
		let sourceIndex = 0;
		let arrView: TypedArray;

		if (this.elementCount === 1) {
			if (stride % elementSize === 0) {
				const strideInElements = (stride / elementSize) | 0;
				const offsetInElements = (offsetBytes / elementSize) | 0;
				arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
				let vertexOffset = 0;
				for (let n = 0; n < valueCount; ++n) {
					arrView[vertexOffset] = source[sourceIndex];
					sourceIndex += 1;
					vertexOffset += strideInElements;
				}
			}
			else {
				for (let n = 0; n < valueCount; ++n) {
					arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 1);
					arrView[0] = source[sourceIndex];
					sourceIndex += 1;
					offsetBytes += stride;
				}
			}
		}
		else if (this.elementCount === 2) {
			if (stride % elementSize === 0) {
				const strideInElements = (stride / elementSize) | 0;
				const offsetInElements = (offsetBytes / elementSize) | 0;
				arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
				let vertexOffset = 0;
				for (let n = 0; n < valueCount; ++n) {
					arrView[0 + vertexOffset] = source[sourceIndex];
					arrView[1 + vertexOffset] = source[sourceIndex + 1];
					sourceIndex += 2;
					vertexOffset += strideInElements;
				}
			}
			else {
				for (let n = 0; n < valueCount; ++n) {
					arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 2);
					arrView[0] = source[sourceIndex];
					arrView[1] = source[sourceIndex + 1];
					sourceIndex += 2;
					offsetBytes += stride;
				}
			}
		}
		else if (this.elementCount === 3) {
			if (stride % elementSize === 0) {
				const strideInElements = (stride / elementSize) | 0;
				const offsetInElements = (offsetBytes / elementSize) | 0;
				arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
				let vertexOffset = 0;
				for (let n = 0; n < valueCount; ++n) {
					arrView[0 + vertexOffset] = source[sourceIndex];
					arrView[1 + vertexOffset] = source[sourceIndex + 1];
					arrView[2 + vertexOffset] = source[sourceIndex + 2];
					sourceIndex += 3;
					vertexOffset += strideInElements;
				}
			}
			else {
				for (let n = 0; n < valueCount; ++n) {
					arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 3);
					arrView[0] = source[sourceIndex];
					arrView[1] = source[sourceIndex + 1];
					arrView[2] = source[sourceIndex + 2];
					sourceIndex += 3;
					offsetBytes += stride;
				}
			}
		}
		else if (this.elementCount === 4) {
			if (stride % elementSize === 0) {
				const strideInElements = (stride / elementSize) | 0;
				const offsetInElements = (offsetBytes / elementSize) | 0;
				arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
				let vertexOffset = 0;
				for (let n = 0; n < valueCount; ++n) {
					arrView[0 + vertexOffset] = source[sourceIndex];
					arrView[1 + vertexOffset] = source[sourceIndex + 1];
					arrView[2 + vertexOffset] = source[sourceIndex + 2];
					arrView[3 + vertexOffset] = source[sourceIndex + 3];
					sourceIndex += 4;
					vertexOffset += strideInElements;
				}
			}
			else {
				for (let n = 0; n < valueCount; ++n) {
					arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 4);
					arrView[0] = source[sourceIndex];
					arrView[1] = source[sourceIndex + 1];
					arrView[2] = source[sourceIndex + 2];
					arrView[3] = source[sourceIndex + 3];
					sourceIndex += 4;
					offsetBytes += stride;
				}
			}
		}
	}

	refItem(index: number): TypedArray {
		index += this.fromVertex;
		const offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * index) + this.attr_.offset;
		return new (this.typedViewCtor_)(this.buffer_, offsetBytes, this.elementCount);
	}

	copyItem(index: number): number[] {
		index += this.fromVertex;
		let offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * index) + this.attr_.offset;
		const result: number[] = [];

		switch (this.attr_.field) {
			case VertexField.Floatx4:
				result.push(this.dataView_.getFloat32(offsetBytes, true));
				offsetBytes += 4;
				// fall-through
			case VertexField.Floatx3:
				result.push(this.dataView_.getFloat32(offsetBytes, true));
				offsetBytes += 4;
				// fall-through
			case VertexField.Floatx2:
				result.push(this.dataView_.getFloat32(offsetBytes, true));
				offsetBytes += 4;
				// fall-through
			case VertexField.Float:
				result.push(this.dataView_.getFloat32(offsetBytes, true));
				break;

			default:
				assert(false, "copyItem not implemented for this fieldtype");
				break;
		}

		return result;
	}

	subView(fromVertex: number, toVertex: number) {
		return new VertexBufferAttributeView(this.vertexBuffer_, this.attr_, this.fromVertex + fromVertex, this.fromVertex + toVertex);
	}
}
