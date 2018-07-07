/**
 * render-gl1/state - WebGL1 state management
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

import { Float4 } from "@stardazed/core";
import { makeLUT } from "@stardazed/container";
import { clamp, vec2, vec4 } from "@stardazed/math";
import { BlendOperation, BlendFactor, DepthTest, FrontFaceWinding, FaceCulling,
	ScissorRect, Viewport, ColourBlending, ColourWriteMask,
	TextureRepeatMode, TextureMipFilter, TextureSizingFilter, Sampler } from "@stardazed/render";
import { GLConst } from "./gl1-constants";
import { GL1TextureData } from "./gl1-texture";

const depthTestForGL1DepthFunc = makeLUT<number, DepthTest>(
	GLConst.ALWAYS, DepthTest.AllowAll,
	GLConst.NEVER, DepthTest.DenyAll,
	GLConst.LESS, DepthTest.Less,
	GLConst.LEQUAL, DepthTest.LessOrEqual,
	GLConst.EQUAL, DepthTest.Equal,
	GLConst.NOTEQUAL, DepthTest.NotEqual,
	GLConst.GEQUAL, DepthTest.GreaterOrEqual,
	GLConst.GREATER, DepthTest.Greater
);

const gl1DepthFuncForDepthTest = makeLUT<DepthTest, number>(
	DepthTest.AllowAll, GLConst.ALWAYS,
	DepthTest.DenyAll, GLConst.NEVER,
	DepthTest.Less, GLConst.LESS,
	DepthTest.LessOrEqual, GLConst.LEQUAL,
	DepthTest.Equal, GLConst.EQUAL,
	DepthTest.NotEqual, GLConst.NOTEQUAL,
	DepthTest.GreaterOrEqual, GLConst.GEQUAL,
	DepthTest.Greater, GLConst.GREATER
);

const blendOpForGL1BlendEq = makeLUT<number, BlendOperation>(
	GLConst.FUNC_ADD, BlendOperation.Add,
	GLConst.FUNC_SUBTRACT, BlendOperation.Subtract,
	GLConst.FUNC_REVERSE_SUBTRACT, BlendOperation.ReverseSubtract,
	GLConst.MIN_EXT, BlendOperation.Min,
	GLConst.MAX_EXT, BlendOperation.Max
);

const gl1BlendEqForBlendOp = makeLUT<BlendOperation, number>(
	BlendOperation.Add, GLConst.FUNC_ADD,
	BlendOperation.Subtract, GLConst.FUNC_SUBTRACT,
	BlendOperation.ReverseSubtract, GLConst.FUNC_REVERSE_SUBTRACT,
	BlendOperation.Min, GLConst.MIN_EXT,
	BlendOperation.Max, GLConst.MAX_EXT
);

const blendFactorForGL1BlendFunc = makeLUT<number, BlendFactor>(
	GLConst.ZERO, BlendFactor.Zero,
	GLConst.ONE, BlendFactor.One,
	GLConst.SRC_COLOR, BlendFactor.SourceColour,
	GLConst.ONE_MINUS_SRC_COLOR, BlendFactor.OneMinusSourceColour,
	GLConst.DST_COLOR, BlendFactor.DestColour,
	GLConst.ONE_MINUS_DST_COLOR, BlendFactor.OneMinusDestColour,
	GLConst.SRC_ALPHA, BlendFactor.SourceAlpha,
	GLConst.ONE_MINUS_SRC_ALPHA, BlendFactor.OneMinusSourceAlpha,
	GLConst.SRC_ALPHA_SATURATE, BlendFactor.SourceAlphaSaturated,
	GLConst.DST_ALPHA, BlendFactor.DestAlpha,
	GLConst.ONE_MINUS_DST_ALPHA, BlendFactor.OneMinusDestAlpha,
	GLConst.CONSTANT_COLOR, BlendFactor.ConstantColour,
	GLConst.ONE_MINUS_CONSTANT_COLOR, BlendFactor.OneMinusConstantColour,
	GLConst.CONSTANT_ALPHA, BlendFactor.ConstantAlpha,
	GLConst.ONE_MINUS_CONSTANT_ALPHA, BlendFactor.OneMinusConstantAlpha
);

const gl1BlendFuncForBlendFactor = makeLUT<BlendFactor, number>(
	BlendFactor.Zero, GLConst.ZERO,
	BlendFactor.One, GLConst.ONE,
	BlendFactor.SourceColour, GLConst.SRC_COLOR,
	BlendFactor.OneMinusSourceColour, GLConst.ONE_MINUS_SRC_COLOR,
	BlendFactor.DestColour, GLConst.DST_COLOR,
	BlendFactor.OneMinusDestColour, GLConst.ONE_MINUS_DST_COLOR,
	BlendFactor.SourceAlpha, GLConst.SRC_ALPHA,
	BlendFactor.OneMinusSourceAlpha, GLConst.ONE_MINUS_SRC_ALPHA,
	BlendFactor.SourceAlphaSaturated, GLConst.SRC_ALPHA_SATURATE,
	BlendFactor.DestAlpha, GLConst.DST_ALPHA,
	BlendFactor.OneMinusDestAlpha, GLConst.ONE_MINUS_DST_ALPHA,
	BlendFactor.ConstantColour, GLConst.CONSTANT_COLOR,
	BlendFactor.OneMinusConstantColour, GLConst.ONE_MINUS_CONSTANT_COLOR,
	BlendFactor.ConstantAlpha, GLConst.CONSTANT_ALPHA,
	BlendFactor.OneMinusConstantAlpha, GLConst.ONE_MINUS_CONSTANT_ALPHA
);

const gl1TextureRepeatMode = makeLUT<TextureRepeatMode, number>(
	TextureRepeatMode.Repeat, GLConst.REPEAT,
	TextureRepeatMode.MirroredRepeat, GLConst.MIRRORED_REPEAT,
	TextureRepeatMode.ClampToEdge, GLConst.CLAMP_TO_EDGE
);

const gl1TextureMagnificationFilter = makeLUT<TextureSizingFilter, number>(
	TextureSizingFilter.Nearest, GLConst.NEAREST,
	TextureSizingFilter.Linear, GLConst.LINEAR
);

function gl1TextureMinificationFilter(minFilter: TextureSizingFilter, mipFilter: TextureMipFilter) {
	let glSizingFilter: number;

	if (mipFilter === TextureMipFilter.None) {
		if (minFilter === TextureSizingFilter.Nearest) {
			glSizingFilter = GLConst.NEAREST;
		}
		else {
			glSizingFilter = GLConst.LINEAR;
		}
	}
	else if (mipFilter === TextureMipFilter.Nearest) {
		if (minFilter === TextureSizingFilter.Nearest) {
			glSizingFilter = GLConst.NEAREST_MIPMAP_NEAREST;
		}
		else {
			glSizingFilter = GLConst.LINEAR_MIPMAP_NEAREST;
		}
	}
	else {
		if (minFilter === TextureSizingFilter.Nearest) {
			glSizingFilter = GLConst.NEAREST_MIPMAP_LINEAR;
		}
		else {
			glSizingFilter = GLConst.LINEAR_MIPMAP_LINEAR;
		}
	}

	return glSizingFilter;
}


/**
 * The reason this class exists is to avoid making unnecessary calls to GL
 * whenever possible as GL will dutifully do as you ask and recompile the
 * GPU state every time, even if nothing changed. Additionally, the WebGL
 * layer adds overhead as well and querying the GL is defined to be slow.
 */
export class GL1State {
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

	private readonly extTextureAnisotropy: EXT_texture_filter_anisotropic | null;
	private readonly maxAnisotropy_: number;
	private readonly maxTextureSlot_: number;
	private readonly textureSlots_: (WebGLTexture | null)[];

	private activeProgram_: WebGLProgram | null;
	private framebuffer_: WebGLFramebuffer | null;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
		this.extTextureAnisotropy = gl.getExtension("EXT_texture_filter_anisotropic") ||
									gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

		// static properties
		this.maxAnisotropy_ = this.extTextureAnisotropy ?
			this.gl.getParameter(GLConst.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
		this.maxTextureSlot_ = this.gl.getParameter(GLConst.MAX_COMBINED_TEXTURE_IMAGE_UNITS) - 1;
		this.textureSlots_ = Array.from({ length: this.maxTextureSlot_ + 1 }, _ => null);

		// initial pull of dynamic state
		this.frontFace_ = (gl.getParameter(GLConst.FRONT_FACE) === GLConst.CW) ? FrontFaceWinding.Clockwise : FrontFaceWinding.CounterClockwise;

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

		this.depthTest_ = gl.isEnabled(GLConst.DEPTH_TEST) ? depthTestForGL1DepthFunc[gl.getParameter(GLConst.DEPTH_FUNC)] : DepthTest.Disabled;

		this.blendEnabled_ = gl.isEnabled(GLConst.BLEND);
		this.blendOpRGB_ = blendOpForGL1BlendEq[gl.getParameter(GLConst.BLEND_EQUATION_RGB)];
		this.blendOpAlpha_ = blendOpForGL1BlendEq[gl.getParameter(GLConst.BLEND_EQUATION_ALPHA)];
		this.blendFnSrcRGB_ = blendFactorForGL1BlendFunc[gl.getParameter(GLConst.BLEND_SRC_RGB)];
		this.blendFnSrcAlpha_ = blendFactorForGL1BlendFunc[gl.getParameter(GLConst.BLEND_SRC_ALPHA)];
		this.blendFnDstRGB_ = blendFactorForGL1BlendFunc[gl.getParameter(GLConst.BLEND_DST_RGB)];
		this.blendFnDstAlpha_ = blendFactorForGL1BlendFunc[gl.getParameter(GLConst.BLEND_DST_ALPHA)];
		this.blendConstColour_ = gl.getParameter(GLConst.BLEND_COLOR);

		this.activeProgram_ = gl.getParameter(GLConst.CURRENT_PROGRAM);
		this.framebuffer_ = gl.getParameter(GLConst.FRAMEBUFFER_BINDING);
	}

	get maxTextureSlot() {
		return this.maxTextureSlot_;
	}

	setFrontFace(frontFace: FrontFaceWinding) {
		if (frontFace === this.frontFace_) {
			return;
		}
		this.frontFace_ = frontFace;
		this.gl.frontFace((frontFace === FrontFaceWinding.Clockwise) ? GLConst.CW : GLConst.CCW);
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

	setClearColour(rgba: Float4) {
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
				this.gl.depthFunc(gl1DepthFuncForDepthTest[test]);
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
					gl1BlendFuncForBlendFactor[blending.sourceRGBFactor],
					gl1BlendFuncForBlendFactor[blending.destRGBFactor],
					gl1BlendFuncForBlendFactor[blending.sourceAlphaFactor],
					gl1BlendFuncForBlendFactor[blending.destAlphaFactor]
				);
			}

			if (blending.rgbBlendOp !== this.blendOpRGB_ || blending.alphaBlendOp !== this.blendOpAlpha_) {
				this.blendOpRGB_ = blending.rgbBlendOp;
				this.blendOpAlpha_ = blending.alphaBlendOp;

				this.gl.blendEquationSeparate(
					gl1BlendEqForBlendOp[blending.rgbBlendOp],
					gl1BlendEqForBlendOp[blending.alphaBlendOp]
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

	setTexture(slotIndex: number, texture: GL1TextureData | undefined, sampler: Sampler | undefined) {
		const gl = this.gl;

		// always update the GL state for active texture
		this.gl.activeTexture(GLConst.TEXTURE0 + slotIndex);

		if (! texture) {
			if (this.textureSlots_[slotIndex]) {
				this.textureSlots_[slotIndex] = null;
				this.gl.bindTexture(GLConst.TEXTURE_2D, null);
			}
		}
		else {
			const samplerHandle = sampler ? sampler.renderResourceHandle : 0;
			const textureChanged = this.textureSlots_[slotIndex] !== texture.texture;
			const samplerChanged = sampler !== undefined && texture.linkedSamplerHandle !== samplerHandle;

			if (textureChanged || samplerChanged) {
				if (textureChanged) {
					this.textureSlots_[slotIndex] = texture.texture;
					this.gl.bindTexture(texture.target, texture.texture);
				}
				if (samplerChanged) {
					texture.linkedSamplerHandle = sampler!.renderResourceHandle;
					let { repeatS, repeatT, mipFilter } = sampler!;

					// -- WebGL 1 imposes several restrictions on Non-Power-of-Two textures
					if (texture.nonPowerOfTwoDim) {
						if (repeatS !== TextureRepeatMode.ClampToEdge || repeatT !== TextureRepeatMode.ClampToEdge) {
							console.warn("NPOT textures cannot repeat, overriding with ClampToEdge", texture);
							repeatS = TextureRepeatMode.ClampToEdge;
							repeatT = TextureRepeatMode.ClampToEdge;
						}
						if (mipFilter !== TextureMipFilter.None) {
							console.warn("NPOT textures cannot have mipmaps, overriding with MipFilter.None", texture);
							mipFilter = TextureMipFilter.None;
						}
					}

					if (! texture.mipmapped) {
						if (mipFilter !== TextureMipFilter.None) {
							console.warn("Non-mipped textures can only use MipFilter.None", texture);
							mipFilter = TextureMipFilter.None;
						}
					}

					// -- wrapping
					gl.texParameteri(texture.target, GLConst.TEXTURE_WRAP_S, gl1TextureRepeatMode[repeatS]);
					gl.texParameteri(texture.target, GLConst.TEXTURE_WRAP_T, gl1TextureRepeatMode[repeatT]);

					// -- mini-/magnification
					gl.texParameteri(texture.target, GLConst.TEXTURE_MIN_FILTER, gl1TextureMinificationFilter(sampler!.minFilter, mipFilter));
					gl.texParameteri(texture.target, GLConst.TEXTURE_MAG_FILTER, gl1TextureMagnificationFilter[sampler!.magFilter]);

					// -- anisotropy
					if (this.extTextureAnisotropy) {
						const anisotropy = clamp(sampler!.maxAnisotropy, 1, this.maxAnisotropy_);
						gl.texParameterf(texture.target, GLConst.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
					}
				}
			}
		}
	}

	setProgram(program: WebGLProgram | null) {
		if (program !== this.activeProgram_) {
			this.activeProgram_ = program;
			this.gl.useProgram(program);
		}
	}

	setFramebuffer(fb: WebGLFramebuffer | null) {
		if (fb !== this.framebuffer_) {
			this.framebuffer_ = fb;
			this.gl.bindFramebuffer(GLConst.FRAMEBUFFER, fb);
		}
	}
}
