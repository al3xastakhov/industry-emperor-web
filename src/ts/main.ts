import { Game } from "./game";
import { GameController, GameModeType } from "./game_controller";
import { Graphics } from "./graphics";
import { InputController } from "./input";
import { UI } from "./ui";
import { loadHashState, MousePos } from "./utils";
import { World } from "./world";

const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

let drawingContainer, canvas: HTMLCanvasElement;

let ntiles: number;

let frameCount = 0;

let world: World;
let ui: UI;
let graphics: Graphics;
let gameController: GameController;
let inputController: InputController;
let game: Game;

/* texture from https://opengameart.org/content/isometric-landscape */
const texture = new Image()
texture.src = "textures/bg.png"
texture.onload = _ => init()

const init = () => {

	let map = []; // [0,0]
	const k = 20;

	console.log(`Starting with k=${k}`);
	for (let i = 0; i < k; i++) {
		let cur = [];
		for (let j = 0; j < k; j++) {
			cur.push([0, 0]);
		}
		map.push(cur);
	}
	ntiles = map.length;
	loadHashState(map, document.location.hash.substring(1), ntiles, Graphics._textureWidth);

	drawingContainer = $("#drawing-container");
	canvas = $("#bg");
	window.addEventListener('resize', resize);

	ui = new UI();
	graphics = new Graphics(canvas, texture);
	world = World.fromTextureArray(map);
	game = new Game(world);
	inputController = new InputController();
	gameController = new GameController(graphics, inputController);

	resize();

	canvas.addEventListener('contextmenu', e => inputController.onMouseDown(e))
	canvas.addEventListener('mousemove', e => inputController.onMouseMove(e));
	canvas.addEventListener('mousedown', e => inputController.onMouseDown(e));
	window.addEventListener('keydown', e => inputController.onKeyDown(e));
	window.addEventListener('keyup', e => inputController.onKeyUp(e));

	// canvas.addEventListener('mousemove', onHover);
	// canvas.addEventListener('mouseup', e => inputController.onMouseUp(e));

	// TODO:
	canvas.addEventListener("wheel", onScroll);

	setInterval(tick, 1000 / 300);
	setInterval(() => {
		ui.fps.update(frameCount);
		frameCount = 0;
	}, 1000);

	renderTools();
}

function renderTools() {
	let tools = $('#tools');

	let toolCount = 0;
	for (let i = 0; i < Graphics._textureHeight; i++) {
		for (let j = 0; j < Graphics._textureWidth; j++) {
			const div = $c('div');
			div.id = `tool_${toolCount++}`;
			div.style.display = "block";
			/* width of 132 instead of 130  = 130 image + 2 border = 132 */
			div.style.backgroundPosition = `-${j * 130 + 2}px -${i * 230}px`;
			div.addEventListener('click', (_: MouseEvent) => {
				gameController.setGameMode(GameModeType.BUILD);
				gameController.setGameModeData({
					tool: {x: i, y: j},
				});
			});
			tools.appendChild(div);
		}
	}
}

function tick() {
	const gameInput = gameController.tick();
	const output = game.tick(gameInput);
	gameController.setGameMode(output.mode);
	gameController.setWorldState(output.newWorldState);

	// TODO: consider having separate "thread" for graphics
	graphics.tick(output.newWorldState);
	
	output.uiChanges.forEach(c => ui.execute(c));

	frameCount += 1;
}

function resize() {
	canvas.width = drawingContainer.offsetWidth;
	canvas.height = drawingContainer.offsetHeight;
}

function onScroll(e) {
	e.preventDefault();

	if (e.deltaY < 0) graphics.camera.zoomOut();
	else if (e.deltaY > 0) graphics.camera.zoomIn();
}

function activateTab(e) {
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
			gameController.setGameMode(GameModeType.BUILD);
			break;
		case "#details":
			gameController.setGameMode(GameModeType.INSPECT);
			break;
	}
}

// exports to dumb HTML
window["activateTab"] = activateTab;
