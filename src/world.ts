// world - entities and common components
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="math.ts" />
/// <reference path="container.ts" />

namespace sd.world {

	export class EntityManager {
		private generation_: Uint32Array;
		private freedIndices_: Deque<number>;

		constructor() {
		}
	}

} // ns sd.world
