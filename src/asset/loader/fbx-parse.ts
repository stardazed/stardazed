// asset/loader/fbx-parse - shared parser types and functions
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert } from "core/util";
import { TypedArray } from "core/array";

export type FBXValue = number | string | ArrayBuffer | TypedArray;

export const enum FBXBlockAction {
	Enter,
	Skip
}

export const enum FBXPropertyType {
	Unknown,

	Int,
	Double,
	Bool,
	Time,
	String,
	Vector3D,
	Vector4D,
	Object,
	Empty
}

const fbxTypeNameMapping: { [type: string]: FBXPropertyType } = {
	"enum": FBXPropertyType.Int,
	"int": FBXPropertyType.Int,
	"integer": FBXPropertyType.Int,

	"float": FBXPropertyType.Double,
	"double": FBXPropertyType.Double,
	"number": FBXPropertyType.Double,
	"ulonglong": FBXPropertyType.Double,
	"fieldofview": FBXPropertyType.Double,
	"fieldofviewx": FBXPropertyType.Double,
	"fieldofviewy": FBXPropertyType.Double,
	"roll": FBXPropertyType.Double,
	"opticalcenterx": FBXPropertyType.Double,
	"opticalcentery": FBXPropertyType.Double,

	"bool": FBXPropertyType.Bool,
	"visibility": FBXPropertyType.Bool,
	"visibility inheritance": FBXPropertyType.Bool,

	"ktime": FBXPropertyType.Time,

	"kstring": FBXPropertyType.String,
	"datetime": FBXPropertyType.String,

	"vector3d": FBXPropertyType.Vector3D,
	"vector": FBXPropertyType.Vector3D,
	"color": FBXPropertyType.Vector3D,
	"colorrgb": FBXPropertyType.Vector3D,
	"lcl translation": FBXPropertyType.Vector3D,
	"lcl rotation": FBXPropertyType.Vector3D,
	"lcl scaling": FBXPropertyType.Vector3D,

	"colorandalpha": FBXPropertyType.Vector4D,

	"object": FBXPropertyType.Object,
	"compound": FBXPropertyType.Empty,
	"referenceproperty": FBXPropertyType.Empty
};

export interface FBXProp70Prop {
	name: string;
	typeName: string;
	type: FBXPropertyType;
	values: FBXValue[];
}

export function interpretProp70P(pValues: FBXValue[]) {
	assert(pValues.length >= 4, "A P must have 4 or more values.");
	const typeName = <string>pValues[1];

	const result: FBXProp70Prop = {
		name: <string>pValues[0],
		typeName: typeName,
		type: fbxTypeNameMapping[typeName.toLowerCase()] || FBXPropertyType.Unknown,
		values: pValues.slice(4)
	};

	if (result.type == FBXPropertyType.Unknown) {
		console.warn(`Unknown typed prop typename: ${typeName}`);
	}
	return result;
}

export interface FBXParserDelegate {
	block(name: string, values: FBXValue[]): FBXBlockAction;
	endBlock(): void;

	property(name: string, values: FBXValue[]): void;
	typedProperty(name: string, type: FBXPropertyType, typeName: string, values: FBXValue[]): void;

	error(msg: string, offset: number, token?: string): void;
	completed(): void;
}

export interface FBXParser {
	delegate: FBXParserDelegate;
	parse(): void;
}
