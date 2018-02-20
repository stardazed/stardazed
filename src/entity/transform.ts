// entity/transform - Transform component
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.entity {

	//  _____                  __
	// |_   _| _ __ _ _ _  ___/ _|___ _ _ _ __
	//   | || '_/ _` | ' \(_-<  _/ _ \ '_| '  \
	//   |_||_| \__,_|_||_/__/_| \___/_| |_|_|_|
	//

	export interface Transform {
		position: Float3;
		rotation?: Float4; // quat
		scale?: Float3;
	}

	export type TransformInstance = Instance<TransformComponent>;
	export type TransformRange = InstanceRange<TransformComponent>;
	export type TransformSet = InstanceSet<TransformComponent>;
	export type TransformIterator = InstanceIterator<TransformComponent>;
	export type TransformArrayView = InstanceArrayView<TransformComponent>;

	export class TransformComponent implements Component<TransformComponent> {
		private instanceData_: container.MultiArrayBuffer;

		private entityBase_!: EntityArrayView;

		private parentBase_!: TransformArrayView;
		private firstChildBase_!: TransformArrayView;
		private prevSiblingBase_!: TransformArrayView;
		private nextSiblingBase_!: TransformArrayView;

		private positionBase_!: Float32Array;
		private rotationBase_!: Float32Array;
		private scaleBase_!: Float32Array;
		private localMatrixBase_!: Float32Array;
		private worldMatrixBase_!: Float32Array;

		private readonly defaultPos_: ConstFloat3 = vec3.zero();
		private readonly defaultRot_: ConstFloat4 = quat.create();
		private readonly defaultScale_: ConstFloat3 = vec3.one();

		constructor() {
			const instanceFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity

				{ type: SInt32, count: 1 }, // parentInstance
				{ type: SInt32, count: 1 }, // firstChild
				{ type: SInt32, count: 1 }, // prevSibling
				{ type: SInt32, count: 1 }, // nextSibling

				{ type: Float, count: 3 },  // position
				{ type: Float, count: 4 },  // rotation
				{ type: Float, count: 3 },  // scale

				{ type: Float, count: 16 }, // localMatrix
				{ type: Float, count: 16 }  // worldMatrix
			];
			this.instanceData_ = new container.MultiArrayBuffer(2048, instanceFields); // 376 KiB

			this.rebase();
		}

		rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);

			this.parentBase_ = this.instanceData_.indexedFieldView(1);
			this.firstChildBase_ = this.instanceData_.indexedFieldView(2);
			this.prevSiblingBase_ = this.instanceData_.indexedFieldView(3);
			this.nextSiblingBase_ = this.instanceData_.indexedFieldView(4);

			this.positionBase_ = this.instanceData_.indexedFieldView(5) as Float32Array;
			this.rotationBase_ = this.instanceData_.indexedFieldView(6) as Float32Array;
			this.scaleBase_ = this.instanceData_.indexedFieldView(7) as Float32Array;

			this.localMatrixBase_ = this.instanceData_.indexedFieldView(8) as Float32Array;
			this.worldMatrixBase_ = this.instanceData_.indexedFieldView(9) as Float32Array;
		}


		create(linkedEntity: Entity, parent?: TransformInstance): TransformInstance;
		create(linkedEntity: Entity, desc?: Transform, parent?: TransformInstance): TransformInstance;
		create(linkedEntity: Entity, descOrParent?: Transform | TransformInstance, parent?: TransformInstance): TransformInstance {
			const entIndex = entityIndex(linkedEntity);

			if (this.instanceData_.count < entIndex) {
				if (this.instanceData_.resize(entIndex) === container.InvalidatePointers.Yes) {
					this.rebase();
				}
			}

			const thisInstance = entIndex;
			let parentInstance = 0;
			let descriptor: Transform | null = null;

			this.entityBase_[thisInstance] = linkedEntity;

			if (descOrParent) {
				if (typeof descOrParent === "number") {
					parentInstance = descOrParent as number;
				}
				else {
					descriptor = descOrParent as Transform;
					parentInstance = parent as number; // can be 0
				}
			}
			else if (typeof parent === "number") {
				parentInstance = parent as number;
			}

			if (parentInstance) {
				this.parentBase_[thisInstance] = parentInstance;
				let myPrevSibling = this.firstChildBase_[parentInstance] as number;

				if (myPrevSibling) {
					assert(this.prevSiblingBase_[myPrevSibling] === 0, "firstChild cannot have prev siblings");

					// find end of child chain
					while (this.nextSiblingBase_[myPrevSibling] !== 0) {
						myPrevSibling = this.nextSiblingBase_[myPrevSibling] as number;
					}

					// append self to parent's child list
					this.nextSiblingBase_[myPrevSibling] = thisInstance;
					this.prevSiblingBase_[thisInstance] = myPrevSibling;
				}
				else {
					this.firstChildBase_[parentInstance] = thisInstance;
					this.prevSiblingBase_[thisInstance] = 0;
					this.nextSiblingBase_[thisInstance] = 0;
				}
			}
			else {
				this.parentBase_[thisInstance] = 0;
				this.prevSiblingBase_[thisInstance] = 0;
				this.nextSiblingBase_[thisInstance] = 0;
			}


			if (descriptor) {
				// optional descriptor fields
				const rotation = descriptor.rotation || this.defaultRot_;
				const scale = descriptor.scale || this.defaultScale_;

				this.positionBase_.set(descriptor.position, thisInstance * vec3.ELEMENT_COUNT);
				this.rotationBase_.set(rotation, thisInstance * quat.ELEMENT_COUNT);
				this.scaleBase_.set(scale, thisInstance * vec3.ELEMENT_COUNT);

				this.setLocalMatrix(thisInstance, rotation, descriptor.position, scale);
			}
			else {
				this.positionBase_.set(this.defaultPos_, thisInstance * quat.ELEMENT_COUNT);
				this.rotationBase_.set(this.defaultRot_, thisInstance * quat.ELEMENT_COUNT);
				this.scaleBase_.set(this.defaultScale_, thisInstance * vec3.ELEMENT_COUNT);

				this.setLocalMatrix(thisInstance, this.defaultRot_, this.defaultPos_, this.defaultScale_);
			}

			return thisInstance;
		}


		destroy(_inst: TransformInstance) {
			// TBI
		}


		destroyRange(range: TransformRange) {
			const iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}


		get count() { return this.instanceData_.count; }

		valid(inst: TransformInstance) {
			return inst as number <= this.count;
		}

		all(): TransformRange {
			return new InstanceLinearRange<TransformComponent>(1, this.count);
		}


		// Entity -> TransformInstance mapping
		forEntity(ent: Entity): TransformInstance {
			const index = entityIndex(ent);
			if (index > 0 && index <= this.instanceData_.count) {
				return ent as Instance<any> as TransformInstance;
			}

			assert(false, `No transform for entity ${index}`);
			return 0;
		}


		// -- single instance getters
		entity(inst: TransformInstance): Entity { return this.entityBase_[inst as number]; }

		parent(inst: TransformInstance): TransformInstance { return this.parentBase_[inst as number]; }
		firstChild(inst: TransformInstance): TransformInstance { return this.firstChildBase_[inst as number]; }
		prevSibling(inst: TransformInstance): TransformInstance { return this.prevSiblingBase_[inst as number]; }
		nextSibling(inst: TransformInstance): TransformInstance { return this.nextSiblingBase_[inst as number]; }

		localPosition(inst: TransformInstance) { return container.copyIndexedVec3(this.positionBase_, inst as number); }
		localRotation(inst: TransformInstance) { return container.copyIndexedVec4(this.rotationBase_, inst as number); }
		localScale(inst: TransformInstance) { return container.copyIndexedVec3(this.scaleBase_, inst as number); }

		worldPosition(inst: TransformInstance): number[] {
			const matOffset = inst as number * 16;
			return [this.worldMatrixBase_[matOffset + 12], this.worldMatrixBase_[matOffset + 13], this.worldMatrixBase_[matOffset + 14]];
		}

		localMatrix(inst: TransformInstance) { return container.refIndexedMat4(this.localMatrixBase_, inst as number); }
		worldMatrix(inst: TransformInstance) { return container.refIndexedMat4(this.worldMatrixBase_, inst as number); }

		copyLocalMatrix(inst: TransformInstance) { return container.copyIndexedMat4(this.localMatrixBase_, inst as number); }
		copyWorldMatrix(inst: TransformInstance) { return container.copyIndexedMat4(this.worldMatrixBase_, inst as number); }


		// update the world matrices of inst and all of its children
		private applyParentTransform(parentMatrix: Float4x4, inst: TransformInstance) {
			const localMat = this.localMatrix(inst);
			const worldMat = this.worldMatrix(inst);
			mat4.multiply(worldMat, parentMatrix, localMat);

			let child = this.firstChildBase_[inst as number] as number;
			while (child !== 0) {
				this.applyParentTransform(worldMat, child);
				child = this.nextSiblingBase_[child] as number;
			}
		}


		// two overloads: one with new matrix, one with transform components
		setLocalMatrix(inst: TransformInstance, newLocalMatrix: Float4x4): void;
		setLocalMatrix(inst: TransformInstance, newRotation: Float4, newPosition: Float3, newScale: Float3): void;
		setLocalMatrix(inst: TransformInstance, localMatOrRot: ArrayOfNumber, newPosition?: Float3, newScale?: Float3) {
			const localMat = container.refIndexedMat4(this.localMatrixBase_, inst as number);
			if (arguments.length === 4) {
				mat4.fromRotationTranslationScale(localMat, localMatOrRot, newPosition!, newScale!);
			}
			else {
				localMat.set(localMatOrRot); // 4x4 mat
			}

			const parent = this.parentBase_[inst as number];
			const firstChild = this.firstChildBase_[inst as number];

			// -- optimization for root-level, childless entities (of which I have seen there are many, but this may/will change)
			if (parent || firstChild) {
				const parentWorldMat = (parent === 0) ? mat4.create() : this.worldMatrix(parent);
				this.applyParentTransform(parentWorldMat, inst);
			}
			else {
				mat4.copy(this.worldMatrix(inst), localMat);
			}
		}


		private removeFromParent(inst: TransformInstance) {
			const index = inst as number;
			const parentIndex = this.parentBase_[index] as number;

			if (! parentIndex) {
				return;
			}

			const firstChild = this.firstChildBase_[parentIndex];
			const prevSibling = this.prevSiblingBase_[index] as number;
			const nextSibling = this.nextSiblingBase_[index] as number;

			if (firstChild === index) {
				this.firstChildBase_[parentIndex] = nextSibling;
			}
			if (prevSibling) {
				this.nextSiblingBase_[prevSibling] = nextSibling;
				this.prevSiblingBase_[index] = 0;
			}
			if (nextSibling) {
				this.prevSiblingBase_[nextSibling] = prevSibling;
				this.nextSiblingBase_[index] = 0;
			}

			this.parentBase_[index] = 0;
		}


		setParent(inst: TransformInstance, newParent: TransformInstance) {
			const thisIndex = inst as number;
			const parentIndex = newParent as number;

			this.removeFromParent(inst);

			if (parentIndex) {
				this.parentBase_[thisIndex] = parentIndex as number;
				let myPrevSibling = this.firstChildBase_[parentIndex] as number;

				if (myPrevSibling) {
					// find end of child chain
					while (this.nextSiblingBase_[myPrevSibling] !== 0) {
						myPrevSibling = this.nextSiblingBase_[myPrevSibling] as number;
					}

					// append self to parent's child list
					this.nextSiblingBase_[myPrevSibling] = thisIndex;
					this.prevSiblingBase_[thisIndex] = myPrevSibling;
				}
				else {
					// create new chain with self at front
					this.firstChildBase_[parentIndex] = thisIndex;
					this.prevSiblingBase_[thisIndex] = 0;
					this.nextSiblingBase_[thisIndex] = 0;
				}
			}
		}


		setPosition(inst: TransformInstance, newPosition: Float3) {
			this.positionBase_.set(newPosition, inst as number * vec3.ELEMENT_COUNT);
			this.setLocalMatrix(inst, this.localRotation(inst), newPosition, this.localScale(inst));
		}

		setRotation(inst: TransformInstance, newRotation: Float4) {
			this.rotationBase_.set(newRotation, inst as number * quat.ELEMENT_COUNT);
			this.setLocalMatrix(inst, newRotation, this.localPosition(inst), this.localScale(inst));
		}

		setPositionAndRotation(inst: TransformInstance, newPosition: Float3, newRotation: Float4) {
			this.positionBase_.set(newPosition, inst as number * vec3.ELEMENT_COUNT);
			this.rotationBase_.set(newRotation, inst as number * quat.ELEMENT_COUNT);
			this.setLocalMatrix(inst, newRotation, newPosition, this.localScale(inst));
		}

		setScale(inst: TransformInstance, newScale: Float3) {
			this.scaleBase_.set(newScale, inst as number * vec3.ELEMENT_COUNT);
			this.setLocalMatrix(inst, this.localRotation(inst), this.localPosition(inst), newScale);
		}

		setPositionAndRotationAndScale(inst: TransformInstance, newPosition: Float3, newRotation: Float4, newScale: Float3) {
			this.positionBase_.set(newPosition, inst as number * vec3.ELEMENT_COUNT);
			this.rotationBase_.set(newRotation, inst as number * quat.ELEMENT_COUNT);
			this.scaleBase_.set(newScale, inst as number * vec3.ELEMENT_COUNT);
			this.setLocalMatrix(inst, newRotation, newPosition, newScale);
		}


		// -- relative transform helpers

		translate(inst: TransformInstance, localDelta3: Float3) {
			const pos = this.localPosition(inst);
			this.setPosition(inst, [pos[0] + localDelta3[0], pos[1] + localDelta3[1], pos[2] + localDelta3[2]]);
		}

		rotate(inst: TransformInstance, localRot: Float4) {
			this.setRotation(inst, quat.multiply([], this.localRotation(inst), localRot));
		}

		rotateRelWorld(inst: TransformInstance, worldRot: Float4) {
			this.setRotation(inst, quat.multiply([], worldRot, this.localRotation(inst)));
		}

		rotateByAngles(inst: TransformInstance, localAng: Float3) {
			const rot = this.localRotation(inst);
			const q = quat.fromEuler(localAng[2], localAng[1], localAng[0]);
			this.setRotation(inst, quat.multiply([], rot, q));
		}
	}

} // ns sd.world
