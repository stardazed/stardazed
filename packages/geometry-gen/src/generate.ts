/**
 * geometry-gen/generate - geometry generators
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Float2, Float3, Float4 } from "@stardazed/core";
import { vec3, mat3, mat4, quat, clamp01 } from "@stardazed/math";
import { VertexAttribute, Geometry, VertexAttributeRole, allocateGeometry, makeStandardVertexLayout, PrimitiveType } from "@stardazed/geometry";
import { VertexBufferAttributeView, triangleViewForGeometry } from "@stardazed/geometry-data";
import { AttrList, attrPosition2, attrUV2 } from "./vertex-types";
import { calcVertexNormalsViews } from "./calc-derived";

export type Vec2AddFn = (u: number, v: number) => void;
export type Vec3AddFn = (x: number, y: number, z: number) => void;
export type IndexesAddFn = (a: number, b: number, c: number) => void;

export interface MeshGenerator {
	readonly vertexCount: number;
	readonly faceCount: number;

	readonly explicitNormals: boolean;

	generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
}

export interface TransformedMeshGen {
	generator: MeshGenerator;
	rotation?: Float4; // quat
	translation?: Float3; // vec3
	scale?: Float3; // vec3
}

export type MeshGenSource = MeshGenerator | TransformedMeshGen;


export async function generate(gens: MeshGenSource | MeshGenSource[], attrList?: VertexAttribute[]): Promise<Geometry> {
	if (! attrList) {
		attrList = AttrList.Pos3Norm3UV2();
	}

	const genList = Array.isArray(gens) ? gens : [gens];
	let totalVertexCount = 0;
	let totalFaceCount = 0;

	for (const genSource of genList) {
		const generator: MeshGenerator = ("generator" in genSource) ? (genSource as TransformedMeshGen).generator : genSource as MeshGenerator;
		totalVertexCount += generator.vertexCount;
		totalFaceCount += generator.faceCount;
	}

	// -- create vertex and index buffers for combined geometry
	const geom = await allocateGeometry({
		layout: makeStandardVertexLayout(attrList),
		vertexCount: totalVertexCount,
		indexCount: totalFaceCount * 3
	});
	const layout = geom.layout.layouts[0];
	const vertexBuffer = geom.vertexBuffers[0];

	// -- views into various attributes and the index buffer
	const normalAttr = layout.attrByRole(VertexAttributeRole.Normal);
	const texAttr = layout.attrByRole(VertexAttributeRole.UV);

	const posView = new VertexBufferAttributeView(geom.vertexBuffers[0], layout.attrByRole(VertexAttributeRole.Position)!);
	const normalView = normalAttr ? new VertexBufferAttributeView(vertexBuffer, normalAttr) : null;
	const texView = texAttr ? new VertexBufferAttributeView(vertexBuffer, texAttr) : null;

	const triView = await (await triangleViewForGeometry(geom)).mutableView();

	// -- data add functions for the generators
	let posIx = 0, faceIx = 0, normalIx = 0, uvIx = 0, baseVertex = 0;

	const pos2: Vec3AddFn = (x: number, y: number, _z: number) => {
		const v2 = posView.refItem(posIx);
		v2[0] = x; v2[1] = y;
		posIx++;
	};

	const pos3: Vec3AddFn = (x: number, y: number, z: number) => {
		const v3 = posView.refItem(posIx);
		v3[0] = x; v3[1] = y; v3[2] = z;
		posIx++;
	};

	const pos = posView.elementCount === 2 ? pos2 : pos3;

	const face: IndexesAddFn = (a: number, b: number, c: number) => {
		const i3 = triView.refItemMutable!(faceIx);
		i3[0] = a + baseVertex; i3[1] = b + baseVertex; i3[2] = c + baseVertex;
		faceIx++;
	};

	const normal: Vec3AddFn = normalView ?
		(x: number, y: number, z: number) => {
			const v3 = normalView!.refItem(normalIx);
			v3[0] = x; v3[1] = y; v3[2] = z;
			normalIx++;
		}
		: (_x: number, _y: number, _z: number) => { /* ignored */ };

	const uv: Vec2AddFn = texView ?
		(u: number, v: number) => {
			const v2 = texView!.refItem(uvIx);
			v2[0] = u; v2[1] = v;
			uvIx++;
		}
		: (_u: number, _v: number) => { /* ignored */ };

	// -- generate and optionally transform each part
	const posTransMatrix = mat4.create();
	const normTransMatrix = mat3.create();

	for (const genSource of genList) {
		const generator: MeshGenerator = ("generator" in genSource) ? (genSource as TransformedMeshGen).generator : genSource as MeshGenerator;
		generator.generate(pos, face, normal, uv);

		const subVtxCount = generator.vertexCount;
		const subFaceCount = generator.faceCount;
		const subPosView = posView.subView(baseVertex, subVtxCount); // WARNING FIXME: param 2 has changed to "toTriangle"
		const subNormalView = normalView ? normalView.subView(baseVertex, subVtxCount) : null; // WARNING FIXME: param 2 has changed to "toTriangle"

		// -- if the generator does not supply normals but the geometry has a Normal attribute, we calculate them
		if (subNormalView && ! generator.explicitNormals) {
			const subFaceView = triView.subView(faceIx - subFaceCount, subFaceCount); // WARNING FIXME: param 2 has changed to "toTriangle"
			calcVertexNormalsViews(subPosView, subNormalView, subFaceView);

			normalIx += subVtxCount;
		}

		// is this a TransformedMeshGen?
		if ("generator" in genSource) {
			const xformGen = genSource as TransformedMeshGen;
			const rotation = xformGen.rotation || quat.create();
			const translation = xformGen.translation || vec3.create();
			const scale = xformGen.scale || vec3.fromValues(1, 1, 1);

			// -- transform positions
			mat4.fromRotationTranslationScale(posTransMatrix, rotation, translation, scale);
			subPosView.forEach(vtxPos => { vec3.transformMat4(vtxPos, vtxPos, posTransMatrix); });

			// -- transform normals
			if (subNormalView) {
				mat3.normalFromMat4(normTransMatrix, posTransMatrix);
				subNormalView.forEach((norm) => { vec3.transformMat3(norm, norm, normTransMatrix); });
			}
		}

		baseVertex += generator.vertexCount;
	}

	// -- currently generate single primitive group for full geometry
	// TODO: make this more configurable
	geom.subMeshes.push({
		type: PrimitiveType.Triangle,
		fromElement: 0,
		elementCount: totalFaceCount * 3,
		materialIx: 0
	});

	return geom;
}


//   ___               _
//  / _ \ _  _ __ _ __| |
// | (_) | || / _` / _` |
//  \__\_\\_,_\__,_\__,_|
//

export class Quad implements MeshGenerator {
	/**
	 * @expects width_ > 0
	 * @expects height_ > 0
	 */
	constructor(private width_ = 1, private height_ = 1) {
	}

	get vertexCount(): number {
		return 4;
	}

	get faceCount(): number {
		return 2;
	}

	get explicitNormals() {
		return true;
	}

	generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
		const xh = this.width_ / 2;
		const yh = this.height_ / 2;

		position(-xh, yh, 0);
		position(xh, yh, 0);
		position(-xh, -yh, 0);
		position(xh, -yh, 0);

		normal(0, 0, -1);
		normal(0, 0, -1);
		normal(0, 0, -1);
		normal(0, 0, -1);

		// quad shows texture fully
		uv(0, 0);
		uv(1, 0);
		uv(0, 1);
		uv(1, 1);

		// ccw faces
		face(0, 3, 1);
		face(0, 2, 3);
	}
}

export async function genFullscreenQuad() {
	return await generate(new Quad(2, 2), [attrPosition2(), attrUV2()]);
}


//  _  _ ___   ___ _____    _                _     
// | \| |   \ / __|_   _| _(_)__ _ _ _  __ _| |___ 
// | .` | |) | (__  | || '_| / _` | ' \/ _` | / -_)
// |_|\_|___/ \___| |_||_| |_\__,_|_||_\__, |_\___|
//                                     |___/       

export class NDCTriangle implements MeshGenerator {
	get vertexCount(): number {
		return 3;
	}

	get faceCount(): number {
		return 1;
	}

	get explicitNormals() {
		return true;
	}

	generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
		position(-1, -1, 0);
		position(-1, 4, 0);
		position( 4, -1, 0);

		normal(0, 0, -1);
		normal(0, 0, -1);
		normal(0, 0, -1);

		// UVs go from 0 to 1 over 2 units
		uv(0, 0);
		uv(0, 2);
		uv(2, 0);

		// ccw
		face(0, 1, 2);
	}
}

export async function genFullscreenTriangle() {
	return await generate(new NDCTriangle(), [attrPosition2(), attrUV2()]);
}


//  ___ _
// | _ \ |__ _ _ _  ___
// |  _/ / _` | ' \/ -_)
// |_| |_\__,_|_||_\___|
//

export type PlaneYGenerator = (x: number, z: number) => number;

export interface PlaneDescriptor {
	width: number;
	depth: number;
	yGen?: PlaneYGenerator;

	rows: number;
	segs: number;
}

export class Plane implements MeshGenerator {
	private width_: number;
	private depth_: number;
	private rows_: number;
	private segs_: number;
	private yGen_: PlaneYGenerator;

	/**
	 * @expects desc.width > 0
	 * @expects desc.depth > 0
	 * @expects isPositiveNonZeroInteger(desc.rows)
	 * @expects isPositiveNonZeroInteger(desc.segs)
	 */
	constructor(desc: PlaneDescriptor) {
		this.width_ = desc.width;
		this.depth_ = desc.depth;
		this.rows_ = desc.rows | 0;
		this.segs_ = desc.segs | 0;
		this.yGen_ = desc.yGen || ((_x, _z) => 0);
	}

	get vertexCount(): number {
		return (this.rows_ + 1) * (this.segs_ + 1);
	}

	get faceCount(): number {
		return 2 * this.rows_ * this.segs_;
	}

	get explicitNormals() {
		return false;
	}

	generate(position: Vec3AddFn, face: IndexesAddFn, _normal: Vec3AddFn, uv: Vec2AddFn) {
		const halfWidth = this.width_ / 2;
		const halfDepth = this.depth_ / 2;
		const tileDimX = this.width_ / this.segs_;
		const tileDimZ = this.depth_ / this.rows_;

		// -- positions
		for (let z = 0; z <= this.rows_; ++z) {
			const posZ = -halfDepth + (z * tileDimZ);

			for (let x = 0; x <= this.segs_; ++x) {
				const posX = -halfWidth + (x * tileDimX);

				position(posX, this.yGen_(posX, posZ), posZ);
				uv(x / this.segs_, z / this.rows_);
			}
		}

		// -- faces
		let baseIndex = 0;
		const vertexRowCount = this.segs_ + 1;

		for (let z = 0; z < this.rows_; ++z) {
			for (let x = 0; x < this.segs_; ++x) {
				face(
					baseIndex + x + 1,
					baseIndex + x + vertexRowCount,
					baseIndex + x + vertexRowCount + 1
				);
				face(
					baseIndex + x,
					baseIndex + x + vertexRowCount,
					baseIndex + x + 1
				);
			}

			baseIndex += vertexRowCount;
		}
	}
}


//  ___
// | _ ) _____ __
// | _ \/ _ \ \ /
// |___/\___/_\_\
//

export interface BoxDescriptor {
	width: number;  // float, dimension in X
	height: number; // float, dimension in Y
	depth: number;  // float, dimension in Z

	inward?: boolean;
	uvRange?: Float2;
	uvOffset?: Float2;
}

export function cubeDescriptor(diam: number, inward = false): BoxDescriptor {
	return { width: diam, height: diam, depth: diam, inward };
}

export class Box implements MeshGenerator {
	private xDiam_: number;
	private yDiam_: number;
	private zDiam_: number;
	private uvRange_: Float2;
	private uvOffset_: Float2;
	private inward_: boolean;

	/**
	 * @expects desc.width > 0
	 * @expects desc.height > 0
	 * @expects desc.depth > 0
	 */
	constructor(desc: BoxDescriptor) {
		this.xDiam_ = desc.width;
		this.yDiam_ = desc.height;
		this.zDiam_ = desc.depth;
		this.inward_ = desc.inward || false;

		this.uvRange_ = desc.uvRange ? [desc.uvRange[0], desc.uvRange[1]] : [1, 1];
		this.uvOffset_ = desc.uvOffset ? [desc.uvOffset[0], desc.uvOffset[1]] : [0, 0];
	}

	get vertexCount(): number {
		return 24;
	}

	get faceCount(): number {
		return 12;
	}

	get explicitNormals() {
		return true;
	}

	generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
		const xh = this.xDiam_ / 2;
		const yh = this.yDiam_ / 2;
		const zh = this.zDiam_ / 2;
		const uA = this.uvOffset_[0];
		const uB = this.uvOffset_[0] + this.uvRange_[0];
		const vA = this.uvOffset_[1];
		const vB = this.uvOffset_[1] + this.uvRange_[1];
		let curVtx = 0;

		// unique positions
		const p: number[][] = [
			[ -xh, -yh, -zh ],
			[ xh, -yh, -zh ],
			[ xh, yh, -zh ],
			[ -xh, yh, -zh ],

			[ -xh, -yh, zh ],
			[ xh, -yh, zh ],
			[ xh, yh, zh ],
			[ -xh, yh, zh ]
		];

		// topleft, topright, botright, botleft
		const quad = (a: number, b: number, c: number, d: number, norm: Float3) => {
			if (this.inward_) {
				vec3.negate(norm, norm);
			}

			position(p[a][0], p[a][1], p[a][2]);
			position(p[b][0], p[b][1], p[b][2]);
			position(p[c][0], p[c][1], p[c][2]);
			position(p[d][0], p[d][1], p[d][2]);

			// normals
			normal(norm[0], norm[1], norm[2]);
			normal(norm[0], norm[1], norm[2]);
			normal(norm[0], norm[1], norm[2]);
			normal(norm[0], norm[1], norm[2]);

			// each cube quad shows texture fully by default
			uv(uB, vA);
			uv(uA, vA);
			uv(uA, vB);
			uv(uB, vB);

			// ccw faces
			if (this.inward_) {
				face(curVtx, curVtx + 2, curVtx + 1);
				face(curVtx + 2, curVtx, curVtx + 3);
			}
			else {
				face(curVtx, curVtx + 1, curVtx + 2);
				face(curVtx + 2, curVtx + 3, curVtx);
			}

			curVtx += 4;
		};

		/* tslint:disable:whitespace */
		quad(3, 2, 1, 0, [ 0, 0,-1]); // front
		quad(7, 3, 0, 4, [-1, 0, 0]); // left
		quad(6, 7, 4, 5, [ 0, 0, 1]); // back
		quad(2, 6, 5, 1, [ 1, 0, 0]); // right
		quad(7, 6, 2, 3, [ 0, 1, 0]); // top
		quad(5, 4, 0, 1, [ 0,-1, 0]); // bottom
		/* tslint:enable:whitespace */
	}
}


//   ___
//  / __|___ _ _  ___
// | (__/ _ \ ' \/ -_)
//  \___\___/_||_\___|
//

export interface ConeDescriptor {
	radiusA: number; // float, 0..
	radiusB: number; // float, 0.., radiusA == radiusB -> cylinder
	height: number;  // float, 0..

	rows: number;    // int, 1..
	segs: number;    // int, 3..
}

export class Cone implements MeshGenerator {
	private radiusA_: number;
	private radiusB_: number;
	private height_: number;
	private rows_: number;
	private segs_: number;

	/**
	 * @expects desc.radiusA >= 0
	 * @expects desc.radiusB >= 0
	 * @expects ! ((desc.radiusA === 0) && (desc.radiusB === 0))
	 * @expects desc.rows >= 1
	 * @expects desc.segs >= 3
	 */
	constructor(desc: ConeDescriptor) {
		this.radiusA_ = desc.radiusA;
		this.radiusB_ = desc.radiusB;
		this.height_ = desc.height;
		this.rows_ = desc.rows | 0;
		this.segs_ = desc.segs | 0;
	}

	get vertexCount(): number {
		return (this.segs_ + 1) * (this.rows_ + 1);
	}

	get faceCount(): number {
		let fc = (2 * this.segs_ * this.rows_);
		if ((this.radiusA_ === 0) || (this.radiusB_ === 0)) {
			fc -= this.segs_;
		}
		return fc;
	}

	get explicitNormals() {
		return true;
	}

	generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
		let vix = 0;
		const radiusDiff = this.radiusB_ - this.radiusA_;
		const tau = Math.PI * 2;

		const yNorm = radiusDiff / this.height_;

		for (let row = 0; row <= this.rows_; ++row) {
			const relPos = row / this.rows_;

			const y = (relPos * -this.height_) + (this.height_ / 2);
			const segRad = this.radiusA_ + (relPos * radiusDiff);
			const texV = relPos;

			for (let seg = 0; seg <= this.segs_; ++seg) {
				const x = Math.sin((tau / this.segs_) * seg) * segRad;
				const z = Math.cos((tau / this.segs_) * seg) * segRad;
				const texU = seg / this.segs_;

				position(x, y, z);
				const norm = vec3.normalize([], [x, yNorm, z]);
				normal(norm[0], norm[1], norm[2]);
				uv(texU, texV);
				++vix;
			}

			// construct row of faces
			if (row > 0) {
				const raix = vix - ((this.segs_ + 1) * 2);
				const rbix = vix - (this.segs_ + 1);

				for (let seg = 0; seg < this.segs_; ++seg) {
					const rl = seg;
					const rr = seg + 1;

					if (row > 1 || this.radiusA_ > 0) {
						face(raix + rl, rbix + rl, raix + rr);
					}
					if (row < this.rows_ || this.radiusB_ > 0) {
						face(raix + rr, rbix + rl, rbix + rr);
					}
				}
			}
		}
	}
}


//  ___      _
// / __|_ __| |_  ___ _ _ ___
// \__ \ '_ \ ' \/ -_) '_/ -_)
// |___/ .__/_||_\___|_| \___|
//     |_|

export interface SphereDescriptor {
	radius: number;     // float

	rows: number;       // int: 2.., number of row subdivisions
	segs: number;       // int: 3.., number of quad facets per row

	sliceFrom?: number; // float: 0.0..1.0, vertical start of sphere section (def: 0.0)
	sliceTo?: number;   // float: 0.0..1.0, vertical end of sphere section (def: 1.0)
}

export class Sphere implements MeshGenerator {
	private radius_: number;
	private rows_: number;
	private segs_: number;
	private sliceFrom_: number;
	private sliceTo_: number;

	/**
	 * @expects desc.radius > 0
	 * @expects desc.rows >= 2
	 * @expects desc.segs >= 3
	 * @expects desc.sliceTo > desc.sliceFrom
	 */
	constructor(desc: SphereDescriptor) {
		this.radius_ = desc.radius;
		this.rows_ = desc.rows | 0;
		this.segs_ = desc.segs | 0;
		this.sliceFrom_ = clamp01(desc.sliceFrom || 0.0);
		this.sliceTo_ = clamp01(desc.sliceTo || 1.0);
	}

	get vertexCount(): number {
		return (this.segs_ + 1) * (this.rows_ + 1);
	}

	get faceCount(): number {
		let fc = 2 * this.segs_ * this.rows_;
		if (this.sliceFrom_ === 0.0) {
			fc -= this.segs_;
		}
		if (this.sliceTo_ === 1.0) {
			fc -= this.segs_;
		}
		return fc;
	}

	get explicitNormals() {
		return true;
	}

	generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
		const pi = Math.PI;
		const tau = Math.PI * 2;

		const slice = this.sliceTo_ - this.sliceFrom_;
		const piFrom = this.sliceFrom_ * pi;
		const piSlice = slice * pi;

		let vix = 0;
		const openTop = this.sliceFrom_ > 0.0;
		const openBottom = this.sliceTo_ < 1.0;

		for (let row = 0; row <= this.rows_; ++row) {
			const y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
			const segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
			const texV = this.sliceFrom_ + ((row / this.rows_) * slice);

			for (let seg = 0; seg <= this.segs_; ++seg) {
				const tauSeg = (tau / this.segs_);
				const x = Math.sin(tauSeg * seg) * segRad;
				const z = Math.cos(tauSeg * seg) * segRad;
				const texU = seg / this.segs_;

				// for a sphere with origin at [0,0,0], the normalized position is the normal
				position(x, y, z);
				const norm = vec3.normalize([], [x, y, z]);
				normal(norm[0], norm[1], norm[2]);
				uv(texU, texV);
				++vix;
			}

			// construct row of faces
			if (row > 0) {
				const raix = vix - ((this.segs_ + 1) * 2);
				const rbix = vix - (this.segs_ + 1);

				for (let seg = 0; seg < this.segs_; ++seg) {
					const rl = seg;
					const rr = seg + 1;

					if (row > 1 || openTop) {
						face(raix + rl, rbix + rl, raix + rr);
					}
					if (row < this.rows_ || openBottom) {
						face(raix + rr, rbix + rl, rbix + rr);
					}
				}
			}
		}
	}
}


//  _____
// |_   _|__ _ _ _  _ ___
//   | |/ _ \ '_| || (_-<
//   |_|\___/_|  \_,_/__/
//

export interface TorusDescriptor {
	minorRadius: number; // float, >= 0
	majorRadius: number; // float, >= minorRadius

	rows: number;       // int: 4.., number of row subdivisions
	segs: number;       // int: 3.., number of quad facets per row

	sliceFrom?: number; // float: 0.0..1.0, start point of torus center axis
	sliceTo?: number;   // float: 0.0..1.0, end point of torus center axis
}

export class Torus implements MeshGenerator {
	private minorRadius_: number;
	private majorRadius_: number;
	private rows_: number;
	private segs_: number;
	private sliceFrom_: number;
	private sliceTo_: number;

	/**
	 * @expects desc.minorRadius >= 0
	 * @expects desc.majorRadius >= desc.minorRadius
	 * @expects desc.minorRadius > 0 || desc.majorRadius > 0
	 * @expects desc.rows >= 4
	 * @expects desc.segs >= 3
	 * @expects desc.sliceTo > desc.sliceFrom
	 */
	constructor(desc: TorusDescriptor) {
		this.minorRadius_ = desc.minorRadius;
		this.majorRadius_ = desc.majorRadius;
		this.rows_ = desc.rows | 0;
		this.segs_ = desc.segs | 0;
		this.sliceFrom_ = clamp01(desc.sliceFrom || 0.0);
		this.sliceTo_ = clamp01(desc.sliceTo || 1.0);
	}

	get vertexCount(): number {
		return (this.segs_ + 1) * (this.rows_ + 1);
	}

	get faceCount(): number {
		return 2 * this.segs_ * this.rows_;
	}

	get explicitNormals() {
		return true;
	}

	generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
		const tau = Math.PI * 2;

		const slice = this.sliceTo_ - this.sliceFrom_;
		const piFrom = this.sliceFrom_ * tau;
		const piSlice = slice * tau;

		let vix = 0;
		const innerRadius = this.majorRadius_ - this.minorRadius_;

		for (let row = 0; row <= this.rows_; ++row) {
			const majorAngle = piFrom + ((piSlice * row) / this.rows_); // angle on the x-y plane
			const texV = this.sliceFrom_ + ((row / this.rows_) * slice);

			for (let seg = 0; seg <= this.segs_; ++seg) {
				const innerAngle = (tau * seg) / this.segs_;

				const cx = Math.cos(majorAngle) * this.majorRadius_;
				const cy = Math.sin(majorAngle) * this.majorRadius_;

				const x = Math.cos(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);
				const y = Math.sin(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);

				const z = Math.sin(innerAngle) * innerRadius;

				const texU = seg / this.segs_;
				const vNorm = vec3.normalize([], [x - cx, y - cy, z]);

				position(x, y, z);
				normal(vNorm[0], vNorm[1], vNorm[2]);
				uv(texU, texV);
				++vix;
			}

			// construct row of faces
			if (row > 0) {
				const raix = vix - ((this.segs_ + 1) * 2);
				const rbix = vix - (this.segs_ + 1);

				for (let seg = 0; seg < this.segs_; ++seg) {
					const rl = seg;
					const rr = seg + 1;

					face(raix + rl, rbix + rl, raix + rr);
					face(raix + rr, rbix + rl, rbix + rr);
				}
			}
		}
	}
}
