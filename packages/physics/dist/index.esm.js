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
        geometry.makeTriangleViewForSubMesh(geom, subMeshIndex) :
        geometry.makeTriangleViewForGeometry(geom);
    if (! triView) {
        return undefined;
    }
    const posAttr = geometry.findAttributeOfRoleInGeometry(geom, geometry.VertexAttributeRole.Position);
    if (! posAttr) {
        console.warn("createMeshShape: the geometry does not have a position attribute", geom);
        return undefined;
    }
    const posView = new geometry.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
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
*/
function makeShape(desc) {
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

/**
 * math/common - shared elements
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
// constants
const EPSILON = 0.000001;
// functions
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function clamp01(n) {
    return Math.max(0.0, Math.min(1.0, n));
}
function mix(a, b, ratio) {
    return a * (1 - ratio) + b * ratio;
}

/**
 * math/vec3 - 3-element vector type
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
const ELEMENT_COUNT$1 = 3;
function create$1() {
    return new Float32Array([0, 0, 0]);
}
const zero$1 = create$1;
function one$1() {
    return new Float32Array([1, 1, 1]);
}
function clone$1(a) {
    return new Float32Array([a[0], a[1], a[2]]);
}
function fromValues$1(x, y, z) {
    return new Float32Array([x, y, z]);
}
function copy$1(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
}
function set$1(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
}
function add$1(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}
function subtract$1(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}
const sub$1 = subtract$1;
function multiply$1(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
}
const mul$1 = multiply$1;
function divide$1(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
}
const div$1 = divide$1;
function ceil$1(out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    return out;
}
function floor$1(out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    out[2] = Math.floor(a[2]);
    return out;
}
function min$1(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
}
function max$1(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
}
function round$1(out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    out[2] = Math.round(a[2]);
    return out;
}
function scale$1(out, a, s) {
    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    return out;
}
function scaleAndAdd$1(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out;
}
function distance$1(a, b) {
    const x = b[0] - a[0];
    const y = b[1] - a[1];
    const z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
}
const dist$1 = distance$1;
function squaredDistance$1(a, b) {
    const x = b[0] - a[0];
    const y = b[1] - a[1];
    const z = b[2] - a[2];
    return x * x + y * y + z * z;
}
const sqrDist$1 = squaredDistance$1;
function length$1(a) {
    const x = a[0], y = a[1], z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
}
const len$1 = length$1;
function squaredLength$1(a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    return x * x + y * y + z * z;
}
const sqrLen$1 = squaredLength$1;
function negate$1(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
}
function inverse$1(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
}
function normalize$1(out, a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    let len = x * x + y * y + z * z; // tslint:disable-line:no-shadowed-variable
    if (len > 0) {
        // TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
}
function dot$1(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross$1(out, a, b) {
    const ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
}
function lerp$1(out, a, b, t) {
    const ax = a[0], ay = a[1], az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
}
function hermite(out, a, b, c, d, t) {
    const factorTimes2 = t * t;
    const factor1 = factorTimes2 * (2 * t - 3) + 1;
    const factor2 = factorTimes2 * (t - 2) + t;
    const factor3 = factorTimes2 * (t - 1);
    const factor4 = factorTimes2 * (3 - 2 * t);
    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
    return out;
}
function bezier(out, a, b, c, d, t) {
    const inverseFactor = 1 - t;
    const inverseFactorTimesTwo = inverseFactor * inverseFactor;
    const factorTimes2 = t * t;
    const factor1 = inverseFactorTimesTwo * inverseFactor;
    const factor2 = 3 * t * inverseFactorTimesTwo;
    const factor3 = 3 * factorTimes2 * inverseFactor;
    const factor4 = factorTimes2 * t;
    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
    return out;
}
function random$1(out, scale = 1.0) {
    scale = scale || 1.0;
    const r = Math.random() * 2.0 * Math.PI;
    const z = (Math.random() * 2.0) - 1.0;
    const zScale = Math.sqrt(1.0 - z * z) * scale;
    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
}
function clamp$2(out, a, min, max) {
    if (typeof min === "number") {
        out[0] = clamp(a[0], min, max);
        out[1] = clamp(a[1], min, max);
        out[2] = clamp(a[2], min, max);
    }
    else {
        out[0] = clamp(a[0], min[0], max[0]);
        out[1] = clamp(a[1], min[1], max[1]);
        out[2] = clamp(a[2], min[2], max[2]);
    }
    return out;
}
function clamp01$2(out, a) {
    out[0] = clamp01(a[0]);
    out[1] = clamp01(a[1]);
    out[2] = clamp01(a[2]);
    return out;
}
function mix$2(out, a, b, ratio) {
    if (typeof ratio === "number") {
        out[0] = mix(a[0], b[0], ratio);
        out[1] = mix(a[1], b[1], ratio);
        out[2] = mix(a[2], b[2], ratio);
    }
    else {
        out[0] = mix(a[0], b[0], ratio[0]);
        out[1] = mix(a[1], b[1], ratio[1]);
        out[2] = mix(a[2], b[2], ratio[2]);
    }
    return out;
}
function sign$1(out, a) {
    out[0] = Math.sign(a[0]);
    out[1] = Math.sign(a[1]);
    out[2] = Math.sign(a[2]);
    return out;
}
function transformMat3$1(out, a, m) {
    const x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
}
function transformMat4$1(out, a, m) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    const w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
}
function transformQuat(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations
    const x = a[0], y = a[1], z = a[2];
    const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    // calculate quat * vec
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;
    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
}
function rotateX(out, a, b, c) {
    const p = [];
    const r = [];
    // translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    // perform rotation
    r[0] = p[0];
    r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
    r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);
    // translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
}
function rotateY(out, a, b, c) {
    const p = [];
    const r = [];
    // translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    // perform rotation
    r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
    r[1] = p[1];
    r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);
    // translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
}
function rotateZ(out, a, b, c) {
    const p = [];
    const r = [];
    // translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    // perform rotation
    r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
    r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
    r[2] = p[2];
    // translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
}
function reflect(out, a, normal) {
    scale$1(out, normal, 2.0 * dot$1(a, normal));
    return sub$1(out, a, out);
}
function arbitraryOrthogonalVec(a) {
    const p = create$1();
    const ax = Math.abs(a[0]);
    const ay = Math.abs(a[1]);
    const az = Math.abs(a[2]);
    const dominantAxis = (ax > ay) ? (ax > az ? 0 : 2) : (ay > az ? 1 : 2);
    switch (dominantAxis) {
        case 0:
            p[0] = -a[1] - a[2];
            p[1] = a[0];
            p[2] = a[0];
            break;
        case 1:
            p[0] = a[1];
            p[1] = -a[0] - a[2];
            p[2] = a[1];
            break;
        case 2:
            p[0] = a[2];
            p[1] = a[2];
            p[2] = -a[0] - a[1];
            break;
    }
    return p;
}
function forEach$1(a, opt, fn, ...args) {
    const stride = opt.stride || ELEMENT_COUNT$1;
    const offset = opt.offset || 0;
    const count = opt.count ? Math.min((opt.count * stride) + offset, a.length) : a.length;
    const vec = create$1();
    for (let i = offset; i < count; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        fn(vec, vec, args);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
    }
    return a;
}
function angle(a, b) {
    const tempA = clone$1(a);
    const tempB = clone$1(b);
    normalize$1(tempA, tempA);
    normalize$1(tempB, tempB);
    const cosine = dot$1(tempA, tempB);
    if (cosine > 1.0) {
        return 0;
    }
    else if (cosine < -1.0) {
        return Math.PI;
    }
    else {
        return Math.acos(cosine);
    }
}
function str$1(a) {
    return `vec3(${a[0]}, ${a[1]}, ${a[2]})`;
}
function exactEquals$1(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function equals$1(a, b) {
    const a0 = a[0], a1 = a[1], a2 = a[2];
    const b0 = b[0], b1 = b[1], b2 = b[2];
    return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)));
}

var vec3 = ({
	ELEMENT_COUNT: ELEMENT_COUNT$1,
	create: create$1,
	zero: zero$1,
	one: one$1,
	clone: clone$1,
	fromValues: fromValues$1,
	copy: copy$1,
	set: set$1,
	add: add$1,
	subtract: subtract$1,
	sub: sub$1,
	multiply: multiply$1,
	mul: mul$1,
	divide: divide$1,
	div: div$1,
	ceil: ceil$1,
	floor: floor$1,
	min: min$1,
	max: max$1,
	round: round$1,
	scale: scale$1,
	scaleAndAdd: scaleAndAdd$1,
	distance: distance$1,
	dist: dist$1,
	squaredDistance: squaredDistance$1,
	sqrDist: sqrDist$1,
	length: length$1,
	len: len$1,
	squaredLength: squaredLength$1,
	sqrLen: sqrLen$1,
	negate: negate$1,
	inverse: inverse$1,
	normalize: normalize$1,
	dot: dot$1,
	cross: cross$1,
	lerp: lerp$1,
	hermite: hermite,
	bezier: bezier,
	random: random$1,
	clamp: clamp$2,
	clamp01: clamp01$2,
	mix: mix$2,
	sign: sign$1,
	transformMat3: transformMat3$1,
	transformMat4: transformMat4$1,
	transformQuat: transformQuat,
	rotateX: rotateX,
	rotateY: rotateY,
	rotateZ: rotateZ,
	reflect: reflect,
	arbitraryOrthogonalVec: arbitraryOrthogonalVec,
	forEach: forEach$1,
	angle: angle,
	str: str$1,
	exactEquals: exactEquals$1,
	equals: equals$1
});

/**
 * physics/physicsworld - physics configuration and world container
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
function makeDefaultPhysicsConfig() {
    return {
        broadphaseSize: "small",
        worldMin: -100,
        worldMax: 100,
        gravity: -9.81,
        defaultLinearDrag: 0,
        defaultAngularDrag: 0.05,
        defaultFriction: 0.6,
        defaultRestitution: 0 // /
    };
}
class PhysicsWorld {
    // private readonly tempBtTrans_: Ammo.btTransform;
    constructor(config) {
        const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        const worldMin = typeof config.worldMin === "number" ?
            new Ammo.btVector3(config.worldMin, config.worldMin, config.worldMin) :
            new Ammo.btVector3(config.worldMin[0], config.worldMin[1], config.worldMin[2]);
        const worldMax = typeof config.worldMax === "number" ?
            new Ammo.btVector3(config.worldMax, config.worldMax, config.worldMax) :
            new Ammo.btVector3(config.worldMax[0], config.worldMax[1], config.worldMax[2]);
        const broadphase = config.broadphaseSize === "small" ?
            new Ammo.btAxisSweep3(worldMin, worldMax) :
            new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        const world = this.world_ = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
        const gravity = typeof config.gravity === "number" ?
            new Ammo.btVector3(0, config.gravity, 0) :
            new Ammo.btVector3(config.gravity[0], config.gravity[1], config.gravity[2]);
        world.setGravity(gravity);
        this.defaultLinearDrag_ = config.defaultLinearDrag;
        this.defaultAngularDrag_ = config.defaultAngularDrag;
        this.defaultFriction_ = config.defaultFriction;
        this.defaultRestitution_ = config.defaultRestitution;
        // this.tempBtTrans_ = new Ammo.btTransform();
        // this.lag_ = 0;
        this.haveGhosts_ = false;
    }
    createRigidBody(desc) {
        const worldPos = desc.worldPos || [0, 0, 0];
        const worldRot = desc.worldRot || [0, 0, 0, 1];
        const ammoTransform = new Ammo.btTransform(new Ammo.btQuaternion(worldRot[0], worldRot[1], worldRot[2], worldRot[3]), new Ammo.btVector3(worldPos[0], worldPos[1], worldPos[2]));
        const localInertia = new Ammo.btVector3();
        if (desc.mass > 0) {
            desc.shape.shape.calculateLocalInertia(desc.mass, localInertia);
        }
        const rigidBodyDesc = new Ammo.btRigidBodyConstructionInfo(desc.mass, new Ammo.btDefaultMotionState(ammoTransform), desc.shape.shape, localInertia);
        rigidBodyDesc.set_m_linearDamping(desc.linearDrag !== undefined ? desc.linearDrag : this.defaultLinearDrag_);
        rigidBodyDesc.set_m_angularDamping(desc.angularDrag !== undefined ? desc.angularDrag : this.defaultAngularDrag_);
        rigidBodyDesc.set_m_friction(desc.friction !== undefined ? desc.friction : this.defaultFriction_);
        rigidBodyDesc.set_m_restitution(desc.restitution !== undefined ? desc.restitution : this.defaultRestitution_);
        const body = new Ammo.btRigidBody(rigidBodyDesc);
        if (desc.isTrigger) {
            body.setCollisionFlags(body.getCollisionFlags() | 4 /* CF_NO_CONTACT_RESPONSE */);
        }
        if (desc.isKinematic) {
            body.setCollisionFlags(body.getCollisionFlags() | 2 /* CF_KINEMATIC_OBJECT */);
        }
        if (desc.isScripted) {
            body.setActivationState(4 /* DISABLE_DEACTIVATION */);
        }
        // if an axis is constrained, then the scale factor is 0, otherwise 1
        if (desc.positionConstraints) {
            const factors = [+!desc.positionConstraints[0], +!desc.positionConstraints[1], +!desc.positionConstraints[2]];
            body.setLinearFactor(new Ammo.btVector3(factors[0], factors[1], factors[2]));
        }
        if (desc.rotationConstraints) {
            const factors = [+!desc.rotationConstraints[0], +!desc.rotationConstraints[1], +!desc.rotationConstraints[2]];
            body.setAngularFactor(new Ammo.btVector3(factors[0], factors[1], factors[2]));
        }
        // collision filtering, by default mimic what Ammo does
        const isDynamic = !(body.isStaticObject() || body.isKinematicObject());
        let collisionFilterGroup = isDynamic ? 1 /* DefaultFilter */ : 2 /* StaticFilter */;
        let collisionFilterMask = isDynamic ? -1 /* AllFilter */ : -1 /* AllFilter */ ^ 2 /* StaticFilter */;
        // allow descriptor to override values
        if (desc.collisionFilterGroup !== undefined) {
            collisionFilterGroup = desc.collisionFilterGroup & 0xffff;
        }
        if (desc.collisionFilterMask !== undefined) {
            collisionFilterMask = desc.collisionFilterMask & 0xffff;
        }
        this.world_.addRigidBody(body, collisionFilterGroup, collisionFilterMask);
        return body;
    }
    removeCollisionObject(co) {
        const body = this.asRigidBody(co);
        if (body) {
            this.world_.removeRigidBody(body);
        }
        else {
            this.world_.removeCollisionObject(co);
        }
    }
    createGhostTrigger(desc) {
        const worldPos = desc.worldPos || [0, 0, 0];
        const worldRot = desc.worldRot || [0, 0, 0, 1];
        const ammoTransform = new Ammo.btTransform(new Ammo.btQuaternion(worldRot[0], worldRot[1], worldRot[2], worldRot[3]), new Ammo.btVector3(worldPos[0], worldPos[1], worldPos[2]));
        const ghost = new Ammo.btGhostObject();
        ghost.setWorldTransform(ammoTransform);
        ghost.setCollisionShape(desc.shape.shape);
        ghost.setCollisionFlags(ghost.getCollisionFlags() | 4 /* CF_NO_CONTACT_RESPONSE */);
        this.world_.addCollisionObject(ghost, 16 /* SensorTrigger */, 1 /* DefaultFilter */);
        if (!this.haveGhosts_) {
            this.haveGhosts_ = true;
            this.world_.getPairCache().setInternalGhostPairCallback(new Ammo.btGhostPairCallback());
        }
        return ghost;
    }
    asRigidBody(collObj) {
        const rb = Ammo.btRigidBody.prototype.upcast(collObj);
        if (rb === Ammo.NULL) {
            return undefined;
        }
        return rb;
    }
    asGhostObject(collObj) {
        const rb = Ammo.btGhostObject.prototype.upcast(collObj);
        if (rb === Ammo.NULL) {
            return undefined;
        }
        return rb;
    }
    /*
    createCharacter(desc: CharacterDescriptor) {
        const worldPos = desc.worldPos || [0, 0, 0];
        const worldRot = desc.worldRot || [0, 0, 0, 1];

        const ammoTransform = new Ammo.btTransform(
            new Ammo.btQuaternion(worldRot[0], worldRot[1], worldRot[2], worldRot[3]),
            new Ammo.btVector3(worldPos[0], worldPos[1], worldPos[2])
        );

        const ghost = new Ammo.btPairCachingGhostObject();
        ghost.setWorldTransform(ammoTransform);
        ghost.setCollisionShape(desc.shape.shape);
        ghost.setCollisionFlags(Ammo.CollisionFlags.CF_CHARACTER_OBJECT);
        // this.world_.broadphase.getOverlappingPairCache() -> setInternalGhostPairCallback(new btGhostPairCallback());

        const controller = new Ammo.btKinematicCharacterController(ghost, desc.shape.shape, desc.stepHeight);
        // controller.setGravity(-this.world_.getGravity().y());

        this.world_.addCollisionObject(ghost, Ammo.CollisionFilterGroups.DefaultFilter, Ammo.CollisionFilterGroups.AllFilter);
        this.world_.addAction(controller);

        return controller;
    }
    */
    // FIXME: direct passthrough for now, add proper create/remove
    addConstraint(constraint, disableCollisionsBetweenLinkedBodies) {
        this.world_.addConstraint(constraint, disableCollisionsBetweenLinkedBodies);
    }
    removeConstraint(constraint) {
        this.world_.removeConstraint(constraint);
    }
    rayCastInternal(resultClass, filter, worldFrom, worldToOrDir, maxDist) {
        if (maxDist !== undefined) {
            vec3.scaleAndAdd(worldToOrDir, worldFrom, worldToOrDir, maxDist);
        }
        const from = new Ammo.btVector3(worldFrom[0], worldFrom[1], worldFrom[2]);
        const to = new Ammo.btVector3(worldToOrDir[0], worldToOrDir[1], worldToOrDir[2]);
        const result = new resultClass(from, to);
        result.set_m_collisionFilterGroup(-1 /* AllFilter */);
        result.set_m_collisionFilterMask(filter);
        this.world_.rayTest(from, to, result);
        return result;
    }
    rayTestTarget(worldFrom, worldTo, filter = -1 /* AllFilter */) {
        return this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldTo).hasHit();
    }
    rayTest(worldFrom, worldDir, maxDistance, filter = -1 /* AllFilter */) {
        return this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldDir, maxDistance).hasHit();
    }
    closestRaycastHit(crr) {
        if (!crr.hasHit()) {
            return undefined;
        }
        const hitPoint = crr.get_m_hitPointWorld();
        const hitNormal = crr.get_m_hitNormalWorld();
        return {
            collisionObject: crr.get_m_collisionObject(),
            hitFraction: crr.get_m_closestHitFraction(),
            hitPointWorld: [hitPoint.x(), hitPoint.y(), hitPoint.z()],
            hitNormalWorld: [hitNormal.x(), hitNormal.y(), hitNormal.z()],
        };
    }
    rayCastClosestTarget(worldFrom, worldTo, filter = -1 /* AllFilter */) {
        const result = this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldTo);
        return this.closestRaycastHit(result);
    }
    rayCastClosest(worldFrom, worldDir, maxDistance, filter = -1 /* AllFilter */) {
        const result = this.rayCastInternal(Ammo.ClosestRayResultCallback, filter, worldFrom, worldDir, maxDistance);
        return this.closestRaycastHit(result);
    }
    allRaycastHits(arr) {
        if (!arr.hasHit()) {
            return [];
        }
        const hits = [];
        const cos = arr.get_m_collisionObjects();
        const fracts = arr.get_m_hitFractions();
        const points = arr.get_m_hitPointWorld();
        const normals = arr.get_m_hitNormalWorld();
        const hitCount = cos.size();
        for (let i = 0; i < hitCount; ++i) {
            const point = points.at(i);
            const normal = normals.at(i);
            hits.push({
                collisionObject: cos.at(i),
                hitFraction: fracts.at(i),
                hitPointWorld: [point.x(), point.y(), point.z()],
                hitNormalWorld: [normal.x(), normal.y(), normal.z()],
            });
        }
        return hits;
    }
    rayCastAllTarget(worldFrom, worldTo, filter = -1 /* AllFilter */) {
        const result = this.rayCastInternal(Ammo.AllHitsRayResultCallback, filter, worldFrom, worldTo);
        return this.allRaycastHits(result);
    }
    rayCastAll(worldFrom, worldDir, maxDistance, filter = -1 /* AllFilter */) {
        const result = this.rayCastInternal(Ammo.AllHitsRayResultCallback, filter, worldFrom, worldDir, maxDistance);
        return this.allRaycastHits(result);
    }
}

/**
 * @stardazed/physics - physics simulation
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { makeShape, makeDefaultPhysicsConfig, PhysicsWorld };
//# sourceMappingURL=index.esm.js.map
