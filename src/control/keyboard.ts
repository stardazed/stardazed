// control/keyboard - keyboard input handling
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.control {

	export enum Key {
		UP = 38,
		DOWN = 40,
		LEFT = 37,
		RIGHT = 39,

		BACKSPACE = 8,
		TAB = 9,
		RETURN = 13,
		ESC = 27,
		SPACE = 32,

		PAGEUP = 33,
		PAGEDOWN = 34,
		HOME = 36,
		END = 35,
		DELETE = 46,

		// charCode equals keyCode for A-Z
		A = "A".charCodeAt(0), B = "B".charCodeAt(0), C = "C".charCodeAt(0), D = "D".charCodeAt(0),
		E = "E".charCodeAt(0), F = "F".charCodeAt(0), G = "G".charCodeAt(0), H = "H".charCodeAt(0),
		I = "I".charCodeAt(0), J = "J".charCodeAt(0), K = "K".charCodeAt(0), L = "L".charCodeAt(0),
		M = "M".charCodeAt(0), N = "N".charCodeAt(0), O = "O".charCodeAt(0), P = "P".charCodeAt(0),
		Q = "Q".charCodeAt(0), R = "R".charCodeAt(0), S = "S".charCodeAt(0), T = "T".charCodeAt(0),
		U = "U".charCodeAt(0), V = "V".charCodeAt(0), W = "W".charCodeAt(0), X = "X".charCodeAt(0),
		Y = "Y".charCodeAt(0), Z = "Z".charCodeAt(0)
	}


	export interface Keyboard {
		keyState(kc: Key): ButtonState;
		down(kc: Key): boolean;
		pressed(kc: Key): boolean;
		released(kc: Key): boolean;
		halfTransitions(kc: Key): number;

		reset(): void;
		resetPerFrameData(): void;
	}


	class KeyboardImpl implements Keyboard {
		private keyData_: container.FixedMultiArray;
		private downBase_: Uint8Array;
		private halfTransBase_: Uint8Array;
		private lastEventBase_: Float64Array;

		constructor() {
			const fields: container.MABField[] = [
				{ type: UInt8, count: 1 },  // down
				{ type: UInt8, count: 1 },  // halfTransitionCount
				{ type: Double, count: 1 }, // lastEvent
			];
			this.keyData_ = new container.FixedMultiArray(128, fields);
			this.downBase_ = this.keyData_.indexedFieldView(0) as Uint8Array;
			this.halfTransBase_ = this.keyData_.indexedFieldView(1) as Uint8Array;
			this.lastEventBase_ = this.keyData_.indexedFieldView(2) as Float64Array;

			// The extra check in the key handlers for the timeStamp was added
			// after I encountered a rare, but frequently enough occuring bug
			// where, when a key is pressed for a longer time so that repeat
			// keydown events are fired, _very_ occasionally the last keydown
			// would be fired with the same timeStamp as the keyup event but
			// the event handler for that last down event was fired AFTER the
			// keyup event handler, causing the key to appear to be "stuck".
			window.addEventListener("keydown", evt => {
				const lastEvent = this.lastEventBase_[evt.keyCode];
				const wasDown = this.downBase_[evt.keyCode];

				if (lastEvent < evt.timeStamp) {
					if (! wasDown) { // ignore key repeat events
						this.downBase_[evt.keyCode] = 1;
						++this.halfTransBase_[evt.keyCode];
					}
					this.lastEventBase_[evt.keyCode] = evt.timeStamp;
				}

				if (! evt.metaKey) {
					evt.preventDefault();
				}
			}, true);

			window.addEventListener("keyup", evt => {
				this.downBase_[evt.keyCode] = 0;
				++this.halfTransBase_[evt.keyCode];
				this.lastEventBase_[evt.keyCode] = evt.timeStamp;

				evt.preventDefault();
			}, true);
		}

		keyState(kc: Key): ButtonState {
			return {
				down: !!this.downBase_[kc],
				halfTransitionCount: this.halfTransBase_[kc]
			};
		}

		down(kc: Key): boolean {
			return !!this.downBase_[kc];
		}

		halfTransitions(kc: Key): number {
			return this.halfTransBase_[kc];
		}

		pressed(kc: Key): boolean {
			return this.downBase_[kc] ? (this.halfTransBase_[kc] > 0) : false;
		}

		released(kc: Key): boolean {
			return !this.downBase_[kc] ? (this.halfTransBase_[kc] > 0) : false;
		}

		reset() {
			this.keyData_.clear();
		}

		resetPerFrameData() {
			container.fill(this.halfTransBase_, 0, this.halfTransBase_.length);
		}
	}


	// -- exported devices
	export const keyboard: Keyboard = new KeyboardImpl();

} // ns sd.control
