import React from 'react';
import { QUEST_POOL, ACHIEVEMENTS } from '../../game/config.js';
import { fmt } from '../../game/engine.js';

export default function QuestsPanel({ game, onClaimQuest, onClaimAchievement }) {
  const quests = (game.quests.ids || []).map((id) => QUEST_POOL.find((q) => q.id === id)).filter(Boolean);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2.5 flex items-center justify-between text-sm font-bold uppercase tracking-wide text-white/55">
          <span>📋 Daily Quests</span>
          <span className="text-[10px] normal-case text-white/35">Resets daily</span>
        </h3>
        <div className="space-y-2.5">
          {quests.map((q) => {
            const prog = Math.min(q.target, game.quests.progress[q.field] || 0);
            const done = prog >= q.target;
            const claimed = game.quests.claimed.includes(q.id);
            const pct = (prog / q.target) * 100;
            return (
              <div key={q.id} className={`rounded-2xl border p-3 transition ${done && !claimed ? 'border-emerald-300/40 bg-emerald-300/10' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{q.text}</span>
                  <span className="shrink-0 text-xs font-bold text-amber-200">+{q.reward} 🪙</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/40">
                  <div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-white/50">
                  <span className="tabular-nums">{prog}/{q.target}</span>
                  <button
                    onClick={() => onClaimQuest(q)}
                    disabled={!done || claimed}
                    className={`rounded-lg px-3 py-1 text-xs font-extrabold disabled:opacity-40 ${done && !claimed ? 'press bg-gradient-to-br from-emerald-400 to-teal-500 text-ink-900' : 'bg-white/10'}`}
                  >
                    {claimed ? '✓ Claimed' : 'Claim'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-white/55">🏆 Achievements</h3>
        <div className="space-y-2.5">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.check(game);
            const claimed = game.achievements.includes(a.id);
            return (
              <div key={a.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${claimed ? 'border-white/10 bg-white/[0.03] opacity-70' : unlocked ? 'border-amber-300/40 bg-amber-300/10' : 'border-white/10 bg-white/5'}`}>
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl ${unlocked ? 'bg-amber-400/20' : 'bg-white/5 grayscale'}`}>
                  {claimed ? '🏅' : unlocked ? '🎖️' : '🔒'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{a.name}</div>
                  <div className="truncate text-[11px] text-white/55">{a.desc}</div>
                </div>
                <button
                  onClick={() => onClaimAchievement(a)}
                  disabled={!unlocked || claimed}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-extrabold disabled:opacity-40 ${unlocked && !claimed ? 'press bg-gradient-to-br from-amber-300 to-orange-400 text-ink-900' : 'bg-white/10'}`}
                >
                  {claimed ? '✓' : `+${fmt(a.reward)}${a.gems ? ` +${a.gems}💎` : ''}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
