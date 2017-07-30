// physics/world - physics configuration and world container
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
	}

	export class PhysicsWorld {
		private world_: Ammo.btDiscreteDynamicsWorld;
		private defaultLinearDrag_: number;
		private defaultAngularDrag_: number;
		private defaultFriction_: number;
		private defaultRestitution_: number;

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

			this.world_.addRigidBody(body);

			return body;
		}

		removeRigidBody(body: Ammo.btRigidBody) {
			this.world_.removeRigidBody(body);
		}

		get implementation() {
			return this.world_;
		}
	}

} // ns sd.physics
