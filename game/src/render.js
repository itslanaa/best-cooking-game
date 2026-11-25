// Every pixel of the kitchen: the order board, the counter with the
// wok mid-assembly, the ingredient bins, the timer, the plate ready
// to serve, and the title / game-over overlays. Pure drawing — it
// reads state and never changes it.

import {
  COOK_BURNT_SECONDS, COOK_READY_SECONDS, INGREDIENTS, MAX_TICKETS,
  SHIFT_SECONDS, TARGET_ORDERS, VIEW_HEIGHT, VIEW_WIDTH,
  ingredientById,
} from './config.js';
import { matchingTicket, wokComplete } from './state.js';

export function computeLayout() {
  const binW = 150;
  const binH = 108;
  const gap = 18;
  const totalW = INGREDIENTS.length * binW + (INGREDIENTS.length - 1) * gap;
  const bins = INGREDIENTS.map((item, i) => ({
    id: item.id,
    x: (VIEW_WIDTH - totalW) / 2 + i * (binW + gap),
    y: VIEW_HEIGHT - binH - 22,
    w: binW,
    h: binH,
  }));
  return {
    board: { x: 36, y: 74, w: VIEW_WIDTH - 72, h: 128 },
    ticketW: 288,
    ticketH: 112,
    wok: { x: 250, y: 268, w: 460, h: 300 },
    plate: { x: 800, y: 268, w: 330, h: 300 },
    serve: { x: 830, y: 500, w: 270, h: 62 },
    trash: { x: 250, y: 500, w: 150, h: 62 },
    start: { x: VIEW_WIDTH / 2 - 150, y: 520, w: 300, h: 64 },
    again: { x: VIEW_WIDTH / 2 - 150, y: 540, w: 300, h: 64 },
    bins,
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 700} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// One ingredient drawn as food, not as a label: a rice mound, noodle
// swirls, a fried egg, a chicken drumstick, green leaves, red chillies.
export function drawIngredient(ctx, id, cx, cy, r) {
  const item = ingredientById(id);
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'rice') {
    ctx.fillStyle = item.color;
    ctx.beginPath(); ctx.arc(0, 6, r, Math.PI, 0); ctx.fill();
    ctx.fillRect(-r, 6, r * 2, r * 0.35);
    ctx.fillStyle = '#e8d5a8';
    ctx.beginPath(); ctx.arc(-r * 0.3, -2, 3, 0, 7); ctx.arc(r * 0.25, 2, 3, 0, 7); ctx.fill();
  } else if (id === 'noodle') {
    ctx.strokeStyle = item.color; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, i * r * 0.45);
      ctx.bezierCurveTo(-r * 0.3, i * r * 0.45 - r * 0.5, r * 0.3, i * r * 0.45 + r * 0.5, r * 0.8, i * r * 0.45);
      ctx.stroke();
    }
  } else if (id === 'egg') {
    ctx.fillStyle = '#fffdf2';
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.8, 0.3, 0, 7); ctx.fill();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath(); ctx.arc(r * 0.15, -r * 0.05, r * 0.45, 0, 7); ctx.fill();
    ctx.fillStyle = '#fbd34d';
    ctx.beginPath(); ctx.arc(r * 0.05, -r * 0.15, r * 0.18, 0, 7); ctx.fill();
  } else if (id === 'chicken') {
    ctx.fillStyle = item.color;
    ctx.beginPath(); ctx.ellipse(-r * 0.1, r * 0.1, r * 0.85, r * 0.65, -0.4, 0, 7); ctx.fill();
    ctx.strokeStyle = '#f7ead0'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.35); ctx.lineTo(r * 0.95, -r * 0.85); ctx.stroke();
    ctx.fillStyle = '#f7ead0';
    ctx.beginPath(); ctx.arc(r * 0.95, -r * 0.85, r * 0.22, 0, 7); ctx.fill();
  } else if (id === 'veg') {
    ctx.fillStyle = item.color;
    for (let i = 0; i < 3; i += 1) {
      const a = -0.7 + i * 0.7;
      ctx.save(); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0, -r * 0.45, r * 0.32, r * 0.62, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#3e6b2f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, r * 0.7); ctx.lineTo(0, -r * 0.2); ctx.stroke();
  } else if (id === 'chili') {
    ctx.strokeStyle = item.color; ctx.lineWidth = r * 0.42; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.75, 0.15 * Math.PI, 0.95 * Math.PI); ctx.stroke();
    ctx.strokeStyle = '#3e6b2f'; ctx.lineWidth = r * 0.2;
    ctx.beginPath(); ctx.moveTo(-r * 0.62, -r * 0.55); ctx.lineTo(-r * 0.95, -r * 0.95); ctx.stroke();
  }
  ctx.restore();
}

function drawTicket(ctx, ticket, x, y, w, h, glow) {
  ctx.save();
  if (glow) {
    ctx.shadowColor = '#ffd34d';
    ctx.shadowBlur = 22;
  }
  ctx.fillStyle = glow ? '#fff3c4' : '#fff8e7';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = glow ? '#e0a800' : '#d8c49a';
  ctx.lineWidth = glow ? 3 : 2;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();
  text(ctx, ticket.name, x + 14, y + 22, 19, '#3a2417', 800);
  text(ctx, `🪙 ${ticket.price}`, x + w - 14, y + 22, 17, '#8a6d1b', 800, 'right');
  ticket.needs.forEach((need, i) => {
    const cx = x + 34 + i * 62;
    const cy = y + 62;
    ctx.fillStyle = '#f3e2bd';
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, 7); ctx.fill();
    drawIngredient(ctx, need, cx, cy, 15);
  });
  const frac = Math.max(0, ticket.patience / ticket.maxPatience);
  ctx.fillStyle = '#e5d3ae';
  roundRect(ctx, x + 14, y + h - 18, w - 28, 9, 4);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#7fb069' : frac > 0.25 ? '#e0a800' : '#d64541';
  roundRect(ctx, x + 14, y + h - 18, (w - 28) * frac, 9, 4);
  ctx.fill();
}

function drawWok(ctx, state, layout) {
  const { x, y, w, h } = layout.wok;
  text(ctx, 'WOK — add 3 ingredients', x + w / 2, y - 16, 17, '#ffd9a0', 800, 'center');
  ctx.fillStyle = '#4a3226';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = '#6b4a33';
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();
  // The wok bowl.
  ctx.fillStyle = '#2e2e33';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 + 18, 165, 92, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#3d3d44';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 + 6, 165, 78, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#17171a';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 + 2, 148, 64, 0, 0, 7); ctx.fill();
  // Ingredients already in the wok, mid-assembly.
  state.wok.forEach((id, i) => {
    drawIngredient(ctx, id, x + w / 2 - 70 + i * 70, y + h / 2 + 4, 34);
  });
  if (state.wok.length === 0) {
    text(ctx, 'empty — pick from the counter below', x + w / 2, y + h / 2 + 4, 15, '#9a8a76', 600, 'center');
  }
  if (state.wok.length === 3 && state.cookTime !== null) {
    const frac = Math.min(1, state.cookTime / COOK_READY_SECONDS);
    const cx = x + w / 2;
    const cy = y + h - 42;
    ctx.strokeStyle = '#5a4636';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, cy, 26, 0, 7); ctx.stroke();
    ctx.strokeStyle = state.burnt ? '#d64541' : frac >= 1 ? '#7fb069' : '#f2c14e';
    ctx.beginPath(); ctx.arc(cx, cy, 26, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
    const label = state.burnt ? 'BURNT! Clear it' : frac >= 1 ? 'READY — serve now!' : 'cooking…';
    text(ctx, label, cx + 44, cy, 17, state.burnt ? '#ff8a80' : '#ffe9b0', 800);
  }
  if (state.burnt) {
    text(ctx, '🔥', x + w - 40, y + 34, 30, '#fff', 800, 'center');
  }
}

function drawPlate(ctx, state, layout) {
  const { x, y, w, h } = layout.plate;
  const ticket = matchingTicket(state);
  const ready = ticket && wokComplete(state) && !state.burnt;
  text(ctx, 'PLATE — ready to serve', x + w / 2, y - 16, 17, '#ffd9a0', 800, 'center');
  ctx.fillStyle = '#4a3226';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = ready ? '#7fb069' : '#6b4a33';
  ctx.lineWidth = ready ? 4 : 3;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();
  // A white plate.
  ctx.fillStyle = '#fbf7ee';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 + 10, 120, 74, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#d8c49a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 + 10, 96, 56, 0, 0, 7); ctx.stroke();
  if (ready) {
    ticket.needs.forEach((id, i) => {
      drawIngredient(ctx, id, x + w / 2 - 52 + i * 52, y + h / 2 + 6, 30);
    });
    text(ctx, ticket.name, x + w / 2, y + 44, 21, '#ffe9b0', 800, 'center');
    text(ctx, '✓ matches a ticket — SERVE!', x + w / 2, y + h - 30, 16, '#a8e6a3', 800, 'center');
  } else if (state.burnt) {
    text(ctx, 'Burnt — clear the wok', x + w / 2, y + h / 2 + 10, 17, '#8a6d6d', 700, 'center');
  } else {
    text(ctx, 'Build a dish in the wok —', x + w / 2, y + h / 2 - 8, 16, '#9a8a76', 600, 'center');
    text(ctx, 'it lands here when', x + w / 2, y + h / 2 + 18, 16, '#9a8a76', 600, 'center');
    text(ctx, 'it matches a ticket.', x + w / 2, y + h / 2 + 44, 16, '#9a8a76', 600, 'center');
  }
}

function drawBins(ctx, state, layout) {
  text(ctx, 'INGREDIENTS — click or press 1–6', 36, VIEW_HEIGHT - 152, 16, '#ffd9a0', 800);
  for (const bin of layout.bins) {
    const item = ingredientById(bin.id);
    const inWok = state.wok.includes(bin.id);
    ctx.fillStyle = inWok ? '#5a4636' : '#3d2a1e';
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 14);
    ctx.fill();
    ctx.strokeStyle = inWok ? '#ffd34d' : '#6b4a33';
    ctx.lineWidth = inWok ? 3 : 2;
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 14);
    ctx.stroke();
    drawIngredient(ctx, bin.id, bin.x + bin.w / 2, bin.y + 42, 26);
    text(ctx, item.name, bin.x + bin.w / 2, bin.y + 84, 16, '#ffe9b0', 800, 'center');
    text(ctx, `[${item.key}]`, bin.x + bin.w - 10, bin.y + 16, 13, '#c9a86a', 700, 'right');
    if (inWok) text(ctx, '✓ in wok', bin.x + bin.w / 2, bin.y + 100, 12, '#ffd34d', 700, 'center');
  }
}

function drawButton(ctx, rect, label, enabled, color) {
  ctx.fillStyle = enabled ? color : '#5a5348';
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.stroke();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1, 20, '#fff', 800, 'center');
}

function drawOverlay(ctx, title, lines, buttonLabel, layout, buttonRect) {
  ctx.fillStyle = 'rgba(20, 10, 6, 0.72)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  const panel = { x: 290, y: 110, w: 700, h: 500 };
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 20);
  ctx.fill();
  ctx.strokeStyle = '#e0a800';
  ctx.lineWidth = 4;
  roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 20);
  ctx.stroke();
  text(ctx, title, VIEW_WIDTH / 2, panel.y + 56, 40, '#3a2417', 900, 'center');
  lines.forEach((line, i) => {
    text(ctx, line.text, VIEW_WIDTH / 2, panel.y + 118 + i * 34, line.size || 18, line.color || '#5a4636', line.weight || 600, 'center');
  });
  if (buttonLabel) {
    drawButton(ctx, buttonRect, buttonLabel, true, '#2f9e44');
  }
}

export function drawGame(ctx, state) {
  const layout = computeLayout();
  // Warm kitchen walls and floor.
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.fillStyle = '#8a5a35';
  for (let i = 0; i < 16; i += 1) ctx.fillRect(i * 80, 0, 2, VIEW_HEIGHT);
  ctx.fillStyle = '#5d3a22';
  ctx.fillRect(0, VIEW_HEIGHT - 170, VIEW_WIDTH, 170);
  ctx.fillStyle = '#6b452a';
  ctx.fillRect(0, VIEW_HEIGHT - 170, VIEW_WIDTH, 6);

  // Header: name, shift timer, coins, orders.
  text(ctx, '🍳 DAPUR KILAT', 36, 36, 30, '#ffe9b0', 900);
  text(ctx, 'Sizzle & Serve', 372, 38, 16, '#d9b96a', 600);
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const clock = `${mins}:${String(secs).padStart(2, '0')}`;
  const urgent = state.phase === 'playing' && state.timeLeft <= 20;
  ctx.fillStyle = urgent ? '#d64541' : '#2b1a12';
  roundRect(ctx, VIEW_WIDTH / 2 - 90, 12, 180, 48, 12);
  ctx.fill();
  text(ctx, `⏱ ${clock}`, VIEW_WIDTH / 2, 37, 26, urgent ? '#fff' : '#ffd34d', 900, 'center');
  text(ctx, `🪙 ${state.coins}`, VIEW_WIDTH - 330, 36, 24, '#ffe9b0', 800, 'right');
  text(ctx, `served ${state.served}/${TARGET_ORDERS}`, VIEW_WIDTH - 36, 36, 20, '#ffd9a0', 700, 'right');
  if (state.combo >= 2) {
    text(ctx, `🔥 COMBO x${state.combo}`, VIEW_WIDTH - 180, 66, 18, '#ffb347', 900, 'right');
  }

  // Order board.
  text(ctx, 'ORDER BOARD', 36, 66, 15, '#ffd9a0', 800);
  ctx.fillStyle = '#3d2a1e';
  roundRect(ctx, layout.board.x, layout.board.y, layout.board.w, layout.board.h, 14);
  ctx.fill();
  if (state.orders.length === 0 && state.phase === 'playing') {
    text(ctx, 'No orders yet — the lunch rush is coming…', VIEW_WIDTH / 2, layout.board.y + 58, 18, '#c9a86a', 600, 'center');
  }
  const glowTicket = matchingTicket(state);
  state.orders.slice(0, MAX_TICKETS).forEach((ticket, i) => {
    const x = layout.board.x + 16 + i * (layout.ticketW + 16);
    drawTicket(ctx, ticket, x, layout.board.y + 8, layout.ticketW, layout.ticketH, glowTicket && glowTicket.key === ticket.key);
  });

  // Service rush banner.
  if (state.phase === 'playing' && state.timeLeft <= 30 && state.timeLeft > 0) {
    text(ctx, '⚡ SERVICE RUSH — orders come faster!', VIEW_WIDTH / 2, 232, 18, '#ffb347', 900, 'center');
  }

  drawWok(ctx, state, layout);
  drawPlate(ctx, state, layout);

  const canServe = Boolean(glowTicket) && !state.burnt;
  drawButton(ctx, layout.serve, 'SERVE  [Space]', canServe, '#2f9e44');
  drawButton(ctx, layout.trash, 'CLEAR  [Bksp]', state.wok.length > 0, '#8a5a35');

  drawBins(ctx, state, layout);

  if (state.flash && state.elapsed < state.flashUntil) {
    text(ctx, state.flash, VIEW_WIDTH / 2, 600, 26, '#ffd34d', 900, 'center');
  }

  if (state.phase === 'title') {
    drawOverlay(ctx, 'DAPUR KILAT', [
      { text: 'You run the wok station. Tickets land on the board —', size: 19 },
      { text: 'build each dish from exactly 3 ingredients, cook it,', size: 19 },
      { text: 'and serve it before the customer walks out.', size: 19 },
      { text: '', size: 12 },
      { text: 'Click ingredients (or press 1–6) → cook in the wok → SERVE [Space]', size: 17, color: '#2f6b2f', weight: 800 },
      { text: 'Serve while the ring is green for a PERFECT bonus. Burnt? Clear it.', size: 17, color: '#8e1f1c', weight: 800 },
      { text: `Serve ${TARGET_ORDERS} orders in ${SHIFT_SECONDS / 60} minutes for 3 stars. Good luck, chef!`, size: 17 },
    ], '▶  START SHIFT', layout, layout.start);
  }

  if (state.phase === 'over') {
    const starLine = '★'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
    drawOverlay(ctx, 'SHIFT OVER!', [
      { text: starLine, size: 44, color: '#e0a800', weight: 900 },
      { text: `Orders served: ${state.served}  •  Walked out: ${state.lost}`, size: 19 },
      { text: `Coins earned: ${state.coins}  •  Best combo: x${state.bestCombo}`, size: 19 },
      { text: state.stars === 3 ? 'Three stars — the lunch rush bows to you, chef!' : state.stars === 2 ? 'Two stars — a solid shift. One more push for three!' : state.stars === 1 ? 'One star — the wok is warm. Try again for more!' : 'No stars yet — the tickets beat you this time. Rematch?', size: 17, color: '#2f6b2f', weight: 700 },
    ], '↻  PLAY AGAIN', layout, layout.again);
  }
  return layout;
}
