// render/core/gl1/mesh - WebGL1 implementation of mesh resources
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	const gl1TypeForVertexField = makeLUT<geometry.VertexField, number>(
		geometry.VertexField.Float, GLConst.FLOAT,
		geometry.VertexField.Floatx2, GLConst.FLOAT,
		geometry.VertexField.Floatx3, GLConst.FLOAT,
		geometry.VertexField.Floatx4, GLConst.FLOAT,

		geometry.VertexField.UInt32, GLConst.UNSIGNED_INT,
		geometry.VertexField.UInt32x2, GLConst.UNSIGNED_INT,
		geometry.VertexField.UInt32x3, GLConst.UNSIGNED_INT,
		geometry.VertexField.UInt32x4, GLConst.UNSIGNED_INT,

		geometry.VertexField.SInt32, GLConst.INT,
		geometry.VertexField.SInt32x2, GLConst.INT,
		geometry.VertexField.SInt32x3, GLConst.INT,
		geometry.VertexField.SInt32x4, GLConst.INT,

		geometry.VertexField.UInt16x2, GLConst.UNSIGNED_SHORT,
		geometry.VertexField.UInt16x3, GLConst.UNSIGNED_SHORT,
		geometry.VertexField.UInt16x4, GLConst.UNSIGNED_SHORT,
		geometry.VertexField.Norm_UInt16x2, GLConst.UNSIGNED_SHORT,
		geometry.VertexField.Norm_UInt16x3, GLConst.UNSIGNED_SHORT,
		geometry.VertexField.Norm_UInt16x4, GLConst.UNSIGNED_SHORT,

		geometry.VertexField.SInt16x2, GLConst.SHORT,
		geometry.VertexField.SInt16x3, GLConst.SHORT,
		geometry.VertexField.SInt16x4, GLConst.SHORT,
		geometry.VertexField.Norm_SInt16x2, GLConst.SHORT,
		geometry.VertexField.Norm_SInt16x3, GLConst.SHORT,
		geometry.VertexField.Norm_SInt16x4, GLConst.SHORT,

		geometry.VertexField.UInt8x2, GLConst.UNSIGNED_BYTE,
		geometry.VertexField.UInt8x3, GLConst.UNSIGNED_BYTE,
		geometry.VertexField.UInt8x4, GLConst.UNSIGNED_BYTE,
		geometry.VertexField.Norm_UInt8x2, GLConst.UNSIGNED_BYTE,
		geometry.VertexField.Norm_UInt8x3, GLConst.UNSIGNED_BYTE,
		geometry.VertexField.Norm_UInt8x4, GLConst.UNSIGNED_BYTE,

		geometry.VertexField.SInt8x2, GLConst.BYTE,
		geometry.VertexField.SInt8x3, GLConst.BYTE,
		geometry.VertexField.SInt8x4, GLConst.BYTE,
		geometry.VertexField.Norm_SInt8x2, GLConst.BYTE,
		geometry.VertexField.Norm_SInt8x3, GLConst.BYTE,
		geometry.VertexField.Norm_SInt8x4, GLConst.BYTE,
	);


	export interface GL1MeshData {
		attributes: geometry.PositionedAttribute[];
		indexElement: geometry.IndexElementType;
		buffers: WebGLBuffer[];
		bufferStrides: number[];
		vaos: Map<number, WebGLVertexArrayObjectOES>;
	}


	export function createMesh(rd: GL1RenderDevice, mesh: geometry.Geometry): GL1MeshData {
		const gl = rd.gl;
		const buffers: WebGLBuffer[] = [];

		// Even though the local vertex and index buffers may all be allocated in a single
		// array, WebGL does not support binding the same ArrayBuffer to different targets
		// for safety reasons.
		for (const vb of mesh.vertexBuffers) {
			const vbuf = gl.createBuffer()!; // TODO: handle allocation failure
			gl.bindBuffer(GLConst.ARRAY_BUFFER, vbuf);
			gl.bufferData(GLConst.ARRAY_BUFFER, vb.storage, GLConst.STATIC_DRAW);
			buffers.push(vbuf);
		}

		// The index buffer, if present, is the last buffer in the array
		if (mesh.indexBuffer) {
			const ibuf = gl.createBuffer()!; // TODO: handle allocation failure
			gl.bindBuffer(GLConst.ELEMENT_ARRAY_BUFFER, ibuf);
			gl.bufferData(GLConst.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer.storage, GLConst.STATIC_DRAW);
			buffers.push(ibuf);
		}

		gl.bindBuffer(GLConst.ARRAY_BUFFER, null);
		gl.bindBuffer(GLConst.ELEMENT_ARRAY_BUFFER, null);

		// linearize the attributes and store all required data for this mesh to be bound
		return {
			attributes: mesh.layout.layouts.map(vbl => vbl.attributes).reduce((aa, next) => aa.concat(next)),
			indexElement: mesh.indexBuffer ? mesh.indexBuffer.indexElementType : geometry.IndexElementType.None,
			buffers,
			bufferStrides: mesh.layout.layouts.map(vbl => vbl.stride),
			vaos: new Map<number, WebGLVertexArrayObjectOES>()
		};
	}


	export function destroyMesh(rd: GL1RenderDevice, mesh: GL1MeshData) {
		for (const buf of mesh.buffers) {
			rd.gl.deleteBuffer(buf);
		}
		mesh.vaos.forEach(vao => {
			rd.extVAO.deleteVertexArrayOES(vao);
		});

		mesh.attributes = [];
		mesh.buffers = [];
		mesh.vaos.clear();
	}


	export function createVAOForAttrBinding(rd: GL1RenderDevice, mesh: GL1MeshData, attrs: ShaderVertexAttribute[]) {
		const gl = rd.gl;

		const vao = rd.extVAO.createVertexArrayOES()!; // TODO: handle allocation failure
		rd.extVAO.bindVertexArrayOES(vao);

		if (mesh.indexElement !== geometry.IndexElementType.None) {
			gl.bindBuffer(GLConst.ELEMENT_ARRAY_BUFFER, mesh.buffers[mesh.buffers.length - 1]);
		}

		let boundBufferIndex = -1;
		for (const attr of attrs) {
			const meshAttr = mesh.attributes.find(a => a.role === attr.role);
			if (meshAttr) {
				if (boundBufferIndex !== meshAttr.bufferIndex) {
					boundBufferIndex = meshAttr.bufferIndex;
					gl.bindBuffer(GLConst.ARRAY_BUFFER, mesh.buffers[boundBufferIndex]);
				}
				gl.enableVertexAttribArray(attr.index);

				const elementCount = geometry.vertexFieldElementCount(meshAttr.field);
				const glElementType = gl1TypeForVertexField[meshAttr.field];
				const normalized = geometry.vertexFieldIsNormalized(meshAttr.field);
				gl.vertexAttribPointer(attr.index, elementCount, glElementType, normalized, mesh.bufferStrides[boundBufferIndex], meshAttr.offset);
			}
			else {
				gl.disableVertexAttribArray(attr.index);
				console.warn("GL1: Mismatch of mesh attributes and shader vertex attributes.", mesh, attrs);
			}
		}

		rd.extVAO.bindVertexArrayOES(null);
		return vao;
	}

} // ns sd.render.gl1
