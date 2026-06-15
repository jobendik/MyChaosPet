import React from 'react';
import { STAGES, stageForLevel, nextStage } from '../../game/config.js';
import { fmt } from '../../game/engine.js';

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
      <div className="text-lg font-black text-gradient">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-white/50">{label}</div>
    </div>
  );
}

export default function PetPanel({ game }) {
  const stage = stageForLevel(game.level);
  const next = nextStage(game.level);
  const ageDays = Math.max(0, Math.floor((Date.now() - game.bornAt) / 86400000));
  const stageIdx = STAGES.findIndex((s) => s.id === stage.id);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.02] p-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-neon-cyan/70">Current Form</div>
        <div className="mt-0.5 flex items-baseline justify-between">
          <h3 className="text-2xl font-black text-gradient">{stage.name}</h3>
          <span className="text-sm text-white/50">Lvl {game.level}</span>
        </div>
        <p className="mt-1 text-sm text-white/65">{stage.blurb}</p>
        {next && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-white/50">
              <span>Evolves to <b className="text-white/80">{next.name}</b></span>
              <span>Lvl {next.minLevel}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/40">
              <div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink transition-all" style={{ width: `${Math.min(100, (game.level / next.minLevel) * 100)}%` }} />
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-white/55">🧬 Evolution Path</h3>
        <div className="flex items-center justify-between gap-1">
          {STAGES.map((s, i) => {
            const reached = i <= stageIdx;
            const current = i === stageIdx;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`grid h-11 w-11 place-items-center rounded-2xl border text-lg transition ${current ? 'scale-110 border-neon-cyan bg-neon-cyan/20 shadow-glow shadow-cyan-400/40' : reached ? 'border-white/15 bg-white/10' : 'border-white/10 bg-white/[0.03] grayscale'}`}>
                    {reached ? [...'🐣🌱⚡🌟🌌'][i] : '🔒'}
                  </div>
                  <div className={`text-[9px] font-bold ${current ? 'text-white' : 'text-white/45'}`}>{s.name}</div>
                </div>
                {i < STAGES.length - 1 && <div className={`mb-4 h-0.5 flex-1 rounded ${i < stageIdx ? 'bg-neon-cyan/60' : 'bg-white/10'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2.5">
        <Stat label="Best Score" value={fmt(game.records.bestMini)} />
        <Stat label="Best Combo" value={`×${game.records.bestCombo}`} />
        <Stat label="Age" value={`${ageDays}d`} />
        <Stat label="Games" value={fmt(game.totals.miniGames)} />
        <Stat label="Meals" value={fmt(game.totals.feeds)} />
        <Stat label="Streak" value={`${game.streak}🔥`} />
      </section>

      <section>
        <h3 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-white/55">📰 Activity</h3>
        <div className="scroll-thin max-h-44 space-y-1.5 overflow-auto pr-1">
          {game.log.map((m, i) => (
            <div key={i} className="rounded-xl bg-white/5 px-3 py-2 text-[13px] text-white/70">{m}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
