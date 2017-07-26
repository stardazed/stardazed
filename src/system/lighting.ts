// system/lighting - controllig the lights
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.system {

	// This setup allows for a viewport > 5K (5120x2880)
	// a global list of up to 32768 active lights and
	// an average of ~300 active lights per tile at 1920x1080
	// I will add smaller LUT texture options later (320x256, 160x128)
	const LUT_WIDTH = 640;
	const LUT_LIGHTDATA_ROWS = 256;
	const LUT_INDEXLIST_ROWS = 240;
	const LUT_GRID_ROWS = 16;
	// const LUT_HEIGHT = LUT_LIGHTDATA_ROWS + LUT_INDEXLIST_ROWS + LUT_GRID_ROWS; // 512

	const MAX_LIGHTS = ((LUT_WIDTH * LUT_LIGHTDATA_ROWS) / 5) | 0;
	const TILE_DIMENSION = 32;

	interface LightGridSpan {
		lightIndex: number;
		fromCol: number;
		toCol: number;
	}

	export class Lighting {
		private lutTilesWide_ = 0;
		private lutTilesHigh_ = 0;
		private lutParam_ = new Float32Array(2);

		private tileLightIndexes_: Float32Array;
		private lightGrid_: Float32Array;

		private gridRowSpans_: LightGridSpan[][] = [];

		constructor() {

		}

		private projectPointLight(outBounds: math.Rect, center: Float3, range: number, projectionViewportMatrix: Float4x4) {
			// if the camera is inside the range of the point light, just apply it to the full screen
			if (vec3.length(center) <= range * 1.3) { // apply some fudge factors because I'm tired
				outBounds.left = 0;
				outBounds.top = 5000;
				outBounds.right = 5000;
				outBounds.bottom = 0;
				return;
			}

			const cx = center[0];
			const cy = center[1];
			const cz = center[2];

			const vertices: number[][] = [
				[cx - range, cy - range, cz - range, 1.0],
				[cx - range, cy - range, cz + range, 1.0],
				[cx - range, cy + range, cz - range, 1.0],
				[cx - range, cy + range, cz + range, 1.0],
				[cx + range, cy - range, cz - range, 1.0],
				[cx + range, cy - range, cz + range, 1.0],
				[cx + range, cy + range, cz - range, 1.0],
				[cx + range, cy + range, cz + range, 1.0]
			];

			const min = [ 100000,  100000];
			const max = [-100000, -100000];
			const sp = [0, 0, 0, 0];

			for (let vix = 0; vix < 8; ++vix) {
				if (vertices[vix][2] <= 0.2) { // apply some fudge factors because I'm tired
					vec4.transformMat4(sp, vertices[vix], projectionViewportMatrix);
					vec4.scale(sp, sp, 1.0 / sp[3]);
					vec2.min(min, min, sp);
					vec2.max(max, max, sp);
				}
			}

			outBounds.left = min[0];
			outBounds.top = max[1];
			outBounds.right = max[0];
			outBounds.bottom = min[1];
		}


		private updateLightGrid(range: entity.LightRange, projection: math.ProjectionSetup, viewport: render.Viewport) {
			const vpHeight = this.lutParam_[1];
			const tilesWide = this.lutTilesWide_;
			const tilesHigh = this.lutTilesHigh_;

			// reset grid row light index table
			for (let row = 0; row < tilesHigh; ++row) {
				this.gridRowSpans_[row] = [];
			}

			// indexes of non-measured lights
			const fullscreenLights: number[] = [];

			// matrix setup for ssb calculation
			const ssb: math.Rect = { left: 0, top: 0, right: 0, bottom: 0 };
			const viewportMatrix = math.viewportMatrix(viewport.originX, viewport.originY, viewport.width, viewport.height, viewport.nearZ, viewport.farZ);
			const VPP = mat4.multiply([], viewportMatrix, projection.projectionMatrix);

			// calculate light SSBs and fill the grid row table with rect references
			const iter = range.makeIterator();
			while (iter.next()) {
				const lix = iter.current as number;
				const lightType = this.type(lix);

				if (lightType === entity.LightType.Point) {
					// calculate screen space bounds based on a simple point and radius cube
					const lcpos = this.positionCameraSpace(lix);
					const radius = this.range(lix);
					// the resulting rect has the bottom-left as origin (bottom < top)
					this.projectPointLight(ssb, lcpos, radius, VPP);

					// create a span for this rect in the rows it occupies
					const rowTop = Math.floor((vpHeight - ssb.top) / TILE_DIMENSION);
					const rowBottom = Math.floor((vpHeight - ssb.bottom) / TILE_DIMENSION);
					const colLeft = Math.floor(ssb.left / TILE_DIMENSION);
					const colRight = Math.floor(ssb.right / TILE_DIMENSION);

					if (rowTop < tilesHigh && rowBottom >= 0 && colLeft < tilesWide && colRight > 0) {
						const rowFrom = math.clamp(rowTop, 0, tilesHigh - 1);
						const rowTo = math.clamp(rowBottom, 0, tilesHigh - 1);
						const colFrom = math.clamp(colLeft, 0, tilesWide - 1);
						const colTo = math.clamp(colRight, 0, tilesWide - 1);
						for (let row = rowFrom; row <= rowTo; ++row) {
							this.gridRowSpans_[row].push({ lightIndex: lix, fromCol: colFrom, toCol: colTo });
						}
					}
				}
				else {
					// for non-point lights just indicate that they occupy the entire screen
					fullscreenLights.push(lix);
				}
			}

			// finally, populate the light grid and index tables
			let cellLightIndexOffset = 0;
			let nextLightIndexOffset = 0;
			let cellGridOffset = 0;

			for (let row = 0; row < tilesHigh; ++row) {
				const spans = this.gridRowSpans_[row];

				// add full screen and and light spans to the grid
				for (let col = 0; col < tilesWide; ++col) {
					for (const fsLight of fullscreenLights) {
						this.tileLightIndexes_[nextLightIndexOffset] = fsLight;
						nextLightIndexOffset += 1;
					}
					for (const span of spans) {
						if (span.fromCol <= col && span.toCol >= col) {
							this.tileLightIndexes_[nextLightIndexOffset] = span.lightIndex;
							nextLightIndexOffset += 1;
						}
					}

					// update grid pixel for this cell with x = offset, y = size, z = 0, w = 0
					this.lightGrid_[cellGridOffset] = cellLightIndexOffset;
					this.lightGrid_[cellGridOffset + 1] = nextLightIndexOffset - cellLightIndexOffset;
					cellGridOffset += 2;

					cellLightIndexOffset = nextLightIndexOffset;
				}
			}

			return {
				indexPixelsUsed: Math.ceil(nextLightIndexOffset / 4),
				gridRowsUsed: Math.ceil((tilesWide * tilesHigh) / 2 / LUT_WIDTH)
			};
		}


		prepareLightsForRender(range: LightRange, proj: math.ProjectionSetup, targetDim: image.PixelDimensions, viewport: render.Viewport) {
			// update lut dimensions
			this.lutTilesWide_ = Math.ceil(targetDim.width / TILE_DIMENSION);
			this.lutTilesHigh_ = Math.ceil(targetDim.height / TILE_DIMENSION);
			this.lutParam_[0] = this.lutTilesWide_;
			this.lutParam_[1] = targetDim.height;

			const viewNormalMatrix = mat3.normalFromMat4([], proj.viewMatrix);

			// calculate world and camera space vectors of each light
			let highestLightIndex = 0;
			const iter = range.makeIterator();

			while (iter.next()) {
				const lix = iter.current as number;
				if (lix > highestLightIndex) {
					highestLightIndex = lix;
				}

				const type = this.type(lix);
				const transform = this.transformBase_[lix];

				if (type !== entity.LightType.Directional) {
					const lightPos_world = this.transformMgr_.worldPosition(transform); // tslint:disable-line:variable-name
					const lightPos_cam = vec3.transformMat4([], lightPos_world, proj.viewMatrix); // tslint:disable-line:variable-name

					const posCamOffset = (lix * 20) + 4;
					this.globalLightData_[posCamOffset] = lightPos_cam[0];
					this.globalLightData_[posCamOffset + 1] = lightPos_cam[1];
					this.globalLightData_[posCamOffset + 2] = lightPos_cam[2];

					const posWorldOffset = (lix * 20) + 8;
					this.globalLightData_[posWorldOffset] = lightPos_world[0];
					this.globalLightData_[posWorldOffset + 1] = lightPos_world[1];
					this.globalLightData_[posWorldOffset + 2] = lightPos_world[2];
				}
				if (type !== LightType.Point) {
					const rotMat = mat3.normalFromMat4([], this.transformMgr_.worldMatrix(transform));
					const lightDir_world = vec3.transformMat3([], this.nullVec3_, rotMat); // tslint:disable-line:variable-name
					const lightDir_cam = vec3.transformMat3([], lightDir_world, viewNormalMatrix); // tslint:disable-line:variable-name

					const dirOffset = (lix * 20) + 12;
					this.globalLightData_[dirOffset] = lightDir_cam[0];
					this.globalLightData_[dirOffset + 1] = lightDir_cam[1];
					this.globalLightData_[dirOffset + 2] = lightDir_cam[2];
				}
			}

			// recalculate grid
			const { indexPixelsUsed, gridRowsUsed } = this.updateLightGrid(range, proj, viewport);

			// update texture data
			const gllRowsUsed = Math.ceil(highestLightIndex / LUT_WIDTH);
			const indexRowsUsed = Math.ceil(indexPixelsUsed / LUT_WIDTH);

			// resource updates
			const cmd = new render.RenderCommandBuffer();
			// TODO: should use slice to only pass subarray of data actually being sent?
			cmd.textureWrite(this.lutTexture_, 0, image.makePixelCoordinate(0, 0), image.makePixelDimensions(LUT_WIDTH, gllRowsUsed), this.globalLightData_);
			cmd.textureWrite(this.lutTexture_, 0, image.makePixelCoordinate(0, LUT_LIGHTDATA_ROWS), image.makePixelDimensions(LUT_WIDTH, indexRowsUsed), this.tileLightIndexes_);
			cmd.textureWrite(this.lutTexture_, 0, image.makePixelCoordinate(0, LUT_LIGHTDATA_ROWS + LUT_INDEXLIST_ROWS), image.makePixelDimensions(LUT_WIDTH, gridRowsUsed), this.lightGrid_);
			return cmd;
		}

		get lutParam() {
			// gridWidth, vpHeight
			return this.lutParam_;
		}
	}

} // ns sd.system
