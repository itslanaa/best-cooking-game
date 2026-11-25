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
