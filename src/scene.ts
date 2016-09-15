// scene - manages a set of related components and provides convenience functions
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	export interface EntityDescriptor {
		transform?: TransformDescriptor;
		parent?: TransformInstance;
		stdModel?: StdModelDescriptor;
		pbrModel?: PBRModelDescriptor;
		rigidBody?: RigidBodyDescriptor;
		collider?: ColliderDescriptor;
		light?: LightDescriptor;
	}


	export interface EntityInfo {
		entity: Entity;
		transform: TransformInstance;
		stdModel?: StdModelInstance;
		pbrModel?: PBRModelInstance;
		rigidBody?: RigidBodyInstance;
		collider?: ColliderInstance;
		light?: LightInstance;
	}


	export class Scene {
		stdMaterialMgr: StdMaterialManager;
		pbrMaterialMgr: PBRMaterialManager;
		physMatMgr: PhysicsMaterialManager;

		entityMgr: EntityManager;
		transformMgr: TransformManager;
		lightMgr: LightManager;
		stdModelMgr: StdModelManager;
		pbrModelMgr: PBRModelManager;
		rigidBodyMgr: RigidBodyManager;
		colliderMgr: ColliderManager;

		constructor(rc: render.RenderContext) {
			this.stdMaterialMgr = new StdMaterialManager();
			this.pbrMaterialMgr = new PBRMaterialManager();
			this.physMatMgr = new PhysicsMaterialManager();

			this.entityMgr = new EntityManager();
			this.transformMgr = new TransformManager();

			this.lightMgr = new LightManager(this.transformMgr);
			this.stdModelMgr = new StdModelManager(rc, this.transformMgr, this.stdMaterialMgr, this.lightMgr);
			this.pbrModelMgr = new PBRModelManager(rc, this.transformMgr, this.pbrMaterialMgr, this.lightMgr);

			this.colliderMgr = new ColliderManager(this.physMatMgr);
			this.rigidBodyMgr = new RigidBodyManager(this.transformMgr, this.colliderMgr);
		}


		makeEntity(desc?: EntityDescriptor): EntityInfo {
			var ent = this.entityMgr.create();

			return {
				entity: ent,
				transform: this.transformMgr.create(ent, desc && desc.transform, desc && desc.parent),
				stdModel: desc && desc.stdModel ? this.stdModelMgr.create(ent, desc.stdModel) : undefined,
				pbrModel: desc && desc.pbrModel ? this.pbrModelMgr.create(ent, desc.pbrModel) : undefined,
				rigidBody: desc && desc.rigidBody ? this.rigidBodyMgr.create(ent, desc.rigidBody) : undefined,
				collider: desc && desc.collider ? this.colliderMgr.create(ent, desc.collider) : undefined,
				light: desc && desc.light ? this.lightMgr.create(ent, desc.light) : undefined
			};
		}
	}

} // ns sd.world
