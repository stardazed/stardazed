/**
 * geometry-gen/calc-derived - calculate normals and tangents
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { vec3 } from "@stardazed/math";
import { copyIndexedVec3, setIndexedVec3 } from "@stardazed/container";
import { Geometry, VertexAttributeRole, VertexBufferLayout, VertexBuffer } from "@stardazed/geometry";
import { VertexBufferAttributeView, TriangleView, TriangleProxy, triangleViewForGeometry } from "@stardazed/geometry-data";

export function genVertexNormals(geom: Geometry) {
	return triangleViewForGeometry(geom).then(
		triView => {
			geom.vertexBuffers.forEach((vertexBuffer, ix) => {
				calcVertexNormals(geom.layout.layouts[ix], vertexBuffer, triView);
			});
		}
	);
}

export function genVertexTangents(geom: Geometry) {
	return triangleViewForGeometry(geom).then(
		triView => {
			geom.vertexBuffers.forEach((vertexBuffer, ix) => {
				calcVertexTangents(geom.layout.layouts[ix], vertexBuffer, triView);
			});
		}
	);
}

export function calcVertexNormals(layout: VertexBufferLayout, vertexBuffer: VertexBuffer, triView: TriangleView) {
	const posAttr = layout.attrByRole(VertexAttributeRole.Position);
	const normAttr = layout.attrByRole(VertexAttributeRole.Normal);

	if (posAttr && normAttr) {
		const posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
		const normView = new VertexBufferAttributeView(vertexBuffer, normAttr);

		calcVertexNormalsViews(posView, normView, triView);
	}
	// TODO: else warn?
}

/**
 * @expects posView.vertexCount <= normView.vertexCount
 */
export function calcVertexNormalsViews(posView: VertexBufferAttributeView, normView: VertexBufferAttributeView, triView: TriangleView) {
	const vertexCount = posView.vertexCount;
	const normalCount = normView.vertexCount;
	const baseVertex = normView.fromVertex;

	// FIXME(perf): avoid creating thousands of vec refs
	normView.forEach(norm => {
		vec3.set(norm, 0, 0, 1);
	});
	const usages = new Float32Array(vertexCount);

	const lineA = vec3.create(), lineB = vec3.create();
	const faceNormal = vec3.create(), temp = vec3.create();

	triView.forEach((face: TriangleProxy) => {
		const posA = posView.copyItem(face.a - baseVertex);
		const posB = posView.copyItem(face.b - baseVertex);
		const posC = posView.copyItem(face.c - baseVertex);

		vec3.subtract(lineA, posB, posA);
		vec3.subtract(lineB, posC, posB);

		if (vec3.length(lineA) < 0.00001 || vec3.length(lineB) < 0.00001) {
			return;
		}

		vec3.cross(faceNormal, lineA, lineB);
		vec3.normalize(faceNormal, faceNormal);

		for (let fi = 0; fi < 3; ++fi) {
			const fvi = face.index(fi) - baseVertex;
			const norm = normView.refItem(fvi);

			// normBegin[fvi] = (normBegin[fvi] * usages[fvi] + faceNormal) / (usages[fvi] + 1.0f);
			vec3.scaleAndAdd(temp, faceNormal, norm, usages[fvi]);
			vec3.scale(norm, temp, 1 / (usages[fvi] + 1));

			usages[fvi] += 1;
		}
	});

	normView.forEach((norm) => {
		vec3.normalize(norm, norm);
	});
}


export function calcVertexTangents(layout: VertexBufferLayout, vertexBuffer: VertexBuffer, triView: TriangleView, uvSet = VertexAttributeRole.UV0) {
	const posAttr = layout.attrByRole(VertexAttributeRole.Position);
	const normAttr = layout.attrByRole(VertexAttributeRole.Normal);
	const uvAttr = layout.attrByRole(uvSet);
	const tanAttr = layout.attrByRole(VertexAttributeRole.Tangent);

	if (posAttr && normAttr && uvAttr && tanAttr) {
		const posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
		const normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
		const uvView = new VertexBufferAttributeView(vertexBuffer, uvAttr);
		const tanView = new VertexBufferAttributeView(vertexBuffer, tanAttr);

		calcVertexTangentsViews(posView, normView, uvView, tanView, triView);
	}
	// TODO: else warn?
}

/**
 * @expects posView.vertexCount <= normView.vertexCount
 * @expects posView.vertexCount <= uvView.vertexCount
 * @expects posView.vertexCount <= tanView.vertexCount
 */
export function calcVertexTangentsViews(
	posView: VertexBufferAttributeView,
	normView: VertexBufferAttributeView,
	uvView: VertexBufferAttributeView,
	tanView: VertexBufferAttributeView,
	triView: TriangleView
) {
	// adaptation of http://www.terathon.com/code/tangent.html
	// by Eric Lengyel

	const vertexCount = posView.vertexCount;
	const tanBuf = new Float32Array(vertexCount * 3 * 2);
	const tan1 = tanBuf.subarray(0, vertexCount);
	const tan2 = tanBuf.subarray(vertexCount);

	triView.forEach(face => {
		const { a, b, c } = face;

		const v1 = posView.copyItem(a),
			v2 = posView.copyItem(b),
			v3 = posView.copyItem(c);

		const w1 = uvView.copyItem(a),
			w2 = uvView.copyItem(b),
			w3 = uvView.copyItem(c);

		const x1 = v2[0] - v1[0];
		const x2 = v3[0] - v1[0];
		const y1 = v2[1] - v1[1];
		const y2 = v3[1] - v1[1];
		const z1 = v2[2] - v1[2];
		const z2 = v3[2] - v1[2];

		const s1 = w2[0] - w1[0];
		const s2 = w3[0] - w1[0];
		const t1 = w2[1] - w1[1];
		const t2 = w3[1] - w1[1];

		const rd = (s1 * t2 - s2 * t1);
		const r = rd === 0 ? 0.0 : 1.0 / rd;
		const sdir = [
			(t2 * x1 - t1 * x2) * r,
			(t2 * y1 - t1 * y2) * r,
			(t2 * z1 - t1 * z2) * r
		];
		const tdir = [
			(s1 * x2 - s2 * x1) * r,
			(s1 * y2 - s2 * y1) * r,
			(s1 * z2 - s2 * z1) * r
		];

		// tan1[a] += sdir;
		// tan1[b] += sdir;
		// tan1[c] += sdir;
		const tan1a = copyIndexedVec3(tan1, a);
		const tan1b = copyIndexedVec3(tan1, b);
		const tan1c = copyIndexedVec3(tan1, c);
		setIndexedVec3(tan1, a, vec3.add(tan1a, tan1a, sdir));
		setIndexedVec3(tan1, b, vec3.add(tan1b, tan1b, sdir));
		setIndexedVec3(tan1, c, vec3.add(tan1c, tan1c, sdir));

		// tan2[a] += tdir;
		// tan2[b] += tdir;
		// tan2[c] += tdir;
		const tan2a = copyIndexedVec3(tan2, a);
		const tan2b = copyIndexedVec3(tan2, b);
		const tan2c = copyIndexedVec3(tan2, c);
		setIndexedVec3(tan2, a, vec3.add(tan2a, tan2a, tdir));
		setIndexedVec3(tan2, b, vec3.add(tan2b, tan2b, tdir));
		setIndexedVec3(tan2, c, vec3.add(tan2c, tan2c, tdir));
	});

	for (let ix = 0; ix < vertexCount; ++ix) {
		const n = normView.copyItem(ix);
		const t = copyIndexedVec3(tan1, ix);
		const t2 = copyIndexedVec3(tan2, ix);

		// Gram-Schmidt orthogonalize, specify standard normal in case n or t = 0
		const tangent = vec3.normalize([0, 0, 1], vec3.sub([], t, vec3.scale([], n, vec3.dot(n, t))));

		// Reverse tangent to conform to GL handedness if needed
		if (vec3.dot(vec3.cross([], n, t), t2) < 0) {
			vec3.scale(tangent, tangent, -1);
		}

		// if (isNaN(tangent[0]) || isNaN(tangent[1]) || isNaN(tangent[2])) {
		// 	throw new Error("Failure during tangent calculation");
		// }
		vec3.copy(tanView.refItem(ix), tangent);
	}
}
