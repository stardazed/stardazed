// meshdata/meshdata - mesh data
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.meshdata {

	//   ___ _ _         _   ___       __  __
	//  / __| (_)___ _ _| |_| _ )_  _ / _|/ _|___ _ _
	// | (__| | / -_) ' \  _| _ \ || |  _|  _/ -_) '_|
	//  \___|_|_\___|_||_\__|___/\_,_|_| |_| \___|_|
	//

	export interface ClientBuffer {
		readonly bufferSizeBytes: number;
		readonly bufferLocalOffsetBytes: number;
		readonly buffer: ArrayBuffer | null;
		bufferView(): ArrayBufferView | null;
	}


	// __   __       _           ___       __  __
	// \ \ / /__ _ _| |_ _____ _| _ )_  _ / _|/ _|___ _ _
	//  \ V / -_) '_|  _/ -_) \ / _ \ || |  _|  _/ -_) '_|
	//   \_/\___|_|  \__\___/_\_\___/\_,_|_| |_| \___|_|
	//

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


	//  ___         _         ___       __  __
	// |_ _|_ _  __| |_____ _| _ )_  _ / _|/ _|___ _ _
	//  | || ' \/ _` / -_) \ / _ \ || |  _|  _/ -_) '_|
	// |___|_||_\__,_\___/_\_\___/\_,_|_| |_| \___|_|
	//

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


	export class TriangleProxy {
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


	// FIXME: extract out interface of triangleview and implement triview for non-indexed meshes

	export class IndexBufferTriangleView {
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

		forEach(callback: (proxy: TriangleProxy) => void) {
			const primCount = this.toTriangle_ - this.fromTriangle_;
			const basePtr = this.indexBuffer_.typedBasePtr(this.fromTriangle_ * 3, primCount * 3);

			for (let tix = 0; tix < primCount; ++tix) {
				callback(new TriangleProxy(basePtr, tix));
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
	}


	//  ___          _            _   ___       _
	// |   \ ___ _ _(_)_ _____ __| | |   \ __ _| |_ __ _
	// | |) / -_) '_| \ V / -_) _` | | |) / _` |  _/ _` |
	// |___/\___|_| |_|\_/\___\__,_| |___/\__,_|\__\__,_|
	//

	// FIXME: once we have triview for non-indexed meshes, make param optional and create proper view

	export function calcVertexNormals(vertexBuffer: VertexBuffer, indexBuffer: IndexBuffer) {
		const posAttr = vertexBuffer.layout.attrByRole(VertexAttributeRole.Position);
		const normAttr = vertexBuffer.layout.attrByRole(VertexAttributeRole.Normal);

		if (posAttr && normAttr) {
			const posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
			const normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
			const triView = new IndexBufferTriangleView(indexBuffer);

			calcVertexNormalsViews(posView, normView, triView);
		}
		// TODO: else warn?
	}


	export function calcVertexNormalsViews(posView: VertexBufferAttributeView, normView: VertexBufferAttributeView, triView: IndexBufferTriangleView) {
		const vertexCount = posView.count;
		const normalCount = normView.count;
		assert(vertexCount <= normalCount);
		const baseVertex = normView.baseVertex;

		normView.forEach((norm) => {
			vec3.set(norm, 0, 0, 1);
		});
		const usages = new Float32Array(vertexCount);

		const lineA = vec3.create(), lineB = vec3.create();
		const faceNormal = vec3.create(), temp = vec3.create();

		triView.forEach((face: TriangleProxy) => {
			const posA = posView.copyItem(face.a() - baseVertex);
			const posB = posView.copyItem(face.b() - baseVertex);
			const posC = posView.copyItem(face.c() - baseVertex);

			vec3.subtract(lineA, posB, posA);
			vec3.subtract(lineB, posC, posB);

			if (vec3.length(lineA) < 0.00001 || vec3.length(lineB) < 0.00001) {
				return;
			}

			vec3.cross(faceNormal, lineA, lineB);
			vec3.normalize(faceNormal, faceNormal);

			for (let fi = 0; fi < 3; ++fi) {
				const fvi = face.index(fi) - baseVertex;
				const norm = normView.refItem(fvi);

				// normBegin[fvi] = (normBegin[fvi] * usages[fvi] + faceNormal) / (usages[fvi] + 1.0f);
				vec3.scaleAndAdd(temp, faceNormal, norm, usages[fvi]);
				vec3.scale(norm, temp, 1 / (usages[fvi] + 1));

				usages[fvi] += 1;
			}
		});

		normView.forEach((norm) => {
			vec3.normalize(norm, norm);
		});
	}


	export function calcVertexTangents(vertexBuffer: VertexBuffer, indexBuffer: IndexBuffer, uvSet = VertexAttributeRole.UV0) {
		const posAttr = vertexBuffer.layout.attrByRole(VertexAttributeRole.Position);
		const normAttr = vertexBuffer.layout.attrByRole(VertexAttributeRole.Normal);
		const uvAttr = vertexBuffer.layout.attrByRole(uvSet);
		const tanAttr = vertexBuffer.layout.attrByRole(VertexAttributeRole.Tangent);

		if (posAttr && normAttr && uvAttr && tanAttr) {
			const posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
			const normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
			const uvView = new VertexBufferAttributeView(vertexBuffer, uvAttr);
			const tanView = new VertexBufferAttributeView(vertexBuffer, tanAttr);
			const triView = new IndexBufferTriangleView(indexBuffer);

			calcVertexTangentsViews(posView, normView, uvView, tanView, triView);
		}
		// TODO: else warn?
	}


	export function calcVertexTangentsViews(
		posView: VertexBufferAttributeView,
		normView: VertexBufferAttributeView,
		uvView: VertexBufferAttributeView,
		tanView: VertexBufferAttributeView,
		triView: IndexBufferTriangleView
	) {
		// adaptation of http://www.terathon.com/code/tangent.html
		// by Eric Lengyel

		const vertexCount = posView.count;
		assert(vertexCount <= normView.count);
		assert(vertexCount <= uvView.count);
		assert(vertexCount <= tanView.count);

		const tanBuf = new Float32Array(vertexCount * 3 * 2);
		const tan1 = tanBuf.subarray(0, vertexCount);
		const tan2 = tanBuf.subarray(vertexCount);

		triView.forEach(face => {
			const a = face.a(),
				b = face.b(),
				c = face.c();

			const v1 = posView.copyItem(a),
				v2 = posView.copyItem(b),
				v3 = posView.copyItem(c);

			const w1 = uvView.copyItem(a),
				w2 = uvView.copyItem(b),
				w3 = uvView.copyItem(c);

			const x1 = v2[0] - v1[0];
			const x2 = v3[0] - v1[0];
			const y1 = v2[1] - v1[1];
			const y2 = v3[1] - v1[1];
			const z1 = v2[2] - v1[2];
			const z2 = v3[2] - v1[2];

			const s1 = w2[0] - w1[0];
			const s2 = w3[0] - w1[0];
			const t1 = w2[1] - w1[1];
			const t2 = w3[1] - w1[1];

			const rd = (s1 * t2 - s2 * t1);
			const r = rd == 0 ? 0.0 : 1.0 / rd;
			const sdir = [
				(t2 * x1 - t1 * x2) * r,
				(t2 * y1 - t1 * y2) * r,
				(t2 * z1 - t1 * z2) * r
			];
			const tdir = [
				(s1 * x2 - s2 * x1) * r,
				(s1 * y2 - s2 * y1) * r,
				(s1 * z2 - s2 * z1) * r
			];

			// tan1[a] += sdir;
			// tan1[b] += sdir;
			// tan1[c] += sdir;
			const tan1a = container.copyIndexedVec3(tan1, a);
			const tan1b = container.copyIndexedVec3(tan1, b);
			const tan1c = container.copyIndexedVec3(tan1, c);
			container.setIndexedVec3(tan1, a, vec3.add(tan1a, tan1a, sdir));
			container.setIndexedVec3(tan1, b, vec3.add(tan1b, tan1b, sdir));
			container.setIndexedVec3(tan1, c, vec3.add(tan1c, tan1c, sdir));

			// tan2[a] += tdir;
			// tan2[b] += tdir;
			// tan2[c] += tdir;
			const tan2a = container.copyIndexedVec3(tan2, a);
			const tan2b = container.copyIndexedVec3(tan2, b);
			const tan2c = container.copyIndexedVec3(tan2, c);
			container.setIndexedVec3(tan2, a, vec3.add(tan2a, tan2a, tdir));
			container.setIndexedVec3(tan2, b, vec3.add(tan2b, tan2b, tdir));
			container.setIndexedVec3(tan2, c, vec3.add(tan2c, tan2c, tdir));
		});

		for (let ix = 0; ix < vertexCount; ++ix) {
			const n = normView.copyItem(ix);
			const t = container.copyIndexedVec3(tan1, ix);
			const t2 = container.copyIndexedVec3(tan2, ix);

			// Gram-Schmidt orthogonalize, specify standard normal in case n or t = 0
			const tangent = vec3.normalize([0, 0, 1], vec3.sub([], t, vec3.scale([], n, vec3.dot(n, t))));

			// Reverse tangent to conform to GL handedness if needed
			if (vec3.dot(vec3.cross([], n, t), t2) < 0) {
				vec3.scale(tangent, tangent, -1);
			}

			if (isNaN(tangent[0]) || isNaN(tangent[1]) || isNaN(tangent[2])) {
				assert(false, "Failure during tangent calculation");
			}
			vec3.copy(tanView.refItem(ix), tangent);
		}
	}


	//  __  __        _    ___       _
	// |  \/  |___ __| |_ |   \ __ _| |_ __ _
	// | |\/| / -_|_-< ' \| |) / _` |  _/ _` |
	// |_|  |_\___/__/_||_|___/\__,_|\__\__,_|
	//

	export interface PrimitiveGroup {
		type: meshdata.PrimitiveType;
		fromElement: number;
		elementCount: number;
		materialIx: number; // mesh-local index (starting at 0); representation of Materials is external to MeshData
	}

	const enum BufferAlignment {
		SubBuffer = 8
	}

	export class MeshData {
		vertexBuffers: VertexBuffer[] = [];
		indexBuffer: IndexBuffer | null = null;
		primitiveGroups: PrimitiveGroup[] = [];

		allocateSingleStorage(vertexBufferItemCounts: number[], elementType: IndexElementType, indexCount: number) {
			assert(vertexBufferItemCounts.length === this.vertexBuffers.length, "Did not specify exactly 1 item count per VertexBuffer");

			let totalBytes = 0;
			for (let vbix = 0; vbix < this.vertexBuffers.length; ++vbix) {
				totalBytes += this.vertexBuffers[vbix].layout.bytesRequiredForVertexCount(vertexBufferItemCounts[vbix]);
				totalBytes = math.alignUp(totalBytes, BufferAlignment.SubBuffer);
			}
			if (this.indexBuffer) {
				totalBytes += bytesRequiredForIndexCount(elementType, indexCount);
				totalBytes = math.alignUp(totalBytes, BufferAlignment.SubBuffer);
			}

			assert(totalBytes > 0, "Nothing to allocate!");

			const storage = new ArrayBuffer(totalBytes);

			let byteOffset = 0;
			for (let vbix = 0; vbix < this.vertexBuffers.length; ++vbix) {
				this.vertexBuffers[vbix].suballocate(vertexBufferItemCounts[vbix], storage, byteOffset);
				byteOffset += this.vertexBuffers[vbix].bufferSizeBytes;
				byteOffset = math.alignUp(byteOffset, BufferAlignment.SubBuffer);
			}
			if (this.indexBuffer) {
				this.indexBuffer.suballocate(elementType, indexCount, storage, byteOffset);
				byteOffset += this.indexBuffer.bufferSizeBytes;
				byteOffset = math.alignUp(byteOffset, BufferAlignment.SubBuffer);
			}

			assert(totalBytes === byteOffset, "Mismatch of precalculated and actual buffer sizes");
		}


		findFirstAttributeWithRole(role: VertexAttributeRole): { vertexBuffer: VertexBuffer; attr: PositionedAttribute; } | null {
			let pa: PositionedAttribute | null = null;
			let avb: VertexBuffer | null = null;

			this.vertexBuffers.forEach((vb) => {
				if (! pa) {
					pa = vb.layout.attrByRole(role);
					if (pa) {
						avb = vb;
					}
				}
			});

			if (pa && avb) {
				return { vertexBuffer: avb, attr: pa };
			}
			return null;
		}

		// derived vertex data generation
		genVertexNormals() {
			this.vertexBuffers.forEach((vertexBuffer) => {
				if (this.indexBuffer) {
					calcVertexNormals(vertexBuffer, this.indexBuffer);
				}
			});
		}
	}

} // ns sd.meshdata
