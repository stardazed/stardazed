// meshdata/layout - vertex fields and layout
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.meshdata {

	// __   __       _           ___ _     _    _
	// \ \ / /__ _ _| |_ _____ _| __(_)___| |__| |
	//  \ V / -_) '_|  _/ -_) \ / _|| / -_) / _` |
	//   \_/\___|_|  \__\___/_\_\_| |_\___|_\__,_|
	//

	// A single field in a vertex buffer
	// 3 properties: element type, count and normalization

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
		const nt = vertexFieldNumericType(vf);
		return nt ? nt.byteSize : 0;
	}


	export function vertexFieldSizeBytes(vf: VertexField) {
		return vertexFieldElementSizeBytes(vf) * vertexFieldElementCount(vf);
	}


	export function vertexFieldIsNormalized(vf: VertexField) {
		return (vf & 0x80) != 0;
	}


	// __   __       _              _  _   _       _ _         _
	// \ \ / /__ _ _| |_ _____ __  /_\| |_| |_ _ _(_) |__ _  _| |_ ___
	//  \ V / -_) '_|  _/ -_) \ / / _ \  _|  _| '_| | '_ \ || |  _/ -_)
	//   \_/\___|_|  \__\___/_\_\/_/ \_\__|\__|_| |_|_.__/\_,_|\__\___|
	//

	export const enum VertexAttributeRole {
		None,

		// standard attributes
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
		readonly field: VertexField;
		readonly role: VertexAttributeRole;
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
	}


	// __   __       _           _                       _
	// \ \ / /__ _ _| |_ _____ _| |   __ _ _  _ ___ _  _| |_
	//  \ V / -_) '_|  _/ -_) \ / |__/ _` | || / _ \ || |  _|
	//   \_/\___|_|  \__\___/_\_\____\__,_|\_, \___/\_,_|\__|
	//                                     |__/

	export interface PositionedAttribute extends VertexAttribute {
		readonly offset: number;
	}


	function makePositionedAttr(vf: VertexField, ar: VertexAttributeRole, offset: number): PositionedAttribute;
	function makePositionedAttr(attr: VertexAttribute, offset: number): PositionedAttribute;
	function makePositionedAttr(fieldOrAttr: VertexField | VertexAttribute, roleOrOffset: VertexAttributeRole | number, offset?: number): PositionedAttribute {
		if (typeof fieldOrAttr === "number") {
			return {
				field: fieldOrAttr,
				role: roleOrOffset,
				offset: offset! | 0
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
		const mask = math.roundUpPowerOf2(size) - 1;
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

			let offset = 0, maxElemSize = 0;

			// calculate positioning of successive attributes in linear item
			this.attrs_ = attrList.map((attr: VertexAttribute): PositionedAttribute => {
				const size = vertexFieldSizeBytes(attr.field);
				maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));

				const alignedOffset = alignVertexField(attr.field, offset);
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
			const attr = this.attrs_.find(pa => pa.role == role);
			return attr || null;
		}

		attrByIndex(index: number): PositionedAttribute | null {
			return this.attrs_[index] || null;
		}

		hasAttributeWithRole(role: VertexAttributeRole): boolean {
			return this.attrByRole(role) != null;
		}
	}

} // ns sd.meshdata
