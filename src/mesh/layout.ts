// meshdata/layout - vertex buffer layout
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.meshdata {

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
		field: VertexField;
		role: VertexAttributeRole;
	}

	export function isVertexAttribute(va: object): va is VertexAttribute {
		return typeof (va as any).field === "number" && typeof (va as any).role === "number";
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


	// __   __       _           ___       __  __         _                       _   
	// \ \ / /__ _ _| |_ _____ _| _ )_  _ / _|/ _|___ _ _| |   __ _ _  _ ___ _  _| |_ 
	//  \ V / -_) '_|  _/ -_) \ / _ \ || |  _|  _/ -_) '_| |__/ _` | || / _ \ || |  _|
	//   \_/\___|_|  \__\___/_\_\___/\_,_|_| |_| \___|_| |____\__,_|\_, \___/\_,_|\__|
	//                                                              |__/              

	export interface PositionedAttribute extends VertexAttribute {
		bufferIndex: number;
		offset: number;
	}

	export interface VertexBufferLayout {
		// TODO: add instancing parameters
		readonly attributes: Readonly<PositionedAttribute>[];
		readonly stride: number;

		bytesRequiredForVertexCount(vertexCount: number): number;
		attrByRole(role: VertexAttributeRole): PositionedAttribute | undefined;
		attrByIndex(index: number): PositionedAttribute | undefined;
		hasAttributeWithRole(role: VertexAttributeRole): boolean;
	}

	class VertexBufferLayoutImpl implements VertexBufferLayout {
		readonly attributes: Readonly<PositionedAttribute>[];
		readonly stride: number;

		constructor(attributes: PositionedAttribute[], stride: number) {
			assert(attributes.length > 0, "Cannot create an empty VertexBufferLayout");
			assert(stride > 0, "stride must be positive");

			this.attributes = [...attributes];
			this.stride = stride;
		}

		bytesRequiredForVertexCount(vertexCount: number) {
			return vertexCount * this.stride;
		}

		attrByRole(role: VertexAttributeRole) {
			return this.attributes.find(pa => pa.role === role);
		}

		attrByIndex(index: number) {
			return this.attributes[index] || null;
		}

		hasAttributeWithRole(role: VertexAttributeRole) {
			return this.attrByRole(role) !== undefined;
		}
	}


	// ---- default buffer layout calc func

	function alignFieldOnSize(size: number, offset: number) {
		const mask = math.roundUpPowerOf2(size) - 1;
		return (offset + mask) & ~mask;
	}

	function alignVertexField(field: VertexField, offset: number) {
		return alignFieldOnSize(vertexFieldElementSizeBytes(field), offset);
	}

	export function makeStandardVertexBufferLayout(attrList: VertexAttribute[], bufferIndex = 0): VertexBufferLayout {
		let offset = 0, maxElemSize = 0;

		// calculate positioning of successive attributes in linear item
		const attributes = attrList.map((attr: VertexAttribute): PositionedAttribute => {
			const size = vertexFieldSizeBytes(attr.field);
			maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));

			const alignedOffset = alignVertexField(attr.field, offset);
			offset = alignedOffset + size;
			return {
				field: attr.field,
				role: attr.role,
				bufferIndex,
				offset: alignedOffset
			};
		});

		// align full item size on boundary of biggest element in attribute list, with min of float boundary
		maxElemSize = Math.max(Float32Array.BYTES_PER_ELEMENT, maxElemSize);
		const stride = alignFieldOnSize(maxElemSize, offset);

		return new VertexBufferLayoutImpl(attributes, stride);
	}


	// __   __       _           _                       _   
	// \ \ / /__ _ _| |_ _____ _| |   __ _ _  _ ___ _  _| |_ 
	//  \ V / -_) '_|  _/ -_) \ / |__/ _` | || / _ \ || |  _|
	//   \_/\___|_|  \__\___/_\_\____\__,_|\_, \___/\_,_|\__|
	//                                     |__/              

	export interface VertexLayout extends render.RenderResourceBase {
		readonly layouts: ReadonlyArray<VertexBufferLayout>;
	}

	export function findAttributeOfRoleInLayout(vl: VertexLayout, role: VertexAttributeRole) {
		for (const layout of vl.layouts) {
			const pa = layout.attrByRole(role);
			if (pa) {
				return pa;
			}
		}
		return undefined;
	}

	export function makeStandardVertexLayout(attrLists: VertexAttribute[] | VertexAttribute[][]): VertexLayout {
		const layouts: VertexBufferLayout[] = [];
		
		if (attrLists.length > 0) {
			if (isVertexAttribute(attrLists[0])) {
				layouts.push(makeStandardVertexBufferLayout(attrLists as VertexAttribute[]));
			}
			else {
				for (let bufferIndex = 0; bufferIndex < attrLists.length; ++bufferIndex) {
					const list = attrLists[bufferIndex] as VertexAttribute[];
					layouts.push(makeStandardVertexBufferLayout(list, bufferIndex));
				}
			}
		}

		return {
			renderResourceType: render.ResourceType.VertexLayout,
			renderResourceHandle: 0,
			layouts
		};
	}

} // ns sd.meshdata
