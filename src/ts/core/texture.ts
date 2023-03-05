import { loadImageBitmap, Pos } from "./utils";

export class Texture {
    public readonly img: ImageBitmap;

    constructor(img: ImageBitmap) {
        this.img = img
    }
}

/**
 * Coordinate of a single {@link Texture} in the given {@link TexturePack}
 */
export class TexturePos extends Pos { }

/**
 * Holds multiple textures within
 */
export class TexturePack {
    private image: ImageBitmap;
    public readonly src: string;

    // dims of the texture pack
    public readonly textureRows: number;
    public readonly textureCols: number;

    // size of a single texture
    public readonly textureHeightPx: number;
    public readonly textureWidthPx: number;

    private textureCache = {};

    constructor(src: string, textureCols: number, textureRows: number, textureHeightPx: number, textureWidthPx: number) {
        this.src = src;
        this.textureCols = textureCols;
        this.textureRows = textureRows;
        this.textureHeightPx = textureHeightPx;
        this.textureWidthPx = textureWidthPx;
    }

    public async load(): Promise<void> {
        this.image = await loadImageBitmap(this.src);
    }

    public async get(pos: TexturePos): Promise<Texture> {
        const strPos = pos.toString();
        if (this.textureCache[strPos]) return Promise.resolve(this.textureCache[strPos]);

        const img = await createImageBitmap(
            this.image,
            pos.x * this.textureWidthPx,
            pos.y * this.textureHeightPx,
            this.textureWidthPx,
            this.textureHeightPx
        );

        this.textureCache[strPos] = new Texture(img);

        return this.textureCache[strPos];
    }

}
