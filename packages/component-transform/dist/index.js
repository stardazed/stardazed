/**
 * @stardazed/transform-component - Transform component
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
import { assert, Float, SInt32 } from "@stardazed/core";
import { MultiArrayBuffer, copyIndexedMat4, refIndexedMat4, copyIndexedVec3, copyIndexedVec4 } from "@stardazed/container";
import { InstanceLinearRange, entityIndex } from "@stardazed/entity";
import { quat, vec3, mat4 } from "@stardazed/math";
export class TransformComponent {
    constructor() {
        this.defaultPos_ = vec3.zero();
        this.defaultRot_ = quat.create();
        this.defaultScale_ = vec3.one();
        const instanceFields = [
            { type: SInt32, count: 1 },
            { type: SInt32, count: 1 },
            { type: SInt32, count: 1 },
            { type: SInt32, count: 1 },
            { type: SInt32, count: 1 },
            { type: Float, count: 3 },
            { type: Float, count: 4 },
            { type: Float, count: 3 },
            { type: Float, count: 16 },
            { type: Float, count: 16 } // worldMatrix
        ];
        this.instanceData_ = new MultiArrayBuffer(2048, instanceFields); // 376 KiB
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
    create(linkedEntity, descOrParent, parent) {
        const entIndex = entityIndex(linkedEntity);
        if (this.instanceData_.count < entIndex) {
            if (this.instanceData_.resize(entIndex) === 1 /* Yes */) {
                this.rebase();
            }
        }
        const thisInstance = entIndex;
        let parentInstance = 0;
        let descriptor = null;
        this.entityBase_[thisInstance] = linkedEntity;
        if (descOrParent) {
            if (typeof descOrParent === "number") {
                parentInstance = descOrParent;
            }
            else {
                descriptor = descOrParent;
                parentInstance = parent; // can be 0
            }
        }
        else if (typeof parent === "number") {
            parentInstance = parent;
        }
        if (parentInstance) {
            this.parentBase_[thisInstance] = parentInstance;
            let myPrevSibling = this.firstChildBase_[parentInstance];
            if (myPrevSibling) {
                assert(this.prevSiblingBase_[myPrevSibling] === 0, "firstChild cannot have prev siblings");
                // find end of child chain
                while (this.nextSiblingBase_[myPrevSibling] !== 0) {
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
    destroy(_inst) {
        // TBI
    }
    destroyRange(range) {
        const iter = range.makeIterator();
        while (iter.next()) {
            this.destroy(iter.current);
        }
    }
    get count() { return this.instanceData_.count; }
    valid(inst) {
        return inst <= this.count;
    }
    all() {
        return new InstanceLinearRange(1, this.count);
    }
    // Entity -> TransformInstance mapping
    forEntity(ent) {
        const index = entityIndex(ent);
        if (index > 0 && index <= this.instanceData_.count) {
            return ent;
        }
        assert(false, `No transform for entity ${index}`);
        return 0;
    }
    // -- single instance getters
    entity(inst) { return this.entityBase_[inst]; }
    parent(inst) { return this.parentBase_[inst]; }
    firstChild(inst) { return this.firstChildBase_[inst]; }
    prevSibling(inst) { return this.prevSiblingBase_[inst]; }
    nextSibling(inst) { return this.nextSiblingBase_[inst]; }
    localPosition(inst) { return copyIndexedVec3(this.positionBase_, inst); }
    localRotation(inst) { return copyIndexedVec4(this.rotationBase_, inst); }
    localScale(inst) { return copyIndexedVec3(this.scaleBase_, inst); }
    worldPosition(inst) {
        const matOffset = inst * 16;
        return [this.worldMatrixBase_[matOffset + 12], this.worldMatrixBase_[matOffset + 13], this.worldMatrixBase_[matOffset + 14]];
    }
    localMatrix(inst) { return refIndexedMat4(this.localMatrixBase_, inst); }
    worldMatrix(inst) { return refIndexedMat4(this.worldMatrixBase_, inst); }
    copyLocalMatrix(inst) { return copyIndexedMat4(this.localMatrixBase_, inst); }
    copyWorldMatrix(inst) { return copyIndexedMat4(this.worldMatrixBase_, inst); }
    // update the world matrices of inst and all of its children
    applyParentTransform(parentMatrix, inst) {
        const localMat = this.localMatrix(inst);
        const worldMat = this.worldMatrix(inst);
        mat4.multiply(worldMat, parentMatrix, localMat);
        let child = this.firstChildBase_[inst];
        while (child !== 0) {
            this.applyParentTransform(worldMat, child);
            child = this.nextSiblingBase_[child];
        }
    }
    setLocalMatrix(inst, localMatOrRot, newPosition, newScale) {
        const localMat = refIndexedMat4(this.localMatrixBase_, inst);
        if (arguments.length === 4) {
            mat4.fromRotationTranslationScale(localMat, localMatOrRot, newPosition, newScale);
        }
        else {
            localMat.set(localMatOrRot); // 4x4 mat
        }
        const parent = this.parentBase_[inst];
        const firstChild = this.firstChildBase_[inst];
        // -- optimization for root-level, childless entities (of which I have seen there are many, but this may/will change)
        if (parent || firstChild) {
            const parentWorldMat = (parent === 0) ? mat4.create() : this.worldMatrix(parent);
            this.applyParentTransform(parentWorldMat, inst);
        }
        else {
            mat4.copy(this.worldMatrix(inst), localMat);
        }
    }
    removeFromParent(inst) {
        const index = inst;
        const parentIndex = this.parentBase_[index];
        if (!parentIndex) {
            return;
        }
        const firstChild = this.firstChildBase_[parentIndex];
        const prevSibling = this.prevSiblingBase_[index];
        const nextSibling = this.nextSiblingBase_[index];
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
    setParent(inst, newParent) {
        const thisIndex = inst;
        const parentIndex = newParent;
        this.removeFromParent(inst);
        if (parentIndex) {
            this.parentBase_[thisIndex] = parentIndex;
            let myPrevSibling = this.firstChildBase_[parentIndex];
            if (myPrevSibling) {
                // find end of child chain
                while (this.nextSiblingBase_[myPrevSibling] !== 0) {
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
    setPosition(inst, newPosition) {
        this.positionBase_.set(newPosition, inst * vec3.ELEMENT_COUNT);
        this.setLocalMatrix(inst, this.localRotation(inst), newPosition, this.localScale(inst));
    }
    setRotation(inst, newRotation) {
        this.rotationBase_.set(newRotation, inst * quat.ELEMENT_COUNT);
        this.setLocalMatrix(inst, newRotation, this.localPosition(inst), this.localScale(inst));
    }
    setPositionAndRotation(inst, newPosition, newRotation) {
        this.positionBase_.set(newPosition, inst * vec3.ELEMENT_COUNT);
        this.rotationBase_.set(newRotation, inst * quat.ELEMENT_COUNT);
        this.setLocalMatrix(inst, newRotation, newPosition, this.localScale(inst));
    }
    setScale(inst, newScale) {
        this.scaleBase_.set(newScale, inst * vec3.ELEMENT_COUNT);
        this.setLocalMatrix(inst, this.localRotation(inst), this.localPosition(inst), newScale);
    }
    setPositionAndRotationAndScale(inst, newPosition, newRotation, newScale) {
        this.positionBase_.set(newPosition, inst * vec3.ELEMENT_COUNT);
        this.rotationBase_.set(newRotation, inst * quat.ELEMENT_COUNT);
        this.scaleBase_.set(newScale, inst * vec3.ELEMENT_COUNT);
        this.setLocalMatrix(inst, newRotation, newPosition, newScale);
    }
    // -- relative transform helpers
    translate(inst, localDelta3) {
        const pos = this.localPosition(inst);
        this.setPosition(inst, [pos[0] + localDelta3[0], pos[1] + localDelta3[1], pos[2] + localDelta3[2]]);
    }
    rotate(inst, localRot) {
        this.setRotation(inst, quat.multiply([], this.localRotation(inst), localRot));
    }
    rotateRelWorld(inst, worldRot) {
        this.setRotation(inst, quat.multiply([], worldRot, this.localRotation(inst)));
    }
    rotateByAngles(inst, localAng) {
        const rot = this.localRotation(inst);
        const q = quat.fromEuler(localAng[2], localAng[1], localAng[0]);
        this.setRotation(inst, quat.multiply([], rot, q));
    }
}
//# sourceMappingURL=index.js.map