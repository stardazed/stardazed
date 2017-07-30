// physics/shapes - shape definitions and creation
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.physics {

	export const enum PhysicsShapeType {
		None,
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

	export interface BoxShapeDescriptor {
		type: PhysicsShapeType.Box;
		halfExtents: Float3;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface SphereShapeDescriptor {
		type: PhysicsShapeType.Sphere;
		radius: number;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface CapsuleShapeDescriptor {
		type: PhysicsShapeType.Capsule;
		radius: number;
		height: number;
		orientation: Ammo.AxisIndex;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface CylinderShapeDescriptor {
		type: PhysicsShapeType.Cylinder;
		halfExtents: ConstFloat3;
		orientation: Ammo.AxisIndex;
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface ConeShapeDescriptor {
		type: PhysicsShapeType.Cone;
		radius: number;
		height: number;
		orientation: Ammo.AxisIndex;
		scale?: ConstFloat3;
	}

	export interface PlaneShapeDescriptor {
		type: PhysicsShapeType.Plane;
		planeNormal: ConstFloat3;
		planeConstant: number;
		scale?: ConstFloat3;
	}

	export interface ConvexHullShapeDescriptor {
		type: PhysicsShapeType.ConvexHull;
		pointCount: number;
		points: ArrayOfConstNumber; // vec3s laid out linearly
		margin?: number;
		scale?: ConstFloat3;
	}

	export interface MeshShapeDescriptor {
		type: PhysicsShapeType.Mesh;
		mesh: meshdata.MeshData;
		subMeshIndex?: number;
		convex?: boolean;
		margin?: number; // convex meshes only
		scale?: ConstFloat3;
	}

	export interface HeightFieldShapeDescriptor {
		// constructor(heightStickWidth: number, heightStickLength: number, heightfieldData: VoidPtr, heightScale: number, minHeight: number, maxHeight: number, upAxis: AxisIndex, hdt: PHY_ScalarType, flipQuadEdges: boolean);
		type: PhysicsShapeType.HeightField;
		gridWidth: number;
		gridDepth: number;
		minHeight: number;
		maxHeight: number;
		heightScale?: number;
		orientation?: Ammo.AxisIndex;
		margin?: number;
		scale?: ConstFloat3;

		// TODO: finish later
	}

	export type PhysicsShapeDescriptor =
		// convex
		BoxShapeDescriptor | SphereShapeDescriptor | CapsuleShapeDescriptor | CylinderShapeDescriptor | ConeShapeDescriptor | ConvexHullShapeDescriptor | 
		// concave
		PlaneShapeDescriptor | HeightFieldShapeDescriptor |
		// convex or concave
		MeshShapeDescriptor;

	export interface PhysicsShape {
		readonly type: PhysicsShapeType;
		readonly shape: Ammo.btCollisionShape;
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

	export function makeShape(desc: PhysicsShapeDescriptor): PhysicsShape | undefined {
		let shape: Ammo.btCollisionShape | undefined;
		switch (desc.type) {
			case PhysicsShapeType.Box: {
				shape = new Ammo.btBoxShape(makeAmmoVec3(desc.halfExtents));
				break;
			}
			case PhysicsShapeType.Sphere: {
				shape = new Ammo.btSphereShape(desc.radius);
				break;
			}
			case PhysicsShapeType.Capsule: {
				if (desc.orientation === Ammo.AxisIndex.Y) {
					shape = new Ammo.btCapsuleShape(desc.radius, desc.height);
				}
				else if (desc.orientation === Ammo.AxisIndex.X) {
					shape = new Ammo.btCapsuleShapeX(desc.radius, desc.height);
				}
				else /* AxisIndex.Z */ {
					shape = new Ammo.btCapsuleShapeZ(desc.radius, desc.height);
				}
				break;
			}
			case PhysicsShapeType.Cylinder: {
				const halfExtents = makeAmmoVec3(desc.halfExtents);
				if (desc.orientation === Ammo.AxisIndex.Y) {
					shape = new Ammo.btCylinderShape(halfExtents);
				}
				else if (desc.orientation === Ammo.AxisIndex.X) {
					shape = new Ammo.btCylinderShapeX(halfExtents);
				}
				else /* AxisIndex.Z */ {
					shape = new Ammo.btCylinderShapeZ(halfExtents);
				}
				break;
			}
			case PhysicsShapeType.Cone: {
				if (desc.orientation === Ammo.AxisIndex.Y) {
					shape = new Ammo.btConeShape(desc.radius, desc.height);
				}
				else if (desc.orientation === Ammo.AxisIndex.X) {
					shape = new Ammo.btConeShapeX(desc.radius, desc.height);
				}
				else /* AxisIndex.Z */ {
					shape = new Ammo.btConeShapeZ(desc.radius, desc.height);
				}
				break;
			}
			case PhysicsShapeType.Plane: {
				shape = new Ammo.btStaticPlaneShape(makeAmmoVec3(desc.planeNormal), desc.planeConstant);
				break;
			}
			case PhysicsShapeType.ConvexHull: {
				const hull = new Ammo.btConvexHullShape();
				const endOffset = desc.pointCount * 3;
				const lastOffset = endOffset - 3;
				for (let offset = 0; offset < endOffset; offset += 3) {
					hull.addPoint(makeAmmoVec3(desc.points, offset), offset === lastOffset);
				}
				shape = hull;
				break;
			}
			case PhysicsShapeType.Mesh: {
				shape = createMeshShape(desc.mesh, desc.subMeshIndex, desc.convex);
				break;
			}
			case PhysicsShapeType.HeightField: {
				break;
			}
		}

		if (! shape) {
			console.error("physics.makeShape: could not create shape", desc);
			return undefined;
		}
		if (desc.scale) {
			shape.setLocalScaling(makeAmmoVec3(desc.scale));
		}
		if (
			(
				(desc.type === PhysicsShapeType.Mesh && desc.convex)
				||
				(desc.type !== PhysicsShapeType.Cone && desc.type !== PhysicsShapeType.Plane)
			)
			&& desc.margin !== undefined
		) {
			shape.setMargin(desc.margin);
		}

		return { type: desc.type, shape };
	}

} // ns sd.physics
