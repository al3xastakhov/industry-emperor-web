import { Graphics } from "./graphics";
import { InputController, InputState, MouseButtonEvent } from "./input";
import { Pos } from "./utils";
import { CellPos, WorldState } from "./world";

export enum GameModeType {
    IDLE, BUILD, INSPECT
}

export interface BuildModeData {
    tool: Pos,
}

export class GameInput {
    public readonly oldWorldState: WorldState;
    public readonly playerInput: PlayerInput;

    // TODO: combine
    public readonly mode: GameModeType;
    public readonly gameModeData: {} | BuildModeData;
}

export class GameOutput {
    public readonly newWorldState: WorldState;
    public readonly mode: GameModeType;

    // TODO: should be a separate entity / observable ?
    public readonly uiChanges: {
        component: string,
        method: string,
        data: any
    }[];
    
    constructor(newWorldState: WorldState, mode: GameModeType, uiChanges: any) {
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
 * Binds various inputs with graphics, producing input for the game logic
 */
export class GameController {
    private readonly graphics: Graphics;
    private readonly inputController: InputController;

    private oldWorldState: WorldState;

    private gameMode: GameModeType;
    private gameModeData?: BuildModeData;

    // required for camera moves
    private pressedKeys: Set<string> = new Set();

    constructor(graphics: Graphics, inputController: InputController) {
        this.graphics = graphics;
        this.inputController = inputController;
        this.gameMode = GameModeType.BUILD;
        this.setGameModeData({tool: {x: 0, y: 0}});
        this.oldWorldState = WorldState.EMPTY;
    }

    public setGameMode(m: GameModeType) {
        this.gameMode = m;
    }

    public setGameModeData(d: BuildModeData) {
        this.gameModeData = d;
    }

    public setWorldState(w: WorldState) {
        this.oldWorldState = w;
    }

    public tick(): GameInput {
        const rawInput = this.inputController.tick();

        this.handleKeyboardInput(rawInput);
        this.handleCameraMoves();

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

    private handleKeyboardInput(input: InputState) {
        input.keyEvents.forEach(e => {
            if (e.pressed) {
                this.pressedKeys.add(e.key);
            } else {
                this.pressedKeys.delete(e.key);
            }
        });
    }

    private handleCameraMoves() {
        const delta = 4.5;

        for (let k of this.pressedKeys) {
            switch (k) {
                case "ArrowUp":
                    this.graphics.camera.move({x: 0, y: -delta});
                    break;
                case "ArrowDown":
                    this.graphics.camera.move({x: 0, y: delta});
                    break;
                case "ArrowLeft":
                    this.graphics.camera.move({x: -delta, y: 0});
                    break;
                case "ArrowRight":
                    this.graphics.camera.move({x: delta, y: 0});
                    break;
            }
        }
    }

}
