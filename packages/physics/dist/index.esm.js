import { vec3, mat3, mat4, quat } from '@stardazed/math';
import { SInt32 } from '@stardazed/core';
import { MultiArrayBuffer } from '@stardazed/container';
import { InstanceLinearRange } from '@stardazed/entity';

/**
 * physics/shapes - shape definitions and creation
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
// ----
function makeAmmoVec3(v3, offset = 0) {
    return new Ammo.btVector3(v3[0 + offset], v3[1 + offset], v3[2 + offset]);
}
/*
function createMeshShape(geom: geometry.Geometry, subMeshIndex?: number, convex?: boolean) {
    const triView = (subMeshIndex !== undefined) ?
        geometry.triangleViewForSubMesh(geom, subMeshIndex) :
        geometry.triangleViewForGeometry(geom);
    if (! triView) {
        return undefined;
    }
    const posAttr = geometry.findAttributeOfRoleInGeometry(geom, geometry.VertexAttributeRole.Position);
    if (! posAttr) {
        console.warn("createMeshShape: the geometry does not have a position attribute", geom);
        return undefined;
    }
    const posView = new geometry.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
    const baseVertex = posView.fromVertex;

    // use conservative guess if 16-bit indexes will work
    const use32bitIndexes = elementCountForPrimitiveCount(triView.primitiveCount) >= UInt16.max;
    const collMesh = new Ammo.btTriangleMesh(use32bitIndexes);

    triView.forEach(face => {
        const posA = posView.copyItem(face.a() - baseVertex);
        const posB = posView.copyItem(face.b() - baseVertex);
        const posC = posView.copyItem(face.c() - baseVertex);

        collMesh.addTriangle(
            new Ammo.btVector3(posA[0], posA[1], posA[2]),
            new Ammo.btVector3(posB[0], posB[1], posB[2]),
            new Ammo.btVector3(posC[0], posC[1], posC[2])
        );
    });

    return convex ? new Ammo.btConvexTriangleMeshShape(collMesh, true) : new Ammo.btBvhTriangleMeshShape(collMesh, true, true);
}
*/
function makeShape(desc) {
    let shape;
    switch (desc.type) {
        case 1 /* Box */: {
            shape = new Ammo.btBoxShape(makeAmmoVec3(desc.halfExtents));
            break;
        }
        case 2 /* Sphere */: {
            shape = new Ammo.btSphereShape(desc.radius);
            break;
        }
        case 3 /* Capsule */: {
            if (desc.orientation === 1 /* Y */) {
                shape = new Ammo.btCapsuleShape(desc.radius, desc.height);
            }
            else if (desc.orientation === 0 /* X */) {
                shape = new Ammo.btCapsuleShapeX(desc.radius, desc.height);
            }
            else /* AxisIndex.Z */ {
                shape = new Ammo.btCapsuleShapeZ(desc.radius, desc.height);
            }
            break;
        }
        case 4 /* Cylinder */: {
            const halfExtents = makeAmmoVec3(desc.halfExtents);
            if (desc.orientation === 1 /* Y */) {
                shape = new Ammo.btCylinderShape(halfExtents);
            }
            else if (desc.orientation === 0 /* X */) {
                shape = new Ammo.btCylinderShapeX(halfExtents);
            }
            else /* AxisIndex.Z */ {
                shape = new Ammo.btCylinderShapeZ(halfExtents);
            }
            break;
        }
        case 5 /* Cone */: {
            if (desc.orientation === 1 /* Y */) {
                shape = new Ammo.btConeShape(desc.radius, desc.height);
            }
            else if (desc.orientation === 0 /* X */) {
                shape = new Ammo.btConeShapeX(desc.radius, desc.height);
            }
            else /* AxisIndex.Z */ {
                shape = new Ammo.btConeShapeZ(desc.radius, desc.height);
            }
            break;
        }
        case 6 /* Plane */: {
            shape = new Ammo.btStaticPlaneShape(makeAmmoVec3(desc.planeNormal), desc.planeConstant);
            break;
        }
        case 7 /* ConvexHull */: {
            const hull = new Ammo.btConvexHullShape();
            const endOffset = desc.pointCount * 3;
            const lastOffset = endOffset - 3;
            for (let offset = 0; offset < endOffset; offset += 3) {
                hull.addPoint(makeAmmoVec3(desc.points, offset), offset === lastOffset);
            }
            shape = hull;
            break;
        }
        // case PhysicsShapeType.Mesh: {
        // 	shape = createMeshShape(desc.geom, desc.subMeshIndex, desc.convex);
        // 	break;
        // }
        case 9 /* HeightField */: {
            break;
        }
    }
    if (!shape) {
        console.error("physics.makeShape: could not create shape", desc);
        return undefined;
    }
    if (desc.scale) {
        shape.setLocalScaling(makeAmmoVec3(desc.scale));
    }
    if (((desc.type === 8 /* Mesh */ && desc.convex)
        ||
            (desc.type !== 5 /* Cone */ && desc.type !== 6 /* Plane */))
        && desc.margin !== undefined) {
        shape.setMargin(desc.margin);
    }
    return { type: desc.type, shape };
}

/**
 * physics/physicsworld - physics configuration and world container
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function makeDefaultPhysicsConfig() {
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
class PhysicsWorld {
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

/**
 * physics/collider-entity - Collider/RigidBody component
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
class ColliderComponent {
    constructor(world_, transforms_) {
        this.world_ = world_;
        this.transforms_ = transforms_;
        this.tempMat3_ = mat4.create();
        this.tempQuat_ = quat.create();
        const instFields = [
            { type: SInt32, count: 1 },
            { type: SInt32, count: 1 },
            { type: SInt32, count: 1 },
        ];
        this.instanceData_ = new MultiArrayBuffer(1024, instFields);
        this.rebase();
        this.shapes_ = [];
        this.colliders_ = [];
    }
    rebase() {
        this.entityBase_ = this.instanceData_.indexedFieldView(0);
        this.transformBase_ = this.instanceData_.indexedFieldView(1);
        this.shapeTypeBase_ = this.instanceData_.indexedFieldView(2);
    }
    create(entity, collider) {
        if (this.instanceData_.extend() === 1 /* Yes */) {
            this.rebase();
        }
        const instance = this.instanceData_.count;
        // collision object
        const transform = this.transforms_.forEntity(entity);
        const worldMat = this.transforms_.worldMatrix(transform);
        if (collider.type === 1 /* RigidBody */) {
            collider.rigidBody.worldRot = quat.fromMat3(this.tempQuat_, mat3.fromMat4(this.tempMat3_, worldMat));
            collider.rigidBody.worldPos = this.transforms_.worldPosition(transform);
            const rigidBody = this.physicsWorld.createRigidBody(collider.rigidBody);
            // link the Ammo RB back to the collider through the instance index
            rigidBody.setUserIndex(instance);
            this.shapeTypeBase_[instance] = collider.rigidBody.shape.type;
            this.shapes_[instance] = collider.rigidBody.shape.shape;
            this.colliders_[instance] = rigidBody;
        }
        else if (collider.type === 2 /* GhostObject */) {
            collider.ghost.worldRot = quat.fromMat3(this.tempQuat_, mat3.fromMat4(this.tempMat3_, worldMat));
            collider.ghost.worldPos = this.transforms_.worldPosition(transform);
            const ghost = this.physicsWorld.createGhostTrigger(collider.ghost);
            // link the Ammo object back to the collider through the instance index
            ghost.setUserIndex(instance);
            this.shapeTypeBase_[instance] = collider.ghost.shape.type;
            this.shapes_[instance] = collider.ghost.shape.shape;
            this.colliders_[instance] = ghost;
        }
        this.entityBase_[instance] = entity;
        this.transformBase_[instance] = transform;
        return instance;
    }
    destroy(inst) {
        this.entityBase_[inst] = 0;
        this.transformBase_[inst] = 0;
        this.shapeTypeBase_[inst] = 0;
        delete this.shapes_[inst];
        const co = this.colliders_[inst];
        co.setUserIndex(0);
        this.physicsWorld.removeCollisionObject(co);
        delete this.colliders_[inst];
    }
    destroyRange(range) {
        const iter = range.makeIterator();
        while (iter.next()) {
            this.destroy(iter.current);
        }
    }
    get count() { return this.instanceData_.count; }
    valid(inst) {
        return inst <= this.count && this.entityBase_[inst] > 0;
    }
    all() {
        return new InstanceLinearRange(1, this.count);
    }
    // FIXME: HACK, move to physicsworld
    forEach(fn) {
        const max = this.count;
        for (let cx = 1; cx <= max; ++cx) {
            if (this.entityBase_[cx] !== 0) {
                const tx = this.transformBase_[cx];
                const co = this.colliders_[cx];
                fn(cx, tx, co);
            }
        }
    }
    identify(co) {
        return co.getUserIndex();
    }
    identifyEntity(co) {
        return this.entity(this.identify(co));
    }
    // --
    get physicsWorld() { return this.world_; }
    // -- single instance getters
    entity(inst) {
        return this.entityBase_[inst];
    }
    transform(inst) {
        return this.transformBase_[inst];
    }
    shapeType(inst) {
        return this.shapeTypeBase_[inst];
    }
    shape(inst) {
        return this.shapes_[inst];
    }
    collisionObject(inst) {
        return this.colliders_[inst];
    }
    rigidBody(inst) {
        return this.physicsWorld.asRigidBody(this.colliders_[inst]);
    }
    ghostObject(inst) {
        return this.physicsWorld.asGhostObject(this.colliders_[inst]);
    }
}

/**
 * @stardazed/physics - physics simulation
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { makeShape, makeDefaultPhysicsConfig, PhysicsWorld, ColliderComponent };
//# sourceMappingURL=index.esm.js.map
