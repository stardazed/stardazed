// world/rigidbody - RigidBody component
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { SInt32, Float } from "core/numeric";
import { TypedArray } from "core/array";
import { vec3, mat3, va } from "math/veclib";
import { MABField, MultiArrayBuffer, InvalidatePointers } from  "container/multiarraybuffer";
import { Instance, InstanceRange, InstanceLinearRange, InstanceSet, InstanceArrayView, InstanceIterator, ComponentManager } from "world/instance";
import { TransformManager, TransformInstance, TransformArrayView } from "world/transform";
import { Entity } from "world/entity";


export type RigidBodyInstance = Instance<RigidBodyManager>;
export type RigidBodyRange = InstanceRange<RigidBodyManager>;
export type RigidBodySet = InstanceSet<RigidBodyManager>;
export type RigidBodyIterator = InstanceIterator<RigidBodyManager>;
export type RigidBodyArrayView = InstanceArrayView<RigidBodyManager>;


export interface RigidBodyDescriptor {
	mass: number;     // kg
	hullSize?: va.Float3; // vec3: w,h,d (defaults to 1,1,1)
	// drag: number (0)
	// angularDrag: number (0.05)
	// kinematic: boolean (false)
	// gravity: boolean (true)
}


export class RigidBodyManager implements ComponentManager<RigidBodyManager> {
	private instanceData_: MultiArrayBuffer;
	private entityMap_: Map<Entity, RigidBodyInstance>;

	private entityBase_: TypedArray;
	private transformBase_: TransformArrayView;

	private massBase_: Float32Array;
	private velocityBase_: Float32Array;
	private forceBase_: Float32Array;

	private inertiaBase_: Float32Array;
	private angVelocityBase_: Float32Array;
	private torqueBase_: Float32Array;


	constructor(private transformMgr_: TransformManager) {
		const fields: MABField[] = [
			{ type: SInt32, count: 1 }, // entity
			{ type: SInt32, count: 1 }, // transform

			{ type: Float, count: 2 },  // mass, invMass
			{ type: Float, count: 3 },  // velocity
			{ type: Float, count: 3 },  // force

			{ type: Float, count: 18 }, // inertia, invInertia (Float3x3)
			{ type: Float, count: 3 },  // angVelocity
			{ type: Float, count: 3 },  // torque
		];

		this.instanceData_ = new MultiArrayBuffer(128, fields);
		this.rebase();

		this.entityMap_ = new Map<Entity, RigidBodyInstance>();
	}


	private rebase() {
		this.entityBase_ = this.instanceData_.indexedFieldView(0);
		this.transformBase_ = this.instanceData_.indexedFieldView(1);

		this.massBase_ = <Float32Array>this.instanceData_.indexedFieldView(2);
		this.velocityBase_ = <Float32Array>this.instanceData_.indexedFieldView(3);
		this.forceBase_ = <Float32Array>this.instanceData_.indexedFieldView(4);

		this.inertiaBase_ = <Float32Array>this.instanceData_.indexedFieldView(5);
		this.angVelocityBase_ = <Float32Array>this.instanceData_.indexedFieldView(6);
		this.torqueBase_ = <Float32Array>this.instanceData_.indexedFieldView(7);
	}


	create(ent: Entity, desc: RigidBodyDescriptor): RigidBodyInstance {
		if (this.instanceData_.extend() == InvalidatePointers.Yes) {
			this.rebase();
		}

		const instance = this.instanceData_.count;
		this.entityBase_[instance] = <number>ent;
		this.transformBase_[instance] = <number>this.transformMgr_.forEntity(ent);

		this.entityMap_.set(ent, <RigidBodyInstance>instance);

		// -- set constant data
		this.setMass(instance, desc.mass, desc.hullSize || vec3.one());

		// -- clear the rest
		const zero3 = vec3.zero();
		va.setIndexedVec3(this.velocityBase_, instance, zero3);
		va.setIndexedVec3(this.forceBase_, instance, zero3);

		va.setIndexedVec3(this.angVelocityBase_, instance, zero3);
		va.setIndexedVec3(this.torqueBase_, instance, zero3);

		return instance;
	}


	destroy(_inst: RigidBodyInstance) {
		// TBI
	}

	destroyRange(range: RigidBodyRange) {
		const iter = range.makeIterator();
		while (iter.next()) {
			this.destroy(iter.current);
		}
	}

	get count() { return this.instanceData_.count; }

	valid(inst: RigidBodyInstance) {
		return <number>inst <= this.count;
	}

	all(): RigidBodyRange {
		return new InstanceLinearRange<RigidBodyManager>(1, this.count);
	}


	// -- simulation

	simulate(range: RigidBodyRange, dt: number) {
		const zero3 = vec3.zero();

		const iter = range.makeIterator();
		while (iter.next()) {
			const index = <number>iter.current;
			const transform = this.transformBase_[index];

			// discrete step vectors for the positional and angular changes
			const dxdt = vec3.scale([], va.copyIndexedVec3(this.velocityBase_, index), dt);
			const dpdt = vec3.scale([], va.copyIndexedVec3(this.forceBase_, index), dt);
			const inverseMass = this.inverseMass(index);

			const dOdt = vec3.scale([], va.copyIndexedVec3(this.angVelocityBase_, index), dt);
			const dTdt = vec3.scale([], va.copyIndexedVec3(this.torqueBase_, index), dt);
			const inverseInertia = this.inverseInertia(index);

			// apply discrete forces to transform
			if (dxdt[0] || dxdt[1] || dxdt[2]) {
				this.transformMgr_.translate(transform, dxdt);
			}
			if (dOdt[0] || dOdt[1] || dOdt[2]) {
				this.transformMgr_.rotateByAngles(transform, dOdt);
			}

			// update state
			const indexVec3 = va.offsetOfIndexedVec3(index);
			this.velocityBase_[indexVec3 + 0] += dpdt[0] * inverseMass;
			this.velocityBase_[indexVec3 + 1] += dpdt[1] * inverseMass;
			this.velocityBase_[indexVec3 + 2] += dpdt[2] * inverseMass;

			const torqueInvInvertia = vec3.transformMat3([], dTdt, inverseInertia);
			this.angVelocityBase_[indexVec3 + 0] += torqueInvInvertia[0];
			this.angVelocityBase_[indexVec3 + 1] += torqueInvInvertia[1];
			this.angVelocityBase_[indexVec3 + 2] += torqueInvInvertia[2];

			// clear sum force and torque (FIXME, make this a one-step clear all)
			va.setIndexedVec3(this.forceBase_, index, zero3);
			va.setIndexedVec3(this.torqueBase_, index, zero3);
		}
	}


	// -- linked instances

	entity(inst: RigidBodyInstance): Entity {
		return this.entityBase_[<number>inst];
	}

	transform(inst: RigidBodyInstance): TransformInstance {
		return this.transformBase_[<number>inst];
	}

	forEntity(ent: Entity): RigidBodyInstance {
		return this.entityMap_.get(ent) || <RigidBodyInstance>0;
	}


	// -- constant state

	setMass(inst: RigidBodyInstance, newMass: number, hullSize: va.Float3) {
		const massOver12 = newMass / 12.0;

		const ww = hullSize[0] * hullSize[0];
		const hh = hullSize[1] * hullSize[1];
		const dd = hullSize[2] * hullSize[2];

		const inertia = mat3.create();
		inertia[0] = massOver12 * (hh + dd);
		inertia[4] = massOver12 * (ww + dd);
		inertia[8] = massOver12 * (ww + hh);

		const invInertia = mat3.invert([], inertia);

		// -- set all constant data
		va.setIndexedVec2(this.massBase_, <number>inst, [newMass, 1 / newMass]);
		const doubleIndex = 2 * <number>inst;
		va.setIndexedMat3(this.inertiaBase_, doubleIndex, inertia);
		va.setIndexedMat3(this.inertiaBase_, doubleIndex + 1, invInertia);
	}


	mass(inst: RigidBodyInstance): number {
		return va.copyIndexedVec2(this.massBase_, <number>inst)[0];
	}

	inverseMass(inst: RigidBodyInstance): number {
		return va.copyIndexedVec2(this.massBase_, <number>inst)[1];
	}

	inertia(inst: RigidBodyInstance): va.Float3x3 {
		return va.copyIndexedMat3(this.inertiaBase_, <number>inst * 2);
	}

	inverseInertia(inst: RigidBodyInstance): va.Float3x3 {
		return va.copyIndexedMat3(this.inertiaBase_, 1 + <number>inst * 2);
	}


	// -- dynamic state

	velocity(inst: RigidBodyInstance): va.Float3 {
		return va.copyIndexedVec3(this.velocityBase_, <number>inst);
	}

	setVelocity(inst: RigidBodyInstance, newVelocity: va.Float3) {
		va.setIndexedVec3(this.velocityBase_, <number>inst, newVelocity);
	}

	angVelocity(inst: RigidBodyInstance): va.Float3 {
		return va.copyIndexedVec3(this.angVelocityBase_, <number>inst);
	}

	setAngVelocity(inst: RigidBodyInstance, newAngVelocity: va.Float3) {
		va.setIndexedVec3(this.angVelocityBase_, <number>inst, newAngVelocity);
	}

	stop(inst: RigidBodyInstance) {
		const zero3 = vec3.zero();
		va.setIndexedVec3(this.velocityBase_, <number>inst, zero3);
		va.setIndexedVec3(this.angVelocityBase_, <number>inst, zero3);
	}


	// -- per timestep accumulated forces and torques

	addForce(inst: RigidBodyInstance, force: va.Float3, forceCenterOffset?: va.Float3) {
		const indexVec3 = va.offsetOfIndexedVec3(<number>inst);
		this.forceBase_[indexVec3 + 0] += force[0];
		this.forceBase_[indexVec3 + 1] += force[1];
		this.forceBase_[indexVec3 + 2] += force[2];

		if (forceCenterOffset) {
			// apply torque as well if force was not applied at exact center of body
			this.addTorque(inst, vec3.cross([], forceCenterOffset, force));
		}
	}

	addTorque(inst: RigidBodyInstance, torque: va.Float3) {
		const indexVec3 = va.offsetOfIndexedVec3(<number>inst);
		this.torqueBase_[indexVec3 + 0] += torque[0];
		this.torqueBase_[indexVec3 + 1] += torque[1];
		this.torqueBase_[indexVec3 + 2] += torque[2];
	}
}
