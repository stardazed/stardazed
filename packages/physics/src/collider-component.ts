/**
 * physics/collider-entity - Collider/RigidBody component
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { SInt32, ConstEnumArray32View } from "@stardazed/core";
import { MABField, MultiArrayBuffer, InvalidatePointers } from "@stardazed/container";
import { TransformArrayView, TransformComponent, TransformInstance } from "@stardazed/component-transform";
import { Component, Entity, EntityArrayView, Instance, InstanceRange, InstanceSet, InstanceIterator, InstanceArrayView, InstanceLinearRange } from "@stardazed/entity";
import { mat3, mat4, quat } from "@stardazed/math";

import { GhostDescriptor, PhysicsWorld, RigidBodyDescriptor } from "./physicsworld";
import { PhysicsShapeType } from "./shapes";

export const enum ColliderType {
	RigidBody = 1,
	GhostObject
}

export interface RigidBodyCollider {
	type: ColliderType.RigidBody;
	rigidBody: RigidBodyDescriptor;

}
export interface GhostObjectCollider {
	type: ColliderType.GhostObject;
	ghost: GhostDescriptor;
}

export type Collider = RigidBodyCollider | GhostObjectCollider;

export type ColliderInstance = Instance<ColliderComponent>;
export type ColliderRange = InstanceRange<ColliderComponent>;
export type ColliderSet = InstanceSet<ColliderComponent>;
export type ColliderIterator = InstanceIterator<ColliderComponent>;
export type ColliderArrayView = InstanceArrayView<ColliderComponent>;

export class ColliderComponent implements Component<ColliderComponent> {
	private instanceData_: MultiArrayBuffer;
	private entityBase_!: EntityArrayView;
	private transformBase_!: TransformArrayView;
	private shapeTypeBase_!: ConstEnumArray32View<PhysicsShapeType>;
	private shapes_: Ammo.btCollisionShape[];
	private colliders_: Ammo.btCollisionObject[];

	private tempMat3_ = mat4.create();
	private tempQuat_ = quat.create();

	constructor(private world_: PhysicsWorld, private transforms_: TransformComponent) {
		const instFields: MABField[] = [
			{ type: SInt32, count: 1 }, // entity
			{ type: SInt32, count: 1 }, // transform
			{ type: SInt32, count: 1 }, // collisionShapeType
		];
		this.instanceData_ = new MultiArrayBuffer(1024, instFields);
		this.rebase();

		this.shapes_ = [];
		this.colliders_ = [];
	}

	private rebase() {
		this.entityBase_ = this.instanceData_.indexedFieldView(0);
		this.transformBase_ = this.instanceData_.indexedFieldView(1);
		this.shapeTypeBase_ = this.instanceData_.indexedFieldView(2) as Int32Array;
	}

	create(entity: Entity, collider: Collider): ColliderInstance {
		if (this.instanceData_.extend() === InvalidatePointers.Yes) {
			this.rebase();
		}
		const instance = this.instanceData_.count;

		// collision object
		const transform = this.transforms_.forEntity(entity);
		const worldMat = this.transforms_.worldMatrix(transform);

		if (collider.type === ColliderType.RigidBody) {
			collider.rigidBody.worldRot = quat.fromMat3(this.tempQuat_, mat3.fromMat4(this.tempMat3_, worldMat));
			collider.rigidBody.worldPos = this.transforms_.worldPosition(transform);
			const rigidBody = this.physicsWorld.createRigidBody(collider.rigidBody);

			// link the Ammo RB back to the collider through the instance index
			rigidBody.setUserIndex(instance);

			this.shapeTypeBase_[instance] = collider.rigidBody.shape.type;
			this.shapes_[instance] = collider.rigidBody.shape.shape;
			this.colliders_[instance] = rigidBody;
		}
		else if (collider.type === ColliderType.GhostObject) {
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

	destroy(inst: ColliderInstance) {
		this.entityBase_[inst as number] = 0;
		this.transformBase_[inst as number] = 0;
		this.shapeTypeBase_[inst as number] = 0;
		delete this.shapes_[inst as number];

		const co = this.colliders_[inst as number];
		co.setUserIndex(0);
		this.physicsWorld.removeCollisionObject(co);
		delete this.colliders_[inst as number];
	}

	destroyRange(range: ColliderRange) {
		const iter = range.makeIterator();
		while (iter.next()) {
			this.destroy(iter.current);
		}
	}

	get count() { return this.instanceData_.count; }

	valid(inst: ColliderInstance) {
		return inst <= this.count && this.entityBase_[inst as number] > 0;
	}

	all(): ColliderRange {
		return new InstanceLinearRange<ColliderComponent>(1, this.count);
	}

	// FIXME: HACK, move to physicsworld
	forEach(fn: (inst: ColliderInstance, tx: TransformInstance, co: Ammo.btCollisionObject) => void) {
		const max = this.count;
		for (let cx = 1; cx <= max; ++cx) {
			if (this.entityBase_[cx as number] !== 0) {
				const tx = this.transformBase_[cx as number];
				const co = this.colliders_[cx as number];
				fn(cx, tx, co);
			}
		}
	}

	identify(co: Ammo.btCollisionObjectConst) {
		return co.getUserIndex() as ColliderInstance;
	}

	identifyEntity(co: Ammo.btCollisionObjectConst) {
		return this.entity(this.identify(co));
	}

	// --

	get physicsWorld() { return this.world_; }

	// -- single instance getters

	entity(inst: ColliderInstance) {
		return this.entityBase_[inst as number];
	}

	transform(inst: ColliderInstance) {
		return this.transformBase_[inst as number];
	}

	shapeType(inst: ColliderInstance) {
		return this.shapeTypeBase_[inst as number];
	}

	shape(inst: ColliderInstance) {
		return this.shapes_[inst as number];
	}

	collisionObject(inst: ColliderInstance) {
		return this.colliders_[inst as number];
	}

	rigidBody(inst: ColliderInstance) {
		return this.physicsWorld.asRigidBody(this.colliders_[inst as number]);
	}

	ghostObject(inst: ColliderInstance) {
		return this.physicsWorld.asGhostObject(this.colliders_[inst as number]);
	}
}