// render/gl1/texture - WebGL1 implementation of textures
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {
/*
	function gl1TypeForVertexField(rc: render.GL1RenderDevice, vf: meshdata.VertexField) {
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


	function gl1CreateVertexBuffer(vb: meshdata.VertexBuffer) {
		
	}


	function create(mesh: asset.Mesh): MeshInstance {
		if (this.assetMeshMap_.has(mesh)) {
			return this.assetMeshMap_.get(mesh)!;
		}
		const meshData = mesh.meshData;
		const gl = this.rctx_.gl;

		// -- ensure space in instance and dependent arrays
		if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
			this.rebaseInstances();
		}
		const instance = this.instanceData_.count;

		let meshFeatures: MeshFeatures = 0;

		const bufferCount = meshData.vertexBuffers.length + (meshData.indexBuffer !== null ? 1 : 0);
		let bufferIndex = this.bufGLBuffers_.length;
		container.setIndexedVec2(this.buffersOffsetCountBase_, instance, [bufferIndex, bufferCount]);

		const attrCount = meshData.vertexBuffers.map(vb => vb.attributeCount).reduce((sum, vbac) => sum + vbac, 0);
		let attrIndex = this.attributeData_.count;
		if (this.attributeData_.resize(attrIndex + attrCount) === container.InvalidatePointers.Yes) {
			this.rebaseAttributes();
		}
		container.setIndexedVec2(this.attrsOffsetCountBase_, instance, [attrIndex, attrCount]);

		// -- allocate gpu vertex buffers and cache attribute mappings for fast binding
		for (const vertexBuffer of meshData.vertexBuffers) {
			const glBuf = gl.createBuffer(); // FIXME: could fail
			gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
			gl.bufferData(gl.ARRAY_BUFFER, vertexBuffer.bufferView()!, gl.STATIC_DRAW); // FIXME: bufferView could be null
			this.bufGLBuffers_[bufferIndex] = glBuf;

			// -- build attribute info map
			for (let aix = 0; aix < vertexBuffer.attributeCount; ++aix) {
				const attr = vertexBuffer.attrByIndex(aix)!;

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
			const glBuf = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glBuf);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshData.indexBuffer.bufferView()!, gl.STATIC_DRAW); // FIXME: bufferView could be null
			this.bufGLBuffers_[bufferIndex] = glBuf;

			meshFeatures |= MeshFeatures.Indexes;
			this.indexElementTypeBase_[instance] = meshData.indexBuffer.indexElementType;

			bufferIndex += 1;
		}
		else {
			this.indexElementTypeBase_[instance] = meshdata.IndexElementType.None;
		}


		// -- cache primitive groups and metadata
		const primGroupCount = meshData.primitiveGroups.length;
		assert(primGroupCount > 0, "No primitive groups present in meshData");
		let primGroupIndex = this.primGroupData_.count;
		if (this.primGroupData_.resize(primGroupIndex + primGroupCount) === container.InvalidatePointers.Yes) {
			this.rebasePrimGroups();
		}
		container.setIndexedVec2(this.primGroupsOffsetCountBase_, instance, [primGroupIndex, primGroupCount]);

		let totalElementCount = 0;
		let sharedPrimType = meshData.primitiveGroups[0].type;

		for (const pg of meshData.primitiveGroups) {
			this.pgPrimTypeBase_[primGroupIndex] = pg.type;
			this.pgFromElementBase_[primGroupIndex] = pg.fromElement;
			this.pgElementCountBase_[primGroupIndex] = pg.elementCount;
			this.pgMaterialBase_[primGroupIndex] = pg.materialIx;

			totalElementCount += pg.elementCount;
			if (pg.type !== sharedPrimType) {
				sharedPrimType = meshdata.PrimitiveType.None;
			}
			primGroupIndex += 1;
		}

		// -- store mesh features accumulated during the creation process
		this.featuresBase_[instance] = meshFeatures;
		this.uniformPrimTypeBase_[instance] = sharedPrimType;
		this.totalElementCountBase_[instance] = totalElementCount;

		// -- we weakly link Pipelines to VAO mappings per mesh, see bind()
		if (this.pipelineVAOMaps_) {
			this.pipelineVAOMaps_[instance] = new WeakMap<render.Pipeline, WebGLVertexArrayObjectOES>();
		}

		// -- remember that we've already instantiated this asset
		this.assetMeshMap_.set(mesh, instance);

		return instance;
	}
*/
} // ns sd.render.gl1
