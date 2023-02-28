import { Cell } from "./game";

export class UI {
    public readonly infoTab: InfoTab = new InfoTab();
    public readonly fps: FPS = new FPS();
}

export class FPS {
    static selector = "#fps";

    private readonly el: HTMLElement;
    
    constructor() {
        // @ts-ignore
        this.el = $(FPS.selector)[0];
    }

    update(fps: number): void {
        this.el.innerHTML = `FPS: ${fps}`
    }
}

export class InfoTab {

    static selector = "#details";
    static noContent = "<p>Pick cell to inspect</p>";

    private readonly el: HTMLElement;
    
    constructor() {
        // TODO: figure-out what to do with jquery
        // @ts-ignore
        this.el = $(InfoTab.selector)[0];
    }

    /**
     * @param {Cell} cell 
     */
    showCellInfo(cell: Cell, info: string): void {
        this.el.innerHTML = `
            <table class="table table-sm">
                <tr>
                    <td>Type</td>
                    <td>${cell.type}</td>
                </tr>
                <tr>
                    <td>Position</td>
                    <td>${JSON.stringify(cell.pos)}</td>
                </tr>
                <tr>
                    <td>Additional info</td>
                    <td>${info}</td>
                </tr>
            </table>
        `;
    }
}
