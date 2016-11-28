/**
 * @author mrdoob / http://mrdoob.com/
 * converted to TypeScript by Arthur Langereis (@zenmumbler)
 */

export const enum StatsMode {
	FPS,
	MS
}

const GRAPH_WIDTH = 74;
const GRAPH_HEIGHT = 30;

export class Stats {
	private startTime = performance.now();
	private prevTime = this.startTime;

	private ms = 0;
	private msMin = 1000;
	private msMax = 0;

	private fps = 0;
	private fpsMin = 1000;
	private fpsMax = 0;

	private frames = 0;
	private mode_ = StatsMode.FPS;

	private container: HTMLDivElement;
	private msDiv: HTMLDivElement;
	private msText: HTMLDivElement;
	private msGraph: HTMLDivElement;
	private fpsDiv: HTMLDivElement;
	private fpsText: HTMLDivElement;
	private fpsGraph: HTMLDivElement;

	constructor() {
		const container = this.container = document.createElement("div");
		container.id = "stats";
		container.addEventListener(
			"mousedown",
			event => {
				event.preventDefault();
				this.setMode(++this.mode_ % 2);
			},
			false
		);
		container.style.cssText = "width:80px;opacity:0.9;cursor:pointer";

		const fpsDiv = document.createElement("div");
		fpsDiv.id = "fps";
		fpsDiv.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#002";
		container.appendChild(fpsDiv);

		const fpsText = this.fpsText = document.createElement("div");
		fpsText.id = "fpsText";
		fpsText.style.cssText = "color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
		fpsText.innerHTML = "FPS";
		fpsDiv.appendChild(fpsText);

		const fpsGraph = this.fpsGraph = document.createElement("div");
		fpsGraph.id = "fpsGraph";
		fpsGraph.style.cssText = `position:relative;width:${GRAPH_WIDTH}px;height:${GRAPH_HEIGHT}px;background-color:#0ff`;
		fpsDiv.appendChild(fpsGraph);

		while (fpsGraph.children.length < GRAPH_WIDTH) {
			const bar = document.createElement("span");
			bar.style.cssText = `width:1px;height:${GRAPH_HEIGHT}px;float:left;background-color:#113`;
			fpsGraph.appendChild(bar);
		}

		const msDiv = this.msDiv = document.createElement("div");
		msDiv.id = "ms";
		msDiv.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";
		container.appendChild(msDiv);

		const msText = this.msText = document.createElement("div");
		msText.id = "msText";
		msText.style.cssText = "color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
		msText.innerHTML = "MS";
		msDiv.appendChild(msText);

		const msGraph = this.msGraph = document.createElement("div");
		msGraph.id = "msGraph";
		msGraph.style.cssText = `position:relative;width:${GRAPH_WIDTH}px;height:${GRAPH_HEIGHT}px;background-color:#0f0`;
		msDiv.appendChild(msGraph);

		while (msGraph.children.length < GRAPH_WIDTH) {
			const bar = document.createElement("span");
			bar.style.cssText = `width:1px;height:${GRAPH_HEIGHT}px;float:left;background-color:#131`;
			msGraph.appendChild(bar);
		}
	}

	get mode() {
		return this.mode_;
	}

	setMode(value: StatsMode) {
		this.mode_ = value;

		switch (this.mode_) {
			case StatsMode.FPS:
				this.fpsDiv.style.display = "block";
				this.msDiv.style.display = "none";
				break;
			case StatsMode.MS:
				this.fpsDiv.style.display = "none";
				this.msDiv.style.display = "block";
				break;
		}
	}

	updateGraph(elem: HTMLDivElement, value: number) {
		const child = <HTMLDivElement>elem.appendChild(elem.firstChild!);
		child.style.height = `${value}px`;
	}

	get domElement() {
		return this.container;
	}

	begin() {
		this.startTime = performance.now();
	}

	end() {
		const time = performance.now();

		this.ms = Math.round(time - this.startTime);
		this.msMin = Math.min(this.msMin, this.ms);
		this.msMax = Math.max(this.msMax, this.ms);

		this.msText.textContent = `${this.ms} MS (${this.msMin}-${this.msMax})`;
		this.updateGraph(this.msGraph, Math.min(GRAPH_HEIGHT, GRAPH_HEIGHT - (this.ms / 200) * GRAPH_HEIGHT));

		this.frames++;

		if (time > this.prevTime + 1000) {
			this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
			this.fpsMin = Math.min(this.fpsMin, this.fps);
			this.fpsMax = Math.max(this.fpsMax, this.fps);

			this.fpsText.textContent = `${this.fps} FPS (${this.fpsMin}-${this.fpsMax})`;
			this.updateGraph(this.fpsGraph, Math.min(GRAPH_HEIGHT, GRAPH_HEIGHT - (this.fps / 100) * GRAPH_HEIGHT));

			this.prevTime = time;
			this.frames = 0;
		}

		return time;
	}

	update() {
		this.startTime = this.end();
	}
}
