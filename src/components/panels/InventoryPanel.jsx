import React from 'react';
import { FOODS, TOYS } from '../../game/config.js';

function Item({ item, count, disabled, label, onUse, tone }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-3 ${count <= 0 ? 'opacity-45' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold"><span className="text-xl">{item.emoji}</span>{item.name}</span>
        <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs font-bold tabular-nums">×{count}</span>
      </div>
      <button
        onClick={() => onUse(item)}
        disabled={disabled}
        className={`press mt-2.5 w-full rounded-xl py-2 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-40 ${tone}`}
      >
        {label}
      </button>
    </div>
  );
}

export default function InventoryPanel({ game, onFeed, onPlay }) {
  const empty = FOODS.every((f) => !(game.owned.food[f.id] > 0)) && TOYS.every((t) => !(game.owned.toys[t.id] > 0));
  return (
    <div className="space-y-5">
      {empty && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
          Your bag is empty. Visit the <b className="text-white">Shop</b> to stock up on snacks and toys!
        </div>
      )}
      <section>
        <h3 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-white/55">🍜 Snacks</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {FOODS.map((f) => (
            <Item key={f.id} item={f} count={game.owned.food[f.id] || 0} disabled={(game.owned.food[f.id] || 0) <= 0} label="Feed" onUse={onFeed} tone="bg-gradient-to-br from-amber-300/90 to-orange-400/90 text-ink-900" />
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-white/55">🎾 Toys</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {TOYS.map((t) => {
            const c = game.owned.toys[t.id] || 0;
            return <Item key={t.id} item={t} count={c} disabled={c <= 0 || game.stats.energy < 10} label={game.stats.energy < 10 ? 'Too tired' : 'Play'} onUse={onPlay} tone="bg-gradient-to-br from-fuchsia-400/90 to-pink-500/90 text-ink-900" />;
          })}
        </div>
      </section>
    </div>
  );
}
