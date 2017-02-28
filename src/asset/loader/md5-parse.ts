// asset/loader/md5-parse - MD5 mesh and anim tokenizer and parsers
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

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
		private lastChar_: string | null = "";

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
			let c: string | null;
			while (c = this.nextChar()) {
				if (c != " " && c != "\t" && c != "\r" && c != "\n") {
					break;
				}
			}
		}


		private skipToLineEnd() {
			let c: string | null;
			while (c = this.nextChar()) {
				if (c == "\r" || c == "\n") {
					break;
				}
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

			const tokenStart = this.offset_;
			let tokenEnd = 0;
			let c = this.lastChar_;

			const invalid = (): Token => {
				return {
					type: TokenType.Invalid,
					offset: tokenStart,
					val: this.source.substring(tokenStart, tokenEnd + 1)
				};
			};

			if (c == "/") {
				const cc = this.nextChar();
				if (cc == "/") {
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
					if (c == '"' || c == "\r" || c == "\n") {
						break;
					}
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
			else if (c == "{") {
				return {
					type: TokenType.OpenBlock,
					offset: tokenStart
				};
			}
			else if (c == "}") {
				return {
					type: TokenType.CloseBlock,
					offset: tokenStart
				};
			}
			else if (c == "(") {
				return {
					type: TokenType.OpenVector,
					offset: tokenStart
				};
			}
			else if (c == ")") {
				return {
					type: TokenType.CloseVector,
					offset: tokenStart
				};
			}
			else {
				// find end of token based on break-chars
				const firstChar = c;
				while (c = this.nextChar()) {
					if (c == " " || c == "\t" || c == "\r" || c == "\n" || c == "," || c == "{" || c == "}" || c == "(" || c == ")" || c == '"') {
						break;
					}
				}

				// rewind 1 pos to allow non-ws breaking chars to be separate tokens
				tokenEnd = this.offset_;
				this.offset_--;
				const token = this.source.substring(tokenStart, tokenEnd);

				if (firstChar !== null) {
					if ((firstChar >= "A" && firstChar <= "Z") || (firstChar >= "a" && firstChar <= "z")) {
						// unquoted strings starting with an alpha char are keys
						return {
							type: TokenType.Key,
							offset: tokenStart,
							val: token.substr(0, token.length).toLowerCase() // assuming MD5 keys are case-insensitive
						};
					}
					else if (firstChar == "-" || (firstChar >= "0" && firstChar <= "9")) {
						// numbers are either ints or floats
						const num = parseFloat(token);
						if (isNaN(num)) {
							return invalid();
						}
						return {
							type: TokenType.Number,
							offset: tokenStart,
							val: num
						};
					}
				}

				return invalid();
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
			if (! message) {
				message = (token.type == TokenType.Invalid) ? "Invalid token" : "Unexpected token";
			}
			this.delegate_.error(message, token.offset, token.val !== undefined ? token.val.toString() : undefined);
			this.stop_ = true;
		}


		expectNext(tokenType: TokenType, tokenVal?: number | string): Token | null {
			const token = this.tokenizer_.nextToken();
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
			const token = this.tokenizer_.nextToken();
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
		const t = 1.0 - (q[0] * q[0]) - (q[1] * q[1]) - (q[2] * q[2]);

		if (t < 0.0) {
			q[3] = 0.0;
		}
		else {
			q[3] = -Math.sqrt(t);
		}
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
			while (! this.parser_.stop && count > 0) {
				if (this.parser_.expectNext(TokenType.Key, "vert")) {
					const index = this.parser_.expectNext(TokenType.Number);

					if (index && this.parser_.expectNext(TokenType.OpenVector)) {
						const texU = this.parser_.expectNext(TokenType.Number);
						const texV = this.parser_.expectNext(TokenType.Number);

						if (texU && texV && this.parser_.expectNext(TokenType.CloseVector)) {
							const weightOffset = this.parser_.expectNext(TokenType.Number);
							const weightCount = this.parser_.expectNext(TokenType.Number);

							if (weightOffset && weightCount) {
								const uv = [<number>texU.val, <number>texV.val];
								this.delegate_.vertex(<number>index.val | 0, uv, <number>weightOffset.val | 0, <number>weightCount.val | 0);
							}
						}
					}
				}

				--count;
			}
		}


		private parseMeshTriangles(count: number) {
			while (! this.parser_.stop && count > 0) {
				if (this.parser_.expectNext(TokenType.Key, "tri")) {
					const index = this.parser_.expectNext(TokenType.Number);
					const a = this.parser_.expectNext(TokenType.Number);
					const b = this.parser_.expectNext(TokenType.Number);
					const c = this.parser_.expectNext(TokenType.Number);

					if (index && a && b && c) {
						const points = [<number>a.val | 0, <number>b.val | 0, <number>c.val | 0];
						this.delegate_.triangle(<number>index.val | 0, points);
					}
				}

				--count;
			}
		}


		private parseMeshWeights(count: number) {
			while (! this.parser_.stop && count > 0) {
				if (this.parser_.expectNext(TokenType.Key, "weight")) {
					const index = this.parser_.expectNext(TokenType.Number);
					const jointIndex = this.parser_.expectNext(TokenType.Number);
					const bias = this.parser_.expectNext(TokenType.Number);

					if (index && jointIndex && bias && this.parser_.expectNext(TokenType.OpenVector)) {
						const posX = this.parser_.expectNext(TokenType.Number);
						const posY = this.parser_.expectNext(TokenType.Number);
						const posZ = this.parser_.expectNext(TokenType.Number);

						if (posX && posY && posZ && this.parser_.expectNext(TokenType.CloseVector)) {
							const pos = [<number>posX.val, <number>posY.val, <number>posZ.val];
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
				let cmdN: Token;
				do {
					cmdN = this.parser_.nextToken();

					if (cmdN.type == TokenType.Key) {
						const cmd = cmdN && <string>cmdN.val;

						if (cmd == "shader") {
							const shader = this.parser_.expectNext(TokenType.String);
							if (shader) {
								this.delegate_.materialName(<string>shader.val);
							}
						}
						else if (cmd == "numverts") {
							const vertCount = this.parser_.expectNext(TokenType.Number);
							if (vertCount) {
								const vc = <number>vertCount.val | 0;
								this.delegate_.vertexCount(vc);
								this.parseMeshVertices(vc);
							}
						}
						else if (cmd == "numtris") {
							const triCount = this.parser_.expectNext(TokenType.Number);
							if (triCount) {
								const tc = <number>triCount.val | 0;
								this.delegate_.triangleCount(tc);
								this.parseMeshTriangles(tc);
							}
						}
						else if (cmd == "numweights") {
							const weightCount = this.parser_.expectNext(TokenType.Number);
							if (weightCount) {
								const wc = <number>weightCount.val | 0;
								this.delegate_.weightCount(wc);
								this.parseMeshWeights(wc);
							}
						}
						else {
							console.warn(`Unknown command in mesh: '${cmd}'`);
						}
					}
					else if (cmdN && cmdN.type != TokenType.CloseBlock) {
						this.parser_.unexpected(cmdN);
					}
				} while (! this.parser_.stop && cmdN.type != TokenType.CloseBlock);
			}
		}


		private parseJoints() {
			const maxParentIndex = this.jointCount_ - 2;
			let index = 0;

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (this.jointCount_ > 0 && ! this.parser_.stop) {
					const name = this.parser_.expectNext(TokenType.String);
					const parentIndex = this.parser_.expectNext(TokenType.Number);

					if (name && parentIndex && this.parser_.expectNext(TokenType.OpenVector)) {
						const posX = this.parser_.expectNext(TokenType.Number);
						const posY = this.parser_.expectNext(TokenType.Number);
						const posZ = this.parser_.expectNext(TokenType.Number);

						if (posX && posY && posZ && this.parser_.expectNext(TokenType.CloseVector) && this.parser_.expectNext(TokenType.OpenVector)) {
							const quatX = this.parser_.expectNext(TokenType.Number);
							const quatY = this.parser_.expectNext(TokenType.Number);
							const quatZ = this.parser_.expectNext(TokenType.Number);

							if (quatX && quatY && quatZ && this.parser_.expectNext(TokenType.CloseVector)) {
								const pos = [<number>posX.val, <number>posY.val, <number>posZ.val];
								const rot = [<number>quatX.val, <number>quatY.val, <number>quatZ.val, 0];
								computeQuatW(rot);

								const parent = <number>parentIndex.val;
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
			while (! this.parser_.stop) {
				const key = this.parser_.nextToken();
				if (key.type == TokenType.Key) {
					if (key.val == "mesh") {
						this.delegate_.beginMesh();
						this.parseMesh();
						if (! this.parser_.stop) {
							this.delegate_.endMesh();
						}
					}
					else if (key.val == "joints") {
						this.delegate_.beginJoints();
						this.parseJoints();
						if (! this.parser_.stop) {
							this.delegate_.endJoints();
						}
					}
					else if (key.val == "numjoints") {
						const count = this.parser_.expectNext(TokenType.Number);
						if (count) {
							this.jointCount_ = <number>count.val | 0;
							this.delegate_.jointCount(this.jointCount_);
						}
					}
					else if (key.val == "nummeshes") {
						const count = this.parser_.expectNext(TokenType.Number);
						if (count) {
							this.meshCount_ = <number>count.val | 0;
							this.delegate_.meshCount(this.meshCount_);
						}
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
			const maxParentIndex = this.jointCount_ - 2;
			let index = 0;

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (! this.parser_.stop && this.jointCount_ > 0) {
					const nameTok = this.parser_.expectNext(TokenType.String);
					const parentTok = this.parser_.expectNext(TokenType.Number);
					const maskTok = this.parser_.expectNext(TokenType.Number);
					const offsetTok = this.parser_.expectNext(TokenType.Number);

					if (nameTok && parentTok && maskTok && offsetTok) {
						const parent = <number>parentTok.val | 0;
						const mask = <number>maskTok.val | 0;
						const offset = <number>offsetTok.val | 0;

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
				const a = this.parser_.expectNext(TokenType.Number);
				const b = this.parser_.expectNext(TokenType.Number);
				const c = this.parser_.expectNext(TokenType.Number);

				if (a && b && c && this.parser_.expectNext(TokenType.CloseVector)) {
					return [<number>a.val, <number>b.val, <number>c.val];
				}
			}
			return null;
		}


		private parseBounds() {
			let index = 0;

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (this.boundsCount_ > 0 && ! this.parser_.stop) {
					const min = this.parseVec3();
					const max = this.parseVec3();

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
			let index = 0;

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (this.baseJointCount_ > 0 && ! this.parser_.stop) {
					const pos = this.parseVec3();
					const rot = this.parseVec3();

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
			let index = 0;
			const data = new Float32Array(this.frameComponentCount_);

			if (this.parser_.expectNext(TokenType.OpenBlock)) {
				while (index < this.frameComponentCount_ && ! this.parser_.stop) {
					const c = this.parser_.expectNext(TokenType.Number);
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
			while (! this.parser_.stop) {
				const key = this.parser_.nextToken();
				if (key.type == TokenType.Key) {
					if (key.val == "frame") {
						const frameIndex = this.parser_.expectNext(TokenType.Number);
						if (frameIndex) {
							this.parseFrame(<number>frameIndex.val);
						}
					}
					else if (key.val == "hierarchy") {
						this.delegate_.beginHierarchy();
						this.parseHierarchy();
						if (! this.parser_.stop) {
							this.delegate_.endHierarchy();
						}
					}
					else if (key.val == "bounds") {
						this.delegate_.beginBoundingBoxes();
						this.parseBounds();
						if (! this.parser_.stop) {
							this.delegate_.endBoundingBoxes();
						}
					}
					else if (key.val == "baseframe") {
						this.delegate_.beginBaseFrame();
						this.parseBaseFrame();
						if (! this.parser_.stop) {
							this.delegate_.endBaseFrame();
						}
					}
					else if (key.val == "numjoints") {
						const count = this.parser_.expectNext(TokenType.Number);
						if (count) {
							this.jointCount_ = <number>count.val | 0;
							this.baseJointCount_ = this.jointCount_;
							this.delegate_.jointCount(this.jointCount_);
						}
					}
					else if (key.val == "numframes") {
						const count = this.parser_.expectNext(TokenType.Number);
						if (count) {
							this.frameCount_ = <number>count.val | 0;
							this.boundsCount_ = this.frameCount_;
							this.delegate_.frameCount(this.frameCount_);
						}
					}
					else if (key.val == "framerate") {
						const fps = this.parser_.expectNext(TokenType.Number);
						if (fps) {
							this.delegate_.frameRate(<number>fps.val);
						}
					}
					else if (key.val == "numanimatedcomponents") {
						const count = this.parser_.expectNext(TokenType.Number);
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
