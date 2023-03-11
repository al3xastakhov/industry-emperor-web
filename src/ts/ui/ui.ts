import { Cell, CellPos, CellType, RenderOptions } from "../core/cell";
import { BuildingTemplate } from "../entities/building";
import { GameController, GameModeType } from "../game_controller";
import { BuildingTemplates } from "./building_templates";

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
    public readonly buildTab: BuildTab;

    constructor(gameController: GameController) {
        this.buildTab = new BuildTab(gameController);
    }

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

export class BuildTab {
    static selector = "#tools2";

    private readonly el: HTMLElement;

    private readonly gameController: GameController;

    private readonly buildings: BuildingTemplate[] = [
        BuildingTemplates.storageTemplate,
        BuildingTemplates.factoryTemplate
    ];

    constructor(gameController: GameController) {
        // @ts-ignore
        this.el = $(BuildTab.selector)[0];
        this.gameController = gameController;
    }

    render(): void {
        this.buildings.map(async b => {
            const blob = await b.texture.toBlob();
            const img = document.createElement("img");
            const url = URL.createObjectURL(blob);
            // no longer need to read the blob so it's revoked
            img.onload = () => URL.revokeObjectURL(url);
            img.src = url;
            return [b, img];
        }).forEach(async (f: Promise<[BuildingTemplate, HTMLImageElement]>) => {
            const [b, img] = await f;
            
            const div = document.createElement("div");
            div.style.display = "block";
            div.appendChild(img);
            div.appendChild(document.createTextNode(b.type));
            
            const that = this;
            div.addEventListener('click', async (_: MouseEvent) => {
                that.gameController.setGameMode(GameModeType.BUILD);
                that.gameController.setGameModeData({
                    template: b
                });
            });

            this.el.appendChild(div);
        });
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
