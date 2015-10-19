// Definitions by: Shane S. Anderson <https://github.com/ander-nz/>
// This file adds 'branding' to the WebGL types to ensure that accidental assignments aren't made.
// For example, var program: WebGLProgram = gl.createShader(...);

interface WebGLObject { __WebGLObject: void; }
interface WebGLBuffer { __WebGLBuffer: void; }
interface WebGLFramebuffer { __WebGLFramebuffer: void; }
interface WebGLProgram { __WebGLProgram: void; }
interface WebGLRenderbuffer { __WebGLRenderbuffer: void; }
interface WebGLShader { __WebGLShader: void; }
interface WebGLTexture { __WebGLTexture: void; }
interface WebGLUniformLocation { __WebGLUniformLocation: void; }
