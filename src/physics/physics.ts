// physics/physics - physics controlling system
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.physics {

	export class PhysicsSystem {
		private readonly transforms_: entity.TransformComponent;
		private readonly colliders_: entity.ColliderComponent;
		private readonly world_: PhysicsWorld;

		constructor(colliders: entity.ColliderComponent, transforms: entity.TransformComponent) {
			this.transforms_ = transforms;
			this.colliders_ = colliders;
			this.world_ = this.colliders_.physicsWorld;
		}

	}

} // ns sd.physics
