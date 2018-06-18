/**
 * physics/collider-entity - Collider/RigidBody component
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/// <reference types="@stardazed/ammo" />
import { TransformComponent, TransformInstance } from "@stardazed/component-transform";
import { Component, Entity, Instance, InstanceRange, InstanceSet, InstanceIterator, InstanceArrayView } from "@stardazed/entity";
import { GhostDescriptor, PhysicsWorld, RigidBodyDescriptor } from "./physicsworld";
import { PhysicsShapeType } from "./shapes";
export declare const enum ColliderType {
    RigidBody = 1,
    GhostObject = 2
}
export interface RigidBodyCollider {
    type: ColliderType.RigidBody;
    rigidBody: RigidBodyDescriptor;
}
export interface GhostObjectCollider {
    type: ColliderType.GhostObject;
    ghost: GhostDescriptor;
}
export declare type Collider = RigidBodyCollider | GhostObjectCollider;
export declare type ColliderInstance = Instance<ColliderComponent>;
export declare type ColliderRange = InstanceRange<ColliderComponent>;
export declare type ColliderSet = InstanceSet<ColliderComponent>;
export declare type ColliderIterator = InstanceIterator<ColliderComponent>;
export declare type ColliderArrayView = InstanceArrayView<ColliderComponent>;
export declare class ColliderComponent implements Component<ColliderComponent> {
    private world_;
    private transforms_;
    private instanceData_;
    private entityBase_;
    private transformBase_;
    private shapeTypeBase_;
    private shapes_;
    private colliders_;
    private tempMat3_;
    private tempQuat_;
    constructor(world_: PhysicsWorld, transforms_: TransformComponent);
    private rebase;
    create(entity: Entity, collider: Collider): ColliderInstance;
    destroy(inst: ColliderInstance): void;
    destroyRange(range: ColliderRange): void;
    readonly count: number;
    valid(inst: ColliderInstance): boolean;
    all(): ColliderRange;
    forEach(fn: (inst: ColliderInstance, tx: TransformInstance, co: Ammo.btCollisionObject) => void): void;
    identify(co: Ammo.btCollisionObjectConst): Instance<ColliderComponent>;
    identifyEntity(co: Ammo.btCollisionObjectConst): Instance<import("../../../../../../../../Users/arthur/Sites/sdtx/stardazed/node_modules/@stardazed/entity/dist/entity").EntityManager>;
    readonly physicsWorld: PhysicsWorld;
    entity(inst: ColliderInstance): Instance<import("../../../../../../../../Users/arthur/Sites/sdtx/stardazed/node_modules/@stardazed/entity/dist/entity").EntityManager>;
    transform(inst: ColliderInstance): Instance<TransformComponent>;
    shapeType(inst: ColliderInstance): PhysicsShapeType;
    shape(inst: ColliderInstance): Ammo.btCollisionShape;
    collisionObject(inst: ColliderInstance): Ammo.btCollisionObject;
    rigidBody(inst: ColliderInstance): Ammo.btRigidBody | undefined;
    ghostObject(inst: ColliderInstance): Ammo.btGhostObject | undefined;
}
