// control/mouse - mouse input and capture handling
// Part of Stardazed
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd.control {

	export interface Mouse {
		buttonState(index: number): ButtonState;
		down(index: number): boolean;
		pressed(index: number): boolean;
		released(index: number): boolean;
		halfTransitions(index: number): number;

		reset(): void;
		resetPerFrameData(): void;

		lock(): void;
		unlock(): void;

		readonly position: Float2;
		readonly positionDelta: Float2;
		readonly wheelDelta: Float2;
	}

	class MouseImpl implements Mouse {
		private buttonData_: container.FixedMultiArray;
		private downBase_: Uint8Array;
		private halfTransBase_: Uint8Array;
		private readonly position_: number[];
		private readonly positionDelta_: number[];
		private readonly wheelDelta_: number[];

		constructor() {
			const fields: container.MABField[] = [
				{ type: UInt8, count: 1 },  // down
				{ type: UInt8, count: 1 },  // halfTransitionCount
			];
			this.buttonData_ = new container.FixedMultiArray(16, fields);
			this.downBase_ = this.buttonData_.indexedFieldView(0) as Uint8Array;
			this.halfTransBase_ = this.buttonData_.indexedFieldView(1) as Uint8Array;

			this.position_ = [0, 0];
			this.positionDelta_ = [0, 0];
			this.wheelDelta_ = [0, 0];

			window.addEventListener("wheel", evt => {
				this.wheelDelta_[0] = evt.deltaX;
				this.wheelDelta_[1] = evt.deltaY;
				evt.preventDefault();
			}, true);
		
			window.addEventListener("mousedown", evt => {
				this.downBase_[evt.button] = 1;
				++this.halfTransBase_[evt.button];
				evt.preventDefault();
			}, true);
		
			window.addEventListener("mouseup", evt => {
				this.downBase_[evt.button] = 0;
				++this.halfTransBase_[evt.button];
				evt.preventDefault();
			}, true);
		
			window.addEventListener("contextmenu", evt => {
				// disable context menu to allow for 2nd-clicks to
				// be handled by the game.
				evt.preventDefault();
			}, true);

			window.addEventListener("mousemove", evt => {
				if (document.pointerLockElement) {
					this.positionDelta_[0] = evt.movementX;
					this.positionDelta_[1] = evt.movementY;
				}
				else {
					this.positionDelta_[0] = evt.clientX - this.position_[0];
					this.positionDelta_[1] = evt.clientY - this.position_[1];
					this.position_[0] = evt.clientX;
					this.position_[1] = evt.clientY;
				}
			}, true);

			document.addEventListener("pointerlockchange", _evt => {
				// integrate into mouse capturing logic
			});

			document.addEventListener("pointerlockerror", _evt => {
				// integrate into mouse capturing logic
			});
		}

		buttonState(index: number): ButtonState {
			return {
				down: !!this.downBase_[index],
				halfTransitionCount: this.halfTransBase_[index]
			};
		}

		down(index: number) {
			return !!this.downBase_[index];
		}

		pressed(index: number) {
			return this.downBase_[index] ? (this.halfTransBase_[index] > 0) : false;
		}

		released(index: number): boolean {
			return !this.downBase_[index] ? (this.halfTransBase_[index] > 0) : false;
		}

		halfTransitions(index: number) {
			return this.halfTransBase_[index];
		}

		reset() {
			this.buttonData_.clear();
			vec2.set(this.position_, 0, 0);
			vec2.set(this.positionDelta_, 0, 0);
			vec2.set(this.wheelDelta_, 0, 0);
		}

		resetPerFrameData() {
			container.fill(this.halfTransBase_, 0, this.halfTransBase_.length);
			this.positionDelta_[0] = 0;
			this.positionDelta_[1] = 0;
			this.wheelDelta_[0] = 0;
			this.wheelDelta_[1] = 0;
		}

		lock() {
			document.querySelector("canvas")!.requestPointerLock();
		}

		unlock() {
			document.exitPointerLock();
		}

		get position() {
			return this.position_.slice();
		}

		get positionDelta() {
			return this.positionDelta_.slice();
		}

		get wheelDelta() {
			return this.wheelDelta_.slice();
		}
	}

	// -- exported devices
	export const mouse: Mouse = new MouseImpl();

} // ns sd.control
