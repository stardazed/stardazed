// mesh-manip.ts - mesh manipulators
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="meshdata.ts" />

namespace sd.meshdata {

	export function scale(mesh: MeshData, scale: Float3) {
		assert(scale.length == 3);

		var posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			var posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach((pos) => { vec3.multiply(pos, pos, scale); });
		}
	}


	export function translate(mesh: MeshData, globalDelta: Float3) {
		assert(globalDelta.length == 3);

		var posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			var posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach((pos) => { vec3.add(pos, pos, globalDelta); });
		}
	}


	export function rotate(mesh: MeshData, rotation: Float4) {
		assert(rotation.length == 4);

		var posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			var posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach((pos) => { vec3.transformQuat(pos, pos, rotation); });
		}

		var normAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Normal);
		if (normAttr) {
			var normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
			normView.forEach((norm) => { vec3.transformQuat(norm, norm, rotation); });
		}
	}


	export function transform(mesh: MeshData, rotate?: Float4, translate?: Float3, scale?: Float3) {
		if (! rotate)
			rotate = quat.create();
		if (! translate)
			translate = vec3.create();
		if (! scale)
			scale = vec3.fromValues(1, 1, 1);

		assert(rotate.length == 4, "rotate must be a quad");
		assert(translate.length == 3, "translate must be a vec3");
		assert(scale.length == 3, "scale must be a vec3");

		var posMatrix = mat4.create();
		mat4.fromRotationTranslationScale(posMatrix, rotate, translate, scale);

		var posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			var posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach((pos) => { vec3.transformMat4(pos, pos, posMatrix); });
		}

		var normAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Normal);
		if (normAttr) {
			var normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
			var normalMatrix = mat3.create();
			mat3.fromMat4(normalMatrix, posMatrix);
			mat3.invert(normalMatrix, normalMatrix);
			mat3.transpose(normalMatrix, normalMatrix);

			normView.forEach((norm) => { vec3.transformMat3(norm, norm, normalMatrix); });
		}
	}

} // ns sd.meshdata
