// scene - manages a set of related components
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export interface Scene {
		entityMgr: EntityManager;
		transformMgr: TransformManager;
		lightMgr: LightManager;
		stdMaterialMgr: StdMaterialManager;
		stdModelMgr: StdModelManager;
		rigidBodyMgr: RigidBodyManager;
	}


	export function makeScene(rc: render.RenderContext, sharedEntityMgr?: EntityManager): Scene {
		var em = sharedEntityMgr || new EntityManager();
		var txm = new TransformManager();
		var lm = new LightManager(txm);
		var smam = new StdMaterialManager();
		var smom = new StdModelManager(rc, txm, smam, lm);
		var rbm = new RigidBodyManager(txm);

		return {
			entityMgr: em,
			transformMgr: txm,
			lightMgr: lm,
			stdMaterialMgr: smam,
			stdModelMgr: smom,
			rigidBodyMgr: rbm
		};
	}

} // ns sd.world
