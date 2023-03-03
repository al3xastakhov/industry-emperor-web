import { Graphics } from "./graphics";
import { InputController, MouseButtonEvent } from "./input";
import { Pos } from "./utils";
import { CellPos, WorldState } from "./world";

export enum GameMode {
    IDLE, BUILD, INSPECT
}

export interface BuildModeData {
    tool: Pos,
}

export class GameInput {
    public readonly oldWorldState: WorldState;
    public readonly playerInput: PlayerInput;
    
    // TODO: combine
    public readonly mode: GameMode;
    public readonly gameModeData: {} | BuildModeData;
}

export class GameOutput {
    public readonly newWorldState: WorldState;
    public readonly mode: GameMode;
    // TODO: change this dumb thing
    public readonly uiChanges: {
        component: string,
        method: string,
        data: any
    }[];
    constructor(newWorldState: WorldState, mode: GameMode, uiChanges: any) {
        this.newWorldState = newWorldState
        this.mode = mode
        this.uiChanges = uiChanges
    }
}

export class CellMouseButtonEvent {
    readonly rawEvent: MouseButtonEvent;
    readonly cellPos: CellPos;

    constructor(rawEvent: MouseButtonEvent, cellPos: CellPos) {
        this.rawEvent = rawEvent;
        this.cellPos = cellPos;
    }
}

export class PlayerInput {
    // hovered by mouse cell coords
    public readonly cellPos: CellPos;
    public readonly buttonEvents: CellMouseButtonEvent[];

    constructor(cellPos: CellPos, buttonEvents: CellMouseButtonEvent[]) {
        this.cellPos = cellPos;
        this.buttonEvents = buttonEvents;
    }
}

/**
 * Binds various input with graphics, producing input for the game logic
 */
export class GameController {
    private readonly graphics: Graphics;
    private readonly inputController: InputController;

    private oldWorldState: WorldState;
    
    private gameMode: GameMode;
    private gameModeData: {} | BuildModeData = {};

    constructor(graphics: Graphics, inputController: InputController) {
        this.graphics = graphics;
        this.inputController = inputController;
        this.gameMode = GameMode.BUILD;
        this.oldWorldState = WorldState.EMPTY;
    }

    public setGameMode(m: GameMode) {
        this.gameMode = m;
    }

    public setGameModeData(d: {} | BuildModeData) {
        this.gameModeData = d;
    }

    public setWorldState(w: WorldState) {
        this.oldWorldState = w;
    }

    public tick(): GameInput {
        const rawInput = this.inputController.tick();
        return {
            oldWorldState: this.oldWorldState,
            mode: this.gameMode,
            gameModeData: this.gameModeData,
            playerInput: {
                cellPos: this.graphics.getTilePosition(rawInput.mousePos),
                buttonEvents: rawInput.buttonEvents
                    .map(e => new CellMouseButtonEvent(e, this.graphics.getTilePosition(e.mousePos))),
            },
        };
    }

}
