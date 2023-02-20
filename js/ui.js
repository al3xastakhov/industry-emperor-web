import { Cell } from "./game.js";

class UI {

    constructor() {
        this.infoTab = new InfoTab();
    }

}

class InfoTab {

    static selector = "#details";
    static noContent = "<p>Pick cell to inspect</p>";
    
    constructor() {
        this.el = $(InfoTab.selector)[0];
    }

    /**
     * @param {Cell} cell 
     */
    showCellInfo(cell, info) {
        this.el.innerHTML = `
            <table class="table table-sm">
                <tr>
                    <td>Type</td>
                    <td>${cell.type.description}</td>
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

export {UI};
