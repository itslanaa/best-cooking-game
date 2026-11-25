// Mouse and keyboard: where a click lands, and which key does what.
// Input only calls the state functions and the sound effects; it
// never draws and never decides the rules.

import { INGREDIENTS } from './config.js';
import { addIngredient, clearWok, newGame, serveTicket } from './state.js';
import { computeLayout } from './render.js';
import { sfx, unlockAudio } from './audio.js';

function inside(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.w
    && point.y >= rect.y && point.y <= rect.y + rect.h;
}

export function attachInput(canvas, getState, setState, statusEl) {
  function announce() {
    const state = getState();
    statusEl.textContent = `Dapur Kilat: ${state.phase}, ${state.served} orders served, `
      + `${state.coins} coins, ${Math.ceil(state.timeLeft)} seconds left, wok has ${state.wok.length} ingredients.`;
  }

  function startShift() {
    const fresh = newGame((Date.now() % 100000) + 7);
    fresh.phase = 'playing';
    setState(fresh);
    sfx.cookReady();
    announce();
  }

  function pressServe() {
    const state = getState();
    const result = serveTicket(state);
    if (result === 'perfect') sfx.perfect();
    else if (result === 'served') sfx.serve();
    else sfx.error();
    announce();
  }

  function pressIngredient(id) {
    const state = getState();
    const result = addIngredient(state, id);
    if (result === 'added') sfx.add();
    else if (result === 'full' || result === 'dup') sfx.error();
    announce();
  }

  canvas.addEventListener('pointerdown', (event) => {
    unlockAudio();
    const state = getState();
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    const point = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    const layout = computeLayout();
    if (state.phase === 'title' && inside(point, layout.start)) {
      startShift();
      return;
    }
    if (state.phase === 'over' && inside(point, layout.again)) {
      startShift();
      return;
    }
    if (state.phase !== 'playing') return;
    if (inside(point, layout.serve)) { pressServe(); return; }
    if (inside(point, layout.trash)) { clearWok(state); sfx.error(); announce(); return; }
    for (const bin of layout.bins) {
      if (inside(point, bin)) { pressIngredient(bin.id); return; }
    }
    // Tapping a glowing ticket serves it too.
    const ticketIndex = state.orders.findIndex((ticket) => {
      const x = layout.board.x + 16 + state.orders.indexOf(ticket) * (layout.ticketW + 16);
      return inside(point, { x, y: layout.board.y + 8, w: layout.ticketW, h: layout.ticketH });
    });
    if (ticketIndex >= 0) pressServe();
  });

  window.addEventListener('keydown', (event) => {
    const state = getState();
    if (event.key === 'Enter' && (state.phase === 'title' || state.phase === 'over')) {
      unlockAudio();
      startShift();
      return;
    }
    if (state.phase !== 'playing') return;
    const byKey = INGREDIENTS.find((item) => item.key === event.key);
    if (byKey) {
      unlockAudio();
      pressIngredient(byKey.id);
      return;
    }
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      unlockAudio();
      pressServe();
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      clearWok(state);
      announce();
    }
  });
}
