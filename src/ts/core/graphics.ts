import { WorldState } from "../world";
import { Cell, CellPos, CellType } from "./cell";
import { MousePos } from "./input";
import { Pos } from "./utils";

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
    static readonly	_tileWidth = 128;
	static readonly	_tileHeight = 64;

    // cell[][] rendering settings
    private tileWidth: number = Graphics._tileWidth;
    private tileHeight: number = Graphics._tileHeight;

    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    public camera: Camera;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.camera = new Camera();
    }

    get scale(): number {
        return this.camera.scale;
    }

    get viewCenter(): Pos {
        return this.camera.viewCenter;
    }

    public tick(state: WorldState) {
        this.draw(state.cells);
    }

    private draw(map: Cell[][]) {
        this.clearCtx();

        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        const tilesToHighlight: Cell[] = [];

        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                const tile = map[i][j];

                if (tile.renderOptions.renderTexture) {
                    this.drawTexture(tile, tile.type == CellType.Factory ? 0.5 : 1);
                }

                if (tile.renderOptions.highlight !== null) {
                    tilesToHighlight.push(tile);
                }
            }
        }

        // drawing on top of base layer
        for (let tile of tilesToHighlight) {
            const opt = tile.renderOptions.highlight;
            this.highlightTile(tile.pos, opt.color, opt.opacity);
        }

        this.ctx.restore();
    }

    public clearCtx() {
        // Store the current transformation matrix
        this.ctx.save();

        // Use the identity matrix while clearing the canvas
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Restore the transform
        this.ctx.restore();
    }

    public drawTexture(cell: Cell, opacity = 1) {
        const x = cell.pos.x;
        const y = cell.pos.y;
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.translate((y - x) * this.tileWidth / 2 - this.viewCenter.x, (x + y) * this.tileHeight / 2 - this.viewCenter.y);

        const w = cell.texture.img.width;
        this.ctx.drawImage(cell.texture.img, -w/2, -w, w, cell.texture.img.height);
        
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    public highlightTile(pos: CellPos, color: string, opacity = 1) {
        const x = pos.x, y = pos.y;
        this.ctx.save();
        this.ctx.translate((y - x) * this.tileWidth / 2 - this.viewCenter.x, (x + y) * this.tileHeight / 2 - this.viewCenter.y);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.globalAlpha = opacity;
        this.ctx.lineTo(this.tileWidth / 2, this.tileHeight / 2);
        this.ctx.lineTo(0, this.tileHeight);
        this.ctx.lineTo(-this.tileWidth / 2, this.tileHeight / 2);
        this.ctx.closePath();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    public getTilePosition(e: MousePos): CellPos {
        const __x = e.x / this.scale;
        const __y = e.y / this.scale;
        const _y = (__y + this.viewCenter.y) / this.tileHeight;
        const _x = (__x + this.viewCenter.x) / this.tileWidth;
        const x = Math.floor(_y - _x);
        const y = Math.floor(_x + _y);
        return { x, y };
    }

}
