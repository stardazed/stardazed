// system/scene - single scene management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd {

	export interface SceneDelegate {
		scene: Scene;

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
	}

	export class Scene {
		readonly rd: render.RenderDevice;
		readonly ad: audio.AudioDevice;

		readonly entities: entity.EntityManager;
		readonly transforms: entity.TransformComponent;
		readonly meshes: entity.MeshComponent;
		readonly lights: entity.LightComponent;
		// readonly renderers: entity.MeshRendererComponent;
		// readonly colliders: entity.ColliderComponent;

		readonly lighting: system.Lighting;
		readonly physics: system.Physics;

		private state_: SceneState;
		readonly delegate: SceneDelegate;

		readonly assetURLMapping: { readonly [name: string]: string };
		readonly assets: { [name: string]: any };

		constructor(rd: render.RenderDevice, ad: audio.AudioDevice, config: SceneConfig) {
			this.state_ = SceneState.Uninitialized;
			this.delegate = config.delegate;
			this.delegate.scene = this;

			// -- global systems
			this.rd = rd;
			this.ad = ad;

			// -- entities and components (scene-local)
			this.entities = new entity.EntityManager();
			this.transforms = new entity.TransformComponent();
			this.meshes = new entity.MeshComponent();
			this.lights = new entity.LightComponent(this.transforms);

			// -- controlling systems (scene-local)
			this.lighting = new system.Lighting();
			this.physics = new system.Physics();

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
			setTimeout(50, () => {
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
			if (this.delegate.finishedLoadingEntities) {
				this.delegate.finishedLoadingEntities();
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
