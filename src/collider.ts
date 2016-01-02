// collider - Collider component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export type ColliderInstance = Instance<ColliderManager>;
	export type ColliderIterator = InstanceIterator<ColliderManager>;

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


	export class ColliderManager implements ComponentManager<ColliderManager> {
		private instanceData_: container.MultiArrayBuffer;

		private entityBase_: Int32Array;
		private transformBase_: Int32Array;
		private bodyBase_: Int32Array;
		private boundsBase_: Int32Array;
		private typeBase_: Int32Array;

		private sphereData_: Map<number, math.Sphere>;
		private planeData_: Map<number, math.BoundedPlane>;

		private worldBoundsA_: AABB;
		private worldBoundsB_: AABB;


		constructor(private transformMgr_: TransformManager, private rigidBodyMgr_: RigidBodyManager, private aabbMgr_: AABBManager) {
			var fields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: SInt32, count: 1 }, // rigidBody
				{ type: SInt32, count: 1 }, // aabb
				{ type: SInt32, count: 1 }, // type
			];

			this.instanceData_ = new container.MultiArrayBuffer(128, fields);
			this.rebase();

			this.sphereData_ = new Map<number, math.Sphere>();
			this.planeData_ = new Map<number, math.BoundedPlane>();

			this.worldBoundsA_ = this.aabbMgr_.createEmpty();
			this.worldBoundsB_ = this.aabbMgr_.createEmpty();
		}


		private rebase() {
			this.entityBase_ = <Int32Array>this.instanceData_.indexedFieldView(0);
			this.transformBase_ = <Int32Array>this.instanceData_.indexedFieldView(1);
			this.bodyBase_ = <Int32Array>this.instanceData_.indexedFieldView(2);
			this.boundsBase_ = <Int32Array>this.instanceData_.indexedFieldView(3);
			this.typeBase_ = <Int32Array>this.instanceData_.indexedFieldView(4);
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
				this.sphereData_.set(instance, desc.sphere);
			}
			else if (desc.type == ColliderType.Plane) {
				assert(desc.plane);
				var boundingSize = math.boundingSizeOfBoundedPlane(desc.plane);
				this.boundsBase_[instance] = <number>this.aabbMgr_.createFromCenterAndSize(desc.plane.center, boundingSize);
				this.planeData_.set(instance, desc.plane);
			}

			return instance;
		}


		get count() { return this.instanceData_.count; }


		valid(inst: ColliderInstance) {
			return <number>inst <= this.count;
		}


		all(): ColliderIterator {
			var mgr = this;

			return {
				current: <ColliderInstance>0,
				reset: function() { this.current = 0; },
				next: function() {
					++this.current;
					return mgr.valid(this.current);
				}
			};
		}


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

						var posPrevA = this.rigidBodyMgr_.prevPosition(rbA);
						var posCurA = this.transformMgr_.localPosition(txA);
						var dirA = vec3.subtract([], posCurA, posPrevA);

						var matB = this.transformMgr_.localMatrix(txB);

						var sphereADef = this.sphereData_.get(collA);
						var sphereA = { center: vec3.add([], sphereADef.center, posPrevA), radius: sphereADef.radius };
						var planeBDef = this.planeData_.get(collB);
						var planeB = math.transformBoundedPlaneMat4(planeBDef, matB);
						var intersection = math.intersectMovingSpherePlane(sphereA, dirA, planeB);
						if (intersection.intersected && intersection.t >= 0 && intersection.t <= 1) {
							var velPrevA = this.rigidBodyMgr_.prevVelocity(rbA);
							var velCurA = this.rigidBodyMgr_.velocity(rbA);
							var velDiffA = vec3.subtract([], velCurA, velPrevA);
							var velAtHit = vec3.scaleAndAdd([], velPrevA, velDiffA, intersection.t);
							var exitVelA = math.reflectVec3(velAtHit, planeB.normal);
							vec3.scale(exitVelA, exitVelA, 0.4);

							if (vec3.squaredLength(exitVelA) < 0.001) {
								exitVelA = [0,0,0];
							}
							console.info(vec3.length(exitVelA));

							var posAtHit = vec3.scaleAndAdd([], posPrevA, vec3.subtract([], posCurA, posPrevA), intersection.t);
							var newPosA = vec3.scaleAndAdd([], posAtHit, exitVelA, dt * (1 - intersection.t));

							this.transformMgr_.setPosition(txA, newPosA);
							this.rigidBodyMgr_.setVelocity(rbA, exitVelA);
							this.rigidBodyMgr_.addForce(rbA, vec3.scale([], velAtHit, dt), vec3.subtract([], intersection.point, sphereA.center));
						}
					}
				}
			}
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
