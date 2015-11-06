// pipeline - pipeline objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="pipeline-desc.ts"/>
/// <reference path="rendercontext.ts"/>

namespace sd.render {

	function glBlendEqForBlendOperation(rc: RenderContext, op: BlendOperation) {
		switch (op) {
			case BlendOperation.Add: return rc.gl.FUNC_ADD;
			case BlendOperation.Subtract: return rc.gl.FUNC_SUBTRACT;
			case BlendOperation.ReverseSubtract: rc.gl.FUNC_REVERSE_SUBTRACT;

			case BlendOperation.Min: return rc.extMinMax ? rc.extMinMax.MIN_EXT : rc.gl.FUNC_SUBTRACT;
			case BlendOperation.Max: return rc.extMinMax ? rc.extMinMax.MAX_EXT : rc.gl.FUNC_ADD;
		}
	}


	function glBlendFuncForBlendFactor(rc: RenderContext, factor: BlendFactor) {
		switch (factor) {
			case BlendFactor.Zero: return rc.gl.ZERO;
			case BlendFactor.One: return rc.gl.ONE;
			case BlendFactor.SourceColour: return rc.gl.SRC_COLOR;
			case BlendFactor.OneMinusSourceColour: rc.gl.ONE_MINUS_SRC_COLOR;
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
		}
	}


	class Pipeline {
		private colourPixelFormats_: PixelFormat[];
		private depthPixelFormat_: PixelFormat;
		private stencilPixelFormat_: PixelFormat;
		private writeMask_: ColourWriteMask;
		private blending_: ColourBlendingDescriptor;
		private program_: WebGLProgram;

		constructor(private rc: RenderContext, desc: PipelineDescriptor) {
			this.colourPixelFormats_ = desc.colourPixelFormats.slice(0);
			this.depthPixelFormat_ = desc.depthPixelFormat;
			this.stencilPixelFormat_ = desc.stencilPixelFormat;
			this.writeMask_ = cloneStruct(desc.writeMask);
			this.blending_ = cloneStruct(desc.blending);

			// -- check if the colour mask does anything and, if not, disable it
			if (this.writeMask_.red && this.writeMask_.green && this.writeMask_.blue && this.writeMask_.alpha) {
				this.writeMask_ = null;
			}

			// -- can the GL support the required # of colour attachments?
			var highestEnabledAttachment = -1;
			this.colourPixelFormats_.slice(1).forEach((pf, ix) => {
				if (pf != PixelFormat.None)
					highestEnabledAttachment = ix;
			});
			if (highestEnabledAttachment >= maxColourAttachments(rc)) {
				assert(rc.extDrawBuffers, "This GL only supports up to " + maxColourAttachments(rc) + " attachment(s)");
			}

			var gl = rc.gl;

			// -- create pipeline program
			this.program_ = gl.createProgram();
			if (desc.vertexShader)
				gl.attachShader(this.program_, desc.vertexShader);
			if (desc.fragmentShader)
				gl.attachShader(this.program_, desc.fragmentShader);
			gl.linkProgram(this.program_);

			if (! gl.getProgramParameter(this.program_, gl.LINK_STATUS)) {
				var errorLog = gl.getProgramInfoLog(this.program_);
				// alert("LINK FAILED\n\n" + errorLog);
				console.error("Program link failed:", errorLog);
				assert(false, "bad program");
			}
		}


		bind() {
			var gl = this.rc.gl;
			gl.useProgram(this.program_);

			if (this.writeMask_)
				gl.colorMask(this.writeMask_.red, this.writeMask_.green, this.writeMask_.blue, this.writeMask_.alpha);

			if (this.blending_.enabled) {
				gl.enable(gl.BLEND);

				var rgbEq = glBlendEqForBlendOperation(this.rc, this.blending_.rgbBlendOp);
				var alphaEq = glBlendEqForBlendOperation(this.rc, this.blending_.alphaBlendOp);
				gl.blendEquationSeparate(rgbEq, alphaEq);

				var rgbSrcFn = glBlendFuncForBlendFactor(this.rc, this.blending_.sourceRGBFactor);
				var alphaSrcFn = glBlendFuncForBlendFactor(this.rc, this.blending_.sourceAlphaFactor);
				var rgbDestFn = glBlendFuncForBlendFactor(this.rc, this.blending_.destRGBFactor);
				var alphaDestFn = glBlendFuncForBlendFactor(this.rc, this.blending_.destAlphaFactor);
				gl.blendFuncSeparate(rgbSrcFn, rgbDestFn, alphaSrcFn, alphaDestFn);
			}
		}


		unbind() {
			var gl = this.rc.gl;
			gl.useProgram(null);

			if (this.writeMask_)
				gl.colorMask(true, true, true, true);

			if (this.blending_.enabled) {
				gl.disable(gl.BLEND);
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.ONE, gl.ZERO);
			}
		}


		// -- observers
		colourPixelFormats() { return this.colourPixelFormats_.slice(0); }
		depthPixelFormat() { return this.depthPixelFormat_; }
		stencilPixelFormat() { return this.stencilPixelFormat_; }

		program() { return this.program_; }
	}

} // ns sd.render
