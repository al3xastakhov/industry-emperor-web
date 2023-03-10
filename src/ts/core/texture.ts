import { Dimensions, Pos, PxDimensions } from "./utils";

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
 * Holds multiple textures within single image source
 */
export class TexturePack {
    private image: ImageBitmap;
    public readonly src: string;

    // dims of the texture pack
    public readonly textureRows: number;
    public readonly textureCols: number;

    // size of a single texture
    public readonly textureDimensionsPx: Dimensions;

    private loaded = false;

    private textureCache = {};

    constructor(src: string, textureCols: number, textureRows: number, textureHeightPx: number, textureWidthPx: number) {
        this.src = src;
        this.textureCols = textureCols;
        this.textureRows = textureRows;
        this.textureDimensionsPx = new PxDimensions(textureWidthPx, textureHeightPx);
    }

    public async load(): Promise<TexturePack> {
        if (this.loaded) return Promise.resolve(this);
        this.image = await this.loadImageBitmap(this.src);
        this.loaded = true;
        return this;
    }

    public async get(pos: TexturePos): Promise<Texture> {
        const strPos = pos.toString();
        if (this.textureCache[strPos]) return Promise.resolve(this.textureCache[strPos]);

        const img = await createImageBitmap(
            this.image,
            pos.x * this.textureDimensionsPx.width,
            pos.y * this.textureDimensionsPx.height,
            this.textureDimensionsPx.width,
            this.textureDimensionsPx.height
        );

        this.textureCache[strPos] = new Texture(img);

        return this.textureCache[strPos];
    }

    public async getAll<K>(inputMap: Map<K, TexturePos[]>): Promise<Map<K, Texture[]>> {
        await this.load();

        let promises: Promise<[K, Texture[]]>[] = [];
        inputMap.forEach((positions, key) => {
            promises.push(
                Promise.all(positions.map(pos => this.get(pos)))
                    .then(txts => [key, txts])
            );
        });

        const map = new Map<K, Texture[]>();
        const all: [K, Texture[]][] = await Promise.all(promises);

        all.forEach((kv: [K, Texture[]]) => {
            map.set(kv[0], kv[1]);
        });

        return map;
    }

    private loadImageBitmap(url: string): Promise<ImageBitmap> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "blob";
            xhr.onload = function () {
                if (xhr.status === 200) {
                    const blob = xhr.response;
                    createImageBitmap(blob).then((imageBitmap) => {
                        resolve(imageBitmap);
                    });
                } else {
                    reject(new Error("Failed to load image from URL " + url));
                }
            };
            xhr.onerror = function () {
                reject(new Error("Failed to load image from URL " + url));
            };
            xhr.send();
        });
    }
}

