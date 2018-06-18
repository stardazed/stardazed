/**
 * physics/shapes - shape definitions and creation
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
// ----
function makeAmmoVec3(v3, offset = 0) {
    return new Ammo.btVector3(v3[0 + offset], v3[1 + offset], v3[2 + offset]);
}
/*
function createMeshShape(geom: geometry.Geometry, subMeshIndex?: number, convex?: boolean) {
    const triView = (subMeshIndex !== undefined) ?
        geometry.triangleViewForSubMesh(geom, subMeshIndex) :
        geometry.triangleViewForGeometry(geom);
    if (! triView) {
        return undefined;
    }
    const posAttr = geometry.findAttributeOfRoleInGeometry(geom, geometry.VertexAttributeRole.Position);
    if (! posAttr) {
        console.warn("createMeshShape: the geometry does not have a position attribute", geom);
        return undefined;
    }
    const posView = new geometry.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
    const baseVertex = posView.fromVertex;

    // use conservative guess if 16-bit indexes will work
    const use32bitIndexes = elementCountForPrimitiveCount(triView.primitiveCount) >= UInt16.max;
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
*/
export function makeShape(desc) {
    let shape;
    switch (desc.type) {
        case 1 /* Box */: {
            shape = new Ammo.btBoxShape(makeAmmoVec3(desc.halfExtents));
            break;
        }
        case 2 /* Sphere */: {
            shape = new Ammo.btSphereShape(desc.radius);
            break;
        }
        case 3 /* Capsule */: {
            if (desc.orientation === 1 /* Y */) {
                shape = new Ammo.btCapsuleShape(desc.radius, desc.height);
            }
            else if (desc.orientation === 0 /* X */) {
                shape = new Ammo.btCapsuleShapeX(desc.radius, desc.height);
            }
            else /* AxisIndex.Z */ {
                shape = new Ammo.btCapsuleShapeZ(desc.radius, desc.height);
            }
            break;
        }
        case 4 /* Cylinder */: {
            const halfExtents = makeAmmoVec3(desc.halfExtents);
            if (desc.orientation === 1 /* Y */) {
                shape = new Ammo.btCylinderShape(halfExtents);
            }
            else if (desc.orientation === 0 /* X */) {
                shape = new Ammo.btCylinderShapeX(halfExtents);
            }
            else /* AxisIndex.Z */ {
                shape = new Ammo.btCylinderShapeZ(halfExtents);
            }
            break;
        }
        case 5 /* Cone */: {
            if (desc.orientation === 1 /* Y */) {
                shape = new Ammo.btConeShape(desc.radius, desc.height);
            }
            else if (desc.orientation === 0 /* X */) {
                shape = new Ammo.btConeShapeX(desc.radius, desc.height);
            }
            else /* AxisIndex.Z */ {
                shape = new Ammo.btConeShapeZ(desc.radius, desc.height);
            }
            break;
        }
        case 6 /* Plane */: {
            shape = new Ammo.btStaticPlaneShape(makeAmmoVec3(desc.planeNormal), desc.planeConstant);
            break;
        }
        case 7 /* ConvexHull */: {
            const hull = new Ammo.btConvexHullShape();
            const endOffset = desc.pointCount * 3;
            const lastOffset = endOffset - 3;
            for (let offset = 0; offset < endOffset; offset += 3) {
                hull.addPoint(makeAmmoVec3(desc.points, offset), offset === lastOffset);
            }
            shape = hull;
            break;
        }
        // case PhysicsShapeType.Mesh: {
        // 	shape = createMeshShape(desc.geom, desc.subMeshIndex, desc.convex);
        // 	break;
        // }
        case 9 /* HeightField */: {
            break;
        }
    }
    if (!shape) {
        console.error("physics.makeShape: could not create shape", desc);
        return undefined;
    }
    if (desc.scale) {
        shape.setLocalScaling(makeAmmoVec3(desc.scale));
    }
    if (((desc.type === 8 /* Mesh */ && desc.convex)
        ||
            (desc.type !== 5 /* Cone */ && desc.type !== 6 /* Plane */))
        && desc.margin !== undefined) {
        shape.setMargin(desc.margin);
    }
    return { type: desc.type, shape };
}
//# sourceMappingURL=shapes.js.map