// meshdata/vertexbuffer - vertex buffers and attribute views
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.meshdata {

	export class VertexBuffer implements ClientBuffer {
		private layout_: VertexLayout;
		private vertexCount_ = 0;
		private storageOffsetBytes_ = 0;
		private storage_: ArrayBuffer | null = null;

		constructor(attrs: VertexAttribute[] | VertexLayout) {
			if (attrs instanceof VertexLayout) {
				this.layout_ = attrs;
			}
			else {
				this.layout_ = new VertexLayout(attrs);
			}
		}

		// -- buffer data management

		get layout() { return this.layout_; }
		get strideBytes() { return this.layout_.vertexSizeBytes; }
		get attributeCount() { return this.layout_.attributeCount; }
		get vertexCount() { return this.vertexCount_; }
		get bufferSizeBytes() { return this.strideBytes * this.vertexCount_; }
		get bufferLocalOffsetBytes() { return this.storageOffsetBytes_; }
		get buffer() { return this.storage_; }

		bufferView(): ArrayBufferView | null {
			if (this.storage_) {
				return new Uint8Array(this.storage_, this.storageOffsetBytes_, this.bufferSizeBytes);
			}
			return null;
		}

		allocate(vertexCount: number) {
			this.vertexCount_ = vertexCount;
			this.storage_ = new ArrayBuffer(this.layout_.bytesRequiredForVertexCount(vertexCount));
			this.storageOffsetBytes_ = 0;
		}

		suballocate(vertexCount: number, insideBuffer: ArrayBuffer, atByteOffset: number) {
			this.vertexCount_ = vertexCount;
			this.storage_ = insideBuffer;
			this.storageOffsetBytes_ = atByteOffset;
		}
	}


	class DirectTriangleProxy implements meshdata.TriangleProxy {
		index(index: number) {
			return this.baseIndex_ + index;
		}
		a() { return this.baseIndex_; }
		b() { return this.baseIndex_ + 1; }
		c() { return this.baseIndex_ + 2; }

		baseIndex_: number = 0; // tslint:disable-line
		setTriangleIndex(tri: number) { this.baseIndex_ = tri * 3; }
	}


	export class DirectTriangleView implements TriangleView {
		readonly mutable = false;
		readonly count: number = 0; // tslint:disable-line

		constructor(vertexCount: number, private fromTriangle_ = -1, private toTriangle_ = -1) {
			this.count = primitiveCountForElementCount(PrimitiveType.Triangle, vertexCount);

			if (this.fromTriangle_ < 0) {
				this.fromTriangle_ = 0;
			}
			if (this.fromTriangle_ >= this.count) {
				this.fromTriangle_ = this.count - 1;
			}
			if ((this.toTriangle_ < 0) || (this.toTriangle_ > this.count)) {
				this.toTriangle_ = this.count;
			}
		}

		forEach(callback: (proxy: TriangleProxy) => void) {
			const primCount = this.toTriangle_ - this.fromTriangle_;
			const dtp = new DirectTriangleProxy();

			for (let tri = 0; tri < primCount; ++tri) {
				dtp.setTriangleIndex(tri + this.fromTriangle_);
				callback(dtp);
			}
		}

		refItem(triangleIndex: number): Triangle {
			const baseIndex = triangleIndex * 3;
			return [baseIndex, baseIndex + 1, baseIndex + 2];
		}

		subView(fromTriangle: number, triangleCount: number): TriangleView {
			return new DirectTriangleView(this.count * 3, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + fromTriangle + triangleCount);
		}
	}


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

		get count() { return this.viewItemCount_; }
		get elementCount() { return this.attrElementCount_; }
		get baseVertex() { return this.firstItem_; }
		get vertexBuffer() { return this.vertexBuffer_; }

		subView(fromItem: number, subItemCount: number) {
			return new VertexBufferAttributeView(this.vertexBuffer_, this.attr_, this.firstItem_ + fromItem, subItemCount);
		}
	}

} // ns sd.meshdata
