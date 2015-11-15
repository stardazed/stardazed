// world - entities and common components
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="math.ts" />
/// <reference path="container.ts" />

namespace sd.world {

	//  ___     _   _ _        __  __                             
	// | __|_ _| |_(_) |_ _  _|  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	// | _|| ' \  _| |  _| || | |\/| / _` | ' \/ _` / _` / -_) '_|
	// |___|_||_\__|_|\__|\_, |_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                    |__/                      |___/         

	export class Instance<Component> {
		private __C: Component; // type differentiation, does not gen code

		constructor(public ref: number) {}
		equals(other: Instance<Component>) { return other.ref == this.ref; }
		valid() { return this.ref != 0; }
	}


	export class Entity {
		private static minFreedBuildup = 1024;
		private static indexBits = 24;
		private static generationBits = 7; // I trust browsers up to 31 bits inclusive
		private static indexMask = (1 << Entity.indexBits) - 1;
		private static generationMask = (1 << Entity.generationBits) - 1;

		id: number;

		constructor(index: number, gen: number) {
			this.id = (gen << Entity.indexBits) | index;
		}

		get index() { return this.id & Entity.indexMask; }
		get generation() { return (this.id >> Entity.indexBits) & Entity.generationMask; }

		equals(other: Entity) { return other.id == this.id; }
		get valid() { return this.id != 0; }
	}


	export class EntityManager {
		private generation_: Uint8Array;
		private genCount_: number;
		private freedIndices_: container.Deque<number>;

		private minFreedBuildup = 1024;
		private indexBits = 24;
		private generationBits = 7; // I trust browsers up to 31 bits inclusive
		private indexMask = (1 << this.indexBits) - 1;
		private generationMask = (1 << this.generationBits) - 1;

		constructor() {
			this.generation_ = new Uint8Array(2048);
			this.freedIndices_ = new container.Deque<number>();
			this.genCount_ = -1;

			// reserve entity id 0
			this.appendGeneration();
		}

		private appendGeneration() {
			if (this.genCount_ == this.generation_.length) {
				// grow generation array
				var newBuffer = ArrayBuffer.transfer(this.generation_.buffer, this.generation_.length * 2);
				this.generation_ = new Uint8Array(newBuffer);
			}

			++this.genCount_;
			this.generation_[this.genCount_] = 0;
			return this.genCount_;
		}

		create(): Entity {
			var index: number;

			if (this.freedIndices_.count >= this.minFreedBuildup) {
				index = this.freedIndices_.front;
				this.freedIndices_.popFront();
			}
			else {
				index = this.appendGeneration();
			}

			return new Entity(index, this.generation_[index]);
		}

		alive(ent: Entity) {
			var index = ent.index;
			return index <= this.genCount_ && (ent.generation == this.generation_[index]);
		}

		destroy(ent: Entity) {
			var index = ent.index;
			this.generation_[index]++;
			this.freedIndices_.append(index);
		}
	}


	// ------------------------


	export interface ProjectionSetup {
		projectionMatrix: ArrayOfNumber;
		viewMatrix: ArrayOfNumber;
	}

} // ns sd.world
