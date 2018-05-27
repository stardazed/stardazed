/**
 * math/projection - simple projection utils
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { ConstFloat3, ConstFloat4x4, Float4x4 } from "@stardazed/core";
import { deg2rad } from "./common";
import * as mat4 from "./mat4";

export interface Viewport {
	originX: number;
	originY: number;
	width: number;
	height: number;
	nearZ: number;
	farZ: number;
}

export function makeViewport(): Viewport {
	return {
		originX: 0,
		originY: 0,
		width: 0,
		height: 0,
		nearZ: 0,
		farZ: 1
	};
}

// tslint:disable:whitespace
export function viewportMatrix(x: number, y: number, w: number, h: number, n: number, f: number): Float4x4 {
	return [
		w / 2, 0, 0, 0,
		0, h / 2, 0, 0,
		0, 0, (f - n) / 2, 0,
		w / 2 + x, h / 2 + y, (f + n) / 2, 1
	];
}
// tslint:enable:whitespace

export interface ProjectionSetup {
	projectionMatrix: Float4x4;
	viewMatrix: Float4x4;
	viewProjMatrix: Float4x4;
}

export class Camera implements ProjectionSetup {
	private viewport_: Viewport;
	private proj_: Float4x4;
	private view_: Float4x4;
	private viewProj_: Float4x4;

	constructor(viewportWidth: number, viewportHeight: number) {
		this.viewport_ = makeViewport();
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
		const fov = deg2rad(fovDegrees);
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

	get viewport(): Readonly<Viewport> { return this.viewport_; }
}
