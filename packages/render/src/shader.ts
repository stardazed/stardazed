/**
 * render/shader - Shaders and modules
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { VertexAttributeRole } from "@stardazed/geometry";
import { RenderResourceBase } from "./resource";
import { TextureClass } from "./texture";

export const enum ShaderValueType {
	Int,
	Int2,
	Int3,
	Int4,
	Half,
	Half2,
	Half3,
	Half4,
	Float,
	Float2,
	Float3,
	Float4,
	Float2x2,
	Float3x3,
	Float4x4
}

export type Conditional<T extends object> = T & {
	ifExpr?: string;
};

export interface SamplerSlot {
	name: string;
	type: TextureClass;
	index: number;
}

export interface ShaderAttribute {
	name: string;
	type: ShaderValueType;
}

export interface ShaderVertexAttribute extends ShaderAttribute {
	role: VertexAttributeRole;
	index: number;
}

export interface ShaderConstant {
	name: string;
	type: ShaderValueType;
	length?: number;
}

export interface ShaderDefine {
	name: string;
	value?: number | boolean;
}

export interface ExtensionUsage {
	name: string;
	action: "enable" | "require";
}

export interface ShaderConstValue {
	name: string;
	type: ShaderValueType;
	expr: string;
}

export interface ShaderStruct {
	name: string;
	code: string;
}

export interface ShaderModule {
	extensions?: Conditional<ExtensionUsage>[];
	samplers?: Conditional<SamplerSlot>[];
	constants?: Conditional<ShaderConstant>[];
	constValues?: ShaderConstValue[];
	structs?: ShaderStruct[];
	code?: string;
}

export interface ShaderFunction extends ShaderModule {
	modules?: string[];
	main: string;
}

export interface VertexFunction extends ShaderFunction {
	in: Conditional<ShaderVertexAttribute>[];
	out?: Conditional<ShaderAttribute>[];
}

export interface FragmentFunction extends ShaderFunction {
	in?: Conditional<ShaderAttribute>[];
	outCount: number;
}

export interface Shader extends RenderResourceBase {
	defines: ShaderDefine[];
	vertexFunction: VertexFunction;
	fragmentFunction: FragmentFunction;
}
