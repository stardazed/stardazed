// system/application - Browser interaction and game driver
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd {

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

		private processSceneFrame(scene: Scene) {
			const rcmds: render.RenderCommandBuffer[] = [];

			rcmds.push(scene.lighting.prepareLightsForRender(
				scene.lights.allEnabled(),
				scene.camera,
				image.makePixelDimensions(100, 100),
				render.makeViewport()
			));

			scene.rd.dispatch(rcmds);
			scene.rd.processFrame();
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
				this.processSceneFrame(this.scene_);
			}

			// reset io devices
			control.keyboard.resetHalfTransitions();

			if (this.state_ === ApplicationState.Running) {
				this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
			}
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
	}

	export const app: Application = new SDApplication();

	dom.on(document, "DOMContentLoaded", () => {
		app.initialize();
	});

} // ns sd
