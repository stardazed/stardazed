/**
 * geometry-gen/manipulate - geometry manipulators
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Float3, Float4 } from "@stardazed/core";
import { Geometry, findAttributeOfRoleInGeometry, VertexAttributeRole } from "@stardazed/geometry";
import { VertexBufferAttributeView } from "@stardazed/geometry-data";
import { vec3, mat3, mat4, quat } from "@stardazed/math";

export function scale(geom: Geometry, scale: Float3) {
	const posAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Position);
	if (posAttr) {
		const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
		posView.forEach(pos => { vec3.multiply(pos, pos, scale); });
	}
}


export function translate(geom: Geometry, globalDelta: Float3) {
	const posAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Position);
	if (posAttr) {
		const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
		posView.forEach(pos => { vec3.add(pos, pos, globalDelta); });
	}
}


export function rotate(geom: Geometry, rotation: Float4) {
	const posAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Position);
	if (posAttr) {
		const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
		posView.forEach(pos => { vec3.transformQuat(pos, pos, rotation); });
	}

	const normAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Normal);
	if (normAttr) {
		const normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
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
		const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
		posView.forEach(pos => { vec3.transformMat4(pos, pos, posMatrix); });
	}

	const normAttr = findAttributeOfRoleInGeometry(geom, VertexAttributeRole.Normal);
	if (normAttr) {
		const normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
		const normalMatrix = mat3.normalFromMat4([], posMatrix);

		normView.forEach(norm => { vec3.transformMat3(norm, norm, normalMatrix); });
	}
}
