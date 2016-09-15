// collider - Collider component
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	export type ColliderInstance = Instance<ColliderManager>;
	export type ColliderRange = InstanceRange<ColliderManager>;
	export type ColliderSet = InstanceSet<ColliderManager>;
	export type ColliderIterator = InstanceIterator<ColliderManager>;
	export type ColliderArrayView = InstanceArrayView<ColliderManager>;

	export const enum ColliderType {
		None,
		Sphere
	}

	export interface ColliderDescriptor {
		type: ColliderType;
		physicsMaterial: PhysicsMaterialRef;
		sphere?: math.Sphere;
	}


	export class ColliderManager implements ComponentManager<ColliderManager> {
		private instanceData_: container.MultiArrayBuffer;

		private typeBase_: Int32Array;
		private entityBase_: EntityArrayView;
		private physMatBase_: PhysicsMaterialArrayView;

		private entityMap_: Map<Entity, ColliderInstance>;
		private sphereData_: Map<ColliderInstance, math.Sphere>;


		constructor(private physMatMgr_: PhysicsMaterialManager) {
			var fields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // type
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // physicsMaterial
			];

			this.instanceData_ = new container.MultiArrayBuffer(128, fields);
			this.rebase();

			this.entityMap_ = new Map<Entity, ColliderInstance>();
			this.sphereData_ = new Map<ColliderInstance, math.Sphere>();
		}


		private rebase() {
			this.typeBase_ = <Int32Array>this.instanceData_.indexedFieldView(0);
			this.entityBase_ = this.instanceData_.indexedFieldView(1);
			this.physMatBase_ = this.instanceData_.indexedFieldView(2);
		}


		create(ent: Entity, desc: ColliderDescriptor): ColliderInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}

			var instance = this.instanceData_.count;
			this.typeBase_[instance] = desc.type;
			this.entityBase_[instance] = <number>ent;
			this.physMatBase_[instance] = desc.physicsMaterial;

			this.entityMap_.set(ent, instance);

			// -- shape-specific data
			if (desc.type == ColliderType.Sphere) {
				assert(desc.sphere);
				this.sphereData_.set(instance, cloneStruct(desc.sphere));
			}

			return instance;
		}


		forEntity(ent: Entity): ColliderInstance {
			return this.entityMap_.get(ent) || 0;
		}


		// --

		destroy(inst: ColliderInstance) {
		}

		destroyRange(range: ColliderRange) {
			var iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}


		get count() { return this.instanceData_.count; }

		valid(inst: ColliderInstance) {
			return <number>inst <= this.count;
		}

		all(): ColliderRange {
			return new InstanceLinearRange<ColliderManager>(1, this.count);
		}


		// -- per instance properties

		type(inst: ColliderInstance): ColliderType {
			return this.typeBase_[<number>inst];
		}

		entity(inst: ColliderInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		physicsMaterial(inst: ColliderInstance): PhysicsMaterialData {
			var ref = this.physMatBase_[<number>inst];
			return this.physMatMgr_.item(ref);
		}

		sphereData(inst: ColliderInstance): math.Sphere {
			return this.sphereData_.get(inst)!;
		}
	}

} // ns sd.world
