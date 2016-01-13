// collider - Collider component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export type ColliderInstance = Instance<ColliderManager>;
	export type ColliderRange = InstanceRange<ColliderManager>;
	export type ColliderSet = InstanceSet<ColliderManager>;
	export type ColliderIterator = InstanceIterator<ColliderManager>;

	export const enum ColliderType {
		None,
		Sphere
	}

	export interface ColliderDescriptor {
		type: ColliderType;
		sphere?: math.Sphere;
	}


	export class ColliderManager implements ComponentManager<ColliderManager> {
		private instanceData_: container.MultiArrayBuffer;

		private entityBase_: Int32Array;
		private transformBase_: Int32Array;
		private bodyBase_: Int32Array;
		private typeBase_: Int32Array;

		private sphereData_: Map<ColliderInstance, math.Sphere>;
		private planeData_: Map<ColliderInstance, math.BoundedPlane>;

		private aabbTree_: AABBTree;
		private worldBoundsA_: math.AABB;
		private worldBoundsB_: math.AABB;


		constructor(private transformMgr_: TransformManager, private rigidBodyMgr_: RigidBodyManager) {
			var fields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // type
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: SInt32, count: 1 }, // rigidBody
			];

			this.instanceData_ = new container.MultiArrayBuffer(128, fields);
			this.rebase();

			this.sphereData_ = new Map<ColliderInstance, math.Sphere>();
		}


		private rebase() {
			this.typeBase_ = <Int32Array>this.instanceData_.indexedFieldView(0);
			this.entityBase_ = <Int32Array>this.instanceData_.indexedFieldView(1);
			this.transformBase_ = <Int32Array>this.instanceData_.indexedFieldView(2);
			this.bodyBase_ = <Int32Array>this.instanceData_.indexedFieldView(3);
		}


		create(ent: Entity, desc: ColliderDescriptor): ColliderInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}

			var instance = this.instanceData_.count;
			this.typeBase_[instance] = desc.type;
			this.entityBase_[instance] = <number>ent;
			this.transformBase_[instance] = <number>this.transformMgr_.forEntity(ent);
			this.bodyBase_[instance] = <number>this.rigidBodyMgr_.forEntity(ent);

			// -- determine
			if (desc.type == ColliderType.Sphere) {
				assert(desc.sphere);
				this.sphereData_.set(instance, desc.sphere);
			}

			return instance;
		}


		// --


		destroy(inst: ColliderInstance) {
		}


		destroyRange(range: ColliderRange) {
		}


		get count() { return this.instanceData_.count; }

		valid(inst: ColliderInstance) {
			return <number>inst <= this.count;
		}

		all(): ColliderRange {
			return new InstanceLinearRange<ColliderManager>(1, this.count);
		}

		makeSetRange(): ColliderSet {
			return new InstanceSet<ColliderManager>();
		}

		makeLinearRange(first: ColliderInstance, last: ColliderInstance): ColliderRange {
			return new InstanceLinearRange<ColliderManager>(first, last);
		}


		// --


		resolve(range: ColliderRange, dt: number) {
		}


		// -- linked instances

		entity(inst: ColliderInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: ColliderInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}
	}

} // ns sd.world
