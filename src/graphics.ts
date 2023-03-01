import { Cell, CellType, Pos } from "./game";

export class Camera {
    static readonly scaleDelta = 0.006;

    public scale: number = 1;
    public viewCenter: Pos = { x: -650, y: -50 };

    public zoomIn() {
        this.zoom(Camera.scaleDelta);
    }

    public zoomOut() {
        this.zoom(-Camera.scaleDelta);
    }

    private zoom(delta: number) {
        this.scale += delta;
        if (this.scale > 1.3) this.scale = 1.3;
        if (this.scale < 0.5) this.scale = 0.5;
    }

    public move(delta: Pos) {
        this.viewCenter.x += delta.x;
        this.viewCenter.y += delta.y;
    }
}

export class Graphics {
    public texture: HTMLImageElement;
    public tileWidth: number;
    public tileHeight: number;

    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    public camera: Camera;

    constructor(canvas: HTMLCanvasElement, texture: HTMLImageElement, tileWidth: number, tileHeight: number) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.texture = texture;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.camera = new Camera();
    }

    get scale(): number {
        return this.camera.scale;
    }

    get viewCenter(): Pos {
        return this.camera.viewCenter;
    }

    public drawMap(map: Cell[][]) {
        this.clearCtx(this.ctx);

        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                const tile = map[i][j];
                this.drawImageTile(new Pos(i, j), tile.texture, tile.type == CellType.Factory ? 0.5 : 1);
            }
        }

        this.ctx.restore();
    }

    public clearCtx(ctx) {
        // Store the current transformation matrix
        ctx.save();

        // Use the identity matrix while clearing the canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Restore the transform
        ctx.restore();
    }

    public drawImageTile(mapIdx: Pos, textureIdx: Pos, opacity: number = 1) {
        const x = mapIdx.x, y = mapIdx.y;
        let j = textureIdx.x;
        let i = textureIdx.y;
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.translate((y - x) * this.tileWidth / 2 - this.viewCenter.x, (x + y) * this.tileHeight / 2 - this.viewCenter.y);
        j *= 130;
        i *= 230;
        // TODO: get rid of direct texture ref here
        this.ctx.drawImage(this.texture, j, i, 130, 230, -65, -130, 130, 230);
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    public highlightTile(pos: Pos, color, opacity = 1) {
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate((pos.y - pos.x) * this.tileWidth / 2 - this.viewCenter.x, (pos.x + pos.y) * this.tileHeight / 2 - this.viewCenter.y);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.globalAlpha = opacity;
        this.ctx.lineTo(this.tileWidth / 2, this.tileHeight / 2);
        this.ctx.lineTo(0, this.tileHeight);
        this.ctx.lineTo(-this.tileWidth / 2, this.tileHeight / 2);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 1;
        this.ctx.fill();
        this.ctx.restore();
    }

    public getTilePosition(e: Pos) {
        const __x = e.x / this.scale;
        const __y = e.y / this.scale;
        const _y = (__y + this.viewCenter.y) / this.tileHeight;
        const _x = (__x + this.viewCenter.x) / this.tileWidth;
        const x = Math.floor(_y - _x);
        const y = Math.floor(_x + _y);
        return { x, y };
    }

}
