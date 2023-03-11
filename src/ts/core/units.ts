export abstract class Pos {
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public toString(): string {
		return `{x: ${this.x}, y: ${this.y}}`;
	}
}

export namespace Pos {
	export function swap(p: Pos): Pos {
		return {
			...p,
			x: p.y,
			y: p.x
		};
	}

	export function toArr(p: Pos): [number, number] {
		return [p.x, p.y];
	}
}

export class ScreenPos extends Pos { }

export abstract class Dimensions {
	public width: number;
	public height: number;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	public toString(): string {
		return `{width: ${this.width}, height: ${this.height}}`;
	}
}

/** On-screen pixel dimensions */
export class ScreenDimensions extends Dimensions { }
