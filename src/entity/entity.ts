/*
entity/entity - entities and shared interfaces
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { transferArrayBuffer } from "stardazed/core";
import { NumericDeque } from "stardazed/container";
import { Instance, InstanceArrayView } from "./instance";

export type Entity = Instance<EntityManager>;
export type EntityArrayView = InstanceArrayView<EntityManager>;


// Entity bit-field build up
const entityIndexBits = 23; // numbers are signed int32 types internally in browsers when not used as int
const entityGenerationBits = 8;
const entityIndexMask = (1 << entityIndexBits) - 1;
const entityGenerationMask = (1 << entityGenerationBits) - 1;

export function entityGeneration(ent: Entity) {
	return ((ent as number) >>> entityIndexBits) & entityGenerationMask;
}

export function entityIndex(ent: Entity) {
	return (ent as number) & entityIndexMask;
}

function makeEntity(index: number, generation: number): Entity {
	return ((generation & entityGenerationMask) << entityIndexBits) | (index & entityIndexMask);
}

export class EntityManager {
	private generation_: Uint8Array;
	private genCount_: number;
	private freedIndices_: NumericDeque;

	private minFreedBuildup = 1024;

	constructor() {
		this.generation_ = new Uint8Array(8192);
		this.freedIndices_ = new NumericDeque(Uint32Array);
		this.genCount_ = -1;

		// reserve entity id 0
		this.appendGeneration();
	}

	private appendGeneration() {
		if (this.genCount_ === this.generation_.length) {
			// grow generation array
			const newBuffer = transferArrayBuffer(this.generation_.buffer as ArrayBuffer, this.generation_.length * 2);
			this.generation_ = new Uint8Array(newBuffer);
		}

		++this.genCount_;
		this.generation_[this.genCount_] = 0;
		return this.genCount_;
	}

	create(): Entity {
		let index: number;

		if (this.freedIndices_.length >= this.minFreedBuildup) {
			index = this.freedIndices_.front;
			this.freedIndices_.shift();
		}
		else {
			index = this.appendGeneration();
		}

		return makeEntity(index, this.generation_[index]);
	}

	alive(ent: Entity) {
		// explicitly "inlined" calls to entityIndex/Generation as this method will be called a lot
		const index = (ent as number) & entityIndexMask;
		const generation = ((ent as number) >> entityIndexBits) & entityGenerationMask;
		return index <= this.genCount_ && (generation === this.generation_[index]);
	}

	destroy(ent: Entity) {
		const index = entityIndex(ent);
		this.generation_[index]++;
		this.freedIndices_.push(index);
	}
}
