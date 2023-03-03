import { Graphics } from "./graphics";
import { Pos } from "./utils";

export enum CellType {
    Empty = "Empty",
    ResidentialBuilding = "ResidentialBuilding",
    Road = "Road",
    Factory = "Factory",
    Shop = "Shop",
    Storage = "Storage",
    CityDecor = "CityDecor",
};

// TODO: get rid of it eventually
export namespace CellType {
    export function fromNumber(arr: number[]) {
        const num = arr[0] * Graphics._textureWidth + arr[1];
        return num == 0 ? CellType.Empty
            : [47, 71].includes(num) ? CellType.Storage
                : [46, 54, 56, 66, 69].includes(num) ? CellType.Shop
                    : [1, 48, 49, 50, 51, 52, 53].includes(num) ? CellType.CityDecor
                        : [64, 65, 68].includes(num) ? CellType.Factory
                            : num < 54 ? CellType.Road
                                : CellType.ResidentialBuilding;
    }
}

export class CellPos extends Pos { }


export class ViewOptions {
    public highlight?: {
        color: string,
        opacity: number // 0..1
    };
}

export class Cell {
    public texture: Pos;
    public pos: CellPos;
    public type: CellType;
    public viewOptions: ViewOptions;

    constructor(texture: Pos, pos: CellPos, type: CellType, viewOptions: ViewOptions = {}) {
        this.texture = texture;
        this.pos = pos;
        this.type = type;
        this.viewOptions = viewOptions;
    }
}

export class World {

    /**
     * @param {[[number, number]]} arr
     * @returns {World}
     */
    static fromTextureArray(arr: [][]): World {
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
            let cur = [];
            for (let j = 0; j < arr[0].length; j++) {
                cur.push(new Cell(
                    { x: arr[i][j][1], y: arr[i][j][0] },
                    { x: i, y: j },
                    CellType.fromNumber(arr[i][j]),
                    {}
                ));
            }
            newArr.push(cur);
        }

        return new World(newArr);
    }

    public cells: Cell[][];
    public highlightedCells: Set<Cell>;

    constructor(map: Cell[][]) {
        this.cells = map;
        this.highlightedCells = new Set();
    }

    snapshot(): WorldState {
        return new WorldState(this.highlightedCells, this.cells);
    }

    getCell(pos: CellPos): Cell {
        if (!this.isValid(pos)) throw new Error(`Position not valid: ${JSON.stringify(pos)}`);
        return this.cells[pos.x][pos.y];
    }

    setCell(cell: Cell) {
        this.cells[cell.pos.x][cell.pos.y] = cell;
    }

    isValid(pos: Pos) {
        return pos.x >= 0 && pos.x < this.cells.length
            && pos.y >= 0 && pos.y < this.cells[0].length;
    }

    /**
     * BFSing around
     */
    getSurroundingCells(cell: Cell, range: number, cellTypes: Set<CellType>): Cell[] {
        range = range == -1 ? Number.MAX_VALUE : range;

        let result = [];

        let seen = new Set();
        let q = [];
        q.push(cell.pos);
        while (q.length > 0 && range > 0) {
            let cur = [];
            while (q.length > 0) {
                let pos = q.pop();
                if (!this.isValid(pos)) continue;

                if (seen.has(pos)) continue;
                seen.add(pos);

                let cell = this.getCell(pos);
                if (cellTypes.size === 0 || cellTypes.has(cell.type)) result.push(cell);

                for (const child of [
                    { x: cell.pos.x - 1, y: cell.pos.y },
                    { x: cell.pos.x + 1, y: cell.pos.y },
                    { x: cell.pos.x, y: cell.pos.y - 1 },
                    { x: cell.pos.x, y: cell.pos.y + 1 },
                ]) {
                    if (!seen.has(child)) cur.push(child);
                }
            }
            q = cur;
            range--;
        }

        return result;
    }

}

export class WorldState {
    static EMPTY = new WorldState(new Set(), []);

    public readonly highlightedCells: Set<Cell>;
    public readonly cells: Cell[][];

    constructor(highlightedCells: Set<Cell>, cells: Cell[][]) {
        this.highlightedCells = highlightedCells
        this.cells = cells
    }
}
