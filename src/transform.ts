// transform.ts - entities transform state
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="mesh.ts" />

namespace sd.scene {

	class TransformManager {
		private scaleMat: Float32Array;
		private rotMat: Float32Array;
		private transMat: Float32Array;
		private modelMatrix: Float32Array;
		private modelViewMatrix: Float32Array;
		private normalMatrix: Float32Array;

		constructor() {
			this.scaleMat = mat4.create();
			this.rotMat = mat4.create();
			this.transMat = mat4.create();
			this.modelMatrix = mat4.create();
			this.modelViewMatrix = mat4.create();
			this.normalMatrix = mat3.create();
		}

		setUniformScale(s: number) {
			mat4.fromScaling(this.scaleMat, [s, s, s]);
		}

		setScale(sx: number, sy: number, sz: number) {
			mat4.fromScaling(this.scaleMat, [sx, sy, sz]);
		}

		setPosition(v3: ArrayOfNumber): void;
		setPosition(x: number, y: number, z: number): void;
		setPosition(v3OrX: ArrayOfNumber | number, y?: number, z?: number): void {
			var v3: ArrayOfNumber;
			if (typeof v3OrX === "number")
				v3 = [v3OrX, y, z];
			else
				v3 = v3OrX;
			mat4.fromTranslation(this.transMat, v3);
		}

		setRotation(axis: ArrayOfNumber, angle: number) {
			mat4.fromRotation(this.rotMat, angle, axis);
		}
	}

} // ns sd.scene
