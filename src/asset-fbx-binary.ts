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

		
		private inflateCompressedArray(dataBlock: TypedArray, outElementType: NumericType): TypedArray {
			// the first 2 bytes are usually 0x7801, which is a DEFLATE marker
			// the final 4 bytes are likely a checksum
			assert(dataBlock.byteLength > 6, "Compressed array data size is too small");
			var compData = new Uint8Array(dataBlock.buffer, 2, dataBlock.byteLength - 6);

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


		private readProperties(field: FieldHeader) {
			var count = field.propertyCount;
			var arrayProp: TypedArray = null;
			var props: FBXFieldProp[] = [];
			var firstPropOffset = this.offset_;

			while (count--) {
				let val: FBXFieldProp;
				let type = String.fromCharCode(this.bytes_[this.offset_]);
				let propLen: number;

				switch (type) {
					// String and data
					case 'S':
					case 'R':
						if (type == 'R') {
							console.warn("A raw data property was converted to a string.");
						}
						propLen = this.dataView_.getUint32(this.offset_ + 1, true);
						if (propLen > 0) {
							val = String.fromCharCode.apply(null, this.bytes_.subarray(this.offset_ + 5, this.offset_ + 5 + propLen));
						}
						else {
							val = "";
						}
						this.offset_ += 5 + propLen;
						break;

					// Signed integer
					case 'C':
						val = this.dataView_.getInt8(this.offset_ + 1);
						this.offset_ += 2;
						break;
					case 'Y':
						val = this.dataView_.getInt16(this.offset_ + 1, true);
						this.offset_ += 3;
						break;
					case 'I':
						val = this.dataView_.getInt32(this.offset_ + 1, true);
						this.offset_ += 5;
						break;
					case 'L':
						val = 0;
						console.warn("An 8-byte int property was skipped and 0 was returned.");
						this.offset_ += 9;
						break;

					// Floating point
					case 'F':
						val = this.dataView_.getFloat32(this.offset_ + 1, true);
						this.offset_ += 5;
						break;
					case 'D':
						val = this.dataView_.getFloat64(this.offset_ + 1, true);
						this.offset_ += 9;
						break;

					// Integer arrays
					case 'b':
						arrayProp = this.readArrayProperty(UInt8);
						break;
					case 'i':
						arrayProp = this.readArrayProperty(UInt32);
						break;
					case 'l':
						arrayProp = this.readArrayProperty(Double); // use double for proper size
						arrayProp = null;
						console.warn("An 8-byte int array property was skipped.");
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
			if (!this.checkHeader()) {
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
						// we're done here, there is some footer data below, but we don't know what it's for
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
		}
	}

} // sd.asset
