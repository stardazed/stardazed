// math/collision - intersection tests of primitives
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

// portions based on text and sources from Real-Time Collision Detection by Christer Ericson

namespace sd.math {

	// tslint:disable:whitespace
	export function viewportMatrix(x: number, y: number, w: number, h: number, n: number, f: number): Float4x4 {
		return mat4.transpose([], [
			w/2, 0,   0,       w/2+x,
			0,   h/2, 0,       h/2+y,
			0,   0,   (f-n)/2, (f+n)/2,
			0,   0,   0,       1
		]);
	}
	// tslint:enable:whitespace

	// imported from now-dead tiled-light branch
	// used to determine what area of screenspace a (point) light would affect
	export function screenSpaceBoundsForWorldCube(outBounds: Rect, position: Float3, halfDim: number, cameraDir: Float3, viewMatrix: Float4x4, projectionViewMatrix: Float4x4, viewportMatrix: Float4x4) {
		const lx = position[0];
		const ly = position[1];
		const lz = position[2];

		// const vec3Dir = vec3.sub([], center, eye);
		// const cam_dir = vec3.normalize([], vec3Dir);

		const camUp = vec3.normalize([], [viewMatrix[4], viewMatrix[5], viewMatrix[6]]);
		const camLeft = vec3.cross([], camUp, cameraDir);
		vec3.normalize(camLeft, camLeft);

		const leftLight = vec4.transformMat4(
			[],
			[
				lx + halfDim * camLeft[0],
				ly + halfDim * camLeft[1],
				lz + halfDim * camLeft[2],
				1.0
			],
			projectionViewMatrix);

		const upLight = vec4.transformMat4(
			[],
			[
				lx + halfDim * camUp[0],
				ly + halfDim * camUp[1],
				lz + halfDim * camUp[2],
				1.0
			],
			projectionViewMatrix);

		const centerLight = vec4.transformMat4([], [lx, ly, lz, 1.0], projectionViewMatrix);

		// perspective divide
		vec4.scale(leftLight, leftLight, 1.0 / leftLight[3]);
		vec4.scale(upLight, upLight, 1.0 / upLight[3]);
		vec4.scale(centerLight, centerLight, 1.0 / centerLight[3]);

		// project on 2d viewport
		vec4.transformMat4(leftLight, leftLight, viewportMatrix);
		vec4.transformMat4(upLight, upLight, viewportMatrix);
		vec4.transformMat4(centerLight, centerLight, viewportMatrix);

		const dw = vec4.subtract([], leftLight, centerLight);
		const lenw = vec4.length(dw);

		const dh = vec4.subtract([], upLight, centerLight);
		const lenh = vec4.length(dh);

		const leftx = centerLight[0] - lenw;
		const bottomy = centerLight[1] - lenh;
		const rightx = centerLight[0] + lenw;
		const topy = centerLight[1] + lenh;

		outBounds.left = leftx;
		outBounds.right = rightx;
		outBounds.bottom = bottomy;
		outBounds.top = topy;
	}


	export interface Sphere {
		center: Float3;
		radius: number;
	}


	export interface Plane {
		normal: Float3;
		d: number;
	}


	// a, b, c must be in CCW order
	export function makePlaneFromPoints(a: Float3, b: Float3, c: Float3): Plane {
		const normal = vec3.normalize([], vec3.cross([], vec3.sub([], b, a), vec3.sub([], c, a)));

		return {
			normal: normal,
			d: vec3.dot(normal, a)
		};
	}


	export function makePlaneFromPointAndNormal(p: Float3, normal: Float3): Plane {
		const orthoNormal = vec3.arbitraryOrthogonalVec(normal);
		const b = vec3.add([], p, orthoNormal);
		const c = vec3.add([], p, vec3.cross([], normal, orthoNormal));

		return makePlaneFromPoints(p, b, c);
	}


	export function pointDistanceToPlane(point: Float3, plane: Plane) {
		return vec3.dot(plane.normal, point) + plane.d;
	}


	// this whole BoundedPlane business is experimental and possibly a load of shite

	export interface BoundedPlane extends Plane {
		center: Float3;
		size: Float2;   // 2 dimensions!
	}


	export function makeBoundedPlane(center: Float3, normal: Float3, size: Float2): BoundedPlane {
		const bp = <BoundedPlane>makePlaneFromPointAndNormal(center, normal);
		bp.center = vec3.clone(center);
		bp.size = vec2.clone(size);
		return bp;
	}


	export function boundingSizeOfBoundedPlane(bp: BoundedPlane): Float3 {
		// FIXME: this is kind of a guess which seems to return reasonable sizes, but need to check and improve this
		const wx = Math.abs(Math.sin(Math.acos(bp.normal[0])));
		const wz = Math.abs(Math.sin(Math.acos(bp.normal[2])));

		// give plane a depth of 1mm 
		return [
			Math.max(0.001, bp.size[0] * wx),
			Math.max(0.001, (bp.normal[0] * bp.size[0]) + (bp.normal[2] * bp.size[1])),
			Math.max(0.001, bp.size[1] * wz)
		];
	}


	export function transformBoundedPlaneMat4(bp: BoundedPlane, mat: Float4x4): BoundedPlane {
		const newCenter = vec3.transformMat4([], bp.center, mat);
		const normMat = mat3.normalFromMat4([], mat);
		const newNormal = vec3.transformMat3([], bp.normal, normMat);

		return makeBoundedPlane(newCenter, newNormal, bp.size);
	}


	// -- end experimental BoundedPlane


	export interface SpherePlaneIntersection {
		intersected: boolean;
		t?: number;
		point?: Float3;
	}


	export function planesOfTransformedBox(center: Float3, size: Float3, _transMat4: Float4x4): Plane[] {
		// FIXME: investigate what the transMat4 was meant for again
		const planes: Plane[] = [];
		const extents = vec3.scale([], size, 0.5);

		const cx = center[0], cy = center[1], cz = center[2];
		const ex = extents[0], ey = extents[1], ez = extents[2];

		const corners: Float3[] = [
			vec3.fromValues(cx - ex, cy - ey, cz - ez),
			vec3.fromValues(cx - ex, cy - ey, cz + ez),
			vec3.fromValues(cx + ex, cy - ey, cz - ez),
			vec3.fromValues(cx + ex, cy - ey, cz + ez),

			vec3.fromValues(cx - ex, cy + ey, cz - ez),
			vec3.fromValues(cx - ex, cy + ey, cz + ez),
			vec3.fromValues(cx + ex, cy + ey, cz - ez),
			vec3.fromValues(cx + ex, cy + ey, cz + ez)
		];

		planes.push(makePlaneFromPoints(corners[2], corners[1], corners[0]));

		return planes;
	}


	export function intersectMovingSpherePlane(sphere: Sphere, direction: Float3, plane: Plane): SpherePlaneIntersection {
		const result: SpherePlaneIntersection = { intersected: false };

		const dist = vec3.dot(plane.normal, sphere.center) - plane.d;
		if (Math.abs(dist) < sphere.radius) {
			result.intersected = true;
			result.t = 0;
			result.point = vec3.clone(sphere.center);
		}
		else {
			const denom = vec3.dot(plane.normal, direction);
			if (denom * dist < 0) {
				const radius = dist > 0 ? sphere.radius : -sphere.radius;
				result.intersected = true;
				result.t = (radius - dist) / denom;
				result.point = vec3.scaleAndAdd([], sphere.center, direction, result.t);
				vec3.scaleAndAdd(result.point, result.point, plane.normal, -radius);
			}
		}

		return result;
	}


} // ns sd.math
