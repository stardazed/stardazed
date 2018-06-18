/**
 * @stardazed/transform-component - Transform component
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { Float3, Float4, Float4x4 } from "@stardazed/core";
import { Component, Entity, Instance, InstanceSet, InstanceArrayView, InstanceIterator, InstanceRange } from "@stardazed/entity";
export interface Transform {
    position: Float3;
    rotation?: Float4;
    scale?: Float3;
}
export declare type TransformInstance = Instance<TransformComponent>;
export declare type TransformRange = InstanceRange<TransformComponent>;
export declare type TransformSet = InstanceSet<TransformComponent>;
export declare type TransformIterator = InstanceIterator<TransformComponent>;
export declare type TransformArrayView = InstanceArrayView<TransformComponent>;
export declare class TransformComponent implements Component<TransformComponent> {
    private instanceData_;
    private entityBase_;
    private parentBase_;
    private firstChildBase_;
    private prevSiblingBase_;
    private nextSiblingBase_;
    private positionBase_;
    private rotationBase_;
    private scaleBase_;
    private localMatrixBase_;
    private worldMatrixBase_;
    private readonly defaultPos_;
    private readonly defaultRot_;
    private readonly defaultScale_;
    constructor();
    rebase(): void;
    create(linkedEntity: Entity, parent?: TransformInstance): TransformInstance;
    create(linkedEntity: Entity, desc?: Transform, parent?: TransformInstance): TransformInstance;
    destroy(_inst: TransformInstance): void;
    destroyRange(range: TransformRange): void;
    readonly count: number;
    valid(inst: TransformInstance): boolean;
    all(): TransformRange;
    forEntity(ent: Entity): TransformInstance;
    entity(inst: TransformInstance): Entity;
    parent(inst: TransformInstance): TransformInstance;
    firstChild(inst: TransformInstance): TransformInstance;
    prevSibling(inst: TransformInstance): TransformInstance;
    nextSibling(inst: TransformInstance): TransformInstance;
    localPosition(inst: TransformInstance): number[];
    localRotation(inst: TransformInstance): number[];
    localScale(inst: TransformInstance): number[];
    worldPosition(inst: TransformInstance): number[];
    localMatrix(inst: TransformInstance): import("../../../../../../../../Users/arthur/Sites/sdtx/stardazed/node_modules/@stardazed/core/dist/array").TypedArray;
    worldMatrix(inst: TransformInstance): import("../../../../../../../../Users/arthur/Sites/sdtx/stardazed/node_modules/@stardazed/core/dist/array").TypedArray;
    copyLocalMatrix(inst: TransformInstance): number[];
    copyWorldMatrix(inst: TransformInstance): number[];
    private applyParentTransform;
    setLocalMatrix(inst: TransformInstance, newLocalMatrix: Float4x4): void;
    setLocalMatrix(inst: TransformInstance, newRotation: Float4, newPosition: Float3, newScale: Float3): void;
    private removeFromParent;
    setParent(inst: TransformInstance, newParent: TransformInstance): void;
    setPosition(inst: TransformInstance, newPosition: Float3): void;
    setRotation(inst: TransformInstance, newRotation: Float4): void;
    setPositionAndRotation(inst: TransformInstance, newPosition: Float3, newRotation: Float4): void;
    setScale(inst: TransformInstance, newScale: Float3): void;
    setPositionAndRotationAndScale(inst: TransformInstance, newPosition: Float3, newRotation: Float4, newScale: Float3): void;
    translate(inst: TransformInstance, localDelta3: Float3): void;
    rotate(inst: TransformInstance, localRot: Float4): void;
    rotateRelWorld(inst: TransformInstance, worldRot: Float4): void;
    rotateByAngles(inst: TransformInstance, localAng: Float3): void;
}
