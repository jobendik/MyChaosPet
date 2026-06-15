import React, { useState } from 'react';
import Pet from './Pet.jsx';
import { SKINS, STAGES } from '../game/config.js';
import { audio } from '../game/audio.js';
import { particles } from '../game/particles.js';

const STARTERS = SKINS.slice(0, 3); // bubblegum / signal / lime — free starters

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState('hatch');
  const [hatching, setHatching] = useState(false);
  const [name, setName] = useState('Mochi');
  const [skinId, setSkinId] = useState('bubblegum');
  const skin = SKINS.find((s) => s.id === skinId);

  const hatch = () => {
    if (hatching) return;
    setHatching(true);
    audio.unlock();
    audio.pop();
    setTimeout(() => {
      audio.evolve();
      particles.confetti({ x: window.innerWidth / 2, y: window.innerHeight / 2.4 });
      setStep('setup');
    }, 950);
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 p-4">
      <div className="stars absolute inset-0 opacity-50" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 35%, rgba(168,85,247,0.25), transparent 60%)' }} />

      <div className="relative w-full max-w-lg text-center">
        {step === 'hatch' && (
          <div className="animate-fade-in">
            <div className="text-[11px] uppercase tracking-[0.4em] text-neon-cyan/70">My Chaos Pet</div>
            <h1 className="mt-1 text-4xl font-black text-gradient sm:text-5xl">A new friend awaits</h1>
            <p className="mx-auto mt-3 max-w-sm text-white/65">Raise it, play with it, and watch it evolve into a cosmic legend. Tap the egg to hatch your chaos pet!</p>
            <button onClick={hatch} className="group relative mx-auto mt-8 block" aria-label="Hatch the egg">
              <div
                className={`mx-auto h-48 w-40 ${hatching ? 'animate-shake' : 'animate-float-y'}`}
                style={{
                  borderRadius: '50% 50% 48% 52% / 60% 60% 40% 40%',
                  background: 'linear-gradient(160deg, #67e8f9, #f472b6 55%, #a855f7)',
                  boxShadow: '0 0 70px rgba(168,85,247,0.6), inset 0 -16px 30px rgba(0,0,0,0.25), inset 0 12px 24px rgba(255,255,255,0.3)',
                }}
              >
                <div className="flex h-full items-center justify-center">
                  <div className="h-1 w-20 rotate-6 bg-black/15" style={{ clipPath: 'polygon(0 50%, 12% 0, 24% 50%, 38% 0, 50% 50%, 64% 0, 76% 50%, 88% 0, 100% 50%, 88% 100%, 76% 50%, 64% 100%, 50% 50%, 38% 100%, 24% 50%, 12% 100%)' }} />
                </div>
              </div>
              <div className="mt-4 inline-block rounded-full bg-white/10 px-5 py-2 text-sm font-bold backdrop-blur transition group-hover:bg-white/20">
                {hatching ? '✨ Hatching…' : '👆 Tap to hatch'}
              </div>
            </button>
          </div>
        )}

        {step === 'setup' && (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-black text-gradient sm:text-4xl">It hatched! 🎉</h1>
            <p className="mt-1 text-white/65">Name your pet and pick a starter color.</p>

            <div className="mx-auto my-3 grid place-items-center">
              <Pet skin={skin} hat="none" face="classic" aura={{ color: null }} stage={STAGES[0]} mood="happy" name={name || 'Mochi'} action={null} onPet={() => { audio.pop(); particles.hearts(window.innerWidth / 2, window.innerHeight / 2); }} />
            </div>

            <div className="mx-auto max-w-sm space-y-4 rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
              <div>
                <label className="mb-1.5 block text-left text-xs font-bold uppercase tracking-wide text-white/55">Name</label>
                <input
                  value={name}
                  maxLength={14}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mochi"
                  className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-center text-lg font-extrabold outline-none focus:border-neon-cyan"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-left text-xs font-bold uppercase tracking-wide text-white/55">Starter Color</label>
                <div className="flex justify-center gap-3">
                  {STARTERS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSkinId(s.id); audio.click(); }}
                      className={`h-14 w-14 rounded-full transition ${skinId === s.id ? 'scale-110 ring-4 ring-white' : 'opacity-80 hover:opacity-100'}`}
                      style={{ background: `radial-gradient(circle at 35% 30%, ${s.stops[0]}, ${s.stops[1]}, ${s.stops[2]})`, boxShadow: `0 0 16px ${s.glow}` }}
                      aria-label={s.name}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={() => onComplete((name || 'Mochi').trim().slice(0, 14) || 'Mochi', skinId)}
                className="press btn-shine w-full rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-pink py-4 text-lg font-black text-ink-900 shadow-glow shadow-cyan-400/40"
              >
                Start Playing →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
