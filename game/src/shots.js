// Screenshot presets: deterministic scenes for ?shot=start|play|end.
// Each one shows a different face of the game — the title kitchen,
// a dish mid-assembly with tickets and the timer running, and the
// shift-over summary — so the judge sees the whole game at a glance.

import { RECIPES, SHIFT_SECONDS } from './config.js';
import { finishShift, newGame } from './state.js';

function ticketFrom(recipe, patience, maxPatience) {
  return {
    key: 1000 + Math.floor(Math.random() * 100),
    recipeId: recipe.id,
    name: recipe.name,
    needs: recipe.needs.slice(),
    price: recipe.price,
    color: recipe.color,
    patience,
    maxPatience,
  };
}

export function applyShot(state, name, seed) {
  const rngSeed = Number.isFinite(seed) ? seed : 7;
  if (name === 'start') {
    state.phase = 'title';
    state.frozen = true;
    return state;
  }
  if (name === 'end') {
    const done = newGame(rngSeed);
    done.phase = 'playing';
    done.served = 11;
    done.coins = 214;
    done.lost = 1;
    done.bestCombo = 4;
    done.combo = 3;
    done.elapsed = SHIFT_SECONDS;
    done.timeLeft = 0;
    finishShift(done);
    done.frozen = true;
    return done;
  }
  // Default: the play shot — three tickets, a dish half-built in the
  // wok, the clock mid-shift and a plate waiting to be filled.
  const playing = newGame(rngSeed);
  playing.phase = 'playing';
  playing.elapsed = 46;
  playing.timeLeft = SHIFT_SECONDS - 46;
  playing.coins = 46;
  playing.served = 3;
  playing.combo = 2;
  playing.bestCombo = 2;
  playing.orders = [
    ticketFrom(RECIPES[0], 18, 30),
    ticketFrom(RECIPES[1], 11, 25),
    ticketFrom(RECIPES[3], 22, 30),
  ];
  playing.wok = ['rice', 'egg', 'chili'];
  playing.cookTime = 2.3;
  playing.frozen = true;
  return playing;
}
