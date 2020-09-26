/*
geometry/vertex-buffer - geometry vertex buffer data
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { PositionedStructField, StructField, ArrayOfStructs, StructOfArrays } from "stardazed/container";

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
	JointIndexes,

	// special attributes for e.g. instancing
	Transform
}

export const enum StepMode {
	Vertex,
	Instance
}

interface VertexFieldProps {
	/** The role of this attribute inside the buffer */
	role: VertexAttributeRole;
	/** Only for integer fields, is the value treated as a normalised fraction? */
	normalised?: boolean;
}

/**
 * A VertexAttribute is a field inside a VertexBuffer
 */
export type VertexAttribute = StructField<VertexFieldProps>;

/**
 * A PositionedAttribute is a field inside a VertexBuffer with byte-level layout information
 */
export type PositionedAttribute = PositionedStructField<VertexFieldProps>;

export type VertexBufferTopology = "linear" | "interleaved";

/**
 * Properties used to create a VertexBuffer
 */
export interface VertexBufferDescriptor {
	/** The vertex fields to be included in the buffer */
	attrs: VertexAttribute[];
	/** The number of values of each attribute required (usually the vertex count) */
	valueCount: number;
	/** The storage topology of vertex data */
	topology: VertexBufferTopology;
	/** (optional) The vertex step mode that will apply to ALL attributes in this buffer */
	stepMode?: StepMode;
}

/**
 * A VertexBuffer is the client-side representation of vertex data and meta-data.
 */
export class VertexBuffer {
	readonly stepMode: StepMode;
	readonly topology: VertexBufferTopology;
	readonly backing: ArrayOfStructs<VertexFieldProps> | StructOfArrays<VertexFieldProps>;

	/**
	 * Create a new VertexBuffer using a descriptor into new or provided storage
	 * @param storage (optional) Manually provide a place to store the vertex data, usually for compound buffers
	 */
	constructor(desc: VertexBufferDescriptor, storage?: Uint8Array) {
		// TODO: verify that each field can be represented in a vertexbuffer

		this.topology = desc.topology;
		if (this.topology === "interleaved") {
			this.backing = new ArrayOfStructs(desc.attrs, desc.valueCount, storage);
		}
		else {
			this.backing = new StructOfArrays(desc.attrs, desc.valueCount, storage);
		}
		this.stepMode = desc.stepMode ?? StepMode.Vertex;
	}

	get fields() { return this.backing.fields; }
	get length() { return this.backing.length; }
	get stride() { return this.backing instanceof ArrayOfStructs ? this.backing.stride : 0; }
	get data() { return this.backing.data; }
	get byteLength() { return this.backing.byteLength; }

	fieldByRole(role: VertexAttributeRole) {
		for (const field of this.backing.fields) {
			if (field.role === role) {
				return field;
			}
		}
		return undefined;
	}

	fieldView(field: number | PositionedStructField<VertexFieldProps>, fromIndex?: number, toIndex?: number) {
		return this.backing.fieldView(field, fromIndex, toIndex);
	}

	static sizeBytesRequired(fields: VertexAttribute[], count: number, topology: VertexBufferTopology) {
		if (topology === "interleaved") {
			return ArrayOfStructs.sizeBytesRequired(fields, count);
		}
		return StructOfArrays.sizeBytesRequired(fields, count);
	}
}
