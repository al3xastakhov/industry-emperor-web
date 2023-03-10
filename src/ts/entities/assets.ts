import { Texture, TexturePack, TexturePos } from "../core/texture";
import { BuildingType } from "./building";

export class Textures {
    private static texturePos: Map<string, TexturePos[]> = new Map([
        [BuildingType.Empty, [new TexturePos(0, 0)]],
        [BuildingType.Storage, [new TexturePos(11, 3), new TexturePos(11, 5)]],

        // TODO: map more stuff !
        [BuildingType.Factory, [new TexturePos(0, 1)]],
        [BuildingType.ResidentialBuilding, [new TexturePos(0, 1)]],
        [BuildingType.Road, [new TexturePos(0, 1)]],
        [BuildingType.Shop, [new TexturePos(0, 1)]],
        [BuildingType.CityDecor, [new TexturePos(0, 1)]],
    ]);

    public static textures: Map<string, Texture[]> = new Map();

    public static async load(texturePack: TexturePack): Promise<void> {
        this.textures = await texturePack.getAll(Textures.texturePos);
    }

    public static get(type: BuildingType): Texture[] {
        const textures = this.textures.get(type);
        if (!textures) throw new Error(`No textures for type ${type}`);
        return textures;
    }
}
