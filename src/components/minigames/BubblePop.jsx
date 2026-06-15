import React, { useEffect, useRef, useState } from 'react';
import { audio } from '../../game/audio.js';
import { particles } from '../../game/particles.js';

const DURATION = 30;

export default function BubblePop({ onDone }) {
  const [phase, setPhase] = useState('ready');
  const [targets, setTargets] = useState([]);
  const [hud, setHud] = useState({ score: 0, time: DURATION, combo: 0 });
  const refs = useRef({});
  const idc = useRef(0);

  const clearAll = () => {
    const r = refs.current;
    clearInterval(r.spawn);
    clearInterval(r.tick);
    (r.expire || []).forEach(clearTimeout);
  };
  useEffect(() => () => clearAll(), []);

  const start = () => {
    clearAll();
    refs.current = { score: 0, combo: 0, best: 0, time: DURATION, expire: [], running: true };
    setTargets([]);
    setHud({ score: 0, time: DURATION, combo: 0 });
    setPhase('playing');

    refs.current.tick = setInterval(() => {
      refs.current.time -= 1;
      setHud((h) => ({ ...h, time: refs.current.time }));
      if (refs.current.time <= 0) end();
    }, 1000);

    const spawn = () => {
      const r = refs.current;
      if (!r.running) return;
      const elapsed = DURATION - r.time;
      const rnd = Math.random();
      const type = rnd < 0.18 ? 'bomb' : rnd < 0.3 ? 'star' : 'good';
      const id = ++idc.current;
      const life = Math.max(720, 1300 - elapsed * 22);
      const t = {
        id, type,
        x: 10 + Math.random() * 80,
        y: 14 + Math.random() * 70,
        size: type === 'star' ? 64 : 56,
      };
      setTargets((arr) => [...arr.slice(-7), t]);
      r.expire.push(setTimeout(() => {
        setTargets((arr) => arr.filter((o) => o.id !== id));
        if (type !== 'bomb' && r.combo > 0) { r.combo = 0; setHud((h) => ({ ...h, combo: 0 })); }
      }, life));
    };
    refs.current.spawn = setInterval(() => {
      spawn();
      // occasionally double-spawn late game
      if (DURATION - refs.current.time > 14 && Math.random() < 0.4) spawn();
    }, 620);
  };

  const pop = (t, e) => {
    const r = refs.current;
    if (!r.running) return;
    setTargets((arr) => arr.filter((o) => o.id !== t.id));
    const x = e.clientX, y = e.clientY;
    if (t.type === 'bomb') {
      r.combo = 0;
      r.score = Math.max(0, r.score - 15);
      audio.deny();
      particles.burst(x, y, { colors: ['#f87171', '#fca5a5'], count: 16, power: 6 });
      setHud((h) => ({ ...h, score: r.score, combo: 0 }));
    } else {
      r.combo += 1;
      r.best = Math.max(r.best, r.combo);
      const mult = 1 + Math.floor(r.combo / 4);
      r.score += (t.type === 'star' ? 20 : 10) * mult;
      audio.combo(r.combo);
      particles.burst(x, y, { colors: t.type === 'star' ? ['#fbbf24', '#fff'] : ['#67e8f9', '#f472b6'], count: t.type === 'star' ? 16 : 10, power: 5 });
      setHud((h) => ({ ...h, score: r.score, combo: r.combo }));
    }
  };

  const end = () => {
    clearAll();
    refs.current.running = false;
    setTargets([]);
    setPhase('over');
    onDone({ score: refs.current.score, combo: refs.current.best });
  };

  return (
    <div className="relative mx-auto h-full w-full max-w-[440px] overflow-hidden rounded-2xl bg-gradient-to-br from-ink-700 to-ink-900">
      <div className="stars absolute inset-0 opacity-40" />

      {phase === 'playing' && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3 text-sm font-black">
            <div className="rounded-xl bg-black/40 px-3 py-1.5 tabular-nums backdrop-blur">⏱ {hud.time}s</div>
            <div className="rounded-xl bg-black/40 px-3 py-1.5 tabular-nums backdrop-blur">{hud.score}</div>
            <div className={`rounded-xl px-3 py-1.5 tabular-nums backdrop-blur ${hud.combo >= 4 ? 'bg-neon-pink/40' : 'bg-black/40'}`}>×{1 + Math.floor(hud.combo / 4)}</div>
          </div>
          {targets.map((t) => (
            <button
              key={t.id}
              onPointerDown={(e) => pop(t, e)}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 animate-pop place-items-center rounded-full font-black"
              style={{
                left: `${t.x}%`, top: `${t.y}%`, width: t.size, height: t.size,
                background: t.type === 'bomb' ? 'radial-gradient(circle at 35% 30%, #fca5a5, #b91c1c)' : t.type === 'star' ? 'radial-gradient(circle at 35% 30%, #fde68a, #f59e0b)' : 'radial-gradient(circle at 35% 30%, #a5f3fc, #ec4899)',
                boxShadow: `0 0 24px ${t.type === 'bomb' ? '#ef4444' : t.type === 'star' ? '#fbbf24' : '#22d3ee'}`,
                fontSize: t.size * 0.5,
              }}
            >
              {t.type === 'bomb' ? '💣' : t.type === 'star' ? '⭐' : '🫧'}
            </button>
          ))}
        </>
      )}

      {phase === 'ready' && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <div className="mb-2 text-6xl">🫧</div>
            <h3 className="text-2xl font-black">Bubble Pop</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-white/65">Pop bubbles & ⭐ stars fast to chain combos in 30 seconds. Avoid the 💣 bombs — they cost you points and your combo!</p>
            <button onClick={start} className="press btn-shine mt-5 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 px-8 py-3 font-black text-ink-900 shadow-glow shadow-emerald-400/40">Start</button>
          </div>
        </div>
      )}
    </div>
  );
}
