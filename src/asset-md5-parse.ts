// asset-md5-parse.ts - MD5 mesh and anim tokenizer and parsers
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset.md5.parse {

	const enum TokenType {
		Invalid,
		EOF,

		Key,
		String,
		Number,

		OpenBlock,
		CloseBlock,
		OpenVector,
		CloseVector
	}


	interface Token {
		type: TokenType;
		offset: number;
		val?: string | number;
	}


	class MD5Tokenizer {
		private offset_ = -1;
		private length_ = 0;
		private lastChar_ = "";

		constructor(private source: string) {
			this.length_ = source.length;
		}

		private nextChar() {
			this.offset_++;
			if (this.offset_ < this.length_) {
				this.lastChar_ = this.source[this.offset_];
			}
			else {
				this.lastChar_ = null;
			}

			return this.lastChar_;
		}


		private skipWS() {
			var c: string;
			while (c = this.nextChar()) {
				if (c != ' ' && c != '\t' && c != '\r' && c != '\n')
					break;
			}
		}


		private skipToLineEnd() {
			var c: string;
			while (c = this.nextChar()) {
				if (c == '\r' || c == '\n')
					break;
			}
		}

		get offset() { return this.offset_; }
		get length() { return this.length_; }
		get eof() { return this.offset_ >= this.length_; }

		nextToken(): Token {
			this.skipWS();
			if (this.offset_ >= this.length_) {
				this.offset_ = this.length_;
				return {
					type: TokenType.EOF,
					offset: this.length_
				};
			}

			var tokenStart = this.offset_;
			var tokenEnd = 0;
			var c = this.lastChar_;

			var invalid = (): Token => {
				return {
					type: TokenType.Invalid,
					offset: tokenStart,
					val: this.source.substring(tokenStart, tokenEnd + 1)
				};
			};

			if (c == '/') {
				let cc = this.nextChar();
				if (cc == '/') {
					// single-line comment
					this.skipToLineEnd();
					return this.nextToken();
				}
				else {
					return invalid();
				}
			}
			else if (c == '"') {
				// string literal, there are no escape sequences or other fanciness
				while (c = this.nextChar()) {
					if (c == '"' || c == '\r' || c == '\n')
						break;
				}
				tokenEnd = this.offset_;

				if (c != '"') {
					return invalid();
				}
				else {
					return {
						type: TokenType.String,
						offset: tokenStart,
						val: this.source.substring(tokenStart + 1, tokenEnd)
					};
				}
			}
			else if (c == '{') {
				return {
					type: TokenType.OpenBlock,
					offset: tokenStart
				};
			}
			else if (c == '}') {
				return {
					type: TokenType.CloseBlock,
					offset: tokenStart
				};
			}
			else if (c == '(') {
				return {
					type: TokenType.OpenVector,
					offset: tokenStart
				};
			}
			else if (c == ')') {
				return {
					type: TokenType.CloseVector,
					offset: tokenStart
				};
			}
			else {
				// find end of token based on break-chars
				let firstChar = c;
				while (c = this.nextChar()) {
					if (c == ' ' || c == '\t' || c == '\r' || c == '\n' || c == ',' || c == '{' || c == '}' || c == '(' || c == ')' || c == '"')
						break;
				}

				// rewind 1 pos to allow non-ws breaking chars to be separate tokens
				tokenEnd = this.offset_;
				this.offset_--;
				let token = this.source.substring(tokenStart, tokenEnd);

				if ((firstChar >= 'A' && firstChar <= 'Z') || (firstChar >= 'a' && firstChar <= 'z')) {
					// unquoted strings starting with an alpha char are keys
					return {
						type: TokenType.Key,
						offset: tokenStart,
						val: token.substr(0, token.length).toLowerCase() // assuming MD5 keys are case-insensitive
					};
				}
				else if (firstChar == '-' || (firstChar >= '0' && firstChar <= '9')) {
					// numbers are either ints or floats
					let number = parseFloat(token);
					if (isNaN(number)) {
						return invalid();
					}
					return {
						type: TokenType.Number,
						offset: tokenStart,
						val: number
					};
				}
				else {
					return invalid();
				}
			}
		}
	}


	export interface MD5ParserDelegate {
		error(msg: string, offset: number, token?: string): void;
		completed(): void;
	}


	class MD5Parser {
		private tokenizer_: MD5Tokenizer;
		private stop_ = false;

		constructor(source: string, private delegate_: MD5ParserDelegate) {
			this.tokenizer_ = new MD5Tokenizer(source);
		}


		unexpected(token: Token, message?: string) {
			if (!message) {
				message = (token.type == TokenType.Invalid) ? "Invalid token" : "Unexpected token";
			}
			this.delegate_.error(message, token.offset, token.val && token.val.toString());
			this.stop_ = true;
		}


		expectNext(tokenType: TokenType, tokenVal?: number | string): Token {
			var token = this.tokenizer_.nextToken();
			if (token.type == TokenType.EOF) {
				this.stop_ = true;
			}
			if (token.type == tokenType) {
				if (tokenVal === undefined || tokenVal === token.val) {
					return token;
				}
			}

			this.unexpected(token);
			return null;
		}


		nextToken(): Token {
			var token = this.tokenizer_.nextToken()
			if (token.type == TokenType.EOF) {
				this.stop_ = true;
			}
			return token;
		}


		get offset() { return this.tokenizer_.offset; }
		get eof() { return this.tokenizer_.eof; }
		get stop() { return this.stop_; }
	}


	// Note: this is NOT the same as the quat.calculateW function
	export function computeQuatW(q: Float4) {
		var t = 1.0 - (q[0] * q[0]) - (q[1] * q[1]) - (q[2] * q[2]);

		if (t < 0.0)
			q[3] = 0.0;
		else
			q[3] = -Math.sqrt(t);
	}


	export interface MD5MeshDelegate extends MD5ParserDelegate {
		jointCount(count: number): void;
		beginJoints(): void;
		joint(name: string, index: number, parentIndex: number, modelPos: Float3, modelRot: Float4): void;
		endJoints(): void;

		meshCount(count: number): void;
		beginMesh(): void;

		materialName(name: string): void;

		vertexCount(count: number): void;
		vertex(index: number, uv: Float2, weightOffset: number, weightCount: number): void;

		triangleCount(count: number): void;
		triangle(index: number, indexes: Float3): void;

		weightCount(count: number): void;
		weight(index: number, jointIndex: number, bias: number, jointPos: Float3): void;

		endMesh(): void;
	}


	export class MD5MeshParser {
		private meshCount_ = 0;
		private jointCount_ = 0;
		private parser_: MD5Parser;

		constructor(source: string, private delegate_: MD5MeshDelegate) {
			this.parser_ = new MD5Parser(source, delegate_);
		}


		private parseMeshVertices(count: number) {
			while (!this.parser_.stop && count > 0) {
				if (this.parser_.expectNext(TokenType.Key, "vert")) {
					var index = this.parser_.expectNext(TokenType.Number);

					if (index && this.parser_.expectNext(TokenType.OpenVector)) {
						var texU = this.parser_.expectNext(TokenType.Number);
						var texV = this.parser_.expectNext(TokenType.Number);

						if (texU && texV && this.parser_.expectNext(TokenType.CloseVector)) {
							var weightOffset = this.parser_.expectNext(TokenType.Number);
							var weightCount = this.parser_.expectNext(TokenType.Number);

							if (weightOffset && weightCount) {
								var uv = [<number>texU.val, <number>texV.val];
								this.delegate_.vertex(<number>index.val | 0, uv, <number>weightOffset.val | 0, <number>weightCount.val | 0);
							}
						}
					}
				}

				--count;
			}
		}


		private parseMeshTriangles(count: number) {
			while (!this.parser_.stop && count > 0) {
				if (this.parser_.expectNext(TokenType.Key, "tri")) {
					var index = this.parser_.expectNext(TokenType.Number);
					var a = this.parser_.expectNext(TokenType.Number);
					var b = this.parser_.expectNext(TokenType.Number);
					var c = this.parser_.expectNext(TokenType.Number);

					if (index && a && b && c) {
						var points = [<number>a.val | 0, <number>b.val | 0, <number>c.val | 0];
						this.delegate_.triangle(<number>index.val | 0, points);
					}
				}

				--count;
			}
		}


		private parseMeshWeights(count: number) {
			while (!this.parser_.stop && count > 0) {
				if (this.parser_.expectNext(TokenType.Key, "weight")) {
					var index = this.parser_.expectNext(TokenType.Number);
					var jointIndex = this.parser_.expectNext(TokenType.Number);
					var bias = this.parser_.expectNext(TokenType.Number);

					if (index && jointIndex && bias && this.parser_.expectNext(TokenType.OpenVector)) {
						var posX = this.parser_.expectNext(TokenType.Number);
						var posY = this.parser_.expectNext(TokenType.Number);
						var posZ = this.parser_.expectNext(TokenType.Number);

						if (posX && posY && posZ && this.parser_.expectNext(TokenType.CloseVector)) {
							var pos = [<number>posX.val, <number>posY.val, <number>posZ.val];
							this.delegate_.weight(<number>index.val | 0, <number>jointIndex.val | 0, <number>bias.val, pos);
						}
					}
				}

				--count;
			}
		}


		private parseMesh() {
			if (--this.meshCount_ < 0) {
				this.delegate_.error("Too many meshes in file", this.parser_.offset);
				return;
			}

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				var cmdN: Token;
				do {
					cmdN = this.parser_.nextToken();

					if (cmdN.type == TokenType.Key) {
						var cmd = cmdN && <string>cmdN.val;

						if (cmd == "shader") {
							var shader = this.parser_.expectNext(TokenType.String);
							if (shader) {
								this.delegate_.materialName(<string>shader.val);
							}
						}
						else if (cmd == "numverts") {
							let vertCount = this.parser_.expectNext(TokenType.Number);
							if (vertCount) {
								let vc = <number>vertCount.val | 0;
								this.delegate_.vertexCount(vc);
								this.parseMeshVertices(vc);
							}
						}
						else if (cmd == "numtris") {
							let triCount = this.parser_.expectNext(TokenType.Number);
							if (triCount) {
								let tc = <number>triCount.val | 0;
								this.delegate_.triangleCount(tc);
								this.parseMeshTriangles(tc);
							}
						}
						else if (cmd == "numweights") {
							let weightCount = this.parser_.expectNext(TokenType.Number);
							if (weightCount) {
								let wc = <number>weightCount.val | 0;
								this.delegate_.weightCount(wc);
								this.parseMeshWeights(wc);
							}
						}
						else {
							console.warn("Unknown command in mesh: `" + cmd + "`");
						}
					}
					else if (cmdN && cmdN.type != TokenType.CloseBlock) {
						this.parser_.unexpected(cmdN);
					}
				} while (!this.parser_.stop && cmdN.type != TokenType.CloseBlock);
			}
		}

		private parseJoints() {
			var maxParentIndex = this.jointCount_ - 2;
			var index = 0;

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (this.jointCount_ > 0 && !this.parser_.stop) {
					var name = this.parser_.expectNext(TokenType.String);
					var parentIndex = this.parser_.expectNext(TokenType.Number);

					if (name && parentIndex && this.parser_.expectNext(TokenType.OpenVector)) {
						var posX = this.parser_.expectNext(TokenType.Number);
						var posY = this.parser_.expectNext(TokenType.Number);
						var posZ = this.parser_.expectNext(TokenType.Number);

						if (posX && posY && posZ && this.parser_.expectNext(TokenType.CloseVector) && this.parser_.expectNext(TokenType.OpenVector)) {
							var quatX = this.parser_.expectNext(TokenType.Number);
							var quatY = this.parser_.expectNext(TokenType.Number);
							var quatZ = this.parser_.expectNext(TokenType.Number);

							if (quatX && quatY && quatZ && this.parser_.expectNext(TokenType.CloseVector)) {
								var pos = [<number>posX.val, <number>posY.val, <number>posZ.val];
								var rot = [<number>quatX.val, <number>quatY.val, <number>quatZ.val, 0];
								computeQuatW(rot);

								var parent = <number>parentIndex.val;
								if (parent < -1 || parent > maxParentIndex) {
									this.parser_.unexpected(parentIndex, "Invalid parent index");
								}
								else {
									this.delegate_.joint(<string>name.val, index, parent, pos, rot);
									--this.jointCount_;
									++index;
								}
							}
						}
					}
				}

				if (this.jointCount_ == 0) {
					this.parser_.expectNext(TokenType.CloseBlock);
				}
			}
		}


		parse() {
			while (!this.parser_.stop) {
				var key = this.parser_.nextToken();
				if (key.type == TokenType.Key) {
					if (key.val == "mesh") {
						this.delegate_.beginMesh();
						this.parseMesh();
						if (!this.parser_.stop) {
							this.delegate_.endMesh();
						}
					}
					else if (key.val == "joints") {
						this.delegate_.beginJoints();
						this.parseJoints();
						if (!this.parser_.stop) {
							this.delegate_.endJoints();
						}
					}
					else if (key.val == "numjoints") {
						let count = this.parser_.expectNext(TokenType.Number);
						this.jointCount_ = <number>count.val | 0;
						this.delegate_.jointCount(this.jointCount_);
					}
					else if (key.val == "nummeshes") {
						let count = this.parser_.expectNext(TokenType.Number);
						this.meshCount_ = <number>count.val | 0;
						this.delegate_.meshCount(this.meshCount_);
					}
					else if (key.val == "md5version" || key.val == "commandline") {
						// ignore these directives
						this.parser_.nextToken();
					}
				}
				else if (key.type != TokenType.EOF) {
					this.parser_.unexpected(key);
				}
			}

			if (this.parser_.eof && (this.jointCount_ > 0 || this.meshCount_ > 0)) {
				this.parser_.unexpected({ type: TokenType.EOF, offset: this.parser_.offset }, "Unexpected eof with more meshes and/or joints expected.");
			}
			else {
				this.delegate_.completed();
			}
		}
	}


	export const enum MD5AnimMask {
		PosX = 1,
		PosY = 2,
		PosZ = 4,
		QuatX = 8,
		QuatY = 16,
		QuatZ = 32
	}


	export interface MD5AnimDelegate extends MD5ParserDelegate {
		frameCount(count: number): void;
		jointCount(count: number): void;
		frameRate(fps: number): void;
		frameComponentCount(count: number): void;

		beginHierarchy(): void;
		joint(name: string, index: number, parentIndex: number, animMask: MD5AnimMask, componentOffset: number): void;
		endHierarchy(): void;

		beginBoundingBoxes(): void;
		bounds(frameIndex: number, min: Float3, max: Float3): void;
		endBoundingBoxes(): void;

		beginBaseFrame(): void;
		baseJoint(index: number, jointPos: Float3, jointRot: Float4): void;
		endBaseFrame(): void;

		frame(index: number, components: Float32Array): void;
	}


	export class MD5AnimParser {
		private jointCount_ = -1;
		private baseJointCount_ = -1;
		private frameCount_ = -1;
		private boundsCount_ = -1;
		private frameComponentCount_ = -1;
		private parser_: MD5Parser;

		constructor(source: string, private delegate_: MD5AnimDelegate) {
			this.parser_ = new MD5Parser(source, delegate_);
		}


		private parseHierarchy() {
			var maxParentIndex = this.jointCount_ - 2;
			var index = 0;

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (!this.parser_.stop && this.jointCount_ > 0) {
					var nameTok = this.parser_.expectNext(TokenType.String);
					var parentTok = this.parser_.expectNext(TokenType.Number);
					var maskTok = this.parser_.expectNext(TokenType.Number);
					var offsetTok = this.parser_.expectNext(TokenType.Number);

					if (nameTok && parentTok && maskTok && offsetTok) {
						var parent = <number>parentTok.val | 0;
						var mask = <number>maskTok.val | 0;
						var offset = <number>offsetTok.val | 0;

						if (parent < -1 || parent > maxParentIndex) {
							this.parser_.unexpected(parentTok, "Invalid parent index");
						}
						else if (mask < 0 || mask > 63) {
							this.parser_.unexpected(parentTok, "Invalid component mask");
						}
						else if (offset < 0 || offset >= this.frameComponentCount_) {
							this.parser_.unexpected(parentTok, "Invalid component offset");
						}
						else {
							this.delegate_.joint(<string>nameTok.val, index, parent, mask, offset);
							--this.jointCount_;
							++index;
						}
					}
				}

				if (this.jointCount_ == 0) {
					this.parser_.expectNext(TokenType.CloseBlock);
				}
			}
		}


		private parseVec3() {
			if (this.parser_.expectNext(TokenType.OpenVector)) {
				var a = this.parser_.expectNext(TokenType.Number);
				var b = this.parser_.expectNext(TokenType.Number);
				var c = this.parser_.expectNext(TokenType.Number);

				if (a && b && c && this.parser_.expectNext(TokenType.CloseVector)) {
					return [<number>a.val, <number>b.val, <number>c.val];
				}
			}
			return null;
		}


		private parseBounds() {
			var index = 0;

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (this.boundsCount_ > 0 && !this.parser_.stop) {
					var min = this.parseVec3();
					var max = this.parseVec3();

					if (min && max) {
						this.delegate_.bounds(index, min, max);
						++index;
						--this.boundsCount_;
					}
				}

				if (this.boundsCount_ == 0) {
					this.parser_.expectNext(TokenType.CloseBlock);
				}
			}
		}


		private parseBaseFrame() {
			var index = 0;

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (this.baseJointCount_ > 0 && !this.parser_.stop) {
					var pos = this.parseVec3();
					var rot = this.parseVec3();

					if (pos && rot) {
						computeQuatW(rot);
						this.delegate_.baseJoint(index, pos, rot);
						++index;
						--this.baseJointCount_;
					}
				}

				if (this.baseJointCount_ == 0) {
					this.parser_.expectNext(TokenType.CloseBlock);
				}
			}
		}


		private parseFrame(frameIndex: number) {
			var index = 0;
			var data = new Float32Array(this.frameComponentCount_);

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (index < this.frameComponentCount_ && !this.parser_.stop) {
					var c = this.parser_.expectNext(TokenType.Number);
					if (c) {
						data[index] = <number>c.val;
						++index;
					}
				}

				if (index == this.frameComponentCount_) {
					if (this.parser_.expectNext(TokenType.CloseBlock)) {
						this.delegate_.frame(frameIndex, data);
						--this.frameCount_;
					}
				}
			}
		}


		parse() {
			while (!this.parser_.stop) {
				var key = this.parser_.nextToken();
				if (key.type == TokenType.Key) {
					if (key.val == "frame") {
						let frameIndex = this.parser_.expectNext(TokenType.Number);
						if (frameIndex) {
							this.parseFrame(<number>frameIndex.val);
						}
					}
					else if (key.val == "hierarchy") {
						this.delegate_.beginHierarchy();
						this.parseHierarchy();
						if (!this.parser_.stop) {
							this.delegate_.endHierarchy();
						}
					}
					else if (key.val == "bounds") {
						this.delegate_.beginBoundingBoxes();
						this.parseBounds();
						if (!this.parser_.stop) {
							this.delegate_.endBoundingBoxes();
						}
					}
					else if (key.val == "baseframe") {
						this.delegate_.beginBaseFrame();
						this.parseBaseFrame();
						if (!this.parser_.stop) {
							this.delegate_.endBaseFrame();
						}
					}
					else if (key.val == "numjoints") {
						let count = this.parser_.expectNext(TokenType.Number);
						if (count) {
							this.jointCount_ = <number>count.val | 0;
							this.baseJointCount_ = this.jointCount_;
							this.delegate_.jointCount(this.jointCount_);
						}
					}
					else if (key.val == "numframes") {
						let count = this.parser_.expectNext(TokenType.Number);
						if (count) {
							this.frameCount_ = <number>count.val | 0;
							this.boundsCount_ = this.frameCount_;
							this.delegate_.frameCount(this.frameCount_);
						}
					}
					else if (key.val == "framerate") {
						let fps = this.parser_.expectNext(TokenType.Number);
						if (fps) {
							this.delegate_.frameRate(<number>fps.val);
						}
					}
					else if (key.val == "numanimatedcomponents") {
						let count = this.parser_.expectNext(TokenType.Number);
						if (count) {
							this.frameComponentCount_ = <number>count.val | 0;
							this.delegate_.frameComponentCount(this.frameComponentCount_);
						}
					}
					else if (key.val == "md5version" || key.val == "commandline") {
						// ignore these directives and their single values
						this.parser_.nextToken();
					}
				}
				else if (key.type != TokenType.EOF) {
					this.parser_.unexpected(key);
				}
			}

			if (this.parser_.eof && (this.jointCount_ != 0 || this.frameCount_ != 0 || this.boundsCount_ != 0 || this.baseJointCount_ != 0)) {
				this.parser_.unexpected({ type: TokenType.EOF, offset: this.parser_.offset }, "Unexpected eof or malformed file.");
			}
			else {
				this.delegate_.completed();
			}
		}
	}

} // ns sd.asset.md5.parse
