// buffer.ts - Render buffers
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="meshdata.ts"/>
/// <reference path="rendercontext.ts"/>

namespace sd.render {

	export const enum BufferUpdateFrequency {
		Never,
		Occasionally,
		Frequently
	}


	export const enum BufferRole {
		VertexAttribute,
		VertexIndex
	}


	function glUsageHint(rc: RenderContext, frequency: BufferUpdateFrequency) {
		var gl = rc.gl;

		switch (frequency) {
			case BufferUpdateFrequency.Never:
				return gl.STATIC_DRAW;
			case BufferUpdateFrequency.Occasionally:
				return gl.DYNAMIC_DRAW;
			case BufferUpdateFrequency.Frequently:
				return gl.STREAM_DRAW;
		}

		assert(false, "Unknown update frequency");
		return gl.NONE;
	}


	function glTargetForBufferRole(rc: RenderContext, role: BufferRole) {
		switch (role) {
			case BufferRole.VertexAttribute:
				return rc.gl.ARRAY_BUFFER;
			case BufferRole.VertexIndex:
				return rc.gl.ELEMENT_ARRAY_BUFFER;
		}

		assert(false, "Unknown buffer role");
		return rc.gl.NONE;
	}


	export class Buffer {
		private target_: number;
		resource_: WebGLBuffer = null;
		byteSize_ = 0;

		constructor(private rc: RenderContext, private role_: BufferRole, private updateFrequency_: BufferUpdateFrequency) {
			this.target_ = glTargetForBufferRole(rc, this.role_);
			this.resource_ = rc.gl.createBuffer();
		}
	
		// -- initialization

		allocate(bytes: number, data?: ArrayBuffer | ArrayBufferView) {
			this.byteSize_ = bytes;
			this.bind();
			this.rc.gl.bufferData(this.target_, data || bytes, glUsageHint(this.rc, this.updateFrequency_));
			this.unbind();
		}

		allocateFromVertexBuffer(vb: mesh.VertexBuffer) {
			assert(this.role_ == BufferRole.VertexAttribute);
			this.allocate(vb.bufferSizeBytes(), vb.buffer());
		}

		allocateFromIndexBuffer(ib: mesh.IndexBuffer) {
			assert(this.role_ == BufferRole.VertexIndex);
			this.allocate(ib.bufferSizeBytes(), ib.buffer());
		}

		// -- direct updates
		write(data: ArrayBuffer | ArrayBufferView, offset: number = 0) {
			this.bind();
			this.rc.gl.bufferSubData(this.target_, offset, data);
			this.unbind();
		}

		// -- observers
		role() { return this.role_; }
		updateFrequency() { return this.updateFrequency_; }
		byteSize() { return this.byteSize_; }

		resource() { return this.resource_; }
		target() { return this.target_; }
	
		// -- binding
		bind() { this.rc.gl.bindBuffer(this.target_, this.resource_); }
		unbind() { this.rc.gl.bindBuffer(this.target_, null); }
	}

} // ns sd.render
