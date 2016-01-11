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
			var iterA = range.makeIterator();

			while (iterA.next()) {
				var collA = iterA.current;
				var rbA = <RigidBodyInstance>this.bodyBase_[<number>collA];
				if (rbA == 0)
					continue;
				
				var txA = <TransformInstance>this.transformBase_[<number>collA];
				var boundsA = <AABBNode>this.boundsBase_[<number>collA];
				math.aabb.transformMat4(this.worldBoundsA_, boundsA, this.transformMgr_.worldMatrix(txA));

				var iterB = range.makeIterator();
				while (iterB.next()) {
					var collB = iterB.current;
					if (collB == collA)
						continue;

					var txB = <TransformInstance>this.transformBase_[<number>collB];
					var rbB = <RigidBodyInstance>this.bodyBase_[<number>collB];
					var boundsB = <AABBNode>this.boundsBase_[<number>collB];
					math.aabb.transformMat4(this.worldBoundsB_, boundsB, this.transformMgr_.worldMatrix(txB));

					if (this.worldBoundsA_.intersectsAABB(this.worldBoundsB_)) {
						var typeA = <ColliderType>this.typeBase_[<number>collA];
						var typeB = <ColliderType>this.typeBase_[<number>collB];

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
