// meshgen.ts - mesh generators
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

		// generate(): TriMesh {
		// 	var vtxCount = this.vertexCount();

		// 	var vertexBuf = new Float32Array(vtxCount * 3);
		// 	var normalBuf = new Float32Array(vtxCount * 3);
		// 	var uvBuf = new Float32Array(vtxCount * 2);

		// 	var faceBuf = new Uint32Array(vtxCount * 3);

		// 	this.generateInto(vertexBuf, faceBuf, uvBuf);
		// }

		generateInto(positions: ArrayOfNumber, faces: ArrayOfNumber, uvs: ArrayOfNumber = null): void {
			var posIx = 0, faceIx = 0, uvIx = 0;

			var pos: PositionAddFn = (x: number, y: number, z: number) => {
				positions[posIx] = x;
				positions[posIx + 1] = y;
				positions[posIx + 2] = z;
				posIx += 3;
			};

			var face: FaceAddFn = (a: number, b: number, c: number) => {
				faces[faceIx] = a;
				faces[faceIx + 1] = b;
				faces[faceIx + 2] = c;
				faceIx += 3;
			};

			var uv: UVAddFn = uvs ?
				(u: number, v: number) => {
					uvs[uvIx] = u;
					uvs[uvIx + 1] = v;
					uvIx += 2;
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
		hasTopDisc() { return this.sliceFrom_ == 0; }
		hasBottomDisc() { return this.sliceTo_ == 1; }

		constructor(private radius_ = 1.0, private rows_ = 20, private segs_ = 30, private sliceFrom_ = 0.0, private sliceTo_ = 1.0) {
			super();

			assert(this.rows_ >= 2);
			assert(this.segs_ >= 4);
			assert(this.sliceTo_ > this.sliceFrom_);
		}

		vertexCount(): number {
			var vc = this.segs_ * (this.rows_ - 1);
			if (this.hasTopDisc())
				++vc;
			if (this.hasBottomDisc())
				++vc;
			return vc;
		}

		faceCount(): number {
			var fc = 2 * this.segs_ * this.rows_;
			if (this.hasTopDisc())
				fc -= this.segs_;
			if (this.hasBottomDisc())
				fc -= this.segs_;
			return fc;
		}

		generateImpl(position: PositionAddFn, face: FaceAddFn, uv: UVAddFn) {
			var Pi = Math.PI;
			var Tau = Math.PI * 2;

			var slice = this.sliceTo_ - this.sliceFrom_;
			var piFrom = this.sliceFrom_ * Pi;
			var piSlice = slice * Pi;
			var halfPiSlice = slice / 2;

			var vix = 0;

			for (var row = 0; row <= this.rows_; ++row) {
				var y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
				var texV = Math.sin(piFrom + (halfPiSlice / this.rows_) * row);

				if (
					(this.hasTopDisc() && row == 0) ||
					(this.hasBottomDisc() && row == this.rows_)
				) {
					// center top or bottom
					position(0, y, 0);
					uv(0.5, texV);
					++vix;
				}
				else {
					for (var seg = 0; seg < this.segs_; ++seg) {
						var x = Math.sin((Tau / this.segs_) * seg) * segRad;
						var z = Math.cos((Tau / this.segs_) * seg) * segRad;
						var texU = Math.sin(((Pi / 2) / this.rows_) * row);

						position(x, y, z);
						uv(texU, texV);
						++vix;
					}
				}
				
				// construct row of faces
				if (row > 0) {
					var raix = vix;
					var rbix = vix;
					var ramul: number, rbmul: number;

					if (this.hasTopDisc() && row == 1) {
						raix -= this.segs_ + 1;
						rbix -= this.segs_;
						ramul = 0;
						rbmul = 1;
					}
					else if (this.hasBottomDisc() && row == this.rows_) {
						raix -= this.segs_ + 1;
						rbix -= 1;
						ramul = 1;
						rbmul = 0;
					}
					else {
						raix -= this.segs_ * 2;
						rbix -= this.segs_;
						ramul = 1;
						rbmul = 1;
					}

					for (var seg = 0; seg < this.segs_; ++seg) {
						var ral = ramul * seg,
							rar = ramul * ((seg + 1) % this.segs_),
							rbl = rbmul * seg,
							rbr = rbmul * ((seg + 1) % this.segs_);

						if (ral != rar)
							face(raix + ral, rbix + rbl, raix + rar);
						if (rbl != rbr)
							face(raix + rar, rbix + rbl, rbix + rbr);
					}
				}
			}
		}
	}

} // ns sd.mesh.gen
