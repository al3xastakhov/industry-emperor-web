import { Graphics } from "./graphics";
import { Texture } from "./texture";
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

export class CellPos extends Pos { }


/**
    === Cell rendering ===

    |   |   |   |   |
    |   |(x)| x |   |
    |   | x | x |   |
    |   |   |   |   |

    (x) - cell with texture coordinates (0, 0) - should be rendered by core/graphics, 
    others are just part of the bigger entity X

    renderer should just know if `this cell's texture` has to be rendered

    relevant things for renderer:
    Cell {
        texture,
        should_render
    }
*/
export class RenderOptions {
    public renderTexture: boolean = true;

    public highlight: {
        color: string,
        opacity: number // 0..1
    } | null;

    constructor(renderTexture: boolean, highlight: {color: string, opacity: number} = null) {
        this.renderTexture = renderTexture;
        this.highlight = highlight;
    }
}

export class Cell {
    public texture: Texture;
    public pos: CellPos;
    public type: CellType;
    public renderOptions: RenderOptions;

    constructor(texture: Texture, pos: CellPos, type: CellType, renderOptions: RenderOptions) {
        this.texture = texture;
        this.pos = pos;
        this.type = type;
        this.renderOptions = renderOptions;
    }
}
