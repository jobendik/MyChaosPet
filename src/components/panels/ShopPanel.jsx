import React, { useState } from 'react';
import { FOODS, TOYS, SKINS, HATS, FACES, AURAS, ROOMS } from '../../game/config.js';
import { fmt } from '../../game/engine.js';

const CATS = [
  { id: 'food', label: 'Food', icon: '🍜', kind: 'food', items: FOODS },
  { id: 'toy', label: 'Toys', icon: '🎾', kind: 'toy', items: TOYS },
  { id: 'skin', label: 'Skins', icon: '🎨', kind: 'skin', items: SKINS },
  { id: 'hat', label: 'Hats', icon: '🎩', kind: 'hat', items: HATS },
  { id: 'face', label: 'Faces', icon: '👀', kind: 'face', items: FACES },
  { id: 'aura', label: 'Auras', icon: '✨', kind: 'aura', items: AURAS },
  { id: 'room', label: 'Rooms', icon: '🏠', kind: 'room', items: ROOMS },
];

function effectText(item) {
  if (item.effects) {
    return Object.entries(item.effects)
      .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
      .join(' · ') + ` · XP +${item.xp}`;
  }
  return null;
}

function Price({ price, currency }) {
  if (price === 0) return <span className="text-emerald-300">Free</span>;
  return (
    <span className={currency === 'gems' ? 'text-cyan-200' : 'text-amber-200'}>
      {fmt(price)} {currency === 'gems' ? '💎' : '🪙'}
    </span>
  );
}

function Swatch({ kind, item }) {
  if (kind === 'skin')
    return <div className="h-9 w-9 shrink-0 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${item.stops[0]}, ${item.stops[1]}, ${item.stops[2]})`, boxShadow: `0 0 10px ${item.glow}` }} />;
  if (kind === 'room')
    return <div className="h-9 w-9 shrink-0 rounded-lg" style={{ background: `linear-gradient(150deg, ${item.sky[0]}, ${item.sky[1]}, ${item.sky[2]})` }} />;
  if (kind === 'aura')
    return <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg" style={{ boxShadow: item.color ? `0 0 10px ${item.color}, inset 0 0 8px ${item.color}` : 'none', border: `2px solid ${item.color || 'rgba(255,255,255,0.2)'}` }}>✦</div>;
  if (item.emoji) return <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-xl">{item.emoji}</div>;
  return <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-lg">{CATS.find((c) => c.kind === kind)?.icon}</div>;
}

export default function ShopPanel({ game, onBuy, onEquip }) {
  const [cat, setCat] = useState('food');
  const active = CATS.find((c) => c.id === cat);
  const stackable = active.kind === 'food' || active.kind === 'toy';

  const owned = (kind, id) => {
    if (kind === 'food') return (game.owned.food[id] || 0) > 0;
    if (kind === 'toy') return (game.owned.toys[id] || 0) > 0;
    if (kind === 'room') return game.owned.rooms.includes(id);
    return game.owned[`${kind}s`]?.includes(id);
  };
  const count = (kind, id) => (kind === 'food' ? game.owned.food[id] : game.owned.toys[id]) || 0;
  const isEquipped = (kind, id) => game.equipped[kind] === id;
  const wallet = (currency) => (currency === 'gems' ? game.gems : game.coins);

  return (
    <div className="space-y-4">
      <div className="scroll-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${cat === c.id ? 'bg-gradient-to-br from-neon-cyan to-neon-pink text-ink-900' : 'bg-white/8 text-white/70 hover:bg-white/12'}`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2.5">
        {active.items.map((item) => {
          const price = item.price ?? item.cost ?? 0;
          const currency = item.currency || 'coins';
          const isOwned = owned(active.kind, item.id);
          const equipped = isEquipped(active.kind, item.id);
          const canAfford = wallet(currency) >= price;
          const canEquip = active.kind !== 'food' && active.kind !== 'toy';
          const eff = effectText(item);

          return (
            <div key={item.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${item.special ? 'border-cyan-300/30 bg-cyan-300/5' : 'border-white/10 bg-white/5'}`}>
              <Swatch kind={active.kind} item={item} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-bold">{item.name}</span>
                  {item.special && <span className="rounded-md bg-cyan-400/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-cyan-200">Rare</span>}
                  {stackable && <span className="text-xs text-white/45">×{count(active.kind, item.id)}</span>}
                </div>
                <div className="truncate text-[11px] text-white/55">{eff || <Price price={price} currency={currency} />}</div>
              </div>

              {canEquip && isOwned ? (
                <button
                  onClick={() => onEquip(active.kind, item)}
                  disabled={equipped}
                  className={`shrink-0 rounded-xl px-3 py-2 text-xs font-extrabold ${equipped ? 'bg-emerald-400/20 text-emerald-200' : 'press bg-white/12 hover:bg-white/18'}`}
                >
                  {equipped ? '✓ On' : 'Equip'}
                </button>
              ) : (
                <button
                  onClick={() => onBuy(active.kind, item)}
                  disabled={!canAfford && !(stackable ? false : isOwned)}
                  className={`press shrink-0 rounded-xl px-3 py-2 text-xs font-extrabold ${canAfford ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-ink-900' : 'cursor-not-allowed bg-white/8 text-white/35'}`}
                >
                  {stackable || !isOwned ? (
                    <span className="flex items-center gap-1"><Price price={price} currency={currency} /></span>
                  ) : 'Owned'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
