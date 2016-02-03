// asset-fbx-binary.ts - FBX binary file parser
// Part of Stardazed TX
// (c) 2016 by Arthur Langereis - @zenmumbler

// Implementation partially based on research done by Campbell Barton of the Blender Foundation
// See: http://code.blender.org/2013/08/fbx-binary-file-format-specification/

/// <reference path="../defs/inflate.d.ts" />

namespace sd.asset {

	interface FieldHeader {
		offset: number;
		endOffset: number;
		propertyCount: number;
		propertiesSizeBytes: number;
		nameLength: number;
		name: string;
	}


	export class FBXBinaryParser {
		private bytes_: Uint8Array;
		private dataView_: DataView;
		private offset_ = 0;
		private length_ = 0;
		private version_ = 0;
		private stack_: FieldHeader[] = [];

		private twoExp21 = Math.pow(2, 21);
		private twoExp32 = Math.pow(2, 32);

		constructor(data: ArrayBuffer, private delegate_: FBXParserDelegate) {
			this.length_ = data.byteLength;
			this.bytes_ = new Uint8Array(data);
			this.dataView_ = new DataView(data);
		}


		private error(msg: string, offset?: number) {
			if (offset == null) {
				offset = this.offset_;
			}
			this.delegate_.error(msg, offset);
			this.offset_ = this.length_;
		}


		get version() { return this.version_; }

		
		private inflateCompressedArray(dataBlock: TypedArray, outElementType: NumericType): TypedArray {
			// the first 2 bytes are usually 0x7801, which is a DEFLATE marker
			// the final 4 bytes are likely a checksum
			assert(dataBlock.byteLength > 6, "Compressed array data size is too small");
			var compData = new Uint8Array(dataBlock.buffer, dataBlock.byteOffset + 2, dataBlock.byteLength - 6);

			var inf = new Inflater();
			var result = inf.append(compData);
			inf.flush();
			
			assert(result.byteLength % outElementType.byteSize == 0, "Invalid aligned size of output buffer");
			return new (outElementType.arrayType)(result.buffer);
		}


		private checkHeader() {
			var ident = String.fromCharCode.apply(null, this.bytes_.subarray(0, 20));
			if (ident != "Kaydara FBX Binary  ") {
				this.error("Not an FBX binary file");
				return false;
			}
			if (this.dataView_.getUint16(21, true) != 0x001A) {
				this.error("Expected 0x001A marker in header");
				return false;	
			}

			this.version_ = this.dataView_.getUint32(23, true);
			if (this.version_ < 7000 || this.version_ >= 8000) {
				this.error("This parser only supports v7.x files.");
				return false;
			}

			this.offset_ = 27;
			return true;
		}


		private readFieldHeader() {
			// fixed offset header fields
			const endOffset = this.dataView_.getUint32(this.offset_, true);
			const propertyCount = this.dataView_.getUint32(this.offset_ + 4, true);
			const propertiesSizeBytes = this.dataView_.getUint32(this.offset_ + 8, true);
			const nameLength = this.dataView_.getUint8(this.offset_ + 12);

			var result: FieldHeader = {
				offset: this.offset_,
				endOffset: endOffset,
				propertyCount: propertyCount,
				propertiesSizeBytes: propertiesSizeBytes,
				nameLength: nameLength,
				name: nameLength > 0 ? String.fromCharCode.apply(null, this.bytes_.subarray(this.offset_ + 13, this.offset_ + 13 + nameLength)) : ""
			};

			this.offset_ += 13 + nameLength;

			return result;
		}


		private readArrayProperty(element: NumericType): TypedArray {
			const arrayLength = this.dataView_.getUint32(this.offset_, true);
			const encoding = this.dataView_.getUint32(this.offset_ + 4, true);
			const compressedSizeBytes = this.dataView_.getUint32(this.offset_ + 8, true);
			this.offset_ += 12;

			var array: TypedArray = null;
			var dataSizeBytes = 0;

			if (encoding == 0) { 
				dataSizeBytes = element.byteSize * arrayLength;
				assert(dataSizeBytes < (this.length_ - this.offset_), "array length out of bounds");

				let source = this.bytes_.subarray(this.offset_, this.offset_ + dataSizeBytes);
				let dest = new Uint8Array(dataSizeBytes);
				dest.set(source);
				array = new (element.arrayType)(dest.buffer);
			}
			else if (encoding == 1) {
				dataSizeBytes = compressedSizeBytes;
				assert(dataSizeBytes < (this.length_ - this.offset_), "array compressed size out of bounds");

				let source = this.bytes_.subarray(this.offset_, this.offset_ + dataSizeBytes);
				array = this.inflateCompressedArray(source, element);
			}
			else {
				console.warn("Unknown array encoding encountered: " + encoding + ". Skipping array.");
				dataSizeBytes = compressedSizeBytes;
			}

			this.offset_ += dataSizeBytes;
			return array;
		}


		private convertInt64ToDouble(dv: DataView, offset: number): number {
			let vLo = dv.getUint32(offset, true);
			let vHi = dv.getInt32(offset + 4, true);

			if (vHi > this.twoExp21 || vHi < -this.twoExp21) {
				console.warn("A 64-bit int property was larger than (+/-)2^53 so it may not be accurately represented.");
			}

			return vLo + vHi * this.twoExp32;
		}


		private readProperties(field: FieldHeader) {
			var count = field.propertyCount;
			var arrayProp: TypedArray = null;
			var props: FBXFieldProp[] = [];
			var firstPropOffset = this.offset_;

			while (count--) {
				let val: FBXFieldProp;
				let type = String.fromCharCode(this.bytes_[this.offset_]);
				let propLen: number;
				this.offset_ += 1;

				switch (type) {
					// String and data
					case 'S':
						// [[fallthrough]]
					case 'R':
						propLen = this.dataView_.getUint32(this.offset_, true);
						if (propLen > 0) {
							let propData = this.bytes_.subarray(this.offset_ + 4, this.offset_ + 4 + propLen);
							if (type == 'S') {
								// TODO: in WebKit at least, this can cause a stack overflow to occur
								// inside fromCharCode if the data is very long, apparently implemented recursively?
								// This is both slow and can lead to errors. Chop this up in pieces and convert
								// separately.
								val = String.fromCharCode.apply(null, propData);
							}
							else {
								val = propData.buffer.slice(this.offset_ + 4, this.offset_ + 4 + propLen);
							}
						}
						else {
							val = "";
						}
						this.offset_ += 4 + propLen;
						break;

					// Signed integer
					case 'C':
						val = this.dataView_.getInt8(this.offset_);
						this.offset_ += 1;
						break;
					case 'Y':
						val = this.dataView_.getInt16(this.offset_, true);
						this.offset_ += 2;
						break;
					case 'I':
						val = this.dataView_.getInt32(this.offset_, true);
						this.offset_ += 4;
						break;
					case 'L':
						val = this.convertInt64ToDouble(this.dataView_, this.offset_);
						this.offset_ += 8;
						break;

					// Floating point
					case 'F':
						val = this.dataView_.getFloat32(this.offset_, true);
						this.offset_ += 4;
						break;
					case 'D':
						val = this.dataView_.getFloat64(this.offset_, true);
						this.offset_ += 8;
						break;

					// Integer arrays
					case 'b':
						arrayProp = this.readArrayProperty(UInt8);
						break;
					case 'i':
						arrayProp = this.readArrayProperty(UInt32);
						break;
					case 'l':
						{
							// read array as doubles for proper size and alignment
							let doubles = this.readArrayProperty(Double);

							// reinterpret array as a double-length list of int32s and convert in-place
							let view = new DataView(doubles.buffer);
							for (let di = 0; di < doubles.length; ++di) {
								let v = this.convertInt64ToDouble(view, di * 8);
								doubles[di] = v;
							}

							arrayProp = doubles;
						}
						break;

					case 'f':
						arrayProp = this.readArrayProperty(Float);
						break;
					case 'd':
						arrayProp = this.readArrayProperty(Double);
						break;

					default:
						console.warn("Unknown property type: " + type + ". Skipping further properties for this field.");
						count = 0;
						this.offset_ = firstPropOffset + field.propertiesSizeBytes;
						break;
				}

				if (arrayProp == null) {
					props.push(val);
				}
			}

			assert(this.offset_ - field.propertiesSizeBytes == firstPropOffset);

			// report to delegate in same order as for text files
			this.delegate_.field(field.name, props);
			if (arrayProp) {
				this.delegate_.arrayFilled(arrayProp);
			}
		}


		parse() {
			if (! this.checkHeader()) {
				return;
			}

			while (this.offset_ < this.length_) {
				var hdr = this.readFieldHeader();
				if (hdr.endOffset == 0) {
					// end of scope marker
					if (this.stack_.length > 0) {
						var closing = this.stack_.pop();
						assert(closing.endOffset == this.offset_, "Offset mismatch at end of scope");
						this.delegate_.closeContext();
					}
					else {
						// we're done here, there is some footer data left, but we don't know what it's for
						return;
					}
				}
				else {
					this.readProperties(hdr);
					if (hdr.endOffset != this.offset_) {
						this.stack_.push(hdr);
						this.delegate_.openContext();
					}
				}
			}

			if (this.stack_.length > 0) {
				this.error("Unexpected EOF at nesting depth " + this.stack_.length);
			}
		}
	}

} // sd.asset
