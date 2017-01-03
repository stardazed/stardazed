// tools/perftimer - helper class to log timing of multi-step processes
// Part of Stardazed TX
// (c) 2015-2017 by Arthur Langereis - @zenmumbler
// https://github.com/stardazed/stardazed-tx

namespace sd {

	// helper class for easy logged timing of multi-step processes
	export class PerfTimer {
		private t0_: number;
		private lastT_: number;
		private stepSums_ = new Map<string, number>();

		constructor(private name_: string) {
			this.t0_ = this.lastT_ = performance.now();
		}

		step(stepName: string) {
			const curT = performance.now();
			const diffT = curT - this.lastT_;
			this.lastT_ = curT;

			this.stepSums_.set(name, diffT + (this.stepSums_.get(stepName) || 0));

			console.info(`Perf [${this.name_}] ${stepName}: ${diffT.toFixed(1)}`);
		}

		end() {
			const curT = performance.now();
			const diffT = curT - this.t0_;

			this.stepSums_.forEach((totalStepT, stepName) => {
				console.info(`Perf TOTAL [${this.name_}] ${stepName}: ${totalStepT.toFixed(1)}`);
			});
			console.info(`Perf TOTAL: ${diffT.toFixed(1)}`);
		}
	}

} // ns sd
