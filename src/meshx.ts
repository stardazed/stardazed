// meshx.ts - Mesh component
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

/// <reference path="buffer.ts"/>
/// <reference path="rendercontext.ts"/>
/// <reference path="mesh-desc.ts"/>

namespace sd.world {

	export type MeshInstance = Instance<MeshManager>;
	export type MeshRange = InstanceRange<MeshManager>;
	export type MeshSet = InstanceSet<MeshManager>;
	export type MeshIterator = InstanceIterator<MeshManager>;
	export type MeshArrayView = InstanceArrayView<MeshManager>;


	export class MeshManager implements ComponentManager<MeshManager> {
		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: Int32Array;
		private entityMap_: Map<Entity, MeshInstance>;

		
		constructor(private rctx_: render.RenderContext) {
			var instanceFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
			];
			this.instanceData_ = new container.MultiArrayBuffer(2048, instanceFields);
			this.entityMap_ = new Map<Entity, MeshInstance>();

			this.rebase();
		}


		rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
		}


		create(entity: Entity, meshData: meshdata.MeshData): MeshInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}
			var ix = this.instanceData_.count;

			

			return ix;
		}


		destroy(inst: MeshInstance) {
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


		forEntity(ent: Entity): MeshInstance {
			return this.entityMap_.get(ent) || 0;
		}


		// -- single instance getters
		entity(inst: MeshInstance): Entity { return this.entityBase_[<number>inst]; }
	}

} // ns sd.world
