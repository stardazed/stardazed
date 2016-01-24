// math-extensions - extensions in interface and implementation for external types
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

/// <reference path="../defs/gl-matrix.d.ts" />

interface Math {
	sign(n: number): number;
}



interface quat {
	fromEuler(yaw: number, pitch: number, roll: number): Float32Array;
}

quat.fromEuler = function(yaw: number, pitch: number, roll: number) {
	var y = yaw * 0.5;
	var p = pitch * 0.5;
	var r = roll * 0.5;

	var siny = Math.sin(y), cosy = Math.cos(y);
	var sinp = Math.sin(p), cosp = Math.cos(p);
	var sinr = Math.sin(r), cosr = Math.cos(r);

	// evaluated form of 3 Quat multiplications (of yaw, pitch and roll)
	return <Float32Array>quat.normalize(new Float32Array(4), [
		sinr * cosp * cosy - cosr * sinp * siny,
		cosr * sinp * cosy + sinr * cosp * siny,
		cosr * cosp * siny - sinr * sinp * cosy,
		cosr * cosp * cosy + sinr * sinp * siny
	]);
};


//   ___ _                 
//  / __| |__ _ _ __  _ __ 
// | (__| / _` | '  \| '_ \
//  \___|_\__,_|_|_|_| .__/
//                   |_|   

interface vec2 {
	clamp(out: ArrayOfNumber, a: ArrayOfNumber, min: number, max: number): ArrayOfNumber;
	clamp(out: ArrayOfNumber, a: ArrayOfNumber, min: ArrayOfNumber, max: ArrayOfNumber): ArrayOfNumber;
	clamp01(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
}

vec2.clamp = function(out: ArrayOfNumber, a: ArrayOfNumber, min: number | ArrayOfNumber, max: number | ArrayOfNumber) {
	if (typeof min == "number") {
		out[0] = sd.math.clamp(a[0], <number>min, <number>max);
		out[1] = sd.math.clamp(a[1], <number>min, <number>max);
	}
	else {
		out[0] = sd.math.clamp(a[0], (<ArrayOfNumber>min)[0], (<ArrayOfNumber>max)[0]);
		out[1] = sd.math.clamp(a[1], (<ArrayOfNumber>min)[1], (<ArrayOfNumber>max)[1]);
	}

	return out;
};

vec2.clamp01 = function(out: ArrayOfNumber, a: ArrayOfNumber) {
	out[0] = sd.math.clamp01(a[0]);
	out[1] = sd.math.clamp01(a[1]);

	return out;
};



interface vec3 {
	clamp(out: ArrayOfNumber, a: ArrayOfNumber, min: number, max: number): ArrayOfNumber;
	clamp(out: ArrayOfNumber, a: ArrayOfNumber, min: ArrayOfNumber, max: ArrayOfNumber): ArrayOfNumber;
	clamp01(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
}

vec3.clamp = function(out: ArrayOfNumber, a: ArrayOfNumber, min: number | ArrayOfNumber, max: number | ArrayOfNumber) {
	if (typeof min == "number") {
		out[0] = sd.math.clamp(a[0], <number>min, <number>max);
		out[1] = sd.math.clamp(a[1], <number>min, <number>max);
		out[2] = sd.math.clamp(a[2], <number>min, <number>max);
	}
	else {
		out[0] = sd.math.clamp(a[0], (<ArrayOfNumber>min)[0], (<ArrayOfNumber>max)[0]);
		out[1] = sd.math.clamp(a[1], (<ArrayOfNumber>min)[1], (<ArrayOfNumber>max)[1]);
		out[2] = sd.math.clamp(a[2], (<ArrayOfNumber>min)[2], (<ArrayOfNumber>max)[2]);
	}

	return out;
};

vec3.clamp01 = function(out: ArrayOfNumber, a: ArrayOfNumber) {
	out[0] = sd.math.clamp01(a[0]);
	out[1] = sd.math.clamp01(a[1]);
	out[2] = sd.math.clamp01(a[2]);

	return out;
};



interface vec4 {
	clamp(out: ArrayOfNumber, a: ArrayOfNumber, min: number, max: number): ArrayOfNumber;
	clamp(out: ArrayOfNumber, a: ArrayOfNumber, min: ArrayOfNumber, max: ArrayOfNumber): ArrayOfNumber;
	clamp01(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
}

vec4.clamp = function(out: ArrayOfNumber, a: ArrayOfNumber, min: number | ArrayOfNumber, max: number | ArrayOfNumber) {
	if (typeof min === "number") {
		out[0] = sd.math.clamp(a[0], min, <number>max);
		out[1] = sd.math.clamp(a[1], min, <number>max);
		out[2] = sd.math.clamp(a[2], min, <number>max);
		out[3] = sd.math.clamp(a[3], min, <number>max);
	}
	else {
		out[0] = sd.math.clamp(a[0], (<ArrayOfNumber>min)[0], (<ArrayOfNumber>max)[0]);
		out[1] = sd.math.clamp(a[1], (<ArrayOfNumber>min)[1], (<ArrayOfNumber>max)[1]);
		out[2] = sd.math.clamp(a[2], (<ArrayOfNumber>min)[2], (<ArrayOfNumber>max)[2]);
		out[3] = sd.math.clamp(a[3], (<ArrayOfNumber>min)[3], (<ArrayOfNumber>max)[3]);
	}

	return out;
};

vec4.clamp01 = function(out: ArrayOfNumber, a: ArrayOfNumber) {
	out[0] = sd.math.clamp01(a[0]);
	out[1] = sd.math.clamp01(a[1]);
	out[2] = sd.math.clamp01(a[2]);
	out[3] = sd.math.clamp01(a[3]);

	return out;
};



//  __  __ _     
// |  \/  (_)_ __
// | |\/| | \ \ /
// |_|  |_|_/_\_\
//               

namespace sd.math {
	export function mix(a: number, b: number, ratio: number): number {
		return a * (1 - ratio) + b * ratio;
	}
}


interface vec2 {
	mix(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, ratio: number): ArrayOfNumber;
	mix(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, ratios: ArrayOfNumber): ArrayOfNumber;
}

vec2.mix = function(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, ratio: number | ArrayOfNumber): ArrayOfNumber {
	if (typeof ratio === "number") {
		out[0] = sd.math.mix(a[0], b[0], ratio);
		out[1] = sd.math.mix(a[1], b[1], ratio);
	}
	else {
		out[0] = sd.math.mix(a[0], b[0], ratio[0]);	
		out[1] = sd.math.mix(a[1], b[1], ratio[1]);
	}

	return out;
};


interface vec3 {
	mix(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, ratio: number): ArrayOfNumber;
	mix(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, ratios: ArrayOfNumber): ArrayOfNumber;
}

vec3.mix = function(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, ratio: number | ArrayOfNumber): ArrayOfNumber {
	if (typeof ratio === "number") {
		out[0] = sd.math.mix(a[0], b[0], ratio);
		out[1] = sd.math.mix(a[1], b[1], ratio);
		out[2] = sd.math.mix(a[2], b[2], ratio);
	}
	else {
		out[0] = sd.math.mix(a[0], b[0], ratio[0]);
		out[1] = sd.math.mix(a[1], b[1], ratio[1]);
		out[2] = sd.math.mix(a[2], b[2], ratio[2]);
	}

	return out;
};


interface vec4 {
	mix(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, ratio: number): ArrayOfNumber;
	mix(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, ratios: ArrayOfNumber): ArrayOfNumber;
}

vec4.mix = function(out: ArrayOfNumber, a: ArrayOfNumber, b: ArrayOfNumber, ratio: number | ArrayOfNumber): ArrayOfNumber {
	if (typeof ratio === "number") {
		out[0] = sd.math.mix(a[0], b[0], ratio);
		out[1] = sd.math.mix(a[1], b[1], ratio);
		out[2] = sd.math.mix(a[2], b[2], ratio);
		out[3] = sd.math.mix(a[3], b[3], ratio);
	}
	else {
		out[0] = sd.math.mix(a[0], b[0], ratio[0]);
		out[1] = sd.math.mix(a[1], b[1], ratio[1]);
		out[2] = sd.math.mix(a[2], b[2], ratio[2]);
		out[3] = sd.math.mix(a[3], b[3], ratio[3]);
	}

	return out;
};


//  ___ _           
// / __(_)__ _ _ _  
// \__ \ / _` | ' \ 
// |___/_\__, |_||_|
//       |___/      

interface vec2 {
	sign(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
}

vec2.sign = function(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber {
	out[0] = Math.sign(a[0]);
	out[1] = Math.sign(a[1]);

	return out;
};


interface vec3 {
	sign(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
}

vec3.sign = function(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber {
	out[0] = Math.sign(a[0]);
	out[1] = Math.sign(a[1]);
	out[2] = Math.sign(a[2]);

	return out;
};


interface vec4 {
	sign(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber;
}

vec4.sign = function(out: ArrayOfNumber, a: ArrayOfNumber): ArrayOfNumber {
	out[0] = Math.sign(a[0]);
	out[1] = Math.sign(a[1]);
	out[2] = Math.sign(a[2]);
	out[3] = Math.sign(a[3]);

	return out;
};

