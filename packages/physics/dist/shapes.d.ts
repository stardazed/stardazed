/**
 * physics/shapes - shape definitions and creation
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/// <reference types="@stardazed/ammo" />
import { Float3, NumArray } from "@stardazed/core";
export declare const enum PhysicsShapeType {
    None = 0,
    Box = 1,
    Sphere = 2,
    Capsule = 3,
    Cylinder = 4,
    Cone = 5,
    Plane = 6,
    ConvexHull = 7,
    Mesh = 8,
    HeightField = 9
}
export interface BoxShapeDescriptor {
    type: PhysicsShapeType.Box;
    halfExtents: Float3;
    margin?: number;
    scale?: Float3;
}
export interface SphereShapeDescriptor {
    type: PhysicsShapeType.Sphere;
    radius: number;
    margin?: number;
    scale?: Float3;
}
export interface CapsuleShapeDescriptor {
    type: PhysicsShapeType.Capsule;
    radius: number;
    height: number;
    orientation: Ammo.AxisIndex;
    margin?: number;
    scale?: Float3;
}
export interface CylinderShapeDescriptor {
    type: PhysicsShapeType.Cylinder;
    halfExtents: Float3;
    orientation: Ammo.AxisIndex;
    margin?: number;
    scale?: Float3;
}
export interface ConeShapeDescriptor {
    type: PhysicsShapeType.Cone;
    radius: number;
    height: number;
    orientation: Ammo.AxisIndex;
    scale?: Float3;
}
export interface PlaneShapeDescriptor {
    type: PhysicsShapeType.Plane;
    planeNormal: Float3;
    planeConstant: number;
    scale?: Float3;
}
export interface ConvexHullShapeDescriptor {
    type: PhysicsShapeType.ConvexHull;
    pointCount: number;
    points: NumArray;
    margin?: number;
    scale?: Float3;
}
export interface MeshShapeDescriptor {
    type: PhysicsShapeType.Mesh;
    subMeshIndex?: number;
    convex?: boolean;
    margin?: number;
    scale?: Float3;
}
export interface HeightFieldShapeDescriptor {
    type: PhysicsShapeType.HeightField;
    gridWidth: number;
    gridDepth: number;
    minHeight: number;
    maxHeight: number;
    heightScale?: number;
    orientation?: Ammo.AxisIndex;
    margin?: number;
    scale?: Float3;
}
export declare type PhysicsShapeDescriptor = BoxShapeDescriptor | SphereShapeDescriptor | CapsuleShapeDescriptor | CylinderShapeDescriptor | ConeShapeDescriptor | ConvexHullShapeDescriptor | PlaneShapeDescriptor | HeightFieldShapeDescriptor | MeshShapeDescriptor;
export interface PhysicsShape {
    readonly type: PhysicsShapeType;
    readonly shape: Ammo.btCollisionShape;
}
export declare function makeShape(desc: PhysicsShapeDescriptor): PhysicsShape | undefined;
