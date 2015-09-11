// libzm3d.js - 3d structures, files, generators
// requires libzm.js
// (c) 2015 by Arthur Langereis - @zenmumbler

function parseLWObj(text) {
	var t0 = performance.now();
	var lines = text.split("\n");
	var vv = [], nn = [], tt = [];
	var vertexes = [], normals = [], uvs = [];
	
	function vtx(vx, tx, nx) {
		assert(vx < vv.length, "vx out of bounds " + vx);
		assert(tx < tt.length, "tx out of bounds " + tx);
		assert(nx < nn.length, "nx out of bounds " + nx);

		var v = vv[vx],
			t = tx > -1 ? tt[tx] : null,
			n = nn[nx];

		vertexes.push(v[0], v[1], v[2]);
		normals.push(n[0], n[1], n[2]);
		if (t)
			uvs.push(t[0], t[1]);
	}

	// convert a face index to zero-based int or -1 for empty index	
	function fxtoi(fx) {return (+fx) - 1;}
	
	lines.forEach(function(line) {
		var tokens = line.split(" ");
		switch (tokens[0]) {
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
	
	return { elements: vertexes.length / 3, vertexes: vertexes, normals: normals, uvs: uvs };
}


function loadLWObjFile(filePath) {
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", filePath);

		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4) return;
			assert(xhr.status == 200 || xhr.status == 0);

			var data = parseLWObj(xhr.responseText);
			resolve(data);
		};

		xhr.onerror = function() {
			assert(false, filePath + " doesn't exist");
		};

		xhr.send();
	});
}
