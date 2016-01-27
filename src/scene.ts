// scene - manages a set of related components and provides convenience functions
// Part of Stardazed TX
// (c) 2015-6 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export interface EntityDescriptor {
		transform?: TransformDescriptor;
		model?: StdModelDescriptor;
		rigidBody?: RigidBodyDescriptor;
		collider?: ColliderDescriptor;
		light?: LightDescriptor;
	}


	export interface EntityInfo {
		entity: Entity;
		transform: TransformInstance;
		model?: StdModelInstance;
		rigidBody?: RigidBodyInstance;
		collider?: ColliderInstance;
		light?: LightInstance;
	}


	export class Scene {
		stdMaterialMgr: StdMaterialManager;
		physMatMgr: PhysicsMaterialManager;

		entityMgr: EntityManager;
		transformMgr: TransformManager;
		lightMgr: LightManager;
		stdModelMgr: StdModelManager;
		rigidBodyMgr: RigidBodyManager;
		colliderMgr: ColliderManager;

		constructor(rc: render.RenderContext) {
			this.stdMaterialMgr = new StdMaterialManager();
			this.physMatMgr = new PhysicsMaterialManager();

			this.entityMgr = new EntityManager();
			this.transformMgr = new TransformManager();

			this.lightMgr = new LightManager(this.transformMgr);
			this.stdModelMgr = new StdModelManager(rc, this.transformMgr, this.stdMaterialMgr, this.lightMgr);

			this.colliderMgr = new ColliderManager(this.physMatMgr);
			this.rigidBodyMgr = new RigidBodyManager(this.transformMgr, this.colliderMgr);
		}


		makeEntity(desc?: EntityDescriptor): EntityInfo {
			var ent = this.entityMgr.create();

			return {
				entity: ent,
				transform: this.transformMgr.create(ent, desc && desc.transform),
				model: desc && desc.model ? this.stdModelMgr.create(ent, desc.model) : null,
				rigidBody: desc && desc.rigidBody ? this.rigidBodyMgr.create(ent, desc.rigidBody) : null,
				collider: desc && desc.collider ? this.colliderMgr.create(ent, desc.collider) : null,
				light: desc && desc.light ? this.lightMgr.create(ent, desc.light) : null
			};
		}
	}

} // ns sd.world
