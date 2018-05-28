/// <reference types="@stardazed/ammo" />
/**
 * physics/physicsworld - physics configuration and world container
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { ConstFloat3, ConstFloat4, Float3 } from "@stardazed/core";
import { PhysicsShape } from "./shapes";
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
export declare function makeDefaultPhysicsConfig(): PhysicsConfig;
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
    friction?: number;
    restitution?: number;
    positionConstraints?: [boolean, boolean, boolean];
    rotationConstraints?: [boolean, boolean, boolean];
    collisionFilterGroup?: number;
    collisionFilterMask?: number;
}
export interface GhostDescriptor {
    shape: PhysicsShape;
    worldPos?: ConstFloat3;
    worldRot?: ConstFloat4;
}
export declare class PhysicsWorld {
    private world_;
    private defaultLinearDrag_;
    private defaultAngularDrag_;
    private defaultFriction_;
    private defaultRestitution_;
    private haveGhosts_;
    constructor(config: PhysicsConfig);
    createRigidBody(desc: RigidBodyDescriptor): Ammo.btRigidBody;
    removeCollisionObject(co: Ammo.btCollisionObject): void;
    createGhostTrigger(desc: GhostDescriptor): Ammo.btGhostObject;
    asRigidBody(collObj: Ammo.btCollisionObject): Ammo.btRigidBody | undefined;
    asGhostObject(collObj: Ammo.btCollisionObject): Ammo.btGhostObject | undefined;
    addConstraint(constraint: Ammo.btTypedConstraint, disableCollisionsBetweenLinkedBodies?: boolean): void;
    removeConstraint(constraint: Ammo.btTypedConstraint): void;
    private rayCastInternal(resultClass, filter, worldFrom, worldToOrDir, maxDist?);
    rayTestTarget(worldFrom: Float3, worldTo: Float3, filter?: Ammo.CollisionFilterGroups): boolean;
    rayTest(worldFrom: Float3, worldDir: Float3, maxDistance: number, filter?: Ammo.CollisionFilterGroups): boolean;
    private closestRaycastHit(crr);
    rayCastClosestTarget(worldFrom: Float3, worldTo: Float3, filter?: Ammo.CollisionFilterGroups): RaycastHit | undefined;
    rayCastClosest(worldFrom: Float3, worldDir: Float3, maxDistance: number, filter?: Ammo.CollisionFilterGroups): RaycastHit | undefined;
    private allRaycastHits(arr);
    rayCastAllTarget(worldFrom: Float3, worldTo: Float3, filter?: Ammo.CollisionFilterGroups): RaycastHit[];
    rayCastAll(worldFrom: Float3, worldDir: Float3, maxDistance: number, filter?: Ammo.CollisionFilterGroups): RaycastHit[];
}
