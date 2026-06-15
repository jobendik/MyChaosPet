import React from 'react';
import { fmt, xpProgress } from '../game/engine.js';
import { useCountUp } from '../hooks.js';

function Currency({ icon, value, tone }) {
  const display = useCountUp(value);
  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 shadow-inner">
      <span className="text-lg leading-none">{icon}</span>
      <span className={`text-base font-extrabold tabular-nums ${tone}`}>{fmt(display)}</span>
    </div>
  );
}

function XpRing({ level, pct }) {
  const R = 22;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative grid h-14 w-14 place-items-center">
      <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90">
        <circle cx="26" cy="26" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
        <circle
          cx="26" cy="26" r={R} fill="none" stroke="url(#xpgrad)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <defs>
          <linearGradient id="xpgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center leading-none">
        <div className="text-[9px] font-bold uppercase tracking-wider text-white/55">Lvl</div>
        <div className="text-lg font-black">{level}</div>
      </div>
    </div>
  );
}

export default function Hud({ game, onDaily, onSettings, dailyReady }) {
  const { pct } = xpProgress(game);
  return (
    <header className="relative z-20 px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/35 px-3 py-2.5 shadow-2xl backdrop-blur-xl sm:px-5 sm:py-3">
        <div className="flex items-center gap-3">
          <XpRing level={game.level} pct={pct} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-neon-cyan/70">My Chaos Pet</div>
            <h1 className="-mt-0.5 text-xl font-black leading-none text-gradient sm:text-2xl">{game.name}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Currency icon="🪙" value={game.coins} tone="text-amber-200" />
          <Currency icon="💎" value={game.gems} tone="text-cyan-200" />
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/8 px-3 py-2" title="Daily streak">
            <span className="text-lg leading-none">🔥</span>
            <span className="text-base font-extrabold tabular-nums text-orange-200">{game.streak}</span>
          </div>

          <button
            onClick={onDaily}
            className={`btn-shine press relative rounded-2xl px-4 py-2.5 text-sm font-extrabold text-ink-900 shadow-glow ${dailyReady ? 'bg-gradient-to-br from-amber-300 to-orange-400 shadow-amber-400/40' : 'bg-white/15 text-white/70 shadow-none'}`}
          >
            🎁 Daily
            {dailyReady && <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-rose-400" />}
            {dailyReady && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rose-400" />}
          </button>

          <button onClick={onSettings} className="press grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/8 text-xl hover:bg-white/12" aria-label="Settings">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}
