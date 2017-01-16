// world/meshrenderer - standard mesh renderer component
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	export interface RenderableDescriptor {
		materials: asset.Material[];
		castsShadows?: boolean;
		acceptsShadows?: boolean;
	}


	export class MeshRenderer {
		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private enabledBase_: Uint8Array;
		private shadowCastFlagsBase_: Uint8Array;
		private materialOffsetCountBase_: Int32Array;
		private primGroupOffsetBase_: Int32Array;

		private materialMgr_: PBRMaterialManager;
		private materials_: PBRMaterialInstance[];

		private primGroupData_: container.MultiArrayBuffer;
		private primGroupMaterialBase_: PBRMaterialArrayView;
		private primGroupFeatureBase_: ConstEnumArrayView<Features>;

		// -- for light uniform updates
		private shadowCastingLightIndex_: LightInstance = 0;

		// -- for temp calculations
		private modelViewMatrix_ = mat4.create();
		private modelViewProjectionMatrix_ = mat4.create();
		private normalMatrix_ = mat3.create();


		constructor(
			private rc: render.RenderContext,
			private transformMgr_: TransformManager,
			private meshMgr_: MeshManager,
			private lightMgr_: LightManager
		)
		{
			const instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: UInt8,  count: 1 }, // enabled
				{ type: UInt8,  count: 1 }, // shadowCastFlags
				{ type: SInt32, count: 1 }, // materialOffsetCount ([0]: offset, [1]: count)
				{ type: SInt32, count: 1 }, // primGroupOffset (offset into primGroupMaterials_ and primGroupFeatures_)
			];
			this.instanceData_ = new container.MultiArrayBuffer(1024, instFields);

			const groupFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // material
				{ type: SInt32, count: 1 }, // features
			];
			this.primGroupData_ = new container.MultiArrayBuffer(2048, groupFields);

			this.rebase();
			this.groupRebase();

			this.materials_ = [];
		}


		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.enabledBase_ = this.instanceData_.indexedFieldView(2);
			this.shadowCastFlagsBase_ = this.instanceData_.indexedFieldView(3);
			this.materialOffsetCountBase_ = this.instanceData_.indexedFieldView(4);
			this.primGroupOffsetBase_ = <Int32Array>this.instanceData_.indexedFieldView(5);
		}


		private groupRebase() {
			this.primGroupMaterialBase_ = this.primGroupData_.indexedFieldView(0);
			this.primGroupFeatureBase_ = this.primGroupData_.indexedFieldView(1);
		}


		private featuresForMeshAndMaterial(mesh: MeshInstance, material: PBRMaterialInstance): Features {
			let features = 0;

			const meshFeatures = this.meshMgr_.features(mesh);
			if (meshFeatures & MeshFeatures.VertexColours) { features |= Features.VtxColour; }
			if (meshFeatures & MeshFeatures.VertexUVs) { features |= Features.VtxUV; }

			const matFlags = this.materialMgr_.flags(material);
			if (matFlags & PBRMaterialFlags.Emissive) { features |= Features.Emissive; }

			if (this.materialMgr_.albedoMap(material)) {
				features |= Features.AlbedoMap;
			}

			if (this.materialMgr_.normalHeightMap(material)) {
				if (matFlags & PBRMaterialFlags.NormalMap) {
					features |= Features.NormalMap;
				}
				if (matFlags & PBRMaterialFlags.HeightMap) {
					features |= Features.HeightMap;
				}
			}

			if (this.materialMgr_.materialMap(material)) {
				if (matFlags & PBRMaterialFlags.RoughnessMap) {
					features |= Features.RoughnessMap;
				}
				if (matFlags & PBRMaterialFlags.MetallicMap) {
					features |= Features.MetallicMap;
				}
				if (matFlags & PBRMaterialFlags.AmbientOcclusionMap) {
					features |= Features.AOMap;
				}
			}

			return features;
		}


		private updatePrimGroups(modelIx: number) {
			const mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
			if (! mesh) {
				return;
			}
			const groups = this.meshMgr_.primitiveGroups(mesh);
			const materialsOffsetCount = container.copyIndexedVec2(this.materialOffsetCountBase_, modelIx);
			const materialsOffset = materialsOffsetCount[0];
			const materialCount = materialsOffsetCount[1];

			// -- check correctness of mesh against material list
			const maxLocalMatIndex = groups.reduce((cur, group) => Math.max(cur, group.materialIx), 0);
			assert(materialCount >= maxLocalMatIndex - 1, "not enough PBRMaterialIndexes for this mesh");

			// -- pre-calc global material indexes and program features for each group
			let primGroupCount = this.primGroupData_.count;
			this.primGroupOffsetBase_[modelIx] = this.primGroupData_.count;

			// -- grow primitiveGroup metadata buffer if necessary
			if (this.primGroupData_.resize(primGroupCount + groups.length) == container.InvalidatePointers.Yes) {
				this.groupRebase();
			}

			// -- append metadata for each primGroup
			groups.forEach(group => {
				this.primGroupFeatureBase_[primGroupCount] = this.featuresForMeshAndMaterial(mesh, this.materials_[materialsOffset + group.materialIx]);
				this.primGroupMaterialBase_[primGroupCount] = this.materials_[materialsOffset + group.materialIx];
				primGroupCount += 1;
			});
		}


		setRenderFeatureEnabled(feature: RenderFeature, enable: boolean) {
			let mask: Features = 0;

			if (feature == RenderFeature.AlbedoMaps) {
				mask |= Features.AlbedoMap;
			}
			else if (feature == RenderFeature.NormalMaps) {
				mask |= Features.NormalMap;
			}
			else if (feature == RenderFeature.HeightMaps) {
				mask |= Features.HeightMap;
			}
			else if (feature == RenderFeature.Emissive) {
				mask |= Features.Emissive;
			}

			if (enable) {
				this.pbrPipeline_.enableFeatures(mask);
			}
			else {
				this.pbrPipeline_.disableFeatures(mask);
			}
		}


		create(entity: Entity, desc: PBRModelDescriptor): PBRModelInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			const ix = this.instanceData_.count;

			this.entityBase_[ix] = <number>entity;
			this.transformBase_[ix] = <number>this.transformMgr_.forEntity(entity);
			this.enabledBase_[ix] = +true;
			this.shadowCastFlagsBase_[ix] = +(desc.castsShadows === undefined ? true : desc.castsShadows);

			// -- save material indexes
			container.setIndexedVec2(this.materialOffsetCountBase_, ix, [this.materials_.length, desc.materials.length]);
			for (const mat of desc.materials) {
				this.materials_.push(this.materialMgr_.create(mat));
			}

			this.updatePrimGroups(ix);

			return ix;
		}


		destroy(_inst: PBRModelInstance) {
			// TBI
		}


		destroyRange(range: PBRModelRange) {
			const iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}


		get count() {
			return this.instanceData_.count;
		}

		valid(inst: PBRModelInstance) {
			return <number>inst <= this.count;
		}

		all(): PBRModelRange {
			return new InstanceLinearRange<PBRModelManager>(1, this.count);
		}


		entity(inst: PBRModelInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: PBRModelInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}

		enabled(inst: PBRModelInstance): boolean {
			return this.enabledBase_[<number>inst] != 0;
		}

		setEnabled(inst: PBRModelInstance, newEnabled: boolean) {
			this.enabledBase_[<number>inst] = +newEnabled;
		}


		// FIXME: temp direct access to internal mat mgr
		materialRange(inst: PBRModelInstance): InstanceLinearRange<PBRMaterialManager> {
			const offsetCount = container.copyIndexedVec2(this.materialOffsetCountBase_, inst as number);
			const matFromIndex = this.materials_[offsetCount[0]];
			return new InstanceLinearRange<PBRMaterialManager>(matFromIndex, (matFromIndex as number) + offsetCount[1] - 1);
		}

		shadowCaster(): LightInstance {
			return this.shadowCastingLightIndex_;
		}

		setShadowCaster(inst: LightInstance) {
			this.shadowCastingLightIndex_ = inst;
		}


		private drawSingleShadow(rp: render.RenderPass, proj: ProjectionSetup, shadowPipeline: render.Pipeline, modelIx: number) {
			const gl = this.rc.gl;
			const program = shadowPipeline.program as ShadowProgram;
			const mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
			rp.setMesh(mesh);

			// -- calc MVP and set
			const modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
			mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
			mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, proj.viewMatrix);

			gl.uniformMatrix4fv(program.modelMatrixUniform, false, modelMatrix);
			gl.uniformMatrix4fv(program.lightViewMatrixUniform, false, proj.viewMatrix as Float32Array);
			gl.uniformMatrix4fv(program.lightViewProjectionMatrixUniform, false, this.modelViewProjectionMatrix_);

			// -- draw full mesh
			const uniformPrimType = this.meshMgr_.uniformPrimitiveType(mesh);
			if (uniformPrimType !== meshdata.PrimitiveType.None) {
				const totalElementCount = this.meshMgr_.totalElementCount(mesh);
				const indexElementType = this.meshMgr_.indexBufferElementType(mesh);
				if (indexElementType !== meshdata.IndexElementType.None) {
					rp.drawIndexedPrimitives(uniformPrimType, indexElementType, 0, totalElementCount);
				}
				else {
					rp.drawPrimitives(uniformPrimType, 0, totalElementCount);
				}
			}

			// -- drawcall count, always 1
			return 1;
		}


		private drawSingleForward(rp: render.RenderPass, proj: ProjectionSetup, shadow: ShadowView | null, lightingQuality: PBRLightingQuality, modelIx: number) {
			const gl = this.rc.gl;
			let drawCalls = 0;

			const mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);

			// -- calc transform matrices
			const modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
			mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
			mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewMatrix_);

			// -- draw all groups
			const meshPrimitiveGroups = this.meshMgr_.primitiveGroups(mesh);
			const primGroupBase = this.primGroupOffsetBase_[modelIx];
			const primGroupCount = meshPrimitiveGroups.length;

			for (let pgIx = 0; pgIx < primGroupCount; ++pgIx) {
				const primGroup = meshPrimitiveGroups[pgIx];
				const matInst: PBRMaterialInstance = this.primGroupMaterialBase_[primGroupBase + pgIx];
				const materialData = this.materialMgr_.getData(matInst);

				// -- features are a combo of Material features and optional shadow
				let features: Features = this.primGroupFeatureBase_[primGroupBase + pgIx];
				features |= lightingQuality << LightingQualityBitShift;
				if (shadow) {
					features |= Features.ShadowMap;
				}

				const pipeline = this.pbrPipeline_.pipelineForFeatures(features);
				rp.setPipeline(pipeline);
				rp.setMesh(mesh);

				// -- set transform and normal uniforms
				const program = <PBRGLProgram>(pipeline.program);

				// model, mvp and normal matrices are always present
				gl.uniformMatrix4fv(program.modelMatrixUniform, false, <Float32Array>modelMatrix);
				gl.uniformMatrix4fv(program.mvpMatrixUniform, false, this.modelViewProjectionMatrix_);
				mat3.normalFromMat4(this.normalMatrix_, this.modelViewMatrix_);
				gl.uniformMatrix3fv(program.normalMatrixUniform, false, this.normalMatrix_);

				if (program.mvMatrixUniform) {
					gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.modelViewMatrix_);
				}

				// -- set material uniforms
				gl.uniform4fv(program.baseColourUniform, materialData.colourData);
				gl.uniform4fv(program.materialUniform, materialData.materialParam);
				if (features & Features.Emissive) {
					gl.uniform4fv(program.emissiveDataUniform, materialData.emissiveData);
				}
				if (features & Features.VtxUV) {
					gl.uniform4fv(program.texScaleOffsetUniform, materialData.texScaleOffsetData);
				}

				// these texture arguments are assumed to exist if the feature flag is set
				// TODO: check every time?
				if (features & Features.AlbedoMap) {
					rp.setTexture(materialData.albedoMap!, TextureBindPoint.Albedo);
				}
				if (features & (Features.RoughnessMap | Features.MetallicMap | Features.AOMap)) {
					rp.setTexture(materialData.materialMap!, TextureBindPoint.Material);
				}
				if (features & Features.NormalMap) {
					rp.setTexture(materialData.normalHeightMap!, TextureBindPoint.NormalHeight);
				}

				// -- light data
				rp.setTexture(this.lightMgr_.lutTexture, TextureBindPoint.LightLUT);
				gl.uniform2fv(program.lightLUTParamUniform!, this.lightMgr_.lutParam);

				// -- shadow map and metadata
				if (shadow) {
					gl.uniform1i(program.shadowCastingLightIndexUniform, this.shadowCastingLightIndex_ as number);

					rp.setTexture(shadow.filteredTexture || shadow.shadowFBO.colourAttachmentTexture(0)!, TextureBindPoint.Shadow);

					// mat4.multiply(this.lightViewProjectionMatrix_, shadow.lightProjection.projectionMatrix, shadow.lightProjection.viewMatrix);
					// const lightBiasMat = mat4.multiply([], mat4.fromTranslation([], [.5, .5, .5]), mat4.fromScaling([], [.5, .5, .5]));
					// mat4.multiply(this.lightViewProjectionMatrix_, lightBiasMat, this.lightViewProjectionMatrix_);

					gl.uniformMatrix4fv(program.lightViewMatrixUniform!, false, shadow.lightProjection.viewMatrix as Float32Array);
					gl.uniformMatrix4fv(program.lightProjMatrixUniform!, false, shadow.lightProjection.projectionMatrix as Float32Array);
				}

				// -- draw
				const indexElementType = this.meshMgr_.indexBufferElementType(mesh);
				if (indexElementType !== meshdata.IndexElementType.None) {
					rp.drawIndexedPrimitives(primGroup.type, indexElementType, primGroup.fromElement, primGroup.elementCount);
				}
				else {
					rp.drawPrimitives(primGroup.type, primGroup.fromElement, primGroup.elementCount);
				}

				drawCalls += 1;
			}

			return drawCalls;
		}


		drawShadows(range: PBRModelRange, rp: render.RenderPass, proj: ProjectionSetup) {
			const shadowPipeline = this.pbrPipeline_.shadowPipeline();
			rp.setPipeline(shadowPipeline);

			const iter = range.makeIterator();
			while (iter.next()) {
				const index = iter.current as number;
				if (this.enabledBase_[index] && this.shadowCastFlagsBase_[index]) {
					this.drawSingleShadow(rp, proj, shadowPipeline, index);
				}
			}
		}

		draw(range: PBRModelRange, rp: render.RenderPass, proj: ProjectionSetup, shadow: ShadowView | null, lightingQuality: PBRLightingQuality, environmentMap: render.Texture) {
			if (! this.brdfLookupTex_) {
				return 0;
			}

			let drawCalls = 0;

			rp.setTexture(environmentMap, TextureBindPoint.Environment);
			rp.setTexture(this.brdfLookupTex_, TextureBindPoint.BRDFLookup);

			const iter = range.makeIterator();
			while (iter.next()) {
				drawCalls += this.drawSingleForward(rp, proj, shadow, lightingQuality, <number>iter.current);
			}

			return drawCalls;
		}
	}


} // ns sd.world