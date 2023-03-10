import { Cell, CellDimensions, CellPos, CellType } from "./core/cell";
import { Dimensions, Pos } from "./core/utils";

export class World {

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

    getCellsAt(pos: CellPos, dimensions: CellDimensions): Cell[] {
        let result = [];
        for (let x = pos.x; x < pos.x + dimensions.width; x++) {
            for (let y = pos.y; y < pos.y + dimensions.height; y++) {
                result.push(this.getCell({ x, y }));
            }
        }
        return result;
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
