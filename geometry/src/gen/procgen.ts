/**
 * geometry-gen/procgen - new way of geom gen
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

const enum FaceWinding {
	Clockwise,
	CounterClockwise
}

interface MeshTransform {
	rotation?: Float4; // quat
	translation?: Float3; // vec3
	scale?: Float3; // vec3
}

interface MeshDesc {
	winding?: FaceWinding;

	transform?: MeshTransform;
	invertFaces?: boolean;
	uvOffset?: Float2;
	uvScale?: Float2;
}

function transform(t: MeshTransform) {

}

function uvTransform(offset: Float2, scale: Float2) {

}

function invertFaces() {

}
