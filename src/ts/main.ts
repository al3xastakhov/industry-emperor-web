import { World, Cell, CellType, cellTypeFromNumber, CellPos } from "./game";
import { Graphics } from "./graphics";
import { UI } from "./ui";
import { loadHashState, MousePos, updateHashState } from "./utils";

const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

let drawingContainer, canvas: HTMLCanvasElement, tool, activeTool;

let mouseCellPos: CellPos = new CellPos(0, 0);

let ntiles: number;

let frameCount = 0;

let world: World;
let ui = new UI();
let graphics: Graphics;
let mode = 'BUILD'; // UI state

/* texture from https://opengameart.org/content/isometric-landscape */
const texture = new Image()
texture.src = "textures/bg.png"
texture.onload = _ => init()

const init = () => {

	tool = [0, 0]

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

	drawingContainer = $("#drawing-container");
	canvas = $("#bg");

	window.addEventListener('resize', resize);

	ntiles = map.length;

	loadHashState(map, document.location.hash.substring(1), ntiles, Graphics._textureWidth);

	graphics = new Graphics(canvas, texture);
	world = World.fromTextureArray(map);

	resize();

	canvas.addEventListener('mousemove', onHover)
	canvas.addEventListener('contextmenu', e => e.preventDefault())
	canvas.addEventListener('mouseup', unclick)
	canvas.addEventListener('mousedown', onClick)
	canvas.addEventListener("wheel", onScroll);
	addEventListener("keydown", onKeyPress);

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
			div.addEventListener('click', e => {
				tool = [i, j];
				if (activeTool)
					$(`#${activeTool}`).classList.remove('selected');
				activeTool = e.target.id;
				$(`#${activeTool}`).classList.add('selected');
			});
			tools.appendChild(div);
		}
	}
}

function tick() {
	world.tick();
	graphics.drawMap(world.map);
	drawCursor();
	frameCount += 1;
}

function resize() {
	canvas.width = drawingContainer.offsetWidth;
	canvas.height = drawingContainer.offsetHeight;
}

// TODO: move to graphics, once establish world state
function drawCursor() {
	let color = 'rgba(0,0,0,0.2)';
	if (mode === 'DETAILS') {
		color = 'rgba(11,127,171,0.3)';
	}
	if (mouseCellPos.x >= 0 && mouseCellPos.x < ntiles && mouseCellPos.y >= 0 && mouseCellPos.y < ntiles) {
		graphics.highlightTile(mouseCellPos, color, 0.5);
	}
}

function onHover(e) {
	// TODO: set mouse coords in the world state instead
	mouseCellPos = graphics.getTilePosition(new MousePos(e.offsetX, e.offsetY));
}

function onKeyPress(event: KeyboardEvent) {
	const delta = 100;
	switch (event.code) {
		case "ArrowUp":
			graphics.camera.move({x: 0, y: -delta});
			break;
		case "ArrowDown":
			graphics.camera.move({x: 0, y: delta});
			break;
		case "ArrowLeft":
			graphics.camera.move({x: -delta, y: 0});
			break;
		case "ArrowRight":
			graphics.camera.move({x: delta, y: 0});
			break;
	}
}

function onScroll(e) {
	e.preventDefault();

	if (e.deltaY < 0) graphics.camera.zoomOut();
	else if (e.deltaY > 0) graphics.camera.zoomIn();
}

// TODO: refactor to stop using graphics directly
function onClick(_: MouseEvent) {
	if (!(mouseCellPos.x >= 0 && mouseCellPos.x < ntiles && mouseCellPos.y >= 0 && mouseCellPos.y < ntiles)) return;

	if (mode === 'BUILD') {
		world.setCell(new Cell({ x: tool[1], y: tool[0] }, mouseCellPos, cellTypeFromNumber(tool), {}));
		updateHashState(world, ntiles, Graphics._textureWidth);
		return;
	}

	if (mode === 'DETAILS') {
		const cell = world.getCell(mouseCellPos);
		const cells = world.getSurroundingCells(cell, 2, new Set());
		for (const c of cells) {
			graphics.highlightTile(c.pos, 'rgba(11, 127, 171,0.2)');
		}
		ui.infoTab.showCellInfo(cell, `Cells around=[${cells.map(c => c.type).join(", ")}]`);
		return;
	}
}

const unclick = () => {
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
			mode = "BUILD";
			break;
		case "#details":
			mode = "DETAILS";
			break;
	}
}

// exports to dumb HTML
window["activateTab"] = activateTab;
