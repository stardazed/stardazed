// runloop - Browser interaction and game driver
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd {

	export const enum RunLoopState {
		Idle,
		Running
	}


	export class RunLoop {
		private tickDuration_ = math.hertz(60);
		private maxFrameDuration_ = this.tickDuration_ * 10; // 6 fps

		private globalTime_= 0;

		private runState_ = RunLoopState.Idle;
		private rafID_ = 0;
		private nextFrameFn_: FrameRequestCallback;

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


			if (this.runState_ == RunLoopState.Running) {
				this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
			}
		}


		start() {
			if (this.runState_ != RunLoopState.Idle)
				return;
			this.runState_ = RunLoopState.Running;

			// -- set time base
			const curTime = performance.now() / 1000.0;
			this.globalTime_ = curTime;

			this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
		}


		stop() {
			if (this.runState_ != RunLoopState.Running)
				return;
			this.runState_ = RunLoopState.Idle;

			if (this.rafID_) {
				cancelAnimationFrame(this.rafID_);
				this.rafID_ = 0;
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
