// physics/physicsworld - physics configuration and world container
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.physics {

	export interface PhysicsConfig {
		broadphaseSize: "small" | "large";
		worldMin: number | ConstFloat3;
		worldMax: number | ConstFloat3;
		gravity: number | ConstFloat3;
		defaultLinearDrag: number;
		defaultAngularDrag: number;
		defaultFriction: number;
		defaultRestitution: number;
	}

	export interface RaycastHit {
		collisionObject: Ammo.btCollisionObjectConst;
		hitPointWorld: Float3;
		hitNormalWorld: Float3;
		hitFraction: number;
	}

	export function makeDefaultPhysicsConfig(): PhysicsConfig {
		return {
			broadphaseSize: "small",
			worldMin: -100,
			worldMax: 100,
			gravity: -9.81,
			defaultLinearDrag: 0,     // \
			defaultAngularDrag: 0.05, // | - these defaults are what Unity uses — now let's hope they have a similar effect
			defaultFriction: 0.6,     // |
			defaultRestitution: 0     // /
		};
	}

	export interface RigidBodyDescriptor {
		mass: number;
		shape: PhysicsShape;
		isTrigger?: boolean;
		isKinematic?: boolean;
		isScripted?: boolean;
		worldPos?: ConstFloat3;
		worldRot?: ConstFloat4;
		linearDrag?: number;
		angularDrag?: number;
		friction?: number; // Bullet/Ammo does not support separate values for static and dynamic friction
		restitution?: number; // bounciness in Unity
		positionConstraints?: [boolean, boolean, boolean];
		rotationConstraints?: [boolean, boolean, boolean];
		collisionFilterGroup?: number;
		collisionFilterMask?: number;
	}

	export interface CharacterDescriptor {
		shape: PhysicsShape;
		stepHeight: number;
		worldPos?: ConstFloat3;
		worldRot?: ConstFloat4;
	}

	interface RayResultStruct {
		new(from: Ammo.btVector3, to: Ammo.btVector3): Ammo.RayResultCallback;
	}

	export class PhysicsWorld {
		private world_: Ammo.btDiscreteDynamicsWorld;
		private defaultLinearDrag_: number;
		private defaultAngularDrag_: number;
		private defaultFriction_: number;
		private defaultRestitution_: number;

		private readonly tempBtTrans_: Ammo.btTransform;
		
		constructor(config: PhysicsConfig) {
			const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

			const worldMin = typeof config.worldMin === "number" ?
				new Ammo.btVector3(config.worldMin, config.worldMin, config.worldMin) :
				new Ammo.btVector3(config.worldMin[0], config.worldMin[1], config.worldMin[2]);
			const worldMax = typeof config.worldMax === "number" ?
				new Ammo.btVector3(config.worldMax, config.worldMax, config.worldMax) :
				new Ammo.btVector3(config.worldMax[0], config.worldMax[1], config.worldMax[2]);

			const broadphase = config.broadphaseSize === "small" ?
				new Ammo.btAxisSweep3(worldMin, worldMax) :
				new Ammo.btDbvtBroadphase();
			const solver = new Ammo.btSequentialImpulseConstraintSolver();

			const world = this.world_ = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);

			const gravity = typeof config.gravity === "number" ?
				new Ammo.btVector3(0, config.gravity, 0) :
				new Ammo.btVector3(config.gravity[0], config.gravity[1], config.gravity[2]);
			world.setGravity(gravity);

			this.defaultLinearDrag_ = config.defaultLinearDrag;
			this.defaultAngularDrag_ = config.defaultAngularDrag;
			this.defaultFriction_ = config.defaultFriction;
			this.defaultRestitution_ = config.defaultRestitution;

			this.tempBtTrans_ = new Ammo.btTransform();			
		}

		createRigidBody(desc: RigidBodyDescriptor) {
			const worldPos = desc.worldPos || [0, 0, 0];
			const worldRot = desc.worldRot || [0, 0, 0, 1];

			const ammoTransform = new Ammo.btTransform(
				new Ammo.btQuaternion(worldRot[0], worldRot[1], worldRot[2], worldRot[3]),
				new Ammo.btVector3(worldPos[0], worldPos[1], worldPos[2])
			);
			const localInertia = new Ammo.btVector3();
			if (desc.mass > 0) {
				desc.shape.shape.calculateLocalInertia(desc.mass, localInertia);
			}
			const rigidBodyDesc = new Ammo.btRigidBodyConstructionInfo(
				desc.mass,
				new Ammo.btDefaultMotionState(ammoTransform),
				desc.shape.shape,
				localInertia
			);

			rigidBodyDesc.set_m_linearDamping(desc.linearDrag !== undefined ? desc.linearDrag : this.defaultLinearDrag_);
			rigidBodyDesc.set_m_angularDamping(desc.angularDrag !== undefined ? desc.angularDrag : this.defaultAngularDrag_);
			rigidBodyDesc.set_m_friction(desc.friction !== undefined ? desc.friction : this.defaultFriction_);
			rigidBodyDesc.set_m_restitution(desc.restitution !== undefined ? desc.restitution : this.defaultRestitution_);

			const body = new Ammo.btRigidBody(rigidBodyDesc);
			if (desc.isTrigger) {
				body.setCollisionFlags(body.getCollisionFlags() | Ammo.CollisionFlags.CF_NO_CONTACT_RESPONSE);
			}
			if (desc.isKinematic) {
				body.setCollisionFlags(body.getCollisionFlags() | Ammo.CollisionFlags.CF_KINEMATIC_OBJECT);
			}
			if (desc.isScripted) {
				body.setActivationState(Ammo.ActivationState.DISABLE_DEACTIVATION);
			}

			// if an axis is constrained, then the scale factor is 0, otherwise 1
			if (desc.positionConstraints) {
				const factors = [+!desc.positionConstraints[0], +!desc.positionConstraints[1], +!desc.positionConstraints[2]];
				body.setLinearFactor(new Ammo.btVector3(factors[0], factors[1], factors[2]));
			}
			if (desc.rotationConstraints) {
				const factors = [+!desc.rotationConstraints[0], +!desc.rotationConstraints[1], +!desc.rotationConstraints[2]];
				body.setAngularFactor(new Ammo.btVector3(factors[0], factors[1], factors[2]));
			}

			// collision filtering, by default mimic what Ammo does
			const isDynamic = !(body.isStaticObject() || body.isKinematicObject());
			let collisionFilterGroup = isDynamic ? Ammo.CollisionFilterGroups.DefaultFilter : Ammo.CollisionFilterGroups.StaticFilter;
			let collisionFilterMask = isDynamic ? Ammo.CollisionFilterGroups.AllFilter : Ammo.CollisionFilterGroups.AllFilter ^ Ammo.CollisionFilterGroups.StaticFilter;

			// allow descriptor to override values
			if (desc.collisionFilterGroup !== undefined) {
				collisionFilterGroup = desc.collisionFilterGroup & 0xffff;
			}
			if (desc.collisionFilterMask !== undefined) {
				collisionFilterMask = desc.collisionFilterMask & 0xffff;
			}

			this.world_.addRigidBody(body, collisionFilterGroup, collisionFilterMask);

			return body;
		}

		removeRigidBody(body: Ammo.btRigidBody) {
			this.world_.removeRigidBody(body);
		}

		createCharacter(desc: CharacterDescriptor) {
			const worldPos = desc.worldPos || [0, 0, 0];
			const worldRot = desc.worldRot || [0, 0, 0, 1];

			const ammoTransform = new Ammo.btTransform(
				new Ammo.btQuaternion(worldRot[0], worldRot[1], worldRot[2], worldRot[3]),
				new Ammo.btVector3(worldPos[0], worldPos[1], worldPos[2])
			);

			const ghost = new Ammo.btPairCachingGhostObject();
			ghost.setWorldTransform(ammoTransform);
			ghost.setCollisionShape(desc.shape.shape);
			ghost.setCollisionFlags(Ammo.CollisionFlags.CF_CHARACTER_OBJECT);
			// this.world_.broadphase.getOverlappingPairCache() -> setInternalGhostPairCallback(new btGhostPairCallback());

			const controller = new Ammo.btKinematicCharacterController(ghost, desc.shape.shape, desc.stepHeight);
			// controller.setGravity(-this.world_.getGravity().y());

			this.world_.addCollisionObject(ghost, Ammo.CollisionFilterGroups.DefaultFilter, Ammo.CollisionFilterGroups.AllFilter);
			this.world_.addAction(controller);

			return controller;
		}

		private rayCastInternal(resultClass: RayResultStruct, filter: Ammo.CollisionFilterGroups, worldFrom: Float3, worldToOrDir: Float3, maxDist?: number) {
			if (maxDist !== undefined) {
				vec3.scaleAndAdd(worldToOrDir, worldFrom, worldToOrDir, maxDist);
			}
			const from = new Ammo.btVector3(worldFrom[0], worldFrom[1], worldFrom[2]);
			const to = new Ammo.btVector3(worldToOrDir[0], worldToOrDir[1], worldToOrDir[2]);
			const result = new resultClass(from, to);
			
			result.set_m_collisionFilterGroup(Ammo.CollisionFilterGroups.AllFilter);
			result.set_m_collisionFilterMask(filter);
			
			this.world_.rayTest(from, to, result);
			return result;
		}

		rayTestTarget(worldFrom: Float3, worldTo: Float3, filter = Ammo.CollisionFilterGroups.AllFilter) {
			return this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldTo).hasHit();
		}

		rayTest(worldFrom: Float3, worldDir: Float3, maxDistance = 1e7, filter = Ammo.CollisionFilterGroups.AllFilter) {
			return this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldDir, maxDistance).hasHit();
		}

		private closestRaycastHit(crr: Ammo.ClosestRayResultCallback): RaycastHit | undefined {
			if (! crr.hasHit()) {
				return undefined;
			}
			const hitPoint = crr.get_m_hitPointWorld();
			const hitNormal = crr.get_m_hitNormalWorld();
			return {
				collisionObject: crr.get_m_collisionObject(),
				hitFraction: crr.get_m_closestHitFraction(),
				hitPointWorld: [hitPoint.x(), hitPoint.y(), hitPoint.z()],
				hitNormalWorld: [hitNormal.x(), hitNormal.y(), hitNormal.z()],
			};
		}

		rayCastClosestTarget(worldFrom: Float3, worldTo: Float3, filter = Ammo.CollisionFilterGroups.AllFilter) {
			const result = this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldTo) as Ammo.ClosestRayResultCallback;
			return this.closestRaycastHit(result);
		}

		rayCastClosest(worldFrom: Float3, worldDir: Float3, maxDistance = 1e7, filter = Ammo.CollisionFilterGroups.AllFilter) {
			const result = this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldDir, maxDistance) as Ammo.ClosestRayResultCallback;
			return this.closestRaycastHit(result);
		}

		private allRaycastHits(arr: Ammo.AllHitsRayResultCallback): RaycastHit[] {
			if (! arr.hasHit()) {
				return [];
			}

			const hits: RaycastHit[] = [];
			const cos = arr.get_m_collisionObjects();
			const fracts = arr.get_m_hitFractions();
			const points = arr.get_m_hitPointWorld();
			const normals = arr.get_m_hitNormalWorld();
			const hitCount = cos.size();
			for (let i = 0; i < hitCount; ++i) {
				const point = points.at(i);
				const normal = normals.at(i);
				hits.push({
					collisionObject: cos.at(i),
					hitFraction: fracts.at(i),
					hitPointWorld: [point.x(), point.y(), point.z()],
					hitNormalWorld: [normal.x(), normal.y(), normal.z()],	
				});
			}
			return hits;
		}

		rayCastAllTarget(worldFrom: Float3, worldTo: Float3, filter = Ammo.CollisionFilterGroups.AllFilter) {
			const result = this.rayCastInternal(Ammo.AllHitsRayResultCallback, filter, worldFrom, worldTo) as Ammo.AllHitsRayResultCallback;
			return this.allRaycastHits(result);
		}

		rayCastAll(worldFrom: Float3, worldDir: Float3, maxDistance = 1e7, filter = Ammo.CollisionFilterGroups.AllFilter) {
			const result = this.rayCastInternal(Ammo.AllHitsRayResultCallback, filter, worldFrom, worldDir, maxDistance) as Ammo.AllHitsRayResultCallback;
			return this.allRaycastHits(result);
		}

		update(timeStep: number, colliders: entity.ColliderComponent, transforms: entity.TransformComponent) {
			this.world_.stepSimulation(timeStep, 2, 1 / 60);

			colliders.forEach((_coll, trans, rigidBody) => {
				if (rigidBody.isActive()) {
					const ms = rigidBody.getMotionState();
					ms.getWorldTransform(this.tempBtTrans_);

					const pos = this.tempBtTrans_.getOrigin();
					const rot = this.tempBtTrans_.getRotation();

					// FIXME: if item is parented, make position/rotation parent relative
					transforms.setPositionAndRotation(trans, [pos.x(), pos.y(), pos.z()], [rot.x(), rot.y(), rot.z(), rot.w()]);
				}
			});
		}
	}

} // ns sd.physics
