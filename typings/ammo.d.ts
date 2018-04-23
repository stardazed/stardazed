declare namespace Ammo {

	// ---- Memory

	interface VoidPtr {
		readonly __VoidPtr?: void;
		a: number; // memory address
	}
	const NULL: VoidPtr;

	function destroy(ammoObject: object): void;

	function _malloc(sizeBytes: number): VoidPtr;
	function _free(ptr: VoidPtr): void;

	function _memcpy(dest: VoidPtr, src: VoidPtr, count: number): VoidPtr;
	function _memmove(dest: VoidPtr, src: VoidPtr, count: number): VoidPtr;
	function _memset(dest: VoidPtr, ch: number, count: number): VoidPtr;

	const HEAP8: Int8Array;
	const HEAP16: Int16Array;
	const HEAP32: Int32Array;
	const HEAPU8: Uint8Array;
	const HEAPU16: Uint16Array;
	const HEAPU32: Uint32Array;
	const HEAPF32: Float32Array;
	const HEAPF64: Float64Array;

	// ---- Linear Math

	interface btScalarArray {
		size(): number;
		at(n: number): number;
	}

	interface btVector3Const {
		x(): number;
		y(): number;
		z(): number;

		length(): number;
		dot(v: btVector3): number;

		rotate(wAxis: btVector3, angle: number): btVector3;
	}

	interface btVector3Mutable {
		setX(x: number): void;
		setY(y: number): void;
		setZ(z: number): void;
		setValue(x: number, y: number, z: number): void;

		normalize(): void;
		rotate(wAxis: btVector3, angle: number): btVector3;

		op_add(v: btVector3): btVector3;
		op_sub(v: btVector3): btVector3;
		op_mul(scale: number): btVector3;
	}

	type btVector3 = btVector3Const & btVector3Mutable;

	interface btVector3Static {
		new(): btVector3;
		new(x: number, y: number, z: number): btVector3;
	}
	const btVector3: btVector3Static;

	interface btVector3Array {
		size(): number;
		at(n: number): btVector3;
	}

	// ----

	interface btVector4Const extends btVector3Const {
		w(): number;
	}

	interface btVector4Mutable extends btVector3Mutable {
		setValue(x: number, y: number, z: number): void;
		setValue(x: number, y: number, z: number, w: number): void;
	}

	type btVector4 = btVector4Const & btVector4Mutable;
	interface btVector4Static {
		new(): btVector4;
		new(x: number, y: number, z: number, w: number): btVector4;
	}
	const btVector4: btVector4Static;

	// ----

	interface btQuadWordConst {
		x(): number;
		y(): number;
		z(): number;
		w(): number;
	}

	interface btQuadWordMutable {
		setX(x: number): void;
		setY(y: number): void;
		setZ(z: number): void;
		setW(w: number): void;
	}

	interface btQuaternionConst extends btQuadWordConst {
		length2(): number;
		length(): number;
		dot(q: btQuaternionConst): number;
		normalized(): btQuaternion;
		getAxis(): btVector3;
		inverse(): btQuaternion;
		getAngle(): number;
		getAngleShortestPath(): number;
		angle(q: btQuaternion): number;
		angleShortestPath(q: btQuaternion): number;
	}

	interface btQuaternionMutable extends btQuadWordMutable {
		setValue(x: number, y: number, z: number, w: number): void;
		setEulerZYX(z: number, y: number, x: number): void;
		setRotation(axis: btVector3, angle: number): void;
		normalize(): void;

		op_add(q: btQuaternion): btQuaternion;
		op_sub(q: btQuaternion): btQuaternion;
		op_mul(s: number): btQuaternion;
		op_mulq(q: btQuaternion): btQuaternion;
		op_div(s: number): btQuaternion;

	}

	type btQuaternion = btQuaternionConst & btQuaternionMutable;
	interface btQuaternionStatic {
		new(x: number, y: number, z: number, w: number): btQuaternion;
	}
	const btQuaternion: btQuaternionStatic;

	// ----

	interface btMatrix3x3 {
		setEulerZYX(ex: number, ey: number, ez: number): void;
		getRotation(q: btQuaternion): void;
		getRow(y: number): btVector3;
	}

	// ----

	interface btTransformConst {
		getOrigin(): btVector3;
		getRotation(): btQuaternion;
		getBasis(): btMatrix3x3;
	}

	interface btTransform extends btTransformConst {
		setIdentity(): void;
		setOrigin(v: btVector3): void;
		setRotation(q: btQuaternion): void;
		setFromOpenGLMatrix(m: ArrayLike<number>): void;
	}

	interface btTransformStatic {
		new(): btTransform;
		new(q: btQuaternion, v: btVector3): btTransform;
	}
	const btTransform: btTransformStatic;

	// ----

	abstract class btMotionState {
		getWorldTransform(worldTrans: btTransform): void;
 		setWorldTransform(worldTrans: btTransform): void;
	}

	class btDefaultMotionState extends btMotionState {
		constructor(startTrans?: btTransform, centerOfMassOffset?: btTransform);
		m_graphicsWorldTrans: btTransform;
	}

	// ---- Collision

	const enum CollisionFlags {
		CF_STATIC_OBJECT = 1,
		CF_KINEMATIC_OBJECT = 2,
		CF_NO_CONTACT_RESPONSE = 4,
		CF_CUSTOM_MATERIAL_CALLBACK = 8,
		CF_CHARACTER_OBJECT = 16,
		CF_DISABLE_VISUALIZE_OBJECT = 32
	}

	const enum AnisotropicFrictionFlags { 
		CF_ANISOTROPIC_FRICTION_DISABLED = 0,
		CF_ANISOTROPIC_FRICTION = 1,
		CF_ANISOTROPIC_ROLLING_FRICTION = 2
	}

	const enum ActivationState {
		ACTIVE_TAG = 1,
		ISLAND_SLEEPING = 2,
		WANTS_DEACTIVATION = 3,
		DISABLE_DEACTIVATION = 4,
		DISABLE_SIMULATION = 5
	}

	abstract class btCollisionObjectConst {
		// getActivationState(): ActivationState;

		getCollisionFlags(): CollisionFlags;
		getCollisionShape(): btCollisionShape;

		// getFriction(): number;
		// getRestitution(): number;
		// getRollingFriction(): number;

		// hasAnisotropicFriction(frictionMode: AnisotropicFrictionFlags): boolean;
		// getAnisotropicFriction(): btVector3Const;

		getUserIndex(): number;
		getUserPointer(): VoidPtr;

		getWorldTransform(): btTransform; // btTransformConst really, but non-const for nc-objects

		isActive(): boolean;
		isKinematicObject(): boolean;
		isStaticObject(): boolean;
		isStaticOrKinematicObject(): boolean;

		// getCcdMotionThreshold(): number;
		// getCcdSweptSphereRadius(): number;
		// getContactProcessingThreshold(): number;
	}

	abstract class btCollisionObject extends btCollisionObjectConst {
		activate(forceActivation?: boolean): void;
		forceActivationState(newState: ActivationState): void;
		setActivationState(newState: ActivationState): void;

		setCollisionFlags(flags: CollisionFlags): void;
		setCollisionShape(shape: btCollisionShape): void;

		setFriction(friction: number): void;
		setRestitution(rest: number): void;
		setRollingFriction(friction: number): void;

		setAnisotropicFriction(anisotropicFriction: btVector3, frictionMode: AnisotropicFrictionFlags): void;

		setUserIndex(index: number): void;
		setUserPointer(userPointer: number): void;

		setWorldTransform(worldTrans: btTransform): void;

		setCcdMotionThreshold(ccdMotionThreshold: number): void;
		setCcdSweptSphereRadius(radius: number): void;
		setContactProcessingThreshold (contactProcessingThreshold: number): void;
	}

	interface btCollisionObjectArray {
		size(): number;
		at(n: number): btCollisionObject;
	}

	interface btConstCollisionObjectArray {
		size(): number;
		at(n: number): btCollisionObject;
	}

	// ----

	const enum CollisionFilterGroups {
		DefaultFilter = 1,
		StaticFilter = 2,
		KinematicFilter = 4,
		DebrisFilter = 8,
		SensorTrigger = 16,
		CharacterFilter = 32,
		AllFilter = -1
	}

	abstract class RayResultCallback {
		hasHit(): boolean;
		get_m_collisionFilterGroup(): CollisionFilterGroups;
		set_m_collisionFilterGroup(cfg: CollisionFilterGroups): void;
		get_m_collisionFilterMask(): CollisionFilterGroups;
		set_m_collisionFilterMask(cfm: CollisionFilterGroups): void;
		get_m_collisionObject(): btCollisionObjectConst;
		set_m_collisionObject(co: btCollisionObjectConst): void;
		get_m_closestHitFraction(): number;
		set_m_closestHitFraction(chf: number): void;
	}

	class ClosestRayResultCallback extends RayResultCallback {
		constructor(from: btVector3Const, to: btVector3Const);

		get_m_rayFromWorld(): btVector3;
		set_m_rayFromWorld(rfm: btVector3Const): void;
		get_m_rayToWorld(): btVector3;
		set_m_rayToWorld(rtm: btVector3): void;
		get_m_hitNormalWorld(): btVector3;
		set_m_hitNormalWorld(hnm: btVector3Const): void;
		get_m_hitPointWorld(): btVector3;
		set_m_hitPointWorld(hpm: btVector3Const): void;
	}

	class AllHitsRayResultCallback extends RayResultCallback {
		constructor(from: btVector3Const, to: btVector3Const);

		get_m_rayFromWorld(): btVector3;
		set_m_rayFromWorld(rfm: btVector3): void;
		get_m_rayToWorld(): btVector3;
		set_m_rayToWorld(rtm: btVector3): void;

		get_m_collisionObjects(): btConstCollisionObjectArray;
		set_m_collisionObjects(coa: btConstCollisionObjectArray): void;
		get_m_hitNormalWorld(): btVector3Array;
		set_m_hitNormalWorld(hnm: btVector3Array): void;
		get_m_hitPointWorld(): btVector3Array;
		set_m_hitPointWorld(hpm: btVector3Array): void;
		get_m_hitFractions(): btScalarArray;
		set_m_hitFractions(hf: btScalarArray): void;
	}


	interface btManifoldPoint {
		getPositionWorldOnA(): btVector3Const;
		getPositionWorldOnB(): btVector3Const;
		getAppliedImpulse(): number;
		getDistance(): number;
		get_m_localPointA(): btVector3;
		set_m_localPointA(lpa: btVector3): void;
		get_m_localPointB(): btVector3;
		set_m_localPointB(lpb: btVector3): void;
		get_m_positionWorldOnB(): btVector3;
		set_m_positionWorldOnB(pwob: btVector3): void;
		get_m_positionWorldOnA(): btVector3;
		set_m_positionWorldOnA(nwoa: btVector3): void;
		get_m_normalWorldOnB(): btVector3;
		set_m_normalWorldOnB(nwob: btVector3): void;
	}

	interface btCollisionObjectWrapper {
		readonly __btCollisionObjectWrapper?: void;
	}

	abstract class ContactResultCallback {
		addSingleResult(cp: btManifoldPoint, colObj0Wrap: btCollisionObjectWrapper, partId0: number, index0: number, colObj1Wrap: btCollisionObjectWrapper, partId1: number, index1: number): number;
	}

	class ConcreteContactResultCallback extends ContactResultCallback { }

	interface LocalShapeInfo {
		get_m_shapePart(): number;
		set_m_shapePart(sp: number): void;
		get_m_triangleIndex(): number;
		set_m_triangleIndex(ti: number): void;
	}

	class LocalConvexResult {
		constructor(hitCollisionObject: btCollisionObjectConst, localShapeInfo: LocalShapeInfo, hitNormalLocal: btVector3Const, hitPointLocal: btVector3Const, hitFraction: number);
		get_m_hitCollisionObject(): btCollisionObjectConst;
		set_m_hitCollisionObject(hco: btCollisionObjectConst): void;
		get_m_localShapeInfo(): LocalShapeInfo;
		set_m_localShapeInfo(lsi: LocalShapeInfo): void;
		get_m_hitNormalLocal(): btVector3;
		set_m_hitNormalLocal(nl: btVector3): void;
		get_m_hitPointLocal(): btVector3;
		set_m_hitPointLocal(hpl: btVector3): void;
		get_m_hitFraction(): number;
		set_m_hitFraction(hf: number): void;
	}

	abstract class ConvexResultCallback {
		hasHit(): boolean;
		get_m_collisionFilterGroup(): CollisionFilterGroups;
		set_m_collisionFilterGroup(cfg: CollisionFilterGroups): void;
		get_m_collisionFilterMask(): CollisionFilterGroups;
		set_m_collisionFilterMask(cfm: CollisionFilterGroups): void;
		get_m_closestHitFraction(): number;
		set_m_closestHitFraction(chf: number): void;
	}

	class ClosestConvexResultCallback extends ConvexResultCallback {
		constructor(convexFromWorld: btVector3Const, convexToWorld: btVector3Const);

		get_m_convexFromWorld(): btVector3;
		set_m_convexFromWorld(cvw: btVector3): void;
		get_m_convexToWorld(): btVector3;
		set_m_convexToWorld(ctw: btVector3): void;
		get_m_hitNormalWorld(): btVector3;
		set_m_hitNormalWorld(hnw: btVector3): void;
		get_m_hitPointWorld(): btVector3;
		set_m_hitPointWorld(hpw: btVector3): void;
	}

	// ----

	class btCollisionShape {
		setLocalScaling(scaling: btVector3Const): void;
		getLocalScaling(): btVector3;
		calculateLocalInertia(mass: number, inertia: btVector3): void;
		getMargin(): number;
		setMargin(collisionMargin: number): void;
	}

	abstract class btConvexShape extends btCollisionShape {}

	class btBoxShape extends btConvexShape {
		constructor(boxHalfExtents: btVector3);
	}

	class btCapsuleShape extends btConvexShape {
		constructor(radius: number, height: number);
		getUpAxis(): AxisIndex;
		getRadius(): number;
		getHalfHeight(): number;
	}

	class btCapsuleShapeX extends btCapsuleShape {
		constructor(radius: number, height: number);
	}

	class btCapsuleShapeZ extends btCapsuleShape {
		constructor(radius: number, height: number);
	}

	class btCylinderShape extends btConvexShape {
		constructor(halfExtents: btVector3);
	}

	class btCylinderShapeX extends btCylinderShape {
		constructor(halfExtents: btVector3);
	}

	class btCylinderShapeZ extends btCylinderShape {
		constructor(halfExtents: btVector3);
	}

	class btSphereShape extends btConvexShape {
		constructor(radius: number);
	}

	class btConeShape extends btConvexShape {
		constructor(radius: number, height: number);
	}

	class btConeShapeX extends btConeShape {
		constructor(radius: number, height: number);
	}

	class btConeShapeZ extends btConeShape {
		constructor(radius: number, height: number);
	}

	class btConvexHullShape extends btConvexShape {
		addPoint(point: btVector3Const, recalculateLocalAABB?: boolean): void;
	}

	abstract class btStridingMeshInterface {
		readonly __btStridingMeshInterface?: void;
	}

	class btTriangleMesh extends btStridingMeshInterface {
		constructor(use32bitIndices?: boolean, use4componentVertices?: boolean);
		addTriangle(vertex0: btVector3Const, vertex1: btVector3Const, vertex2: btVector3Const, removeDuplicateVertices?: boolean): void;
	}

	class btConvexTriangleMeshShape extends btConvexShape {
		constructor(meshInterface: btStridingMeshInterface, calcAabb?: boolean);
	}

	// ----

	class btCompoundShape extends btCollisionShape {
		constructor(enableDynamicAabbTree?: boolean, initialChildCapacity?: number);

		addChildShape(localTransform: btTransformConst, shape: btCollisionShape): void;
		removeChildShapeByIndex(childShapeindex: number): void;
		getNumChildShapes(): number;
		getChildShape(index: number): btCollisionShape;
	}

	// ----

	abstract class btConcaveShape extends btCollisionShape {}

	class btStaticPlaneShape extends btConcaveShape {
		constructor(planeNormal: btVector3Const, planeConstant: number);
	}

	abstract class btTriangleMeshShape extends btConcaveShape {}

	class btBvhTriangleMeshShape extends btTriangleMeshShape {
		constructor(meshInterface: btStridingMeshInterface, useQuantizedAabbCompression: boolean, buildBvh?: boolean);
	}

	const enum AxisIndex {
		X = 0,
		Y,
		Z
	}

	type PHY_ScalarType = "PHY_FLOAT" | "PHY_DOUBLE" | "PHY_INTEGER" | "PHY_SHORT" | "PHY_FIXEDPOINT88" | "PHY_UCHAR";

	class btHeightfieldTerrainShape extends btConcaveShape {
		constructor(heightStickWidth: number, heightStickLength: number, heightfieldData: VoidPtr, heightScale: number, minHeight: number, maxHeight: number, upAxis: AxisIndex, hdt: PHY_ScalarType, flipQuadEdges: boolean);
	}

	// ----

	class btDefaultCollisionConstructionInfo { }

	abstract class btCollisionConfiguration { }

	class btDefaultCollisionConfiguration extends btCollisionConfiguration {
		constructor(info?: btDefaultCollisionConstructionInfo);
	}

	class btPersistentManifold {
		getBody0(): btCollisionObjectConst;
		getBody1(): btCollisionObjectConst;
		getNumContacts(): number;
		getContactPoint(index: number): btManifoldPoint;
	}

	abstract class btDispatcher {
		getNumManifolds(): number;
		getManifoldByIndexInternal(index: number): btPersistentManifold;
	}

	class btCollisionDispatcher extends btDispatcher {
		constructor(c: btDefaultCollisionConfiguration);
	}

	interface btOverlappingPairCallback {
		readonly __btOverlappingPairCallback?: void;
	}

	abstract class btOverlappingPairCache {
  		setInternalGhostPairCallback(ghostPairCallback: btOverlappingPairCallback): void;
	}

	abstract class btBroadphaseInterface { }

	class btAxisSweep3 extends btBroadphaseInterface {
		constructor(min: btVector3, max: btVector3, maxHandles?: number, pairCache?: btOverlappingPairCache, disableRaycastAccelerator?: boolean);
	}

	class btDbvtBroadphase extends btBroadphaseInterface { }

	// ---- Dynamics

	class btRigidBodyConstructionInfo {
		constructor(mass: number, motionState: btMotionState, shape: btCollisionShape, localInertia?: btVector3);

		get_m_linearDamping(): number;
		set_m_linearDamping(ld: number): void;
		get_m_angularDamping(): number;
		set_m_angularDamping(ad: number): void;
		get_m_friction(): number;
		set_m_friction(f: number): void;
		get_m_rollingFriction(): number;
		set_m_rollingFriction(rf: number): void;
		get_m_restitution(): number;
		set_m_restitution(rest: number): void;
		get_m_linearSleepingThreshold(): number;
		set_m_linearSleepingThreshold(lst: number): void;
		get_m_angularSleepingThreshold(): number;
		set_m_angularSleepingThreshold(ast: number): void;
		get_m_additionalDamping(): boolean;
		set_m_additionalDamping(ad: boolean): void;
		get_m_additionalDampingFactor(): number;
		set_m_additionalDampingFactor(adf: number): void;
		get_m_additionalLinearDampingThresholdSqr(): number;
		set_m_additionalLinearDampingThresholdSqr(aldts: number): void;
		get_m_additionalAngularDampingThresholdSqr(): number;
		set_m_additionalAngularDampingThresholdSqr(aadts: number): void;
		get_m_additionalAngularDampingFactor(): number;
		set_m_additionalAngularDampingFactor(aadf: number): void;
	}

	class btRigidBody extends btCollisionObject {
		constructor(info: btRigidBodyConstructionInfo);

		applyCentralForce(force: btVector3Const): void;
		applyCentralImpulse(impulse: btVector3Const): void;
		applyCentralLocalForce(localForce: btVector3Const): void;
		applyForce(force: btVector3, relPos: btVector3Const): void;
		applyImpulse(impulse: btVector3Const, relPos: btVector3Const): void;
		applyLocalTorque(torque: btVector3Const): void;
		applyTorque(torque: btVector3Const): void;
		applyTorqueImpulse(torque: btVector3Const): void;

		// getLinearFactor(): btVector3Const;
		setLinearFactor(linearFactor: btVector3Const): void;
		// getAngularFactor(): btVector3Const;
		setAngularFactor(angFac: btVector3Const): void;
		getAngularVelocity(): btVector3Const;
		setAngularVelocity(angVel: btVector3Const): void;
		getLinearVelocity(): btVector3Const;
		setLinearVelocity(linVel: btVector3Const): void;
		getCenterOfMassTransform(): btTransformConst;
		setCenterOfMassTransform(xform: btTransformConst): void;
		getMotionState(): btMotionState;
		setMotionState(motionState: btMotionState): void;
		setDamping(linearDamping: number, angularDamping: number): void;
		getAabb(aabbMin: btVector3, aabbMax: btVector3): void;

		applyGravity(): void;
		getGravity(): btVector3;
		setGravity(acceleration: btVector3Const): void;

		setMassProps(mass: number, inertia: btVector3Const): void;
		setSleepingThresholds(linear: number, angular: number): void;
		updateInertiaTensor(): void;

		upcast(colObj: btCollisionObject): btRigidBody | Ammo.VoidPtr; // static member in C++, use protoype.upcast, returns Ammo.NULL on failure
	}

	// ---- Constraints

	class btConstraintSetting {
		get_m_tau(): number;
		set_m_tau(tau: number): void;
		get_m_damping(): number;
		set_m_damping(damping: number): void;
		get_m_impulseClamp(): number;
		set_m_impulseClamp(clamp: number): void;
	}

	const enum btConstraintParams {
		BT_CONSTRAINT_ERP = 1,
		BT_CONSTRAINT_STOP_ERP,
		BT_CONSTRAINT_CFM,
		BT_CONSTRAINT_STOP_CFM
	}

	abstract class btTypedConstraint {
		enableFeedback(needsFeedback: boolean): void;
		getBreakingImpulseThreshold(): number;
		setBreakingImpulseThreshold(threshold: number): void;
		// these axis parameters are (0..5), sometimes requiring -1 to mean "none"
		getParam(param: btConstraintParams, axis: number): number;
		setParam(param: btConstraintParams, value: number, axis: number): void;
	}

	class btPoint2PointConstraint extends btTypedConstraint {
		constructor(rbA: btRigidBody, rbB: btRigidBody, pivotInA: btVector3, pivotInB: btVector3);
		constructor(rbA: btRigidBody, pivotInA: btVector3);

		setPivotA(pivotA: btVector3Const): void;
		setPivotB(pivotB: btVector3Const): void;
		getPivotInA(): btVector3Const;
		getPivotInB(): btVector3Const;

		get_m_setting(): btConstraintSetting;
		set_m_setting(s: btConstraintSetting): void;
	}

	class btGeneric6DofConstraint extends btTypedConstraint {
		constructor(rbA: btRigidBody, rbB: btRigidBody, frameInA: btTransform, frameInB: btTransform, useLinearFrameReferenceFrameA: boolean);
		constructor(rbB: btRigidBody, frameInB: btTransform, useLinearFrameReferenceFrameB: boolean);

		setLinearLowerLimit(linearLower: btVector3Const): void;
		setLinearUpperLimit(linearUpper: btVector3Const): void;
		setAngularLowerLimit(angularLower: btVector3Const): void;
		setAngularUpperLimit(angularUpper: btVector3Const): void;

		getFrameOffsetA(): btTransform;
	}

	class btGeneric6DofSpringConstraint extends btGeneric6DofConstraint {
		constructor(rbA: btRigidBody, rbB: btRigidBody, frameInA: btTransform, frameInB: btTransform, useLinearFrameReferenceFrameA: boolean);
		constructor(rbB: btRigidBody, frameInB: btTransform, useLinearFrameReferenceFrameB: boolean);

		enableSpring(index: number, onOff: boolean): void;
		setStiffness(index: number, stiffness: number): void;
		setDamping(index: number, damping: number): void;
	}

	class btConeTwistConstraint extends btTypedConstraint {
		constructor(rbA: btRigidBody, rbB: btRigidBody, rbAFrame: btTransform, rbBFrame: btTransform);
		constructor(rbA: btRigidBody, rbAFrame: btTransform);

		setLimit(limitIndex: number, limitValue: number): void;
		setAngularOnly(angularOnly: boolean): void;
		setDamping(damping: number): void;
		enableMotor(b: boolean): void;
		setMaxMotorImpulse(maxMotorImpulse: number): void;
		setMaxMotorImpulseNormalized(maxMotorImpulse: number): void;
		setMotorTarget(q: btQuaternionConst): void;
		setMotorTargetInConstraintSpace(q: btQuaternionConst): void;
	}

	class btHingeConstraint extends btTypedConstraint {
		constructor(rbA: btRigidBody, rbB: btRigidBody, pivotInA: btVector3, pivotInB: btVector3, axisInA: btVector3, axisInB: btVector3, useReferenceFrameA?: boolean);
		constructor(rbA: btRigidBody, pivotInA: btVector3, axisInA: btVector3, useReferenceFrameA?: boolean);
		// constructor(rbA: btRigidBody, rbB: btRigidBody, rbAFrame: btTransform, rbBFrame: btTransform, useReferenceFrameA?: boolean);
		// constructor(rbA: btRigidBody, rbAFrame: btTransform, useReferenceFrameA?: boolean);

		setLimit(low: number, high: number, softness: number, biasFactor: number, relaxationFactor?: number): void;
		enableAngularMotor(enableMotor: boolean, targetVelocity: number, maxMotorImpulse: number): void;
		setAngularOnly(angularOnly: boolean): void;

		enableMotor(enableMotor: boolean): void;
		setMaxMotorImpulse(maxMotorImpulse: number): void;
		// setMotorTarget(qAinB: btQuaternionConst, dt: number): void;
		setMotorTarget(targetAngle: number, dt: number): void;
	}

	class btSliderConstraint extends btTypedConstraint {
		constructor(rbA: btRigidBody, rbB: btRigidBody, frameInA: btTransformConst, frameInB: btTransformConst, useLinearReferenceFrameA: boolean);
		constructor(rbB: btRigidBody, frameInB: btTransformConst, useLinearReferenceFrameA: boolean);

		setLowerLinLimit(lowerLimit: number): void;
		setUpperLinLimit(upperLimit: number): void;
		setLowerAngLimit(lowerAngLimit: number): void;
		setUpperAngLimit(upperAngLimit: number): void;
	}

	class btFixedConstraint {
		constructor(rbA: btRigidBody, rbB: btRigidBody, frameInA: btTransformConst, frameInB: btTransformConst);
	}

	// ----

	abstract class btConstraintSolver {}

	class btSequentialImpulseConstraintSolver extends btConstraintSolver {}

	// ----

	const enum DispatchFunc {
		DISPATCH_DISCRETE = 1,
		DISPATCH_CONTINUOUS
	}

	interface btDispatcherInfo {
		get_m_timeStep(): number;
		set_m_timeStep(step: number): void;
		get_m_stepCount(): number;
		set_m_stepCount(count: number): void;
		get_m_dispatchFunc(): DispatchFunc;
		set_m_dispatchFunc(func: DispatchFunc): void;
		get_m_timeOfImpact(): number;
		set_m_timeOfImpact(toi: number): void;
		get_m_useContinuous(): boolean;
		set_m_useContinuous(use: boolean): void;
		get_m_enableSatConvex(): boolean;
		set_m_enableSatConvex(enable: boolean): void;
		get_m_enableSPU(): boolean;
		set_m_enableSPU(enable: boolean): void;
		get_m_useEpa(): boolean;
		set_m_useEpa(use: boolean): void;
		get_m_allowedCcdPenetration(): number;
		set_m_allowedCcdPenetration(distance: number): void;
		get_m_useConvexConservativeDistanceUtil(): boolean;
		set_m_useConvexConservativeDistanceUtil(use: boolean): void;
		get_m_convexConservativeDistanceThreshold(): number;
		set_m_convexConservativeDistanceThreshold(use: number): void;
	}

	abstract class btCollisionWorld {
		contactPairTest(colObjA: btCollisionObject, colObjB: btCollisionObject, resultCallback: ContactResultCallback): void;
		contactTest(colObj: btCollisionObject, resultCallback: ContactResultCallback): void;
		convexSweepTest(castShape: btConvexShape, from: btTransformConst, to: btTransformConst, resultCallback: ConvexResultCallback, allowedCcdPenetration: number): void;
		rayTest(rayFromWorld: btVector3Const, rayToWorld: btVector3Const, resultCallback: RayResultCallback): void;

		addCollisionObject(collisionObject: btCollisionObject, collisionFilterGroup?: CollisionFilterGroups, collisionFilterMask?: CollisionFilterGroups): void;
		removeCollisionObject(collisionObject: btCollisionObject): void;

		updateSingleAabb(colObj: btCollisionObject): void;

		getBroadphase(): btBroadphaseInterface;
		getDispatchInfo(): btDispatcherInfo;
		getDispatcher(): btDispatcher;
		getPairCache(): btOverlappingPairCache;
	}

	interface btContactSolverInfo {
		get_m_splitImpulse(): boolean;
		set_m_splitImpulse(split: boolean): void;
		get_m_splitImpulsePenetrationThreshold(): number;
		set_m_splitImpulsePenetrationThreshold(threshold: number): void;
		get_m_numIterations(): number;
		set_m_numIterations(iterations: number): void;
	}

	abstract class btDynamicsWorld extends btCollisionWorld {
		addAction(action: btActionInterface): void;
		removeAction(action: btActionInterface): void;

		addConstraint(constraint: btTypedConstraint, disableCollisionsBetweenLinkedBodies?: boolean): void;
		removeConstraint(constraint: btTypedConstraint): void;

		addRigidBody(body: btRigidBody): void;
		addRigidBody(body: btRigidBody, group: CollisionFilterGroups, mask: CollisionFilterGroups): void;
		removeRigidBody(body: btRigidBody): void;

		getGravity(): btVector3;
		setGravity(gravity: btVector3): void;

		getSolverInfo(): btContactSolverInfo;

		stepSimulation(timeStep: number, maxSubSteps?: number, fixedTimeStep?: number): number;
	}

	class btDiscreteDynamicsWorld extends btDynamicsWorld {
		constructor(a: btDispatcher, b: btBroadphaseInterface, c: btConstraintSolver, d: btCollisionConfiguration);
	}

	// ---- Kinematic Character Controller

	class btGhostObject extends btCollisionObject {
		getNumOverlappingObjects(): number;
		getOverlappingObject(index: number): btCollisionObject;
		upcast(colObj: btCollisionObject): btGhostObject | Ammo.VoidPtr; // static member in C++, use protoype.upcast, returns Ammo.NULL on failure
	}

	class btPairCachingGhostObject extends btGhostObject { }

	class btGhostPairCallback { }

	abstract class btActionInterface {
		updateAction(collisionWorld: btCollisionWorld, deltaTimeStep: number): void;
	}

	class btKinematicCharacterController extends btActionInterface {
		constructor(ghostObject: btPairCachingGhostObject, convexShape: btConvexShape, stepHeight: number, upAxis?: AxisIndex);

		setUpAxis(axis: AxisIndex): void;
		setWalkDirection(walkDirection: btVector3Const): void;
		setVelocityForTimeInterval(velocity: btVector3Const, timeInterval: number): void;
		// reset(collisionWorld: btCollisionWorld): void;
		warp(origin: btVector3Const): void;
		preStep(collisionWorld: btCollisionWorld): void;
		playerStep(collisionWorld: btCollisionWorld, dt: number): void;
		setFallSpeed(fallSpeed: number): void;
		setJumpSpeed(jumpSpeed: number): void;
		setMaxJumpHeight(maxJumpHeight: number): void;
		setUpInterpolate(upInterpolate: boolean): void;
		canJump(): boolean;
		jump(): void;
		setGravity(gravity: number): void;
		getGravity(): number;
		setMaxSlope(slopeRadians: number): void;
		getMaxSlope(): number;
		getGhostObject(): btPairCachingGhostObject;
		setUseGhostSweepTest(useGhostObjectSweepTest: boolean): void;
		onGround(): boolean;
	}

	// ---- Vehicles

	class btVehicleTuning {
		get_m_suspensionStiffness(): number;
		set_m_suspensionStiffness(ss: number): void;
		get_m_suspensionCompression(): number;
		set_m_suspensionCompression(sc: number): void;
		get_m_suspensionDamping(): number;
		set_m_suspensionDamping(sd: number): void;
		get_m_maxSuspensionTravelCm(): number;
		set_m_maxSuspensionTravelCm(st: number): void;
		get_m_frictionSlip(): number;
		set_m_frictionSlip(fs: number): void;
		get_m_maxSuspensionForce(): number;
		set_m_maxSuspensionForce(msf: number): void;
	}

	interface btVehicleRaycasterResult {
		get_m_hitPointInWorld(): btVector3;
		set_m_hitPointInWorld(hpw: btVector3): void;
		get_m_hitNormalInWorld(): btVector3;
		set_m_hitNormalInWorld(hnw: btVector3): void;
		get_m_distFraction(): number;
		set_m_distFraction(df: number): void;
	}

	abstract class btVehicleRaycaster {
		castRay(from: btVector3Const, to: btVector3Const, result: btVehicleRaycasterResult): void;
	}

	class btDefaultVehicleRaycaster extends btVehicleRaycaster {
		constructor(world: btDynamicsWorld);
	}

	interface RaycastInfo {
		get_m_contactNormalWS(): btVector3;
		set_m_contactNormalWS(cnws: btVector3): void;
		get_m_contactPointWS(): btVector3;
		set_m_contactPointWS(cpws: btVector3): void;
		get_m_suspensionLength(): number;
		set_m_suspensionLength(sl: number): void;
		get_m_hardPointWS(): btVector3;
		set_m_hardPointWS(hpws: btVector3): void;
		get_m_wheelDirectionWS(): btVector3;
		set_m_wheelDirectionWS(wdws: btVector3): void;
		get_m_wheelAxleWS(): btVector3;
		set_m_wheelAxleWS(waws: btVector3): void;
		get_m_isInContact(): boolean;
		set_m_isInContact(iic: boolean): void;
		get_m_groundObject(): any;
		set_m_groundObject(obj: any): void;
	}

	interface btWheelInfoConstructionInfo {
		get_m_chassisConnectionCS(): btVector3;
		set_m_chassisConnectionCS(cccs: btVector3): void;
		get_m_wheelDirectionCS(): btVector3;
		set_m_wheelDirectionCS(wdcs: btVector3): void;
		get_m_wheelAxleCS(): btVector3;
		set_m_wheelAxleCS(wacs: btVector3): void;
		get_m_suspensionRestLength(): number;
		set_m_suspensionRestLength(srl: number): void;
		get_m_maxSuspensionTravelCm(): number;
		set_m_maxSuspensionTravelCm(st: number): void;
		get_m_wheelRadius(): number;
		set_m_wheelRadius(wr: number): void;
		get_m_suspensionStiffness(): number;
		set_m_suspensionStiffness(ss: number): void;
		get_m_wheelsDampingCompression(): number;
		set_m_wheelsDampingCompression(wdc: number): void;
		get_m_wheelsDampingRelaxation(): number;
		set_m_wheelsDampingRelaxation(wdr: number): void;
		get_m_frictionSlip(): number;
		set_m_frictionSlip(fs: number): void;
		get_m_maxSuspensionForce(): number;
		set_m_maxSuspensionForce(msf: number): void;
		get_m_bIsFrontWheel(): boolean;
		set_m_bIsFrontWheel(fw: boolean): void;
	}

	class btWheelInfo {
		constructor(ci: btWheelInfoConstructionInfo);
		getSuspensionRestLength(): number;
		updateWheel(chassis: btRigidBody, raycastInfo: RaycastInfo): void;

		get_m_suspensionStiffness(): number;
		get_m_suspensionStiffness(ss: number): void;
		get_m_frictionSlip(): number;
		get_m_frictionSlip(fs: number): void;
		get_m_engineForce(): number;
		get_m_engineForce(ef: number): void;
		get_m_rollInfluence(): number;
		get_m_rollInfluence(ri: number): void;
		get_m_suspensionRestLength1(): number;
		get_m_suspensionRestLength1(rl1: number): void;
		get_m_wheelsRadius(): number;
		get_m_wheelsRadius(wr: number): void;
		get_m_wheelsDampingCompression(): number;
		get_m_wheelsDampingCompression(wdc: number): void;
		get_m_wheelsDampingRelaxation(): number;
		get_m_wheelsDampingRelaxation(wdr: number): void;
		get_m_steering(): number;
		get_m_steering(s: number): void;
		get_m_maxSuspensionForce(): number;
		get_m_maxSuspensionForce(msf: number): void;
		get_m_maxSuspensionTravelCm(): number;
		get_m_maxSuspensionTravelCm(mst: number): void;
		get_m_wheelsSuspensionForce(): number;
		get_m_wheelsSuspensionForce(wsf: number): void;
		get_m_bIsFrontWheel(): boolean;
		get_m_bIsFrontWheel(fw: boolean): void;
		get_m_raycastInfo(): RaycastInfo;
		get_m_raycastInfo(ri: RaycastInfo): void;
		get_m_chassisConnectionPointCS(): btVector3;
		get_m_chassisConnectionPointCS(ccp: btVector3): void;
		get_m_worldTransform(): btTransform;
		get_m_worldTransform(wt: btTransform): void;
		get_m_wheelDirectionCS(): btVector3;
		get_m_wheelDirectionCS(wdcs: btVector3): void;
		get_m_wheelAxleCS(): btVector3;
		get_m_wheelAxleCS(wacs: btVector3): void;
		get_m_rotation(): number;
		get_m_rotation(rot: number): void;
		get_m_deltaRotation(): number;
		get_m_deltaRotation(dr: number): void;
		get_m_brake(): number;
		get_m_brake(brake: number): void;
		get_m_clippedInvContactDotSuspension(): number;
		get_m_clippedInvContactDotSuspension(cicds: number): void;
		get_m_suspensionRelativeVelocity(): number;
		get_m_suspensionRelativeVelocity(srv: number): void;
		get_m_skidInfo(): number;
		get_m_skidInfo(si: number): void;
	}

	class btRaycastVehicle extends btActionInterface {
		constructor(tuning: btVehicleTuning, chassis: btRigidBody, raycaster: btVehicleRaycaster);
		applyEngineForce(force: number, wheel: number): void;
		setSteeringValue(steering: number, wheel: number): void;
		getWheelTransformWS(wheelIndex: number): btTransformConst;
		updateWheelTransform(wheelIndex: number, interpolatedTransform: boolean): void;
		addWheel(connectionPointCS0: btVector3Const, wheelDirectionCS0: btVector3Const, wheelAxleCS: btVector3Const, suspensionRestLength: number, wheelRadius: number, tuning: btVehicleTuning, isFrontWheel: boolean): btWheelInfo;
		getNumWheels(): number;
		getRigidBody(): btRigidBody;
		getWheelInfo(index: number): btWheelInfo;
		setBrake(brake: number, wheelIndex: number): void;
		setCoordinateSystem(rightIndex: AxisIndex, upIndex: AxisIndex, forwardIndex: AxisIndex): void;
		getCurrentSpeedKmHour(): number;
		getChassisWorldTransform(): btTransformConst;
		rayCast(wheel: btWheelInfo): number;
		updateVehicle(step: number): void;
		resetSuspension(): void;
		getSteeringValue(wheel: number): number;
		updateWheelTransformsWS(wheel: btWheelInfo, interpolatedTransform?: boolean): void;
		setPitchControl(pitch: number): void;
		updateSuspension(deltaTime: number): void;
		updateFriction(timeStep: number): void;
		getRightAxis(): AxisIndex;
		getUpAxis(): AxisIndex;
		getForwardAxis(): AxisIndex;
		getForwardVector(): btVector3;
		getUserConstraintType(): number;
		setUserConstraintType(userConstraintType: number): void;
		setUserConstraintId(uid: number): void;
		getUserConstraintId(): number;
	}

	// ---- Soft bodies

	class btSoftBodyWorldInfo {
		get_air_density(): number;
		set_air_density(ad: number): void;
		get_water_density(): number;
		set_water_density(wd: number): void;
		get_water_offset(): number;
		set_water_offset(wo: number): void;
		get_m_maxDisplacement(): number;
		set_m_maxDisplacement(md: number): void;
		get_water_normal(): btVector3;
		set_water_normal(wn: btVector3): void;
		get_m_broadphase(): btBroadphaseInterface;
		set_m_broadphase(bp: btBroadphaseInterface): void;
		get_m_dispatcher(): btDispatcher;
		set_m_dispatcher(disp: btDispatcher): void;
		get_m_gravity(): btVector3;
		set_m_gravity(g: btVector3): void;
	}

	interface Node {
		get_m_x(): btVector3;
		set_m_x(v: btVector3): void;
		get_m_n(): btVector3;
		set_m_n(v: btVector3): void;
		get_m_f(): btVector3;
		set_m_f(v: btVector3): void;
		get_m_v(): btVector3;
		set_m_v(v: btVector3): void;
	}

	interface tNodeArray {
		size(): number;
		at(n: number): Node;
	}

	interface Material {
		get_m_kLST(): number;
		set_m_kLST(n: number): void;
		get_m_kAST(): number;
		set_m_kAST(n: number): void;
		get_m_kVST(): number;
		set_m_kVST(n: number): void;
		get_m_flags(): number;
		set_m_flags(n: number): void;
	}

	interface tMaterialArray {
		size(): number;
		at(n: number): Material;
	}

	interface Anchor {
		get_m_node(): Node;
		set_m_node(v: Node): void;
		get_m_local(): btVector3;
		set_m_local(v: btVector3): void;
		get_m_body(): btRigidBody;
		set_m_body(rb: btRigidBody): void;
		get_m_influence(): number;
		set_m_influence(n: number): void;
		get_m_c0(): btMatrix3x3;
		set_m_c0(m: btMatrix3x3): void;
		get_m_c1(): btVector3;
		set_m_c1(v: btVector3): void;
		get_m_c2(): number;
		set_m_c2(n: number): void;
	}

	interface tAnchorArray {
		size(): number;
		at(n: number): Anchor;
		clear(): void;
		push_back(val: Anchor): void;
		pop_back(): void;
	}


	interface Config {
		get_kVCF(): number;
		set_kVCF(n: number): void;
		get_kDP(): number;
		set_kDP(n: number): void;
		get_kDG(): number;
		set_kDG(n: number): void;
		get_kLF(): number;
		set_kLF(n: number): void;
		get_kPR(): number;
		set_kPR(n: number): void;
		get_kVC(): number;
		set_kVC(n: number): void;
		get_kDF(): number;
		set_kDF(n: number): void;
		get_kMT(): number;
		set_kMT(n: number): void;
		get_kCHR(): number;
		set_kCHR(n: number): void;
		get_kKHR(): number;
		set_kKHR(n: number): void;
		get_kSHR(): number;
		set_kSHR(n: number): void;
		get_kAHR(): number;
		set_kAHR(n: number): void;
		get_kSRHR_CL(): number;
		set_kSRHR_CL(n: number): void;
		get_kSKHR_CL(): number;
		set_kSKHR_CL(n: number): void;
		get_kSSHR_CL(): number;
		set_kSSHR_CL(n: number): void;
		get_kSR_SPLT_CL(): number;
		set_kSR_SPLT_CL(n: number): void;
		get_kSK_SPLT_CL(): number;
		set_kSK_SPLT_CL(n: number): void;
		get_kSS_SPLT_CL(): number;
		set_kSS_SPLT_CL(n: number): void;
		get_maxvolume(): number;
		set_maxvolume(n: number): void;
		get_timescale(): number;
		set_timescale(n: number): void;
		get_viterations(): number;
		set_viterations(n: number): void;
		get_piterations(): number;
		set_piterations(n: number): void;
		get_diterations(): number;
		set_diterations(n: number): void;
		get_citerations(): number;
		set_citerations(n: number): void;
		get_collisions(): number;
		set_collisions(n: number): void;
		get_m_anchors(): tAnchorArray;
		set_m_anchors(anchors: tAnchorArray): void;
	}

	class btSoftBody extends btCollisionObject {
		constructor(worldInfo: btSoftBodyWorldInfo, nodeCount: number, x: btVector3, m: number[]);

		get_m_cfg(): Config;
		set_m_cfg(cfg: Config): void;
		get_m_nodes(): tNodeArray;
		set_m_nodes(nodes: tNodeArray): void;
		get_m_materials(): tMaterialArray;
		set_m_materials(mats: tMaterialArray): void;

		checkLink(node0: number, node1: number): boolean;
		checkFace(node0: number, node1: number, node2: number): boolean;

		appendMaterial(): Material;
		appendNode(x: btVector3Const, m: number): void;
		appendLink(node0: number, node1: number, mat: Material, bCheckExist: boolean): void;
		appendFace(node0: number, node1: number, node2: number, mat: Material): void;
		appendTetra(node0: number, node1: number, node2: number, node3: number, mat: Material): void;
		appendAnchor(node: number, body: btRigidBody, disableCollisionBetweenLinkedBodies: boolean, influence: number): void;

		addForce(force: btVector3Const): void;
		addForce(force: btVector3Const, node: number): void;
		addAeroForceToNode(windVelocity: btVector3Const, nodeIndex: number): void;

		getTotalMass(): number;
		setTotalMass(mass: number, fromfaces: boolean): void;
		setMass(node: number, mass: number): void;

		transform(trs: btTransformConst): void;
		translate(trs: btVector3Const): void;
		rotate(rot: btQuaternionConst): void;
		scale(scl: btVector3Const): void;

		generateClusters(k: number, maxIterations?: number): number;
		generateBendingConstraints(distance: number, mat: Material): number;

		upcast(colObj: btCollisionObject): btSoftBody | Ammo.VoidPtr; // static member in C++, use protoype.upcast, returns Ammo.NULL on failure
	}

	class btSoftBodyRigidBodyCollisionConfiguration extends btDefaultCollisionConfiguration {
		constructor(info?: btDefaultCollisionConstructionInfo);
	}

	abstract class btSoftBodySolver {}
	class btDefaultSoftBodySolver extends btSoftBodySolver {	}

	interface btSoftBodyArray {
		size(): number;
		at(n: number): btSoftBody;
	}

	class btSoftRigidDynamicsWorld extends btDiscreteDynamicsWorld {
		constructor(dispatcher: btDispatcher, pairCache: btBroadphaseInterface, constraintSolver: btConstraintSolver, collisionConfiguration: btCollisionConfiguration, softBodySolver: btSoftBodySolver);

		addSoftBody(body: btSoftBody, collisionFilterGroup: CollisionFilterGroups, collisionFilterMask: CollisionFilterGroups): void;
		removeSoftBody(body: btSoftBody): void;
		removeCollisionObject(collisionObject: btCollisionObject): void;

		getWorldInfo(): btSoftBodyWorldInfo;
		getSoftBodyArray(): btSoftBodyArray;
	}

	class btSoftBodyHelpers {
		CreateRope(worldInfo: btSoftBodyWorldInfo, from: btVector3Const, to: btVector3Const, res: number, fixeds: number): btSoftBody;
		CreatePatch(worldInfo: btSoftBodyWorldInfo, corner00: btVector3Const, corner10: btVector3Const, corner01: btVector3Const, corner11: btVector3Const, resx: number, resy: number, fixeds: number, gendiags: boolean): btSoftBody;
		CreatePatchUV(worldInfo: btSoftBodyWorldInfo, corner00: btVector3Const, corner10: btVector3Const, corner01: btVector3Const, corner11: btVector3Const, resx: number, resy: number, fixeds: number, gendiags: boolean, tex_coords: number[]): btSoftBody;
		CreateEllipsoid(worldInfo: btSoftBodyWorldInfo, center: btVector3Const, radius: btVector3Const, res: number): btSoftBody;
		CreateFromTriMesh(worldInfo: btSoftBodyWorldInfo, vertices: number[], triangles: number[], ntriangles: number, randomizeConstraints: boolean): btSoftBody;
		CreateFromConvexHull(worldInfo: btSoftBodyWorldInfo, vertices: btVector3, nvertices: number, randomizeConstraints: boolean): btSoftBody;
	}
}
