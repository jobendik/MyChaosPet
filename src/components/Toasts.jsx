import React from 'react';

// Stacked notifications that slide in from the right and auto-dismiss.
export default function Toasts({ toasts }) {
  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[60] flex w-[min(20rem,calc(100vw-1.5rem))] flex-col gap-2 sm:right-4 sm:top-4">
      {toasts.slice(-4).map((t) => (
        <div
          key={t.id}
          className="animate-slide-in-right overflow-hidden rounded-2xl border border-white/15 bg-ink-800/90 shadow-glow-lg shadow-violet-500/20 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-xl">
              {t.icon || '✨'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold">{t.title}</div>
              {t.body && <div className="truncate text-xs text-white/65">{t.body}</div>}
            </div>
          </div>
          <div className="h-0.5 w-full origin-left bg-gradient-to-r from-neon-cyan to-neon-pink" style={{ animation: 'drain 3.4s linear forwards' }} />
        </div>
      ))}
    </div>
  );
}
