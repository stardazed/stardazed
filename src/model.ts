// model - model component
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.world {

	const enum Features {
		// VtxPosition and VtxNormal are required
		VtxUV           = 0x000001,
		VtxColour       = 0x000002,
		Skinned         = 0x020000
	}


	//  __  __         _     _ __  __                             
	// |  \/  |___  __| |___| |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// | |\/| / _ \/ _` / -_) | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |_|  |_\___/\__,_\___|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                              |___/         

	export type ModelInstance = Instance<ModelManager>;
	export type ModelRange = InstanceRange<ModelManager>;
	export type ModelSet = InstanceSet<ModelManager>;
	export type ModelIterator = InstanceIterator<ModelManager>;
	export type ModelArrayView = InstanceArrayView<ModelManager>;

	export interface ModelDescriptor {
		mesh: render.Mesh;
	}


	export class ModelManager implements ComponentManager<ModelManager> {
		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private enabledBase_: Uint8Array;
		private primGroupOffsetBase_: Int32Array;

		private primGroupData_: container.MultiArrayBuffer;
		private primGroupFeatureBase_: TypedArray;

		private meshes_: render.Mesh[] = [];

		constructor(
			private rc: render.RenderContext,
		)
		{
			var instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: UInt8, count: 1 },  // enabled
				{ type: SInt32, count: 1 }, // primGroupOffset (offset into primGroupFeatures_)
			];
			this.instanceData_ = new container.MultiArrayBuffer(1024, instFields);

			var groupFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // features
			];
			this.primGroupData_ = new container.MultiArrayBuffer(2048, groupFields);

			this.rebase();
			this.groupRebase();
		}


		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.enabledBase_ = <Uint8Array>this.instanceData_.indexedFieldView(2);
			this.primGroupOffsetBase_ = <Int32Array>this.instanceData_.indexedFieldView(4);
		}


		private groupRebase() {
			this.primGroupFeatureBase_ = this.primGroupData_.indexedFieldView(0);
		}


		private featuresForMesh(mesh: render.Mesh): Features {
			var features = 0;

			if (mesh.hasAttributeOfRole(sd.mesh.VertexAttributeRole.Colour)) features |= Features.VtxColour;
			if (mesh.hasAttributeOfRole(sd.mesh.VertexAttributeRole.UV)) features |= Features.VtxUV;

			return features;
		}


		create(entity: Entity, desc: ModelDescriptor): ModelInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var ix = this.instanceData_.count;

			this.entityBase_[ix] = <number>entity;
			this.enabledBase_[ix] = +true;
			this.meshes_[ix] = desc.mesh;

			// -- check correctness of mesh against material list
			var groups = desc.mesh.primitiveGroups;
			var maxLocalMatIndex = groups.reduce((cur, group) => Math.max(cur, group.materialIx), 0);

			// -- pre-calc global material indexes and program features for each group
			var primGroupCount = this.primGroupData_.count;
			this.primGroupOffsetBase_[ix] = this.primGroupData_.count;

			// -- grow primitiveGroup metadata buffer when necessary
			if (this.primGroupData_.resize(primGroupCount + groups.length) == container.InvalidatePointers.Yes) {
				this.groupRebase();
			}

			// -- append metadata for each primGroup
			groups.forEach((group, gix) => {
				this.primGroupFeatureBase_[primGroupCount] = this.featuresForMesh(desc.mesh);
				++primGroupCount;
			});

			return ix;
		}


		destroy(inst: ModelInstance) {
		}


		destroyRange(range: ModelRange) {
			var iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}


		get count() {
			return this.instanceData_.count;
		}

		valid(inst: ModelInstance) {
			return <number>inst <= this.count;
		}

		all(): ModelRange {
			return new InstanceLinearRange<ModelManager>(1, this.count);
		}


		entity(inst: ModelInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		mesh(inst: ModelInstance) {
			return this.meshes_[<number>inst];
		}

		enabled(inst: ModelInstance): boolean {
			return this.enabledBase_[<number>inst] != 0;
		}

		setEnabled(inst: ModelInstance, newEnabled: boolean) {
			this.enabledBase_[<number>inst] = +newEnabled;
		}
	}

} // ns sd.world
