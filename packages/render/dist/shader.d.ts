/**
 * render/shader - Shaders and modules
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { VertexAttributeRole } from "@stardazed/geometry";
import { RenderResourceBase } from "./resource";
import { TextureClass } from "./texture";
export declare const enum ShaderValueType {
    Int = 0,
    Int2 = 1,
    Int3 = 2,
    Int4 = 3,
    Half = 4,
    Half2 = 5,
    Half3 = 6,
    Half4 = 7,
    Float = 8,
    Float2 = 9,
    Float3 = 10,
    Float4 = 11,
    Float2x2 = 12,
    Float3x3 = 13,
    Float4x4 = 14
}
export declare type Conditional<T extends object> = T & {
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
