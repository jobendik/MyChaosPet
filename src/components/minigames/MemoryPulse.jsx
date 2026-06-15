import React, { useEffect, useRef, useState } from 'react';
import { audio } from '../../game/audio.js';
import { particles } from '../../game/particles.js';

const PADS = [
  { color: '#22d3ee', freq: 392 },
  { color: '#f472b6', freq: 440 },
  { color: '#a855f7', freq: 494 },
  { color: '#a3e635', freq: 523 },
  { color: '#fbbf24', freq: 587 },
  { color: '#fb7185', freq: 659 },
];

export default function MemoryPulse({ onDone }) {
  const [phase, setPhase] = useState('ready'); // ready | show | input | over
  const [seq, setSeq] = useState([]);
  const [active, setActive] = useState(-1);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const inputIdx = useRef(0);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const addScore = (n) => { scoreRef.current += n; setScore(scoreRef.current); };

  const start = () => {
    clearTimers();
    scoreRef.current = 0;
    setScore(0);
    setRound(1);
    nextRound([]);
  };

  const nextRound = (current) => {
    const next = [...current, Math.floor(Math.random() * PADS.length)];
    setSeq(next);
    setRound(next.length);
    setPhase('show');
    inputIdx.current = 0;
    const speed = Math.max(280, 620 - next.length * 24);
    next.forEach((pad, i) => {
      timers.current.push(setTimeout(() => {
        setActive(pad);
        audio.tone(PADS[pad].freq, 0.28, { type: 'sine', gain: 0.25 });
      }, i * speed + 350));
      timers.current.push(setTimeout(() => setActive(-1), i * speed + 350 + speed * 0.6));
    });
    timers.current.push(setTimeout(() => setPhase('input'), next.length * speed + 450));
  };

  const tap = (i, e) => {
    if (phase !== 'input') return;
    setActive(i);
    timers.current.push(setTimeout(() => setActive(-1), 160));
    audio.tone(PADS[i].freq, 0.2, { type: 'sine', gain: 0.25 });

    if (i === seq[inputIdx.current]) {
      inputIdx.current += 1;
      addScore(5);
      if (e) particles.sparkle(e.clientX, e.clientY, PADS[i].color);
      if (inputIdx.current >= seq.length) {
        // round cleared
        addScore(seq.length * 10);
        setPhase('show');
        timers.current.push(setTimeout(() => nextRound(seq), 650));
      }
    } else {
      // wrong
      audio.deny();
      setPhase('over');
      clearTimers();
      onDone({ score: scoreRef.current, combo: seq.length - 1 });
    }
  };

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[440px] flex-col items-center justify-center p-3">
      <div className="mb-4 flex w-full items-center justify-between text-sm font-black">
        <div className="rounded-xl bg-black/40 px-3 py-1.5">Round {round}</div>
        <div className="rounded-xl bg-black/40 px-3 py-1.5 tabular-nums">{score}</div>
        <div className="rounded-xl bg-black/40 px-3 py-1.5">{phase === 'show' ? '👀 Watch' : phase === 'input' ? '🫵 Repeat' : '—'}</div>
      </div>

      <div className="grid w-full max-w-[320px] grid-cols-3 gap-3">
        {PADS.map((p, i) => (
          <button
            key={i}
            onPointerDown={(e) => tap(i, e)}
            disabled={phase !== 'input'}
            className="aspect-square rounded-2xl border-2 transition-all duration-150"
            style={{
              background: active === i ? p.color : `${p.color}33`,
              borderColor: p.color,
              boxShadow: active === i ? `0 0 30px ${p.color}, inset 0 0 20px rgba(255,255,255,0.5)` : `0 0 8px ${p.color}55`,
              transform: active === i ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {phase === 'ready' && (
        <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/55 p-6 text-center backdrop-blur-sm">
          <div>
            <div className="mb-2 text-6xl">🧠</div>
            <h3 className="text-2xl font-black">Memory Pulse</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-white/65">Watch the glowing sequence, then repeat it. Each round adds one more — how far can your memory go?</p>
            <button onClick={start} className="press btn-shine mt-5 rounded-2xl bg-gradient-to-br from-neon-violet to-fuchsia-500 px-8 py-3 font-black text-white shadow-glow shadow-fuchsia-500/40">Start</button>
          </div>
        </div>
      )}
    </div>
  );
}
