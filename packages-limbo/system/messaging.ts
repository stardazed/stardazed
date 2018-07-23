// system/messaging - simple single-broadcaster, multiple listener message system
// Part of Stardazed
// (c) 2015-2018 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed

namespace sd {

	export type ListenerFunc = (this: void, context: any, ...args: any[]) => void | "remove";

	interface Listener {
		func: ListenerFunc;
		context?: object;
		once: boolean;
	}

	export class Messaging {
		private listeners_: { [event: string]: Listener[] | undefined } = {};

		private findListener(event: string, func: ListenerFunc, context: object | undefined): Listener | undefined {
			const listeners = this.listeners_[event];
			if (listeners) {
				return listeners.find(listener => listener.func === func && listener.context === context );
			}
			return undefined;
		}

		private addListener(event: string, listener: Listener) {
			const exists = this.findListener(event, listener.func, listener.context);
			if (! exists) {
				let array = this.listeners_[event];
				if (! array) {
					array = this.listeners_[event] = [];
				}
				array.push(listener);
			}
			else {
				console.warn(`Messaging: adding duplicate listener for event '${event}'`, listener);
			}
		}

		private removeListener(event: string, func: ListenerFunc, context: object | undefined) {
			const listener = this.findListener(event, func, context);
			if (listener) {
				const array = this.listeners_[event]!;
				array.splice(array.indexOf(listener), 1);
			}
			else {
				console.warn(`Messaging: tried to remove non-existent listener for event '${event}'`, { func, context });
			}
		}

		listen(event: string, context: object | undefined, func: ListenerFunc) {
			event = event.toLowerCase();
			this.addListener(event, { func, context, once: false });
		}

		listenOnce(event: string, context: object | undefined, func: ListenerFunc) {
			event = event.toLowerCase();
			this.addListener(event, { func, context, once: true });
		}

		silence(event: string, context: object | undefined, func: ListenerFunc) {
			event = event.toLowerCase();
			this.removeListener(event, func, context);
		}

		send(event: string, context?: object, ...args: any[]) {
			event = event.toLowerCase();
			const listeners = this.listeners_[event];
			const remove: Listener[] = [];
			if (listeners) {
				for (const l of listeners) {
					if (l.context && l.context !== context) {
						continue;
					}
					const { func } = l;
					const result = func(context, ...args);
					if (l.once || result === "remove") {
						remove.push(l);
					}
				}
			}
			for (const rl of remove) {
				this.removeListener(event, rl.func, rl.context);
			}
		}
	}

} // ns sd.system
