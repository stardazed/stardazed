// mesh-gen.ts - mesh generators
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="mesh.ts" />

namespace sd.mesh.gen {

	//  __  __        _    ___                       _           
	// |  \/  |___ __| |_ / __|___ _ _  ___ _ _ __ _| |_ ___ _ _ 
	// | |\/| / -_|_-< ' \ (_ / -_) ' \/ -_) '_/ _` |  _/ _ \ '_|
	// |_|  |_\___/__/_||_\___\___|_||_\___|_| \__,_|\__\___/_|  
	//                                                          

	export type PositionAddFn = (x: number, y: number, z: number) => void;
	export type FaceAddFn = (a: number, b: number, c: number) => void;
	export type UVAddFn = (u: number, v: number) => void;

	export abstract class MeshGenerator {
		abstract vertexCount(): number;
		abstract faceCount(): number;

		abstract generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn): void;

		generate(attrList?: VertexAttribute[]): MeshData {
			if (!attrList)
				attrList = AttrList.Pos3Norm3UV2();

			var vtxCount = this.vertexCount();
			var mesh = new MeshData(attrList);
			var vertexBuffer = mesh.primaryVertexBuffer();

			vertexBuffer.allocate(vtxCount);
			var indexElementType = minimumIndexElementTypeForVertexCount(vtxCount);
			mesh.indexBuffer.allocate(PrimitiveType.Triangle, indexElementType, this.faceCount());

			var posView = new VertexBufferAttributeView(vertexBuffer, vertexBuffer.attrByRole(VertexAttributeRole.Position));
			var texAttr = vertexBuffer.attrByRole(VertexAttributeRole.UV);
			var texView = texAttr ? new VertexBufferAttributeView(vertexBuffer, texAttr) : null;

			var triView = new IndexBufferTriangleView(mesh.indexBuffer);
			this.generateInto(posView, triView, texView);

			mesh.genVertexNormals();

			// add a default primitive group that covers the complete generated mesh
			mesh.primitiveGroups.push({ fromPrimIx: 0, primCount: this.faceCount(), materialIx: 0 });

			return mesh;
		}

		generateInto(positions: VertexBufferAttributeView, faces: IndexBufferTriangleView, uvs?: VertexBufferAttributeView): void {
			var posIx = 0, faceIx = 0, uvIx = 0;

			var pos: PositionAddFn = (x: number, y: number, z: number) => {
				var v3 = positions.item(posIx);
				v3[0] = x;
				v3[1] = y;
				v3[2] = z;
				posIx++;
			};

			var face: FaceAddFn = (a: number, b: number, c: number) => {
				var v3 = faces.item(faceIx);
				v3[0] = a;
				v3[1] = b;
				v3[2] = c;
				faceIx++;
			};

			var uv: UVAddFn = uvs ?
				(u: number, v: number) => {
					var v2 = uvs.item(uvIx);
					v2[0] = u;
					v2[1] = v;
					uvIx++;
				}
				: (u: number, v: number) => { };

			this.generateImpl(pos, face, uv);
		}
	}


	//  ___      _                
	// / __|_ __| |_  ___ _ _ ___ 
	// \__ \ '_ \ ' \/ -_) '_/ -_)
	// |___/ .__/_||_\___|_| \___|
	//     |_|                    

	export class Sphere extends MeshGenerator {
		constructor(private radius_ = 1.0, private rows_ = 20, private segs_ = 30, private sliceFrom_ = 0.0, private sliceTo_ = 1.0) {
			super();

			this.sliceFrom_ = clamp01(this.sliceFrom_);
			this.sliceTo_ = clamp01(this.sliceTo_);

			assert(this.rows_ >= 2);
			assert(this.segs_ >= 4);
			assert(this.sliceTo_ > this.sliceFrom_);
		}

		vertexCount(): number {
			return (this.segs_ + 1) * (this.rows_ + 1);
		}

		faceCount(): number {
			return 2 * (this.segs_ + 1) * (this.rows_ + 1);
		}

		generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn) {
			var Pi = Math.PI;
			var Tau = Math.PI * 2;

			var slice = this.sliceTo_ - this.sliceFrom_;
			var piFrom = this.sliceFrom_ * Pi;
			var piSlice = slice * Pi;

			var vix = 0;

			for (var row = 0; row <= this.rows_; ++row) {
				var y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var texV = this.sliceFrom_ + ((row / this.rows_) * slice);

				for (var seg = 0; seg <= this.segs_; ++seg) {
					var x = Math.sin((Tau / this.segs_) * seg) * segRad;
					var z = Math.cos((Tau / this.segs_) * seg) * segRad;
					var texU = seg / this.segs_;

					position(x, y, z);
					uv(texU, texV);
					++vix;
				}
				
				// construct row of faces
				var openTop = this.sliceFrom_ > 0.0;
				var openBottom = this.sliceTo_ < 1.0;

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

} // ns sd.mesh.gen
