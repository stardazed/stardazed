// control/input - multi-device input mapping and reading
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.control {

	export interface ButtonState {
		down: boolean;
		halfTransitionCount: number;
	}

	export const enum InputDeviceType {
		None,
		Keyboard,
		Mouse,
		Controller
	}

	export interface NoneInput {
		type: InputDeviceType.None;
	}

	export interface KeyboardInput {
		type: InputDeviceType.Keyboard;
		key: Key;
	}

	export const enum MouseControl {
		Button0,
		Button1,
		Button2,
		Button3,
		Button4,
		Button5,
		Button6,
		Button7,

		Button8,
		Button9,
		Button10,
		Button11,
		Button12,
		Button13,
		Button14,
		Button15,

		MotionHorizontal,
		MotionVertical,

		WheelHorizontal,
		WheelVertical
	}

	export interface MouseInput {
		type: InputDeviceType.Mouse;
		axis: MouseControl;
	}

	export type DeviceInput = NoneInput | KeyboardInput | MouseInput;

	export interface AxisDescriptor {
		enabled: boolean;
		invert: boolean;

		sensitivity: number;
		gravity: number;
		snap: boolean;

		positive: DeviceInput;
		negative: DeviceInput;
	}

	export interface Input {
		
	}

} // ns sd.control
