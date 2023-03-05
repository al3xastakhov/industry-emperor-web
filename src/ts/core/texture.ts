import { Pos } from "./utils";

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
    private image: HTMLImageElement;
    public readonly src: string;

    // dims of the texture pack
    public readonly textureRows: number;
    public readonly textureCols: number;

    // size of a single texture
    public readonly textureHeightPx: number;
    public readonly textureWidthPx: number;

    private textureCache = {};

    // TODO: rename args
    constructor(src: string, textureWidth: number, textureHeight: number) {
        this.src = src;
        this.textureRows = textureWidth
        this.textureCols = textureHeight
    }

    public load(): Promise<void> {
        this.image = new Image();
        this.image.src = this.src;

        return new Promise<void>((resolve, reject) => {
            this.image.addEventListener('load', () => resolve());
            this.image.addEventListener('error', (err: any) => reject(err));
        });
    }

    public async get(pos: TexturePos): Promise<Texture> {
        const strPos = pos.toString();
        if (this.textureCache[strPos]) return Promise.resolve(this.textureCache[strPos]);

        const img = await createImageBitmap(this.image, pos.x, pos.y, this.textureRows, this.textureCols);

        return this.textureCache[strPos] = new Texture(img);
    }

}


/*


|   |   |   |   |
|   |(x)| x |   |
|   | x | x |   |
|   |   |   |   |

(x) - cell with texture coordinates (0, 0) - should be rendered by core, 
others are just part of the bigger entity X

renderer should just know if `this cell's texture` has to be rendered

Cell {
    texture {
        img, should_render
    }
}

*/




