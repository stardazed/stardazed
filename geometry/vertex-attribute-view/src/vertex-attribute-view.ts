/**
 * @stardazed/vertex-attribute-view - geometry vertex attribute array views
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { TypedArrayConstructor, TypedArray, NumArray } from "@stardazed/array";
import {
	PositionedAttribute, VertexField, VertexBuffer,
	vertexFieldElementCount, vertexFieldNumericType, vertexFieldElementSizeBytes
} from "@stardazed/vertex-buffer";

export class VertexAttributeView {
	readonly fromVertex: number;
	readonly toVertex: number;
	readonly vertexCount: number;
	readonly elementCount: number;

	private readonly vertexBuffer_: VertexBuffer;
	private readonly attr_: PositionedAttribute;
	private readonly stride_: number;
	private readonly elementArrayCtor_: TypedArrayConstructor;
	private readonly buffer_: ArrayBufferLike;
	private readonly dataView_: DataView;
	
	/**
	 * @expects fromVertex === undefined || (fromVertex >= 0 && fromVertex < vertexBuffer.vertexCount)
	 * @expects toVertex === undefined || (toVertex >= fromVertex && toVertex <= vertexBuffer.vertexCount)
	 */
	constructor(vertexBuffer: VertexBuffer, attr: PositionedAttribute, fromVertex?: number, toVertex?: number) {
		this.vertexBuffer_ = vertexBuffer;
		this.attr_ = attr;
		this.elementCount = vertexFieldElementCount(this.attr_.field);

		// validate or use default range
		const fullVertexCount = this.vertexBuffer_.vertexCount;
		if (fromVertex !== undefined) {
			this.fromVertex = fromVertex;
		}
		else {
			this.fromVertex = 0;
		}
		if (toVertex !== undefined) {
			this.toVertex = toVertex;
		}
		else {
			this.toVertex = fullVertexCount;
		}
		this.vertexCount = this.toVertex - this.fromVertex;

		// store some often used fields
		this.stride_ = vertexBuffer.stride;
		this.buffer_ = vertexBuffer.storage.buffer;
		this.dataView_ = new DataView(this.buffer_);
		this.elementArrayCtor_ = vertexFieldNumericType(attr.field)!.arrayType;
	}

	forEach(callback: (item: TypedArray) => void) {
		const max = this.vertexCount;
		for (let ix = 0; ix < max; ++ix) {
			callback(this.refItem(ix));
		}
	}

	/**
	 * @expects this.fromVertex + offset + valueCount <= this.vertexCount
	 * @expects source.length === this.elementCount || source.length >= valueCount * this.elementCount
	 */
	copyValuesFrom(source: NumArray, valueCount: number, offset = 0) {
		const buffer = this.buffer_;
		const stride = this.vertexBuffer_.stride;

		const elementSize = vertexFieldElementSizeBytes(this.attr_.field);
		const elementArrayCtor = this.elementArrayCtor_;
		
		const firstVertex = this.fromVertex + offset;
		let offsetBytes = this.vertexBuffer_.storage.byteOffset + (stride * firstVertex) + this.attr_.offset;
		let sourceIndex = 0;
		const sourceIncrement = source.length === this.elementCount ? 0 : this.elementCount;
		let arrView: TypedArray;

		if (this.elementCount === 1) {
			if (stride % elementSize === 0) {
				const strideInElements = (stride / elementSize) | 0;
				const offsetInElements = (offsetBytes / elementSize) | 0;
				arrView = new elementArrayCtor(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
				let vertexOffset = 0;
				for (let n = 0; n < valueCount; ++n) {
					arrView[vertexOffset] = source[sourceIndex];
					sourceIndex += sourceIncrement;
					vertexOffset += strideInElements;
				}
			}
			else {
				for (let n = 0; n < valueCount; ++n) {
					arrView = new elementArrayCtor(buffer, offsetBytes, 1);
					arrView[0] = source[sourceIndex];
					sourceIndex += sourceIncrement;
					offsetBytes += stride;
				}
			}
		}
		else if (this.elementCount === 2) {
			if (stride % elementSize === 0) {
				const strideInElements = (stride / elementSize) | 0;
				const offsetInElements = (offsetBytes / elementSize) | 0;
				arrView = new elementArrayCtor(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
				let vertexOffset = 0;
				for (let n = 0; n < valueCount; ++n) {
					arrView[0 + vertexOffset] = source[sourceIndex];
					arrView[1 + vertexOffset] = source[sourceIndex + 1];
					sourceIndex += sourceIncrement;
					vertexOffset += strideInElements;
				}
			}
			else {
				for (let n = 0; n < valueCount; ++n) {
					arrView = new elementArrayCtor(buffer, offsetBytes, 2);
					arrView[0] = source[sourceIndex];
					arrView[1] = source[sourceIndex + 1];
					sourceIndex += sourceIncrement;
					offsetBytes += stride;
				}
			}
		}
		else if (this.elementCount === 3) {
			if (stride % elementSize === 0) {
				const strideInElements = (stride / elementSize) | 0;
				const offsetInElements = (offsetBytes / elementSize) | 0;
				arrView = new elementArrayCtor(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
				let vertexOffset = 0;
				for (let n = 0; n < valueCount; ++n) {
					arrView[0 + vertexOffset] = source[sourceIndex];
					arrView[1 + vertexOffset] = source[sourceIndex + 1];
					arrView[2 + vertexOffset] = source[sourceIndex + 2];
					sourceIndex += sourceIncrement;
					vertexOffset += strideInElements;
				}
			}
			else {
				for (let n = 0; n < valueCount; ++n) {
					arrView = new elementArrayCtor(buffer, offsetBytes, 3);
					arrView[0] = source[sourceIndex];
					arrView[1] = source[sourceIndex + 1];
					arrView[2] = source[sourceIndex + 2];
					sourceIndex += sourceIncrement;
					offsetBytes += stride;
				}
			}
		}
		else if (this.elementCount === 4) {
			if (stride % elementSize === 0) {
				const strideInElements = (stride / elementSize) | 0;
				const offsetInElements = (offsetBytes / elementSize) | 0;
				arrView = new elementArrayCtor(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
				let vertexOffset = 0;
				for (let n = 0; n < valueCount; ++n) {
					arrView[0 + vertexOffset] = source[sourceIndex];
					arrView[1 + vertexOffset] = source[sourceIndex + 1];
					arrView[2 + vertexOffset] = source[sourceIndex + 2];
					arrView[3 + vertexOffset] = source[sourceIndex + 3];
					sourceIndex += sourceIncrement;
					vertexOffset += strideInElements;
				}
			}
			else {
				for (let n = 0; n < valueCount; ++n) {
					arrView = new elementArrayCtor(buffer, offsetBytes, 4);
					arrView[0] = source[sourceIndex];
					arrView[1] = source[sourceIndex + 1];
					arrView[2] = source[sourceIndex + 2];
					arrView[3] = source[sourceIndex + 3];
					sourceIndex += sourceIncrement;
					offsetBytes += stride;
				}
			}
		}
	}

	/**
	 * Copy a value into the indicated position of the viewed attribute.
	 * @expects value.length === this.elementCount
	 */
	setValue(index: number, value: NumArray) {
		this.copyValuesFrom(value, 1, index);
	}

	/**
	 * Copy a single value into every position of the viewed attribute.
	 * @expects value.length === this.elementCount
	 */
	splat(value: NumArray) {
		this.copyValuesFrom(value, this.vertexCount, 0);
	}

	/**
	 * Return a mutable array referencing the value of vertex `index`
	 */
	refItem(index: number): TypedArray {
		index += this.fromVertex;
		const offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * index) + this.attr_.offset;
		return new this.elementArrayCtor_(this.buffer_, offsetBytes, this.elementCount);
	}

	/**
	 * @expects index >= 0 && index < this.vertexCount
	 * @expects this.attr_.field >= VertexField.Float && this.attr_.field <= VertexField.Floatx4
	 */
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
				break;
		}

		return result;
	}

	subView(fromVertex: number, toVertex: number) {
		return new VertexAttributeView(this.vertexBuffer_, this.attr_, this.fromVertex + fromVertex, this.fromVertex + toVertex);
	}
}
