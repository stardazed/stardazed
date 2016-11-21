// mesh/vertexbuffer - client vertex buffer and views
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";
import { NumericType } from "core/numeric";
import { TypedArrayConstructor, TypedArray, ArrayOfConstNumber } from "core/array";
import { ClientBuffer, VertexField, VertexAttributeRole, vertexFieldElementCount, vertexFieldNumericType } from "mesh/types";
import { VertexAttribute, VertexLayout, PositionedAttribute } from "mesh/layout";

// __   __       _           ___       __  __         
// \ \ / /__ _ _| |_ _____ _| _ )_  _ / _|/ _|___ _ _ 
//  \ V / -_) '_|  _/ -_) \ / _ \ || |  _|  _/ -_) '_|
//   \_/\___|_|  \__\___/_\_\___/\_,_|_| |_| \___|_|  
//                                                    

export class VertexBuffer implements ClientBuffer {
	private layout_: VertexLayout;
	private itemCount_ = 0;
	private storageOffsetBytes_ = 0;
	private storage_: ArrayBuffer | null = null;

	constructor(attrs: VertexAttribute[] | VertexLayout) {
		if (attrs instanceof VertexLayout) {
			this.layout_ = attrs;
		}
		else {
			this.layout_ = new VertexLayout(<VertexAttribute[]>attrs);
		}
	}

	// -- buffer data management

	get layout() { return this.layout_; }
	get strideBytes() { return this.layout_.vertexSizeBytes; }
	get attributeCount() { return this.layout_.attributeCount; }
	get itemCount() { return this.itemCount_; }
	get bufferSizeBytes() { return this.strideBytes * this.itemCount_; }
	get bufferLocalOffsetBytes() { return this.storageOffsetBytes_; }
	get buffer() { return this.storage_; }

	bufferView(): ArrayBufferView | null {
		if (this.storage_) {
			return new Uint8Array(this.storage_, this.storageOffsetBytes_, this.bufferSizeBytes);
		}

		return null;
	}

	allocate(itemCount: number) {
		this.itemCount_ = itemCount;
		this.storage_ = new ArrayBuffer(this.layout_.bytesRequiredForVertexCount(itemCount));
		this.storageOffsetBytes_ = 0;
	}

	suballocate(itemCount: number, insideBuffer: ArrayBuffer, atByteOffset: number) {
		this.itemCount_ = itemCount;
		this.storage_ = insideBuffer;
		this.storageOffsetBytes_ = atByteOffset;
	}

	// -- attribute access pass-through

	hasAttributeWithRole(role: VertexAttributeRole) {
		return this.layout_.hasAttributeWithRole(role);
	}
	attrByRole(role: VertexAttributeRole) {
		return this.layout_.attrByRole(role);
	}
	attrByIndex(index: number) {
		return this.layout_.attrByIndex(index);
	}
}


// __   __       _           ___       __  __          _  _   _       _ _         _     __   ___            
// \ \ / /__ _ _| |_ _____ _| _ )_  _ / _|/ _|___ _ _ /_\| |_| |_ _ _(_) |__ _  _| |_ __\ \ / (_)_____ __ __
//  \ V / -_) '_|  _/ -_) \ / _ \ || |  _|  _/ -_) '_/ _ \  _|  _| '_| | '_ \ || |  _/ -_) V /| / -_) V  V /
//   \_/\___|_|  \__\___/_\_\___/\_,_|_| |_| \___|_|/_/ \_\__|\__|_| |_|_.__/\_,_|\__\___|\_/ |_\___|\_/\_/ 
//                                                                                                          

export class VertexBufferAttributeView {
	private stride_: number;
	private attrOffset_: number;
	private attrElementCount_: number;
	private fieldNumType_: NumericType;
	private typedViewCtor_: TypedArrayConstructor;
	private buffer_: ArrayBuffer;
	private dataView_: DataView;
	private viewItemCount_: number;

	constructor(private vertexBuffer_: VertexBuffer, private attr_: PositionedAttribute, private firstItem_ = 0, itemCount = -1) {
		this.stride_ = this.vertexBuffer_.layout.vertexSizeBytes;
		this.attrOffset_ = attr_.offset;
		this.attrElementCount_ = vertexFieldElementCount(attr_.field);

		// FIXME: error refactoring
		this.fieldNumType_ = vertexFieldNumericType(attr_.field)!;
		assert(this.fieldNumType_, "Unknown attribute field type");
		this.typedViewCtor_ = this.fieldNumType_.arrayType;

		this.buffer_ = this.vertexBuffer_.buffer!;
		assert(this.buffer_, "Tried to create a view on an unallocated buffer");

		this.dataView_ = new DataView(this.buffer_);
		this.viewItemCount_ = itemCount < 0 ? (this.vertexBuffer_.itemCount - this.firstItem_) : itemCount;

		assert(this.firstItem_ + this.viewItemCount_ <= this.vertexBuffer_.itemCount, "view item range is bigger than buffer");
	}

	forEach(callback: (item: TypedArray) => void) {
		const max = this.count;
		for (let ix = 0; ix < max; ++ix) {
			callback(this.refItem(ix));
		}
	}

	copyValuesFrom(source: ArrayOfConstNumber, valueCount: number, offset = 0) {
		assert(this.firstItem_ + offset + valueCount <= this.viewItemCount_, "buffer overflow");
		assert(source.length >= valueCount * this.attrElementCount_, "not enough elements in source");

		const buffer = this.buffer_;
		const stride = this.stride_;
		const elementSize = this.fieldNumType_.byteSize;
		const firstIndex = this.firstItem_ + offset;
		let offsetBytes = this.vertexBuffer_.bufferLocalOffsetBytes + (this.stride_ * firstIndex) + this.attrOffset_;
		let sourceIndex = 0;
		let arrView: TypedArray;

		if (this.attrElementCount_ == 1) {
			if (stride % elementSize == 0) {
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
		else if (this.attrElementCount_ == 2) {
			if (stride % elementSize == 0) {
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
		else if (this.attrElementCount_ == 3) {
			if (stride % elementSize == 0) {
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
		else if (this.attrElementCount_ == 4) {
			if (stride % elementSize == 0) {
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
		index += this.firstItem_;
		const offsetBytes = this.vertexBuffer_.bufferLocalOffsetBytes + (this.stride_ * index) + this.attrOffset_;
		return new (this.typedViewCtor_)(this.buffer_, offsetBytes, this.attrElementCount_);
	}

	copyItem(index: number): number[] {
		index += this.firstItem_;
		let offsetBytes = this.vertexBuffer_.bufferLocalOffsetBytes + (this.stride_ * index) + this.attrOffset_;
		const result: number[] = [];

		switch (this.attr_.field) {
			case VertexField.Floatx4:
				result.push(this.dataView_.getFloat32(offsetBytes, true));
				offsetBytes += 4;
			case VertexField.Floatx3:
				result.push(this.dataView_.getFloat32(offsetBytes, true));
				offsetBytes += 4;
			case VertexField.Floatx2:
				result.push(this.dataView_.getFloat32(offsetBytes, true));
				offsetBytes += 4;
			case VertexField.Float:
				result.push(this.dataView_.getFloat32(offsetBytes, true));
				break;

			default:
				assert(false, "copyItem not implemented for this fieldtype");
				break;
		}

		return result;
	}

	get count() {
		return this.viewItemCount_;
	}

	get elementCount() {
		return this.attrElementCount_;
	}

	get baseVertex() {
		return this.firstItem_;
	}

	get vertexBuffer() {
		return this.vertexBuffer_;
	}

	subView(fromItem: number, subItemCount: number) {
		return new VertexBufferAttributeView(this.vertexBuffer_, this.attr_, this.firstItem_ + fromItem, subItemCount);
	}
}
