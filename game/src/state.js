// The kitchen's state and every rule that changes it: orders arriving,
// the wok filling up, cooking, serving, patience running out, the
// shift clock, coins, combo and stars. Rendering never mutates state.

import {
  COOK_BURNT_SECONDS, COOK_READY_SECONDS, MAX_TICKETS, PERFECT_TIP,
  RECIPES, SHIFT_SECONDS, TARGET_ORDERS, patienceSeconds, spawnGapSeconds,
} from './config.js';
import { makeRng, pickFrom } from './random.js';

let ticketCounter = 0;

export function newGame(seed) {
  return {
    phase: 'title',
    seed: seed >>> 0,
    rng: makeRng(seed),
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    spawnIn: 2.5,
    orders: [],
    wok: [],
    cookTime: null,
    burnt: false,
    coins: 0,
    served: 0,
    lost: 0,
    combo: 0,
    bestCombo: 0,
    flash: '',
    flashUntil: 0,
    stars: 0,
    frozen: false,
  };
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = a.slice().sort();
  const sortedB = b.slice().sort();
  return sortedA.every((value, i) => value === sortedB[i]);
}

export function matchingTicket(state) {
  if (state.wok.length !== 3) return null;
  return state.orders.find((ticket) => sameSet(ticket.needs, state.wok)) || null;
}

export function wokComplete(state) {
  return state.wok.length >= 3;
}

function spawnTicket(state) {
  const recipe = pickFrom(state.rng, RECIPES);
  const wait = patienceSeconds(state.elapsed);
  ticketCounter += 1;
  state.orders.push({
    key: ticketCounter,
    recipeId: recipe.id,
    name: recipe.name,
    needs: recipe.needs.slice(),
    price: recipe.price,
    color: recipe.color,
    patience: wait,
    maxPatience: wait,
  });
}

export function addIngredient(state, id) {
  if (state.phase !== 'playing' || state.frozen) return 'idle';
  if (state.wok.length >= 3) return 'full';
  if (state.wok.includes(id)) return 'dup';
  state.wok.push(id);
  if (state.wok.length === 3) state.cookTime = 0;
  return 'added';
}

export function clearWok(state) {
  if (state.phase !== 'playing') return;
  state.wok = [];
  state.cookTime = null;
  state.burnt = false;
}

// Serving pays the dish price plus a patience tip; serving inside the
// ready window (cooked, not burnt) pays a perfect bonus and grows combo.
export function serveTicket(state) {
  if (state.phase !== 'playing' || state.frozen) return 'idle';
  const ticket = matchingTicket(state);
  if (!ticket) return 'nomatch';
  const perfect = state.cookTime !== null
    && state.cookTime >= COOK_READY_SECONDS
    && state.cookTime <= COOK_BURNT_SECONDS;
  const patienceShare = Math.max(0, ticket.patience / ticket.maxPatience);
  const tip = Math.round(4 * patienceShare) + (perfect ? PERFECT_TIP : 0);
  state.coins += ticket.price + tip;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((item) => item.key !== ticket.key);
  state.wok = [];
  state.cookTime = null;
  state.burnt = false;
  state.flash = perfect ? `PERFECT! +${ticket.price + tip}` : `SERVED +${ticket.price + tip}`;
  state.flashUntil = state.elapsed + 1.4;
  return perfect ? 'perfect' : 'served';
}

export function finishShift(state) {
  state.phase = 'over';
  state.stars = state.served >= TARGET_ORDERS ? 3 : state.served >= 7 ? 2 : state.served >= 4 ? 1 : 0;
}

export function tickGame(state, dt) {
  if (state.phase !== 'playing' || state.frozen) return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
  if (state.timeLeft <= 0) {
    finishShift(state);
    return;
  }
  if (state.cookTime !== null) {
    state.cookTime += dt;
    if (state.cookTime > COOK_BURNT_SECONDS && !state.burnt) {
      state.burnt = true;
    }
  }
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.orders.length < MAX_TICKETS) {
    spawnTicket(state);
    state.spawnIn = spawnGapSeconds(state.elapsed);
  }
  for (const ticket of state.orders) ticket.patience -= dt;
  const walked = state.orders.filter((ticket) => ticket.patience <= 0);
  if (walked.length > 0) {
    state.orders = state.orders.filter((ticket) => ticket.patience > 0);
    state.lost += walked.length;
    state.combo = 0;
    state.flash = 'CUSTOMER WALKED OUT!';
    state.flashUntil = state.elapsed + 1.4;
  }
}
