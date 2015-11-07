// framebuffer - FrameBuffer objects
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="framebuffer-desc.ts"/>
/// <reference path="texture.ts"/>
/// <reference path="rendercontext.ts"/>

namespace sd.render {

	export function allocateTexturesForFrameBuffer(rc: RenderContext, desc: FrameBufferAllocationDescriptor): FrameBufferDescriptor {
		var fbDesc = makeFrameBufferDescriptor();

		var width = desc.width;
		var height = desc.height;
	
		// -- default to viewport size if not explicitly specified
		if (width == 0 && height == 0) {
			width = rc.gl.drawingBufferWidth;
			height = rc.gl.drawingBufferHeight;
		}
	
		// -- colour
		for (var colourAttIndex = 0; colourAttIndex < desc.colourPixelFormats.length; ++colourAttIndex) {
			if (desc.colourPixelFormats[colourAttIndex] != PixelFormat.None) {
				var texDesc = makeTextureDescriptor();
				texDesc.textureClass = TextureClass.Tex2D;
				texDesc.dim.width = width;
				texDesc.dim.height = height;
				texDesc.sampling.repeatS = texDesc.sampling.repeatT = TextureRepeatMode.ClampToEdge;
				texDesc.sampling.mipFilter = TextureMipFilter.None;
				texDesc.pixelFormat = desc.colourPixelFormats[colourAttIndex];
				texDesc.usageHint = desc.colourUsageHints[colourAttIndex];

				var attachment = fbDesc.colourAttachments[colourAttIndex];
				attachment.texture = new Texture(rc, texDesc);
			}
		}

		// -- depth & stencil
		var combinedFormat = PixelFormat.None;

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
			assert(!pixelFormatIsDepthStencilFormat(desc.stencilPixelFormat));

			// WebGL does not support formats suitable to be combined as a separate pixelformat
		}

		// -- create the texture(s)
		var dsTex = makeTextureDescriptor();
		dsTex.textureClass = TextureClass.Tex2D;
		dsTex.dim.width = width;
		dsTex.dim.height = height;
		dsTex.sampling.repeatS = dsTex.sampling.repeatT = TextureRepeatMode.ClampToEdge;
		dsTex.sampling.mipFilter = TextureMipFilter.None;

		if (combinedFormat != PixelFormat.None) {
			dsTex.pixelFormat = combinedFormat;
			dsTex.usageHint = desc.depthUsageHint;
			var depthStencil = new Texture(rc, dsTex);

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
			var gl = this.rc.gl;

			if (attachment.texture.target() == gl.RENDERBUFFER) {
				assert(attachment.level == 0);
				assert(attachment.layer == 0);

				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, glAttachment, gl.RENDERBUFFER, <WebGLRenderbuffer>attachment.texture.resource());
			}
			else {
				var tex = <WebGLTexture>attachment.texture.resource();
				assert(attachment.level < attachment.texture.mipmaps());

				var glTarget = gl.TEXTURE_2D;
				if (attachment.texture.textureClass() == TextureClass.TexCube) {
					assert(attachment.layer >= 0 && attachment.layer <= 5, "layer is not a valid CubeMapFace index");
					glTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + attachment.layer;
				}

				gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachment, glTarget, tex, attachment.level);
			}
		}


		constructor(private rc: RenderContext, desc: FrameBufferDescriptor) {
			var gl = rc.gl;
			var fbo = this.fbo_ = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

			// -- deep copy of descriptor
			this.attachmentDesc_ = {
				colourAttachments: desc.colourAttachments.map((att) => cloneStruct(att)),
				depthAttachment: cloneStruct(desc.depthAttachment),
				stencilAttachment: cloneStruct(desc.stencilAttachment)
			};

			var anyTexture: Texture = null;

			// -- colour
			var drawBuffers = desc.colourAttachments.map((attachment, attIndex) => {
				if (attachment.texture) {
					anyTexture = attachment.texture;
					var glAttachment = rc.extDrawBuffers.COLOR_ATTACHMENT0_WEBGL + attIndex;
					this.attachTexture(glAttachment, attachment);
					return glAttachment;
				}
				else {
					return gl.NONE;
				}
			});

			// -- setup the draw buffers to mimic the colour attachments
			// -- as this is the wished behaviour in almost all cases (i.e. no NONE assignments)
			rc.extDrawBuffers.drawBuffersWEBGL(drawBuffers);


			// -- depth and/or stencil
			var depthTex = desc.depthAttachment.texture;
			var stencilTex = desc.stencilAttachment.texture;

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
				assert(pixelFormatIsDepthStencilFormat(depthTex.pixelFormat()));

				this.attachTexture(gl.DEPTH_STENCIL_ATTACHMENT, desc.depthAttachment);
			}
			else {
				if (depthTex) {
					assert(pixelFormatIsDepthFormat(depthTex.pixelFormat()));
					this.attachTexture(gl.DEPTH_ATTACHMENT, desc.depthAttachment);
				}

				if (stencilTex) {
					assert(pixelFormatIsStencilFormat(stencilTex.pixelFormat()));
					this.attachTexture(gl.STENCIL_ATTACHMENT, desc.stencilAttachment);
				}
			}


			// -- beg for approval to the GL gods
			var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
			if (status != gl.FRAMEBUFFER_COMPLETE) {
				assert(false, "FrameBuffer not complete");
			}
	
			// -- get width and height from one of the textures
			// -- they should all be the same
			if (anyTexture) {
				this.width_ = anyTexture.width();
				this.height_ = anyTexture.height();
			}

			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}


		bind() {
			this.rc.gl.bindFramebuffer(this.rc.gl.FRAMEBUFFER, this.fbo_);
		}


		// -- observers
		width() { return this.width_; }
		height() { return this.height_; }
		resource() { return this.fbo_; }


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

} // ns sd.render
