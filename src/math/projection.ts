// math/projection - simple projection utils
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.math {

	export interface ProjectionSetup {
		projectionMatrix: Float4x4;
		viewMatrix: Float4x4;
		viewProjMatrix: Float4x4;
	}

	export class Camera implements ProjectionSetup {
		private viewport_: render.Viewport;
		private proj_: Float4x4;
		private view_: Float4x4;
		private viewProj_: Float4x4;

		constructor(viewportWidth: number, viewportHeight: number) {
			this.viewport_ = render.makeViewport();
			this.viewport_.width = viewportWidth;
			this.viewport_.height = viewportHeight;
			this.viewport_.originX = 0;
			this.viewport_.originY = 0;
			
			this.proj_ = mat4.create();
			this.view_ = mat4.create();
			this.viewProj_ = mat4.create();
		}

		resizeViewport(newWidth: number, newHeight: number) {
			this.viewport_.width = newWidth;
			this.viewport_.height = newHeight;
		}

		updateViewProjMatrix() {
			mat4.multiply(this.viewProj_, this.proj_, this.view_);
		}

		perspective(fovDegrees: number, nearZ: number, farZ: number, aspect?: number) {
			if (aspect === undefined) {
				aspect = this.viewport_.width / this.viewport_.height;
			}
			const fov = math.deg2rad(fovDegrees);
			this.viewport_.nearZ = nearZ;
			this.viewport_.farZ = farZ;
			mat4.perspective(this.proj_, fov, aspect, nearZ, farZ);
			this.updateViewProjMatrix();
		}

		ortho2D(left: number, top: number, right: number, bottom: number) {
			mat4.ortho(this.proj_, left, right, bottom, top, 1, 2);
			this.updateViewProjMatrix();
		}

		setViewMatrix(v: ConstFloat4x4) {
			mat4.copy(this.view_, v);
			this.updateViewProjMatrix();
		}

		lookAt(eye: ConstFloat3, target: ConstFloat3, up: ConstFloat3) {
			mat4.lookAt(this.view_, eye, target, up);
			this.updateViewProjMatrix();
		}

		get projectionMatrix(): Float4x4 { return this.proj_; }
		get viewMatrix(): ConstFloat4x4 { return this.view_; }
		get viewProjMatrix(): ConstFloat4x4 { return this.viewProj_; }

		get viewport(): Readonly<render.Viewport> { return this.viewport_; }
	}

} // sd.world
