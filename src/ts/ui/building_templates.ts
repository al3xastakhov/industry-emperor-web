import { CellDimensions } from "../core/cell";
import { Textures } from "../entities/assets";
import { BuildingTemplate, BuildingType } from "../entities/building";

export class BuildingTemplates {

    public static get storageTemplate() {
        return new BuildingTemplate(
            BuildingType.Storage,
            Textures.get(BuildingType.Storage)[0],
            new CellDimensions(2, 2),
        );
    }

    public static get factoryTemplate() {
        return new BuildingTemplate(
            BuildingType.Factory,
            Textures.get(BuildingType.Factory)[0],
            new CellDimensions(2, 2),
        );
    }

}
