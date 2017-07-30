// physics/physics - physics controlling system
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.physics {

	export class PhysicsSystem {
		private readonly transforms_: entity.TransformComponent;
		private readonly colliders_: entity.ColliderComponent;
		private readonly world_: PhysicsWorld;
		private readonly tempBtTrans_: Ammo.btTransform;

		constructor(colliders: entity.ColliderComponent, transforms: entity.TransformComponent) {
			this.colliders_ = colliders;
			this.transforms_ = transforms;
			this.world_ = this.colliders_.physicsWorld;

			this.tempBtTrans_ = new Ammo.btTransform();
		}

		update(timeStep: number) {
			const world = this.world_.implementation;

			world.stepSimulation(timeStep, 2, 1 / 60);
			this.colliders_.forEach((_coll, trans, rigidBody) => {
				const ms = rigidBody.getMotionState();
				ms.getWorldTransform(this.tempBtTrans_);

				const pos = this.tempBtTrans_.getOrigin();
				const rot = this.tempBtTrans_.getRotation();

				// FIXME: if item is parented, make position/rotation parent relative
				this.transforms_.setPositionAndRotation(trans, [pos.x(), pos.y(), pos.z()], [rot.x(), rot.y(), rot.z(), rot.w()]);
			});
		}
	}

} // ns sd.physics
