import React, { useRef, useState } from 'react';
import { WHEEL_PRIZES, WHEEL_GEM_COST } from '../game/config.js';

const SEG = 360 / WHEEL_PRIZES.length;

function pt(cx, cy, r, aDeg) {
  const a = (aDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
}
function slice(cx, cy, r, a0, a1) {
  const p0 = pt(cx, cy, r, a0);
  const p1 = pt(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${cx},${cy} L${p0.x},${p0.y} A${r},${r} 0 ${large} 1 ${p1.x},${p1.y} Z`;
}

export default function FortuneWheel({ game, freeReady, onClose, onSpin, onLanded }) {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const rotRef = useRef(0);
  const canFree = freeReady;
  const canGems = game.gems >= WHEEL_GEM_COST;

  const doSpin = () => {
    if (spinning) return;
    const useGems = !canFree;
    if (useGems && !canGems) return;
    const index = onSpin(useGems); // App deducts + picks weighted index
    if (index < 0) return;
    setResult(null);
    setSpinning(true);
    const theta = index * SEG + SEG / 2;
    const jitter = (Math.random() - 0.5) * SEG * 0.6;
    const target = rotRef.current + 360 * 5 + (360 - (theta + jitter));
    rotRef.current = target;
    setRot(target);
    setTimeout(() => {
      setSpinning(false);
      const prize = WHEEL_PRIZES[index];
      setResult(prize);
      onLanded(prize);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-ink-800 p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan/70">Fortune Wheel</div>
        <h2 className="mt-1 text-2xl font-black text-gradient">Spin to Win!</h2>

        <div className="relative mx-auto my-5 h-[300px] w-[300px] max-w-full">
          {/* pointer */}
          <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2 drop-shadow-lg" style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '26px solid #fff' }} />
          <svg
            viewBox="0 0 300 300"
            className="h-full w-full"
            style={{ transform: `rotate(${rot}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none', filter: 'drop-shadow(0 0 24px rgba(168,85,247,0.4))' }}
          >
            {WHEEL_PRIZES.map((p, i) => {
              const a0 = i * SEG;
              const a1 = a0 + SEG;
              const mid = a0 + SEG / 2;
              const lp = pt(150, 150, 92, mid);
              return (
                <g key={p.id}>
                  <path d={slice(150, 150, 140, a0, a1)} fill={p.color} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
                  <g transform={`translate(${lp.x},${lp.y}) rotate(${mid})`}>
                    <text textAnchor="middle" dominantBaseline="middle" fontSize={p.id === 'jackpot' ? 11 : 15} fontWeight="900" fill="#1a1330" fontFamily="Fredoka, sans-serif">{p.label}</text>
                    <text y="16" textAnchor="middle" dominantBaseline="middle" fontSize="12">{p.kind === 'gems' ? '💎' : p.kind === 'food' ? '🍱' : p.kind === 'xp' ? '⭐' : '🪙'}</text>
                  </g>
                </g>
              );
            })}
            <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
          </svg>
          <div className="absolute left-1/2 top-1/2 z-10 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white/80 bg-ink-700 text-2xl shadow-xl">🎡</div>
        </div>

        {result ? (
          <div className="animate-pop rounded-2xl border border-amber-300/40 bg-amber-300/10 p-3 text-lg font-black text-amber-200">
            You won {result.label} {result.kind === 'gems' ? '💎' : result.kind === 'food' ? 'Food 🍱' : result.kind === 'xp' ? 'XP ⭐' : '🪙'}!
          </div>
        ) : (
          <div className="text-sm text-white/60">{canFree ? 'Your free spin is ready!' : `Spin for ${WHEEL_GEM_COST} 💎`}</div>
        )}

        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="press flex-1 rounded-2xl bg-white/10 py-3 font-extrabold hover:bg-white/15">Close</button>
          <button
            onClick={doSpin}
            disabled={spinning || (!canFree && !canGems)}
            className="press btn-shine flex-[2] rounded-2xl bg-gradient-to-br from-neon-pink to-neon-violet py-3 font-black text-white shadow-glow shadow-fuchsia-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {spinning ? 'Spinning…' : canFree ? '🎡 Free Spin' : `🎡 Spin (${WHEEL_GEM_COST}💎)`}
          </button>
        </div>
      </div>
    </div>
  );
}
