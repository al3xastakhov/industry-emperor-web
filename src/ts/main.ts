import { Cell, CellPos, CellType, RenderOptions } from "./core/cell";
import { Camera, Graphics } from "./core/graphics";
import { InputController } from "./core/input";
import { TexturePack, TexturePos } from "./core/texture";
import { loadHashState } from "./core/utils";
import { Textures } from "./entities/assets";
import { Game } from "./game";
import { GameController, GameModeType } from "./game_controller";
import { CoreSettings, GameSettings } from "./settings";
import { BuildingTemplates } from "./ui/building_templates";
import { UI } from "./ui/ui";
import { World } from "./world";

const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

let drawingContainer: HTMLElement, canvas: HTMLCanvasElement;

let frameCount = 0;

let ui: UI;
let graphics: Graphics;
let gameController: GameController;
let game: Game;

// texture source: https://opengameart.org/content/isometric-landscape
const texturePack = new TexturePack("assets/textures/bg.png", 12, 6, 230, 130);
texturePack.load()
	.then(tp => Textures.load(tp))
	.then(_ => main());

async function main() {
	const size = GameSettings.World.size;
	let map = MapLoader.loadMap(size);
	let world = await MapLoader.fromTextureArray(map);
	game = new Game(world);

	drawingContainer = $("#drawing-container");
	canvas = $("#bg");

	let camera = new Camera(CoreSettings.Camera.scaleDelta);
	graphics = new Graphics(canvas, camera, CoreSettings.Graphics.tileWidth, CoreSettings.Graphics.tileHeight);
	let inputController = new InputController();
	gameController = new GameController(graphics, inputController);
	ui = new UI(gameController);

	onResize();

	// Input bindings
	window.addEventListener('resize', onResize);
	canvas.addEventListener('contextmenu', e => inputController.onMouseDown(e));
	canvas.addEventListener('mousemove', e => inputController.onMouseMove(e));
	canvas.addEventListener('mousedown', e => inputController.onMouseDown(e));
	// not needed for now
	// canvas.addEventListener('mouseup', e => inputController.onMouseUp(e));
	canvas.addEventListener('wheel', e => inputController.onScroll(e));
	window.addEventListener('keydown', e => inputController.onKeyDown(e));
	window.addEventListener('keyup', e => inputController.onKeyUp(e));

	// TODO: change timers to request-animation-frame
	// Game loop
	setInterval(tick, 1000 / 300);
	setInterval(() => {
		ui.fps.update(frameCount);
		frameCount = 0;
	}, 1000);

	let building = BuildingTemplates.storageTemplate.place(world, new CellPos(0, 0));
	BuildingTemplates.factoryTemplate.place(world, new CellPos(0, 4));

	ui.buildTab.render();
	ToolsUi.renderTools(texturePack.textureRows, texturePack.textureCols);

	// debug object, available in console
	let dbg = { ui, graphics, world, gameController, game, building, assets: {Textures} };
	window["dbg"] = dbg;
}

function tick() {
	const gameInput = gameController.tick();
	const gameOutput = game.tick(gameInput);
	gameController.setGameMode(gameOutput.mode);
	gameController.setWorldState(gameOutput.newWorldState);

	// TODO: consider having separate "thread" for graphics
	graphics.tick(gameOutput.newWorldState);

	gameOutput.uiChanges.forEach(c => ui.execute(c));

	frameCount += 1;
}

function onResize() {
	canvas.width = drawingContainer.offsetWidth;
	canvas.height = drawingContainer.offsetHeight;
}

// TODO: get rid of it eventually
namespace MapLoader {
	export async function fromTextureArray(arr: [][]): Promise<World> {
		let newArr = [];
		for (let i = 0; i < arr.length; i++) {
			let cur = [];
			for (let j = 0; j < arr[0].length; j++) {
				const texture = await texturePack.get(new TexturePos(arr[i][j][1], arr[i][j][0]));
				cur.push(new Cell(
					texture,
					{ x: i, y: j },
					cellTypeFromNumber(arr[i][j], texturePack.textureCols),
					new RenderOptions(true)
				));
			}
			newArr.push(cur);
		}

		return new World(newArr);
	}

	export function cellTypeFromNumber(arr: number[], cols: number) {
		const num = arr[0] * cols + arr[1];
		return num == 0 ? CellType.Empty
			: [47, 71].includes(num) ? CellType.Storage
				: [46, 54, 56, 66, 69].includes(num) ? CellType.Shop
					: [1, 48, 49, 50, 51, 52, 53].includes(num) ? CellType.CityDecor
						: [64, 65, 68].includes(num) ? CellType.Factory
							: num < 54 ? CellType.Road
								: CellType.ResidentialBuilding;
	}

	export function loadMap(size: number) {
		console.log(`Starting with k=${size}`);

		let map = []; // [0,0]
		for (let i = 0; i < size; i++) {
			let cur = [];
			for (let j = 0; j < size; j++) {
				cur.push([0, 0]);
			}
			map.push(cur);
		}

		loadHashState(map, document.location.hash.substring(1), map.length, texturePack.textureCols);

		return map;
	}
}

// TODO: get rid of it
namespace ToolsUi {
	export function activateTab(e: HTMLElement) {
		const selector = e.getAttribute("data-tab");
		for (const child of $("#instruments").children) {
			child.style.display = "none";
		}
		for (const child of $("#btns").children) {
			child.classList.remove("btn-dark");
			child.classList.add("btn-outline-dark");
		}
		e.classList.remove("btn-outline-dark");
		e.classList.add("btn-dark");
		$(selector).style.display = "flex";

		switch (selector) {
			case "#tools":
			case "#tools2":
				gameController.setGameMode(GameModeType.BUILD);
				break;
			case "#details":
				gameController.setGameMode(GameModeType.INSPECT);
				break;
		}
	}

	export function renderTools(rows: number, cols: number) {
		let tools = $('#tools');

		let toolCount = 0;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const div = $c('div');
				div.id = `tool_${toolCount++}`;
				div.style.display = "block";
				/* width of 132 instead of 130  = 130 image + 2 border = 132 */
				div.style.backgroundPosition = `-${j * texturePack.textureDimensionsPx.width + 2}px -${i * texturePack.textureDimensionsPx.height}px`;
				div.title = MapLoader.cellTypeFromNumber([i, j], texturePack.textureCols);
				div.addEventListener('click', async (_: MouseEvent) => {
					console.log(div.title);
				});
				tools.appendChild(div);
			}
		}
	}
}


// exports to dumb HTML
window["activateTab"] = ToolsUi.activateTab;
