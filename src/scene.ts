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
		rigidBodyMgr: RigidBodyManager;

		constructor(rc: render.RenderContext) {
			this.entityMgr = new EntityManager();
			this.transformMgr = new TransformManager();
			this.lightMgr = new LightManager(this.transformMgr);
			this.stdMaterialMgr = new StdMaterialManager();
			this.stdModelMgr = new StdModelManager(rc, this.transformMgr, this.stdMaterialMgr, this.lightMgr);
			this.rigidBodyMgr = new RigidBodyManager(this.transformMgr);
		}

		
	}

} // ns sd.world
