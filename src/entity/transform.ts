/*
entity/transform - Transform component
Part of Stardazed
(c) 2015-Present by Arthur Langereis - @zenmumbler
https://github.com/stardazed/stardazed
*/

import { MultiArrayBuffer, StructField, InvalidatePointers } from "stardazed/container";
import { Vector3, Quaternion, Matrix } from "stardazed/vector";
import { Component, Instance, InstanceRange, InstanceArrayView } from "./instance";

export interface TransformDesc {
	position: Vector3;
	rotation?: Quaternion;
	scale?: Vector3;
}

export type TransformInstance = Instance<TransformComponent>;
export type TransformRange = InstanceRange<TransformComponent>;
export type TransformArrayView = InstanceArrayView<TransformComponent>;

export class TransformComponent implements Component<TransformComponent> {
	private instanceData_: MultiArrayBuffer;

	private parentBase_!: TransformArrayView;
	private firstChildBase_!: TransformArrayView;
	private prevSiblingBase_!: TransformArrayView;
	private nextSiblingBase_!: TransformArrayView;

	private positionBase_!: Float32Array;
	private rotationBase_!: Float32Array;
	private scaleBase_!: Float32Array;
	private localMatrixBase_!: Float32Array;
	private worldMatrixBase_!: Float32Array;

	private readonly defaultPos_ = Vector3.zero;
	private readonly defaultRot_ = Quaternion.identity;
	private readonly defaultScale_ = Vector3.one;

	constructor() {
		const instanceFields: StructField[] = [
			{ type: "sint32", width: 1 }, // parentInstance
			{ type: "sint32", width: 1 }, // firstChild
			{ type: "sint32", width: 1 }, // prevSibling
			{ type: "sint32", width: 1 }, // nextSibling

			{ type: "float", width: 3 },  // position
			{ type: "float", width: 4 },  // rotation
			{ type: "float", width: 3 },  // scale

			{ type: "float", width: 16 }, // localMatrix
			{ type: "float", width: 16 }  // worldMatrix
		];
		this.instanceData_ = new MultiArrayBuffer(instanceFields, 2048); // 376 KiB

		this.rebase();
	}

	rebase() {
		this.parentBase_ = this.instanceData_.arrayFieldView(0);
		this.firstChildBase_ = this.instanceData_.arrayFieldView(1);
		this.prevSiblingBase_ = this.instanceData_.arrayFieldView(2);
		this.nextSiblingBase_ = this.instanceData_.arrayFieldView(3);

		this.positionBase_ = this.instanceData_.arrayFieldView(4) as Float32Array;
		this.rotationBase_ = this.instanceData_.arrayFieldView(5) as Float32Array;
		this.scaleBase_ = this.instanceData_.arrayFieldView(6) as Float32Array;

		this.localMatrixBase_ = this.instanceData_.arrayFieldView(7) as Float32Array;
		this.worldMatrixBase_ = this.instanceData_.arrayFieldView(8) as Float32Array;
	}

	create(descriptor?: TransformDesc, parent?: TransformInstance): TransformInstance {
		if (this.instanceData_.extend() === InvalidatePointers.Yes) {
			this.rebase();
		}

		const thisInstance = this.instanceData_.count;
		const parentInstance = parent as number || 0;

		if (parentInstance) {
			this.parentBase_[thisInstance] = parentInstance;
			let myPrevSibling = this.firstChildBase_[parentInstance] as number;

			if (myPrevSibling) {
				// assert(this.prevSiblingBase_[myPrevSibling] === 0, "firstChild cannot have prev siblings");

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

		const position = (descriptor && descriptor.position) || this.defaultPos_;
		const rotation = (descriptor && descriptor.rotation) || this.defaultRot_;
		const scale = (descriptor && descriptor.scale) || this.defaultScale_;

		position.writeToArray(this.positionBase_, thisInstance * 3);
		rotation.writeToArray(this.rotationBase_, thisInstance * 4);
		scale.writeToArray(this.scaleBase_, thisInstance * 3);

		this.setLocalMatrix(thisInstance, position, rotation, scale);

		return thisInstance;
	}

	destroyRange(range: TransformRange) {
		for (const _inst of range) {
			// destroy data, likely zero
		}
	}


	get count() { return this.instanceData_.count; }

	// -- single instance getters
	parent(inst: TransformInstance): TransformInstance { return this.parentBase_[inst as number]; }
	firstChild(inst: TransformInstance): TransformInstance { return this.firstChildBase_[inst as number]; }
	prevSibling(inst: TransformInstance): TransformInstance { return this.prevSiblingBase_[inst as number]; }
	nextSibling(inst: TransformInstance): TransformInstance { return this.nextSiblingBase_[inst as number]; }

	localPosition(inst: TransformInstance) { return Vector3.fromArray(this.positionBase_, inst as number * 3); }
	localRotation(inst: TransformInstance) { return Quaternion.fromArray(this.rotationBase_, inst as number * 4); }
	localScale(inst: TransformInstance) { return Vector3.fromArray(this.scaleBase_, inst as number * 3); }

	worldPosition(inst: TransformInstance) {
		const matOffset = inst as number * 16;
		return Vector3.fromArray(this.worldMatrixBase_, matOffset + 12);
	}

	localMatrixData(inst: TransformInstance) { return this.localMatrixBase_.subarray(inst as number * 16, (inst as number + 1) * 16); }
	worldMatrixData(inst: TransformInstance) { return this.worldMatrixBase_.subarray(inst as number * 16, (inst as number + 1) * 16); }

	localMatrix(inst: TransformInstance) { return Matrix.fromArray(this.localMatrixBase_, inst as number * 16); }
	worldMatrix(inst: TransformInstance) { return Matrix.fromArray(this.worldMatrixBase_, inst as number * 16); }


	// update the world matrices of inst and all of its children
	private applyParentTransform(inst: TransformInstance, parentMatrix: Matrix) {
		const worldMat = parentMatrix.mul(this.localMatrix(inst));
		worldMat.writeToArray(this.worldMatrixBase_, inst as number * 16);

		let child = this.firstChildBase_[inst as number] as number;
		while (child !== 0) {
			this.applyParentTransform(child, worldMat);
			child = this.nextSiblingBase_[child] as number;
		}
	}


	// two overloads: one with new matrix, one with transform components
	setLocalMatrix(inst: TransformInstance, newLocalMatrix: Matrix): void;
	setLocalMatrix(inst: TransformInstance, newPosition: Vector3, newRotation: Quaternion, newScale: Vector3): void;
	setLocalMatrix(inst: TransformInstance, localMatOrPos: Matrix | Vector3, newRotation?: Quaternion, newScale?: Vector3) {
		let localMat: Matrix;
		if (arguments.length === 4) {
			localMat = Matrix.trs(localMatOrPos as Vector3, newRotation!, newScale!);
		}
		else {
			localMat = localMatOrPos as Matrix;
		}
		localMat.writeToArray(this.localMatrixBase_, inst as number * 16);

		const parent = this.parentBase_[inst as number];
		const firstChild = this.firstChildBase_[inst as number];

		// -- optimization for root-level, childless entities (of which I have seen there are many, but this may/will change)
		if (parent || firstChild) {
			const parentWorldMat = this.worldMatrix(parent);
			this.applyParentTransform(inst, parentWorldMat);
		}
		else {
			localMat.writeToArray(this.worldMatrixBase_, inst as number * 16);
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


	setPosition(inst: TransformInstance, newPosition: Vector3) {
		newPosition.writeToArray(this.positionBase_, inst as number * 3);
		this.setLocalMatrix(inst, newPosition, this.localRotation(inst), this.localScale(inst));
	}

	setRotation(inst: TransformInstance, newRotation: Quaternion) {
		newRotation.writeToArray(this.rotationBase_, inst as number * 4);
		this.setLocalMatrix(inst, this.localPosition(inst), newRotation, this.localScale(inst));
	}

	setPositionAndRotation(inst: TransformInstance, newPosition: Vector3, newRotation: Quaternion) {
		newPosition.writeToArray(this.positionBase_, inst as number * 3);
		newRotation.writeToArray(this.rotationBase_, inst as number * 4);
		this.setLocalMatrix(inst, newPosition, newRotation, this.localScale(inst));
	}

	setScale(inst: TransformInstance, newScale: Vector3) {
		newScale.writeToArray(this.scaleBase_, inst as number * 3);
		this.setLocalMatrix(inst, this.localPosition(inst), this.localRotation(inst), newScale);
	}

	setPositionAndRotationAndScale(inst: TransformInstance, newPosition: Vector3, newRotation: Quaternion, newScale: Vector3) {
		newPosition.writeToArray(this.positionBase_, inst as number * 3);
		newRotation.writeToArray(this.rotationBase_, inst as number * 4);
		newScale.writeToArray(this.scaleBase_, inst as number * 3);
		this.setLocalMatrix(inst, newPosition, newRotation, newScale);
	}


	// -- relative transform helpers

	translate(inst: TransformInstance, localDelta3: Vector3) {
		const pos = this.localPosition(inst);
		this.setPosition(inst, pos.add(localDelta3));
	}

	rotate(inst: TransformInstance, localRot: Quaternion) {
		this.setRotation(inst, this.localRotation(inst).mul(localRot));
	}

	rotateRelWorld(inst: TransformInstance, worldRot: Quaternion) {
		this.setRotation(inst, worldRot.mul(this.localRotation(inst)));
	}

	rotateByDegrees(inst: TransformInstance, localAng: Vector3) {
		const rot = this.localRotation(inst);
		const q = Quaternion.euler(localAng.x, localAng.y, localAng.z);
		this.setRotation(inst, rot.mul(q));
	}
}
