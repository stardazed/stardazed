// render/tiledlight - Tiled Light data controller
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render {

	const TILE_DIMENSION = 32;

	export type LightLUTSize = "small" | "medium" | "large";

	interface LightLUTConfig {
		pixelWidth: number;
		lightDataRows: number;
		indexListRows: number;
		gridRows: number;
	}

	const lutConfigs: { readonly [size: string]: LightLUTConfig } = {
		/**
		 * Small: 2048 light maximum
		 * Max viewport size: 1280x720
		 * Avg lights/tile at max viewport: ~19
		 */
		small: {
			pixelWidth: 160,
			lightDataRows: 64,
			indexListRows: 60,
			gridRows: 4
		},
		/**
		 * Medium(default): 8192 light maximum
		 * Max viewport size: 2560x1440
		 * Avg lights/tile at max viewport: ~42
		 */
		medium: {
			pixelWidth: 320,
			lightDataRows: 128,
			indexListRows: 120,
			gridRows: 8
		},
		/**
		 * Large: 32768 light maximum
		 * Max viewport size: 5120x2880+
		 * Avg lights/tile at max viewport: ~42
		 */
		large: {
			pixelWidth: 640,
			lightDataRows: 256,
			indexListRows: 240,
			gridRows: 16
		},
	};

	interface LightGridSpan {
		lightIndex: number;
		fromCol: number;
		toCol: number;
	}

	export class TiledLight {
		private lutWidthPixels_: number;
		private lutHeightPixels_: number;
		private lutLightDataRows_: number;
		private lutIndexListRows_: number;
		private lutTilesWide_: number;
		private lutTilesHigh_: number;
		private lutParam_ = new Float32Array(2);

		private readonly tileLightIndexes_: Float32Array;
		private readonly lightGrid_: Float32Array;

		private lutTexture_: render.Texture;
		private lutSampler_: render.Sampler;
		private gridRowSpans_: LightGridSpan[][] = [];
		private readonly nullVec3_: Float32Array;

		constructor(lutSize: LightLUTSize) {
			const lutConfig = lutConfigs[lutSize];
			this.lutWidthPixels_ = lutConfig.pixelWidth;
			this.lutHeightPixels_ = lutConfig.lightDataRows + lutConfig.indexListRows + lutConfig.gridRows;
			this.lutLightDataRows_ = lutConfig.lightDataRows;
			this.lutIndexListRows_ = lutConfig.indexListRows;
			this.lutTilesWide_ = 0;
			this.lutTilesHigh_ = 0;

			this.tileLightIndexes_ = new Float32Array(4 * lutConfig.pixelWidth * lutConfig.indexListRows);
			this.lightGrid_ = new Float32Array(4 * lutConfig.pixelWidth * lutConfig.gridRows);
			this.lutTexture_ = render.makeTex2D(image.PixelFormat.RGBA32F, this.lutWidthPixels_, this.lutHeightPixels_);
			this.lutSampler_ = render.makeLookupTableSampler();

			this.nullVec3_ = vec3.fromValues(1, 0, 0);
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


		private updateLightGrid(
			lightComp: entity.LightComponent,
			range: entity.LightRange,
			projection: math.ProjectionSetup,
			viewport: render.Viewport
		) {
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
				const lightType = lightComp.type(lix);

				if (lightType === entity.LightType.Point) {
					// calculate screen space bounds based on a simple point and radius cube
					const lcpos = lightComp.positionCameraSpace(lix);
					const radius = lightComp.range(lix);
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
				gridRowsUsed: Math.ceil((tilesWide * tilesHigh) / 2 / this.lutWidthPixels_)
			};
		}


		prepareLightsForRender(
			lightComp: entity.LightComponent,
			range: entity.LightRange,
			transformComp: entity.TransformComponent,
			proj: math.ProjectionSetup,
			viewport: render.Viewport,
			targetDim?: image.PixelDimensions
		) {
			const cmd = new render.RenderCommandBuffer();
			if (this.lutTexture_.renderResourceHandle === 0) {
				cmd.allocate(this.lutTexture_);
				cmd.allocate(this.lutSampler_);
				return cmd;
			}

			// update lut dimensions
			if (! targetDim) {
				targetDim = { width: viewport.width, height: viewport.height, depth: 1 };
			}
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

				const type = lightComp.type(lix);
				const lightTX = lightComp.transform(lix);

				if (type !== entity.LightType.Directional) {
					const lightPos_world = transformComp.worldPosition(lightTX); // tslint:disable-line:variable-name
					const lightPos_cam = vec3.transformMat4([], lightPos_world, proj.viewMatrix); // tslint:disable-line:variable-name

					const posCamOffset = (lix * 20) + 4;
					lightComp.lightData[posCamOffset] = lightPos_cam[0];
					lightComp.lightData[posCamOffset + 1] = lightPos_cam[1];
					lightComp.lightData[posCamOffset + 2] = lightPos_cam[2];

					const posWorldOffset = (lix * 20) + 8;
					lightComp.lightData[posWorldOffset] = lightPos_world[0];
					lightComp.lightData[posWorldOffset + 1] = lightPos_world[1];
					lightComp.lightData[posWorldOffset + 2] = lightPos_world[2];
				}
				if (type !== entity.LightType.Point) {
					const rotMat = mat3.normalFromMat4([], transformComp.worldMatrix(lightTX));
					const lightDir_world = vec3.transformMat3([], this.nullVec3_, rotMat); // tslint:disable-line:variable-name
					const lightDir_cam = vec3.transformMat3([], lightDir_world, viewNormalMatrix); // tslint:disable-line:variable-name

					const dirOffset = (lix * 20) + 12;
					lightComp.lightData[dirOffset] = lightDir_cam[0];
					lightComp.lightData[dirOffset + 1] = lightDir_cam[1];
					lightComp.lightData[dirOffset + 2] = lightDir_cam[2];
				}
			}

			// recalculate grid
			const { indexPixelsUsed, gridRowsUsed } = this.updateLightGrid(lightComp, range, proj, viewport);

			// update texture data
			const gllRowsUsed = Math.ceil(highestLightIndex / this.lutWidthPixels_);
			const indexRowsUsed = Math.ceil(indexPixelsUsed / this.lutWidthPixels_);

			// resource updates
			// TODO: should use slice to only pass subarray of data actually being sent?
			cmd.textureWrite(this.lutTexture_, 0, image.makePixelCoordinate(0, 0), image.makePixelDimensions(this.lutWidthPixels_, gllRowsUsed), lightComp.lightData);
			cmd.textureWrite(this.lutTexture_, 0, image.makePixelCoordinate(0, this.lutLightDataRows_), image.makePixelDimensions(this.lutWidthPixels_, indexRowsUsed), this.tileLightIndexes_);
			cmd.textureWrite(this.lutTexture_, 0, image.makePixelCoordinate(0, this.lutLightDataRows_ + this.lutIndexListRows_), image.makePixelDimensions(this.lutWidthPixels_, gridRowsUsed), this.lightGrid_);
			return cmd;
		}

		get lutParam() {
			// gridWidth, vpHeight
			return this.lutParam_;
		}

		get lutTextureSampler() {
			return { tex: this.lutTexture_, samp: this.lutSampler_};
		}
	}

} // ns sd.scene
