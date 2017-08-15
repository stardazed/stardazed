// system/scene - single scene management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd {

	export interface SceneDelegate {
		scene: Scene;

		// HACK: LD39
		loadAssets(): Promise<render.RenderCommandBuffer>;
		buildWorld(): Promise<void>;

		// callbacks
		willLoadAssets?(): void;
		assetLoadProgress?(ratio: number): void;
		finishedLoadingAssets?(): void;

		willLoadEntities?(): void;
		finishedLoadingEntities?(): void;

		setup?(): void;
		teardown?(): void;

		willSuspend?(): void;
		willResume?(): void;

		willEnter?(): void;
		willExit?(): void;

		update?(timeStep: number): void;
	}

	export const enum SceneState {
		Uninitialized,
		LoadingAssets,
		LoadingEntities,
		Ready,
		Running,
		Suspended
	}

	// for now, this represents what would be present in a level file
	export interface SceneConfig {
		delegate: SceneDelegate;
		assetURLMapping: { [name: string]: string }; // name -> url mapping
		physicsConfig: physics.PhysicsConfig;
	}

	export class Scene {
		readonly rw: render.RenderWorld;
		readonly ad: audio.AudioDevice;

		readonly entities: entity.EntityManager;
		readonly transforms: entity.TransformComponent;
		readonly meshes: entity.MeshComponent;
		readonly lights: entity.LightComponent;
		readonly renderers: entity.MeshRendererComponent;
		readonly colliders: entity.ColliderComponent;

		readonly physicsWorld: physics.PhysicsWorld;
		readonly camera: math.Camera;

		private state_: SceneState;
		readonly delegate: SceneDelegate;

		readonly assetURLMapping: { readonly [name: string]: string };
		readonly assets: { [name: string]: any };

		constructor(rw: render.RenderWorld, ad: audio.AudioDevice, config: SceneConfig) {
			this.state_ = SceneState.Uninitialized;
			this.delegate = config.delegate;
			this.delegate.scene = this;

			// -- global systems
			this.rw = rw;
			this.ad = ad;

			// -- entities and components (scene-local)
			this.entities = new entity.EntityManager();
			this.transforms = new entity.TransformComponent();
			this.meshes = new entity.MeshComponent();
			this.lights = new entity.LightComponent(this.transforms);
			this.renderers = new entity.MeshRendererComponent();
			this.physicsWorld = new physics.PhysicsWorld(config.physicsConfig);
			this.colliders = new entity.ColliderComponent(this.physicsWorld, this.transforms);

			// -- controlling systems (scene-local)
			this.camera = new math.Camera(rw.drawableWidth, rw.drawableHeight);

			// -- assets
			this.assetURLMapping = { ...config.assetURLMapping };
			this.assets = {};
			this.startLoading();
		}

		private startLoading() {
			if (this.state_ !== SceneState.Uninitialized) {
				return;
			}
			this.state_ = SceneState.LoadingAssets;
			
			if (this.delegate.willLoadAssets) {
				this.delegate.willLoadAssets();
			}

			// HACK: LD39
			this.delegate.loadAssets().then(rcb => {
				this.rw.rd.dispatch(rcb);
				this.rw.rd.processFrame();

				if (this.delegate.finishedLoadingAssets) {
					this.delegate.finishedLoadingAssets();
				}
				this.loadEntities();
			});
		}

		private loadEntities() {
			this.state_ = SceneState.LoadingEntities;

			if (this.delegate.willLoadEntities) {
				this.delegate.willLoadEntities();
			}
			// TBI: load entity and world data from level file
			// HACK: LD39
			this.delegate.buildWorld().then(() => {
				this.state_ = SceneState.Ready;
				if (this.delegate.finishedLoadingEntities) {
					this.delegate.finishedLoadingEntities();
				}
				App.messages.send("SceneLoaded", this);
			});
		}

		frame(dt: number) {
			if (this.delegate.update) {
				this.delegate.update(dt);
			}
		}

		suspend() {
			if (this.state_ !== SceneState.Running) {
				return;
			}
			if (this.delegate.willSuspend) {
				this.delegate.willSuspend();
			}
		}

		resume() {
			if (this.state_ !== SceneState.Suspended) {
				return;
			}
			if (this.delegate.willResume) {
				this.delegate.willResume();
			}
		}

		enter() {
			if (this.state_ !== SceneState.Ready) {
				return;
			}
			if (this.delegate.willEnter) {
				this.delegate.willEnter();
			}
			this.state_ = SceneState.Running;
		}

		exit() {
			if (this.state_ !== SceneState.Running) {
				return;
			}
			if (this.delegate.willExit) {
				this.delegate.willExit();
			}
			this.state_ = SceneState.Ready;
		}

		get state() { return this.state_; }
	}

} // ns sd
