import { Graphics } from "./core/graphics";
import { InputController } from "./core/input";
import { loadHashState } from "./core/utils";
import { Game } from "./game";
import { GameController, GameModeType } from "./game_controller";
import { UI } from "./ui";
import { World } from "./world";

const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

let drawingContainer: HTMLElement, canvas: HTMLCanvasElement;

let frameCount = 0;

let ui: UI;
let graphics: Graphics;
let gameController: GameController;
let game: Game;

/* texture from https://opengameart.org/content/isometric-landscape */
const texture = new Image()
texture.src = "textures/bg.png"
texture.onload = _ => init()

const init = () => {

	const size = 20;
	let map = loadMap(size);
	let world = World.fromTextureArray(map);
	game = new Game(world);

	drawingContainer = $("#drawing-container");
	canvas = $("#bg");

	ui = new UI();
	graphics = new Graphics(canvas, texture);
	let inputController = new InputController();
	gameController = new GameController(graphics, inputController);

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

	renderTools();
}

function loadMap(size: number) {
	console.log(`Starting with k=${size}`);

	let map = []; // [0,0]
	for (let i = 0; i < size; i++) {
		let cur = [];
		for (let j = 0; j < size; j++) {
			cur.push([0, 0]);
		}
		map.push(cur);
	}

	loadHashState(map, document.location.hash.substring(1), map.length, Graphics._textureWidth);
	
	return map;
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

function activateTab(e: HTMLElement) {
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

// exports to dumb HTML
window["activateTab"] = activateTab;
