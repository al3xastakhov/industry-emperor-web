import { MousePos } from "./utils";
import { CellPos } from "./world";

export enum MouseButtonEnum {
    UNKNOWN, LEFT, MIDDLE, RIGHT
}

export namespace MouseButtonEnum {
    export function fromNumber(n: number): MouseButtonEnum {
        switch (n) {
            case 1:
                return MouseButtonEnum.LEFT;
            case 2:
                return MouseButtonEnum.RIGHT;
            case 4:
                return MouseButtonEnum.MIDDLE;
            default:
                return MouseButtonEnum.UNKNOWN;
        }
    }
}

export class MouseButtonEvent {
    readonly isPress: boolean;
    readonly button: MouseButtonEnum;
    readonly clicks: number;
    readonly mousePos: MousePos;

    constructor(
        isPress: boolean,
        button: MouseButtonEnum,
        clicks: number,
        mousePos: MousePos
    ) {
        this.isPress = isPress;
        this.button = button;
        this.clicks = clicks;
        this.mousePos = mousePos;
    }
}

class InputState {
    public mousePos: MousePos = { x: 0, y: 0 };
    public buttonEvents: MouseButtonEvent[] = [];

    public setPos(m: MousePos): InputState {
        this.mousePos = m;
        return this;
    }

    public addClick(e: MouseButtonEvent): InputState {
        this.buttonEvents.push(e);
        return this;
    }
}

export class InputController {
    private input: InputState = new InputState();

    public onMouseMove(e: MouseEvent) {
        this.input.setPos(new MousePos(e.offsetX, e.offsetY));
    }

    public onMouseDown(e: MouseEvent) {
        e.preventDefault();

        this.input.addClick(new MouseButtonEvent(
            true, MouseButtonEnum.fromNumber(e.buttons), e.detail, new MousePos(e.offsetX, e.offsetY)
        ));
    }

    public onMouseUp(e: MouseEvent) {
        this.input.addClick(new MouseButtonEvent(
            false, MouseButtonEnum.fromNumber(e.buttons), e.detail, new MousePos(e.offsetX, e.offsetY)
        ));
    }

    public tick(): InputState {
        const out = this.input;
        this.input = new InputState().setPos(out.mousePos);
        return out;
    }
}
