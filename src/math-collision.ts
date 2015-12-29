// math-collision - intersection tests of primitives
// portions based on text and sources from Real-Time Collision Detection by Christer Ericson
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.math {

	export interface Sphere {
		center: Float3;
		radius: number;
	}


	export interface Plane {
		normal: Float3;
		d: number;
	}


	export interface BoundedPlane extends Plane {
		center: Float3;
		size: Float2;   // 2 dimensions!
	}


	// a, b, c must be in CCW order
	export function makePlaneFromPoints(a: Float3, b: Float3, c: Float3): Plane {
		var normal = vec3.normalize([], vec3.cross([], vec3.sub([], b, a), vec3.sub([], c, a)));

		return {
			normal: normal,
			d: vec3.dot(normal, a)
		};
	}


	export function makePlaneFromPointAndNormal(p: Float3, normal: Float3): Plane {
		var orthoNormal = arbitraryOrthogonalVec3(normal);
		var b = vec3.add([], p, orthoNormal);
		var c = vec3.add([], p, vec3.cross([], normal, orthoNormal));

		return makePlaneFromPoints(p, b, c);
	}


	export function makeBoundedPlane(center: Float3, normal: Float3, size: Float2): BoundedPlane {
		var bp = <BoundedPlane>makePlaneFromPointAndNormal(center, normal);
		bp.center = vec3.clone(center);
		bp.size = vec2.clone(size);
		return bp;
	}


	export function boundingSizeOfBoundedPlane(bp: BoundedPlane): Float3 {
		// FIXME: this is kind of a guess which seems to return reasonable sizes, but need to check and improve this
		var wx = Math.abs(Math.sin(Math.acos(bp.normal[0])));
		var wz = Math.abs(Math.sin(Math.acos(bp.normal[2])));

		// give plane a depth of 1mm 
		return [
			Math.max(0.001, bp.size[0] * wx),
			Math.max(0.001, (bp.normal[0] * bp.size[0]) + (bp.normal[2] * bp.size[1])),
			Math.max(0.001, bp.size[1] * wz)
		];
	}


	export interface SpherePlaneIntersection {
		intersected: boolean;
		t?: number;
		point?: Float3;
	}


	export function planesOfTransformedBox(center: Float3, size: Float3, transMat4: Float4x4): Plane[] {
		var planes: Plane[] = [];
		var extents = vec3.scale([], size, 0.5);

		var cx = center[0], cy = center[1], cz = center[2];
		var ex = extents[0], ey = extents[1], ez = extents[2];

		var corners: Float3[] = [
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
		var result: SpherePlaneIntersection = { intersected: false };

		var dist = vec3.dot(plane.normal, sphere.center) - plane.d;
		if (Math.abs(dist) < sphere.radius) {
			result.intersected = true;
			result.t = 0;
			result.point = vec3.clone(sphere.center);
		}
		else {
			var denom = vec3.dot(plane.normal, direction);
			if (denom * dist < 0) {
				var radius = dist > 0 ? sphere.radius : -sphere.radius;
				result.intersected = true;
				result.t = (radius - dist) / denom;
				result.point = vec3.scaleAndAdd([], sphere.center, direction, result.t);
				vec3.scaleAndAdd(result.point, result.point, plane.normal, -radius);
			}
		}

		return result;
	}

} // ns sd.math
