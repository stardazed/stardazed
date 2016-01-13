// scene - manages a set of related components
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export class Scene {
		entityMgr: EntityManager;
		transformMgr: TransformManager;
		lightMgr: LightManager;
		stdMaterialMgr: StdMaterialManager;
		stdModelMgr: StdModelManager;
		physMatMgr: PhysicsMaterialManager;
		rigidBodyMgr: RigidBodyManager;
		colliderMgr: ColliderManager;

		constructor(rc: render.RenderContext) {
			this.entityMgr = new EntityManager();
			this.transformMgr = new TransformManager();
			this.lightMgr = new LightManager(this.transformMgr);
			this.stdMaterialMgr = new StdMaterialManager();
			this.stdModelMgr = new StdModelManager(rc, this.transformMgr, this.stdMaterialMgr, this.lightMgr);
			this.physMatMgr = new PhysicsMaterialManager();
			this.rigidBodyMgr = new RigidBodyManager(this.transformMgr);
			this.colliderMgr = new ColliderManager(this.transformMgr, this.rigidBodyMgr, this.physMatMgr);
		}

		
	}

} // ns sd.world
