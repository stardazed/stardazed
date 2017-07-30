// entity/collider - Collider/RigidBody component
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.entity {

	export const enum ColliderShapeType {
		Box,
		Sphere,
		Capsule,
		Cylinder,
		Cone,
		Plane,
		ConvexHull,
		Mesh,
		HeightField
	}

	export interface BoxShape {
		type: ColliderShapeType.Box;
		halfExtents: Float3;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface SphereShape {
		type: ColliderShapeType.Sphere;
		radius: number;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface CapsuleShape {
		type: ColliderShapeType.Capsule;
		radius: number;
		height: number;
		orientation: Ammo.AxisIndex;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface CylinderShape {
		type: ColliderShapeType.Cylinder;
		halfExtents: ConstFloat3;
		orientation: Ammo.AxisIndex;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface ConeShape {
		type: ColliderShapeType.Cone;
		radius: number;
		height: number;
		orientation: Ammo.AxisIndex;
		scale?: ConstFloat3;
	}

	export interface PlaneShape {
		type: ColliderShapeType.Plane;
		planeNormal: ConstFloat3;
		planeConstant: number;
	}

	export interface ConvexHullShape {
		type: ColliderShapeType.ConvexHull;
		pointCount: number;
		points: ArrayOfConstNumber; // vec3s laid out linearly
	}

	export interface MeshShape {
		type: ColliderShapeType.Mesh;
		mesh: meshdata.MeshData;
		convex: boolean;
		convexMargin?: number;
		scale?: ConstFloat3;
	}

	export interface HeightFieldShape {
		// constructor(heightStickWidth: number, heightStickLength: number, heightfieldData: VoidPtr, heightScale: number, minHeight: number, maxHeight: number, upAxis: AxisIndex, hdt: PHY_ScalarType, flipQuadEdges: boolean);
		type: ColliderShapeType.HeightField;
		gridWidth: number;
		gridDepth: number;
		minHeight: number;
		maxHeight: number;
		heightScale?: number;
		orientation?: Ammo.AxisIndex;
		scale?: ConstFloat3;

		// TODO: finish later
	}

	export type ColliderShape = BoxShape | SphereShape | CapsuleShape | CylinderShape | ConeShape | PlaneShape | ConvexHullShape | MeshShape | HeightFieldShape;

	export const enum ColliderType {
		Trigger,
		RigidBody
	}

	export interface Collider {
		shape: ColliderShape;

		// rigidbody
		mass: number; // 0 means fixed static object
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

		create(_entity: Entity, _collider: Collider): ColliderInstance {
			return 0;
		}

		destroy(_inst: ColliderInstance) {
		}

		destroyRange(range: ColliderRange) {
			const iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}

		get count() { return 0; }

		valid(inst: ColliderInstance) {
			return inst <= this.count;
		}

		all(): ColliderRange {
			return new InstanceLinearRange<ColliderComponent>(1, this.count);
		}

		// -- single instance getters
	}

} // ns sd.entity
