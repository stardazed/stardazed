// meshdata/manipulate - meshdata manipulators
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.meshdata {

	export function scale(mesh: MeshData, scale: Float3) {
		const posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach(pos => { vec3.multiply(pos, pos, scale); });
		}
	}


	export function translate(mesh: MeshData, globalDelta: Float3) {
		const posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach(pos => { vec3.add(pos, pos, globalDelta); });
		}
	}


	export function rotate(mesh: MeshData, rotation: Float4) {
		const posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach(pos => { vec3.transformQuat(pos, pos, rotation); });
		}

		const normAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Normal);
		if (normAttr) {
			const normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
			normView.forEach(norm => { vec3.transformQuat(norm, norm, rotation); });
		}
	}


	export function transform(mesh: MeshData, actions: { rotate?: Float4, translate?: Float3, scale?: Float3 }) {
		const rotation = actions.rotate || quat.create();
		const translation = actions.translate || vec3.zero();
		const scale = actions.scale || vec3.one();
		const posMatrix = mat4.fromRotationTranslationScale([], rotation, translation, scale);

		const posAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Position);
		if (posAttr) {
			const posView = new VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
			posView.forEach(pos => { vec3.transformMat4(pos, pos, posMatrix); });
		}

		const normAttr = mesh.findFirstAttributeWithRole(VertexAttributeRole.Normal);
		if (normAttr) {
			const normView = new VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
			const normalMatrix = mat3.normalFromMat4([], posMatrix);

			normView.forEach(norm => { vec3.transformMat3(norm, norm, normalMatrix); });
		}
	}

} // ns sd.meshdata
