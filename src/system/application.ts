// system/application - Browser interaction and game driver
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

/// <reference path="messaging.ts" />

namespace sd {

	const enum ApplicationState {
		Uninitialized,
		Starting,
		Running,
		Suspended
	}

	export interface AppInitOptions {
		root: HTMLElement;
		width: number;
		height: number;
	}

	export interface Application {
		initialize(options: AppInitOptions): Promise<void>;
		readonly globalTime: number;
		readonly messages: Messaging;

		makeScene(config: SceneConfig): Scene;
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

		private messages_ = new Messaging();

		private renderWorld_!: render.RenderWorld;
		private audioDevice_!: audio.AudioDevice;
		private scene_: Scene | undefined = undefined;

		constructor() {
			this.state_ = ApplicationState.Starting;

			this.nextFrameFn_ = this.nextFrame.bind(this);
			this.messages.listen("SceneLoaded", undefined, (scene: Scene) => this.handleSceneLoaded(scene));

			window.addEventListener("blur", () => { this.suspend(); });
			window.addEventListener("focus", () => { this.resume(); });
		}

		initialize(options: AppInitOptions) {
			const main = () => {
				this.renderWorld_ = new render.RenderWorld(options.root, options.width, options.height);
				this.audioDevice_ = audio.makeAudioDevice();
				this.resume();			
			};
	
			if ("Ammo" in window) {
				return ((window as any).Ammo() as Promise<void>).then(main);
			}
			else {
				return Promise.resolve().then(main);
			}	
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
				this.scene_.frame(dt);
			}

			// reset io devices
			control.keyboard.resetPerFrameData();
			control.mouse.resetPerFrameData();

			if (this.state_ === ApplicationState.Running) {
				this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
			}
		}


		resume() {
			if (this.state_ !== ApplicationState.Suspended && this.state_ !== ApplicationState.Starting) {
				return;
			}
			this.state_ = ApplicationState.Running;

			// reset all control state when losing or gaining focus to avoid stuck buttons / keys
			control.keyboard.reset();
			control.mouse.reset();

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

			// reset all control state when losing or gaining focus to avoid stuck buttons / keys
			control.keyboard.reset();
			control.mouse.reset();

			if (this.rafID_) {
				cancelAnimationFrame(this.rafID_);
				this.rafID_ = 0;
			}
		}


		get globalTime() {
			return this.globalTime_;
		}

		get messages() {
			return this.messages_;
		}

		makeScene(config: SceneConfig) {
			return new Scene(this.renderWorld_, this.audioDevice_, config);
		}

		get scene() {
			return this.scene_;
		}

		set scene(newScene: Scene | undefined) {
			if (newScene === this.scene_) {
				return;
			}
			if (this.scene_) {
				if (this.state_ === ApplicationState.Running) {
					this.scene_.suspend();
				}
				this.scene_.exit();
			}

			this.scene_ = newScene;

			if (this.scene_) {
				this.scene_.enter();
				if (this.state_ === ApplicationState.Running) {
					this.scene_.resume();
				}
			}
		}

		private handleSceneLoaded(scene: Scene) {
			if (scene === this.scene_) {
				scene.enter();
				if (this.state_ === ApplicationState.Running) {
					this.scene_.resume();
				}
			}
		}
	}

	export const App: Application = new SDApplication();

} // ns sd
