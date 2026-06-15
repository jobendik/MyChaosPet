// =============================================================================
// Pure game logic — no React, no side effects. Easy to reason about & test.
// =============================================================================
import {
  BALANCE,
  QUEST_POOL,
  STAT_META,
  xpForLevel,
  stageForLevel,
} from './config.js';

export const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
export const fmt = (n) => new Intl.NumberFormat('en-US').format(Math.floor(n));
export const todayKey = () => new Date().toISOString().slice(0, 10);

export function makeInitialState() {
  return {
    version: 2,
    name: 'Mochi',
    bornAt: Date.now(),
    onboarded: false,
    level: 1,
    xp: 0,
    coins: BALANCE.startCoins,
    gems: BALANCE.startGems,
    streak: 0,
    lastDaily: null,
    lastWheel: 0,
    lastSeen: Date.now(),
    stats: { hunger: 70, energy: 75, hygiene: 68, fun: 64, social: 60 },
    owned: {
      skins: ['bubblegum'],
      hats: ['none'],
      faces: ['classic'],
      auras: ['none'],
      rooms: ['neon_nest'],
      food: { berry: 3, noodles: 1 },
      toys: { ball: 1 },
    },
    equipped: { skin: 'bubblegum', hat: 'none', face: 'classic', aura: 'none', room: 'neon_nest' },
    quests: { date: null, ids: [], progress: {}, claimed: [] },
    achievements: [],
    totals: { feeds: 0, plays: 0, cleans: 0, pets: 0, naps: 0, miniGames: 0, coinsEarned: 0 },
    records: { bestMini: 0, bestCombo: 0, daysCared: 0, bestByGame: {} },
    settings: { sfx: true, music: true, volume: 0.7, reducedFx: false },
    log: ['Your chaos pet hatched and is ready to play!'],
  };
}

// ---- Leveling ---------------------------------------------------------------
// Returns { level, xp, leveledUp, newStages } after adding xp.
export function addXp(state, amount) {
  let level = state.level;
  let xp = state.xp + amount;
  const startStage = stageForLevel(level).id;
  let need = xpForLevel(level);
  while (xp >= need) {
    xp -= need;
    level += 1;
    need = xpForLevel(level);
  }
  const evolved = stageForLevel(level).id !== startStage;
  return { level, xp, need, leveledUp: level > state.level, evolved };
}

export function xpProgress(state) {
  const need = xpForLevel(state.level);
  return { need, pct: clamp((state.xp / need) * 100) };
}

// ---- Mood -------------------------------------------------------------------
// Mood is derived from vitals. It drives expression, animation and earnings.
export function computeMood(stats) {
  const avg = STAT_META.reduce((a, m) => a + stats[m.key], 0) / STAT_META.length;
  if (stats.hunger < 22) return 'hungry';
  if (stats.energy < 22) return 'sleepy';
  if (stats.hygiene < 22) return 'dirty';
  if (avg < 32) return 'sad';
  if (avg < 52) return 'bored';
  if (avg > 86) return 'ecstatic';
  if (avg > 68) return 'happy';
  return 'content';
}

// Maps any mood to the earnings bucket used by BALANCE.moodEarnMultiplier.
export function moodEarnKey(mood) {
  if (mood === 'ecstatic') return 'ecstatic';
  if (mood === 'happy') return 'happy';
  if (mood === 'content') return 'content';
  if (mood === 'bored') return 'bored';
  return 'sad'; // hungry / sleepy / dirty / sad all earn least
}

export function moodMultiplier(mood) {
  return BALANCE.moodEarnMultiplier[moodEarnKey(mood)] ?? 1;
}

// ---- Vital decay (called on each tick, and to catch up after time away) -----
export function decayStats(stats, ticks = 1) {
  const next = { ...stats };
  for (const m of STAT_META) {
    next[m.key] = clamp(next[m.key] - m.decay * ticks);
  }
  return next;
}

// Apply a {hunger, fun, ...} effect map to stats with clamping.
export function applyEffects(stats, effects) {
  const next = { ...stats };
  for (const k in effects) next[k] = clamp((next[k] ?? 0) + effects[k]);
  return next;
}

// ---- Offline catch-up -------------------------------------------------------
// When the player returns, age the pet realistically (capped) and report it.
export function applyOfflineProgress(state) {
  const now = Date.now();
  const elapsed = now - (state.lastSeen || now);
  const ticks = Math.floor(elapsed / BALANCE.tickMs);
  if (ticks <= 0) return { state: { ...state, lastSeen: now }, awayTicks: 0 };
  const capped = Math.min(ticks, Math.floor((1000 * 60 * 60 * 8) / BALANCE.tickMs)); // cap at ~8h
  return {
    state: { ...state, stats: decayStats(state.stats, capped), lastSeen: now },
    awayTicks: capped,
  };
}

// ---- Daily quests -----------------------------------------------------------
// Deterministically pick 3 quests for a given date so it's stable across reloads.
export function rollDailyQuests(date = todayKey()) {
  const seed = [...date].reduce((a, c) => a + c.charCodeAt(0), 0);
  const pool = [...QUEST_POOL];
  const picked = [];
  let s = seed;
  for (let i = 0; i < 3 && pool.length; i++) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

export function ensureDailyQuests(state) {
  const date = todayKey();
  if (state.quests.date === date && state.quests.ids?.length) return state;
  const ids = rollDailyQuests(date).map((q) => q.id);
  return {
    ...state,
    quests: { date, ids, progress: {}, claimed: [] },
  };
}

export function bumpQuest(state, field, amount = 1) {
  const progress = { ...state.quests.progress };
  progress[field] = (progress[field] || 0) + amount;
  return { ...state, quests: { ...state.quests, progress } };
}
