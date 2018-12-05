/**
 * geometry/layout - multi-buffer layout
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { VertexAttributeRole, VertexAttribute, VertexBufferLayout, isVertexAttribute, makeStandardVertexBufferLayout, PositionedAttribute } from "@stardazed/vertex-buffer";

export interface GeometryLayout {
	readonly layouts: ReadonlyArray<VertexBufferLayout>;
}

export interface AttributeResult {
	attr: PositionedAttribute;
	bufferIndex: number;
}

export const isGeometryLayout = (vl: any): vl is GeometryLayout =>
	(typeof vl === "object") && vl !== null &&
	Array.isArray(vl.layouts);

export function findAttributeOfRoleInLayout(gl: GeometryLayout, role: VertexAttributeRole): AttributeResult | undefined {
	for (let ix = 0; ix < gl.layouts.length; ++ix) {
		const layout = gl.layouts[ix];
		const pa = layout.attrByRole(role);
		if (pa) {
			return { attr: pa, bufferIndex: ix };
		}
	}
	return undefined;
}

export function makeStandardGeometryLayout(attrLists: VertexAttribute[] | VertexAttribute[][]): GeometryLayout {
	const layouts: VertexBufferLayout[] = [];
	
	if (attrLists.length > 0) {
		if (isVertexAttribute(attrLists[0])) {
			layouts.push(makeStandardVertexBufferLayout(attrLists as VertexAttribute[]));
		}
		else {
			for (const list of attrLists) {
				layouts.push(makeStandardVertexBufferLayout(list as VertexAttribute[]));
			}
		}
	}

	return {
		layouts
	};
}
