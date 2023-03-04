import { BuildModeData, GameInput, GameModeType, GameOutput } from "./game_controller";
import { Pos } from "./utils";
import { Cell, CellType, World, WorldState } from "./world";

export class Game {

    private world: World;

    constructor(world: World) {
        this.world = world;
    }

    public tick(input: GameInput): GameOutput {
        const output = new GameOutputBuilder();
        output.mode = input.mode;

        // clear highlighting
        this.world.highlightedCells.forEach(c => c.viewOptions.highlight = null);
        this.world.highlightedCells.clear();

        // add cursor
        if (this.world.isValid(input.playerInput.cellPos)) {
            this.world.highlightedCells.add(this.world.getCell(input.playerInput.cellPos));
        }

        this.handlePlayerInput(input, output);

        this.world.highlightedCells.forEach(c => c.viewOptions.highlight = {
            color: 'rgba(0,0,0,0.2)',
            opacity: 0.5
        });

        output.newWorldState = this.world.snapshot();
        return output;
    }

    // true, if tick hits in between `mousedown` and `mouseup` events
    // public readonly clickInProgress: boolean;
    private handlePlayerInput(input: GameInput, output: GameOutput) {
        const cellPos = input.playerInput.cellPos;
        input.playerInput.buttonEvents.filter(e => e.rawEvent.isPress).forEach(e => {
            switch (input.mode) {
                case GameModeType.BUILD:
                    console.log("build!")
                    const tool = (input.gameModeData as BuildModeData).tool;
                    this.world.setCell(new Cell(
                        Pos.swap(tool),
                        cellPos,
                        CellType.fromNumber(Pos.toArr(tool))
                    ));
                    break;
                case GameModeType.INSPECT:
                    const cell = this.world.getCell(cellPos);
                    const cells = this.world.getSurroundingCells(cell, 2, new Set());
                    cells.forEach(c => {
                        this.world.highlightedCells.add(c);
                        c.viewOptions.highlight = {
                            color: 'rgba(11, 127, 171,0.2)',
                            opacity: 0.5
                        };
                    });
                    output.uiChanges.push({
                        component: 'infoTab',
                        method: 'showCellInfo',
                        data: {
                            cell: cell,
                            info: `Cells around=[${cells.map(c => c.type).join(", ")}]`
                        }
                    });
                    break;
            }
        });
    }

    // // TODO: refactor to stop using graphics directly
    // function onClick(_: MouseEvent) {
    // 	let mouseCellPos = graphics.getTilePosition(input.mousePos);
    // 	if (!(mouseCellPos.x >= 0 && mouseCellPos.x < ntiles && mouseCellPos.y >= 0 && mouseCellPos.y < ntiles)) return;

    // 	if (mode === 'BUILD') {
    // 		world.setCell(new Cell({ x: tool[1], y: tool[0] }, mouseCellPos, cellTypeFromNumber(tool), {}));
    // 		updateHashState(world, ntiles, Graphics._textureWidth);
    // 		return;
    // 	}

    // 	if (mode === 'DETAILS') {
    // 		const cell = world.getCell(mouseCellPos);
    // 		const cells = world.getSurroundingCells(cell, 2, new Set());
    // 		for (const c of cells) {
    // 			graphics.highlightTile(c.pos, 'rgba(11, 127, 171,0.2)');
    // 		}
    // 		ui.infoTab.showCellInfo(cell, `Cells around=[${cells.map(c => c.type).join(", ")}]`);
    // 		return;
    // 	}
    // }


}


class GameOutputBuilder {
    public newWorldState: WorldState = WorldState.EMPTY;
    public mode: GameModeType = GameModeType.IDLE;
    public uiChanges: {
        component: string,
        method: string,
        data: any
    }[] = [];

    public build(): GameOutput {
        return new GameOutput(this.newWorldState, this.mode, this.uiChanges);
    }
}
