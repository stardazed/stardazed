// libzm3d - 3d structures, files, generators
// requires libzm
// (c) 2015 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/gl-matrix.d.ts" />
/// <reference path="../defs/webgl-ext.d.ts" />

/// <reference path="libzm.ts" />
/// <reference path="libzmgame.ts" />

declare var gl: WebGLRenderingContext;


interface ZMBasicGLProgram extends WebGLProgram {
	vertexPositionAttribute: number;
	vertexNormalAttribute: number;
	vertexColorAttribute: number;
	vertexUVAttribute: number;

	projMatrixUniform?: WebGLUniformLocation;
	mvMatrixUniform?: WebGLUniformLocation;
	normalMatrixUniform?: WebGLUniformLocation;

	textureUniform?: WebGLUniformLocation;
	timeUniform?: WebGLUniformLocation;
}


class TriMesh {
	vertexBuffer: WebGLBuffer;
	normalBuffer: WebGLBuffer;
	colorBuffer: WebGLBuffer;
	uvBuffer: WebGLBuffer;
	elementCount: number;

	constructor(vertexArray: ArrayOfNumber, normalArray?: ArrayOfNumber, colorArray?: ArrayOfNumber, uvArray?: ArrayOfNumber) {
		assert(vertexArray.length % 9 == 0, "vertex array must be a triangle soup"); // 3 vtx * 3 floats
		if (normalArray)
			assert(normalArray.length == vertexArray.length, "normal array must be same size as vertex array");
		if (colorArray)
			assert(colorArray.length == vertexArray.length, "color array must be same size as vertex array");
		if (uvArray)
			assert((uvArray.length / 2) == (vertexArray.length / 3), "each vertex needs a uv");

		this.vertexBuffer = gl.createBuffer();
		this.normalBuffer = normalArray ? gl.createBuffer() : null;
		this.colorBuffer = colorArray ? gl.createBuffer() : null;
		this.uvBuffer = uvArray ? gl.createBuffer() : null;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);

		if (this.normalBuffer) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalArray), gl.STATIC_DRAW);
		}

		if (this.colorBuffer) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
		}

		if (this.uvBuffer) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvArray), gl.STATIC_DRAW);
		}

		this.elementCount = vertexArray.length / 3;
	}

	draw(program: ZMBasicGLProgram, texture?: WebGLTexture) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.enableVertexAttribArray(program.vertexPositionAttribute);
		gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		if (program.vertexColorAttribute > -1) {
			if (this.colorBuffer) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
				gl.enableVertexAttribArray(program.vertexColorAttribute);
				gl.vertexAttribPointer(program.vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);
			}
			else {
				gl.disableVertexAttribArray(program.vertexColorAttribute);
			}
		}

		if (program.vertexNormalAttribute > -1) {
			if (this.normalBuffer) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
				gl.enableVertexAttribArray(program.vertexNormalAttribute);
				gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
			}
			else {
				gl.disableVertexAttribArray(program.vertexNormalAttribute);
			}
		}

		if (program.vertexUVAttribute > -1) {
			if (this.uvBuffer) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
				gl.enableVertexAttribArray(program.vertexUVAttribute);
				gl.vertexAttribPointer(program.vertexUVAttribute, 2, gl.FLOAT, false, 0, 0);
			}
			else {
				gl.disableVertexAttribArray(program.vertexUVAttribute);
			}
		}

		if (texture && program.textureUniform) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(program.textureUniform, 0);
		}

		gl.drawArrays(gl.TRIANGLES, 0, this.elementCount);

		if (texture && program.textureUniform) {
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	};
}


interface Material {
	ambientColor?: ArrayOfNumber;
	diffuseColor?: ArrayOfNumber;
	specularColor?: ArrayOfNumber;
}

type MaterialSet = { [matName: string]: Material };

interface TriangleSoup {
	elementCount: number;
	vertexes: ArrayOfNumber;
	normals?: ArrayOfNumber;
	uvs?: ArrayOfNumber;
}


function parseLWMaterialSource(text: string): MaterialSet {
	var lines = text.split("\n");
	var materials: MaterialSet = {};
	var curMat: Material = null;
	
	lines.forEach(function(line) {
		var tokens = line.split(" ");
		switch (tokens[0]) {
			case "newmtl":
				curMat = materials[tokens[1]] = {};
				break;
			case "Ka":
				curMat.ambientColor = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
				break;
			case "Kd":
				curMat.diffuseColor = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
				break;
			case "Ks":
				curMat.specularColor = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
				break;
			default:
				break;
		}
	});

	return materials;
}


interface LWObjectData extends TriangleSoup {
	mtlFileName: string;
}


function parseLWObjectSource(text: string): LWObjectData {
	var t0 = performance.now();
	var lines = text.split("\n");
	var vv: number[][] = [], nn: number[][] = [], tt: number[][] = [];
	var vertexes: number[] = [], normals: number[] = [], uvs: number[] = [];
	var mtlFileName = "";
	
	function vtx(vx: number, tx: number, nx: number) {
		assert(vx < vv.length, "vx out of bounds " + vx);
		assert(nx < nn.length, "nx out of bounds " + nx);

		var v = vv[vx],
			n = nn[nx],
			t = tx > -1 ? tt[tx] : null;

		vertexes.push(v[0], v[1], v[2]);
		normals.push(n[0], n[1], n[2]);

		if (t) {
			assert(tx < tt.length, "tx out of bounds " + tx);
			uvs.push(t[0], t[1]);
		}
	}

	// convert a face index to zero-based int or -1 for empty index	
	function fxtoi(fx: string) {return (+fx) - 1;}
	
	lines.forEach((line) => {
		var tokens = line.split(" ");
		switch (tokens[0]) {
			case "mtllib":
				mtlFileName = tokens[1];
				break;
			case "v":
				vv.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
				break;
			case "vn":
				nn.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
				break;
			case "vt":
				tt.push([parseFloat(tokens[1]), parseFloat(tokens[2])]);
				break;
			case "f":
				vtx.apply(null, tokens[1].split("/").map(fxtoi));
				vtx.apply(null, tokens[2].split("/").map(fxtoi));
				vtx.apply(null, tokens[3].split("/").map(fxtoi));
				break;

			default: break;
		}
	});

	var t1 = performance.now();
	console.info("obj v:", vertexes.length / 3, "n:", normals.length / 3, "t:", uvs.length / 2, "took:", (t1-t0).toFixed(2), "ms");
	
	return {
		mtlFileName: mtlFileName,
		elementCount: vertexes.length / 3,
		vertexes: vertexes,
		normals: normals,
		uvs: uvs.length ? uvs : null
	};
}


function loadLWMaterialFile(filePath: string): Promise<MaterialSet> {
	return loadFile(filePath).then(
		function(text: string) {
			return parseLWMaterialSource(text);
		}
	);
}


function loadLWObjectFile(filePath: string) : Promise<TriangleSoup> {
	var mtlResolve: any = null;
	var mtlProm = new Promise<MaterialSet>(function(resolve) {
		mtlResolve = resolve;
	});
	
	var objProm = loadFile(filePath).then(
		function(text: string) {
			return parseLWObjectSource(text);
		}
	).then(
		function(objData: LWObjectData) {
			assert(objData.mtlFileName.length > 0, "no MTL file?");
			var mtlFilePath = filePath.substr(0, filePath.lastIndexOf("/") + 1) + objData.mtlFileName;
			loadLWMaterialFile(mtlFilePath).then(
				function(materials: MaterialSet) {
					mtlResolve(materials);
				}
			);
			return objData;
		}
	);
	
	return Promise.all<any>([mtlProm, objProm]).then(
		function(values) {
			var materials = values[0];
			var obj = values[1];
			obj.materials = materials;
			return obj;
		}
	);
}
