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
	}

} // ns sd.world
