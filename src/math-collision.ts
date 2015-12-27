// math-collision - intersection tests of primitives
// based on text and sources from Real-Time Collision Detection by Christer Ericson
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.math {

	export interface Sphere {
		center: ArrayOfNumber;
		radius: number;
	}


	export interface Plane {
		normal: ArrayOfNumber;
		d: number;
	}


	export interface SpherePlaneIntersection {
		intersected: boolean;
		t?: number;
		point?: ArrayOfNumber;
	}


	export function intersectMovingSpherePlane(sphere: Sphere, direction: ArrayOfNumber, plane: Plane): SpherePlaneIntersection {
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