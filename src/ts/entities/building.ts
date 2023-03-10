import { Cell, CellDimensions, CellPos, CellType } from "../core/cell";
import { Texture } from "../core/texture";
import { Dimensions } from "../core/utils";
import { World } from "../world";


export enum BuildingType {
    Empty = "Empty",
    ResidentialBuilding = "ResidentialBuilding",
    Road = "Road",
    Factory = "Factory",
    Shop = "Shop",
    Storage = "Storage",
    CityDecor = "CityDecor",
};

export class BuildingTemplate {
    public type: BuildingType;
    public texture: Texture;
    public dimensions: CellDimensions;

    constructor(type: BuildingType, texture: Texture, dimensions: CellDimensions) {
        this.type = type;
        this.texture = texture;
        this.dimensions = dimensions;
    }

    public clone(): BuildingTemplate {
        return new BuildingTemplate(this.type, this.texture, this.dimensions);
    }

    public canPlace(world: World, pos: CellPos): boolean {
        return true;
    }

    public place(world: World, pos: CellPos): Building {
        if (!this.canPlace(world, pos)) throw new Error(`Cannot place building at pos [${pos.toString()}]`);

        const template = this.clone();
        const cells = world.getCellsAt(pos, this.dimensions);
        return new Building(cells, template);
    }
}

export class Building {
    public readonly template: BuildingTemplate;
    public readonly cells: Cell[];

    constructor(cells: Cell[], template: BuildingTemplate) {
        this.cells = cells;
        this.template = template;
        this.fixRendering();
    }

    /** 
     * As noted in {@link RenderOptions}, only upper-left cell's texture should be rendered
     */
    private fixRendering() {
        this.cells.forEach(cell => {
            // TODO: get rid cell type
            cell.type = CellType[this.template.type];

            cell.renderOptions.renderTexture = false;
            cell.texture = this.template.texture;
        });
        this.cells[0].renderOptions.renderTexture = true;
    }
}
