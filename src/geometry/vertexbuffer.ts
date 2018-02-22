// geometry/vertexbuffer - vertex buffers and attribute views
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.geometry {

	export class VertexBuffer {
		readonly storage: Uint8ClampedArray;
		readonly vertexCount: number;
		readonly stride: number;

		get sizeBytes() {
			return this.vertexCount * this.stride;
		}

		constructor(vertexCount: number, stride: number, usingStorage?: Uint8ClampedArray) {
			vertexCount = vertexCount | 0;
			stride = stride | 0;
			assert(vertexCount > 0);
			assert(stride > 0);
			this.vertexCount = vertexCount;
			this.stride = stride;

			if (usingStorage) {
				assert(usingStorage.byteLength >= this.sizeBytes, "Not enough space in supplied storage");
				this.storage = usingStorage;
			}
			else {
				this.storage = new Uint8ClampedArray(this.sizeBytes);
			}
		}
	}


	export class VertexBufferAttributeView {
		private stride_: number;
		private attrOffset_: number;
		private attrElementCount_: number;
		private fieldNumType_: NumericType;
		private typedViewCtor_: TypedArrayConstructor;
		private buffer_: ArrayBuffer | SharedArrayBuffer;
		private dataView_: DataView;
		private viewItemCount_: number;

		constructor(private vertexBuffer_: VertexBuffer, private attr_: PositionedAttribute, private firstItem_ = 0, itemCount = -1) {
			this.stride_ = this.vertexBuffer_.stride;
			this.attrOffset_ = attr_.offset;
			this.attrElementCount_ = vertexFieldElementCount(attr_.field);

			// FIXME: error refactoring
			this.fieldNumType_ = vertexFieldNumericType(attr_.field)!;
			assert(this.fieldNumType_, "Unknown attribute field type");
			this.typedViewCtor_ = this.fieldNumType_.arrayType;

			this.buffer_ = this.vertexBuffer_.storage.buffer;

			this.dataView_ = new DataView(this.buffer_);
			this.viewItemCount_ = itemCount < 0 ? (this.vertexBuffer_.vertexCount - this.firstItem_) : itemCount;

			assert(this.firstItem_ + this.viewItemCount_ <= this.vertexBuffer_.vertexCount, "view item range is bigger than buffer");
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
			let offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * firstIndex) + this.attrOffset_;
			let sourceIndex = 0;
			let arrView: TypedArray;

			if (this.attrElementCount_ === 1) {
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
			else if (this.attrElementCount_ === 2) {
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
			else if (this.attrElementCount_ === 3) {
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
			else if (this.attrElementCount_ === 4) {
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
			index += this.firstItem_;
			const offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * index) + this.attrOffset_;
			return new (this.typedViewCtor_)(this.buffer_, offsetBytes, this.attrElementCount_);
		}

		copyItem(index: number): number[] {
			index += this.firstItem_;
			let offsetBytes = this.vertexBuffer_.storage.byteOffset + (this.stride_ * index) + this.attrOffset_;
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

		get count() { return this.viewItemCount_; }
		get elementCount() { return this.attrElementCount_; }
		get baseVertex() { return this.firstItem_; }
		get vertexBuffer() { return this.vertexBuffer_; }

		subView(fromItem: number, subItemCount: number) {
			return new VertexBufferAttributeView(this.vertexBuffer_, this.attr_, this.firstItem_ + fromItem, subItemCount);
		}
	}

} // ns sd.geometry
