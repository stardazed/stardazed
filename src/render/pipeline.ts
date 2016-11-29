// render/pipeline - pipeline objects
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd.render {

	function glBlendEqForBlendOperation(rc: RenderContext, op: BlendOperation) {
		switch (op) {
			case BlendOperation.Add: return rc.gl.FUNC_ADD;
			case BlendOperation.Subtract: return rc.gl.FUNC_SUBTRACT;
			case BlendOperation.ReverseSubtract: return rc.gl.FUNC_REVERSE_SUBTRACT;

			case BlendOperation.Min: return rc.extMinMax ? rc.extMinMax.MIN_EXT : rc.gl.FUNC_SUBTRACT;
			case BlendOperation.Max: return rc.extMinMax ? rc.extMinMax.MAX_EXT : rc.gl.FUNC_ADD;

			default:
				assert(false, "Invalid BlendOperation");
				return rc.gl.NONE;
		}
	}


	function glBlendFuncForBlendFactor(rc: RenderContext, factor: BlendFactor) {
		switch (factor) {
			case BlendFactor.Zero: return rc.gl.ZERO;
			case BlendFactor.One: return rc.gl.ONE;
			case BlendFactor.SourceColour: return rc.gl.SRC_COLOR;
			case BlendFactor.OneMinusSourceColour: return rc.gl.ONE_MINUS_SRC_COLOR;
			case BlendFactor.DestColour: return rc.gl.DST_COLOR;
			case BlendFactor.OneMinusDestColour: return rc.gl.ONE_MINUS_DST_COLOR;
			case BlendFactor.SourceAlpha: return rc.gl.SRC_ALPHA;
			case BlendFactor.OneMinusSourceAlpha: return rc.gl.ONE_MINUS_SRC_ALPHA;
			case BlendFactor.SourceAlphaSaturated: return rc.gl.SRC_ALPHA_SATURATE;
			case BlendFactor.DestAlpha: return rc.gl.DST_ALPHA;
			case BlendFactor.OneMinusDestAlpha: return rc.gl.ONE_MINUS_DST_ALPHA;
			case BlendFactor.ConstantColour: return rc.gl.CONSTANT_COLOR;
			case BlendFactor.OneMinusConstantColour: return rc.gl.ONE_MINUS_CONSTANT_COLOR;
			case BlendFactor.ConstantAlpha: return rc.gl.CONSTANT_ALPHA;
			case BlendFactor.OneMinusConstantAlpha: return rc.gl.ONE_MINUS_CONSTANT_ALPHA;

			default:
				assert(false, "Invalid BlendFactor");
				return rc.gl.NONE;
		}
	}


	export class Pipeline {
		private colourPixelFormats_: PixelFormat[];
		private depthPixelFormat_: PixelFormat;
		private stencilPixelFormat_: PixelFormat;
		private writeMask_: ColourWriteMask | null;
		private depthMask_: boolean;
		private blending_: ColourBlendingDescriptor;
		private program_: WebGLProgram;
		private attrRoleIndexMap_: Map<meshdata.VertexAttributeRole, number>;

		constructor(private rc: RenderContext, desc: PipelineDescriptor) {
			this.colourPixelFormats_ = desc.colourPixelFormats.slice(0);
			this.depthPixelFormat_ = desc.depthPixelFormat;
			this.stencilPixelFormat_ = desc.stencilPixelFormat;
			this.writeMask_ = cloneStruct(desc.writeMask);
			this.depthMask_ = desc.depthMask;
			this.blending_ = cloneStruct(desc.blending);

			// -- check if the colour mask does anything and, if not, disable it
			if (this.writeMask_.red && this.writeMask_.green && this.writeMask_.blue && this.writeMask_.alpha) {
				this.writeMask_ = null;
			}

			// -- can the GL support the required # of colour attachments?
			let highestEnabledAttachment = -1;
			this.colourPixelFormats_.slice(1).forEach((pf, ix) => {
				if (pf != PixelFormat.None) {
					highestEnabledAttachment = ix;
				}
			});
			if (highestEnabledAttachment >= maxColourAttachments(rc)) {
				assert(false, `This GL only supports up to ${maxColourAttachments(rc)} attachment(s)`);
			}

			// -- create program and find attribute locations
			this.program_ = makeProgram(rc, desc.vertexShader, desc.fragmentShader);
			this.attrRoleIndexMap_ = new Map<meshdata.VertexAttributeRole, number>();

			desc.attributeNames.forEach((name, role) => {
				const attrIx = rc.gl.getAttribLocation(this.program_, name);
				assert(attrIx >= 0, `cannot find vertex attribute ${name}`);
				this.attrRoleIndexMap_.set(role, attrIx);
			});
		}


		bind() {
			const gl = this.rc.gl;
			gl.useProgram(this.program_);

			if (this.writeMask_) {
				gl.colorMask(this.writeMask_.red, this.writeMask_.green, this.writeMask_.blue, this.writeMask_.alpha);
			}

			// -- default state of depth writes is true
			if (! this.depthMask_) {
				gl.depthMask(this.depthMask_);
			}

			if (this.blending_.enabled) {
				gl.enable(gl.BLEND);

				const rgbEq = glBlendEqForBlendOperation(this.rc, this.blending_.rgbBlendOp);
				const alphaEq = glBlendEqForBlendOperation(this.rc, this.blending_.alphaBlendOp);
				gl.blendEquationSeparate(rgbEq, alphaEq);

				const rgbSrcFn = glBlendFuncForBlendFactor(this.rc, this.blending_.sourceRGBFactor);
				const alphaSrcFn = glBlendFuncForBlendFactor(this.rc, this.blending_.sourceAlphaFactor);
				const rgbDestFn = glBlendFuncForBlendFactor(this.rc, this.blending_.destRGBFactor);
				const alphaDestFn = glBlendFuncForBlendFactor(this.rc, this.blending_.destAlphaFactor);
				gl.blendFuncSeparate(rgbSrcFn, rgbDestFn, alphaSrcFn, alphaDestFn);

				gl.blendColor(this.blending_.constantColour[0], this.blending_.constantColour[1], this.blending_.constantColour[2], this.blending_.constantColour[3]);
			}
		}


		unbind() {
			const gl = this.rc.gl;
			gl.useProgram(null);

			if (this.writeMask_) {
				gl.colorMask(true, true, true, true);
			}

			if (! this.depthMask_) {
				gl.depthMask(true);
			}

			if (this.blending_.enabled) {
				gl.disable(gl.BLEND);
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.ONE, gl.ZERO);
			}
		}


		// -- observers
		get colourPixelFormats() { return this.colourPixelFormats_.slice(0); }
		get depthPixelFormat() { return this.depthPixelFormat_; }
		get stencilPixelFormat() { return this.stencilPixelFormat_; }

		// FIXME: this is bad
		get blendConstantAlpha() { return this.blending_.constantColour[3]; }
		set blendConstantAlpha(newAlpha: number) { this.blending_.constantColour[3] = math.clamp01(newAlpha); }

		get program() { return this.program_; }

		get attributeCount() { return this.attrRoleIndexMap_.size; }
		attributePairs() { return this.attrRoleIndexMap_.entries(); }
		attributeIndexForRole(role: meshdata.VertexAttributeRole) {
			if (this.attrRoleIndexMap_.has(role)) {
				return this.attrRoleIndexMap_.get(role);
			}
			return -1;
		}
	}

} // ns sd.render
