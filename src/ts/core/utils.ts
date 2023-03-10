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
export class PxDimensions extends Dimensions { }

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

// TODO: get rid of this !
const ToBase64 = u8 => {
	return btoa(String.fromCharCode.apply(null, u8))
}

const FromBase64 = str => {
	return atob(str).split('').map(c => c.charCodeAt(0))
}

const updateHashState = (world, ntiles, texWidth) => {
	let c = 0
	const u8 = new Uint8Array(ntiles * ntiles)
	for (let i = 0; i < ntiles; i++) {
		for (let j = 0; j < ntiles; j++) {
			u8[c++] = world.map[i][j].texture.y * texWidth + world.map[i][j].texture.x;
		}
	}
	const state = ToBase64(u8)
	history.replaceState(undefined, undefined, `#${state}`)
}

const loadHashState = (map, state, ntiles, texWidth) => {
	const u8 = FromBase64(state)
	let c = 0
	for (let i = 0; i < ntiles; i++) {
		for (let j = 0; j < ntiles; j++) {
			const t = u8[c++] || 0
			const x = Math.trunc(t / texWidth)
			const y = Math.trunc(t % texWidth)
			map[i][j] = [x, y]
		}
	}
}

export { updateHashState, loadHashState };
