import { World, Cell, CellType, cellTypeFromNumber, Pos } from "./game";
import { Graphics } from "./graphics";
import { UI } from "./ui";
import { loadHashState, updateHashState } from "./utils";

const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

let drawingContainer, canvas: HTMLCanvasElement, bg, tool, activeTool, isPlacing;

let mousePos: Pos = new Pos(0, 0);

let ntiles, tileWidth, tileHeight, texWidth, texHeight;

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

	ntiles = map.length

	tileWidth = 128
	tileHeight = 64
	texWidth = 12
	texHeight = 6

	loadHashState(map, document.location.hash.substring(1), ntiles, texWidth);

	graphics = new Graphics(canvas, texture, tileWidth, tileHeight);
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
	for (let i = 0; i < texHeight; i++) {
		for (let j = 0; j < texWidth; j++) {
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
	graphics.drawMap(world.map);
	drawCursor();
	world.tick();
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
	if (mousePos.x >= 0 && mousePos.x < ntiles && mousePos.y >= 0 && mousePos.y < ntiles) {
		graphics.highlightTile(mousePos, color, 0.5);
		// highlightTile(bg, mousePos.x, mousePos.y, color, 0.5);
	}
}

function onHover(e) {
	// TODO: set mouse coords in the world state instead
	mousePos = graphics.getTilePosition(new Pos(e.offsetX, e.offsetY));
}

function onKeyPress(event: KeyboardEvent) {
	const delta = 100;
	switch (event.keyCode) {
		case 38: // up arrow key
			graphics.camera.move(new Pos(0, -delta));
			break;
		case 40: // down arrow key
			graphics.camera.move(new Pos(0, delta));
			break;
		case 37: // left arrow key
			graphics.camera.move(new Pos(-delta, 0));
			break;
		case 39: // right arrow key
			graphics.camera.move(new Pos(delta, 0));
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
	const pos = mousePos; // TODO: is it ok to just use hover-based value?
	if (!(pos.x >= 0 && pos.x < ntiles && pos.y >= 0 && pos.y < ntiles)) return;

	if (mode === 'BUILD') {
		world.setCell(new Cell({ x: tool[1], y: tool[0] }, pos, cellTypeFromNumber(tool)));
		isPlacing = true
		updateHashState(world, ntiles, texWidth);
		return;
	}

	if (mode === 'DETAILS') {
		const cell = world.getCell(pos);
		const cells = world.getSurroundingCells(cell, 2, new Set());
		for (const c of cells) {
			graphics.highlightTile(c.pos, 'rgba(11, 127, 171,0.2)');
		}
		ui.infoTab.showCellInfo(cell, `Cells around=[${cells.map(c => c.type).join(", ")}]`);
		return;
	}
}

const unclick = () => {
	isPlacing = false;
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
