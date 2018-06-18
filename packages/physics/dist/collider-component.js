/**
 * physics/collider-entity - Collider/RigidBody component
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { SInt32 } from "@stardazed/core";
import { MultiArrayBuffer } from "@stardazed/container";
import { InstanceLinearRange } from "@stardazed/entity";
import { mat3, mat4, quat } from "@stardazed/math";
export class ColliderComponent {
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
//# sourceMappingURL=collider-component.js.map