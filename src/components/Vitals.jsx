import React from 'react';
import { STAT_META } from '../game/config.js';

const MOOD_FACE = {
  ecstatic: '🤩', happy: '😄', content: '🙂', bored: '😐',
  hungry: '🍽️', sleepy: '😴', dirty: '🫧', sad: '😢',
};

function Bar({ meta, value }) {
  const low = value < 25;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-white/70">
        <span>{meta.icon} {meta.label}</span>
        <span className={`tabular-nums ${low ? 'text-rose-300' : ''}`}>{Math.round(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${low ? 'animate-pulse' : ''}`}
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: `linear-gradient(90deg, ${meta.color}, ${meta.color}cc)`,
            boxShadow: `0 0 12px ${meta.color}99`,
          }}
        />
      </div>
    </div>
  );
}

export default function Vitals({ stats, mood }) {
  return (
    <div className="panel rounded-3xl p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Vitals</h2>
        <div className="flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-sm font-bold capitalize">
          <span className="text-base">{MOOD_FACE[mood]}</span>
          {mood === 'content' ? 'Content' : mood}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {STAT_META.map((m) => (
          <Bar key={m.key} meta={m} value={stats[m.key]} />
        ))}
      </div>
    </div>
  );
}
