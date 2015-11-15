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

	export interface TransformDescriptor {
		position: ArrayOfNumber;
		rotation: ArrayOfNumber;
		scale: ArrayOfNumber;
	}


	export class TransformManager {
		private instanceData_: container.MultiArrayBuffer;

		private parentBase_: TypedArray;
		private positionBase_: TypedArray;
		private rotationBase_: TypedArray;
		private scaleBase_: TypedArray;
		private modelMatrixBase_: TypedArray;

		static root = new Instance<TransformManager>(0);

		constructor() {
			var instanceFields: container.MABField[] = [
				{ type: UInt32, count: 1 }, // parentHandle
				{ type: Float, count: 3 },  // position
				{ type: Float, count: 4 },  // rotation
				{ type: Float, count: 3 },  // scale
				{ type: Float, count: 16 }  // modelMatrix
			];
			this.instanceData_ = new container.MultiArrayBuffer(512, instanceFields);

			this.rebase();
		}

		rebase() {
			this.parentBase_ = this.instanceData_.indexedFieldView(0);
			this.positionBase_ = this.instanceData_.indexedFieldView(1);
			this.rotationBase_ = this.instanceData_.indexedFieldView(2);
			this.scaleBase_ = this.instanceData_.indexedFieldView(3);
			this.modelMatrixBase_ = this.instanceData_.indexedFieldView(4);
		}

		// -- array access
		get count() { return this.instanceData_.count; }

		assign(linkedEntity: Entity, parent?: TransformInstance): TransformInstance;
		assign(linkedEntity: Entity, desc: TransformDescriptor, parent?: TransformInstance): TransformInstance;
		assign(linkedEntity: Entity, descOrParent: TransformDescriptor | TransformInstance, parent?: TransformInstance): TransformInstance {
			var entIndex = linkedEntity.index;

			if (this.instanceData_.count < entIndex) {
				var newCount = math.roundUpPowerOf2(entIndex);
				if (this.instanceData_.resize(newCount) == container.InvalidatePointers.Yes) {
					this.rebase();
				}
			}

			var h = new Instance<TransformManager>(entIndex);

			if (descOrParent && ("position" in descOrParent)) {
				let desc = <TransformDescriptor>descOrParent;

				if (parent)
					this.parentBase_[h.ref] = parent.ref;
				this.positionBase_.set(desc.position, h.ref * math.Vec3.elementCount);
				this.rotationBase_.set(desc.rotation, h.ref * math.Quat.elementCount);
				this.scaleBase_.set(desc.scale, h.ref * math.Vec3.elementCount);

				var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, h.ref);
				mat4.fromRotationTranslationScale(modelMat, desc.rotation, desc.position, desc.scale);
			}
			else {
				let par = <TransformInstance>descOrParent;
				if (par)
					this.parentBase_[h.ref] = par.ref;

				this.rotationBase_.set(math.Quat.identity, h.ref * math.Quat.elementCount);
				this.scaleBase_.set(math.Vec3.one, h.ref * math.Vec3.elementCount);
				this.modelMatrixBase_.set(math.Mat4.identity, h.ref * math.Mat4.elementCount);
			}

			return h;
		}

		// -- single instance data access
		parent(h: TransformInstance): TransformInstance { return new Instance<TransformManager>(this.parentBase_[h.ref]); }
		position(h: TransformInstance) { return math.vectorArrayItem(this.positionBase_, math.Vec3, h.ref); }
		rotation(h: TransformInstance) { return math.vectorArrayItem(this.rotationBase_, math.Quat, h.ref); }
		scale(h: TransformInstance) { return math.vectorArrayItem(this.scaleBase_, math.Vec3, h.ref); }
		modelMatrix(h: TransformInstance) { return math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, h.ref); }

		setParent(h: TransformInstance, newParent: TransformInstance) {
			assert(h.ref != 0);
			this.parentBase_[h.ref] = newParent.ref;
		}

		setPosition(h: TransformInstance, newPosition: ArrayOfNumber) {
			assert(h.ref != 0);

			this.positionBase_.set(newPosition, h.ref * math.Vec3.elementCount);

			var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, h.ref);
			mat4.fromRotationTranslationScale(modelMat, this.rotation(h), newPosition, this.scale(h));
		}

		setRotation(h: TransformInstance, newRotation: ArrayOfNumber) {
			assert(h.ref != 0);

			this.rotationBase_.set(newRotation, h.ref * math.Quat.elementCount);

			var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, h.ref);
			mat4.fromRotationTranslationScale(modelMat, newRotation, this.position(h), this.scale(h));
		}

		setPositionAndRotation(h: TransformInstance, newPosition: ArrayOfNumber, newRotation: ArrayOfNumber) {
			assert(h.ref != 0);

			this.positionBase_.set(newPosition, h.ref * math.Vec3.elementCount);
			this.rotationBase_.set(newRotation, h.ref * math.Quat.elementCount);

			var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, h.ref);
			mat4.fromRotationTranslationScale(modelMat, newRotation, newPosition, this.scale(h));
		}

		setScale(h: TransformInstance, newScale: ArrayOfNumber) {
			assert(h.ref != 0);

			this.scaleBase_.set(newScale, h.ref * math.Vec3.elementCount);

			var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, h.ref);
			mat4.fromRotationTranslationScale(modelMat, this.rotation(h), this.position(h), newScale);
		}


		// -- single instance state modifiers
		forEntity(ent: Entity): TransformInstance {
			return new Instance<TransformManager>(ent.index);
		}
	}

} // ns sd.world
