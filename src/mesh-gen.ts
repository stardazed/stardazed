// mesh-gen.ts - mesh generators
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="meshdata.ts" />
/// <reference path="mesh-manip.ts" />


namespace sd.mesh.gen {

	//  __  __        _    ___                       _           
	// |  \/  |___ __| |_ / __|___ _ _  ___ _ _ __ _| |_ ___ _ _ 
	// | |\/| / -_|_-< ' \ (_ / -_) ' \/ -_) '_/ _` |  _/ _ \ '_|
	// |_|  |_\___/__/_||_\___\___|_||_\___|_| \__,_|\__\___/_|  
	//                                                          

	export type Vec2AddFn = (u: number, v: number) => void;
	export type Vec3AddFn = (x: number, y: number, z: number) => void;
	export type IndexesAddFn = (a: number, b: number, c: number) => void;

	export interface MeshGenerator {
		vertexCount: number;
		faceCount: number;

		explicitNormals: boolean;

		generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
	}

	export interface TransformedMeshGen {
		generator: MeshGenerator;
		rotation?: ArrayOfNumber; // quat
		translation?: ArrayOfNumber; // vec3
		scale?: ArrayOfNumber; // vec3
	}

	export type MeshGenSource = MeshGenerator | TransformedMeshGen;


	export function createMesh(gens: MeshGenSource | MeshGenSource[], attrList?: VertexAttribute[]): MeshData {
		if (! attrList)
			attrList = AttrList.Pos3Norm3UV2();

		var genList = <MeshGenSource[]>seq(gens);
		var totalVertexCount = 0;
		var totalFaceCount = 0;

		for (var genSource of genList) {
			var generator: MeshGenerator = ("generator" in genSource) ? (<TransformedMeshGen>genSource).generator : <MeshGenerator>genSource;
			totalVertexCount += generator.vertexCount;
			totalFaceCount += generator.faceCount;
		}

		// -- create vertex and index buffers for combined mesh
		var mesh = new MeshData(attrList);
		var vertexBuffer = mesh.primaryVertexBuffer;

		vertexBuffer.allocate(totalVertexCount);
		var indexElementType = minimumIndexElementTypeForVertexCount(totalVertexCount);
		mesh.indexBuffer.allocate(PrimitiveType.Triangle, indexElementType, totalFaceCount);

		// -- views into various attributes and the index buffer
		var normalAttr = vertexBuffer.attrByRole(VertexAttributeRole.Normal);
		var texAttr = vertexBuffer.attrByRole(VertexAttributeRole.UV);

		var posView = new VertexBufferAttributeView(vertexBuffer, vertexBuffer.attrByRole(VertexAttributeRole.Position));
		var normalView = normalAttr ? new VertexBufferAttributeView(vertexBuffer, normalAttr) : null;
		var texView = texAttr ? new VertexBufferAttributeView(vertexBuffer, texAttr) : null;

		var triView = new IndexBufferTriangleView(mesh.indexBuffer);

		// -- data add functions for the generators
		var posIx = 0, faceIx = 0, normalIx = 0, uvIx = 0, baseVertex = 0;

		var pos: Vec3AddFn = (x: number, y: number, z: number) => {
			var v3 = posView.item(posIx);
			v3[0] = x; v3[1] = y; v3[2] = z;
			posIx++;
		};

		var face: IndexesAddFn = (a: number, b: number, c: number) => {
			var i3 = triView.item(faceIx);
			i3[0] = a + baseVertex; i3[1] = b + baseVertex; i3[2] = c + baseVertex;
			faceIx++;
		};

		var normal: Vec3AddFn = normalView ?
			(x: number, y: number, z: number) => {
				var v3 = normalView.item(normalIx);
				v3[0] = x; v3[1] = y; v3[2] = z;
				normalIx++;
			}
			: (x: number, y: number, z: number) => { };

		var uv: Vec2AddFn = texView ?
			(u: number, v: number) => {
				var v2 = texView.item(uvIx);
				v2[0] = u; v2[1] = v;
				uvIx++;
			}
			: (u: number, v: number) => { };

		// -- generate and optionally transform each mesh part
		var posTransMatrix = mat4.create();
		var normTransMatrix = mat3.create();

		for (var genSource of genList) {
			var generator: MeshGenerator = ("generator" in genSource) ? (<TransformedMeshGen>genSource).generator : <MeshGenerator>genSource;
			generator.generate(pos, face, normal, uv);

			var subVtxCount = generator.vertexCount;
			var subFaceCount = generator.faceCount;
			var subPosView = posView.subView(baseVertex, subVtxCount);
			var subNormalView = normalView ? normalView.subView(baseVertex, subVtxCount) : null;

			// -- if the generator does not supply normals but the mesh has a Normal attribute, we calculate them
			if (subNormalView && !generator.explicitNormals) {
				let subFaceView = triView.subView(faceIx - subFaceCount, subFaceCount);
				calcVertexNormalsViews(subPosView, subNormalView, subFaceView);

				normalIx += subVtxCount;
			}

			// is this a TransformedMeshGen?
			if ("generator" in genSource) {
				let xformGen = <TransformedMeshGen>genSource;
				let rotation = xformGen.rotation || quat.create();
				let translation = xformGen.translation || vec3.create();
				let scale = xformGen.scale || vec3.fromValues(1, 1, 1);

				// -- transform positions
				mat4.fromRotationTranslationScale(posTransMatrix, rotation, translation, scale);
				subPosView.forEach((pos) => { vec3.transformMat4(pos, pos, posTransMatrix); });

				// -- transform normals
				if (subNormalView) {
					mat3.normalFromMat4(normTransMatrix, posTransMatrix);
					subNormalView.forEach((norm) => { vec3.transformMat3(norm, norm, normTransMatrix); });
				}
			}

			baseVertex += generator.vertexCount;
		}

		// -- currently generate single primitive group for full mesh, TODO: make this more configurable
		mesh.primitiveGroups.push({ fromPrimIx: 0, primCount: totalFaceCount, materialIx: 0 });

		return mesh;
	}


	//   ___               _ 
	//  / _ \ _  _ __ _ __| |
	// | (_) | || / _` / _` |
	//  \__\_\\_,_\__,_\__,_|
	// 						 

	export class Quad implements MeshGenerator {
		constructor(private width_: number = 1, private height_: number = 1) {
			assert(width_ > 0);
			assert(height_ > 0);
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
			var xh = this.width_ / 2;
			var yh = this.height_ / 2;

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

		constructor(desc: PlaneDescriptor) {
			this.width_ = desc.width;
			this.depth_ = desc.depth;
			this.rows_ = desc.rows | 0;
			this.segs_ = desc.segs | 0;
			this.yGen_ = desc.yGen || ((x, z) => 0);

			assert(this.width_ > 0);
			assert(this.depth_ > 0);
			assert(this.rows_ > 0);
			assert(this.segs_ > 0);
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

		generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
			var halfWidth = this.width_ / 2;
			var halfDepth = this.depth_ / 2;
			var tileDimX = this.width_ / this.segs_;
			var tileDimZ = this.depth_ / this.rows_;

			// -- positions
			for (var z = 0; z <= this.rows_; ++z) {
				var posZ = -halfDepth + (z * tileDimZ);

				for (var x = 0; x <= this.segs_; ++x) {
					var posX = -halfWidth + (x * tileDimX);

					position(posX, this.yGen_(posX, posZ), posZ);
					uv(x / this.segs_, z / this.rows_);
				}
			}

			// -- faces
			var baseIndex = 0;
			var vertexRowCount = this.segs_ + 1;

			for (var z = 0; z < this.rows_; ++z) {
				for (var x = 0; x < this.segs_; ++x) {
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

		// subdivU, subdivV: number
	}

	export function cubeDescriptor(diam: number): BoxDescriptor {
		return { width: diam, height: diam, depth: diam };
	}

	export class Box implements MeshGenerator {
		private xDiam_: number;
		private yDiam_: number;
		private zDiam_: number;

		constructor(desc: BoxDescriptor) {
			this.xDiam_ = desc.width;
			this.yDiam_ = desc.height;
			this.zDiam_ = desc.depth;

			assert(this.xDiam_ > 0);
			assert(this.yDiam_ > 0);
			assert(this.zDiam_ > 0);
		}

		get vertexCount(): number {
			return 24;
		}

		get faceCount(): number {
			return 12;
		}

		get explicitNormals() {
			return false;
		}

		generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
			var xh = this.xDiam_ / 2;
			var yh = this.yDiam_ / 2;
			var zh = this.zDiam_ / 2;
			var curVtx = 0;

			// unique positions
			var p: number[][] = [
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
			var quad = function(a: number, b: number, c: number, d: number) {
				position(p[a][0], p[a][1], p[a][2]);
				position(p[b][0], p[b][1], p[b][2]);
				position(p[c][0], p[c][1], p[c][2]);
				position(p[d][0], p[d][1], p[d][2]);

				// each cube quad shows texture fully
				uv(1, 0);
				uv(0, 0);
				uv(0, 1);
				uv(1, 1);

				// ccw faces
				face(curVtx, curVtx + 1, curVtx + 2);
				face(curVtx + 2, curVtx + 3, curVtx);

				curVtx += 4;
			};

			quad(3, 2, 1, 0); // front
			quad(7, 3, 0, 4); // left
			quad(6, 7, 4, 5); // back
			quad(2, 6, 5, 1); // right
			quad(7, 6, 2, 3); // top
			quad(5, 4, 0, 1); // bottom
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

		constructor(desc: ConeDescriptor) {
			this.radiusA_ = desc.radiusA;
			this.radiusB_ = desc.radiusB;
			this.height_ = desc.height;
			this.rows_ = desc.rows | 0;
			this.segs_ = desc.segs | 0;

			assert(this.radiusA_ >= 0);
			assert(this.radiusB_ >= 0);
			assert(! ((this.radiusA_ == 0) && (this.radiusB_ == 0)));
			assert(this.rows_ >= 1);
			assert(this.segs_ >= 3);
		}

		get vertexCount(): number {
			return (this.segs_ + 1) * (this.rows_ + 1);
		}

		get faceCount(): number {
			var fc = (2 * this.segs_ * this.rows_);
			if ((this.radiusA_ == 0) || (this.radiusB_ == 0))
				fc -= this.segs_;
			return fc;
		}

		get explicitNormals() {
			return true;
		}

		generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
			var vix = 0;
			var radiusDiff = this.radiusB_ - this.radiusA_;
			var Tau = Math.PI * 2;

			var yNorm = radiusDiff / this.height_;

			for (var row = 0; row <= this.rows_; ++row) {
				var relPos = row / this.rows_;

				var y = (relPos * -this.height_) + (this.height_ / 2);
				var segRad = this.radiusA_ + (relPos * radiusDiff);
				var texV = relPos;

				for (var seg = 0; seg <= this.segs_; ++seg) {
					var x = Math.sin((Tau / this.segs_) * seg) * segRad;
					var z = Math.cos((Tau / this.segs_) * seg) * segRad;
					var texU = seg / this.segs_;

					position(x, y, z);
					var norm = vec3.normalize([], [x, yNorm, z]);
					normal(norm[0], norm[1], norm[2]);
					uv(texU, texV);
					++vix;
				}
				
				// construct row of faces
				if (row > 0) {
					var raix = vix - ((this.segs_ + 1) * 2);
					var rbix = vix - (this.segs_ + 1);

					for (var seg = 0; seg < this.segs_; ++seg) {
						var rl = seg,
							rr = seg + 1;

						if (row > 1 || this.radiusA_ > 0)
							face(raix + rl, rbix + rl, raix + rr);
						if (row < this.rows_ || this.radiusB_ > 0)
							face(raix + rr, rbix + rl, rbix + rr);
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

		constructor(desc: SphereDescriptor) {
			this.radius_ = desc.radius;
			this.rows_ = desc.rows | 0;
			this.segs_ = desc.segs | 0;
			this.sliceFrom_ = math.clamp01(desc.sliceFrom || 0.0);
			this.sliceTo_ = math.clamp01(desc.sliceTo || 1.0);

			assert(this.radius_ > 0);
			assert(this.rows_ >= 2);
			assert(this.segs_ >= 3);
			assert(this.sliceTo_ > this.sliceFrom_);
		}

		get vertexCount(): number {
			return (this.segs_ + 1) * (this.rows_ + 1);
		}

		get faceCount(): number {
			var fc = 2 * this.segs_ * this.rows_;
			if (this.sliceFrom_ == 0.0)
				fc -= this.segs_;
			if (this.sliceTo_ == 1.0)
				fc -= this.segs_;
			return fc; 
		}

		get explicitNormals() {
			return true;
		}

		generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn) {
			var Pi = Math.PI;
			var Tau = Math.PI * 2;

			var slice = this.sliceTo_ - this.sliceFrom_;
			var piFrom = this.sliceFrom_ * Pi;
			var piSlice = slice * Pi;

			var vix = 0;
			var openTop = this.sliceFrom_ > 0.0;
			var openBottom = this.sliceTo_ < 1.0;

			for (var row = 0; row <= this.rows_; ++row) {
				var y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var texV = this.sliceFrom_ + ((row / this.rows_) * slice);

				for (var seg = 0; seg <= this.segs_; ++seg) {
					var tauSeg = (Tau / this.segs_);
					var x = Math.sin(tauSeg * seg) * segRad;
					var z = Math.cos(tauSeg * seg) * segRad;
					var texU = seg / this.segs_;

					// for a sphere with origin at [0,0,0], the normalized position is the normal
					position(x, y, z);
					var norm = vec3.normalize([], [x, y, z]);
					normal(norm[0], norm[1], norm[2]);
					uv(texU, texV);
					++vix;
				}
				
				// construct row of faces
				if (row > 0) {
					var raix = vix - ((this.segs_ + 1) * 2);
					var rbix = vix - (this.segs_ + 1);

					for (var seg = 0; seg < this.segs_; ++seg) {
						var rl = seg,
							rr = seg + 1;
						
						if (row > 1 || openTop)
							face(raix + rl, rbix + rl, raix + rr);
						if (row < this.rows_ || openBottom)
							face(raix + rr, rbix + rl, rbix + rr);
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
		
		constructor(desc: TorusDescriptor) {
			this.minorRadius_ = desc.minorRadius;
			this.majorRadius_ = desc.majorRadius;
			this.rows_ = desc.rows | 0;
			this.segs_ = desc.segs | 0;
			this.sliceFrom_ = math.clamp01(desc.sliceFrom || 0.0);
			this.sliceTo_ = math.clamp01(desc.sliceTo || 1.0);

			assert(this.minorRadius_ >= 0);
			assert(this.majorRadius_ >= this.minorRadius_);
			assert(this.minorRadius_ > 0 || this.majorRadius_ > 0);
			assert(this.rows_ >= 4);
			assert(this.segs_ >= 3);
			assert(this.sliceTo_ > this.sliceFrom_);
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
			var Pi = Math.PI;
			var Tau = Math.PI * 2;

			var slice = this.sliceTo_ - this.sliceFrom_;
			var piFrom = this.sliceFrom_ * Tau;
			var piSlice = slice * Tau;

			var vix = 0;
			var innerRadius = this.majorRadius_ - this.minorRadius_;

			for (var row = 0; row <= this.rows_; ++row) {
				var majorAngle = piFrom + ((piSlice * row) / this.rows_); // angle on the x-y plane
				var texV = this.sliceFrom_ + ((row / this.rows_) * slice);

				for (var seg = 0; seg <= this.segs_; ++seg) {
					var innerAngle = (Tau * seg) / this.segs_;

					var cx = Math.cos(majorAngle) * this.majorRadius_;
					var cy = Math.sin(majorAngle) * this.majorRadius_;

					var x = Math.cos(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);
					var y = Math.sin(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);

					var z = Math.sin(innerAngle) * innerRadius;

					var texU = seg / this.segs_;
					var vNorm = vec3.normalize([], [x - cx, y - cy, z]);

					position(x, y, z);
					normal(vNorm[0], vNorm[1], vNorm[2]);
					uv(texU, texV);
					++vix;
				}
				
				// construct row of faces
				if (row > 0) {
					var raix = vix - ((this.segs_ + 1) * 2);
					var rbix = vix - (this.segs_ + 1);

					for (var seg = 0; seg < this.segs_; ++seg) {
						var rl = seg,
							rr = seg + 1;

						face(raix + rl, rbix + rl, raix + rr);
						face(raix + rr, rbix + rl, rbix + rr);
					}
				}
			}
		}
	}

} // ns sd.mesh.gen
