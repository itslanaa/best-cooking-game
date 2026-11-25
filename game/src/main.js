// The loop: size the canvas, read the shot preset from the URL,
// step the kitchen forward and draw it, every animation frame.

import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { newGame, tickGame } from './state.js';
import { drawGame } from './render.js';
import { attachInput } from './input.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const shotSeed = Number(params.get('seed') || '7');

let state = newGame(shotSeed);
if (shotName) {
  state = applyShot(state, shotName, shotSeed);
}

function fitCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = VIEW_WIDTH * ratio;
  canvas.height = VIEW_HEIGHT * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

window.addEventListener('resize', fitCanvas);
fitCanvas();

attachInput(canvas, () => state, (next) => { state = next; }, statusEl);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  tickGame(state, dt);
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
