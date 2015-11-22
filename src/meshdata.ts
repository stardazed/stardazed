// meshdata.ts - mesh data
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

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
			case VertexField.Undefined:
				return 0;

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
		}
	}


	export function vertexFieldNumericType(vf: VertexField): NumericType {
		switch (vf) {
			case VertexField.Undefined:
				return null;

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
		Position,
		Normal,
		Tangent,
		Colour,
		UV,
		UVW
		/*
		Custom1, etc.?
		*/
	}

	// -- A VertexAttribute is a Field with a certain Role inside a VertexBuffer

	export interface VertexAttribute {
		field: VertexField;
		role: VertexAttributeRole;
	}


	// -- VertexAttribute shortcuts for common types

	export function attrPosition3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Position }; }
	export function attrNormal3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Normal }; }
	export function attrColour3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Colour }; }
	export function attrUV2(): VertexAttribute { return { field: VertexField.Floatx2, role: VertexAttributeRole.UV }; }
	export function attrTangent4(): VertexAttribute { return { field: VertexField.Floatx4, role: VertexAttributeRole.Tangent }; }


	// -- Common AttributeList shortcuts

	export namespace AttrList {
		export function Pos3Norm3(): VertexAttribute[] {
			return [ attrPosition3(), attrNormal3() ];
		}
		export function Pos3Norm3Colour3() {
			return [attrPosition3(), attrNormal3(), attrColour3()];	
		}
		export function Pos3Norm3UV2(): VertexAttribute[] {
			return [ attrPosition3(), attrNormal3(), attrUV2() ];
		}
		export function Pos3Norm3Colour3UV2() {
			return [attrPosition3(), attrNormal3(), attrColour3(), attrUV2()];
		}
		export function Pos3Norm3UV2Tan4(): VertexAttribute[] {
			return [ attrPosition3(), attrNormal3(), attrUV2(), attrTangent4() ];
		}
	}


	export interface PositionedAttribute extends VertexAttribute {
		offset: number;
	}


	export function makePositionedAttr(vf: VertexField, ar: VertexAttributeRole, offset: number): PositionedAttribute;
	export function makePositionedAttr(attr: VertexAttribute, offset: number): PositionedAttribute;
	export function makePositionedAttr(fieldOrAttr: VertexField | VertexAttribute, roleOrOffset: VertexAttribute | number, offset?: number): PositionedAttribute {
		if ("field" in <any>fieldOrAttr) {
			var attr = <VertexAttribute>fieldOrAttr;
			return {
				field: attr.field,
				role: attr.role,
				offset: <number>roleOrOffset
			};
		}
		else {
			return {
				field: <VertexField>fieldOrAttr,
				role: <VertexAttributeRole>roleOrOffset,
				offset: offset
			};
		}
	}



	function alignFieldOnSize(size: number, offset: number) {
		// FIXME: this will fail if size is not a power of 2
		// extend to nearest power of 2, then - 1
		var mask = size - 1;
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
	
		attrByRole(role: VertexAttributeRole): PositionedAttribute {
			return this.attrs_.find((pa) => pa.role == role);
		}

		attrByIndex(index: number): PositionedAttribute {
			return this.attrs_[index];
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
		bufferSizeBytes: number;
		buffer: ArrayBuffer;
	}


	// __   __       _           ___       __  __         
	// \ \ / /__ _ _| |_ _____ _| _ )_  _ / _|/ _|___ _ _ 
	//  \ V / -_) '_|  _/ -_) \ / _ \ || |  _|  _/ -_) '_|
	//   \_/\___|_|  \__\___/_\_\___/\_,_|_| |_| \___|_|  
	//	

	export class VertexBuffer implements ClientBuffer {
		private layout_: VertexLayout;
		private itemCount_ = 0;
		private storage_: ArrayBuffer = null;

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
		private typedViewCtor_: TypedArrayConstructor;
		private buffer_: ArrayBuffer;
		private viewItemCount_: number;

		constructor(private vertexBuffer_: VertexBuffer, private attr_: PositionedAttribute, private firstItem_ = 0, itemCount = -1) {
			this.stride_ = this.vertexBuffer_.layout.vertexSizeBytes;
			this.attrOffset_ = attr_.offset;
			this.attrElementCount_ = vertexFieldElementCount(attr_.field);
			this.typedViewCtor_ = vertexFieldNumericType(attr_.field).arrayType;
			this.buffer_ = this.vertexBuffer_.buffer;
			this.viewItemCount_ = itemCount < 0 ? (this.vertexBuffer_.itemCount - this.firstItem_) : itemCount;

			assert(this.firstItem_ + this.viewItemCount_ <= this.vertexBuffer_.itemCount, "view item range is bigger than buffer");
		}

		forEach(callback: (item: TypedArray) => void) {
			var max = this.count;
			for (let ix = 0; ix < max; ++ix) {
				callback(this.item(ix));
			}
		}

		item(index: number): TypedArray {
			index += this.firstItem_;
			var offsetBytes = (this.stride_ * index) + this.attrOffset_;
			return new (this.typedViewCtor_)(this.buffer_, offsetBytes, this.attrElementCount_);
		}

		get count() {
			return this.viewItemCount_;
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
			case IndexElementType.UInt8: return Uint8Array.BYTES_PER_ELEMENT;
			case IndexElementType.UInt16: return Uint16Array.BYTES_PER_ELEMENT;
			case IndexElementType.UInt32: return Uint32Array.BYTES_PER_ELEMENT;
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
				break;
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
				break;
		}
	}


	export class IndexBuffer implements ClientBuffer {
		private primitiveType_ = PrimitiveType.Point;
		private indexElementType_ = IndexElementType.UInt8;
		private indexCount_ = 0;
		private primitiveCount_ = 0;
		private indexElementSizeBytes_ = 0;
		private storage_: ArrayBuffer = null;

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
			var offsetBytes = this.indexElementSizeBytes_ * baseIndexNr;

			if (this.indexElementType_ == IndexElementType.UInt32) {
				return new Uint32Array(this.storage_, offsetBytes, elementCount);
			}
			else if (this.indexElementType_ == IndexElementType.UInt16) {
				return new Uint16Array(this.storage_, offsetBytes, elementCount);
			}
			else {
				return new Uint8Array(this.storage_, offsetBytes, elementCount);
			}
		}

		indexes(baseIndexNr: number, outputCount: number, outputPtr: Uint32Array) {
			assert(baseIndexNr < this.indexCount_);
			assert(baseIndexNr + outputCount < this.indexCount_);
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

		setIndexes(baseIndexNr: number, sourceCount: number, sourcePtr: Uint32Array) {
			assert(baseIndexNr < this.indexCount_);
			assert(baseIndexNr + sourceCount < this.indexCount_);
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

	export function calcVertexNormals(vertexBuffer: VertexBuffer, indexBuffer: IndexBuffer) {
		var posAttr = vertexBuffer.attrByRole(VertexAttributeRole.Position);
		var normAttr = vertexBuffer.attrByRole(VertexAttributeRole.Normal);

		assert(posAttr && normAttr);

		var posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
		var normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
		var triView = new IndexBufferTriangleView(indexBuffer);

		calcVertexNormalsViews(posView, normView, triView);
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
			var posA = posView.item(face.a() - baseVertex);
			var posB = posView.item(face.b() - baseVertex);
			var posC = posView.item(face.c() - baseVertex);

			vec3.subtract(lineA, posB, posA);
			vec3.subtract(lineB, posC, posB);

			if (vec3.length(lineA) < 0.00001 || vec3.length(lineB) < 0.00001) {
				return;
			}

			vec3.cross(faceNormal, lineA, lineB);
			vec3.normalize(faceNormal, faceNormal);

			for (let fi = 0; fi < 3; ++fi) {
				let fvi = face.index(fi) - baseVertex;
				let norm = normView.item(fvi);

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
		indexBuffer: IndexBuffer;
		primitiveGroups: Array<PrimitiveGroup> = [];

		constructor(attrs?: VertexAttribute[]) {
			if (attrs) {
				this.vertexBuffers.push(new VertexBuffer(attrs));
			}
			this.indexBuffer = new IndexBuffer();
		}

		findFirstAttributeWithRole(role: VertexAttributeRole): { vertexBuffer: VertexBuffer; attr: PositionedAttribute; } {
			var pa: PositionedAttribute = null;
			var avb: VertexBuffer = null;

			this.vertexBuffers.forEach((vb) => {
				if (! pa) {
					pa = vb.attrByRole(role);
					if (pa)
						avb = vb;
				}
			});

			if (pa)
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
				var posAttr = vertexBuffer.attrByRole(VertexAttributeRole.Position),
					normAttr = vertexBuffer.attrByRole(VertexAttributeRole.Normal);

				if (posAttr && normAttr) {
					calcVertexNormals(vertexBuffer, this.indexBuffer);
				}
			});
		}

		// void genVertexTangents();
	}

} // ns sd.mesh
