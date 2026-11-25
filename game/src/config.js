// Dapur Kilat — tuning numbers, ingredients and recipes.
// One dish is always exactly three ingredients, so every order is a
// small planning puzzle: which ticket can this wok finish right now?

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const SHIFT_SECONDS = 120;
export const TARGET_ORDERS = 10;
export const MAX_TICKETS = 4;

export const COOK_READY_SECONDS = 2.0;
export const COOK_BURNT_SECONDS = 6.0;
export const PERFECT_TIP = 6;
export const COMBO_STEP = 2;

export const INGREDIENTS = [
  { id: 'rice', name: 'Nasi', short: 'NS', key: '1', color: '#f7ead0', rim: '#c9a86a' },
  { id: 'noodle', name: 'Mie', short: 'MI', key: '2', color: '#f2c14e', rim: '#b97f16' },
  { id: 'egg', name: 'Telur', short: 'TL', key: '3', color: '#fff6d8', rim: '#e0a800' },
  { id: 'chicken', name: 'Ayam', short: 'AY', key: '4', color: '#c98a4b', rim: '#7a4a1d' },
  { id: 'veg', name: 'Sayur', short: 'SY', key: '5', color: '#7fb069', rim: '#3e6b2f' },
  { id: 'chili', name: 'Cabai', short: 'CB', key: '6', color: '#d64541', rim: '#8e1f1c' },
];

export const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['rice', 'egg', 'chili'], price: 18, color: '#e08a2e' },
  { id: 'mie-ayam', name: 'Mie Ayam', needs: ['noodle', 'chicken', 'veg'], price: 20, color: '#d9a441' },
  { id: 'ayam-geprek', name: 'Ayam Geprek', needs: ['rice', 'chicken', 'chili'], price: 22, color: '#c0392b' },
  { id: 'mie-goreng', name: 'Mie Goreng', needs: ['noodle', 'egg', 'veg'], price: 18, color: '#e67e22' },
  { id: 'sop-ayam', name: 'Sop Ayam', needs: ['chicken', 'veg', 'egg'], price: 20, color: '#7fb069' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

export function recipeById(id) {
  return RECIPES.find((dish) => dish.id === id);
}

// Later in the shift orders arrive faster and customers wait less.
export function spawnGapSeconds(elapsed) {
  if (elapsed < 40) return 9;
  if (elapsed < 80) return 7;
  return 5;
}

export function patienceSeconds(elapsed) {
  if (elapsed < 40) return 30;
  if (elapsed < 80) return 25;
  return 20;
}
