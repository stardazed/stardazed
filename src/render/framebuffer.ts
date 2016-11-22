// framebuffer - FrameBuffer objects
// Part of Stardazed TX
// (c) 2015-2016 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

import { assert, cloneStruct } from "core/util";
import { RenderContext, maxColourAttachments } from "render/rendercontext";
import { PixelFormat, pixelFormatIsDepthFormat, pixelFormatIsStencilFormat, pixelFormatIsDepthStencilFormat } from "render/pixelformat";
import { TextureClass, TextureMipFilter, TextureRepeatMode, makeTextureDescriptor } from "render/texture-desc";
import { Texture } from "render/texture";
import { FrameBufferAllocationDescriptor, FrameBufferDescriptor, AttachmentDescriptor, makeFrameBufferDescriptor } from "render/framebuffer-desc";

const fboBugs = {
	mustHaveAColourAtt: <(boolean | null)>null
};

function fboMustHaveAColourAttachment(rc: RenderContext) {
	if (fboBugs.mustHaveAColourAtt === null) {
		const gl = rc.gl;
		const fboBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);

		const fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		// -- create and attach depth buffer
		const depthBuf = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuf);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 160, 120);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuf);

		// -- specify empty draw buffer list
		if (rc.extDrawBuffers) {
			rc.extDrawBuffers.drawBuffersWEBGL([gl.NONE]);
		}

		// This bug occurs on Mac OS X in Safari 9+ and Chrome 45+, it is due to faulty
		// setup of DRAW and READ buffer bindings in the underlying GL4 context.
		// Bugs have been filed.		
		const fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		fboBugs.mustHaveAColourAtt = (fbStatus != gl.FRAMEBUFFER_COMPLETE);

		gl.bindFramebuffer(gl.FRAMEBUFFER, fboBinding);
		gl.bindTexture(gl.TEXTURE_2D, null);

		gl.deleteFramebuffer(fbo);
		gl.deleteRenderbuffer(depthBuf);
	}

	return fboBugs.mustHaveAColourAtt;
}


export function allocateTexturesForFrameBuffer(rc: RenderContext, desc: FrameBufferAllocationDescriptor): FrameBufferDescriptor {
	const fbDesc = makeFrameBufferDescriptor();

	// -- default to viewport dimensions if set to 0
	const width = desc.width || rc.gl.drawingBufferWidth;
	const height = desc.height || rc.gl.drawingBufferHeight;

	// -- colour
	if ((desc.colourPixelFormats[0] == PixelFormat.None) && fboMustHaveAColourAttachment(rc)) {
		// work around FBO bug, see fboMustHaveAColourAttachment function
		desc.colourPixelFormats[0] = PixelFormat.RGB8;
	}

	for (let colourAttIndex = 0; colourAttIndex < desc.colourPixelFormats.length; ++colourAttIndex) {
		if (desc.colourPixelFormats[colourAttIndex] != PixelFormat.None) {
			const texDesc = makeTextureDescriptor();
			texDesc.textureClass = TextureClass.Tex2D;
			texDesc.dim.width = width;
			texDesc.dim.height = height;
			texDesc.sampling.repeatS = texDesc.sampling.repeatT = TextureRepeatMode.ClampToEdge;
			texDesc.sampling.mipFilter = TextureMipFilter.None;
			texDesc.pixelFormat = desc.colourPixelFormats[colourAttIndex];
			texDesc.usageHint = desc.colourUsageHints[colourAttIndex];

			const attachment = fbDesc.colourAttachments[colourAttIndex];
			attachment.texture = new Texture(rc, texDesc);
		}
	}

	// -- depth & stencil
	let combinedFormat = PixelFormat.None;

	assert(desc.depthPixelFormat == PixelFormat.None ||
		pixelFormatIsDepthFormat(desc.depthPixelFormat) ||
		pixelFormatIsDepthStencilFormat(desc.depthPixelFormat));
	assert(desc.stencilPixelFormat == PixelFormat.None ||
		pixelFormatIsStencilFormat(desc.stencilPixelFormat) ||
		pixelFormatIsDepthStencilFormat(desc.stencilPixelFormat));

	// -- check if we can use a combined depth/stencil format
	if (pixelFormatIsDepthStencilFormat(desc.depthPixelFormat)) {
		// explicit combined format
		assert(desc.depthPixelFormat == desc.stencilPixelFormat);
		assert(desc.depthUsageHint == desc.stencilUsageHint);
		combinedFormat = desc.depthPixelFormat;
	}
	else {
		// if depth is not a DS format, then stencil cannot be a DS format either
		assert(! pixelFormatIsDepthStencilFormat(desc.stencilPixelFormat));

		// in order to be combined, the usage hints must be the same
		if (desc.depthUsageHint == desc.stencilUsageHint) {
			// check for available depth/stencil format combinations
			if (desc.stencilPixelFormat == PixelFormat.Stencil8) {
				if (desc.depthPixelFormat == PixelFormat.Depth24I) {
					combinedFormat = PixelFormat.Depth24_Stencil8;
				}
			}
		}
	}

	// -- create the texture(s)
	const dsTex = makeTextureDescriptor();
	dsTex.textureClass = TextureClass.Tex2D;
	dsTex.dim.width = width;
	dsTex.dim.height = height;
	dsTex.sampling.repeatS = dsTex.sampling.repeatT = TextureRepeatMode.ClampToEdge;
	dsTex.sampling.mipFilter = TextureMipFilter.None;

	if (combinedFormat != PixelFormat.None) {
		dsTex.pixelFormat = combinedFormat;
		dsTex.usageHint = desc.depthUsageHint;
		const depthStencil = new Texture(rc, dsTex);

		fbDesc.depthAttachment.texture = depthStencil;
		fbDesc.stencilAttachment.texture = depthStencil;
	}
	else {
		if (desc.depthPixelFormat != PixelFormat.None) {
			dsTex.pixelFormat = desc.depthPixelFormat;
			dsTex.usageHint = desc.depthUsageHint;
			fbDesc.depthAttachment.texture = new Texture(rc, dsTex);
		}
		if (desc.stencilPixelFormat != PixelFormat.None) {
			dsTex.pixelFormat = desc.stencilPixelFormat;
			dsTex.usageHint = desc.stencilUsageHint;
			fbDesc.stencilAttachment.texture = new Texture(rc, dsTex);
		}
	}

	return fbDesc;
}


export class FrameBuffer {
	private attachmentDesc_: FrameBufferDescriptor;
	private fbo_: WebGLFramebuffer;
	private width_ = 0;
	private height_ = 0;


	private attachTexture(glAttachment: number, attachment: AttachmentDescriptor) {
		const gl = this.rc.gl;
		const texture = attachment.texture!;
		assert(texture, "Tried to attach a null texture");

		if (texture.target == gl.RENDERBUFFER) {
			assert(attachment.level == 0, "renderbuffers do not have mipmaps");
			assert(attachment.layer == 0, "renderbuffers do not have layers");

			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, glAttachment, gl.RENDERBUFFER, <WebGLRenderbuffer>texture.resource);
		}
		else {
			const tex = <WebGLTexture>texture.resource;
			assert(attachment.level == 0, "WebGL 1 does not allow mapping of texture level > 0");
			assert(attachment.level < texture.mipmaps);

			let glTarget = gl.TEXTURE_2D;
			if (texture.textureClass == TextureClass.TexCube) {
				assert(attachment.layer >= 0 && attachment.layer <= 5, "layer is not a valid CubeMapFace index");
				glTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + attachment.layer;
			}

			gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachment, glTarget, tex, attachment.level);
		}
	}


	constructor(private rc: RenderContext, desc: FrameBufferDescriptor) {
		const gl = rc.gl;
		const fbo = this.fbo_ = gl.createFramebuffer()!; // FIXME: verify resource creation
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		// -- deep copy of descriptor
		this.attachmentDesc_ = {
			colourAttachments: desc.colourAttachments.map((att) => cloneStruct(att)),
			depthAttachment: cloneStruct(desc.depthAttachment),
			stencilAttachment: cloneStruct(desc.stencilAttachment)
		};

		let anyTexture: (Texture | null) = null;

		// -- colour
		const drawBuffers = desc.colourAttachments.map((attachment, attIndex) => {
			if (attachment.texture) {
				anyTexture = attachment.texture;
				const glAttachment = rc.extDrawBuffers ? (rc.extDrawBuffers.COLOR_ATTACHMENT0_WEBGL + attIndex) : rc.gl.COLOR_ATTACHMENT0;
				this.attachTexture(glAttachment, attachment);
				return glAttachment;
			}
			else {
				return gl.NONE;
			}
		});

		// -- setup the draw buffers to mimic the colour attachments
		// -- which is required in WebGL
		if (rc.extDrawBuffers) {
			rc.extDrawBuffers.drawBuffersWEBGL(drawBuffers);
		}

		// -- depth and/or stencil
		const depthTex = desc.depthAttachment.texture;
		const stencilTex = desc.stencilAttachment.texture;

		if (depthTex) {
			anyTexture = depthTex;
			assert(desc.depthAttachment.level == 0);
			assert(desc.depthAttachment.layer == 0);
		}

		if (stencilTex) {
			anyTexture = stencilTex;
			assert(desc.stencilAttachment.level == 0);
			assert(desc.stencilAttachment.layer == 0);
		}

		if (depthTex && stencilTex && (depthTex == stencilTex)) {
			// -- combined depth/stencil texture
			assert(pixelFormatIsDepthStencilFormat(depthTex.pixelFormat));

			this.attachTexture(gl.DEPTH_STENCIL_ATTACHMENT, desc.depthAttachment);
		}
		else {
			if (depthTex) {
				assert(pixelFormatIsDepthFormat(depthTex.pixelFormat));
				this.attachTexture(gl.DEPTH_ATTACHMENT, desc.depthAttachment);
			}

			if (stencilTex) {
				assert(pixelFormatIsStencilFormat(stencilTex.pixelFormat));
				this.attachTexture(gl.STENCIL_ATTACHMENT, desc.stencilAttachment);
			}
		}


		// -- beg for approval to the GL gods
		const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (status != gl.FRAMEBUFFER_COMPLETE) {
			assert(false, "FrameBuffer not complete");
		}

		// -- get width and height from one of the textures
		// -- they should all be the same
		if (anyTexture) {
			this.width_ = anyTexture.width;
			this.height_ = anyTexture.height;
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}


	bind() {
		this.rc.gl.bindFramebuffer(this.rc.gl.FRAMEBUFFER, this.fbo_);
	}

	unbind() {
		this.rc.gl.bindFramebuffer(this.rc.gl.FRAMEBUFFER, null);
	}


	// -- observers
	get width() { return this.width_; }
	get height() { return this.height_; }
	get resource() { return this.fbo_; }


	hasColourAttachment(atIndex: number) {
		assert(atIndex < maxColourAttachments(this.rc));
		return this.attachmentDesc_.colourAttachments[atIndex].texture != null;
	}

	hasDepthAttachment() {
		return this.attachmentDesc_.depthAttachment.texture != null;
	}

	hasStencilAttachment() {
		return this.attachmentDesc_.stencilAttachment.texture != null;
	}


	colourAttachmentTexture(atIndex: number) {
		assert(atIndex < maxColourAttachments(this.rc));
		return this.attachmentDesc_.colourAttachments[atIndex].texture;
	}

	depthAttachmentTexture() {
		return this.attachmentDesc_.depthAttachment.texture;
	}

	stencilAttachmentTexture() {
		return this.attachmentDesc_.stencilAttachment.texture;
	}
}
