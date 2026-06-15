import React, { useState } from 'react';

function Toggle({ label, on, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="font-bold">{label}</span>
      <span className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-emerald-400' : 'bg-white/15'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}

export default function SettingsModal({ game, onChange, onReset, onClose }) {
  const [confirm, setConfirm] = useState(false);
  const s = game.settings;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[2rem] border border-white/15 bg-ink-800 p-5 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-gradient">Settings</h2>
          <button onClick={onClose} className="press rounded-xl bg-white/10 px-3 py-1.5 text-sm font-bold">Done</button>
        </div>

        <div className="space-y-2.5">
          <Toggle label="🔊 Sound Effects" on={s.sfx} onClick={() => onChange({ sfx: !s.sfx })} />
          <Toggle label="🎵 Music" on={s.music} onClick={() => onChange({ music: !s.music })} />
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="mb-2 flex items-center justify-between font-bold"><span>Volume</span><span className="text-white/50">{Math.round(s.volume * 100)}%</span></div>
            <input type="range" min="0" max="1" step="0.05" value={s.volume} onChange={(e) => onChange({ volume: parseFloat(e.target.value) })} className="w-full" />
          </div>
          <Toggle label="🌿 Reduced Effects" on={s.reducedFx} onClick={() => onChange({ reducedFx: !s.reducedFx })} />
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          {confirm ? (
            <div className="space-y-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-center">
              <p className="text-sm text-white/80">Erase your pet and all progress?</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(false)} className="press flex-1 rounded-xl bg-white/10 py-2 text-sm font-bold">Cancel</button>
                <button onClick={onReset} className="press flex-1 rounded-xl bg-rose-500 py-2 text-sm font-extrabold">Erase</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirm(true)} className="w-full rounded-2xl bg-white/5 py-2.5 text-sm font-bold text-white/55 hover:bg-white/10">Reset Game</button>
          )}
          <p className="mt-3 text-center text-[11px] text-white/30">My Chaos Pet · made with chaos & love</p>
        </div>
      </div>
    </div>
  );
}
