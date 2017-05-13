// entity/meshrenderer - standard mesh renderer component
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.entity {

	export type MeshRendererInstance = Instance<MeshRendererComponent>;
	export type MeshRendererRange = InstanceRange<MeshRendererComponent>;
	export type MeshRendererSet = InstanceSet<MeshRendererComponent>;
	export type MeshRendererIterator = InstanceIterator<MeshRendererComponent>;
	export type MeshRendererArrayView = InstanceArrayView<MeshRendererComponent>;

	export interface MeshRendererDescriptor {
		mesh: meshdata.MeshData;
		materials: number[];
		castsShadows?: boolean;
		acceptsShadows?: boolean;
	}

	export class MeshRendererComponent implements Component<MeshRendererComponent> {
		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private enabledBase_: Uint8Array;
		private shadowCastFlagsBase_: Uint8Array;
		private materialOffsetCountBase_: Int32Array;
		private primGroupOffsetBase_: Int32Array;

		private meshes_: meshdata.MeshData[];
		private materials_: number[];

		private primGroupData_: container.MultiArrayBuffer;
		private primGroupMaterialBase_: Int32Array;
		private primGroupFeatureBase_: ConstEnumArrayView<number>;


		constructor(_rd: render.RenderDevice, private transformComp_: TransformComponent) {
			const instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: UInt8,  count: 1 }, // enabled
				{ type: UInt8,  count: 1 }, // shadowCastFlags
				{ type: SInt32, count: 2 }, // materialOffsetCount ([0]: offset, [1]: count)
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
			this.meshes_ = [];
		}

		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.enabledBase_ = this.instanceData_.indexedFieldView(2);
			this.shadowCastFlagsBase_ = this.instanceData_.indexedFieldView(3);
			this.materialOffsetCountBase_ = this.instanceData_.indexedFieldView(4);
			this.primGroupOffsetBase_ = this.instanceData_.indexedFieldView(5);
		}

		private groupRebase() {
			this.primGroupMaterialBase_ = this.primGroupData_.indexedFieldView(0);
			this.primGroupFeatureBase_ = this.primGroupData_.indexedFieldView(1);
		}


		private updatePrimGroups(modelIx: number) {
			const mesh = this.meshes_[modelIx];
			const subMeshes = mesh.subMeshes;
			const materialsOffsetCount = container.copyIndexedVec2(this.materialOffsetCountBase_, modelIx);
			// const materialsOffset = materialsOffsetCount[0];
			const materialCount = materialsOffsetCount[1];

			// -- check correctness of mesh against material list
			const maxLocalMatIndex = subMeshes.reduce((cur, group) => Math.max(cur, group.materialIx), 0);
			assert(materialCount >= maxLocalMatIndex - 1, "not enough PBRMaterialIndexes for this mesh");

			// -- pre-calc global material indexes and program features for each group
			let primGroupCount = this.primGroupData_.count;
			this.primGroupOffsetBase_[modelIx] = this.primGroupData_.count;

			// -- grow primitiveGroup metadata buffer if necessary
			if (this.primGroupData_.resize(primGroupCount + subMeshes.length) === container.InvalidatePointers.Yes) {
				this.groupRebase();
			}

			// -- append metadata for each primGroup
			subMeshes.forEach(_group => {
				this.primGroupFeatureBase_[primGroupCount] = 0; // this.featuresForMeshAndMaterial(mesh, this.materials_[materialsOffset + group.materialIx]);
				this.primGroupMaterialBase_[primGroupCount] = 0; // this.materials_[materialsOffset + group.materialIx];
				primGroupCount += 1;
			});
		}


		create(entity: Entity, desc: MeshRendererDescriptor): MeshRendererInstance {
			if (this.instanceData_.extend() === container.InvalidatePointers.Yes) {
				this.rebase();
			}
			const ix = this.instanceData_.count;

			this.entityBase_[ix] = entity as number;
			this.transformBase_[ix] = this.transformComp_.forEntity(entity) as number;
			this.enabledBase_[ix] = +true;
			this.shadowCastFlagsBase_[ix] = +(desc.castsShadows === undefined ? true : desc.castsShadows);

			// -- save material indexes
			container.setIndexedVec2(this.materialOffsetCountBase_, ix, [this.materials_.length, desc.materials.length]);
			for (const mat of desc.materials) {
				this.materials_.push(mat);
			}

			this.updatePrimGroups(ix);

			return ix;
		}

		destroy(_inst: MeshRendererInstance) {
			// TBI
		}

		destroyRange(range: MeshRendererRange) {
			const iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}

		get count() {
			return this.instanceData_.count;
		}

		valid(inst: MeshRendererInstance) {
			return inst <= this.count;
		}

		all(): MeshRendererRange {
			return new InstanceLinearRange<MeshRendererComponent>(1, this.count);
		}

		// -- supply cmdbuf with renderjobs
		render(range: MeshRendererRange, pass: render.RenderPass) {
			const iter = range.makeIterator();
			while (iter.next()) {
				pass.render({} as render.RenderJob, 0);
			}
		}

		// -- single instance accessors
		entity(inst: MeshRendererInstance): Entity {
			return this.entityBase_[inst as number];
		}

		transform(inst: MeshRendererInstance): TransformInstance {
			return this.transformBase_[inst as number];
		}

		enabled(inst: MeshRendererInstance): boolean {
			return this.enabledBase_[inst as number] !== 0;
		}

		setEnabled(inst: MeshRendererInstance, newEnabled: boolean) {
			this.enabledBase_[inst as number] = +newEnabled;
		}
	}

} // ns sd.world
