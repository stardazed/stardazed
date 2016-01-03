// entity - entities and shared interfaces
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export type Entity = Instance<EntityManager>;


	// -- Entity bit-field build up
	const entityIndexBits = 23; // numbers are signed int32 types internally in browsers when not used as int
	const entityGenerationBits = 8; 
	const entityIndexMask = (1 << entityIndexBits) - 1;
	const entityGenerationMask = (1 << entityGenerationBits) - 1;

	export function entityGeneration(ent: Entity) {
		return ((<number>ent) >> entityIndexBits) & entityGenerationMask;
	}

	export function entityIndex(ent: Entity) {
		return <number>ent & entityIndexMask;
	}

	function makeEntity(index: number, generation: number): Entity {
		return ((generation & entityGenerationMask) << entityIndexBits) | (index & entityIndexMask);
	}


	export class EntityManager {
		private generation_: Uint8Array;
		private genCount_: number;
		private freedIndices_: container.Deque<number>;

		private minFreedBuildup = 1024;

		constructor() {
			this.generation_ = new Uint8Array(8192);
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

			return makeEntity(index, this.generation_[index]);
		}

		alive(ent: Entity) {
			// explicitly "inlined" calls to entityIndex/Generation as this method will be called a lot
			var index = <number>ent & entityIndexMask;
			var generation = ((<number>ent) >> entityIndexBits) & entityGenerationMask;
			return index <= this.genCount_ && (generation == this.generation_[index]);
		}

		destroy(ent: Entity) {
			var index = entityIndex(ent);
			this.generation_[index]++;
			this.freedIndices_.append(index);
		}
	}

} // ns sd.world
