// mesh/types - base types and helpers for mesh data
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { NumericType, Float, SInt8, SInt16, SInt32, UInt8, UInt16, UInt32 } from "core/numeric";

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


// __   __       _              _  _   _       _ _         _       ___     _     
// \ \ / /__ _ _| |_ _____ __  /_\| |_| |_ _ _(_) |__ _  _| |_ ___| _ \___| |___ 
//  \ V / -_) '_|  _/ -_) \ / / _ \  _|  _| '_| | '_ \ || |  _/ -_)   / _ \ / -_)
//   \_/\___|_|  \__\___/_\_\/_/ \_\__|\__|_| |_|_.__/\_,_|\__\___|_|_\___/_\___|
//                                                                               

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


//  ___     _       _ _   _        _____               
// | _ \_ _(_)_ __ (_) |_(_)_ ____|_   _|  _ _ __  ___ 
// |  _/ '_| | '  \| |  _| \ V / -_)| || || | '_ \/ -_)
// |_| |_| |_|_|_|_|_|\__|_|\_/\___||_| \_, | .__/\___|
//                                      |__/|_|        

export const enum PrimitiveType {
	None,

	Point,
	Line,
	LineStrip,
	Triangle,
	TriangleStrip
}


//  ___     _       _ _   _          ___                   
// | _ \_ _(_)_ __ (_) |_(_)_ _____ / __|_ _ ___ _  _ _ __ 
// |  _/ '_| | '  \| |  _| \ V / -_) (_ | '_/ _ \ || | '_ \
// |_| |_| |_|_|_|_|_|\__|_|\_/\___|\___|_| \___/\_,_| .__/
//                                                   |_|   

export interface PrimitiveGroup {
	type: PrimitiveType;
	fromElement: number;
	elementCount: number;
	materialIx: number;
}


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
