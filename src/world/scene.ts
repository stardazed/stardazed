// world/scene - manages a set of related components and provides convenience functions
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.world {

	export interface EntityDescriptor {
		transform?: asset.Transform;
		parent?: TransformInstance;
		mesh?: asset.Mesh;
		stdModel?: StdModelDescriptor;
		pbrModel?: PBRModelDescriptor;
		rigidBody?: RigidBodyDescriptor;
		collider?: ColliderDescriptor;
		light?: asset.Light;
	}


	export interface EntityInfo {
		entity: Entity;
		transform: TransformInstance;
		mesh?: MeshInstance;
		stdModel?: StdModelInstance;
		pbrModel?: PBRModelInstance;
		rigidBody?: RigidBodyInstance;
		collider?: ColliderInstance;
		light?: LightInstance;
	}


	export class Scene {
		physMatMgr: PhysicsMaterialManager;

		entityMgr: EntityManager;
		transformMgr: TransformManager;
		lightMgr: LightManager;

		meshMgr: MeshManager;
		skeletonMgr: SkeletonManager;

		stdModelMgr: StdModelManager;
		pbrModelMgr: PBRModelManager;
		rigidBodyMgr: RigidBodyManager;
		colliderMgr: ColliderManager;

		constructor(rc: render.RenderContext) {
			this.physMatMgr = new PhysicsMaterialManager();

			this.entityMgr = new EntityManager();
			this.transformMgr = new TransformManager();

			this.meshMgr = new MeshManager(rc);
			this.skeletonMgr = new SkeletonManager(rc, this.transformMgr);
			this.lightMgr = new LightManager(rc, this.transformMgr);

			this.stdModelMgr = new StdModelManager(rc, this.transformMgr, this.meshMgr, this.skeletonMgr, this.lightMgr);
			this.pbrModelMgr = new PBRModelManager(rc, this.transformMgr, this.meshMgr, this.lightMgr);

			this.colliderMgr = new ColliderManager(this.physMatMgr);
			this.rigidBodyMgr = new RigidBodyManager(this.transformMgr);
		}


		makeEntity(desc?: EntityDescriptor): EntityInfo {
			const ent = this.entityMgr.create();

			const meshInstance = desc && desc.mesh ? this.meshMgr.create(desc.mesh) : undefined;
			if (meshInstance) {
				this.meshMgr.linkToEntity(meshInstance, ent);
			}

			return {
				entity: ent,
				transform: this.transformMgr.create(ent, desc && desc.transform, desc && desc.parent),
				mesh: meshInstance,
				stdModel: desc && desc.stdModel ? this.stdModelMgr.create(ent, desc.stdModel) : undefined,
				pbrModel: desc && desc.pbrModel ? this.pbrModelMgr.create(ent, desc.pbrModel) : undefined,
				rigidBody: desc && desc.rigidBody ? this.rigidBodyMgr.create(ent, desc.rigidBody) : undefined,
				collider: desc && desc.collider ? this.colliderMgr.create(ent, desc.collider) : undefined,
				light: desc && desc.light ? this.lightMgr.create(ent, desc.light) : undefined
			};
		}
	}

} // ns sd.world
