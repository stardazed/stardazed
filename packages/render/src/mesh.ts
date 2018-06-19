/**
 * render/mesh - engine-side representation of geometry data
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Geometry } from "@stardazed/geometry";
import { RenderResourceBase, ResourceType } from "./resource";

export interface Mesh extends RenderResourceBase, Geometry {
	// no additional info for now
}

export function makeMesh(geom: Geometry): Mesh {
	return {
		renderResourceType: ResourceType.Mesh,
		renderResourceHandle: 0,

		...geom
	};
}
