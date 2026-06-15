import React from 'react';

function FloatingText({ floaters }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {floaters.map((f) => (
        <div
          key={f.id}
          className="absolute animate-rise-fade text-2xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-3xl"
          style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.color || '#fff', textShadow: '0 0 12px currentColor' }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
}

const ACTIONS = [
  { id: 'feed', label: 'Feed', icon: '🍓', tone: 'bg-white/10 hover:bg-white/16' },
  { id: 'clean', label: 'Clean', icon: '🫧', tone: 'bg-white/10 hover:bg-white/16' },
  { id: 'rest', label: 'Rest', icon: '🌙', tone: 'bg-white/10 hover:bg-white/16' },
  { id: 'play', label: 'Play', icon: '🎾', tone: 'bg-white/10 hover:bg-white/16' },
  { id: 'arcade', label: 'Arcade', icon: '🎮', tone: 'bg-gradient-to-br from-neon-cyan to-blue-500 text-ink-900 shadow-glow shadow-cyan-400/40' },
];

export default function RoomStage({ room, mood, floaters, onAction, onWheel, wheelReady, children }) {
  const dim = mood === 'sleepy' || mood === 'sad';
  return (
    <section className="order-1 lg:order-2">
      <div
        className="relative flex min-h-[60vh] flex-col overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl lg:min-h-[640px]"
        style={{ background: `linear-gradient(160deg, ${room.sky[0]}, ${room.sky[1]} 55%, ${room.sky[2]})` }}
      >
        {/* starfield + glow */}
        <div className="stars absolute inset-0 opacity-60" />
        <div
          className="absolute inset-0 opacity-50"
          style={{ background: `radial-gradient(circle at 50% 28%, ${room.accent}33, transparent 55%)` }}
        />
        <div className={`absolute inset-0 bg-black/0 transition-colors duration-1000 ${dim ? 'bg-black/30' : ''}`} />

        {/* top status chips */}
        <div className="relative z-10 flex items-start justify-between gap-2 p-4">
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Room</div>
            <div className="text-sm font-bold">{room.name}</div>
          </div>
          <button
            onClick={onWheel}
            className="relative press flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md hover:bg-black/45"
          >
            <span className="text-xl">🎡</span>
            <span className="text-sm font-bold">Spin</span>
            {wheelReady && <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-emerald-400" />}
            {wheelReady && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400" />}
          </button>
        </div>

        {/* decor */}
        <div className="pointer-events-none absolute bottom-28 left-6 text-5xl opacity-80 sm:text-6xl" style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.4))' }}>🪴</div>
        <div className="pointer-events-none absolute bottom-32 right-8 text-4xl opacity-80 sm:text-5xl" style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.4))' }}>🧸</div>
        <div className="pointer-events-none absolute right-14 top-24 text-3xl opacity-70 animate-float-y" style={{ animationDelay: '1s' }}>🪩</div>

        {/* floor */}
        <div
          className="absolute bottom-24 left-1/2 h-40 w-[78%] -translate-x-1/2 rounded-[50%] opacity-30 blur-md"
          style={{ background: room.ground }}
        />

        <FloatingText floaters={floaters} />

        {/* the pet */}
        <div className="relative z-10 flex flex-1 items-center justify-center pb-28 pt-2">
          {children}
        </div>

        {/* action bar */}
        <div className="absolute inset-x-3 bottom-3 z-20 grid grid-cols-5 gap-2 rounded-3xl border border-white/10 bg-black/40 p-2 backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:gap-3 sm:p-3">
          {ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => onAction(a.id)}
              className={`press btn-shine flex flex-col items-center gap-0.5 rounded-2xl py-2.5 text-xs font-extrabold sm:py-3 sm:text-sm ${a.tone}`}
            >
              <span className="text-xl sm:text-2xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
