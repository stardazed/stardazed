// collider - Collider component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export type ColliderInstance = Instance<ColliderManager>;

	export const enum ColliderType {
		None,
		Sphere,
		Plane
	}

	export interface ColliderDescriptor {
		type: ColliderType;
		sphere?: math.Sphere;
		plane?: math.BoundedPlane;
	}


	export class ColliderManager {
		private instanceData_: container.MultiArrayBuffer;

		private entityBase_: Int32Array;
		private transformBase_: Int32Array;
		private bodyBase_: Int32Array;
		private boundsBase_: Int32Array;
		private typeBase_: Uint32Array;

		private worldBoundsA_: AABB;
		private worldBoundsB_: AABB;


		constructor(private transformMgr_: TransformManager, private rigidBodyMgr_: RigidBodyManager, private aabbMgr_: AABBManager) {
			var fields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: SInt32, count: 1 }, // rigidBody
				{ type: SInt32, count: 1 }, // aabb
				{ type: UInt32, count: 1 }, // type
			];

			this.instanceData_ = new container.MultiArrayBuffer(128, fields);
			this.rebase();

			this.worldBoundsA_ = this.aabbMgr_.createEmpty();
			this.worldBoundsB_ = this.aabbMgr_.createEmpty();
		}


		private rebase() {
			this.entityBase_ = <Int32Array>this.instanceData_.indexedFieldView(0);
			this.transformBase_ = <Int32Array>this.instanceData_.indexedFieldView(1);
			this.bodyBase_ = <Int32Array>this.instanceData_.indexedFieldView(2);
			this.boundsBase_ = <Int32Array>this.instanceData_.indexedFieldView(3);
			this.typeBase_ = <Uint32Array>this.instanceData_.indexedFieldView(4);
		}


		create(ent: Entity, desc: ColliderDescriptor): ColliderInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}

			var instance = this.instanceData_.count;
			this.entityBase_[instance] = <number>ent;
			this.transformBase_[instance] = <number>this.transformMgr_.forEntity(ent);
			this.bodyBase_[instance] = <number>this.rigidBodyMgr_.forEntity(ent);
			this.typeBase_[instance] = desc.type;

			// -- determine
			if (desc.type == ColliderType.Sphere) {
				assert(desc.sphere);
				var diameter = <number>desc.sphere.radius * 2;
				this.boundsBase_[instance] = <number>this.aabbMgr_.createFromCenterAndSize(desc.sphere.center, [diameter, diameter, diameter]);
			}
			else if (desc.type == ColliderType.Plane) {
				assert(desc.plane);
				var boundingSize = math.boundingSizeOfBoundedPlane(desc.plane);
				this.boundsBase_[instance] = <number>this.aabbMgr_.createFromCenterAndSize(desc.plane.center, boundingSize);
			}

			return instance;
		}


		get count() { return this.instanceData_.count; }


		resolveAll(dt: number) {
			var maxIndex = this.count;

			for (var collA = 1; collA <= maxIndex; ++collA) {
				var rbA = <RigidBodyInstance>this.bodyBase_[collA];
				if (rbA == 0)
					continue;
				
				var txA = <TransformInstance>this.transformBase_[collA];
				var boundsA = <AABB>this.boundsBase_[collA];
				this.aabbMgr_.transformMat4(this.worldBoundsA_, boundsA, this.transformMgr_.worldMatrix(txA));

				for (var collB = 1; collB <= maxIndex; ++collB) {
					if (collB == collA)
						continue;

					var txB = <TransformInstance>this.transformBase_[collB];
					var rbB = <RigidBodyInstance>this.bodyBase_[collB];
					var boundsB = <AABB>this.boundsBase_[collB];
					this.aabbMgr_.transformMat4(this.worldBoundsB_, boundsB, this.transformMgr_.worldMatrix(txB));

					if (this.aabbMgr_.intersects(this.worldBoundsA_, this.worldBoundsB_)) {
						var typeA = <ColliderType>this.typeBase_[collA];
						var typeB = <ColliderType>this.typeBase_[collB];





						var velPrevA = this.rigidBodyMgr_.prevVelocity(rbA);
						var velCurA = this.rigidBodyMgr_.velocity(rbA);

						var posPrevA = this.rigidBodyMgr_.prevPosition(rbA);
						var posCurA = this.transformMgr_.localPosition(txA);




						this.rigidBodyMgr_.setMomentum(rbA, [0, 0, 0]);
					}
				}
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
