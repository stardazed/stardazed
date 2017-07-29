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
		constructor() {

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
