// mesh.ts - mesh data
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/gl-matrix.d.ts" />
/// <reference path="../defs/webgl-ext.d.ts" />

/// <reference path="core.ts" />
/// <reference path="game.ts" />

namespace sd.mesh {

	// __   __       _           _                       _   
	// \ \ / /__ _ _| |_ _____ _| |   __ _ _  _ ___ _  _| |_ 
	//  \ V / -_) '_|  _/ -_) \ / |__/ _` | || / _ \ || |  _|
	//   \_/\___|_|  \__\___/_\_\____\__,_|\_, \___/\_,_|\__|
	//                                     |__/              

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


	export function vertexFieldElementSizeBytes(vf: VertexField) {
		switch (vf) {
			case VertexField.Undefined:
				return 0;

			case VertexField.Float:
			case VertexField.Floatx2:
			case VertexField.Floatx3:
			case VertexField.Floatx4:
			case VertexField.UInt32:
			case VertexField.SInt32:
			case VertexField.UInt32x2:
			case VertexField.SInt32x2:
			case VertexField.UInt32x3:
			case VertexField.SInt32x3:
			case VertexField.UInt32x4:
			case VertexField.SInt32x4:
				return 4;

			case VertexField.UInt16x2:
			case VertexField.Norm_UInt16x2:
			case VertexField.SInt16x2:
			case VertexField.Norm_SInt16x2:
			case VertexField.UInt16x3:
			case VertexField.Norm_UInt16x3:
			case VertexField.SInt16x3:
			case VertexField.Norm_SInt16x3:
			case VertexField.UInt16x4:
			case VertexField.Norm_UInt16x4:
			case VertexField.SInt16x4:
			case VertexField.Norm_SInt16x4:
				return 2;

			case VertexField.UInt8x2:
			case VertexField.Norm_UInt8x2:
			case VertexField.SInt8x2:
			case VertexField.Norm_SInt8x2:
			case VertexField.UInt8x3:
			case VertexField.Norm_UInt8x3:
			case VertexField.SInt8x3:
			case VertexField.Norm_SInt8x3:
			case VertexField.UInt8x4:
			case VertexField.Norm_UInt8x4:
			case VertexField.SInt8x4:
			case VertexField.Norm_SInt8x4:
				return 1;
		}
	}


	export function vertexFieldSizeBytes(vf: VertexField) {
		return vertexFieldElementSizeBytes(vf) * vertexFieldElementCount(vf);
	}


	export function vertexFieldIsNormalized(vf: VertexField) {
		return (vf & 0x80) != 0;
	}


	export const enum VertexAttributeRole {
		Generic,
		Position,
		Normal,
		Tangent,
		Colour,
		UV,
		UVW,
		Index
	};

	// -- A VertexAttribute is a Field with a certain Role inside a VertexBuffer

	export class VertexAttribute {
		field: VertexField = VertexField.Undefined;
		role: VertexAttributeRole = VertexAttributeRole.Generic;
	}


	export function maxVertexAttributes() {
		// FIXME - this is the mandated minimum for GL 4.4
		// may want to up this to 32 and limit actual usage based on
		// runtime reported maximum (GL_MAX_VERTEX_ATTRIBS)
		return 16;
	}


	// -- VertexAttribute shortcuts for common types

	export function attrPosition3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Position }; }
	export function attrNormal3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Normal }; }
	export function attrColour3(): VertexAttribute { return { field: VertexField.Floatx3, role: VertexAttributeRole.Colour }; }
	export function attrUV2(): VertexAttribute { return { field: VertexField.Floatx2, role: VertexAttributeRole.UV }; }
	export function attrTangent4(): VertexAttribute { return { field: VertexField.Floatx4, role: VertexAttributeRole.Tangent }; }


	// -- Common AttributeList shortcuts

	namespace AttrList {
		export function Pos3Norm3(): VertexAttribute[] {
			return [ attrPosition3(), attrNormal3() ];
		}
		export function Pos3Norm3UV2(): VertexAttribute[] {
			return [ attrPosition3(), attrNormal3(), attrUV2() ];
		}
		export function Pos3Norm3UV2Tan4(): VertexAttribute[] {
			return [ attrPosition3(), attrNormal3(), attrUV2(), attrTangent4() ];
		}
	}


	export class PositionedAttribute extends VertexAttribute {
		offset: number;

		constructor(vf: VertexField, ar: VertexAttributeRole, offset: number);
		constructor(attr: VertexAttribute, offset: number);
		constructor(fieldOrAttr: VertexField | VertexAttribute, roleOrOffset: VertexAttribute | number, offset?: number) {
			super();

			if (fieldOrAttr instanceof VertexAttribute) {
				this.field = fieldOrAttr.field;
				this.role = fieldOrAttr.role;
				this.offset = <number>roleOrOffset;
			}
			else {
				this.field = <VertexField>fieldOrAttr;
				this.role = <VertexAttributeRole>roleOrOffset;
				this.offset = offset;
			}
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


	export class VertexLayout {
		private attributeCount_ = 0;
		private vertexSizeBytes_ = 0;
		private attrs_: PositionedAttribute[];

		constructor(attrList: VertexAttribute[]) {
			this.attributeCount_ = attrList.length;
			assert(this.attributeCount_ <= maxVertexAttributes());

			var offset = 0, maxElemSize = 0;

			// calculate positioning of successive attributes in linear item
			this.attrs_ = attrList.map((attr: VertexAttribute): PositionedAttribute => {
				var size = vertexFieldSizeBytes(attr.field);
				maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));

				var alignedOffset = alignVertexField(attr.field, offset);
				offset = alignedOffset + size;
				return new PositionedAttribute(attr, alignedOffset);
			});

			// align full item size on boundary of biggest element in attribute list, with min of float boundary
			maxElemSize = Math.max(Float32Array.BYTES_PER_ELEMENT, maxElemSize);
			this.vertexSizeBytes_ = alignFieldOnSize(maxElemSize, offset);
		}

		attributeCount() { return this.attributeCount_; }
		vertexSizeBytes() { return this.vertexSizeBytes_; }
	
		bytesRequiredForVertexCount(vertexCount: number): number {
			return vertexCount * this.vertexSizeBytes();
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


	// __   __       _           ___       __  __         
	// \ \ / /__ _ _| |_ _____ _| _ )_  _ / _|/ _|___ _ _ 
	//  \ V / -_) '_|  _/ -_) \ / _ \ || |  _|  _/ -_) '_|
	//   \_/\___|_|  \__\___/_\_\___/\_,_|_| |_| \___|_|  
	//	

	class VertexBuffer {
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

		layout() { return this.layout_; }
		strideBytes() { return this.layout_.vertexSizeBytes(); }
		attributeCount() { return this.layout_.attributeCount(); }
		itemCount() { return this.itemCount_; }
		bufferSizeBytes() { return this.strideBytes() * this.itemCount_; }

		allocate(itemCount: number) {
			this.itemCount_ = itemCount;
			this.storage_ = new ArrayBuffer(this.layout_.bytesRequiredForVertexCount(itemCount));
		}
	
		// -- raw data pointers

		buffer() { return this.storage_; }	

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

		// -- iteration over attribute data

		// TODO: implement (needs analog of STLBasicBufferIterator)
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
		Point,
		Line,
		LineStrip,
		Triangle,
		TriangleStrip
	}


	export function indexElementTypeSizeBytes(iet: IndexElementType): number {
		switch (iet) {
			case IndexElementType.UInt8: return Uint8Array.BYTES_PER_ELEMENT;
			case IndexElementType.UInt16: return Uint16Array.BYTES_PER_ELEMENT;
			case IndexElementType.UInt32: return Uint32Array.BYTES_PER_ELEMENT;
		}
	}


	export function minimumIndexElementTypeForVertexCount(vertexCount: number): IndexElementType {
		if (vertexCount <= sd.NumericLimits.UInt8.max)
			return IndexElementType.UInt8;
		if (vertexCount <= sd.NumericLimits.UInt16.max)
			return IndexElementType.UInt16;

		return IndexElementType.UInt32;
	}


	class IndexBuffer {
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

			switch (primitiveType) {
				case PrimitiveType.Point:
					this.indexCount_ = primitiveCount;
					break;
				case PrimitiveType.Line:
					this.indexCount_ = primitiveCount * 2;
					break;
				case PrimitiveType.LineStrip:
					this.indexCount_ = primitiveCount + 1;
					break;
				case PrimitiveType.Triangle:
					this.indexCount_ = primitiveCount * 3;
					break;
				case PrimitiveType.TriangleStrip:
					this.indexCount_ = primitiveCount + 2;
					break;
			}

			this.storage_ = new ArrayBuffer(this.bufferSizeBytes());
		}

		// -- observers
		primitiveType() { return this.primitiveType_; }
		indexElementType() { return this.indexElementType_; }

		primitiveCount() { return this.primitiveCount_; }
		indexCount() { return this.indexCount_; }
		indexElementSizeBytes() { return this.indexElementSizeBytes_; }

		bufferSizeBytes() { return this.indexCount() * this.indexElementSizeBytes(); }
		buffer() { return this.storage_; }

		// -- read/write indexes
		private typedBasePtr(baseIndexNr: number): Uint32Array | Uint16Array | Uint8Array {
			var offsetBytes = this.indexElementSizeBytes() * baseIndexNr;

			if (this.indexElementType() == IndexElementType.UInt32) {
				return new Uint32Array(this.storage_, offsetBytes);
			}
			else if (this.indexElementType() == IndexElementType.UInt16) {
				return new Uint16Array(this.storage_, offsetBytes);
			}
			else {
				return new Uint8Array(this.storage_, offsetBytes);
			}
		}

		indexes(baseIndexNr: number, outputCount: number, outputPtr: Uint32Array) {
			assert(baseIndexNr < this.indexCount());
			assert(baseIndexNr + outputCount < this.indexCount());
			assert(outputPtr.length >= outputCount);

			var typedBasePtr = this.typedBasePtr(baseIndexNr);

			for (let ix = 0; ix < outputCount; ++ix) {
				outputPtr[ix] = typedBasePtr[ix];
			}
		}

		index(indexNr: number): number {
			var typedBasePtr = this.typedBasePtr(indexNr);
			return typedBasePtr[0];
		}

		setIndexes(baseIndexNr: number, sourceCount: number, sourcePtr: Uint32Array) {
			assert(baseIndexNr < this.indexCount());
			assert(baseIndexNr + sourceCount < this.indexCount());
			assert(sourcePtr.length >= sourceCount);

			var typedBasePtr = this.typedBasePtr(baseIndexNr);

			for (let ix = 0; ix < sourceCount; ++ix) {
				typedBasePtr[ix] = sourcePtr[ix];
			}
		}

		setIndex(indexNr: number, newValue: number) {
			var typedBasePtr = this.typedBasePtr(indexNr);
			typedBasePtr[0] = newValue;
		}
	}


	//  __  __        _    ___                       _           
	// |  \/  |___ __| |_ / __|___ _ _  ___ _ _ __ _| |_ ___ _ _ 
	// | |\/| / -_|_-< ' \ (_ / -_) ' \/ -_) '_/ _` |  _/ _ \ '_|
	// |_|  |_\___/__/_||_\___\___|_||_\___|_| \__,_|\__\___/_|  
	//                                                          

	export type PositionAddFn = (x: number, y: number, z: number) => void;
	export type FaceAddFn = (a: number, b: number, c: number) => void;
	export type UVAddFn = (u: number, v: number) => void;

	export abstract class MeshGenerator {
		abstract vertexCount(): number;
		abstract faceCount(): number;

		abstract generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;

		// generate(): TriMesh {
		// 	var vtxCount = this.vertexCount();

		// 	var vertexBuf = new Float32Array(vtxCount * 3);
		// 	var normalBuf = new Float32Array(vtxCount * 3);
		// 	var uvBuf = new Float32Array(vtxCount * 2);

		// 	var faceBuf = new Uint32Array(vtxCount * 3);

		// 	this.generateInto(vertexBuf, faceBuf, uvBuf);
		// }

		generateInto(positions: ArrayOfNumber, faces: ArrayOfNumber, uvs: ArrayOfNumber = null): void {
			var posIx = 0, faceIx = 0, uvIx = 0;

			var pos: PositionAddFn = (x: number, y: number, z: number) => {
				positions[posIx] = x;
				positions[posIx + 1] = y;
				positions[posIx + 2] = z;
				posIx += 3;
			};

			var face: FaceAddFn = (a: number, b: number, c: number) => {
				faces[faceIx] = a;
				faces[faceIx + 1] = b;
				faces[faceIx + 2] = c;
				faceIx += 3;
			};

			var uv: UVAddFn = uvs ?
				(u: number, v: number) => {
					uvs[uvIx] = u;
					uvs[uvIx + 1] = v;
					uvIx += 2;
				}
				: (u: number, v: number) => { };

			this.generateImpl(pos, face, uv);
		}
	}


	export class Sphere extends MeshGenerator {
		hasTopDisc() { return this.sliceFrom_ == 0; }
		hasBottomDisc() { return this.sliceTo_ == 1; }

		constructor(private radius_ = 1.0, private rows_ = 20, private segs_ = 30, private sliceFrom_ = 0.0, private sliceTo_ = 1.0) {
			super();

			assert(this.rows_ >= 2);
			assert(this.segs_ >= 4);
			assert(this.sliceTo_ > this.sliceFrom_);
		}

		vertexCount(): number {
			var vc = this.segs_ * (this.rows_ - 1);
			if (this.hasTopDisc())
				++vc;
			if (this.hasBottomDisc())
				++vc;
			return vc;
		}

		faceCount(): number {
			var fc = 2 * this.segs_ * this.rows_;
			if (this.hasTopDisc())
				fc -= this.segs_;
			if (this.hasBottomDisc())
				fc -= this.segs_;
			return fc;
		}

		generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn) {
			var Pi = Math.PI;
			var Tau = Math.PI * 2;

			var slice = this.sliceTo_ - this.sliceFrom_;
			var piFrom = this.sliceFrom_ * Pi;
			var piSlice = slice * Pi;
			var halfPiSlice = slice / 2;

			var vix = 0;

			for (var row = 0; row <= this.rows_; ++row) {
				var y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var texV = Math.sin(piFrom + (halfPiSlice / this.rows_) * row);

				if (
					(this.hasTopDisc() && row == 0) ||
					(this.hasBottomDisc() && row == this.rows_)
				) {
					// center top or bottom
					position(0, y, 0);
					uv(0.5, texV);
					++vix;
				}
				else {
					for (var seg = 0; seg < this.segs_; ++seg) {
						var x = Math.sin((Tau / this.segs_) * seg) * segRad;
						var z = Math.cos((Tau / this.segs_) * seg) * segRad;
						var texU = Math.sin(((Pi / 2) / this.rows_) * row);

						position(x, y, z);
						uv(texU, texV);
						++vix;
					}
				}
				
				// construct row of faces
				if (row > 0) {
					var raix = vix;
					var rbix = vix;
					var ramul: number, rbmul: number;

					if (this.hasTopDisc() && row == 1) {
						raix -= this.segs_ + 1;
						rbix -= this.segs_;
						ramul = 0;
						rbmul = 1;
					}
					else if (this.hasBottomDisc() && row == this.rows_) {
						raix -= this.segs_ + 1;
						rbix -= 1;
						ramul = 1;
						rbmul = 0;
					}
					else {
						raix -= this.segs_ * 2;
						rbix -= this.segs_;
						ramul = 1;
						rbmul = 1;
					}

					for (var seg = 0; seg < this.segs_; ++seg) {
						var ral = ramul * seg,
							rar = ramul * ((seg + 1) % this.segs_),
							rbl = rbmul * seg,
							rbr = rbmul * ((seg + 1) % this.segs_);

						if (ral != rar)
							face(raix + ral, rbix + rbl, raix + rar);
						if (rbl != rbr)
							face(raix + rar, rbix + rbl, rbix + rbr);
					}
				}
			}
		}
	}

} // ns sd.mesh
