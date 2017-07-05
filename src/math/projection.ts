// math/projection - simple projection utils
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.math {

	export interface ProjectionSetup {
		projectionMatrix: Float4x4;
		viewMatrix: Float4x4;
		projViewMatrix: Float4x4;
	}

	/*

	TODO: this was going to be used somewhere

	interface Projection {
		matrix: Float4x4;
		planes: math.Plane[];
	}


	class PerspectiveProjection {
		matrix: Float4x4;

	}
	*/

} // sd.world
