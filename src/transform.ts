// transform - Transform component
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.world {

	//  _____                  __               __  __                             
	// |_   _| _ __ _ _ _  ___/ _|___ _ _ _ __ |  \/  |__ _ _ _  __ _ __ _ ___ _ _ 
	//   | || '_/ _` | ' \(_-<  _/ _ \ '_| '  \| |\/| / _` | ' \/ _` / _` / -_) '_|
	//   |_||_| \__,_|_||_/__/_| \___/_| |_|_|_|_|  |_\__,_|_||_\__,_\__, \___|_|  
	//                                                               |___/         

	export type TransformInstance = Instance<TransformManager>;
	export type TransformRange = InstanceRange<TransformManager>;
	export type TransformIterator = InstanceIterator<TransformManager>;


	export interface TransformDescriptor {
		position: Float3;
		rotation?: Float4;
		scale?: Float3;
	}


	export class TransformManager implements ComponentManager<TransformManager> {
		private instanceData_: container.MultiArrayBuffer;

		private entityBase_: TypedArray;

		private parentBase_: TypedArray;
		private firstChildBase_: TypedArray;
		private prevSiblingBase_: TypedArray;
		private nextSiblingBase_: TypedArray;

		private positionBase_: TypedArray;
		private rotationBase_: TypedArray;
		private scaleBase_: TypedArray;
		private localMatrixBase_: TypedArray;
		private worldMatrixBase_: TypedArray;

		constructor() {
			var instanceFields: container.MABField[] = [
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

			this.positionBase_ = this.instanceData_.indexedFieldView(5);
			this.rotationBase_ = this.instanceData_.indexedFieldView(6);
			this.scaleBase_ = this.instanceData_.indexedFieldView(7);

			this.localMatrixBase_ = this.instanceData_.indexedFieldView(8);
			this.worldMatrixBase_ = this.instanceData_.indexedFieldView(9);
		}


		create(linkedEntity: Entity, parent?: TransformInstance): TransformInstance;
		create(linkedEntity: Entity, desc: TransformDescriptor, parent?: TransformInstance): TransformInstance;
		create(linkedEntity: Entity, descOrParent: TransformDescriptor | TransformInstance, parent?: TransformInstance): TransformInstance {
			var entIndex = entityIndex(linkedEntity);

			if (this.instanceData_.count < entIndex) {
				if (this.instanceData_.resize(entIndex) == container.InvalidatePointers.Yes) {
					this.rebase();
				}
			}

			var thisInstance = entIndex;
			var parentInstance = 0;
			var descriptor: TransformDescriptor = null;

			this.entityBase_[thisInstance] = <number>linkedEntity;

			if (descOrParent) {
				if (typeof descOrParent == "number") {
					parentInstance = <number>descOrParent;
				}
				else {
					descriptor = <TransformDescriptor>descOrParent;
					parentInstance = <number>parent; // can be null
				}
			}

			if (parentInstance) {
				this.parentBase_[thisInstance] = parentInstance;
				var myPrevSibling = this.firstChildBase_[parentInstance];

				if (myPrevSibling) {
					assert(this.prevSiblingBase_[myPrevSibling] == 0, "firstChild cannot have prev siblings");

					// find end of child chain
					while (this.nextSiblingBase_[myPrevSibling] != 0) {
						myPrevSibling = this.nextSiblingBase_[myPrevSibling];
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
				let rotation = descriptor.rotation || math.Quat.identity;
				let scale = descriptor.scale || math.Vec3.one;

				this.positionBase_.set(descriptor.position, thisInstance * math.Vec3.elementCount);
				this.rotationBase_.set(rotation, thisInstance * math.Quat.elementCount);
				this.scaleBase_.set(scale, thisInstance * math.Vec3.elementCount);

				this.setLocalMatrix(thisInstance, rotation, descriptor.position, scale);
			}
			else {
				this.positionBase_.set(math.Vec3.zero, thisInstance * math.Quat.elementCount);
				this.rotationBase_.set(math.Quat.identity, thisInstance * math.Quat.elementCount);
				this.scaleBase_.set(math.Vec3.one, thisInstance * math.Vec3.elementCount);

				this.localMatrixBase_.set(math.Mat4.identity, thisInstance * math.Mat4.elementCount);
				this.worldMatrixBase_.set(math.Mat4.identity, thisInstance * math.Mat4.elementCount);
			}

			return thisInstance;
		}


		get count() { return this.instanceData_.count; }


		valid(inst: TransformInstance) {
			return <number>inst <= this.count;
		}


		all(): TransformRange {
			return new InstanceLinearRange<TransformManager>(1, this.count);
		}


		// Entity -> TransformInstance mapping
		forEntity(ent: Entity): TransformInstance {
			var index = entityIndex(ent);
			if (index > 0 && index <= this.instanceData_.count)
				return <number>ent;
			assert(false, "No transform for entity " + index);
		}


		// -- single instance getters
		entity(inst: TransformInstance): Entity { return this.entityBase_[<number>inst]; }

		parent(inst: TransformInstance): TransformInstance { return this.parentBase_[<number>inst]; }
		firstChild(inst: TransformInstance): TransformInstance { return this.firstChildBase_[<number>inst]; }
		prevSibling(inst: TransformInstance): TransformInstance { return this.prevSiblingBase_[<number>inst]; }
		nextSibling(inst: TransformInstance): TransformInstance { return this.nextSiblingBase_[<number>inst]; }

		localPosition(inst: TransformInstance) { return container.copyIndexedVec3(this.positionBase_, <number>inst); }
		localRotation(inst: TransformInstance) { return container.copyIndexedVec4(this.rotationBase_, <number>inst); }
		localScale(inst: TransformInstance) { return container.copyIndexedVec3(this.scaleBase_, <number>inst); }

		worldPosition(inst: TransformInstance): number[] {
			var matOffset = <number>inst * 16;
			return [this.worldMatrixBase_[matOffset + 12], this.worldMatrixBase_[matOffset + 13], this.worldMatrixBase_[matOffset + 14]];
		}

		localMatrix(inst: TransformInstance) { return container.refIndexedMat4(this.localMatrixBase_, <number>inst); }
		worldMatrix(inst: TransformInstance) { return container.refIndexedMat4(this.worldMatrixBase_, <number>inst); }


		// update the world matrices of inst and all of its children
		private applyParentTransform(parentMatrix: Float4x4, inst: TransformInstance) {
			var localMat = this.localMatrix(inst);
			var worldMat = this.worldMatrix(inst);
			mat4.multiply(worldMat, parentMatrix, localMat);

			var child = this.firstChildBase_[<number>inst];
			while (child != 0) {
				this.applyParentTransform(worldMat, child);
				child = this.nextSiblingBase_[child];
			}
		}


		// two overloads: one with new matrix, one with tranform components
		setLocalMatrix(inst: TransformInstance, newLocalMatrix: Float4x4): void;
		setLocalMatrix(inst: TransformInstance, newRotation: Float4, newPosition: Float3, newScale: Float3): void;
		setLocalMatrix(inst: TransformInstance, localMatOrRot: ArrayOfNumber, newPosition?: Float3, newScale?: Float3) {
			var localMat = container.refIndexedMat4(this.localMatrixBase_, <number>inst);
			if (arguments.length == 4) {
				mat4.fromRotationTranslationScale(localMat, localMatOrRot, newPosition, newScale);
			}
			else {
				localMat.set(localMatOrRot); // 4x4 mat
			}

			var parent = this.parentBase_[<number>inst];
			var firstChild = this.firstChildBase_[<number>inst];

			// -- optimization for root-level, childless entities (of which I have seen there are many, but this may/will change)
			if (parent || firstChild) {
				var parentWorldMat = (parent == 0) ? math.Mat4.identity : this.worldMatrix(parent);
				this.applyParentTransform(parentWorldMat, inst);
			}
			else {
				mat4.copy(this.worldMatrix(inst), localMat);
			}
		}


		private removeFromParent(inst: TransformInstance) {
			var index = <number>inst;
			var parentIndex = this.parentBase_[index];
			
			if (! parentIndex) {
				return;
			}

			var firstChild = this.firstChildBase_[parentIndex];
			var prevSibling = this.prevSiblingBase_[index];
			var nextSibling = this.nextSiblingBase_[index];

			if (firstChild == index) {
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
			var thisIndex = <number>inst;
			var parentIndex = <number>newParent;

			this.removeFromParent(inst);

			if (parentIndex) {
				this.parentBase_[thisIndex] = parentIndex;
				var myPrevSibling = this.firstChildBase_[parentIndex];

				if (myPrevSibling) {
					// find end of child chain
					while (this.nextSiblingBase_[myPrevSibling] != 0) {
						myPrevSibling = this.nextSiblingBase_[myPrevSibling];
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
			this.positionBase_.set(newPosition, <number>inst * math.Vec3.elementCount);
			this.setLocalMatrix(inst, this.localRotation(inst), newPosition, this.localScale(inst));
		}

		setRotation(inst: TransformInstance, newRotation: Float4) {
			this.rotationBase_.set(newRotation, <number>inst * math.Quat.elementCount);
			this.setLocalMatrix(inst, newRotation, this.localPosition(inst), this.localScale(inst));
		}

		setPositionAndRotation(inst: TransformInstance, newPosition: Float3, newRotation: Float4) {
			this.positionBase_.set(newPosition, <number>inst * math.Vec3.elementCount);
			this.rotationBase_.set(newRotation, <number>inst * math.Quat.elementCount);
			this.setLocalMatrix(inst, newRotation, newPosition, this.localScale(inst));
		}

		setScale(inst: TransformInstance, newScale: Float3) {
			this.scaleBase_.set(newScale, <number>inst * math.Vec3.elementCount);
			this.setLocalMatrix(inst, this.localRotation(inst), this.localPosition(inst), newScale);
		}


		// -- relative transform helpers

		translate(inst: TransformInstance, localDelta3: Float3) {
			var pos = this.localPosition(inst);
			this.setPosition(inst, [pos[0] + localDelta3[0], pos[1] + localDelta3[1], pos[2] + localDelta3[2]]);
		}

		rotateByAngles(inst: TransformInstance, angDelta3: Float3) {
			var rot = this.localRotation(inst);
			var q = quat.fromEuler(angDelta3[2], angDelta3[1], angDelta3[0]);
			this.setRotation(inst, quat.multiply([], rot, q));
		}
	}

} // ns sd.world
