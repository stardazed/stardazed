// entity/collider - Collider/RigidBody component
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.entity {

	export const enum ColliderShape {
		Box,
		Sphere,
		Capsule,
		Plane,
		ConvexMesh,
		ConcaveMesh
	}

	export const enum ColliderType {
		Trigger,
		RigidBody
	}

	export interface Collider {
		

		// rigidbody
		mass: number;
		linearDrag: number;
		angularDrag: number;
		kinematic: boolean;
	}

	// ----

	export type ColliderInstance = Instance<ColliderComponent>;
	export type ColliderRange = InstanceRange<ColliderComponent>;
	export type ColliderSet = InstanceSet<ColliderComponent>;
	export type ColliderIterator = InstanceIterator<ColliderComponent>;
	export type ColliderArrayView = InstanceArrayView<ColliderComponent>;

	export class ColliderComponent implements Component<ColliderComponent> {
		private world_: Ammo.btDiscreteDynamicsWorld;

		constructor() {
			// FIXME: creating the physics world will have to happen elsewhere, with physics config etc.
			const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
			const overlappingPairCache = new Ammo.btAxisSweep3(new Ammo.btVector3(-100, -100, -100), new Ammo.btVector3(100, 100, 100));
			const solver = new Ammo.btSequentialImpulseConstraintSolver();

			this.world_ = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
			this.world_.setGravity( new Ammo.btVector3(0, -9.8, 0));
		}

		create(entity: Entity): ColliderInstance {
			return instance;
		}

		destroy(_inst: ColliderInstance) {
		}

		destroyRange(range: ColliderRange) {
			const iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}

		get count() { return this.instanceData_.count; }

		valid(inst: ColliderInstance) {
			return inst <= this.count;
		}

		all(): ColliderRange {
			return new InstanceLinearRange<ColliderComponent>(1, this.count);
		}

		// -- single instance getters
	}

} // ns sd.entity
