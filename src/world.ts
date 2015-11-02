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
	
	export type Entity = number;

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
			this.generation_[this.genCount_];
			return this.genCount_;
		}

		private entityIndex(ent: Entity) {
			return ent & this.indexMask;
		}

		private entityGeneration(ent: Entity) {
			return (ent >> this.indexBits) & this.generationMask;
		}

		create(): Entity {
			var index: number;

			if (this.freedIndices_.count() >= this.minFreedBuildup) {
				index = this.freedIndices_.front();
				this.freedIndices_.popFront();
			}
			else {
				index = this.appendGeneration();
			}

			// assemble entity id
			return (this.generation_[index] << this.indexBits) | index;
		}

		alive(ent: Entity) {
			var index = this.entityIndex(ent);
			return index <= this.genCount_ && (this.entityGeneration(ent) == this.generation_[index]);
		}

		destroy(ent: Entity) {
			var index = this.entityIndex(ent);
			this.generation_[index]++;
			this.freedIndices_.append(index);
		}
	}


	//  _____                  __               __  __                             
	// |_   _| _ __ _ _ _  ___/ _|___ _ _ _ __ |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	//   | || '_/ _` | ' \(_-<  _/ _ \ '_| '  \| |\/| / _` | ' \/ _` / _` / -_) '_|
	//   |_||_| \__,_|_||_/__/_| \___/_| |_|_|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                               |___/         

	class TransformManager {
		
	}


} // ns sd.world
