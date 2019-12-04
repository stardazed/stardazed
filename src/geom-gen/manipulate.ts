/**
 * geometry/manipulate - transforming geometry
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { VertexBuffer, VertexAttributeRole, PositionedAttribute, VertexAttributeView } from "stardazed/vertex-buffer";
import { mat3, mat4, quat, vec3 } from "stardazed/vector";
import { Geometry } from "./types";
import { GeometryLayout } from "./layout";

export interface AttributeResult {
	attr: PositionedAttribute;
	bufferIndex: number;
}

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

export function findAttributeOfRoleInGeometry(geom: Geometry, role: VertexAttributeRole): { vertexBuffer: VertexBuffer; attr: PositionedAttribute; } | undefined {
	const pa = findAttributeOfRoleInLayout(geom.layout, role);
	const avb = pa ? geom.vertexBuffers[pa.bufferIndex] : undefined;

	if (pa && avb) {
		return { vertexBuffer: avb, attr: pa.attr };
	}
	return undefined;
}

export function scale(geom: Geometry, scale: Float3) {
	const posAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Position);
	if (posAttr) {
		const posView = new VertexAttributeView(posAttr.vertexBuffer, posAttr.attr);
		posView.forEach(pos => { vec3.multiply(pos, pos, scale); });
	}
}

export function translate(geom: Geometry, globalDelta: Float3) {
	const posAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Position);
	if (posAttr) {
		const posView = new VertexAttributeView(posAttr.vertexBuffer, posAttr.attr);
		posView.forEach(pos => { vec3.add(pos, pos, globalDelta); });
	}
}

export function rotate(geom: Geometry, rotation: Float4) {
	const posAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Position);
	if (posAttr) {
		const posView = new VertexAttributeView(posAttr.vertexBuffer, posAttr.attr);
		posView.forEach(pos => { vec3.transformQuat(pos, pos, rotation); });
	}

	const normAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Normal);
	if (normAttr) {
		const normView = new VertexAttributeView(normAttr.vertexBuffer, normAttr.attr);
		normView.forEach(norm => { vec3.transformQuat(norm, norm, rotation); });
	}
}

export function transform(geom: Geometry, actions: { rotate?: Float4, translate?: Float3, scale?: Float3 }) {
	const rotation = actions.rotate || quat.create();
	const translation = actions.translate || vec3.zero();
	const scale = actions.scale || vec3.one();
	const posMatrix = mat4.fromRotationTranslationScale([], rotation, translation, scale);

	const posAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Position);
	if (posAttr) {
		const posView = new VertexAttributeView(posAttr.vertexBuffer, posAttr.attr);
		posView.forEach(pos => { vec3.transformMat4(pos, pos, posMatrix); });
	}

	const normAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Normal);
	if (normAttr) {
		const normView = new VertexAttributeView(normAttr.vertexBuffer, normAttr.attr);
		const normalMatrix = mat3.normalFromMat4([], posMatrix);

		normView.forEach(norm => { vec3.transformMat3(norm, norm, normalMatrix); });
	}
}
