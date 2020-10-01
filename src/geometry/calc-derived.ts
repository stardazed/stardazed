/*
geometry/calc-derived - calculate normals and tangents
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

import { FieldView } from "stardazed/container";
import { Vector2, Vector3 } from "stardazed/vector";
import { VertexBuffer, VertexAttributeRole } from "./vertex-buffer";
import { TriangleView, triangleViewForGeometry } from "./triangle-view";
import { Geometry } from "./geometry";

export function genVertexNormals(geom: Geometry) {
	const triView = triangleViewForGeometry(geom);
	for (const vertexBuffer of geom.vertexBuffers) {
		calcVertexNormals(vertexBuffer, triView);
	}
}

export function genVertexTangents(geom: Geometry) {
	const triView = triangleViewForGeometry(geom);
	for (const vertexBuffer of geom.vertexBuffers) {
		calcVertexTangents(vertexBuffer, triView);
	}
}

export function calcVertexNormals(vertexBuffer: VertexBuffer, triView: TriangleView) {
	const posAttr = vertexBuffer.fieldByRole(VertexAttributeRole.Position);
	const normAttr = vertexBuffer.fieldByRole(VertexAttributeRole.Normal);

	if (posAttr && normAttr) {
		const posView = vertexBuffer.fieldView(posAttr);
		const normView = vertexBuffer.fieldView(normAttr);

		calcVertexNormalsViews(posView, normView, triView);
	}
	// TODO: else warn?
}

/**
 * @expects posView.length <= normView.length
 */
export function calcVertexNormalsViews(posView: FieldView, normView: FieldView, triView: TriangleView) {
	const vertexCount = posView.length;
	const baseVertex = normView.baseIndex;

	normView.fill([0, 0, 1]);
	const usages = new Float32Array(vertexCount);

	const posA = new Vector3(), lineA = new Vector3(), lineB = new Vector3();
	const normVec = new Vector3();
	const posBase = posView.base;
	const normBase = normView.base;

	for (const face of triView) {
		posA.setFromArray(posBase, posView.offsetOfItem(face.a - baseVertex));
		lineA.setFromArray(posBase, posView.offsetOfItem(face.b - baseVertex));
		lineB.setFromArray(posBase, posView.offsetOfItem(face.c - baseVertex));

		lineB.setSubtracting(lineA); // posC - posB
		lineA.setSubtracting(posA); // posB - posA

		if (lineA.magnitude < 0.00001 || lineB.magnitude < 0.00001) {
			continue;
		}

		// faceNormal = normalize(lineA x lineB)
		lineA.setCross(lineB).setNormalized();

		for (let fi = 0; fi < 3; ++fi) {
			const fvi = face.index(fi) - baseVertex;
			const normOffset = normView.offsetOfItem(fvi);
			normVec.setFromArray(normBase, normOffset);

			// normBegin[fvi] = (normBegin[fvi] * usages[fvi] + faceNormal) / (usages[fvi] + 1.0f);
			lineA.setMultiplyAdding(normVec, usages[fvi])
				.setMultiplying(1 / (usages[fvi] + 1))
				.writeToArray(normBase, normOffset);

			usages[fvi] += 1;
		}
	}

	const normCount = normView.length;
	for (let n = 0; n < normCount; ++n) {
		const normOffset = normView.offsetOfItem(n);
		normVec.setFromArray(normBase, normOffset)
			.setNormalized()
			.writeToArray(normBase, normOffset);
	}
}


export function calcVertexTangents(vertexBuffer: VertexBuffer, triView: TriangleView, uvSet = VertexAttributeRole.UV0) {
	const posAttr = vertexBuffer.fieldByRole(VertexAttributeRole.Position);
	const normAttr = vertexBuffer.fieldByRole(VertexAttributeRole.Normal);
	const uvAttr = vertexBuffer.fieldByRole(uvSet);
	const tanAttr = vertexBuffer.fieldByRole(VertexAttributeRole.Tangent);

	if (posAttr && normAttr && uvAttr && tanAttr) {
		const posView = vertexBuffer.fieldView(posAttr);
		const normView = vertexBuffer.fieldView(normAttr);
		const uvView = vertexBuffer.fieldView(uvAttr);
		const tanView = vertexBuffer.fieldView(tanAttr);

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
	posView: FieldView,
	normView: FieldView,
	uvView: FieldView,
	tanView: FieldView,
	triView: TriangleView
) {
	// adaptation of http://www.terathon.com/code/tangent.html
	// by Eric Lengyel

	const vertexCount = posView.length;
	const tanBuf = new Float32Array(vertexCount * 3 * 2);
	const tan1 = tanBuf.subarray(0, vertexCount);
	const tan2 = tanBuf.subarray(vertexCount);

	const v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3();
	const w1 = new Vector2(), w2 = new Vector2(), w3 = new Vector2();
	const sdir = new Vector3(), tdir = new Vector3();

	const posBase = posView.base;
	const uvBase = uvView.base;

	for (const face of triView) {
		const { a, b, c } = face;

		v1.setFromArray(posBase, posView.offsetOfItem(a));
		v2.setFromArray(posBase, posView.offsetOfItem(b));
		v3.setFromArray(posBase, posView.offsetOfItem(c));

		w1.setFromArray(uvBase, uvView.offsetOfItem(a));
		w2.setFromArray(uvBase, uvView.offsetOfItem(b));
		w3.setFromArray(uvBase, uvView.offsetOfItem(c));

		const x1 = v2.x - v1.x;
		const x2 = v3.x - v1.x;
		const y1 = v2.y - v1.y;
		const y2 = v3.y - v1.y;
		const z1 = v2.z - v1.z;
		const z2 = v3.z - v1.z;

		const s1 = w2.x - w1.x;
		const s2 = w3.x - w1.x;
		const t1 = w2.y - w1.y;
		const t2 = w3.y - w1.y;

		const rd = (s1 * t2 - s2 * t1);
		const r = rd === 0 ? 0.0 : 1.0 / rd;
		sdir.setElements(
			(t2 * x1 - t1 * x2) * r,
			(t2 * y1 - t1 * y2) * r,
			(t2 * z1 - t1 * z2) * r
		);
		tdir.setElements(
			(s1 * x2 - s2 * x1) * r,
			(s1 * y2 - s2 * y1) * r,
			(s1 * z2 - s2 * z1) * r
		);

		// tan1[a] += sdir;
		// tan1[b] += sdir;
		// tan1[c] += sdir;
		v1.setFromArray(tan1, a * 3).setAdding(sdir).writeToArray(tan1, a * 3);
		v2.setFromArray(tan1, b * 3).setAdding(sdir).writeToArray(tan1, b * 3);
		v3.setFromArray(tan1, c * 3).setAdding(sdir).writeToArray(tan1, c * 3);

		// tan2[a] += tdir;
		// tan2[b] += tdir;
		// tan2[c] += tdir;
		v1.setFromArray(tan2, a * 3).setAdding(tdir).writeToArray(tan2, a * 3);
		v2.setFromArray(tan2, b * 3).setAdding(tdir).writeToArray(tan2, b * 3);
		v3.setFromArray(tan2, c * 3).setAdding(tdir).writeToArray(tan2, c * 3);
	}

	const normBase = normView.base;
	const tanBase = tanView.base;
	const n = v3;
	const tangent = new Vector3();
	for (let ix = 0; ix < vertexCount; ++ix) {
		const tanOffset = normView.offsetOfItem(ix);
		n.setFromArray(normBase, tanOffset);
		v1.setFromArray(tan1, ix * 3);
		v2.setFromArray(tan2, ix * 3);

		// Gram-Schmidt orthogonalize, specify standard normal in case n or t = 0
		// normalize(v1 - n * (n . v1))
		tangent.setFromVector3(v1).setMultiplyAdding(n, -(n.dot(v1))).setNormalized();

		// Reverse tangent to conform to GL handedness if needed
		if (v2.dot(n.setCross(v1)) < 0) {
			tangent.setNegated();
		}

		// if (isNaN(tangent.x) || isNaN(tangent.y) || isNaN(tangent.z)) {
		// 	throw new Error("Failure during tangent calculation");
		// }
		tangent.writeToArray(tanBase, tanOffset);
	}
}
