import { useCallback, useEffect, useRef, useState } from 'react';
import { SAVE_KEY, BALANCE } from './config.js';
import {
  makeInitialState,
  decayStats,
  applyOfflineProgress,
  ensureDailyQuests,
} from './engine.js';

// Build a complete state object from a (possibly partial / older) saved blob.
function hydrate(saved) {
  const base = makeInitialState();
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    ...saved,
    stats: { ...base.stats, ...(saved.stats || {}) },
    owned: {
      ...base.owned,
      ...(saved.owned || {}),
      food: { ...base.owned.food, ...(saved.owned?.food || {}) },
      toys: { ...base.owned.toys, ...(saved.owned?.toys || {}) },
    },
    equipped: { ...base.equipped, ...(saved.equipped || {}) },
    quests: { ...base.quests, ...(saved.quests || {}) },
    totals: { ...base.totals, ...(saved.totals || {}) },
    records: { ...base.records, ...(saved.records || {}) },
    settings: { ...base.settings, ...(saved.settings || {}) },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return hydrate(raw ? JSON.parse(raw) : null);
  } catch {
    return makeInitialState();
  }
}

/**
 * Owns the persisted game state, the decay loop and offline catch-up.
 * Returns the live state, a setter, a synchronous ref, and the away report.
 */
export function useGame() {
  const [game, setRawGame] = useState(load);
  const gameRef = useRef(game);
  const [awayTicks, setAwayTicks] = useState(0);
  const bootRef = useRef(false);

  const setGame = useCallback((updater) => {
    setRawGame((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      gameRef.current = next;
      return next;
    });
  }, []);

  // One-time boot: offline catch-up + ensure today's quests exist.
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const { state, awayTicks: away } = applyOfflineProgress(gameRef.current);
    setGame(ensureDailyQuests(state));
    setAwayTicks(away);
  }, [setGame]);

  // Persist whenever state changes.
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [game]);

  // Vital decay tick.
  useEffect(() => {
    const id = setInterval(() => {
      setGame((g) => (g.onboarded ? { ...g, stats: decayStats(g.stats, 1), lastSeen: Date.now() } : g));
    }, BALANCE.tickMs);
    return () => clearInterval(id);
  }, [setGame]);

  // Save a fresh lastSeen when the tab is hidden / closed so offline progress is accurate.
  useEffect(() => {
    const stamp = () => {
      try {
        const cur = { ...gameRef.current, lastSeen: Date.now() };
        localStorage.setItem(SAVE_KEY, JSON.stringify(cur));
      } catch {
        /* ignore */
      }
    };
    document.addEventListener('visibilitychange', stamp);
    window.addEventListener('pagehide', stamp);
    return () => {
      document.removeEventListener('visibilitychange', stamp);
      window.removeEventListener('pagehide', stamp);
    };
  }, []);

  return { game, setGame, gameRef, awayTicks };
}
