// collider - Collider component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export type ColliderInstance = Instance<ColliderManager>;

	export const enum ColliderType {
		None,
		Box,
		Sphere
	}

	export interface ColliderDescriptor {
		type: ColliderType;
		center: ArrayOfNumber; // vec3, offset from center of model
		size: ArrayOfNumber;   // vec3, scaled by entity's transform scale
	}


	export class ColliderManager {
		private instanceData_: container.MultiArrayBuffer;

		private entityBase_: TypedArray;
		private transformBase_: TypedArray;


		constructor(private transformMgr_: TransformManager, private rigidBodyMgr_: RigidBodyManager) {
			var fields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
			];

			this.instanceData_ = new container.MultiArrayBuffer(128, fields);
			this.rebase();
		}


		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
		}


		create(ent: Entity, desc: ColliderDescriptor): RigidBodyInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}

			var instance = this.instanceData_.count;
			this.entityBase_[instance] = <number>ent;
			this.transformBase_[instance] = <number>this.transformMgr_.forEntity(ent);

			return instance;
		}


		get count() { return this.instanceData_.count; }


		resolveAll(dt: number) {
			var zero3 = math.Vec3.zero;

			for (var index = 1, max = this.count; index <= max; ++index) {
				var transform = this.transformBase_[index];

			}
		}


		// -- linked instances

		entity(inst: RigidBodyInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: RigidBodyInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}
	}

} // ns sd.world
