import React, { useEffect, useRef, useState } from 'react';
import { audio } from '../../game/audio.js';
import { particles } from '../../game/particles.js';

const W = 400;
const H = 560;
const FLOOR = 496;

const KINDS = [
  { type: 'good', weight: 60, r: 16, base: 10, color: '#67e8f9', glyph: '✦' },
  { type: 'good', weight: 0, r: 16, base: 10, color: '#f472b6', glyph: '✦' },
  { type: 'star', weight: 18, r: 18, base: 25, color: '#fbbf24', glyph: '★' },
  { type: 'gem', weight: 7, r: 17, base: 50, color: '#a5f3fc', glyph: '💎' },
  { type: 'bomb', weight: 15, r: 17, base: 0, color: '#f87171', glyph: '✗' },
];

function pick() {
  const total = KINDS.reduce((a, k) => a + k.weight, 0);
  let r = Math.random() * total;
  for (const k of KINDS) {
    if ((r -= k.weight) <= 0) return k;
  }
  return KINDS[0];
}

export default function SparkCatch({ onDone }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('ready');
  const [hud, setHud] = useState({ score: 0, combo: 0, lives: 3 });
  const g = useRef(null);

  const start = () => {
    setPhase('playing');
    setHud({ score: 0, combo: 0, lives: 3 });
    g.current = {
      items: [],
      basketX: W / 2,
      targetX: W / 2,
      score: 0,
      combo: 0,
      bestCombo: 0,
      lives: 3,
      t: 0,
      spawnT: 0,
      keys: {},
      running: true,
    };
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    const toScreen = (x, y) => {
      const rect = canvas.getBoundingClientRect();
      const s = rect.width / W;
      return [rect.left + x * s, rect.top + y * s];
    };

    const move = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      g.current.targetX = ((clientX - rect.left) / rect.width) * W;
    };
    const onPointer = (e) => move(e.clientX);
    const onTouch = (e) => { if (e.touches[0]) move(e.touches[0].clientX); };
    const onKeyDown = (e) => { g.current.keys[e.key] = true; };
    const onKeyUp = (e) => { g.current.keys[e.key] = false; };
    canvas.addEventListener('pointermove', onPointer);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let last = performance.now();
    const loop = (now) => {
      const s = g.current;
      if (!s.running) return;
      const dt = Math.min(40, now - last) / 16.67;
      last = now;
      s.t += dt;

      // keyboard steering
      if (s.keys['ArrowLeft'] || s.keys['a']) s.targetX -= 7 * dt;
      if (s.keys['ArrowRight'] || s.keys['d']) s.targetX += 7 * dt;
      s.targetX = Math.max(44, Math.min(W - 44, s.targetX));
      s.basketX += (s.targetX - s.basketX) * 0.25 * dt;

      // spawn (difficulty ramps with time)
      const interval = Math.max(28, 70 - s.t * 0.05);
      s.spawnT += dt;
      if (s.spawnT >= interval) {
        s.spawnT = 0;
        const k = pick();
        const fall = 2.4 + s.t * 0.004 + Math.random() * 1.5;
        s.items.push({ ...k, x: 30 + Math.random() * (W - 60), y: -20, vy: fall, wob: Math.random() * 6 });
      }

      // update items
      for (let i = s.items.length - 1; i >= 0; i--) {
        const it = s.items[i];
        it.y += it.vy * dt;
        const caught = it.y > FLOOR - 26 && it.y < FLOOR + 10 && Math.abs(it.x - s.basketX) < 46;
        if (caught) {
          s.items.splice(i, 1);
          const [sx, sy] = toScreen(it.x, FLOOR - 20);
          if (it.type === 'bomb') {
            s.lives -= 1;
            s.combo = 0;
            audio.deny();
            particles.burst(sx, sy, { colors: ['#f87171', '#fca5a5'], count: 14, power: 6 });
            if (s.lives <= 0) return end();
            setHud({ score: Math.floor(s.score), combo: s.combo, lives: s.lives });
          } else {
            s.combo += 1;
            s.bestCombo = Math.max(s.bestCombo, s.combo);
            const mult = 1 + Math.floor(s.combo / 3);
            s.score += it.base * mult;
            audio.combo(s.combo);
            particles.burst(sx, sy, { colors: [it.color, '#fff'], count: it.type === 'gem' ? 18 : 10, power: 5 });
            if (it.type === 'gem' || it.type === 'star') particles.coins(sx, sy, 3);
            setHud({ score: Math.floor(s.score), combo: s.combo, lives: s.lives });
          }
        } else if (it.y > H + 30) {
          s.items.splice(i, 1);
          if (it.type !== 'bomb' && s.combo > 0) {
            s.combo = 0;
            setHud((h) => ({ ...h, combo: 0 }));
          }
        }
      }

      draw(ctx, s);
      raf = requestAnimationFrame(loop);
    };

    const end = () => {
      g.current.running = false;
      cancelAnimationFrame(raf);
      audio.deny();
      setPhase('over');
      onDone({ score: Math.floor(g.current.score), combo: g.current.bestCombo });
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (g.current) g.current.running = false;
      canvas.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('touchmove', onTouch);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function draw(ctx, s) {
    // bg
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0b1026');
    grad.addColorStop(1, '#1b1240');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

    // items
    for (const it of s.items) {
      ctx.save();
      ctx.shadowColor = it.color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = it.color;
      ctx.beginPath();
      ctx.arc(it.x + Math.sin((s.t + it.wob) * 0.1) * 3, it.y, it.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = it.type === 'bomb' ? '#fff' : 'rgba(0,0,0,0.55)';
      ctx.font = `bold ${it.r}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(it.glyph, it.x, it.y + 1);
      ctx.restore();
    }

    // basket / bowl
    const bx = s.basketX;
    ctx.save();
    ctx.shadowColor = '#67e8f9';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.moveTo(bx - 46, FLOOR - 16);
    ctx.quadraticCurveTo(bx, FLOOR + 34, bx + 46, FLOOR - 16);
    ctx.lineTo(bx + 40, FLOOR - 20);
    ctx.quadraticCurveTo(bx, FLOOR + 18, bx - 40, FLOOR - 20);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.ellipse(bx, FLOOR - 18, 46, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  return (
    <div className="relative mx-auto h-full w-full max-w-[440px]">
      <canvas ref={canvasRef} width={W} height={H} className="h-full w-full touch-none rounded-2xl" style={{ aspectRatio: '400 / 560' }} />

      {phase === 'playing' && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 text-sm font-black">
          <div className="rounded-xl bg-black/40 px-3 py-1.5 backdrop-blur">{'❤️'.repeat(hud.lives)}{'🖤'.repeat(3 - hud.lives)}</div>
          <div className="rounded-xl bg-black/40 px-3 py-1.5 tabular-nums backdrop-blur">{hud.score}</div>
          <div className={`rounded-xl px-3 py-1.5 tabular-nums backdrop-blur ${hud.combo >= 3 ? 'bg-neon-pink/40 text-white' : 'bg-black/40'}`}>×{1 + Math.floor(hud.combo / 3)} <span className="text-white/60">({hud.combo})</span></div>
        </div>
      )}

      {phase === 'ready' && (
        <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/55 p-6 text-center backdrop-blur-sm">
          <div>
            <div className="mb-2 text-6xl">🧺</div>
            <h3 className="text-2xl font-black">Spark Catch</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-white/65">Move to catch ✦ stars & 💎 gems. Build combos for big multipliers. Dodge the ✗ bombs — 3 hits and it's over!</p>
            <button onClick={start} className="press btn-shine mt-5 rounded-2xl bg-gradient-to-br from-neon-cyan to-blue-500 px-8 py-3 font-black text-ink-900 shadow-glow shadow-cyan-400/40">Start</button>
            <p className="mt-3 text-xs text-white/40">Drag / move mouse · or ← → keys</p>
          </div>
        </div>
      )}
    </div>
  );
}
