// rigidbody - RigidBody component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export type RigidBodyInstance = Instance<RigidBodyManager>;

	export interface RigidBodyDescriptor {
	}
	

	export class RigidBodyManager {
		private instanceData_: container.MultiArrayBuffer;

		private entityBase_: TypedArray;
		private transformBase_: TypedArray;
		private massBase_: TypedArray;
		private velocityBase_: TypedArray;
		private forcesBase_: TypedArray;
		private inertiaBase_: TypedArray;
		private angVelocityBase_: TypedArray;
		private torqueBase_: TypedArray;


		constructor(private transformMgr_: TransformManager) {
			var fields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform

				{ type: Float, count: 1 },  // mass
				{ type: Float, count: 3 },  // velocity
				{ type: Float, count: 3 },  // force

				{ type: Float, count: 1 },  // inertia
				{ type: Float, count: 3 },  // angVelocity
				{ type: Float, count: 3 },  // torque
			];

			this.instanceData_ = new container.MultiArrayBuffer(128, fields);
			this.rebase();
		}


		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.massBase_ = this.instanceData_.indexedFieldView(2);
			this.velocityBase_ = this.instanceData_.indexedFieldView(3);
			this.forcesBase_ = this.instanceData_.indexedFieldView(4);
			this.inertiaBase_ = this.instanceData_.indexedFieldView(5);
			this.angVelocityBase_ = this.instanceData_.indexedFieldView(6);
			this.torqueBase_ = this.instanceData_.indexedFieldView(7);
		}


		create(ent: Entity, desc: RigidBodyDescriptor): RigidBodyInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}

			var instance = this.instanceData_.count;
			this.entityBase_[instance] = <number>ent;
			this.transformBase_[instance] = <number>this.transformMgr_.forEntity(ent);

			// < fields

			return instance;
		}


		get count() { return this.instanceData_.count; }


		simulateAll(dt: number) {
		}


		entity(inst: RigidBodyInstance): Entity {
			return this.entityBase_[<number>inst];
		}

		transform(inst: RigidBodyInstance): TransformInstance {
			return this.transformBase_[<number>inst];
		}

		mass(inst: RigidBodyInstance): number {
			return this.massBase_[<number>inst];
		}

		velocity(inst: RigidBodyInstance): ArrayOfNumber {
			return math.vectorArrayItem(this.velocityBase_, math.Vec3, <number>inst);
		}
	}

} // ns sd.world
