// system/physics - physics engine
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.system {

	export class Physics {
		private world_: Ammo.btDiscreteDynamicsWorld;

		constructor() {
			const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
			const overlappingPairCache = new Ammo.btAxisSweep3(new Ammo.btVector3(-100, -100, -100), new Ammo.btVector3(100, 100, 100));
			const solver = new Ammo.btSequentialImpulseConstraintSolver();

			this.world_ = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
			this.world_.setGravity( new Ammo.btVector3(0, -9.8, 0));
		}


	}

} // ns sd.system
