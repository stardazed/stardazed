/**
 * render/mesh - engine-side representation of geometry data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Geometry } from "@stardazed/geometry";
import { RenderResourceBase } from "./resource";
export interface Mesh extends RenderResourceBase, Geometry {
}
export declare function makeMesh(geom: Geometry): Mesh;
