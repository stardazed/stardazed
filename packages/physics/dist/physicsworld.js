/**
 * physics/physicsworld - physics configuration and world container
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { vec3 } from "@stardazed/math";
export function makeDefaultPhysicsConfig() {
    return {
        broadphaseSize: "small",
        worldMin: -100,
        worldMax: 100,
        gravity: -9.81,
        defaultLinearDrag: 0,
        defaultAngularDrag: 0.05,
        defaultFriction: 0.6,
        defaultRestitution: 0 // /
    };
}
export class PhysicsWorld {
    // private readonly tempBtTrans_: Ammo.btTransform;
    constructor(config) {
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
        // this.tempBtTrans_ = new Ammo.btTransform();
        // this.lag_ = 0;
        this.haveGhosts_ = false;
    }
    createRigidBody(desc) {
        const worldPos = desc.worldPos || [0, 0, 0];
        const worldRot = desc.worldRot || [0, 0, 0, 1];
        const ammoTransform = new Ammo.btTransform(new Ammo.btQuaternion(worldRot[0], worldRot[1], worldRot[2], worldRot[3]), new Ammo.btVector3(worldPos[0], worldPos[1], worldPos[2]));
        const localInertia = new Ammo.btVector3();
        if (desc.mass > 0) {
            desc.shape.shape.calculateLocalInertia(desc.mass, localInertia);
        }
        const rigidBodyDesc = new Ammo.btRigidBodyConstructionInfo(desc.mass, new Ammo.btDefaultMotionState(ammoTransform), desc.shape.shape, localInertia);
        rigidBodyDesc.set_m_linearDamping(desc.linearDrag !== undefined ? desc.linearDrag : this.defaultLinearDrag_);
        rigidBodyDesc.set_m_angularDamping(desc.angularDrag !== undefined ? desc.angularDrag : this.defaultAngularDrag_);
        rigidBodyDesc.set_m_friction(desc.friction !== undefined ? desc.friction : this.defaultFriction_);
        rigidBodyDesc.set_m_restitution(desc.restitution !== undefined ? desc.restitution : this.defaultRestitution_);
        const body = new Ammo.btRigidBody(rigidBodyDesc);
        if (desc.isTrigger) {
            body.setCollisionFlags(body.getCollisionFlags() | 4 /* CF_NO_CONTACT_RESPONSE */);
        }
        if (desc.isKinematic) {
            body.setCollisionFlags(body.getCollisionFlags() | 2 /* CF_KINEMATIC_OBJECT */);
        }
        if (desc.isScripted) {
            body.setActivationState(4 /* DISABLE_DEACTIVATION */);
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
        let collisionFilterGroup = isDynamic ? 1 /* DefaultFilter */ : 2 /* StaticFilter */;
        let collisionFilterMask = isDynamic ? -1 /* AllFilter */ : -1 /* AllFilter */ ^ 2 /* StaticFilter */;
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
    removeCollisionObject(co) {
        const body = this.asRigidBody(co);
        if (body) {
            this.world_.removeRigidBody(body);
        }
        else {
            this.world_.removeCollisionObject(co);
        }
    }
    createGhostTrigger(desc) {
        const worldPos = desc.worldPos || [0, 0, 0];
        const worldRot = desc.worldRot || [0, 0, 0, 1];
        const ammoTransform = new Ammo.btTransform(new Ammo.btQuaternion(worldRot[0], worldRot[1], worldRot[2], worldRot[3]), new Ammo.btVector3(worldPos[0], worldPos[1], worldPos[2]));
        const ghost = new Ammo.btGhostObject();
        ghost.setWorldTransform(ammoTransform);
        ghost.setCollisionShape(desc.shape.shape);
        ghost.setCollisionFlags(ghost.getCollisionFlags() | 4 /* CF_NO_CONTACT_RESPONSE */);
        this.world_.addCollisionObject(ghost, 16 /* SensorTrigger */, 1 /* DefaultFilter */);
        if (!this.haveGhosts_) {
            this.haveGhosts_ = true;
            this.world_.getPairCache().setInternalGhostPairCallback(new Ammo.btGhostPairCallback());
        }
        return ghost;
    }
    asRigidBody(collObj) {
        const rb = Ammo.btRigidBody.prototype.upcast(collObj);
        if (rb === Ammo.NULL) {
            return undefined;
        }
        return rb;
    }
    asGhostObject(collObj) {
        const rb = Ammo.btGhostObject.prototype.upcast(collObj);
        if (rb === Ammo.NULL) {
            return undefined;
        }
        return rb;
    }
    /*
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
    */
    // FIXME: direct passthrough for now, add proper create/remove
    addConstraint(constraint, disableCollisionsBetweenLinkedBodies) {
        this.world_.addConstraint(constraint, disableCollisionsBetweenLinkedBodies);
    }
    removeConstraint(constraint) {
        this.world_.removeConstraint(constraint);
    }
    rayCastInternal(resultClass, filter, worldFrom, worldToOrDir, maxDist) {
        if (maxDist !== undefined) {
            vec3.scaleAndAdd(worldToOrDir, worldFrom, worldToOrDir, maxDist);
        }
        const from = new Ammo.btVector3(worldFrom[0], worldFrom[1], worldFrom[2]);
        const to = new Ammo.btVector3(worldToOrDir[0], worldToOrDir[1], worldToOrDir[2]);
        const result = new resultClass(from, to);
        result.set_m_collisionFilterGroup(-1 /* AllFilter */);
        result.set_m_collisionFilterMask(filter);
        this.world_.rayTest(from, to, result);
        return result;
    }
    rayTestTarget(worldFrom, worldTo, filter = -1 /* AllFilter */) {
        return this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldTo).hasHit();
    }
    rayTest(worldFrom, worldDir, maxDistance, filter = -1 /* AllFilter */) {
        return this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldDir, maxDistance).hasHit();
    }
    closestRaycastHit(crr) {
        if (!crr.hasHit()) {
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
    rayCastClosestTarget(worldFrom, worldTo, filter = -1 /* AllFilter */) {
        const result = this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldTo);
        return this.closestRaycastHit(result);
    }
    rayCastClosest(worldFrom, worldDir, maxDistance, filter = -1 /* AllFilter */) {
        const result = this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldDir, maxDistance);
        return this.closestRaycastHit(result);
    }
    allRaycastHits(arr) {
        if (!arr.hasHit()) {
            return [];
        }
        const hits = [];
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
    rayCastAllTarget(worldFrom, worldTo, filter = -1 /* AllFilter */) {
        const result = this.rayCastInternal(Ammo.AllHitsRayResultCallback, filter, worldFrom, worldTo);
        return this.allRaycastHits(result);
    }
    rayCastAll(worldFrom, worldDir, maxDistance, filter = -1 /* AllFilter */) {
        const result = this.rayCastInternal(Ammo.AllHitsRayResultCallback, filter, worldFrom, worldDir, maxDistance);
        return this.allRaycastHits(result);
    }
}
//# sourceMappingURL=physicsworld.js.map