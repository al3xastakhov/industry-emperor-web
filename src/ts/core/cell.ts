import { Graphics } from "./graphics";
import { Pos } from "./utils";

// TODO: should not be a part of "core/cell"
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
