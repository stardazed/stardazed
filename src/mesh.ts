// mesh.ts - Mesh objects
// Part of Stardazed TX
// (c) 2015-6 by Arthur Langereis - @zenmumbler

/// <reference path="buffer.ts"/>
/// <reference path="rendercontext.ts"/>
/// <reference path="mesh-desc.ts"/>

namespace sd.render {

	function glTypeForIndexElementType(rc: RenderContext, iet: mesh.IndexElementType): number {
		switch (iet) {
			case mesh.IndexElementType.UInt8: return rc.gl.UNSIGNED_BYTE;
			case mesh.IndexElementType.UInt16: return rc.gl.UNSIGNED_SHORT;
			case mesh.IndexElementType.UInt32:
				return rc.ext32bitIndexes ? rc.gl.UNSIGNED_INT : rc.gl.NONE;

			default:
				assert(false, "Invalid IndexElementType");
				return rc.gl.NONE;
		}
	}


	export function glTypeForPrimitiveType(rc: RenderContext, pt: mesh.PrimitiveType) {
		switch (pt) {
			case mesh.PrimitiveType.Point: return rc.gl.POINTS;
			case mesh.PrimitiveType.Line: return rc.gl.LINES;
			case mesh.PrimitiveType.LineStrip: return rc.gl.LINE_STRIP;
			case mesh.PrimitiveType.Triangle: return rc.gl.TRIANGLES;
			case mesh.PrimitiveType.TriangleStrip: return rc.gl.TRIANGLE_STRIP;

			default:
				assert(false, "Invalid PrimitiveType")
				return rc.gl.NONE;
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


	interface AttributeLocation {
		attribute: mesh.PositionedAttribute;
		clientBuffer: mesh.VertexBuffer;
		buffer: Buffer;
	}


	export class Mesh {
		private pipelineVAOMap_: WeakMap<Pipeline, WebGLVertexArrayObjectOES> | null = null;
		private attributes_ = new Map<mesh.VertexAttributeRole, AttributeLocation>();
		private clientIndexBuffer_: mesh.IndexBuffer | null = null;

		private buffers_: Buffer[] = [];
		private primitiveGroups_: mesh.PrimitiveGroup[];
		private totalPrimitiveCount_ = 0;

		private primitiveType_: mesh.PrimitiveType;
		private glPrimitiveType_ = 0;
		private glIndexElementType_ = 0;
		private indexElementSizeBytes_ = 0;


		constructor(private rc: RenderContext, desc: MeshDescriptor) {
			if (rc.extVAO) {
				this.pipelineVAOMap_ = new WeakMap<Pipeline, WebGLVertexArrayObjectOES>();
			}

			for (var vertexBinding of desc.vertexBindings) {
				assert(vertexBinding.vertexBuffer);

				// -- allocate and fill attribute data buffer
				let buffer = new Buffer(rc, BufferRole.VertexAttribute, vertexBinding.updateFrequency);
				buffer.allocateWithContents(vertexBinding.vertexBuffer.buffer!); // TODO could be unallocated
				this.buffers_.push(buffer);

				// -- build role/attribute info map
				for (var aix = 0; aix < vertexBinding.vertexBuffer.attributeCount; ++aix) {
					var attr = vertexBinding.vertexBuffer.attrByIndex(aix)!;
					this.attributes_.set(attr.role, {
						attribute: attr,
						clientBuffer: vertexBinding.vertexBuffer,
						buffer: buffer
					});
				}
			}

			if (desc.indexBinding.indexBuffer) {
				// -- allocate sized index buffer
				var indexBuffer = new Buffer(rc, BufferRole.VertexIndex, desc.indexBinding.updateFrequency);
				indexBuffer.allocateWithContents(desc.indexBinding.indexBuffer.buffer!); // TODO could be unallocated
				this.buffers_.push(indexBuffer);
			
				// -- precompute some info required for draw calls
				this.primitiveType_ = desc.indexBinding.indexBuffer.primitiveType;
				this.glIndexElementType_ = glTypeForIndexElementType(rc, desc.indexBinding.indexBuffer.indexElementType);
				this.indexElementSizeBytes_ = desc.indexBinding.indexBuffer.indexElementSizeBytes;
			}
			else {
				// -- when no indexBuffer is specified, the explicit primitiveType from the descriptor is used
				assert(desc.primitiveType, "an explicit primitiveType must be specified if no indexBuffer is present");
				this.primitiveType_ = desc.primitiveType;
			}
			this.glPrimitiveType_ = glTypeForPrimitiveType(rc, this.primitiveType_);


			// -- copy primitive groups
			this.primitiveGroups_ = desc.primitiveGroups.map((pg) => {
				this.totalPrimitiveCount_ += pg.primCount;
				return cloneStruct(pg);
			});
			assert(this.primitiveGroups_.length > 0, "no primitive groups specified for Mesh");
		}


		private bindSingleAttribute(attr: mesh.PositionedAttribute, stride: number, toVAIndex: number) {
			var elementCount = mesh.vertexFieldElementCount(attr.field);
			var normalized = mesh.vertexFieldIsNormalized(attr.field);
			var glElementType = glTypeForVertexField(this.rc, attr.field);

			this.rc.gl.enableVertexAttribArray(toVAIndex);
			this.rc.gl.vertexAttribPointer(toVAIndex, elementCount, glElementType, normalized, stride, attr.offset);
		}


		bind(usingPipeline: Pipeline) {
			var plVAO: WebGLVertexArrayObjectOES | null = null;
			var needBinding = true;

			if (this.pipelineVAOMap_) {
				// -- If we're using VAOs then each mesh has a VAO per Pipeline it is
				// -- bound to. This approach is sadly necessary as attribute indexes
				// -- can differ for the same attributes for every Pipeline.
				// -- A GL with explicit attribute locations can avoid this by being
				// -- consistent with attribute indexes for attribute roles.
				plVAO = this.pipelineVAOMap_.get(usingPipeline);
				if (plVAO) {
					needBinding = false;
				}
				else {
					plVAO = this.rc.extVAO.createVertexArrayOES();
					this.pipelineVAOMap_.set(usingPipeline, plVAO);
				}

				this.rc.extVAO.bindVertexArrayOES(plVAO);
			}

			if (needBinding) {
				var roleIndexes = usingPipeline.attributePairs();
				var pair = roleIndexes.next();

				while (! pair.done) {
					var attrRole = pair.value![0];
					var attrIndex = pair.value![1];

					var meshAttr = this.attributes_.get(attrRole);
					if (meshAttr) {
						meshAttr.buffer.bind();
						this.bindSingleAttribute(meshAttr.attribute, meshAttr.clientBuffer.strideBytes, attrIndex);
					}
					else {
						console.warn("Mesh does not have Pipeline attr for index " + attrIndex + " of role " + attrRole);
						this.rc.gl.disableVertexAttribArray(attrIndex);
					}

					pair = roleIndexes.next();
				}

				if (this.hasIndexBuffer) {
					this.indexBuffer()!.bind();
				}
			}
		}


		unbind(fromPipeline: Pipeline) {
			if (this.pipelineVAOMap_) {
				this.rc.extVAO.bindVertexArrayOES(null);
			}
			else {
				// -- explicitly disable all attributes specified in the pipeline
				var roleIndexes = fromPipeline.attributePairs();
				var pair = roleIndexes.next();

				while (! pair.done) {
					var attrIndex = pair.value![1];
					this.rc.gl.disableVertexAttribArray(attrIndex);
					pair = roleIndexes.next();
				}
			}
		}


		// -- observers
		hasAttributeOfRole(role: mesh.VertexAttributeRole) { return this.attributes_.has(role); }
		get hasIndexBuffer() { return this.glIndexElementType_ != 0; }

		get primitiveType() { return this.primitiveType_; }
		get glPrimitiveType() { return this.glPrimitiveType_; }
		get primitiveGroups() { return this.primitiveGroups_; }
		get totalPrimitiveCount() { return this.totalPrimitiveCount_; }

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
			// the index buffer, if present, is always the last one
			if (this.hasIndexBuffer)
				return this.buffers_[this.buffers_.length - 1];
			return null;
		}
	}

} // ns sd.render
