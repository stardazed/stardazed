// mesh.ts - Mesh objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="buffer.ts"/>
/// <reference path="rendercontext.ts"/>
/// <reference path="mesh-desc.ts"/>

namespace sd.render {

	function glTypeForIndexElementType(rc: RenderContext, iet: mesh.IndexElementType): number {
		switch (iet) {
			case sd.mesh.IndexElementType.UInt8: return rc.gl.UNSIGNED_BYTE;
			case sd.mesh.IndexElementType.UInt16: return rc.gl.UNSIGNED_SHORT;
			case sd.mesh.IndexElementType.UInt32:
				return rc.ext32bitIndexes ? rc.gl.UNSIGNED_INT : rc.gl.NONE;

			default:
				assert(false, "Invalid IndexElementType");
				return rc.gl.NONE;
		}
	}


	function glTypeForPrimitiveType(rc: RenderContext, pt: mesh.PrimitiveType) {
		switch (pt) {
			case mesh.PrimitiveType.Point: return rc.gl.POINTS;
			case mesh.PrimitiveType.Line: return rc.gl.LINES;
			case mesh.PrimitiveType.LineStrip: return rc.gl.LINE_STRIP;
			case mesh.PrimitiveType.Triangle: return rc.gl.TRIANGLES;
			case mesh.PrimitiveType.TriangleStrip: return rc.gl.TRIANGLE_STRIP;
		}
	}


	function glTypeForVertexField(rc: RenderContext, vf: mesh.VertexField) {
		switch (vf) {
			case mesh.VertexField.Float:
			case mesh.VertexField.Floatx2:
			case mesh.VertexField.Floatx3:
			case mesh.VertexField.Floatx4:
				return rc.gl.FLOAT;

			case mesh.VertexField.UInt32:
			case mesh.VertexField.UInt32x2:
			case mesh.VertexField.UInt32x3:
			case mesh.VertexField.UInt32x4:
				return rc.gl.UNSIGNED_INT;

			case mesh.VertexField.SInt32:
			case mesh.VertexField.SInt32x2:
			case mesh.VertexField.SInt32x3:
			case mesh.VertexField.SInt32x4:
				return rc.gl.INT;

			case mesh.VertexField.UInt16x2:
			case mesh.VertexField.Norm_UInt16x2:
			case mesh.VertexField.UInt16x3:
			case mesh.VertexField.Norm_UInt16x3:
			case mesh.VertexField.UInt16x4:
			case mesh.VertexField.Norm_UInt16x4:
				return rc.gl.UNSIGNED_SHORT;

			case mesh.VertexField.SInt16x2:
			case mesh.VertexField.Norm_SInt16x2:
			case mesh.VertexField.SInt16x3:
			case mesh.VertexField.Norm_SInt16x3:
			case mesh.VertexField.SInt16x4:
			case mesh.VertexField.Norm_SInt16x4:
				return rc.gl.SHORT;

			case mesh.VertexField.UInt8x2:
			case mesh.VertexField.Norm_UInt8x2:
			case mesh.VertexField.UInt8x3:
			case mesh.VertexField.Norm_UInt8x3:
			case mesh.VertexField.UInt8x4:
			case mesh.VertexField.Norm_UInt8x4:
				return rc.gl.UNSIGNED_BYTE;

			case mesh.VertexField.SInt8x2:
			case mesh.VertexField.Norm_SInt8x2:
			case mesh.VertexField.SInt8x3:
			case mesh.VertexField.Norm_SInt8x3:
			case mesh.VertexField.SInt8x4:
			case mesh.VertexField.Norm_SInt8x4:
				return rc.gl.BYTE;

			default:
				assert(false, "Invalid mesh.VertexField");
				return rc.gl.NONE;
		}
	}


	var meshLimits = {
		maxVertexAttributes: 0
	};

	function maxVertexAttributes(rc: RenderContext) {
		if (meshLimits.maxVertexAttributes == 0) {
			meshLimits.maxVertexAttributes = rc.gl.getParameter(rc.gl.MAX_VERTEX_ATTRIBS);
		}

		return meshLimits.maxVertexAttributes;
	}


	export class Mesh {
		vao_: WebGLVertexArrayObjectOES;		

		buffers_: Buffer[] = [];
		primitiveGroups_: mesh.PrimitiveGroup[];

		glPrimitiveType_: number = 0;
		glIndexElementType_: number = 0;
		indexElementSizeBytes_: number = 0;


		private bindSingleAttribute(attr: mesh.PositionedAttribute, stride: number, toVAIndex: number) {
			var elementCount = mesh.vertexFieldElementCount(attr.field);
			var normalized = mesh.vertexFieldIsNormalized(attr.field);
			var glElementType = glTypeForVertexField(this.rc, attr.field);

			this.rc.gl.enableVertexAttribArray(toVAIndex);
			this.rc.gl.vertexAttribPointer(toVAIndex, elementCount, glElementType, normalized, stride, attr.offset);
		}


		private bindVertexBufferAttributes(vb: mesh.VertexBuffer, startBoundIndex: number) {
			var attrCount = vb.attributeCount,
				stride = vb.strideBytes;

			assert(startBoundIndex + attrCount <= maxVertexAttributes(this.rc));

			for (var attrIndex = 0; attrIndex < attrCount; ++attrIndex) {
				var attr = vb.attrByIndex(attrIndex);
				assert(attr);
				this.bindSingleAttribute(attr, stride, attrIndex + startBoundIndex);
			}
		}


		constructor(private rc: RenderContext, desc: MeshDescriptor) {
			var gl = rc.gl;

			this.vao_ = rc.extVAO ? rc.extVAO.createVertexArrayOES() : null;
			if (this.vao_)
				rc.extVAO.bindVertexArrayOES(this.vao_);

			for (var vertexBinding of desc.vertexBindings) {
				assert(vertexBinding.vertexBuffer);

				// -- allocate sized attribute buffer
				let buffer = new Buffer(rc, BufferRole.VertexAttribute, vertexBinding.updateFrequency);
				buffer.allocateWithContents(vertexBinding.vertexBuffer.buffer);
				this.buffers_.push(buffer);

				// -- configure our VAO attributes with the attrs found in the current vertex buffer
				if (this.vao_) {
					buffer.bind();
					this.bindVertexBufferAttributes(vertexBinding.vertexBuffer, vertexBinding.baseAttributeIndex);
				}
			}

			if (desc.indexBinding.indexBuffer) {
				// -- allocate sized index buffer
				var indexBuffer = new Buffer(rc, BufferRole.VertexIndex, desc.indexBinding.updateFrequency);
				indexBuffer.allocateWithContents(desc.indexBinding.indexBuffer.buffer);
			
				// -- precompute some info required for draw calls
				this.glPrimitiveType_ = glTypeForPrimitiveType(rc, desc.indexBinding.indexBuffer.primitiveType);
				this.glIndexElementType_ = glTypeForIndexElementType(rc, desc.indexBinding.indexBuffer.indexElementType);
				this.indexElementSizeBytes_ = desc.indexBinding.indexBuffer.indexElementSizeBytes;
			
				// -- bind index buffer to VAO
				if (this.vao_)
					indexBuffer.bind();
			}

			// -- copy primitive groups
			this.primitiveGroups_ = desc.primitiveGroups.map((pg) => cloneStruct(pg));

			if (this.vao_)
				rc.extVAO.bindVertexArrayOES(null);
		}


		bind() {
			this.rc.extVAO.bindVertexArrayOES(this.vao_);
		}

		unbind() {
			this.rc.extVAO.bindVertexArrayOES(null);
		}


		// -- observers
		get hasIndexBuffer() { return this.glIndexElementType_ != 0; }
		get glPrimitiveType() { return this.glPrimitiveType_; }
		get glIndexElementType() { return this.glIndexElementType_; }
		get indexElementSizeBytes() { return this.indexElementSizeBytes_; }
		

		vertexBufferAtIndex(vertexBufferIndex: number) {
			var vertexBufferCount = this.buffers_.length;
			if (this.hasIndexBuffer)
				--vertexBufferCount;

			assert(vertexBufferIndex < vertexBufferCount);

			return this.buffers_[vertexBufferIndex];
		}


		indexBuffer() {
			// the index buffer, when present, is always the last one
			if (this.hasIndexBuffer)
				return this.buffers_[this.buffers_.length - 1];
			return null;
		}
	}

} // ns sd.render
