// asset-md5.ts - MD5 file import driver
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

namespace sd.asset {

	export namespace md5 {

		export namespace parse {

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


			export interface MD5MeshDelegate {
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

				error(msg: string, offset: number, token?: string): void;
				completed(): void;
			}


			export class MD5MeshParser {
				private tokenizer_: MD5Tokenizer;
				private eof_ = false;
				private meshCount_ = 0;
				private jointCount_ = 0;

				constructor(source: string, private delegate_: MD5MeshDelegate) {
					this.tokenizer_ = new MD5Tokenizer(source);
				}


				private unexpected(token: Token, message?: string) {
					if (! message) {
						message = (token.type == TokenType.Invalid) ? "Invalid token" : "Unexpected token";
					}
					this.delegate_.error(message, token.offset, token.val && token.val.toString());
					this.eof_ = true;
				}


				private expectNext(tokenType: TokenType, tokenVal?: number | string): Token {
					var token = this.tokenizer_.nextToken();
					if (token.type == TokenType.EOF) {
						this.eof_ = true;
					}
					if (token.type == tokenType) {
						if (tokenVal === undefined || tokenVal === token.val) {
							return token;
						}
					}

					this.unexpected(token);
					return null;
				}


				private parseMeshVertices(count: number) {
					while (!this.eof_ && count > 0) {
						if (this.expectNext(TokenType.Key, "vert")) {
							var index = this.expectNext(TokenType.Number);

							if (index && this.expectNext(TokenType.OpenVector)) {
								var texU = this.expectNext(TokenType.Number);
								var texV = this.expectNext(TokenType.Number);

								if (texU && texV && this.expectNext(TokenType.CloseVector)) {
									var weightOffset = this.expectNext(TokenType.Number);
									var weightCount = this.expectNext(TokenType.Number);

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
					while (!this.eof_ && count > 0) {
						if (this.expectNext(TokenType.Key, "tri")) {
							var index = this.expectNext(TokenType.Number);
							var a = this.expectNext(TokenType.Number);
							var b = this.expectNext(TokenType.Number);
							var c = this.expectNext(TokenType.Number);

							if (index && a && b && c) {
								var points = [<number>a.val | 0, <number>b.val | 0, <number>c.val | 0];
								this.delegate_.triangle(<number>index.val | 0, points);
							}
						}

						--count;
					}
				}


				private parseMeshWeights(count: number) {
					while (!this.eof_ && count > 0) {
						if (this.expectNext(TokenType.Key, "weight")) {
							var index = this.expectNext(TokenType.Number);
							var jointIndex = this.expectNext(TokenType.Number);
							var bias = this.expectNext(TokenType.Number);

							if (index && jointIndex && bias && this.expectNext(TokenType.OpenVector)) {
								var posX = this.expectNext(TokenType.Number);
								var posY = this.expectNext(TokenType.Number);
								var posZ = this.expectNext(TokenType.Number);

								if (posX && posY && posZ && this.expectNext(TokenType.CloseVector)) {
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
						this.delegate_.error("Too many meshes in file", this.tokenizer_.offset);
						return;
					}

					if (this.expectNext(TokenType.OpenBlock)) {
						var cmdN: Token;
						do {
							cmdN = this.tokenizer_.nextToken();

							if (cmdN.type == TokenType.Key) {
								var cmd = cmdN && <string>cmdN.val;

								if (cmd == "shader") {
									var shader = this.expectNext(TokenType.String);
									if (shader) {
										this.delegate_.materialName(<string>shader.val);
									}
								}
								else if (cmd == "numverts") {
									let vertCount = this.expectNext(TokenType.Number);
									if (vertCount) {
										let vc = <number>vertCount.val | 0;
										this.delegate_.vertexCount(vc);
										this.parseMeshVertices(vc);
									}
								}
								else if (cmd == "numtris") {
									let triCount = this.expectNext(TokenType.Number);
									if (triCount) {
										let tc = <number>triCount.val | 0;
										this.delegate_.triangleCount(tc);
										this.parseMeshTriangles(tc);
									}
								}
								else if (cmd == "numweights") {
									let weightCount = this.expectNext(TokenType.Number);
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
								this.unexpected(cmdN);
							}
						} while (!this.eof_ && cmdN.type != TokenType.CloseBlock);
					}
				}


				private parseJoints() {
					var jointsLeft = this.jointCount_;

					if (this.expectNext(TokenType.OpenBlock)) {
						while (jointsLeft > 0 && !this.eof_) {
							var name = this.expectNext(TokenType.String);
							var parentIndex = this.expectNext(TokenType.Number);
							if (name && parentIndex && this.expectNext(TokenType.OpenVector)) {
								var posX = this.expectNext(TokenType.Number);
								var posY = this.expectNext(TokenType.Number);
								var posZ = this.expectNext(TokenType.Number);

								if (posX && posY && posZ && this.expectNext(TokenType.CloseVector) && this.expectNext(TokenType.OpenVector)) {
									var quatX = this.expectNext(TokenType.Number);
									var quatY = this.expectNext(TokenType.Number);
									var quatZ = this.expectNext(TokenType.Number);

									if (quatX && quatY && quatZ && this.expectNext(TokenType.CloseVector)) {
										var pos = [<number>posX.val, <number>posY.val, <number>posZ.val];
										var rot = [<number>quatX.val, <number>quatY.val, <number>quatZ.val, 0];
										quat.calculateW(rot, rot);

										this.delegate_.joint(<string>name.val, this.jointCount_ - jointsLeft, <number>parentIndex.val, pos, rot);
									}
								}
							}
							--jointsLeft;
						}

						this.expectNext(TokenType.CloseBlock);
					}

					this.jointCount_ = 0;
				}


				parse() {
					while (!this.eof_) {
						var key = this.tokenizer_.nextToken();
						if (key.type == TokenType.Key) {
							if (key.val == "mesh") {
								this.delegate_.beginMesh();
								this.parseMesh();
								if (!this.eof_) {
									this.delegate_.endMesh();
								}
							}
							else if (key.val == "joints") {
								this.delegate_.beginJoints();
								this.parseJoints();
								if (!this.eof_) {
									this.delegate_.endJoints();
								}
							}
							else if (key.val == "numjoints") {
								let count = this.expectNext(TokenType.Number);
								this.jointCount_ = <number>count.val | 0;
								this.delegate_.jointCount(this.jointCount_);
							}
							else if (key.val == "nummeshes") {
								let count = this.expectNext(TokenType.Number);
								this.meshCount_ = <number>count.val | 0;
								this.delegate_.meshCount(this.meshCount_);
							}
							else if (key.val == "md5version" || key.val == "commandline") {
								// ignore these directives
								this.tokenizer_.nextToken();
							}
						}
						else if (key.type == TokenType.EOF) {
							this.eof_ = true;
						}
						else {
							this.unexpected(key);
						}
					}

					if (this.tokenizer_.eof && (this.jointCount_ > 0 || this.meshCount_ > 0)) {
						this.unexpected({ type: TokenType.EOF, offset: this.tokenizer_.offset }, "Unexpected eof with more meshes and/or joints expected.");
					}
					else {
						this.delegate_.completed();
					}
				}
			}

		} // ns parse


		export class MD5MeshBuilder implements parse.MD5MeshDelegate {
			private joints: Model[] = [];
			private flatJoints = new Map<number, Model>();

			constructor(private filePath: string) {
			}

			jointCount(count: number) {
			}

			beginJoints() {
			}

			joint(name: string, index: number, parentIndex: number, modelPos: Float3, modelRot: Float4) {
				var jm = makeModel(name, index);
				jm.joint = { root: parentIndex == -1 };
				this.flatJoints.set(index, jm);

				jm.transform.position = modelPos;
				jm.transform.rotation = modelRot;
				// if (parentIndex > -1) {
				// 	var pjm = this.flatJoints.get(parentIndex);
				// 	pjm.children.push(jm);
				// 	jm.parent = pjm;

				// 	// place joint in parent's local space
				// 	var inverseParentRot = quat.invert([], pjm.transform.rotation);
				// 	quat.mul(jm.transform.rotation, inverseParentRot, jm.transform.rotation);
				// 	vec3.sub(jm.transform.position, jm.transform.position, pjm.transform.position);
				// 	vec3.transformQuat(jm.transform.position, jm.transform.position, inverseParentRot);
				// }
				// else {
					this.joints.push(jm);
				// }
			}

			endJoints() {
			}

			meshCount(count: number) {
			}

			beginMesh() {
			}

			materialName(name: string) {
			}

			vertexCount(count: number) {
			}

			vertex(index: number, uv: Float2, weightOffset: number, weightCount: number) {
			}

			triangleCount(count: number) {
			}

			triangle(index: number, indexes: Float3) {
			}

			weightCount(count: number) {
			}

			weight(index: number, jointIndex: number, bias: number, jointPos: Float3) {
			}

			endMesh() {
			}

			error(msg: string, offset: number, token?: string) {
				console.warn("MD5 parse error @ offset " + offset + ": " + msg, token);
			}

			completed() {
				console.info("J", this.joints);
			}

			assets() {
				var ag = new AssetGroup();
				for (var m of this.joints) {
					ag.addModel(m);
				}
				return ag;
			}
		}

	} // ns md5


	function parseMD5MeshSource(filePath: string, source: string): AssetGroup {
		var t0 = performance.now();
		var del = new md5.MD5MeshBuilder(filePath);
		var parser = new md5.parse.MD5MeshParser(source, del);
		parser.parse();
		// return del.assets.then(grp => {
		// 	console.info("fbx total time: " + (performance.now() - t0).toFixed(1) + "ms");
		// 	return grp;
		// });
		return del.assets();
	}
	

	export function loadMD5Mesh(filePath: string) {
		return loadFile(filePath).then((text: string) => parseMD5MeshSource(filePath, text));
	}

} // ns sd.asset
