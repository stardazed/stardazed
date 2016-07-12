// buffer.ts - Render buffers
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="rendercontext.ts"/>

namespace sd.render {

	export const enum BufferUpdateFrequency {
		Never,
		Occasionally,
		Frequently
	}


	export const enum BufferRole {
		None,
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


	function glBindingNameForTarget(rc: RenderContext, target: number) {
		switch (target) {
			case rc.gl.ARRAY_BUFFER: return rc.gl.ARRAY_BUFFER_BINDING;
			case rc.gl.ELEMENT_ARRAY_BUFFER: return rc.gl.ELEMENT_ARRAY_BUFFER_BINDING;
			default:
				assert(false, "Unhandled buffer target name");
				return rc.gl.NONE;
		}
	}


	export type BufferDataSource = ArrayBuffer | ArrayBufferView;


	export class Buffer {
		private target_: number;
		private resource_: WebGLBuffer | null = null;
		private byteSize_ = 0;

		constructor(private rc: RenderContext, private role_: BufferRole, private updateFrequency_: BufferUpdateFrequency) {
			this.target_ = glTargetForBufferRole(rc, this.role_);
			this.resource_ = rc.gl.createBuffer()!;
		}

	
		// -- allocation
		allocateEmpty(byteSize: number) {
			var changed = Buffer.bindIfNotBound(this);
			this.byteSize_ = byteSize;
			this.rc.gl.bufferData(this.target_, byteSize, glUsageHint(this.rc, this.updateFrequency_));
			if (changed) this.unbind();
		}

		allocateWithContents(data: BufferDataSource) {
			var changed = Buffer.bindIfNotBound(this);

			this.byteSize_ = data.byteLength;
			this.rc.gl.bufferData(this.target_, data, glUsageHint(this.rc, this.updateFrequency_));

			if (changed) this.unbind();
		}


		// -- direct updates
		write(data: BufferDataSource, offset: number = 0) {
			var changed = Buffer.bindIfNotBound(this);
			this.rc.gl.bufferSubData(this.target_, offset, data);
			if (changed) this.unbind();
		}


		// -- observers
		get role() { return this.role_; }
		get updateFrequency() { return this.updateFrequency_; }
		get byteSize() { return this.byteSize_; }

		get resource() { return this.resource_; }
		get target() { return this.target_; }

	
		// -- binding
		bind() {
			this.rc.gl.bindBuffer(this.target_, this.resource_);
			Buffer.boundBuffers_s[this.target_] = this;
		}
		unbind() {
			this.rc.gl.bindBuffer(this.target_, null);
			Buffer.boundBuffers_s[this.target_] = null;
		}


		// -- GL state cache
		private static boundBuffers_s: { [role: number]: Buffer | null; } = {};

		static bindIfNotBound(buffer: Buffer): boolean {
			var curBound = Buffer.boundBuffers_s[buffer.role_];
			if (curBound != buffer) {
				buffer.bind();
			}
			return curBound != buffer;
		}

		static currentlyBoundOfRole(role: BufferRole) {
			return Buffer.boundBuffers_s[role] || null;
		}
	}

} // ns sd.render
