import { Cell } from "./world";

interface UiCommand {
    component: string
    method: string
    data: any
}

interface UiCommandDataInfoShowCell extends UiCommand {
    cell: Cell,
    info: String
}

export class UI {
    public readonly infoTab: InfoTab = new InfoTab();
    public readonly fps: FPS = new FPS();

    public execute(command: UiCommand): void {
        this[command.component][command.method](command.data);
    }
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

    showCellInfo(data: UiCommandDataInfoShowCell): void {
        this.el.innerHTML = `
            <table class="table table-sm">
                <tr>
                    <td>Type</td>
                    <td>${data.cell.type}</td>
                </tr>
                <tr>
                    <td>Position</td>
                    <td>${JSON.stringify(data.cell.pos)}</td>
                </tr>
                <tr>
                    <td>Additional info</td>
                    <td>${data.info}</td>
                </tr>
            </table>
        `;
    }
}
