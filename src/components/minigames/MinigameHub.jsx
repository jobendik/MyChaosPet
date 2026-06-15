import React, { useState } from 'react';
import SparkCatch from './SparkCatch.jsx';
import MemoryPulse from './MemoryPulse.jsx';
import BubblePop from './BubblePop.jsx';
import { fmt } from '../../game/engine.js';

const GAMES = [
  { id: 'spark', name: 'Spark Catch', icon: '🧺', desc: 'Catch stars & gems, dodge bombs.', accent: 'from-neon-cyan to-blue-500' },
  { id: 'memory', name: 'Memory Pulse', icon: '🧠', desc: 'Repeat the glowing sequence.', accent: 'from-neon-violet to-fuchsia-500' },
  { id: 'pop', name: 'Bubble Pop', icon: '🫧', desc: '30s combo-popping frenzy.', accent: 'from-emerald-400 to-teal-500' },
];

export default function MinigameHub({ game, onComplete, onClose }) {
  const [view, setView] = useState('list');
  const [gameId, setGameId] = useState(null);
  const [result, setResult] = useState(null);
  const [playKey, setPlayKey] = useState(0);

  const launch = (id) => { setGameId(id); setView('play'); setPlayKey((k) => k + 1); };
  const handleDone = (res) => {
    const summary = onComplete(gameId, res);
    setResult({ ...res, ...summary });
    setView('result');
  };

  const current = GAMES.find((g) => g.id === gameId);
  const GameComp = gameId === 'spark' ? SparkCatch : gameId === 'memory' ? MemoryPulse : BubblePop;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-3 backdrop-blur-md animate-fade-in sm:p-4" onClick={onClose}>
      <div className="flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-ink-800 shadow-2xl sm:h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-neon-cyan/70">Chaos Arcade</div>
            <h2 className="text-xl font-black text-gradient">{view === 'play' && current ? current.name : 'Pick a Game'}</h2>
          </div>
          <div className="flex gap-2">
            {view !== 'list' && (
              <button onClick={() => setView('list')} className="press rounded-xl bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15">Games</button>
            )}
            <button onClick={onClose} className="press rounded-xl bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15">Exit</button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden p-4">
          {view === 'list' && (
            <div className="grid h-full content-start gap-3 sm:grid-cols-1">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => launch(g.id)}
                  className="press group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-left hover:border-white/20 hover:bg-white/10"
                >
                  <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${g.accent} text-3xl shadow-glow`}>{g.icon}</div>
                  <div className="flex-1">
                    <div className="text-lg font-black">{g.name}</div>
                    <div className="text-sm text-white/60">{g.desc}</div>
                    <div className="mt-1 text-xs text-amber-200">Best: {fmt(game.records.bestByGame?.[g.id] || 0)}</div>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold group-hover:bg-white/20">Play ▸</div>
                </button>
              ))}
              <p className="mt-2 px-1 text-center text-xs text-white/40">Arcade runs earn coins, XP & boost your pet's mood.</p>
            </div>
          )}

          {view === 'play' && (
            <div className="h-full">
              <GameComp key={playKey} onDone={handleDone} />
            </div>
          )}

          {view === 'result' && result && (
            <div className="grid h-full place-items-center animate-pop p-4 text-center">
              <div>
                <div className="text-6xl">{result.newBest ? '🏆' : '🎉'}</div>
                <h3 className="mt-2 text-3xl font-black text-gradient">{result.newBest ? 'New Best Score!' : 'Nice Run!'}</h3>
                <div className="mx-auto mt-5 grid max-w-xs grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-2xl font-black">{fmt(result.score)}</div><div className="text-[10px] uppercase text-white/50">Score</div></div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-2xl font-black">×{result.combo}</div><div className="text-[10px] uppercase text-white/50">Best Combo</div></div>
                  <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3"><div className="text-2xl font-black text-amber-200">+{fmt(result.coins)}</div><div className="text-[10px] uppercase text-white/50">Coins 🪙</div></div>
                  <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-3"><div className="text-2xl font-black text-cyan-200">+{fmt(result.xp)}</div><div className="text-[10px] uppercase text-white/50">XP ⭐</div></div>
                </div>
                <div className="mt-5 flex justify-center gap-2">
                  <button onClick={() => setView('list')} className="press rounded-2xl bg-white/10 px-5 py-3 font-extrabold hover:bg-white/15">Games</button>
                  <button onClick={() => launch(gameId)} className="press btn-shine rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-pink px-6 py-3 font-black text-ink-900">Play Again</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
