declare const CellType: Readonly<{
    Empty: symbol;
    ResidentialBuilding: symbol;
    Road: symbol;
    Factory: symbol;
    Shop: symbol;
    Storage: symbol;
    CityDecor: symbol;
}>;
declare function cellTypeFromNumber(arr: any): symbol;
declare class World {
    static fromTextureArray(arr: any): World;
    constructor(map: any);
    tick(): void;
    getCell(pos: any): any;
    setCell(cell: any): void;
    isValid(pos: any): boolean;
    getSurroundingCells(cell: any, range: any, cellTypes: any): any[];
}
declare class Cell {
    constructor(texture: any, pos: any, type: any);
}
declare class Building extends Cell {
}
export { World, Cell, CellType, Building, cellTypeFromNumber };
