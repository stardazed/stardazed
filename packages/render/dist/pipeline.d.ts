/**
 * render/pipeline - shader variant and configuration
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Float4 } from "@stardazed/core";
import { Shader } from "./shader";
export declare const enum FaceCulling {
    Disabled = 0,
    Front = 1,
    Back = 2
}
export declare const enum DepthTest {
    Disabled = 0,
    AllowAll = 1,
    DenyAll = 2,
    Less = 3,
    LessOrEqual = 4,
    Equal = 5,
    NotEqual = 6,
    GreaterOrEqual = 7,
    Greater = 8
}
export declare const enum BlendOperation {
    Add = 0,
    Subtract = 1,
    ReverseSubtract = 2,
    Min = 3,
    Max = 4
}
export declare const enum BlendFactor {
    Zero = 0,
    One = 1,
    SourceColour = 2,
    OneMinusSourceColour = 3,
    DestColour = 4,
    OneMinusDestColour = 5,
    SourceAlpha = 6,
    OneMinusSourceAlpha = 7,
    SourceAlphaSaturated = 8,
    DestAlpha = 9,
    OneMinusDestAlpha = 10,
    ConstantColour = 11,
    OneMinusConstantColour = 12,
    ConstantAlpha = 13,
    OneMinusConstantAlpha = 14
}
export interface ColourBlending {
    rgbBlendOp: BlendOperation;
    alphaBlendOp: BlendOperation;
    sourceRGBFactor: BlendFactor;
    sourceAlphaFactor: BlendFactor;
    destRGBFactor: BlendFactor;
    destAlphaFactor: BlendFactor;
    constantColour: Float4;
}
export interface ColourWriteMask {
    red: boolean;
    green: boolean;
    blue: boolean;
    alpha: boolean;
}
export declare function makeColourBlending(): ColourBlending;
export declare function makeColourWriteMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): ColourWriteMask;
export interface Pipeline {
    colourWriteMask?: ColourWriteMask;
    depthWrite: boolean;
    depthTest: DepthTest;
    blending?: ColourBlending;
    faceCulling: FaceCulling;
    shader: Shader;
}
