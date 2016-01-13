// physicsmaterial - Physics Material component
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.world {

	export type PhysicsMaterialInstance = Instance<PhysicsMaterialManager>;
	export type PhysicsMaterialRange = InstanceRange<PhysicsMaterialManager>;
	export type PhysicsMaterialSet = InstanceSet<PhysicsMaterialManager>;
	export type PhysicsMaterialIterator = InstanceIterator<PhysicsMaterialManager>;
	export type PhysicsMaterialArrayView = InstanceArrayView<PhysicsMaterialManager>;


	export interface PhysicsMaterialDescriptor {
		friction: number;    // 0..1
		restitution: number; // 0..1
	}


	export class PhysicsMaterialManager {
		private instanceData_: container.MultiArrayBuffer;

		private frictionBase_: Float32Array;
		private restitutionBase_: Float32Array;


		constructor() {
			var fields: container.MABField[] = [
				{ type: Float, count: 1 }, // friction
				{ type: Float, count: 1 }, // restitution
			];

			this.instanceData_ = new container.MultiArrayBuffer(128, fields);
			this.rebase();
		}


		private rebase() {
			this.frictionBase_ = <Float32Array>this.instanceData_.indexedFieldView(0);
			this.restitutionBase_ = <Float32Array>this.instanceData_.indexedFieldView(1);
		}


		create(desc: PhysicsMaterialDescriptor): PhysicsMaterialInstance {
			if (this.instanceData_.extend() == container.InvalidatePointers.Yes) {
				this.rebase();
			}

			var instance = this.instanceData_.count;
			this.frictionBase_[instance] = math.clamp01(desc.friction);
			this.restitutionBase_[instance] = math.clamp01(desc.restitution);

			return instance;
		}


		destroy(inst: ColliderInstance) {
		}

		destroyRange(range: ColliderRange) {
		}

		get count() { return this.instanceData_.count; }

		valid(inst: PhysicsMaterialInstance) {
			return <number>inst <= this.count;
		}

		all(): PhysicsMaterialRange {
			return new InstanceLinearRange<PhysicsMaterialManager>(1, this.count);
		}

		makeSetRange(): PhysicsMaterialSet {
			return new InstanceSet<PhysicsMaterialManager>();
		}

		makeLinearRange(first: PhysicsMaterialInstance, last: PhysicsMaterialInstance): PhysicsMaterialRange {
			return new InstanceLinearRange<PhysicsMaterialManager>(first, last);
		}


		// -- per instance properties

		friction(inst: PhysicsMaterialInstance): ColliderType {
			return this.frictionBase_[<number>inst];
		}

		setFriction(inst: PhysicsMaterialInstance, newFriction: number) {
			this.frictionBase_[<number>inst] = math.clamp01(newFriction);
		}

		restitution(inst: PhysicsMaterialInstance): Entity {
			return this.restitutionBase_[<number>inst];
		}

		setRestitution(inst: PhysicsMaterialInstance, newRestitution: number) {
			this.restitutionBase_[<number>inst] = math.clamp01(newRestitution);
		}
	}

} // ns sd.world
