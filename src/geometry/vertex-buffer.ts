/*
geometry/vertex-buffer - geometry vertex buffer data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { PositionedStructField, StructField, ArrayOfStructs } from "stardazed/container";

/**
 * The role of a vertex attribute indicates usage purpose
 * and is used for shader attribute mapping.
 */
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

	// skinned geometry
	WeightedPos0, WeightedPos1, WeightedPos2, WeightedPos3,
	JointIndexes
}

interface VertexFieldProps {
	/** The role of this attribute inside the buffer */
	role: VertexAttributeRole;
	/** Only for integer fields, is the value treated as a normalised fraction? */
	normalized?: boolean;
}

/**
 * A VertexAttribute is a field inside a VertexBuffer
 */
export type VertexAttribute = StructField<VertexFieldProps>;

/**
 * A PositionedAttribute is a field inside a VertexBuffer with byte-level layout information
 */
export type PositionedAttribute = PositionedStructField<VertexFieldProps>;

/**
 * Properties used to create a VertexBuffer
 */
export interface VertexBufferDescriptor {
	/** The vertex fields to be included in the buffer */
	attrs: VertexAttribute[];
	/** The number of values of each attribute required (usually the vertex count) */
	valueCount: number;
	/** (optional) The instancing divisor that will apply to ALL attributes in this buffer */
	divisor?: number;
}

/**
 * A VertexBuffer is the client-side representation of vertex data and meta-data.
 */
export class VertexBuffer extends ArrayOfStructs<VertexFieldProps> {
	readonly divisor: number;

	/**
	 * Create a new VertexBuffer using a descriptor into new or provided storage
	 * @param storage (optional) Manually provide a place to store the vertex data, usually for compound buffers
	 */
	constructor(desc: VertexBufferDescriptor, storage?: Uint8Array) {
		// TODO: verify that each field can be represented in a vertexbuffer

		super(desc.attrs, desc.valueCount, storage);
		this.divisor = desc.divisor ?? 0;
	}

	fieldByRole(role: VertexAttributeRole) {
		for (const field of this.fields) {
			if (field.role === role) {
				return field;
			}
		}
		return undefined;
	}
}
