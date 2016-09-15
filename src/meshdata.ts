// meshdata.ts - mesh data
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="../defs/webgl-ext.d.ts" />

/// <reference path="core.ts" />
/// <reference path="math.ts" />
/// <reference path="numeric.ts" />

namespace sd.mesh {

	// -- A single field in a vertex buffer
	// -- 3 properties: element type, count and normalization

	export const enum VertexField {
		Undefined,

		// integer
		UInt8x2,
		UInt8x3,
		UInt8x4,

		SInt8x2,
		SInt8x3,
		SInt8x4,

		UInt16x2,
		UInt16x3,
		UInt16x4,

		SInt16x2,
		SInt16x3,
		SInt16x4,

		UInt32,
		UInt32x2,
		UInt32x3,
		UInt32x4,

		SInt32,
		SInt32x2,
		SInt32x3,
		SInt32x4,

		// floating point
		Float,
		Floatx2,
		Floatx3,
		Floatx4,

		// normalized
		Norm_UInt8x2 = 0x81,	// normalized fields have high bit set
		Norm_UInt8x3,
		Norm_UInt8x4,

		Norm_SInt8x2,
		Norm_SInt8x3,
		Norm_SInt8x4,

		Norm_UInt16x2,
		Norm_UInt16x3,
		Norm_UInt16x4,

		Norm_SInt16x2,
		Norm_SInt16x3,
		Norm_SInt16x4
	};


	// --- VertexField traits

	export function vertexFieldElementCount(vf: VertexField) {
		switch (vf) {
			case VertexField.UInt32:
			case VertexField.SInt32:
			case VertexField.Float:
				return 1;

			case VertexField.UInt8x2:
			case VertexField.Norm_UInt8x2:
			case VertexField.SInt8x2:
			case VertexField.Norm_SInt8x2:
			case VertexField.UInt16x2:
			case VertexField.Norm_UInt16x2:
			case VertexField.SInt16x2:
			case VertexField.Norm_SInt16x2:
			case VertexField.UInt32x2:
			case VertexField.SInt32x2:
			case VertexField.Floatx2:
				return 2;

			case VertexField.UInt8x3:
			case VertexField.Norm_UInt8x3:
			case VertexField.SInt8x3:
			case VertexField.Norm_SInt8x3:
			case VertexField.UInt16x3:
			case VertexField.Norm_UInt16x3:
			case VertexField.SInt16x3:
			case VertexField.Norm_SInt16x3:
			case VertexField.UInt32x3:
			case VertexField.SInt32x3:
			case VertexField.Floatx3:
				return 3;

			case VertexField.UInt8x4:
			case VertexField.Norm_UInt8x4:
			case VertexField.SInt8x4:
			case VertexField.Norm_SInt8x4:
			case VertexField.UInt16x4:
			case VertexField.Norm_UInt16x4:
			case VertexField.SInt16x4:
			case VertexField.Norm_SInt16x4:
			case VertexField.UInt32x4:
			case VertexField.SInt32x4:
			case VertexField.Floatx4:
				return 4;

			case VertexField.Undefined:
			default:
				return 0;
		}
	}


	export function vertexFieldNumericType(vf: VertexField): NumericType | null {
		switch (vf) {
			case VertexField.Float:
			case VertexField.Floatx2:
			case VertexField.Floatx3:
			case VertexField.Floatx4:
				return Float;

			case VertexField.UInt32:
			case VertexField.UInt32x2:
			case VertexField.UInt32x3:
			case VertexField.UInt32x4:
				return UInt32;

			case VertexField.SInt32:
			case VertexField.SInt32x2:
			case VertexField.SInt32x3:
			case VertexField.SInt32x4:
				return SInt32;

			case VertexField.UInt16x2:
			case VertexField.Norm_UInt16x2:
			case VertexField.UInt16x3:
			case VertexField.Norm_UInt16x3:
			case VertexField.UInt16x4:
			case VertexField.Norm_UInt16x4:
				return UInt16;

			case VertexField.SInt16x2:
			case VertexField.Norm_SInt16x2:
			case VertexField.SInt16x3:
			case VertexField.Norm_SInt16x3:
			case VertexField.SInt16x4:
			case VertexField.Norm_SInt16x4:
				return SInt16;

			case VertexField.UInt8x2:
			case VertexField.Norm_UInt8x2:
			case VertexField.UInt8x3:
			case VertexField.Norm_UInt8x3:
			case VertexField.UInt8x4:
			case VertexField.Norm_UInt8x4:
				return UInt8;

			case VertexField.SInt8x2:
			case VertexField.Norm_SInt8x2:
			case VertexField.SInt8x3:
			case VertexField.Norm_SInt8x3:
			case VertexField.SInt8x4:
			case VertexField.Norm_SInt8x4:
				return SInt8;

			case VertexField.Undefined:
			default:
				return null;
		}
	}


	export function vertexFieldElementSizeBytes(vf: VertexField) {
		var nt = vertexFieldNumericType(vf);
		return nt ? nt.byteSize : 0;
	}


	export function vertexFieldSizeBytes(vf: VertexField) {
		return vertexFieldElementSizeBytes(vf) * vertexFieldElementCount(vf);
	}


	export function vertexFieldIsNormalized(vf: VertexField) {
		return (vf & 0x80) != 0;
	}


	export const enum VertexAttributeRole {
		None,

		// basic attributes
		Position,
		Normal,
		Tangent,
		Colour,
		Material,

		// UV sets
		UV,
		UV0 = UV,
		UV1,
		UV2,
		UV3,

		// skinned mesh
		WeightedPos0, WeightedPos1, WeightedPos2, WeightedPos3,
		JointIndexes
	}

	// -- A VertexAttribute is a Field with a certain Role inside a VertexBuffer

	export interface VertexAttribute {
		field: VertexField;
		role: VertexAttributeRole;
	}


	// -- VertexAttribute shortcuts for common types

	export function attrPosition2(): VertexAttribute { return { field: VertexField.Floatx2, role: VertexAttributeRole.Position }; }
	export function attrPosition3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Position }; }
	export function attrNormal3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Normal }; }
	export function attrColour3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Colour }; }
	export function attrUV2(): VertexAttribute { return { field: VertexField.Floatx2, role: VertexAttributeRole.UV }; }
	export function attrTangent3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Tangent }; }

	export function attrJointIndexes(): VertexAttribute { return { field: VertexField.SInt32x4, role: VertexAttributeRole.JointIndexes }; }
	export function attrWeightedPos(index: number) {
		assert(index >= 0 && index < 4);
		return { field: VertexField.Floatx4, role: VertexAttributeRole.WeightedPos0 + index };
	}


	// -- Common AttributeList shortcuts

	export namespace AttrList {
		export function Pos3Norm3(): VertexAttribute[] {
			return [attrPosition3(), attrNormal3()];
		}
		export function Pos3Norm3Colour3() {
			return [attrPosition3(), attrNormal3(), attrColour3()];
		}
		export function Pos3Norm3UV2(): VertexAttribute[] {
			return [attrPosition3(), attrNormal3(), attrUV2()];
		}
		export function Pos3Norm3Colour3UV2() {
			return [attrPosition3(), attrNormal3(), attrColour3(), attrUV2()];
		}
		export function Pos3Norm3UV2Tan3(): VertexAttribute[] {
			return [attrPosition3(), attrNormal3(), attrUV2(), attrTangent3()];
		}

		export function SkinnedPosNormUV(): VertexAttribute[] {
			return [];
		}
	}


	export interface PositionedAttribute extends VertexAttribute {
		offset: number;
	}


	export function makePositionedAttr(vf: VertexField, ar: VertexAttributeRole, offset: number): PositionedAttribute;
	export function makePositionedAttr(attr: VertexAttribute, offset: number): PositionedAttribute;
	export function makePositionedAttr(fieldOrAttr: VertexField | VertexAttribute, roleOrOffset: VertexAttributeRole | number, offset?: number): PositionedAttribute {
		if (typeof fieldOrAttr === "number") {
			return {
				field: fieldOrAttr,
				role: roleOrOffset,
				offset: offset | 0
			};
		}
		else {
			return {
				field: fieldOrAttr.field,
				role: fieldOrAttr.role,
				offset: roleOrOffset | 0
			};
		}
	}


	function alignFieldOnSize(size: number, offset: number) {
		var mask = math.roundUpPowerOf2(size) - 1;
		return (offset + mask) & ~mask;
	}


	function alignVertexField(field: VertexField, offset: number) {
		return alignFieldOnSize(vertexFieldElementSizeBytes(field), offset);
	}


	// __   __       _           _                       _   
	// \ \ / /__ _ _| |_ _____ _| |   __ _ _  _ ___ _  _| |_ 
	//  \ V / -_) '_|  _/ -_) \ / |__/ _` | || / _ \ || |  _|
	//   \_/\___|_|  \__\___/_\_\____\__,_|\_, \___/\_,_|\__|
	//                                     |__/              

	export class VertexLayout {
		private attributeCount_ = 0;
		private vertexSizeBytes_ = 0;
		private attrs_: PositionedAttribute[];

		constructor(attrList: VertexAttribute[]) {
			this.attributeCount_ = attrList.length;

			var offset = 0, maxElemSize = 0;

			// calculate positioning of successive attributes in linear item
			this.attrs_ = attrList.map((attr: VertexAttribute): PositionedAttribute => {
				var size = vertexFieldSizeBytes(attr.field);
				maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));

				var alignedOffset = alignVertexField(attr.field, offset);
				offset = alignedOffset + size;
				return makePositionedAttr(attr, alignedOffset);
			});

			// align full item size on boundary of biggest element in attribute list, with min of float boundary
			maxElemSize = Math.max(Float32Array.BYTES_PER_ELEMENT, maxElemSize);
			this.vertexSizeBytes_ = alignFieldOnSize(maxElemSize, offset);
		}

		get attributeCount() { return this.attributeCount_; }
		get vertexSizeBytes() { return this.vertexSizeBytes_; }

		bytesRequiredForVertexCount(vertexCount: number): number {
			return vertexCount * this.vertexSizeBytes_;
		}

		attrByRole(role: VertexAttributeRole): PositionedAttribute | null {
			var attr = this.attrs_.find((pa) => pa.role == role);
			return attr || null;
		}

		attrByIndex(index: number): PositionedAttribute | null {
			return this.attrs_[index] || null;
		}

		hasAttributeWithRole(role: VertexAttributeRole): boolean {
			return this.attrByRole(role) != null;
		}
	}


	//   ___ _ _         _   ___       __  __            
	//  / __| (_)___ _ _| |_| _ )_  _ / _|/ _|___ _ _ 
	// | (__| | / -_) ' \  _| _ \ || |  _|  _/ -_) '_|
	//  \___|_|_\___|_||_\__|___/\_,_|_| |_| \___|_|  
	//                                                

	export interface ClientBuffer {
		readonly bufferSizeBytes: number;
		readonly buffer: ArrayBuffer | null;
	}


	// __   __       _           ___       __  __         
	// \ \ / /__ _ _| |_ _____ _| _ )_  _ / _|/ _|___ _ _ 
	//  \ V / -_) '_|  _/ -_) \ / _ \ || |  _|  _/ -_) '_|
	//   \_/\___|_|  \__\___/_\_\___/\_,_|_| |_| \___|_|  
	//	

	export class VertexBuffer implements ClientBuffer {
		private layout_: VertexLayout;
		private itemCount_ = 0;
		private storage_: ArrayBuffer | null = null;

		constructor(attrs: VertexAttribute[] | VertexLayout) {
			if (attrs instanceof VertexLayout)
				this.layout_ = attrs;
			else
				this.layout_ = new VertexLayout(<VertexAttribute[]>attrs);
		}

		// -- buffer data management

		get layout() { return this.layout_; }
		get strideBytes() { return this.layout_.vertexSizeBytes; }
		get attributeCount() { return this.layout_.attributeCount; }
		get itemCount() { return this.itemCount_; }
		get bufferSizeBytes() { return this.strideBytes * this.itemCount_; }
		get buffer() { return this.storage_; }

		allocate(itemCount: number) {
			this.itemCount_ = itemCount;
			this.storage_ = new ArrayBuffer(this.layout_.bytesRequiredForVertexCount(itemCount));
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
			var max = this.count;
			for (let ix = 0; ix < max; ++ix) {
				callback(this.refItem(ix));
			}
		}

		copyValuesFrom(source: ArrayOfNumber, valueCount: number, offset: number = 0) {
			assert(this.firstItem_ + offset + valueCount <= this.viewItemCount_, "buffer overflow");
			assert(source.length >= valueCount * this.attrElementCount_, "not enough elements in source");

			var firstIndex = this.firstItem_ + offset;
			var offsetBytes = (this.stride_ * firstIndex) + this.attrOffset_;
			var buffer = this.buffer_;
			var stride = this.stride_;
			var elementSize = this.fieldNumType_.byteSize;
			var sourceIndex = 0;
			var arrView: TypedArray;

			if (this.attrElementCount_ == 1) {
				if (stride % elementSize == 0) {
					arrView = new (this.typedViewCtor_)(buffer, offsetBytes);
					let vertexOffset = 0;
					let strideInElements = (stride / elementSize) | 0;
					for (var n = 0; n < valueCount; ++n) {
						arrView[vertexOffset] = source[sourceIndex];
						sourceIndex += 1;
						vertexOffset += strideInElements;
					}
				}
				else {
					for (var n = 0; n < valueCount; ++n) {
						arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 1);
						arrView[0] = source[sourceIndex];
						sourceIndex += 1;
						offsetBytes += stride;
					}
				}
			}
			else if (this.attrElementCount_ == 2) {
				if (stride % elementSize == 0) {
					arrView = new (this.typedViewCtor_)(buffer, offsetBytes);
					let vertexOffset = 0;
					let strideInElements = (stride / elementSize) | 0;
					for (var n = 0; n < valueCount; ++n) {
						arrView[0 + vertexOffset] = source[sourceIndex];
						arrView[1 + vertexOffset] = source[sourceIndex + 1];
						sourceIndex += 2;
						vertexOffset += strideInElements;
					}
				}
				else {
					for (var n = 0; n < valueCount; ++n) {
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
					arrView = new (this.typedViewCtor_)(buffer, offsetBytes);
					let vertexOffset = 0;
					let strideInElements = (stride / elementSize) | 0;
					for (var n = 0; n < valueCount; ++n) {
						arrView[0 + vertexOffset] = source[sourceIndex];
						arrView[1 + vertexOffset] = source[sourceIndex + 1];
						arrView[2 + vertexOffset] = source[sourceIndex + 2];
						sourceIndex += 3;
						vertexOffset += strideInElements;
					}
				}
				else {
					for (var n = 0; n < valueCount; ++n) {
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
					arrView = new (this.typedViewCtor_)(buffer, offsetBytes);
					let vertexOffset = 0;
					let strideInElements = (stride / elementSize) | 0;
					for (var n = 0; n < valueCount; ++n) {
						arrView[0 + vertexOffset] = source[sourceIndex];
						arrView[1 + vertexOffset] = source[sourceIndex + 1];
						arrView[2 + vertexOffset] = source[sourceIndex + 2];
						arrView[3 + vertexOffset] = source[sourceIndex + 3];
						sourceIndex += 4;
						vertexOffset += strideInElements;
					}
				}
				else {
					for (var n = 0; n < valueCount; ++n) {
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
			var offsetBytes = (this.stride_ * index) + this.attrOffset_;
			return new (this.typedViewCtor_)(this.buffer_, offsetBytes, this.attrElementCount_);
		}

		copyItem(index: number): number[] {
			index += this.firstItem_;
			var offsetBytes = (this.stride_ * index) + this.attrOffset_;
			var result: number[] = [];

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
		if (vertexCount <= UInt8.max)
			return IndexElementType.UInt8;
		if (vertexCount <= UInt16.max)
			return IndexElementType.UInt16;

		return IndexElementType.UInt32;
	}


	export function indexOffsetForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number) {
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


	export function indexCountForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number) {
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


	export class IndexBuffer implements ClientBuffer {
		private primitiveType_ = PrimitiveType.Point;
		private indexElementType_ = IndexElementType.UInt8;
		private indexCount_ = 0;
		private primitiveCount_ = 0;
		private indexElementSizeBytes_ = 0;
		private storage_: ArrayBuffer | null = null;

		allocate(primitiveType: PrimitiveType, elementType: IndexElementType, primitiveCount: number) {
			this.primitiveType_ = primitiveType;
			this.indexElementType_ = elementType;
			this.indexElementSizeBytes_ = indexElementTypeSizeBytes(this.indexElementType_);
			this.primitiveCount_ = primitiveCount;
			this.indexCount_ = indexCountForPrimitiveCount(primitiveType, primitiveCount);

			this.storage_ = new ArrayBuffer(this.bufferSizeBytes);
		}

		// -- observers
		get primitiveType() { return this.primitiveType_; }
		get indexElementType() { return this.indexElementType_; }

		get primitiveCount() { return this.primitiveCount_; }
		get indexCount() { return this.indexCount_; }
		get indexElementSizeBytes() { return this.indexElementSizeBytes_; }

		get bufferSizeBytes() { return this.indexCount_ * this.indexElementSizeBytes_; }
		get buffer() { return this.storage_; }

		// -- read/write indexes
		typedBasePtr(baseIndexNr: number, elementCount: number): TypedIndexArray {
			assert(this.storage_, "No storage allocated yet!");
			var offsetBytes = this.indexElementSizeBytes_ * baseIndexNr;

			if (this.indexElementType_ == IndexElementType.UInt32) {
				return new Uint32Array(this.storage_!, offsetBytes, elementCount);
			}
			else if (this.indexElementType_ == IndexElementType.UInt16) {
				return new Uint16Array(this.storage_!, offsetBytes, elementCount);
			}
			else {
				return new Uint8Array(this.storage_!, offsetBytes, elementCount);
			}
		}

		indexes(baseIndexNr: number, outputCount: number, outputPtr: Uint32Array) {
			assert(baseIndexNr < this.indexCount_);
			assert(baseIndexNr + outputCount <= this.indexCount_);
			assert(outputPtr.length >= outputCount);

			var typedBasePtr = this.typedBasePtr(baseIndexNr, outputCount);

			for (let ix = 0; ix < outputCount; ++ix) {
				outputPtr[ix] = typedBasePtr[ix];
			}
		}

		index(indexNr: number): number {
			var typedBasePtr = this.typedBasePtr(indexNr, 1);
			return typedBasePtr[0];
		}

		setIndexes(baseIndexNr: number, sourceCount: number, sourcePtr: ArrayOfNumber) {
			assert(baseIndexNr < this.indexCount_);
			assert(baseIndexNr + sourceCount <= this.indexCount_);
			assert(sourcePtr.length >= sourceCount);

			var typedBasePtr = this.typedBasePtr(baseIndexNr, sourceCount);

			for (let ix = 0; ix < sourceCount; ++ix) {
				typedBasePtr[ix] = sourcePtr[ix];
			}
		}

		setIndex(indexNr: number, newValue: number) {
			var typedBasePtr = this.typedBasePtr(indexNr, 1);
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
			assert(this.indexBuffer_.primitiveType == PrimitiveType.Triangle);

			// clamp range to available primitives, default to all triangles
			if (this.fromTriangle_ < 0)
				this.fromTriangle_ = 0;
			if (this.fromTriangle_ >= this.indexBuffer_.primitiveCount)
				this.fromTriangle_ = this.indexBuffer_.primitiveCount - 1;

			if ((this.toTriangle_ < 0) || (this.toTriangle_ > this.indexBuffer_.primitiveCount))
				this.toTriangle_ = this.indexBuffer_.primitiveCount;
		}

		forEach(callback: (proxy: TriangleProxy) => void) {
			var primCount = this.toTriangle_ - this.fromTriangle_;
			var basePtr = this.indexBuffer_.typedBasePtr(this.fromTriangle_ * 3, primCount * 3);

			for (let tix = 0; tix < primCount; ++tix) {
				callback(new TriangleProxy(basePtr, tix));
			}
		}

		item(triangleIndex: number) {
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
		var posAttr = vertexBuffer.attrByRole(VertexAttributeRole.Position);
		var normAttr = vertexBuffer.attrByRole(VertexAttributeRole.Normal);

		if (posAttr && normAttr) {
			var posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
			var normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
			var triView = new IndexBufferTriangleView(indexBuffer);

			calcVertexNormalsViews(posView, normView, triView);
		}
		// TODO: else warn?
	}


	export function calcVertexNormalsViews(posView: VertexBufferAttributeView, normView: VertexBufferAttributeView, triView: IndexBufferTriangleView) {
		var vertexCount = posView.count;
		var normalCount = normView.count;
		assert(vertexCount <= normalCount);
		var baseVertex = normView.baseVertex;

		normView.forEach((norm) => {
			vec3.set(norm, 0, 0, 1);
		});
		var usages = new Float32Array(vertexCount);

		var lineA = vec3.create(), lineB = vec3.create();
		var faceNormal = vec3.create(), temp = vec3.create();

		triView.forEach((face: TriangleProxy) => {
			var posA = posView.copyItem(face.a() - baseVertex);
			var posB = posView.copyItem(face.b() - baseVertex);
			var posC = posView.copyItem(face.c() - baseVertex);

			vec3.subtract(lineA, posB, posA);
			vec3.subtract(lineB, posC, posB);

			if (vec3.length(lineA) < 0.00001 || vec3.length(lineB) < 0.00001) {
				return;
			}

			vec3.cross(faceNormal, lineA, lineB);
			vec3.normalize(faceNormal, faceNormal);

			for (let fi = 0; fi < 3; ++fi) {
				let fvi = face.index(fi) - baseVertex;
				let norm = normView.refItem(fvi);

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
		var posAttr = vertexBuffer.attrByRole(VertexAttributeRole.Position);
		var normAttr = vertexBuffer.attrByRole(VertexAttributeRole.Normal);
		var uvAttr = vertexBuffer.attrByRole(uvSet);
		var tanAttr = vertexBuffer.attrByRole(VertexAttributeRole.Tangent);

		if (posAttr && normAttr && uvAttr && tanAttr) {
			var posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
			var normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
			var uvView = new VertexBufferAttributeView(vertexBuffer, uvAttr);
			var tanView = new VertexBufferAttributeView(vertexBuffer, tanAttr);
			var triView = new IndexBufferTriangleView(indexBuffer);

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

		var tanBuf = new Float32Array(vertexCount * 3 * 2);
		var tan1 = tanBuf.subarray(0, vertexCount);
		var tan2 = tanBuf.subarray(vertexCount);

		triView.forEach(face => {
			var a = face.a(),
				b = face.b(),
				c = face.c();

			var v1 = posView.copyItem(a),
				v2 = posView.copyItem(b),
				v3 = posView.copyItem(c);

			var w1 = uvView.copyItem(a),
				w2 = uvView.copyItem(b),
				w3 = uvView.copyItem(c);

			var x1 = v2[0] - v1[0];
			var x2 = v3[0] - v1[0];
			var y1 = v2[1] - v1[1];
			var y2 = v3[1] - v1[1];
			var z1 = v2[2] - v1[2];
			var z2 = v3[2] - v1[2];

			var s1 = w2[0] - w1[0];
			var s2 = w3[0] - w1[0];
			var t1 = w2[1] - w1[1];
			var t2 = w3[1] - w1[1];

			var rd = (s1 * t2 - s2 * t1);
			var r = rd == 0 ? 0.0 : 1.0 / rd;
			var sdir = [
				(t2 * x1 - t1 * x2) * r,
				(t2 * y1 - t1 * y2) * r,
				(t2 * z1 - t1 * z2) * r
			];
			var tdir = [
				(s1 * x2 - s2 * x1) * r,
				(s1 * y2 - s2 * y1) * r,
				(s1 * z2 - s2 * z1) * r
			];

			// tan1[a] += sdir;
			// tan1[b] += sdir;
			// tan1[c] += sdir;
			var tan1a = container.copyIndexedVec3(tan1, a);
			var tan1b = container.copyIndexedVec3(tan1, b);
			var tan1c = container.copyIndexedVec3(tan1, c);
			container.setIndexedVec3(tan1, a, vec3.add(tan1a, tan1a, sdir));
			container.setIndexedVec3(tan1, b, vec3.add(tan1b, tan1b, sdir));
			container.setIndexedVec3(tan1, c, vec3.add(tan1c, tan1c, sdir));

			// tan2[a] += tdir;
			// tan2[b] += tdir;
			// tan2[c] += tdir;
			var tan2a = container.copyIndexedVec3(tan2, a);
			var tan2b = container.copyIndexedVec3(tan2, b);
			var tan2c = container.copyIndexedVec3(tan2, c);
			container.setIndexedVec3(tan2, a, vec3.add(tan2a, tan2a, tdir));
			container.setIndexedVec3(tan2, b, vec3.add(tan2b, tan2b, tdir));
			container.setIndexedVec3(tan2, c, vec3.add(tan2c, tan2c, tdir));
		});

		for (var ix = 0; ix < vertexCount; ++ix) {
			var n = normView.copyItem(ix);
			var t = container.copyIndexedVec3(tan1, ix);
			var t2 = container.copyIndexedVec3(tan2, ix);

			// Gram-Schmidt orthogonalize, specify standard normal in case n or t = 0
			var tangent = vec3.normalize([0, 0, 1], vec3.sub([], t, vec3.scale([], n, vec3.dot(n, t))));

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
		fromPrimIx: number;
		primCount: number;
		materialIx: number; // mesh-local index (starting at 0); representation of Materials is external to MeshData
	}


	export class MeshData {
		vertexBuffers: Array<VertexBuffer> = [];
		indexBuffer: IndexBuffer | null; // FIXME: the implicit indexbuffer is wrong
		primitiveGroups: Array<PrimitiveGroup> = [];

		constructor(attrs?: VertexAttribute[]) {
			if (attrs) {
				this.vertexBuffers.push(new VertexBuffer(attrs));
			}
			this.indexBuffer = new IndexBuffer();
		}

		findFirstAttributeWithRole(role: VertexAttributeRole): { vertexBuffer: VertexBuffer; attr: PositionedAttribute; } | null {
			var pa: PositionedAttribute | null = null;
			var avb: VertexBuffer | null = null;

			this.vertexBuffers.forEach((vb) => {
				if (! pa) {
					pa = vb.attrByRole(role);
					if (pa) {
						avb = vb;
					}
				}
			});

			if (pa && avb)
				return { vertexBuffer: avb, attr: pa };
			else
				return null;
		}

		get primaryVertexBuffer() {
			assert(this.vertexBuffers.length > 0);
			return this.vertexBuffers[0];
		}

		// derived vertex data generation
		genVertexNormals() {
			this.vertexBuffers.forEach((vertexBuffer) => {
				if (this.indexBuffer) {
					calcVertexNormals(vertexBuffer, this.indexBuffer);
				}
			});
		}

		// void genVertexTangents();
	}

} // ns sd.mesh
