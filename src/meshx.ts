// meshx.ts - Mesh component
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="buffer.ts"/>
/// <reference path="rendercontext.ts"/>
/// <reference path="mesh-desc.ts"/>

namespace sd.world {

	function glTypeForIndexElementType(rc: render.RenderContext, iet: meshdata.IndexElementType): number {
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


	function glTypeForPrimitiveType(rc: render.RenderContext, pt: meshdata.PrimitiveType) {
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


	function glTypeForVertexField(rc: render.RenderContext, vf: meshdata.VertexField) {
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

	function maxVertexAttributes(rc: render.RenderContext) {
		if (meshLimits.maxVertexAttributes == 0) {
			meshLimits.maxVertexAttributes = rc.gl.getParameter(rc.gl.MAX_VERTEX_ATTRIBS);
		}

		return meshLimits.maxVertexAttributes;
	}


	export const enum MeshFeatures {
		VertexPositions = 1,
		VertexNormals = 2,
		VertexTangents = 4,
		VertexUVs = 8,
		VertexColours = 16,
		VertexWeights = 32,
		Indexes = 64
	}


	export interface MeshAttributeData {
		buffer: WebGLBuffer;
		vertexField: meshdata.VertexField;
		offset: number;
		stride: number;
	}


	//  __  __        _    __  __                             
	// |  \/  |___ __| |_ |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// | |\/| / -_|_-< ' \| |\/| / _` | ' \/ _` / _` / -_) '_|
	// |_|  |_\___/__/_||_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                          |___/         

	export type MeshInstance = Instance<MeshManager>;
	export type MeshRange = InstanceRange<MeshManager>;
	export type MeshSet = InstanceSet<MeshManager>;
	export type MeshIterator = InstanceIterator<MeshManager>;
	export type MeshArrayView = InstanceArrayView<MeshManager>;


	export class MeshManager implements ComponentManager<MeshManager> {
		private instanceData_: container.MultiArrayBuffer;
		private featuresBase_: ConstEnumArrayView<MeshFeatures>;
		private primitiveTypeBase_: ConstEnumArrayView<meshdata.PrimitiveType>;
		private glPrimitiveTypeBase_: Int32Array;
		private totalPrimitiveCountBase_: Int32Array;
		private glIndexElementTypeBase_: Int32Array;
		private indexElementSizeBytesBase_: Int32Array;
		private buffersOffsetCountBase_: Int32Array;
		private attrsOffsetCountBase_: Int32Array;
		private primGroupsOffsetCountBase_: Int32Array;

		private bufGLBuffers_: (WebGLBuffer | null)[];

		private attributeData_: container.MultiArrayBuffer;
		private attrRoleBase_: ConstEnumArrayView<meshdata.VertexAttributeRole>;
		private attrBufferIndexBase_: Int32Array;
		private attrVertexFieldBase_: ConstEnumArrayView<meshdata.VertexField>;
		private attrFieldOffsetBase_: Int32Array;
		private attrStrideBase_: Int32Array;

		private primGroupData_: container.MultiArrayBuffer;
		private pgFromPrimIxBase_: Int32Array;
		private pgPrimCountBase_: Int32Array;
		private pgMaterialBase_: Int32Array;

		private pipelineVAOMaps_: WeakMap<render.Pipeline, WebGLVertexArrayObjectOES>[] | null = null;
		private entityMap_: Map<Entity, MeshInstance>;


		constructor(private rctx_: render.RenderContext) {
			var instanceFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // features
				{ type: SInt32, count: 1 }, // primitiveType
				{ type: SInt32, count: 1 }, // glPrimitiveType
				{ type: SInt32, count: 1 }, // totalPrimitiveCount
				{ type: SInt32, count: 1 }, // glIndexElementType
				{ type: SInt32, count: 1 }, // glIndexElementSizeBytes
				{ type: SInt32, count: 2 }, // buffersOffsetCount ([0]: offset, [1]: count)
				{ type: SInt32, count: 2 }, // attrsOffsetCount ([0]: offset, [1]: count)
				{ type: SInt32, count: 2 }, // primGroupsOffsetCount ([0]: offset, [1]: count)
			];
			this.instanceData_ = new container.MultiArrayBuffer(1024, instanceFields);
			this.rebaseInstances();

			var attrFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // role
				{ type: SInt32, count: 1 }, // bufferIndex
				{ type: SInt32, count: 1 }, // vertexField
				{ type: SInt32, count: 1 }, // fieldOffset
				{ type: SInt32, count: 1 }, // stride
			];
			this.attributeData_ = new container.MultiArrayBuffer(4096, attrFields);
			this.rebaseAttributes();

			var pgFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // fromPrimIx
				{ type: SInt32, count: 1 }, // primCount
				{ type: SInt32, count: 1 }, // materialIx - mesh-local zero-based material indexes
			];
			this.primGroupData_ = new container.MultiArrayBuffer(4096, pgFields);
			this.rebasePrimGroups();

			this.bufGLBuffers_ = [];

			this.entityMap_ = new Map<Entity, MeshInstance>();

			if (rctx_.extVAO) {
				this.pipelineVAOMaps_ = [];
			}
		}


		rebaseInstances() {
			this.featuresBase_ = this.instanceData_.indexedFieldView(0);
			this.primitiveTypeBase_ = this.instanceData_.indexedFieldView(1);
			this.glPrimitiveTypeBase_ = this.instanceData_.indexedFieldView(2);
			this.totalPrimitiveCountBase_ = this.instanceData_.indexedFieldView(3);
			this.glIndexElementTypeBase_ = this.instanceData_.indexedFieldView(4);
			this.indexElementSizeBytesBase_ = this.instanceData_.indexedFieldView(5);
			this.buffersOffsetCountBase_ = this.instanceData_.indexedFieldView(6);
			this.attrsOffsetCountBase_ = this.instanceData_.indexedFieldView(7);
			this.primGroupsOffsetCountBase_ = this.instanceData_.indexedFieldView(8);
		}


		rebaseAttributes() {
			this.attrRoleBase_ = this.attributeData_.indexedFieldView(0);
			this.attrBufferIndexBase_ = this.attributeData_.indexedFieldView(1);
			this.attrVertexFieldBase_ = this.attributeData_.indexedFieldView(2);
			this.attrFieldOffsetBase_ = this.attributeData_.indexedFieldView(3);
			this.attrStrideBase_ = this.attributeData_.indexedFieldView(4);
		}


		rebasePrimGroups() {
			this.pgFromPrimIxBase_ = this.primGroupData_.indexedFieldView(0);
			this.pgPrimCountBase_ = this.primGroupData_.indexedFieldView(1);
			this.pgMaterialBase_ = this.primGroupData_.indexedFieldView(2);
		}


		create(meshData: meshdata.MeshData): MeshInstance {
			const gl = this.rctx_.gl;

			// -- ensure space in instance and dependent arrays
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebaseInstances();
			}
			const instance = this.instanceData_.count;

			var meshFeatures: MeshFeatures = 0;

			const bufferCount = meshData.vertexBuffers.length + (meshData.indexBuffer !== null ? 1 : 0);
			var bufferIndex = this.bufGLBuffers_.length;
			container.setIndexedVec2(this.buffersOffsetCountBase_, instance, [bufferIndex, bufferCount]);

			const attrCount = meshData.vertexBuffers.map(vb => vb.attributeCount).reduce((sum, vbac) => sum + vbac, 0);
			var attrIndex = this.attributeData_.count;
			if (this.attributeData_.resize(attrIndex + attrCount) === container.InvalidatePointers.Yes) {
				this.rebaseAttributes();
			}
			container.setIndexedVec2(this.attrsOffsetCountBase_, instance, [attrIndex, attrCount]);

			// -- allocate gpu vertex buffers and cache attribute mappings for fast binding
			for (var vertexBuffer of meshData.vertexBuffers) {
				let glBuf = gl.createBuffer(); // FIXME: could fail
				gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
				gl.bufferData(gl.ARRAY_BUFFER, vertexBuffer.bufferView()!, gl.STATIC_DRAW); // FIXME: bufferView could be null
				this.bufGLBuffers_[bufferIndex] = glBuf;

				// -- build attribute info map
				for (let aix = 0; aix < vertexBuffer.attributeCount; ++aix) {
					let attr = vertexBuffer.attrByIndex(aix)!;

					this.attrRoleBase_[attrIndex] = attr.role;
					this.attrBufferIndexBase_[attrIndex] = bufferIndex;
					this.attrVertexFieldBase_[attrIndex] = attr.field;
					this.attrFieldOffsetBase_[attrIndex] = attr.offset;
					this.attrStrideBase_[attrIndex] = vertexBuffer.strideBytes;

					// set the appropriate mesh feature flag based on the attribute role
					switch (attr.role) {
						case meshdata.VertexAttributeRole.Position: meshFeatures |= MeshFeatures.VertexPositions; break;
						case meshdata.VertexAttributeRole.Normal: meshFeatures |= MeshFeatures.VertexNormals; break;
						case meshdata.VertexAttributeRole.Tangent: meshFeatures |= MeshFeatures.VertexTangents; break;
						case meshdata.VertexAttributeRole.UV0: meshFeatures |= MeshFeatures.VertexUVs; break; // UV1,2,3 can only occur alongside UV0
						case meshdata.VertexAttributeRole.Colour: meshFeatures |= MeshFeatures.VertexColours; break;
						case meshdata.VertexAttributeRole.WeightedPos0: meshFeatures |= MeshFeatures.VertexWeights; break;
						default: break;
					}

					attrIndex += 1;
				}

				bufferIndex += 1;
			}

			// -- allocate gpu index buffer if present and cache some index info as it is accessed frequently
			if (meshData.indexBuffer) {
				let glBuf = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glBuf);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshData.indexBuffer.bufferView()!, gl.STATIC_DRAW); // FIXME: bufferView could be null
				this.bufGLBuffers_[bufferIndex] = glBuf;
			
				this.primitiveTypeBase_[instance] = meshData.indexBuffer.primitiveType;
				this.glIndexElementTypeBase_[instance] = glTypeForIndexElementType(this.rctx_, meshData.indexBuffer.indexElementType);
				this.indexElementSizeBytesBase_[instance] = meshData.indexBuffer.indexElementSizeBytes;

				meshFeatures |= MeshFeatures.Indexes;

				bufferIndex += 1;
			}
			else {
				this.primitiveTypeBase_[instance] = meshdata.PrimitiveType.Triangle;
			}

			this.glPrimitiveTypeBase_[instance] = glTypeForPrimitiveType(this.rctx_, this.primitiveTypeBase_[instance]);


			// -- cache primitive groups and metadata
			const primGroupCount = meshData.primitiveGroups.length;
			assert(primGroupCount > 0, "No primitive groups present in meshData");
			var primGroupIndex = this.primGroupData_.count;
			if (this.primGroupData_.resize(primGroupIndex + primGroupCount) === container.InvalidatePointers.Yes) {
				this.rebasePrimGroups();
			}
			container.setIndexedVec2(this.primGroupsOffsetCountBase_, instance, [primGroupIndex, primGroupCount]);

			var totalPrimitiveCount = 0;
			for (let pg of meshData.primitiveGroups) {
				this.pgFromPrimIxBase_[primGroupIndex] = pg.fromPrimIx;
				this.pgPrimCountBase_[primGroupIndex] = pg.primCount;
				this.pgMaterialBase_[primGroupIndex] = pg.materialIx;

				totalPrimitiveCount += pg.primCount;
				primGroupIndex += 1;
			}

			// -- store mesh features accumulated during the creation process
			this.totalPrimitiveCountBase_[instance] = totalPrimitiveCount;
			this.featuresBase_[instance] = meshFeatures;

			// -- we weakly link Pipelines to VAO mappings per mesh, see bind()
			if (this.pipelineVAOMaps_) {
				this.pipelineVAOMaps_[instance] = new WeakMap<render.Pipeline, WebGLVertexArrayObjectOES>();
			}

			return instance;
		}


		linkToEntity(inst: MeshInstance, ent: Entity) {
			this.entityMap_.set(ent, inst);
		}

		removeFromEntity(inst: MeshInstance, ent: Entity) {
			this.entityMap_.delete(ent);
		}

		forEntity(ent: Entity): MeshInstance {
			return this.entityMap_.get(ent) || 0;
		}


		destroy(inst: MeshInstance) {
			// TODO: remove mesh from all instances (add a reverse map->entities map?)
			// TODO: zero+free all array segments
		}


		destroyRange(range: MeshRange) {
			var iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}


		get count() { return this.instanceData_.count; }

		valid(inst: MeshInstance) {
			return <number>inst <= this.count;
		}

		all(): MeshRange {
			return new InstanceLinearRange<MeshManager>(1, this.count);
		}


		// -- binding

		private bindSingleAttribute(attr: MeshAttributeData, toVAIndex: number) {
			var elementCount = meshdata.vertexFieldElementCount(attr.vertexField);
			var normalized = meshdata.vertexFieldIsNormalized(attr.vertexField);
			var glElementType = glTypeForVertexField(this.rctx_, attr.vertexField);

			this.rctx_.gl.enableVertexAttribArray(toVAIndex);
			this.rctx_.gl.vertexAttribPointer(toVAIndex, elementCount, glElementType, normalized, attr.stride, attr.offset);
		}


		bind(inst: MeshInstance, toPipeline: render.Pipeline) {
			const meshIx = <number>inst;
			const gl = this.rctx_.gl;
			var plVAO: WebGLVertexArrayObjectOES | undefined;
			var needBinding = true;

			if (this.pipelineVAOMaps_) {
				// If we're using VAOs then each mesh has a VAO per Pipeline it is bound to.
				// This approach is sadly necessary as attribute indexes can differ for the same attributes for every Pipeline.
				// gl.bindAttribLocation can be used to bind named attributes but different shaders would have to still specify
				// a list of all their attributes and desired bind points, here we then have to detect a shader type and create
				// one VAO per separate shader, maybe later.
				plVAO = this.pipelineVAOMaps_[meshIx].get(toPipeline);
				if (plVAO) {
					needBinding = false;
				}
				else {
					plVAO = this.rctx_.extVAO.createVertexArrayOES();
					this.pipelineVAOMaps_[meshIx].set(toPipeline, plVAO);
				}

				this.rctx_.extVAO.bindVertexArrayOES(plVAO || null);
			}

			if (needBinding) {
				let roleIndexes = toPipeline.attributePairs();
				let pair = roleIndexes.next();
				let attributes = this.attributes(inst);

				while (! pair.done) {
					var attrRole = pair.value![0];
					var attrIndex = pair.value![1];

					var meshAttr = attributes.get(attrRole);
					if (meshAttr) {
						gl.bindBuffer(gl.ARRAY_BUFFER, meshAttr.buffer);
						this.bindSingleAttribute(meshAttr, attrIndex);
					}
					else {
						console.warn("Mesh does not have Pipeline attr for index " + attrIndex + " of role " + attrRole);
						gl.disableVertexAttribArray(attrIndex);
					}

					pair = roleIndexes.next();
				}

				if (this.featuresBase_[meshIx] & MeshFeatures.Indexes) {
					// the index buffer, when present, is the last buffer in the list
					const bufOC = container.copyIndexedVec2(this.buffersOffsetCountBase_, meshIx);
					const indexBuffer = this.bufGLBuffers_[bufOC[0] + bufOC[1] - 1];
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

					// DEBUG
					const bufferSize = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE);
					const expectedBufferSize = this.indexElementSizeBytesBase_[meshIx] * meshdata.indexCountForPrimitiveCount(this.primitiveTypeBase_[meshIx], this.totalPrimitiveCountBase_[meshIx]);
					if (bufferSize < expectedBufferSize) {
						debugger;
					}
				}
			}
		}


		unbind(_inst: MeshInstance, fromPipeline: render.Pipeline) {
			if (this.pipelineVAOMaps_) {
				this.rctx_.extVAO.bindVertexArrayOES(null);
			}
			else {
				// -- explicitly disable all attributes specified in the pipeline
				const gl = this.rctx_.gl;
				var roleIndexes = fromPipeline.attributePairs();
				var pair = roleIndexes.next();

				while (! pair.done) {
					var attrIndex = pair.value![1];
					gl.disableVertexAttribArray(attrIndex);
					pair = roleIndexes.next();
				}

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
			}
		}


		// -- single instance getters

		attributes(inst: MeshInstance): Map<meshdata.VertexAttributeRole, MeshAttributeData> {
			const attrs = new Map<meshdata.VertexAttributeRole, MeshAttributeData>();
			const meshIx = <number>inst;
			const offsetCount = container.copyIndexedVec2(this.attrsOffsetCountBase_, meshIx);

			for (let aix = 0; aix < offsetCount[1]; ++aix) {
				let attrOffset = aix + offsetCount[0];

				attrs.set(this.attrRoleBase_[attrOffset], {
					buffer: this.bufGLBuffers_[this.attrBufferIndexBase_[attrOffset]]!,
					vertexField: this.attrVertexFieldBase_[attrOffset],
					offset: this.attrFieldOffsetBase_[attrOffset],
					stride: this.attrStrideBase_[attrOffset]
				});
			}

			return attrs;
		}


		primitiveGroups(inst: MeshInstance) {
			const primGroups: meshdata.PrimitiveGroup[] = [];
			const meshIx = <number>inst;
			const offsetCount = container.copyIndexedVec2(this.primGroupsOffsetCountBase_, meshIx);

			for (let pgix = 0; pgix < offsetCount[1]; ++pgix) {
				const pgOffset = pgix + offsetCount[0];

				primGroups.push({
					fromPrimIx: this.pgFromPrimIxBase_[pgOffset],
					primCount: this.pgPrimCountBase_[pgOffset],
					materialIx: this.pgMaterialBase_[pgOffset]
				});
			}
			return primGroups;
		}


		features(inst: MeshInstance): MeshFeatures { return this.featuresBase_[<number>inst]; }

		primitiveType(inst: MeshInstance) { return this.primitiveTypeBase_[<number>inst]; }
		glPrimitiveType(inst: MeshInstance) { return this.glPrimitiveTypeBase_[<number>inst]; }
		totalPrimitiveCount(inst: MeshInstance) { return this.totalPrimitiveCountBase_[<number>inst]; }

		glIndexElementType(inst: MeshInstance) { return this.glIndexElementTypeBase_[<number>inst]; }
		indexElementSizeBytes(inst: MeshInstance) { return this.indexElementSizeBytesBase_[<number>inst]; }
	}

} // ns sd.world
