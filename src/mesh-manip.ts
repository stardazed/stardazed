// mesh-manip.ts - mesh manipulators
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="meshdata.ts" />

namespace sd.meshdata {

	export function scale(mesh: MeshData, scale: Float3) {
		var posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			var posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach(pos => { vec3.multiply(pos, pos, scale); });
		}
	}


	export function translate(mesh: MeshData, globalDelta: Float3) {
		var posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			var posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach(pos => { vec3.add(pos, pos, globalDelta); });
		}
	}


	export function rotate(mesh: MeshData, rotation: Float4) {
		var posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			var posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach(pos => { vec3.transformQuat(pos, pos, rotation); });
		}

		var normAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Normal);
		if (normAttr) {
			var normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
			normView.forEach(norm => { vec3.transformQuat(norm, norm, rotation); });
		}
	}


	export function transform(mesh: MeshData, actions: { rotate?: Float4, translate?: Float3, scale?: Float3 }) {
		const rotation = actions.rotate || math.Quat.identity; 
		const translation = actions.translate || math.Vec3.zero;
		const scale = actions.scale || math.Vec3.one;
		const posMatrix = mat4.fromRotationTranslationScale([], rotation, translation, scale);

		var posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			var posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach(pos => { vec3.transformMat4(pos, pos, posMatrix); });
		}

		var normAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Normal);
		if (normAttr) {
			var normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
			var normalMatrix = mat3.normalFromMat4([], posMatrix);

			normView.forEach(norm => { vec3.transformMat3(norm, norm, normalMatrix); });
		}
	}

} // ns sd.meshdata
