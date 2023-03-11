import { Pos } from "./units";

export class MousePos extends Pos { }

export enum MouseButtonEnum {
    UNKNOWN, LEFT, MIDDLE, RIGHT
}

export enum Direction {
    UP, DOWN, LEFT, RIGHT
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
 
class InputState implements InputStateView {
    public mousePos: MousePos = { x: 0, y: 0 };
    public buttonEvents: MouseButtonEvent[] = [];
    public keyEvents: {key: string, pressed: boolean}[] = [];
    public scrollEvents: {directionY: Direction}[] = [];

    public setPos(m: MousePos): InputState {
        this.mousePos = m;
        return this;
    }

    public addClick(e: MouseButtonEvent): InputState {
        this.buttonEvents.push(e);
        return this;
    }

    public addKeyEvent(key: string, pressed: boolean): InputState {
        this.keyEvents.push({key: key, pressed: pressed});
        return this;
    }

    public addScrollEvent(directionY: Direction): InputState {
        this.scrollEvents.push({directionY: directionY});
        return this;
    }
}

export interface InputStateView {
    readonly mousePos: MousePos;
    readonly buttonEvents: MouseButtonEvent[];
    readonly keyEvents: {key: string, pressed: boolean}[];
    readonly scrollEvents: {directionY: Direction}[];
}

/**
 * Maintains input state of current frame; abstracts from platform input.
 */
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

    public onKeyDown(e: KeyboardEvent) {
        this.input.addKeyEvent(e.code, true);
    }

    public onKeyUp(e: KeyboardEvent) {
        this.input.addKeyEvent(e.code, false);
    }

    public onScroll(e: WheelEvent) {
        e.preventDefault();

        this.input.addScrollEvent(e.deltaY > 0 ? Direction.UP : Direction.DOWN);
    }

    /**
     * Flush & clear state
     */
    public tick(): InputStateView {
        const out = this.input;
        this.input = new InputState().setPos(out.mousePos);
        return out;
    }
}
