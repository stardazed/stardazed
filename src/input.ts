// input - keyboard, mouse, controller
// Part of Stardazed TX
// (c) 2015 by Arthur Langereis - @zenmumbler

namespace sd.io {

	export enum Key {
		UP = 38,
		DOWN = 40,
		LEFT = 37,
		RIGHT = 39,

		SPACE = 32,
		RETURN = 13,
		ESC = 27,

		PAGEUP = 33,
		PAGEDOWN = 34,
		HOME = 36,
		END = 35,
		DELETE = 46,

		// charCode equals keyCode for A-Z
		A = 'A'.charCodeAt(0), B = 'B'.charCodeAt(0), C = 'C'.charCodeAt(0), D = 'D'.charCodeAt(0),
		E = 'E'.charCodeAt(0), F = 'F'.charCodeAt(0), G = 'G'.charCodeAt(0), H = 'H'.charCodeAt(0),
		I = 'I'.charCodeAt(0), J = 'J'.charCodeAt(0), K = 'K'.charCodeAt(0), L = 'L'.charCodeAt(0),
		M = 'M'.charCodeAt(0), N = 'N'.charCodeAt(0), O = 'O'.charCodeAt(0), P = 'P'.charCodeAt(0),
		Q = 'Q'.charCodeAt(0), R = 'R'.charCodeAt(0), S = 'S'.charCodeAt(0), T = 'T'.charCodeAt(0),
		U = 'U'.charCodeAt(0), V = 'V'.charCodeAt(0), W = 'W'.charCodeAt(0), X = 'X'.charCodeAt(0),
		Y = 'Y'.charCodeAt(0), Z = 'Z'.charCodeAt(0)
	};


	export class Keyboard {
		keys: { [key: number]: { down: boolean; when: number; }; } = {};

		// The extra check in the key handlers for the timeStamp was added
		// after I encountered a rare, but frequently enough occuring bug
		// where, when a key is pressed for a longer time so that repeat 
		// keydown events are fired, _very_ occasionally the last keydown
		// would be fired with the same timeStamp as the keyup event but
		// the event handler for that last down event was fired AFTER the
		// keyup event handler, causing the key to appear to be "stuck".

		constructor() {
			on(window, "keydown", (evt: KeyboardEvent) => {
				var key = this.keys[evt.keyCode];

				if (!key) {
					this.keys[evt.keyCode] = { down: true, when: evt.timeStamp };
				}
				else {
					if (key.when < evt.timeStamp) {
						key.down = true;
						key.when = evt.timeStamp;
					}
				}

				if (!evt.metaKey)
					evt.preventDefault();
			});

			on(window, "keyup", (evt: KeyboardEvent) => {
				var key = this.keys[evt.keyCode];
				if (!key) {
					this.keys[evt.keyCode] = { down: false, when: evt.timeStamp };
				}
				else {
					key.down = false;
					key.when = evt.timeStamp;
				}

				if (!evt.metaKey)
					evt.preventDefault();
			});

			on(window, "blur", (evt) => {
				this.keys = {};
			});

			on(window, "focus", (evt) => {
				this.keys = {};
			});
		}

		down(kc: Key): boolean {
			return this.keys[kc] && this.keys[kc].down;
		}
	}

} // ns sd.io
