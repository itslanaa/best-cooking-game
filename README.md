[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/itslanaa/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/itslanaa/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Dapur Kilat — Sizzle & Serve

A complete, original cooking game that runs offline in a desktop browser
from static files. You run the wok station of a small Indonesian kitchen.

## How to play

- Tickets land on the order board. Each dish needs exactly 3 ingredients.
- Click an ingredient bin (or press 1–6) to add it to the wok.
- When the wok holds the 3 ingredients of a ticket, the ticket glows and
  the dish lands on the plate. Press SERVE (or Space) before the
  customer's patience runs out.
- Serve while the cook ring is green for a PERFECT bonus and a growing
  combo. Wait too long and the dish burns — clear the wok and start over.
- Serve 10 orders in the 2-minute shift for 3 stars. Orders arrive faster
  and customers get less patient as the rush builds.

## Play it

```sh
node serve.mjs
# open http://localhost:8080 in desktop Chrome
```

Screenshots: `?shot=start`, `?shot=play`, `?shot=end` (add `&seed=7`).

## Layout

- `game/index.html` — page shell and canvas
- `game/src/config.js` — ingredients, recipes, tuning
- `game/src/random.js` — seeded random numbers
- `game/src/audio.js` — synthesized sound effects (Web Audio, no files)
- `game/src/state.js` — orders, wok, cooking, serving, scoring
- `game/src/input.js` — mouse and keyboard
- `game/src/render.js` — all canvas drawing
- `game/src/shots.js` — deterministic screenshot scenes
- `game/src/main.js` — game loop
- `main.ts` — hand-in program (copies game/ + screenshots/, writes dossier.json)
