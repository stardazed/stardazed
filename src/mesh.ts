// mesh.ts - Mesh objects
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="buffer.ts"/>
/// <reference path="rendercontext.ts"/>
/// <reference path="mesh-desc.ts"/>

namespace sd.render {

	function glTypeForIndexElementType(rc: RenderContext, iet: meshdata.IndexElementType): number {
		switch (iet) {
			case meshdata.IndexElementType.UInt8: return rc.gl.UNSIGNED_BYTE;
			case meshdata.IndexElementType.UInt16: return rc.gl.UNSIGNED_SHORT;
			case meshdata.IndexElementType.UInt32:
				return rc.ext32bitIndexes ? rc.gl.UNSIGNED_INT : rc.gl.NONE;

			default:
				assert(false, "Invalid IndexElementType");
				return rc.gl.NONE;
		}
	}


	function glTypeForPrimitiveType(rc: RenderContext, pt: meshdata.PrimitiveType) {
		switch (pt) {
			case meshdata.PrimitiveType.Point: return rc.gl.POINTS;
			case meshdata.PrimitiveType.Line: return rc.gl.LINES;
			case meshdata.PrimitiveType.LineStrip: return rc.gl.LINE_STRIP;
			case meshdata.PrimitiveType.Triangle: return rc.gl.TRIANGLES;
			case meshdata.PrimitiveType.TriangleStrip: return rc.gl.TRIANGLE_STRIP;

			default:
				assert(false, "Invalid PrimitiveType")
				return rc.gl.NONE;
		}
	}


	function glTypeForVertexField(rc: RenderContext, vf: meshdata.VertexField) {
		switch (vf) {
			case meshdata.VertexField.Float:
			case meshdata.VertexField.Floatx2:
			case meshdata.VertexField.Floatx3:
			case meshdata.VertexField.Floatx4:
				return rc.gl.FLOAT;

			case meshdata.VertexField.UInt32:
			case meshdata.VertexField.UInt32x2:
			case meshdata.VertexField.UInt32x3:
			case meshdata.VertexField.UInt32x4:
				return rc.gl.UNSIGNED_INT;

			case meshdata.VertexField.SInt32:
			case meshdata.VertexField.SInt32x2:
			case meshdata.VertexField.SInt32x3:
			case meshdata.VertexField.SInt32x4:
				return rc.gl.INT;

			case meshdata.VertexField.UInt16x2:
			case meshdata.VertexField.Norm_UInt16x2:
			case meshdata.VertexField.UInt16x3:
			case meshdata.VertexField.Norm_UInt16x3:
			case meshdata.VertexField.UInt16x4:
			case meshdata.VertexField.Norm_UInt16x4:
				return rc.gl.UNSIGNED_SHORT;

			case meshdata.VertexField.SInt16x2:
			case meshdata.VertexField.Norm_SInt16x2:
			case meshdata.VertexField.SInt16x3:
			case meshdata.VertexField.Norm_SInt16x3:
			case meshdata.VertexField.SInt16x4:
			case meshdata.VertexField.Norm_SInt16x4:
				return rc.gl.SHORT;

			case meshdata.VertexField.UInt8x2:
			case meshdata.VertexField.Norm_UInt8x2:
			case meshdata.VertexField.UInt8x3:
			case meshdata.VertexField.Norm_UInt8x3:
			case meshdata.VertexField.UInt8x4:
			case meshdata.VertexField.Norm_UInt8x4:
				return rc.gl.UNSIGNED_BYTE;

			case meshdata.VertexField.SInt8x2:
			case meshdata.VertexField.Norm_SInt8x2:
			case meshdata.VertexField.SInt8x3:
			case meshdata.VertexField.Norm_SInt8x3:
			case meshdata.VertexField.SInt8x4:
			case meshdata.VertexField.Norm_SInt8x4:
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
		attribute: meshdata.PositionedAttribute;
		clientBuffer: meshdata.VertexBuffer;
		buffer: Buffer;
	}


	export class Mesh {
		private pipelineVAOMap_: WeakMap<Pipeline, WebGLVertexArrayObjectOES> | null = null;
		private attributes_ = new Map<meshdata.VertexAttributeRole, AttributeLocation>();

		private buffers_: Buffer[] = [];
		private primitiveGroups_: meshdata.PrimitiveGroup[];
		private totalPrimitiveCount_ = 0;

		private primitiveType_: meshdata.PrimitiveType;
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
				buffer.allocateWithContents(vertexBinding.vertexBuffer.bufferView()!); // TODO could be unallocated
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
				indexBuffer.allocateWithContents(desc.indexBinding.indexBuffer.bufferView()!); // TODO could be unallocated
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


		private bindSingleAttribute(attr: meshdata.PositionedAttribute, stride: number, toVAIndex: number) {
			var elementCount = meshdata.vertexFieldElementCount(attr.field);
			var normalized = meshdata.vertexFieldIsNormalized(attr.field);
			var glElementType = glTypeForVertexField(this.rc, attr.field);

			this.rc.gl.enableVertexAttribArray(toVAIndex);
			this.rc.gl.vertexAttribPointer(toVAIndex, elementCount, glElementType, normalized, stride, attr.offset);
		}


		bind(usingPipeline: Pipeline) {
			var plVAO: WebGLVertexArrayObjectOES | undefined;
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
		hasAttributeOfRole(role: meshdata.VertexAttributeRole) { return this.attributes_.has(role); }
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
