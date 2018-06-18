/**
 * geometry-gen/manipulate - geometry manipulators
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Float3, Float4 } from "@stardazed/core";
import { Geometry } from "@stardazed/geometry";
export declare function scale(geom: Geometry, scale: Float3): void;
export declare function translate(geom: Geometry, globalDelta: Float3): void;
export declare function rotate(geom: Geometry, rotation: Float4): void;
export declare function transform(geom: Geometry, actions: {
    rotate?: Float4;
    translate?: Float3;
    scale?: Float3;
}): void;
