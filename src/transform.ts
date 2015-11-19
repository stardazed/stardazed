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

		static root: TransformInstance = 0;

		constructor() {
			var instanceFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // parentInstance
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

		create(linkedEntity: Entity, parent?: TransformInstance): TransformInstance;
		create(linkedEntity: Entity, desc: TransformDescriptor, parent?: TransformInstance): TransformInstance;
		create(linkedEntity: Entity, descOrParent: TransformDescriptor | TransformInstance, parent?: TransformInstance): TransformInstance {
			var entIndex = entityIndex(linkedEntity);

			if (this.instanceData_.count < entIndex) {
				if (this.instanceData_.resize(entIndex) == container.InvalidatePointers.Yes) {
					this.rebase();
				}
			}

			var inst = entIndex;

			if (descOrParent && ("position" in descOrParent)) {
				let desc = <TransformDescriptor>descOrParent;

				if (parent)
					this.parentBase_[inst] = <number>parent;
				this.positionBase_.set(desc.position, inst * math.Vec3.elementCount);
				this.rotationBase_.set(desc.rotation, inst * math.Quat.elementCount);
				this.scaleBase_.set(desc.scale, inst * math.Vec3.elementCount);

				var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, inst);
				mat4.fromRotationTranslationScale(modelMat, desc.rotation, desc.position, desc.scale);
			}
			else {
				let par = <TransformInstance>descOrParent;
				if (par)
					this.parentBase_[inst] = <number>par;

				this.rotationBase_.set(math.Quat.identity, inst * math.Quat.elementCount);
				this.scaleBase_.set(math.Vec3.one, inst * math.Vec3.elementCount);
				this.modelMatrixBase_.set(math.Mat4.identity, inst * math.Mat4.elementCount);
			}

			return inst;
		}

		// -- single instance data access
		parent(inst: TransformInstance): TransformInstance { return this.parentBase_[<number>inst]; }
		position(inst: TransformInstance) { return math.vectorArrayItem(this.positionBase_, math.Vec3, <number>inst); }
		rotation(inst: TransformInstance) { return math.vectorArrayItem(this.rotationBase_, math.Quat, <number>inst); }
		scale(inst: TransformInstance) { return math.vectorArrayItem(this.scaleBase_, math.Vec3, <number>inst); }
		modelMatrix(inst: TransformInstance) { return math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, <number>inst); }

		setParent(inst: TransformInstance, newParent: TransformInstance) {
			this.parentBase_[<number>inst] = <number>newParent;
		}

		setPosition(inst: TransformInstance, newPosition: ArrayOfNumber) {
			var index = <number>inst;
			this.positionBase_.set(newPosition, index * math.Vec3.elementCount);

			var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, index);
			mat4.fromRotationTranslationScale(modelMat, this.rotation(inst), newPosition, this.scale(inst));
		}

		setRotation(inst: TransformInstance, newRotation: ArrayOfNumber) {
			var index = <number>inst;
			this.rotationBase_.set(newRotation, index * math.Quat.elementCount);

			var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, index);
			mat4.fromRotationTranslationScale(modelMat, newRotation, this.position(inst), this.scale(inst));
		}

		setPositionAndRotation(inst: TransformInstance, newPosition: ArrayOfNumber, newRotation: ArrayOfNumber) {
			var index = <number>inst;
			this.positionBase_.set(newPosition, index * math.Vec3.elementCount);
			this.rotationBase_.set(newRotation, index * math.Quat.elementCount);

			var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, index);
			mat4.fromRotationTranslationScale(modelMat, newRotation, newPosition, this.scale(inst));
		}

		setScale(inst: TransformInstance, newScale: ArrayOfNumber) {
			var index = <number>inst;
			this.scaleBase_.set(newScale, index * math.Vec3.elementCount);

			var modelMat = math.vectorArrayItem(this.modelMatrixBase_, math.Mat4, index);
			mat4.fromRotationTranslationScale(modelMat, this.rotation(inst), this.position(inst), newScale);
		}


		// -- Entity -> TransformInstance mapping
		forEntity(ent: Entity): TransformInstance {
			var index = entityIndex(ent);
			if (index > 0 && index <= this.instanceData_.count)
				return <number>ent;
			assert(false, "No transform for entity " + index);
		}
	}

} // ns sd.world
