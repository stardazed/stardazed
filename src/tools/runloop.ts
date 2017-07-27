// tools/runloop - Browser interaction and game driver
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd {

	export interface SceneDelegate {
		update?(timeStep: number): void;

		resume?(): void;
		suspend?(): void;

		focus?(): void;
		blur?(): void;
	}


	export class Scene {
		readonly entities: entity.EntityManager;
		readonly transforms: entity.TransformComponent;
		readonly meshes: entity.MeshComponent;
		readonly lights: entity.LightComponent;
		// readonly renderers: entity.MeshRendererComponent;
		// readonly colliders: entity.ColliderComponent;

		delegate: SceneDelegate | undefined;

		constructor() {
			this.entities = new entity.EntityManager();
			this.transforms = new entity.TransformComponent();
			this.meshes = new entity.MeshComponent();
			this.lights = new entity.LightComponent(this.transforms);

			this.delegate = undefined;
		}
	}


	const enum ApplicationState {
		Uninitialized,
		Starting,
		Running,
		Suspended
	}

	export interface Application {
		initialize(): void;

		readonly globalTime: number;
		scene: Scene | undefined;
	}

	const TICK_DURATION = math.hertz(60);
	const MAX_FRAME_DURATION = TICK_DURATION * 2;

	class SDApplication implements Application {
		private globalTime_ = 0;
		private lastFrameTime_ = 0;

		private state_ = ApplicationState.Uninitialized;
		private rafID_ = 0;
		private nextFrameFn_: FrameRequestCallback;

		private scene_: Scene | undefined = undefined;

		initialize() {
			if (this.state_ !== ApplicationState.Uninitialized) {
				return;
			}
			this.state_ = ApplicationState.Starting;

			this.nextFrameFn_ = this.nextFrame.bind(this);

			dom.on(window, "blur", () => { this.suspend(); });
			dom.on(window, "focus", () => {	this.resume(); });
		}

		private nextFrame(now: number) {
			// if we exceed the max frame time then we will start introducing
			// real lag and slowing the game down to catch up
			let dt = (now - this.lastFrameTime_) / 1000.0;
			if (dt > MAX_FRAME_DURATION) {
				dt = MAX_FRAME_DURATION;
			}
			this.lastFrameTime_ = now;
			this.globalTime_ += dt;

			if (this.scene_) {
				/*
				this.scene_.notifyPrePhysics(dt);
				this.scene_.physics.update(dt);
				this.scene_.notifyPostPhysics(dt);
				
				
				*/
			}

			// reset io devices
			control.keyboard.resetHalfTransitions();

			this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
		}


		resume() {
			if (this.state_ !== ApplicationState.Suspended && this.state_ !== ApplicationState.Starting) {
				return;
			}
			this.state_ = ApplicationState.Running;

			if (this.scene_) {
				this.scene_.resume();
			}

			this.lastFrameTime_ = performance.now();
			this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
		}


		suspend() {
			if (this.state_ !== ApplicationState.Running) {
				return;
			}
			this.state_ = ApplicationState.Suspended;

			if (this.scene_) {
				this.scene_.suspend();
			}

			if (this.rafID_) {
				cancelAnimationFrame(this.rafID_);
				this.rafID_ = 0;
			}
		}


		get globalTime() {
			return this.globalTime_;
		}

		get scene() {
			return this.scene_;
		}

		set scene(newScene: Scene | undefined) {
			if (this.scene_) {
				if (this.state_ === ApplicationState.Running) {
					this.scene_.suspend();
				}
				this.scene_.blur();
			}

			this.scene_ = newScene;

			if (this.scene_) {
				this.scene_.focus();
				if (this.state_ === ApplicationState.Running) {
					this.scene_.resume();
				}
			}
		}
	}

	export const app: Application = new SDApplication();

	dom.on(document, "DOMContentLoaded", () => {
		app.initialize();
	});

} // ns sd
