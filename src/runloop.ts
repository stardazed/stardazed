// runloop - Browser interaction and game driver
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd {

	export const enum RunLoopState {
		Idle,
		Running
	}


	export interface SceneController {
		renderFrame(timeStep: number): void;
		simulationStep(timeStep: number): void;

		resume(): void;
		suspend(): void;

		scene: world.Scene;
	}


	export class RunLoop {
		private tickDuration_ = math.hertz(60);
		private maxFrameDuration_ = this.tickDuration_ * 10; // 6 fps

		private globalTime_ = 0;

		private runState_ = RunLoopState.Idle;
		private rafID_ = 0;
		private nextFrameFn_: FrameRequestCallback;

		private sceneCtrl_: SceneController = null;


		constructor() {
			this.nextFrameFn_ = this.nextFrame.bind(this);
		}


		private nextFrame(dt: number) {
			// if we exceed the max frame time then we will start introducing
			// real lag and slowing the game down to catch up
			if (dt > this.maxFrameDuration_) {
				dt = this.maxFrameDuration_;
			}
			this.globalTime_ += dt;

			if (this.sceneCtrl_) {
				// TODO: split up simulation step into phases for physics / AI, etc.
				// and run simulations in fixed timesteps
				this.sceneCtrl_.simulationStep(dt);
				this.sceneCtrl_.renderFrame(dt);
			}

			if (this.runState_ == RunLoopState.Running) {
				this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
			}
		}


		start() {
			if (this.runState_ != RunLoopState.Idle)
				return;

			this.runState_ = RunLoopState.Running;
			if (this.sceneCtrl_) {
				this.sceneCtrl_.resume();
			}

			this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
		}


		stop() {
			if (this.runState_ != RunLoopState.Running)
				return;

			this.runState_ = RunLoopState.Idle;
			if (this.sceneCtrl_) {
				this.sceneCtrl_.suspend();
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
		set sceneController(newCtrl: SceneController) {
			if (this.runState_ == RunLoopState.Running && this.sceneCtrl_) {
				this.sceneCtrl_.suspend();
			}
			this.sceneCtrl_ = newCtrl;
			if (this.runState_ == RunLoopState.Running && this.sceneCtrl_) {
				this.sceneCtrl_.resume();
			}
		}
	}


	var defaultRunLoop_s = new RunLoop();

	export function defaultRunLoop(): RunLoop {
		return defaultRunLoop_s;
	}


	on(window, "blur", function() {
		defaultRunLoop_s.stop();
	});

	on(window, "focus", function() {
		defaultRunLoop_s.start();
	});


} // ns sd
