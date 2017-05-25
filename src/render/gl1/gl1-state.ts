// render/gl1/state - WebGL1 state management
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.render.gl1 {

	const depthTestForGL1DepthFunc: ReadonlyMap<number, DepthTest> = new Map<number, DepthTest>([
		[GLConst.ALWAYS, DepthTest.AllowAll],
		[GLConst.NEVER, DepthTest.DenyAll],
		[GLConst.LESS, DepthTest.Less],
		[GLConst.LEQUAL, DepthTest.LessOrEqual],
		[GLConst.EQUAL, DepthTest.Equal],
		[GLConst.NOTEQUAL, DepthTest.NotEqual],
		[GLConst.GEQUAL, DepthTest.GreaterOrEqual],
		[GLConst.GREATER, DepthTest.Greater],
	]);

	const gl1DepthFuncForDepthTest: ReadonlyMap<DepthTest, number> = new Map<DepthTest, number>([
		[DepthTest.AllowAll, GLConst.ALWAYS],
		[DepthTest.DenyAll, GLConst.NEVER],
		[DepthTest.Less, GLConst.LESS],
		[DepthTest.LessOrEqual, GLConst.LEQUAL],
		[DepthTest.Equal, GLConst.EQUAL],
		[DepthTest.NotEqual, GLConst.NOTEQUAL],
		[DepthTest.GreaterOrEqual, GLConst.GEQUAL],
		[DepthTest.Greater, GLConst.GREATER],
	]);

	const blendOpForGL1BlendEq: ReadonlyMap<number, BlendOperation> = new Map<number, BlendOperation>([
		[GLConst.FUNC_ADD, BlendOperation.Add],
		[GLConst.FUNC_SUBTRACT, BlendOperation.Subtract],
		[GLConst.FUNC_REVERSE_SUBTRACT, BlendOperation.ReverseSubtract],
		[GLConst.MIN_EXT, BlendOperation.Min],
		[GLConst.MAX_EXT, BlendOperation.Max],
	]);

	const gl1BlendEqForBlendOp: ReadonlyMap<BlendOperation, number> = new Map<BlendOperation, number>([
		[BlendOperation.Add, GLConst.FUNC_ADD],
		[BlendOperation.Subtract, GLConst.FUNC_SUBTRACT],
		[BlendOperation.ReverseSubtract, GLConst.FUNC_REVERSE_SUBTRACT],
		[BlendOperation.Min, GLConst.MIN_EXT],
		[BlendOperation.Max, GLConst.MAX_EXT],
	]);

	const blendFactorForGL1BlendFunc: ReadonlyMap<number, BlendFactor> = new Map<number, BlendFactor>([
		[GLConst.ZERO, BlendFactor.Zero],
		[GLConst.ONE, BlendFactor.One],
		[GLConst.SRC_COLOR, BlendFactor.SourceColour],
		[GLConst.ONE_MINUS_SRC_COLOR, BlendFactor.OneMinusSourceColour],
		[GLConst.DST_COLOR, BlendFactor.DestColour],
		[GLConst.ONE_MINUS_DST_COLOR, BlendFactor.OneMinusDestColour],
		[GLConst.SRC_ALPHA, BlendFactor.SourceAlpha],
		[GLConst.ONE_MINUS_SRC_ALPHA, BlendFactor.OneMinusSourceAlpha],
		[GLConst.SRC_ALPHA_SATURATE, BlendFactor.SourceAlphaSaturated],
		[GLConst.DST_ALPHA, BlendFactor.DestAlpha],
		[GLConst.ONE_MINUS_DST_ALPHA, BlendFactor.OneMinusDestAlpha],
		[GLConst.CONSTANT_COLOR, BlendFactor.ConstantColour],
		[GLConst.ONE_MINUS_CONSTANT_COLOR, BlendFactor.OneMinusConstantColour],
		[GLConst.CONSTANT_ALPHA, BlendFactor.ConstantAlpha],
		[GLConst.ONE_MINUS_CONSTANT_ALPHA, BlendFactor.OneMinusConstantAlpha]
	]);

	const gl1BlendFuncForBlendFactor: ReadonlyMap<BlendFactor, number> = new Map<BlendFactor, number>([
		[BlendFactor.Zero, GLConst.ZERO],
		[BlendFactor.One, GLConst.ONE],
		[BlendFactor.SourceColour, GLConst.SRC_COLOR],
		[BlendFactor.OneMinusSourceColour, GLConst.ONE_MINUS_SRC_COLOR],
		[BlendFactor.DestColour, GLConst.DST_COLOR],
		[BlendFactor.OneMinusDestColour, GLConst.ONE_MINUS_DST_COLOR],
		[BlendFactor.SourceAlpha, GLConst.SRC_ALPHA],
		[BlendFactor.OneMinusSourceAlpha, GLConst.ONE_MINUS_SRC_ALPHA],
		[BlendFactor.SourceAlphaSaturated, GLConst.SRC_ALPHA_SATURATE],
		[BlendFactor.DestAlpha, GLConst.DST_ALPHA],
		[BlendFactor.OneMinusDestAlpha, GLConst.ONE_MINUS_DST_ALPHA],
		[BlendFactor.ConstantColour, GLConst.CONSTANT_COLOR],
		[BlendFactor.OneMinusConstantColour, GLConst.ONE_MINUS_CONSTANT_COLOR],
		[BlendFactor.ConstantAlpha, GLConst.CONSTANT_ALPHA],
		[BlendFactor.OneMinusConstantAlpha, GLConst.ONE_MINUS_CONSTANT_ALPHA]
	]);

	/**
	 * The reason this class exists is to avoid making unnecessary calls to GL
	 * whenever possible as GL will dutifully do as you ask and recompile the
	 * GPU state every time, even if nothing changed. Additionally, the WebGL
	 * layer adds overhead as well and querying the GL is defined to be slow.
	 */
	export class GLState {
		public readonly gl: WebGLRenderingContext;
		private frontFace_: FrontFaceWinding;
		private cullFace_: FaceCulling;
		private scissorEnabled_: boolean;
		private scissorBox_: Int32Array;
		private viewportBox_: Int32Array;
		private depthRange_: Float32Array;
		private clearColour_: Float32Array;
		private clearDepth_: number;
		private clearStencil_: number;
		private colourWriteMask_: boolean[];
		private depthMask_: boolean;
		private depthTest_: DepthTest;
		private blendEnabled_: boolean;
		private blendOpRGB_: BlendOperation;
		private blendOpAlpha_: BlendOperation;
		private blendFnSrcRGB_: BlendFactor;
		private blendFnSrcAlpha_: BlendFactor;
		private blendFnDstRGB_: BlendFactor;
		private blendFnDstAlpha_: BlendFactor;
		private blendConstColour_: Float32Array;

		constructor(gl: WebGLRenderingContext) {
			this.gl = gl;
			this.pullGLState();
		}

		pullGLState() {
			const gl = this.gl;

			const glFrontFace = gl.getParameter(GLConst.FRONT_FACE);
			this.frontFace_ = (glFrontFace === GLConst.CW) ? FrontFaceWinding.Clockwise : FrontFaceWinding.CounterClockwise;

			const glCullFaceEnabled = gl.isEnabled(GLConst.CULL_FACE);
			const glCullFaceMode = gl.getParameter(GLConst.CULL_FACE_MODE);
			this.cullFace_ = glCullFaceEnabled ? (glCullFaceMode === GLConst.BACK ? FaceCulling.Back : FaceCulling.Front) : FaceCulling.Disabled;

			this.scissorEnabled_ = gl.isEnabled(GLConst.SCISSOR_TEST);
			this.scissorBox_ = gl.getParameter(GLConst.SCISSOR_BOX);

			this.viewportBox_ = gl.getParameter(GLConst.VIEWPORT);
			this.depthRange_ = gl.getParameter(GLConst.DEPTH_RANGE);

			this.clearColour_ = gl.getParameter(GLConst.COLOR_CLEAR_VALUE);
			this.clearDepth_ = gl.getParameter(GLConst.DEPTH_CLEAR_VALUE);
			this.clearStencil_ = gl.getParameter(GLConst.STENCIL_CLEAR_VALUE);

			this.colourWriteMask_ = gl.getParameter(GLConst.COLOR_WRITEMASK);
			this.depthMask_ = gl.getParameter(GLConst.DEPTH_WRITEMASK);

			this.depthTest_ = gl.isEnabled(GLConst.DEPTH_TEST) ? depthTestForGL1DepthFunc.get(gl.getParameter(GLConst.DEPTH_FUNC))! : DepthTest.Disabled;

			this.blendEnabled_ = gl.isEnabled(GLConst.BLEND);
			this.blendOpRGB_ = blendOpForGL1BlendEq.get(gl.getParameter(GLConst.BLEND_EQUATION_RGB))!;
			this.blendOpAlpha_ = blendOpForGL1BlendEq.get(gl.getParameter(GLConst.BLEND_EQUATION_ALPHA))!;
			this.blendFnSrcRGB_ = blendFactorForGL1BlendFunc.get(gl.getParameter(GLConst.BLEND_SRC_RGB))!;
			this.blendFnSrcAlpha_ = blendFactorForGL1BlendFunc.get(gl.getParameter(GLConst.BLEND_SRC_ALPHA))!;
			this.blendFnDstRGB_ = blendFactorForGL1BlendFunc.get(gl.getParameter(GLConst.BLEND_DST_RGB))!;
			this.blendFnDstAlpha_ = blendFactorForGL1BlendFunc.get(gl.getParameter(GLConst.BLEND_DST_ALPHA))!;
			this.blendConstColour_ = gl.getParameter(GLConst.BLEND_COLOR);
		}

		setFrontFace(frontFace: FrontFaceWinding) {
			if (frontFace === this.frontFace_) {
				return;
			}
			this.frontFace_ = frontFace;

			const glFrontFace = (frontFace === FrontFaceWinding.Clockwise) ? GLConst.CW : GLConst.CCW;
			this.gl.frontFace(glFrontFace);
		}

		setFaceCulling(faceCulling: FaceCulling) {
			if (faceCulling === this.cullFace_) {
				return;
			}
			const wasDisabled = this.cullFace_ === FaceCulling.Disabled;
			this.cullFace_ = faceCulling;

			if (faceCulling === FaceCulling.Disabled) {
				this.gl.disable(GLConst.CULL_FACE);
			}
			else {
				if (wasDisabled) {
					this.gl.enable(GLConst.CULL_FACE);
				}
				this.gl.cullFace(faceCulling === FaceCulling.Back ? GLConst.BACK : GLConst.FRONT);
			}
		}

		setScissorRect(rect: Readonly<ScissorRect> | null) {
			if (rect === null) {
				if (this.scissorEnabled_) {
					this.gl.disable(GLConst.SCISSOR_TEST);
					this.scissorEnabled_ = false;
				}
			}
			else {
				if (! this.scissorEnabled_) {
					this.gl.enable(GLConst.SCISSOR_TEST);
				}
				this.scissorEnabled_ = true;

				const box = this.scissorBox_;
				if (rect.originX !== box[0] || rect.originY !== box[1] || rect.width !== box[2] || rect.height !== box[3]) {
					vec4.set(this.scissorBox_, rect.originX, rect.originY, rect.width, rect.height);
					this.gl.scissor(rect.originX, rect.originY, rect.width, rect.height);
				}
			}
		}

		setViewport(viewport: Readonly<Viewport>) {
			const box = this.viewportBox_;
			if (viewport.originX !== box[0] || viewport.originY !== box[1] || viewport.width !== box[2] || viewport.height !== box[3]) {
				vec4.set(this.viewportBox_, viewport.originX, viewport.originY, viewport.width, viewport.height);
				this.gl.viewport(viewport.originX, viewport.originY, viewport.width, viewport.height);
			}
			const range = this.depthRange_;
			if (viewport.nearZ !== range[0] || viewport.farZ !== range[1]) {
				vec2.set(this.depthRange_, viewport.nearZ, viewport.farZ);
				this.gl.depthRange(viewport.nearZ, viewport.farZ);
			}
		}

		setClearColour(rgba: ConstFloat4) {
			if (! vec4.exactEquals(rgba, this.clearColour_)) {
				vec4.copy(this.clearColour_, rgba);
				this.gl.clearColor(rgba[0], rgba[1], rgba[2], rgba[3]);
			}
		}

		setClearDepth(value: number) {
			if (value !== this.clearDepth_) {
				this.clearDepth_ = value;
				this.gl.clearDepth(value);
			}
		}

		setClearStencil(value: number) {
			value = value | 0; // force value to be an int
			if (value !== this.clearStencil_) {
				this.clearStencil_ = value;
				this.gl.clearStencil(value);
			}
		}

		setColourWriteMask(mask: Readonly<ColourWriteMask>) {
			const cur = this.colourWriteMask_;
			if (cur[0] !== mask.red || cur[1] !== mask.green || cur[2] !== mask.blue || cur[3] !== mask.alpha) {
				this.colourWriteMask_[0] = mask.red;
				this.colourWriteMask_[1] = mask.green;
				this.colourWriteMask_[2] = mask.blue;
				this.colourWriteMask_[3] = mask.alpha;
				this.gl.colorMask(mask.red, mask.green, mask.blue, mask.alpha);
			}
		}

		setDepthWrite(enable: boolean) {
			if (enable !== this.depthMask_) {
				this.depthMask_ = enable;
				this.gl.depthMask(enable);
			}
		}

		setDepthTest(test: DepthTest) {
			if (test !== this.depthTest_) {
				const wasDisabled = this.depthTest_ === DepthTest.Disabled;
				this.depthTest_ = test;

				if (test === DepthTest.Disabled) {
					this.gl.disable(GLConst.DEPTH_TEST);
				}
				else {
					this.gl.depthFunc(gl1DepthFuncForDepthTest.get(test)!);
					if (wasDisabled) {
						this.gl.enable(GLConst.DEPTH_TEST);
					}
				}
			}
		}

		setColourBlending(blending: Readonly<ColourBlending> | null) {
			if (blending === null) {
				if (this.blendEnabled_) {
					this.blendEnabled_ = false;
					this.gl.disable(GLConst.BLEND);
				}
			}
			else {
				if (blending.sourceRGBFactor !== this.blendFnSrcRGB_ ||
					blending.destRGBFactor !== this.blendFnDstRGB_ ||
					blending.sourceAlphaFactor !== this.blendFnSrcAlpha_ ||
					blending.destAlphaFactor !== this.blendFnDstAlpha_
				) {
					this.blendFnSrcRGB_ = blending.sourceRGBFactor;
					this.blendFnDstRGB_ = blending.destRGBFactor;
					this.blendFnSrcAlpha_ = blending.sourceAlphaFactor;
					this.blendFnDstAlpha_ = blending.destAlphaFactor;

					this.gl.blendFuncSeparate(
						gl1BlendFuncForBlendFactor.get(blending.sourceRGBFactor)!,
						gl1BlendFuncForBlendFactor.get(blending.destRGBFactor)!,
						gl1BlendFuncForBlendFactor.get(blending.sourceAlphaFactor)!,
						gl1BlendFuncForBlendFactor.get(blending.destAlphaFactor)!
					);
				}

				if (blending.rgbBlendOp !== this.blendOpRGB_ || blending.alphaBlendOp !== this.blendOpAlpha_) {
					this.blendOpRGB_ = blending.rgbBlendOp;
					this.blendOpAlpha_ = blending.alphaBlendOp;

					this.gl.blendEquationSeparate(
						gl1BlendEqForBlendOp.get(blending.rgbBlendOp)!,
						gl1BlendEqForBlendOp.get(blending.alphaBlendOp)!
					);
				}

				if (! vec4.exactEquals(blending.constantColour, this.blendConstColour_)) {
					vec4.copy(this.blendConstColour_, blending.constantColour);
					const colour = blending.constantColour;
					this.gl.blendColor(colour[0], colour[1], colour[2], colour[3]);
				}

				if (! this.blendEnabled_) {
					this.blendEnabled_ = true;
					this.gl.enable(GLConst.BLEND);
				}
			}
		}
	}

} // ns sd.render.gl1
