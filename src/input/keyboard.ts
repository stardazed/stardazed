 /*
input/keyboard - keyboard input handling
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

import { StructOfArrays } from "stardazed/container";
import { ButtonState } from "./types";

/**
 * An abstract key code that represents a key on a generic US QWERTY keyboard.
 * On keyboards using different key layouts, these codes represent the key
 * that is physically in the same location as the key on a US QWERTY layout.
 * Because of this, you can always e.g. specify WASD as movement keys and it
 * will map to ZQSD on an AZERTY layout keyboard.
 */
export const enum Key {
	None,
	
	A, B, C, D, E, F, G, H, I,
	J, K, L, M, N, O, P, Q, R,
	S, T, U, V, W, X, Y, Z,
	
	Digit0, Digit1, Digit2, Digit3, Digit4,
	Digit5, Digit6, Digit7, Digit8, Digit9,
	
	NumPad0, NumPad1, NumPad2, NumPad3, NumPad4,
	NumPad5, NumPad6, NumPad7, NumPad8, NumPad9,
	NumPadDecimal, NumPadComma, NumPadEnter, // comma is JIS only
	NumPadPlus, NumPadMinus, NumPadMultiply, NumPadDivide,
	NumPadEquals, // Mac only
	NumLock,
	
	Space, Backspace, Tab, Return,
	
	Insert, Delete, Home, End, PageUp, PageDown,
	ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
	
	Minus, Equals,
	OpenBracket, CloseBracket,
	Semicolon, Quote, Backquote,
	Backslash, Slash,
	Comma, Period,
	Section, // Mac ISO only
	
	Escape,
	F1, F2, F3, F4, F5, F6,
	F7, F8, F9, F10, F11, F12,
	F13, PrintScreen = F13,
	F14, ScrollLock = F14,
	F15, Pause = F15,
	F16, F17, F18, F19, // Mac full-width only
	
	CapsLock,
	LeftShift, RightShift,
	LeftControl, RightControl,
	LeftAlt, RightAlt,
	LeftMeta, RightMeta,
	Context, // Win only
	JISYen, JISRo, // JIS only
	Lang1, Lang2 // Korean and Japanese
};

const EventCodeToKey: Record<string, Key> = {
	KeyA: Key.A, KeyB: Key.B, KeyC: Key.C, KeyD: Key.D,
	KeyE: Key.E, KeyF: Key.F, KeyG: Key.G, KeyH: Key.H,
	KeyI: Key.I, KeyJ: Key.J, KeyK: Key.K, KeyL: Key.L,
	KeyM: Key.M, KeyN: Key.N, KeyO: Key.O, KeyP: Key.P,
	KeyQ: Key.Q, KeyR: Key.R, KeyS: Key.S, KeyT: Key.T,
	KeyU: Key.U, KeyV: Key.V, KeyW: Key.W, KeyX: Key.X,
	KeyY: Key.Y, KeyZ: Key.Z,

	Digit0: Key.Digit0, Digit1: Key.Digit1, Digit2: Key.Digit2,
	Digit3: Key.Digit3, Digit4: Key.Digit4, Digit5: Key.Digit5,
	Digit6: Key.Digit6, Digit7: Key.Digit7, Digit8: Key.Digit8,
	Digit9: Key.Digit9, Minus: Key.Minus, Equal: Key.Equals,

	Backspace: Key.Backspace,
	Tab: Key.Tab,
	Escape: Key.Escape,
	Space: Key.Space,
	Enter: Key.Return,

	BracketLeft: Key.OpenBracket,
	BracketRight: Key.CloseBracket,
	Quote: Key.Quote,
	Backquote: Key.Backquote,
	Semicolon: Key.Semicolon,
	Slash: Key.Slash,
	Backslash: Key.Backslash,
	IntlBackslash: Key.Section,
	Comma: Key.Comma,
	Period: Key.Period,

	Delete: Key.Delete,
	Home: Key.Home,
	End: Key.End,
	PageUp: Key.PageUp,
	PageDown: Key.PageDown,

	ArrowUp: Key.ArrowUp,
	ArrowDown: Key.ArrowDown,
	ArrowLeft: Key.ArrowLeft,
	ArrowRight: Key.ArrowRight,

	OSLeft: Key.LeftMeta, OSRight: Key.RightMeta,
	MetaLeft: Key.LeftMeta, MetaRight: Key.RightMeta,
	ShiftLeft: Key.LeftShift, ShiftRight: Key.RightShift,
	AltLeft: Key.LeftAlt, AltRight: Key.RightAlt,
	ControlLeft: Key.LeftControl, ControlRight: Key.RightControl,
	CapsLock: Key.CapsLock,
	ContextMenu: Key.Context,

	NumLock: Key.NumLock,
	NumpadEqual: Key.NumPadEquals,
	NumpadDivide: Key.NumPadDivide,
	NumpadMultiply: Key.NumPadMultiply,
	NumpadSubtract: Key.NumPadMinus,
	NumpadAdd: Key.NumPadPlus,
	NumpadEnter: Key.NumPadEnter,
	NumpadDecimal: Key.NumPadDecimal,
	NumpadComma: Key.NumPadComma, // JIS
	Numpad0: Key.NumPad0,
	Numpad1: Key.NumPad1, Numpad2: Key.NumPad2, Numpad3: Key.NumPad3,
	Numpad4: Key.NumPad4, Numpad5: Key.NumPad5, Numpad6: Key.NumPad6,
	Numpad7: Key.NumPad7, Numpad8: Key.NumPad8, Numpad9: Key.NumPad9,

	IntlYen: Key.JISYen,
	IntlRo: Key.JISRo,
	Lang1: Key.Lang1,
	Lang2: Key.Lang2,
	HangulMode: Key.Lang1,
	Hanja: Key.Lang2,
	KanaMode: Key.Lang2,

	F1: Key.F1, F2: Key.F2, F3: Key.F3, F4: Key.F4,
	F5: Key.F5, F6: Key.F6, F7: Key.F7, F8: Key.F8,
	F9: Key.F9, F10: Key.F10, F11: Key.F11, F12: Key.F12,
	F13: Key.F13, F14: Key.F14, F15: Key.F15, F16: Key.F16,
	F17: Key.F17, F18: Key.F18, F19: Key.F19,

	PrintScreen: Key.PrintScreen, // aka F13
	ScrollLock: Key.ScrollLock, // aka F14
	Pause: Key.Pause // aka F15
};

const enum Config {
	/**
	 * Maximum number of keys to track, must be able to represent
	 * all Key values and be a power of 2.
 	 */
	MAX_KEYS = 128
}
	

export class Keyboard {
	private keyData_: StructOfArrays;
	private downBase_: Uint8Array;
	private lastEventBase_: Float64Array;
	private frameToggle_: number;

	constructor() {
		this.keyData_ = new StructOfArrays([
			{ type: "uint8", width: 2 },  // down
			{ type: "double", width: 1 }, // lastEvent
		], Config.MAX_KEYS);
		this.downBase_ = this.keyData_.fieldArrayView(0) as Uint8Array;
		this.lastEventBase_ = this.keyData_.fieldArrayView(1) as Float64Array;
		this.frameToggle_ = 0;

		// The extra check in the key handlers for the timeStamp was added
		// after I encountered a rare, but frequently enough occurring bug
		// where, when a key is pressed for a longer time so that repeat
		// keydown events are fired, _very_ occasionally the last keydown
		// would be fired with the same timeStamp as the keyup event but
		// the event handler for that last down event was fired AFTER the
		// keyup event handler, causing the key to appear to be "stuck".
		window.addEventListener("keydown", (evt) => {
			const key = EventCodeToKey[evt.code] || Key.None;
			const lastEvent = this.lastEventBase_[key];

			if (lastEvent < evt.timeStamp) {
				this.downBase_[this.frameToggle_ + key] = 1;
				this.lastEventBase_[key] = evt.timeStamp;
			}

			evt.preventDefault();
		}, true);

		window.addEventListener("keyup", (evt) => {
			const key = EventCodeToKey[evt.code] || Key.None;
			this.downBase_[this.frameToggle_ + key] = 0;
			this.lastEventBase_[key] = evt.timeStamp;

			evt.preventDefault();
		}, true);
	}

	/** Return the standardised state of a sequence of keys. */
	getKeyStates(keys: Key[]): ButtonState[] {
		return keys.map((key) => {
			const prev = this.downBase_[(this.frameToggle_ ^ Config.MAX_KEYS) + key];
			const cur = this.downBase_[this.frameToggle_ + key];
			return {
				down: cur === 1,
				transitioned: cur !== prev,
				value: cur
			};
		});
	}

	/** Is the key currently not held down, regardless of previous state? */
	up(key: Key): boolean {
		return this.downBase_[this.frameToggle_ + key] === 0;
	}

	/** Is the key currently held down, regardless of previous state? */
	down(key: Key): boolean {
		return this.downBase_[this.frameToggle_ + key] === 1;
	}

	/** Did this key transition from up to down? */
	pressed(key: Key): boolean {
		// cur down = 1 and old down = 0 is the only combination that yields 1 when subtracted
		return this.downBase_[this.frameToggle_ + key] - this.downBase_[(this.frameToggle_ ^ Config.MAX_KEYS) + key] === 1;
	}

	/** Did this key transition from down to up? */
	released(key: Key): boolean {
		// reverse calculation from pressed
		return this.downBase_[(this.frameToggle_ ^ Config.MAX_KEYS) + key] - this.downBase_[this.frameToggle_ + key] === 1;
	}

	/** Reset key tracking, any keys still physically held down must be released before they can be tracked again. */
	reset() {
		this.keyData_.data.fill(0);
		this.frameToggle_ = 0;
	}

	/** Call this after processing all inputs from this device to start tracking changes in the current frame. */
	nextFrame() {
		this.frameToggle_ ^= Config.MAX_KEYS;
	}
}
