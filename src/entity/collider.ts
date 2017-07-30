// entity/collider - Collider/RigidBody component
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.entity {

	export const enum ColliderShapeType {
		Box,
		Sphere,
		Capsule,
		Cylinder,
		Cone,
		Plane,
		ConvexHull,
		Mesh,
		HeightField
	}

	export interface BoxShape {
		type: ColliderShapeType.Box;
		halfExtents: Float3;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface SphereShape {
		type: ColliderShapeType.Sphere;
		radius: number;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface CapsuleShape {
		type: ColliderShapeType.Capsule;
		radius: number;
		height: number;
		orientation: Ammo.AxisIndex;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface CylinderShape {
		type: ColliderShapeType.Cylinder;
		halfExtents: ConstFloat3;
		orientation: Ammo.AxisIndex;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface ConeShape {
		type: ColliderShapeType.Cone;
		radius: number;
		height: number;
		orientation: Ammo.AxisIndex;
		scale?: ConstFloat3;
	}

	export interface PlaneShape {
		type: ColliderShapeType.Plane;
		planeNormal: ConstFloat3;
		planeConstant: number;
	}

	export interface ConvexHullShape {
		type: ColliderShapeType.ConvexHull;
		pointCount: number;
		points: ArrayOfConstNumber; // vec3s laid out linearly
	}

	export interface MeshShape {
		type: ColliderShapeType.Mesh;
		mesh: meshdata.MeshData;
		subMeshIndex?: number;
		convex?: boolean;
		convexMargin?: number;
		scale?: ConstFloat3;
	}

	export interface HeightFieldShape {
		// constructor(heightStickWidth: number, heightStickLength: number, heightfieldData: VoidPtr, heightScale: number, minHeight: number, maxHeight: number, upAxis: AxisIndex, hdt: PHY_ScalarType, flipQuadEdges: boolean);
		type: ColliderShapeType.HeightField;
		gridWidth: number;
		gridDepth: number;
		minHeight: number;
		maxHeight: number;
		heightScale?: number;
		orientation?: Ammo.AxisIndex;
		scale?: ConstFloat3;

		// TODO: finish later
	}

	export type ColliderShape = BoxShape | SphereShape | CapsuleShape | CylinderShape | ConeShape | PlaneShape | ConvexHullShape | MeshShape | HeightFieldShape;

	export const enum ColliderType {
		Trigger,
		RigidBody
	}

	export interface Collider {
		shape: ColliderShape;

		// rigidbody
		mass: number; // 0 means fixed static object
		linearDrag: number;
		angularDrag: number;
		kinematic: boolean;
	}

	// ----

	function makeAmmoVec3(v3: ArrayOfConstNumber, offset = 0) {
		return new Ammo.btVector3(v3[0 + offset], v3[1 + offset], v3[2 + offset]);
	}

	function createMeshShape(mesh: meshdata.MeshData, subMeshIndex?: number, convex?: boolean) {
		const triView = (subMeshIndex !== undefined) ?
			meshdata.makeTriangleViewForSubMesh(mesh, subMeshIndex) :
			meshdata.makeTriangleViewForMesh(mesh);
		if (! triView) {
			return undefined;
		}
		const posAttr = meshdata.findAttributeOfRoleInMesh(mesh, meshdata.VertexAttributeRole.Position);
		if (! posAttr) {
			console.warn("createMeshShape: the mesh does not have a position attribute", mesh);
			return undefined;
		}
		const posView = new meshdata.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
		const baseVertex = posView.baseVertex;

		// use conservative guess if 16-bit indexes will work
		const use32bitIndexes = triView.count * 3 >= UInt16.max;
		const collMesh = new Ammo.btTriangleMesh(use32bitIndexes);

		triView.forEach(face => {
			const posA = posView.copyItem(face.a() - baseVertex);
			const posB = posView.copyItem(face.b() - baseVertex);
			const posC = posView.copyItem(face.c() - baseVertex);

			collMesh.addTriangle(
				new Ammo.btVector3(posA[0], posA[1], posA[2]),
				new Ammo.btVector3(posB[0], posB[1], posB[2]),
				new Ammo.btVector3(posC[0], posC[1], posC[2])
			);
		});

		return convex ? new Ammo.btConvexTriangleMeshShape(collMesh, true) : new Ammo.btBvhTriangleMeshShape(collMesh, true, true);
	}


	// ----

	export type ColliderInstance = Instance<ColliderComponent>;
	export type ColliderRange = InstanceRange<ColliderComponent>;
	export type ColliderSet = InstanceSet<ColliderComponent>;
	export type ColliderIterator = InstanceIterator<ColliderComponent>;
	export type ColliderArrayView = InstanceArrayView<ColliderComponent>;

	export class ColliderComponent implements Component<ColliderComponent> {
		private world_: Ammo.btDiscreteDynamicsWorld;

		private instanceData_: container.MultiArrayBuffer;
		private entityBase_: EntityArrayView;
		private transformBase_: TransformArrayView;
		private shapeTypeBase_: ConstEnumArrayView<ColliderShapeType>;
		private shapes_: Ammo.btCollisionShape[];
		private colliders_: Ammo.btRigidBody[];

		constructor(private transformComp_: TransformComponent) {
			// FIXME: creating the physics world will have to happen elsewhere, with physics config etc.
			const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
			const overlappingPairCache = new Ammo.btAxisSweep3(new Ammo.btVector3(-100, -100, -100), new Ammo.btVector3(100, 100, 100));
			const solver = new Ammo.btSequentialImpulseConstraintSolver();

			this.world_ = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
			this.world_.setGravity( new Ammo.btVector3(0, -9.81, 0));

			const instFields: container.MABField[] = [
				{ type: SInt32, count: 1 }, // entity
				{ type: SInt32, count: 1 }, // transform
				{ type: SInt32, count: 1 }, // collisionShapeType
			];
			this.instanceData_ = new container.MultiArrayBuffer(1024, instFields);
			this.rebase();

			this.shapes_ = [];
			this.colliders_ = [];
		}

		private rebase() {
			this.entityBase_ = this.instanceData_.indexedFieldView(0);
			this.transformBase_ = this.instanceData_.indexedFieldView(1);
			this.shapeTypeBase_ = this.instanceData_.indexedFieldView(2);
		}

		create(entity: Entity, collider: Collider): ColliderInstance {
			if (this.instanceData_.extend() === container.InvalidatePointers.Yes) {
				this.rebase();
			}
			const instance = this.instanceData_.count;

			// linking
			this.entityBase_[instance] = entity;
			this.transformBase_[instance] = this.transformComp_.forEntity(entity);

			// shape
			const shapeInfo = collider.shape;
			let shape: Ammo.btCollisionShape | undefined;
			switch (shapeInfo.type) {
				case ColliderShapeType.Box: {
					shape = new Ammo.btBoxShape(makeAmmoVec3(shapeInfo.halfExtents));
					break;
				}
				case ColliderShapeType.Sphere: {
					shape = new Ammo.btSphereShape(shapeInfo.radius);
					break;
				}
				case ColliderShapeType.Capsule: {
					if (shapeInfo.orientation === Ammo.AxisIndex.Y) {
						shape = new Ammo.btCapsuleShape(shapeInfo.radius, shapeInfo.height);
					}
					else if (shapeInfo.orientation === Ammo.AxisIndex.X) {
						shape = new Ammo.btCapsuleShapeX(shapeInfo.radius, shapeInfo.height);
					}
					else /* AxisIndex.Z */ {
						shape = new Ammo.btCapsuleShapeZ(shapeInfo.radius, shapeInfo.height);
					}
					break;
				}
				case ColliderShapeType.Cylinder: {
					const halfExtents = makeAmmoVec3(shapeInfo.halfExtents);
					if (shapeInfo.orientation === Ammo.AxisIndex.Y) {
						shape = new Ammo.btCylinderShape(halfExtents);
					}
					else if (shapeInfo.orientation === Ammo.AxisIndex.X) {
						shape = new Ammo.btCylinderShapeX(halfExtents);
					}
					else /* AxisIndex.Z */ {
						shape = new Ammo.btCylinderShapeZ(halfExtents);
					}
					break;
				}
				case ColliderShapeType.Cone: {
					if (shapeInfo.orientation === Ammo.AxisIndex.Y) {
						shape = new Ammo.btConeShape(shapeInfo.radius, shapeInfo.height);
					}
					else if (shapeInfo.orientation === Ammo.AxisIndex.X) {
						shape = new Ammo.btConeShapeX(shapeInfo.radius, shapeInfo.height);
					}
					else /* AxisIndex.Z */ {
						shape = new Ammo.btConeShapeZ(shapeInfo.radius, shapeInfo.height);
					}
					break;
				}
				case ColliderShapeType.Plane: {
					shape = new Ammo.btStaticPlaneShape(makeAmmoVec3(shapeInfo.planeNormal), shapeInfo.planeConstant);
					break;
				}
				case ColliderShapeType.ConvexHull: {
					const hull = new Ammo.btConvexHullShape();
					const endOffset = shapeInfo.pointCount * 3;
					const lastOffset = endOffset - 3;
					for (let offset = 0; offset < endOffset; offset += 3) {
						hull.addPoint(makeAmmoVec3(shapeInfo.points, offset), offset === lastOffset);
					}
					shape = hull;
					break;
				}
				case ColliderShapeType.Mesh: {
					shape = createMeshShape(shapeInfo.mesh, shapeInfo.subMeshIndex, shapeInfo.convex);
					break;
				}
				case ColliderShapeType.HeightField: {
					break;
				}
			}

			return instance;
		}

		destroy(_inst: ColliderInstance) {
		}

		destroyRange(range: ColliderRange) {
			const iter = range.makeIterator();
			while (iter.next()) {
				this.destroy(iter.current);
			}
		}

		get count() { return this.instanceData_.count; }

		valid(inst: ColliderInstance) {
			return inst <= this.count;
		}

		all(): ColliderRange {
			return new InstanceLinearRange<ColliderComponent>(1, this.count);
		}

		// -- single instance getters
	}

} // ns sd.entity
