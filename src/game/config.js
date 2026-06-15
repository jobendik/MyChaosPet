// =============================================================================
// My Chaos Pet — game content & balance
// All tunable data lives here so design can be iterated without touching logic.
// =============================================================================

export const SAVE_KEY = 'my-chaos-pet-save-v2';

// ---- Evolution stages -------------------------------------------------------
// The pet visually transforms as it levels up. Each stage is a milestone moment.
export const STAGES = [
  { id: 'hatchling', name: 'Hatchling', minLevel: 1, scale: 0.74, blurb: 'A tiny ball of curious chaos.' },
  { id: 'sprout', name: 'Sprout', minLevel: 4, scale: 0.86, blurb: 'Growing fast and full of bounce.' },
  { id: 'spark', name: 'Spark', minLevel: 8, scale: 0.96, blurb: 'Crackling with playful energy.' },
  { id: 'nova', name: 'Nova', minLevel: 13, scale: 1.06, blurb: 'Radiant, confident, and a little extra.' },
  { id: 'astral', name: 'Astral', minLevel: 20, scale: 1.16, blurb: 'A cosmic legend among chaos pets.' },
];

export function stageForLevel(level) {
  let s = STAGES[0];
  for (const stage of STAGES) if (level >= stage.minLevel) s = stage;
  return s;
}

export function nextStage(level) {
  return STAGES.find((s) => s.minLevel > level) || null;
}

// ---- Vital stats ------------------------------------------------------------
export const STAT_META = [
  { key: 'hunger', label: 'Hunger', icon: '🍜', color: '#fb923c', decay: 1.15 },
  { key: 'energy', label: 'Energy', icon: '⚡', color: '#fbbf24', decay: 0.55 },
  { key: 'hygiene', label: 'Hygiene', icon: '🫧', color: '#38bdf8', decay: 0.7 },
  { key: 'fun', label: 'Fun', icon: '🎈', color: '#f472b6', decay: 0.95 },
  { key: 'social', label: 'Social', icon: '💬', color: '#a855f7', decay: 0.6 },
];

// ---- Skins (drive the pet's body gradient) ----------------------------------
export const SKINS = [
  { id: 'bubblegum', name: 'Bubblegum', price: 0, stops: ['#fbcfe8', '#f472b6', '#db2777'], glow: '#f472b6' },
  { id: 'signal', name: 'Signal Blue', price: 220, stops: ['#bae6fd', '#38bdf8', '#2563eb'], glow: '#38bdf8' },
  { id: 'lime', name: 'Lime Pop', price: 300, stops: ['#d9f99d', '#84cc16', '#15803d'], glow: '#a3e635' },
  { id: 'honey', name: 'Honey Gold', price: 520, stops: ['#fef08a', '#fbbf24', '#ea580c'], glow: '#fbbf24' },
  { id: 'grape', name: 'Cosmic Grape', price: 640, stops: ['#e9d5ff', '#a855f7', '#6d28d9'], glow: '#a855f7' },
  { id: 'mint', name: 'Mint Cream', price: 700, stops: ['#a7f3d0', '#2dd4bf', '#0d9488'], glow: '#2dd4bf' },
  { id: 'ember', name: 'Ember', price: 900, stops: ['#fecaca', '#f87171', '#b91c1c'], glow: '#f87171' },
  { id: 'galaxy', name: 'Galaxy', price: 30, currency: 'gems', stops: ['#a5f3fc', '#c084fc', '#1e1b4b'], glow: '#c084fc', special: true },
];

// ---- Hats -------------------------------------------------------------------
export const HATS = [
  { id: 'none', name: 'No Hat', price: 0, icon: null },
  { id: 'party', name: 'Party Cone', price: 160, icon: 'party' },
  { id: 'crown', name: 'Tiny Crown', price: 420, icon: 'crown' },
  { id: 'antenna', name: 'Signal Antenna', price: 360, icon: 'antenna' },
  { id: 'bow', name: 'Star Bow', price: 280, icon: 'bow' },
  { id: 'halo', name: 'Cosmic Halo', price: 20, currency: 'gems', icon: 'halo', special: true },
  { id: 'horns', name: 'Chaos Horns', price: 780, icon: 'horns' },
  { id: 'cap', name: 'Beanie', price: 240, icon: 'cap' },
];

// ---- Faces (expression presets layered on top of mood) ----------------------
export const FACES = [
  { id: 'classic', name: 'Classic', price: 0 },
  { id: 'sparkle', name: 'Sparkle Eyes', price: 260 },
  { id: 'cool', name: 'Cool Shades', price: 380 },
  { id: 'kawaii', name: 'Kawaii', price: 320 },
  { id: 'robot', name: 'Robot Optics', price: 520 },
];

// ---- Auras (orbiting particle ring around the pet) --------------------------
export const AURAS = [
  { id: 'none', name: 'No Aura', price: 0, color: null },
  { id: 'sparks', name: 'Spark Ring', price: 480, color: '#fbbf24' },
  { id: 'petals', name: 'Petal Drift', price: 540, color: '#f472b6' },
  { id: 'orbit', name: 'Star Orbit', price: 25, currency: 'gems', color: '#67e8f9', special: true },
  { id: 'flames', name: 'Chaos Flames', price: 820, color: '#f87171' },
];

// ---- Rooms (backdrop themes) ------------------------------------------------
export const ROOMS = [
  { id: 'neon_nest', name: 'Neon Nest', price: 0, sky: ['#0b1026', '#1b1448', '#0a2342'], accent: '#22d3ee', ground: '#22d3ee' },
  { id: 'candy_lab', name: 'Candy Lab', price: 650, sky: ['#3b0764', '#831843', '#9a3412'], accent: '#f472b6', ground: '#f9a8d4' },
  { id: 'jungle', name: 'Jungle Arcade', price: 900, sky: ['#052e1b', '#064e3b', '#3f6212'], accent: '#a3e635', ground: '#bef264' },
  { id: 'moon', name: 'Moon Bedroom', price: 1300, sky: ['#020617', '#1e1b4b', '#334155'], accent: '#c4b5fd', ground: '#c4b5fd' },
  { id: 'sunset', name: 'Sunset Pier', price: 1600, sky: ['#1e1b4b', '#7c2d12', '#b45309'], accent: '#fb923c', ground: '#fdba74' },
  { id: 'aurora', name: 'Aurora Peak', price: 60, currency: 'gems', sky: ['#021018', '#0f3d3e', '#134e4a'], accent: '#34d399', ground: '#6ee7b7', special: true },
];

// ---- Consumables: food ------------------------------------------------------
export const FOODS = [
  { id: 'berry', name: 'Glow Berry', cost: 20, emoji: '🍓', effects: { hunger: 16, fun: 3 }, xp: 6 },
  { id: 'noodles', name: 'Cosmic Noodles', cost: 46, emoji: '🍜', effects: { hunger: 30, fun: 6 }, xp: 12 },
  { id: 'cake', name: 'Moon Cake', cost: 84, emoji: '🍰', effects: { hunger: 42, fun: 16, hygiene: -8 }, xp: 20 },
  { id: 'sushi', name: 'Star Sushi', cost: 120, emoji: '🍣', effects: { hunger: 55, fun: 10, social: 6 }, xp: 30 },
  { id: 'feast', name: 'Chaos Feast', cost: 220, emoji: '🍱', effects: { hunger: 80, fun: 18, social: 10 }, xp: 55 },
];

// ---- Consumables: toys ------------------------------------------------------
export const TOYS = [
  { id: 'ball', name: 'Bounce Ball', cost: 80, emoji: '⚽', effects: { fun: 26, energy: -8, social: 4 }, xp: 16 },
  { id: 'laser', name: 'Laser Dot', cost: 150, emoji: '🔴', effects: { fun: 40, energy: -14, social: 6 }, xp: 26 },
  { id: 'drone', name: 'Tiny Drone', cost: 280, emoji: '🚁', effects: { fun: 58, energy: -20, social: 10 }, xp: 44 },
  { id: 'console', name: 'Mini Console', cost: 460, emoji: '🎮', effects: { fun: 78, energy: -26, social: 16 }, xp: 70 },
];

// ---- Quests (a daily set of 3 is rotated deterministically by date) ---------
export const QUEST_POOL = [
  { id: 'feed3', text: 'Feed your pet 3 times', target: 3, field: 'feeds', reward: 140 },
  { id: 'play3', text: 'Play 3 times', target: 3, field: 'plays', reward: 150 },
  { id: 'clean2', text: 'Clean your pet 2 times', target: 2, field: 'cleans', reward: 110 },
  { id: 'pet5', text: 'Pet your buddy 5 times', target: 5, field: 'pets', reward: 90 },
  { id: 'arcade250', text: 'Score 250 in the arcade', target: 250, field: 'miniScore', reward: 200 },
  { id: 'games2', text: 'Finish 2 arcade games', target: 2, field: 'miniGames', reward: 170 },
  { id: 'earn400', text: 'Earn 400 coins', target: 400, field: 'coinsEarned', reward: 160 },
  { id: 'spin1', text: 'Spin the Fortune Wheel', target: 1, field: 'spins', reward: 120 },
];

// ---- Achievements (permanent milestones) ------------------------------------
export const ACHIEVEMENTS = [
  { id: 'first_feed', name: 'First Snack', desc: 'Feed your pet for the first time.', reward: 60, check: (s) => s.totals.feeds >= 1 },
  { id: 'sparkle', name: 'Sparkle Mode', desc: 'Reach 95 hygiene.', reward: 100, check: (s) => s.stats.hygiene >= 95 },
  { id: 'level5', name: 'Growing Up', desc: 'Reach level 5.', reward: 150, gems: 1, check: (s) => s.level >= 5 },
  { id: 'level10', name: 'Big League', desc: 'Reach level 10.', reward: 300, gems: 2, check: (s) => s.level >= 10 },
  { id: 'level20', name: 'Cosmic Legend', desc: 'Evolve to the Astral form.', reward: 800, gems: 5, check: (s) => s.level >= 20 },
  { id: 'rich', name: 'Pocket Tycoon', desc: 'Hold 2,000 coins at once.', reward: 250, check: (s) => s.coins >= 2000 },
  { id: 'arcade_pro', name: 'Arcade Pro', desc: 'Score 500+ in a single game.', reward: 300, gems: 1, check: (s) => s.records.bestMini >= 500 },
  { id: 'streak7', name: 'Loyal Friend', desc: 'Reach a 7-day login streak.', reward: 400, gems: 3, check: (s) => s.streak >= 7 },
  { id: 'collector', name: 'Fashionista', desc: 'Own 10 cosmetic items.', reward: 320, check: (s) => cosmeticCount(s) >= 10 },
  { id: 'combo', name: 'Combo Master', desc: 'Hit a x15 combo in the arcade.', reward: 280, gems: 1, check: (s) => s.records.bestCombo >= 15 },
];

function cosmeticCount(s) {
  return (
    (s.owned.skins?.length || 0) +
    (s.owned.hats?.length || 0) +
    (s.owned.faces?.length || 0) +
    (s.owned.auras?.length || 0)
  );
}

// ---- Fortune Wheel ----------------------------------------------------------
export const WHEEL_PRIZES = [
  { id: 'c80', label: '80', kind: 'coins', amount: 80, color: '#22d3ee', weight: 22 },
  { id: 'c150', label: '150', kind: 'coins', amount: 150, color: '#f472b6', weight: 18 },
  { id: 'c300', label: '300', kind: 'coins', amount: 300, color: '#a855f7', weight: 10 },
  { id: 'gem1', label: '1', kind: 'gems', amount: 1, color: '#67e8f9', weight: 12 },
  { id: 'gem3', label: '3', kind: 'gems', amount: 3, color: '#34d399', weight: 4 },
  { id: 'food', label: 'Food', kind: 'food', amount: 2, color: '#fbbf24', weight: 16 },
  { id: 'xp', label: 'XP', kind: 'xp', amount: 60, color: '#fb923c', weight: 12 },
  { id: 'jackpot', label: 'JACKPOT', kind: 'coins', amount: 750, color: '#facc15', weight: 2 },
];

export const WHEEL_COOLDOWN_MS = 1000 * 60 * 60 * 3; // free spin every 3h
export const WHEEL_GEM_COST = 3;

// ---- Economy / progression constants ----------------------------------------
export const BALANCE = {
  startCoins: 350,
  startGems: 6,
  tickMs: 5000, // vital decay cadence
  petXp: 6,
  petCoins: 2,
  cleanXp: 14,
  napXp: 10,
  dailyBaseCoins: 150,
  dailyStreakBonus: 40,
  // earnings scale down when the pet is neglected — incentive to keep stats high
  moodEarnMultiplier: { ecstatic: 1.25, happy: 1.1, content: 1, bored: 0.85, sad: 0.6 },
};

// XP required to advance FROM a given level.
export function xpForLevel(level) {
  return Math.round(70 + level * 38 + level * level * 2.2);
}
