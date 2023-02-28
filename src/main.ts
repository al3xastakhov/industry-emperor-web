import { World, Cell, CellType, cellTypeFromNumber, Pos } from "./game";
import { UI } from "./ui";

const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

let drawingContainer, canvas, bg, canvasFg, fg, tool, activeTool, isPlacing;
let viewCenter, scale = 1;

let mousePos = [0, 0];

let ntiles, tileWidth, tileHeight, texWidth, texHeight;

let frameCount = 0;

let world: World;
let ui = new UI();

let mode = 'BUILD'; // UI state

/* texture from https://opengameart.org/content/isometric-landscape */
const texture = new Image()
texture.src = "textures/bg.png"
texture.onload = _ => init()

const init = () => {

	tool = [0,0]

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

	scale = 1;
	viewCenter = {x: -650, y: -50};

	drawingContainer = $("#drawing-container");
	canvas = $("#bg");
	canvasFg = $('#fg');
	bg = canvas.getContext("2d");
	fg = canvasFg.getContext('2d');

	window.addEventListener('resize', resize);

	ntiles = map.length

	tileWidth = 128
	tileHeight = 64
	texWidth = 12
	texHeight = 6

	loadHashState(map, document.location.hash.substring(1));
	
	world = World.fromTextureArray(map);

	resize();

	canvasFg.addEventListener('mousemove', onHover)
	canvasFg.addEventListener('contextmenu', e => e.preventDefault())
	canvasFg.addEventListener('mouseup', unclick)
	canvasFg.addEventListener('mousedown', onClick)
	// canvasFg.addEventListener('touchend', click)
	// canvasFg.addEventListener('pointerup', click)
	canvasFg.addEventListener("wheel", onScroll);
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
	drawMap();
	drawCursor();
	world.tick();
	frameCount += 1;
}

function resize() {
	canvas.width = drawingContainer.offsetWidth;
	canvas.height = drawingContainer.offsetHeight;
	canvasFg.width = canvas.width;
	canvasFg.height = canvas.height;
}

// From https://stackoverflow.com/a/36046727
const ToBase64 = u8 => {
	return btoa(String.fromCharCode.apply(null, u8))
}

const FromBase64 = str => {
	return atob(str).split('').map( c => c.charCodeAt(0) )
}

const updateHashState = () => {
	let c = 0
	const u8 = new Uint8Array(ntiles*ntiles)
	for(let i = 0; i < ntiles; i++){
		for(let j = 0; j < ntiles; j++){
			u8[c++] = world.map[i][j].texture.y*texWidth + world.map[i][j].texture.x;
		}
	}
	const state = ToBase64(u8)
	history.replaceState(undefined, undefined, `#${state}`)
}

const loadHashState = (map, state) => {
	const u8 = FromBase64(state)
	let c = 0
	for(let i = 0; i < ntiles; i++) {
		for(let j = 0; j < ntiles; j++) {
			const t = u8[c++] || 0
			const x = Math.trunc(t / texWidth)
			const y = Math.trunc(t % texWidth)
			map[i][j] = [x,y]
		}
	}
}

function clearCtx(ctx) {
	// Store the current transformation matrix
	ctx.save();

	// Use the identity matrix while clearing the canvas
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Restore the transform
	ctx.restore();
}

function drawMap() {
	clearCtx(bg);

	bg.save();
	bg.scale(scale, scale);

	for(let i = 0; i < ntiles; i++){
		for(let j = 0; j < ntiles; j++){
			const tile = world.map[i][j];
			drawImageTile(bg, new Pos(i, j), tile.texture, tile.type == CellType.Factory ? 0.5 : 1);
		}
	}

	bg.restore();
}

function drawCursor() {
	clearCtx(fg);

	let color = 'rgba(0,0,0,0.2)';
	if (mode === 'DETAILS') {
		color = 'rgba(11,127,171,0.3)';
	}
// @ts-ignore
	if (mousePos.x >= 0 && mousePos.x < ntiles && mousePos.y >= 0 && mousePos.y < ntiles) {
		// @ts-ignore
		drawTile(fg, mousePos.x, mousePos.y, color);
	}
}

const drawTile = (c,x,y,color) => {
	c.save()
	c.scale(scale, scale);
	c.translate((y-x) * tileWidth/2 - viewCenter.x,(x+y)*tileHeight/2 - viewCenter.y)
	c.beginPath()
	c.moveTo(0,0)
	c.lineTo(tileWidth/2,tileHeight/2)
	c.lineTo(0,tileHeight)
	c.lineTo(-tileWidth/2,tileHeight/2)
	c.closePath()
	c.fillStyle = color
	c.fill()
	c.restore()
}

const drawImageTile = (c: CanvasRenderingContext2D, mapIdx: Pos, textureIdx: Pos, opacity: number = 1) => {
	const x = mapIdx.x, y = mapIdx.y;
	let j = textureIdx.x;
	let i = textureIdx.y;
	c.save();
	c.globalAlpha = opacity;
	c.translate((y-x) * tileWidth/2 - viewCenter.x,(x+y)*tileHeight/2 - viewCenter.y);
	j *= 130;
	i *= 230;
	c.drawImage(texture,j,i,130,230,-65,-130,130,230);
	c.globalAlpha = 1;
	c.restore();
}

const getTilePosition = e => {
	const __x = e.offsetX / scale;
	const __y = e.offsetY / scale;
	const _y = (__y + viewCenter.y) / tileHeight;
	const _x = (__x + viewCenter.x) / tileWidth;
	const x = Math.floor(_y-_x);
	const y = Math.floor(_x+_y);
	return {x, y};
}

function onHover(e) {
	// if (isPlacing) onClick(e)
	// @ts-ignore
	mousePos = getTilePosition(e)
	// console.log(pos);
}

function onKeyPress(event) {
	const delta = 100;
	switch (event.keyCode) {
		case 38: // up arrow key
			viewCenter.y -= delta;
			break;
		case 40: // down arrow key
			viewCenter.y += delta;
			break;
		case 37: // left arrow key
			viewCenter.x -= delta;
			break;
		case 39: // right arrow key
			viewCenter.x += delta;
			break;
	}
}

function onScroll(e) {
	// TODO: implement correctly!
	e.preventDefault();

	const delta = 0.006;

	if (e.deltaY < 0) scale -= delta;
	else if (e.deltaY > 0) scale += delta;
	
	if (scale > 1.3) scale = 1.3;
	if (scale < 0.5) scale = 0.5;
}

const onClick = e => {
	const pos = getTilePosition(e)
	if (!(pos.x >= 0 && pos.x < ntiles && pos.y >= 0 && pos.y < ntiles)) return;

	if (mode === 'BUILD') {
		world.setCell(new Cell({x: tool[1], y: tool[0]}, pos, cellTypeFromNumber(tool)));
		isPlacing = true
		updateHashState();
		return;
	}
	
	if (mode === 'DETAILS') {
		const cell = world.getCell(pos);
		const cells = world.getSurroundingCells(cell, 2, new Set());
		for (const c of cells) {
			drawTile(fg,c.pos.x,c.pos.y,'rgba(11, 127, 171,0.2)');
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
// @ts-ignore
window.activateTab = activateTab;