// system/scene - single scene management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd {

	export interface SceneDelegate {
		scene: Scene;

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

	// for now, this represents what would be present in a scene file
	export interface SceneConfig {
		delegate: SceneDelegate;
		assets: asset.Asset[];
		// graphicsConfig: {};
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

		private readonly cache: asset.Cache;
		private readonly pipeline: asset.AssetPipeline;
		private readonly localAssets: asset.Asset[];
		readonly assets: asset.CacheAccess;
		private totalAssetCount_ = 0;
		private loadedAssetCount_ = 0;

		private state_: SceneState;
		readonly delegate: SceneDelegate;

		constructor(rw: render.RenderWorld, ad: audio.AudioDevice, config: SceneConfig) {
			this.state_ = SceneState.Uninitialized;
			this.localAssets = config.assets;
			this.delegate = config.delegate;
			this.delegate.scene = this;

			// -- global systems
			this.rw = rw;
			this.ad = ad;

			// -- scene assets
			this.cache = {};
			this.pipeline = asset.makePipeline([
				asset.counter(this),
				asset.generator,
				asset.identifier,
				asset.loader({
					type: "chain",
					loaders: [
						{ type: "data-url" },
						{ type: "rooted", prefix: "data", loader: { type: "doc-relative-url", relPath: "data/" } }
					]
				}),
				asset.importerx,
				asset.dependencies(() => this.pipeline),
				asset.importFlattener,
				asset.parser,
				asset.cacheFeeder(this.cache),
				asset.allocator(rw.rd)
			]);
			this.assets = asset.cacheAccessor(this.cache);

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
			this.startLoading();
		}

		assetStarted() {
			this.totalAssetCount_ += 1;
			if (this.delegate.assetLoadProgress) {
				this.delegate.assetLoadProgress(this.loadedAssetCount_ / this.totalAssetCount_);
			}
		}

		assetCompleted() {
			this.loadedAssetCount_ += 1;
			if (this.delegate.assetLoadProgress) {
				this.delegate.assetLoadProgress(this.loadedAssetCount_ / this.totalAssetCount_);
			}
		}

		private startLoading() {
			if (this.state_ !== SceneState.Uninitialized) {
				return;
			}
			this.state_ = SceneState.LoadingAssets;
			
			if (this.delegate.willLoadAssets) {
				this.delegate.willLoadAssets();
			}

			Promise.all(this.localAssets.map(asset =>
				this.pipeline(asset))).then(() => {
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

			// TODO: load entity and world data from level file

			if (this.delegate.finishedLoadingEntities) {
				this.delegate.finishedLoadingEntities();
			}

			if (this.delegate.setup) {
				this.delegate.setup();
			}
			this.state_ = SceneState.Ready;
			App.messages.send("SceneLoaded", this);
		}

		frame(dt: number) {
			if (this.state_ !== SceneState.Running) {
				return;
			}
			if (this.delegate.update) {
				this.delegate.update(dt);
			}
			this.physicsWorld.update(dt, this.colliders, this.transforms);
			this.rw.drawScene(this);
			this.rw.rd.processFrame();
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
