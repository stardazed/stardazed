// input/flycam - convenience functions for free flying entity controller
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.io {

	export class FlyCam {
		private pos_ = [0, 0, 0];
		private angleX_ = 0;
		private angleY_ = Math.PI;
		private rot_: sd.Float4;
		private dir_ = [0, 0, -1];
		private up_ = [0, 1, 0];
		private speed_ = 0;
		private sideSpeed_ = 0;

		constructor(initialPos: sd.Float3) {
			vec3.copy(this.pos_, initialPos);
			this.rotate([0, 0]);
		}

		update(timeStep: number, acceleration: number, sideAccel: number) {
			this.speed_ += timeStep * acceleration;
			this.sideSpeed_ += timeStep * sideAccel;

			vec3.scaleAndAdd(this.pos_, this.pos_, this.dir_, this.speed_);
			const right = vec3.cross([], this.dir_, this.up_);
			vec3.scaleAndAdd(this.pos_, this.pos_, right, this.sideSpeed_);

			this.speed_ *= 0.9;
			if (Math.abs(this.speed_) < 0.001) {
				this.speed_ = 0;
			}
			this.sideSpeed_ *= 0.9;
			if (Math.abs(this.sideSpeed_) < 0.001) {
				this.sideSpeed_ = 0;
			}
		}

		rotate(localRelXY: sd.Float2) {
			this.angleX_ -= Math.PI * 1.5 * localRelXY[1];
			this.angleY_ += Math.PI * 2 * localRelXY[0];
			this.rot_ = quat.fromEuler(0, this.angleY_, this.angleX_);
			vec3.transformQuat(this.dir_, [0, 0, 1], this.rot_);
			vec3.normalize(this.dir_, this.dir_);
			vec3.transformQuat(this.up_, [0, 1, 0], this.rot_);
			vec3.normalize(this.up_, this.up_);
		}

		get pos() { return this.pos_; }
		get dir() { return this.dir_; }
		get rotation() { return this.rot_; }
		get focusPos() { return vec3.add([], this.pos_, this.dir_); }
		get viewMatrix() { return mat4.lookAt([], this.pos_, this.focusPos, this.up_); }
	}


	export class FlyCamController {
		cam: FlyCam;
		private vpWidth_: number;
		private vpHeight_: number;
		private tracking_ = false;

		private lastPos_ = [0, 0];
		private deviceTilt_ = 0;
		private deviceTouch_ = false;

		constructor(sensingElem: HTMLElement, initialPos: sd.Float3) {
			this.cam = new FlyCam(initialPos);

			this.vpWidth_ = sensingElem.offsetWidth;
			this.vpHeight_ = sensingElem.offsetHeight;

			// -- mouse based rotation
			dom.on(sensingElem, "mousedown", (evt: MouseEvent) => {
				this.tracking_ = true;
				this.lastPos_ = [evt.clientX, evt.clientY];
			});

			dom.on(window, "mousemove", (evt: MouseEvent) => {
				if (!this.tracking_) {
					return;
				}
				const newPos = [evt.clientX, evt.clientY];
				const delta = vec2.sub([], newPos, this.lastPos_);
				vec2.divide(delta, delta, [-this.vpWidth_, -this.vpHeight_]);
				this.lastPos_ = newPos;

				this.cam.rotate(delta);
			});

			dom.on(window, "mouseup", (_evt: MouseEvent) => {
				this.tracking_ = false;
			});

			dom.on(window, "deviceorientation", (evt: DeviceOrientationEvent) => {
				this.deviceTilt_ = evt.beta! * Math.sign(evt.gamma || 0);
			});
			dom.on(window, "touchstart", (_evt: TouchEvent) => {
				this.deviceTouch_ = true;
			});
			dom.on(window, "touchend", (_evt: TouchEvent) => {
				this.deviceTouch_ = false;
			});
			dom.on(window, "touchcancel", (_evt: TouchEvent) => {
				this.deviceTouch_ = false;
			});
		}

		step(timeStep: number) {
			const maxAccel = 0.8;
			let accel = 0, sideAccel = 0;

			if (io.keyboard.down(io.Key.UP) || io.keyboard.down(io.Key.W)) {
				accel = maxAccel;
			}
			else if (io.keyboard.down(io.Key.DOWN) || io.keyboard.down(io.Key.S)) {
				accel = -maxAccel;
			}
			if (io.keyboard.down(io.Key.LEFT) || io.keyboard.down(io.Key.A)) {
				sideAccel = -maxAccel;
			}
			else if (io.keyboard.down(io.Key.RIGHT) || io.keyboard.down(io.Key.D)) {
				sideAccel = maxAccel;
			}
			if (this.deviceTouch_) {
				accel = maxAccel;
			}

			// this.cam.rotate([math.clamp(this.deviceTilt_ / 4000, -1, 1), 0]);
			this.cam.update(timeStep, accel, sideAccel);
		}
	}

} // ns sd
