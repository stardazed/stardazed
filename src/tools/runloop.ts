// tools/runloop - Browser interaction and game driver
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd {

	export const enum RunLoopState {
		Idle,
		Running
	}


	export interface SceneController {
		renderFrame(timeStep: number): void;
		simulationStep(timeStep: number): void;

		resume?(): void;
		suspend?(): void;

		focus?(): void;
		blur?(): void;
	}


	export class RunLoop {
		private tickDuration_ = math.hertz(60);
		private maxFrameDuration_ = this.tickDuration_ * 2;

		private globalTime_ = 0;
		private lastFrameTime_ = 0;

		private runState_ = RunLoopState.Idle;
		private rafID_ = 0;
		private nextFrameFn_: FrameRequestCallback;

		private sceneCtrl_: SceneController | null = null;


		constructor() {
			this.nextFrameFn_ = this.nextFrame.bind(this);
		}


		private nextFrame(now: number) {
			// if we exceed the max frame time then we will start introducing
			// real lag and slowing the game down to catch up
			let dt = (now - this.lastFrameTime_) / 1000.0;
			if (dt > this.maxFrameDuration_) {
				dt = this.maxFrameDuration_;
			}
			this.lastFrameTime_ = now;
			this.globalTime_ += dt;

			if (this.sceneCtrl_) {
				// TODO: split up simulation step into phases for physics / AI, etc.
				// and run simulations in fixed timesteps
				this.sceneCtrl_.simulationStep(dt);
				this.sceneCtrl_.renderFrame(dt);
			}

			// reset io devices
			io.keyboard.resetHalfTransitions();

			if (this.runState_ == RunLoopState.Running) {
				this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
			}
		}


		start() {
			if (this.runState_ != RunLoopState.Idle) {
				return;
			}

			this.runState_ = RunLoopState.Running;
			if (this.sceneCtrl_) {
				if (this.sceneCtrl_.resume) {
					this.sceneCtrl_.resume();
				}
			}

			this.lastFrameTime_ = performance.now();
			this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
		}


		stop() {
			if (this.runState_ != RunLoopState.Running) {
				return;
			}

			this.runState_ = RunLoopState.Idle;
			if (this.sceneCtrl_) {
				if (this.sceneCtrl_.suspend) {
					this.sceneCtrl_.suspend();
				}
			}

			if (this.rafID_) {
				cancelAnimationFrame(this.rafID_);
				this.rafID_ = 0;
			}
		}


		get globalTime() {
			return this.globalTime_;
		}


		get sceneController() {
			return this.sceneCtrl_;
		}

		set sceneController(newCtrl: SceneController | null) {
			if (this.sceneCtrl_) {
				if (this.runState_ == RunLoopState.Running) {
					if (this.sceneCtrl_.suspend) {
						this.sceneCtrl_.suspend();
					}
				}
				if (this.sceneCtrl_.blur) {
					this.sceneCtrl_.blur();
				}
			}

			this.sceneCtrl_ = newCtrl;

			if (this.sceneCtrl_) {
				if (this.sceneCtrl_.focus) {
					this.sceneCtrl_.focus();
				}
				if (this.runState_ == RunLoopState.Running) {
					if (this.sceneCtrl_.resume) {
						this.sceneCtrl_.resume();
					}
				}
			}
		}
	}


	export const defaultRunLoop = new RunLoop();

	dom.on(window, "blur", function() {
		defaultRunLoop.stop();
	});

	dom.on(window, "focus", function() {
		defaultRunLoop.start();
	});

} // ns sd
