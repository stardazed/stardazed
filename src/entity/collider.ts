// entity/collider - Collider/RigidBody component
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="../physics/shapes.ts" />

namespace sd.entity {

	export interface Collider {
		rigidBody: physics.RigidBodyDescriptor;
	}

	export type ColliderInstance = Instance<ColliderComponent>;
	export type ColliderRange = InstanceRange<ColliderComponent>;
	export type ColliderSet = InstanceSet<ColliderComponent>;
	export type ColliderIterator = InstanceIterator<ColliderComponent>;
	export type ColliderArrayView = InstanceArrayView<ColliderComponent>;

	export class ColliderComponent implements Component<ColliderComponent> {
		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private shapeTypeBase_: ConstEnumArrayView<physics.PhysicsShapeType>;
		private shapes_: Ammo.btCollisionShape[];
		private colliders_: Ammo.btRigidBody[];

		private tempMat3_ = mat4.create();
		private tempQuat_ = quat.create();

		constructor(private world_: physics.PhysicsWorld, private transforms_: TransformComponent) {
			const instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: SInt32, count: 1 }, // collisionShapeType
			];
			this.instanceData_ = new container.MultiArrayBuffer(1024, instFields);
			this.rebase();

			this.shapes_ = [];
			this.colliders_ = [];
		}

		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.shapeTypeBase_ = this.instanceData_.indexedFieldView(2);
		}

		create(entity: Entity, collider: Collider): ColliderInstance {
			if (this.instanceData_.extend() === container.InvalidatePointers.Yes) {
				this.rebase();
			}
			const instance = this.instanceData_.count;

			// rigid body
			const transform = this.transforms_.forEntity(entity);
			const worldMat = this.transforms_.worldMatrix(transform);
			collider.rigidBody.worldRot = quat.fromMat3(this.tempQuat_, mat3.fromMat4(this.tempMat3_, worldMat));
			collider.rigidBody.worldPos = this.transforms_.worldPosition(transform);
			const rigidBody = this.physicsWorld.createRigidBody(collider.rigidBody);

			// linking
			this.entityBase_[instance] = entity;
			this.transformBase_[instance] = transform;
			this.shapeTypeBase_[instance] = collider.rigidBody.shape.type;
			this.shapes_[instance] = collider.rigidBody.shape.shape;
			this.colliders_[instance] = rigidBody;

			return instance;
		}

		destroy(inst: ColliderInstance) {
			this.entityBase_[inst as number] = 0;
			this.transformBase_[inst as number] = 0;
			this.shapeTypeBase_[inst as number] = 0;
			delete this.shapes_[inst as number];
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

		forEach(fn: (inst: ColliderInstance, tx: TransformInstance, rb: Ammo.btRigidBody) => void) {
			const max = this.count;
			for (let cx = 1; cx <= max; ++cx) {
				if (this.entityBase_[cx as number] !== 0) {
					const tx = this.transformBase_[cx as number];
					const rb = this.colliders_[cx as number];
					fn(cx, tx, rb);
				}
			}
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

		rigidBody(inst: ColliderInstance) {
			return this.colliders_[inst as number];
		}
	}

} // ns sd.entity
