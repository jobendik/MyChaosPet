import React, { useEffect, useRef, useState } from 'react';

// =============================================================================
// The star of the show. A procedural SVG creature that breathes, blinks, tracks
// the pointer, emotes by mood, wears cosmetics, and grows through life-stages.
// =============================================================================

const MOUTHS = {
  smileBig: 'M84,146 Q110,182 136,146',
  smile: 'M92,150 Q110,170 128,150',
  flat: 'M97,156 Q110,161 123,156',
  frown: 'M90,164 Q110,146 130,164',
  tiny: 'M104,156 Q110,162 116,156',
  wavy: 'M90,156 q7,-7 14,0 q7,7 14,0',
};

function Hat({ id, glow }) {
  switch (id) {
    case 'party':
      return (
        <g transform="translate(110,40)">
          <polygon points="0,-46 -22,6 22,6" fill="#f472b6" stroke="#fff" strokeWidth="2" />
          <polygon points="0,-46 -22,6 0,6" fill="#ec4899" />
          <circle cx="0" cy="-46" r="7" fill="#fde68a" />
          <circle cx="-9" cy="-14" r="3" fill="#fde68a" />
          <circle cx="8" cy="-2" r="3" fill="#a7f3d0" />
        </g>
      );
    case 'crown':
      return (
        <g transform="translate(110,34)">
          <path d="M-28,8 L-28,-14 L-14,2 L0,-20 L14,2 L28,-14 L28,8 Z" fill="#fbbf24" stroke="#fde68a" strokeWidth="2" />
          <circle cx="0" cy="-20" r="4" fill="#f472b6" />
          <circle cx="-28" cy="-14" r="3.5" fill="#67e8f9" />
          <circle cx="28" cy="-14" r="3.5" fill="#67e8f9" />
        </g>
      );
    case 'antenna':
      return (
        <g transform="translate(110,40)">
          <line x1="-12" y1="6" x2="-20" y2="-30" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="6" x2="20" y2="-30" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <circle cx="-20" cy="-32" r="6" fill="#67e8f9" className="animate-twinkle fb" />
          <circle cx="20" cy="-32" r="6" fill="#f472b6" className="animate-twinkle fb" />
        </g>
      );
    case 'bow':
      return (
        <g transform="translate(110,44)">
          <path d="M-4,0 L-30,-14 L-30,14 Z" fill="#f472b6" />
          <path d="M4,0 L30,-14 L30,14 Z" fill="#f472b6" />
          <circle cx="0" cy="0" r="7" fill="#fbcfe8" />
          <path d="M-4,0 L-30,-14 L-30,14 Z" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
        </g>
      );
    case 'halo':
      return (
        <g transform="translate(110,30)">
          <ellipse cx="0" cy="0" rx="30" ry="9" fill="none" stroke="#fde68a" strokeWidth="5" className="animate-glow-pulse fb" style={{ filter: 'drop-shadow(0 0 8px #fde68a)' }} />
        </g>
      );
    case 'horns':
      return (
        <g transform="translate(110,46)">
          <path d="M-18,4 Q-34,-22 -20,-34 Q-16,-14 -8,4 Z" fill="#f87171" stroke="#fff" strokeWidth="1.5" />
          <path d="M18,4 Q34,-22 20,-34 Q16,-14 8,4 Z" fill="#f87171" stroke="#fff" strokeWidth="1.5" />
        </g>
      );
    case 'cap':
      return (
        <g transform="translate(110,44)">
          <path d="M-26,4 Q-26,-22 0,-22 Q26,-22 26,4 Z" fill="#a855f7" />
          <rect x="-30" y="2" width="60" height="8" rx="4" fill="#7c3aed" />
          <circle cx="0" cy="-22" r="5" fill="#c4b5fd" />
        </g>
      );
    default:
      return glow ? null : null;
  }
}

function Eyes({ face, mood, leftRef, rightRef }) {
  const sleepy = mood === 'sleepy';
  const closed = mood === 'ecstatic'; // happy closed ^^ eyes

  if (face === 'cool') {
    return (
      <g>
        <rect x="74" y="98" width="72" height="26" rx="13" fill="#0f172a" stroke="#334155" strokeWidth="3" />
        <rect x="78" y="101" width="28" height="9" rx="4" fill="#475569" opacity="0.8" />
        <line x1="74" y1="104" x2="62" y2="100" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        <line x1="146" y1="104" x2="158" y2="100" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }

  const robot = face === 'robot';
  const big = face === 'kawaii';
  const rx = big ? 18 : 15;
  const ry = big ? 21 : 18;

  const renderEye = (cx, ref) => {
    if (closed) {
      return <path d={`M${cx - 13},110 Q${cx},98 ${cx + 13},110`} fill="none" stroke="#1e1b2e" strokeWidth="4.5" strokeLinecap="round" />;
    }
    if (robot) {
      return (
        <g>
          <rect x={cx - 14} y={94} width="28" height="28" rx="6" fill="#0f172a" stroke="#67e8f9" strokeWidth="2.5" />
          <g ref={ref}>
            <rect x={cx - 5} y={103} width="10" height="10" rx="2" fill="#67e8f9" style={{ filter: 'drop-shadow(0 0 4px #67e8f9)' }} />
          </g>
        </g>
      );
    }
    return (
      <g>
        <ellipse cx={cx} cy={107} rx={rx} ry={sleepy ? ry * 0.45 : ry} fill="#fff" className="fb" style={sleepy ? undefined : { animation: 'blink 5.5s infinite' }} />
        {!sleepy && (
          <g ref={ref}>
            <circle cx={cx} cy={110} r={big ? 9 : 7.5} fill="#1e1b2e" />
            <circle cx={cx + 3} cy={107} r={2.6} fill="#fff" />
            {face === 'sparkle' && <circle cx={cx - 3} cy={112} r={1.5} fill="#fff" opacity="0.9" />}
          </g>
        )}
        {sleepy && <path d={`M${cx - 12},108 Q${cx},114 ${cx + 12},108`} fill="none" stroke="#1e1b2e" strokeWidth="3.5" strokeLinecap="round" />}
      </g>
    );
  };

  return (
    <g>
      {renderEye(88, leftRef)}
      {renderEye(132, rightRef)}
    </g>
  );
}

export default function Pet({ skin, hat, face, aura, stage, mood, name, action, onPet }) {
  const svgRef = useRef(null);
  const leftPupil = useRef(null);
  const rightPupil = useRef(null);
  const [anim, setAnim] = useState('');

  // Trigger a one-shot reaction animation whenever `action` changes.
  useEffect(() => {
    if (!action) return;
    const map = { pet: 'animate-squish', feed: 'animate-squish', clean: 'animate-squish', play: 'animate-hop', happy: 'animate-hop', evolve: 'animate-pop', win: 'animate-hop' };
    setAnim(map[action.type] || 'animate-squish');
    const t = setTimeout(() => setAnim(''), action.type === 'evolve' ? 600 : 600);
    return () => clearTimeout(t);
  }, [action]);

  // Pupils gently follow the pointer for that "alive" feeling.
  useEffect(() => {
    let frame = null;
    const onMove = (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const el = svgRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.45;
        const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width / 2)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height / 2)));
        const tx = dx * 4;
        const ty = dy * 3;
        if (leftPupil.current) leftPupil.current.style.transform = `translate(${tx}px,${ty}px)`;
        if (rightPupil.current) rightPupil.current.style.transform = `translate(${tx}px,${ty}px)`;
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => { window.removeEventListener('pointermove', onMove); if (frame) cancelAnimationFrame(frame); };
  }, []);

  const isAstral = stage.id === 'astral';
  const isNova = stage.id === 'nova';

  // Resting mouth shape per mood.
  const mouthOpen = mood === 'ecstatic' || mood === 'hungry';
  const mouthKey =
    mood === 'sad' ? 'frown'
    : mood === 'bored' ? 'flat'
    : mood === 'sleepy' ? 'tiny'
    : mood === 'dirty' ? 'wavy'
    : mood === 'happy' ? 'smileBig'
    : mood === 'content' ? 'smile'
    : 'smile';

  const blush = mood === 'happy' || mood === 'ecstatic' || face === 'kawaii';
  const gid = skin.id;

  return (
    <div className="relative select-none" style={{ width: 280, maxWidth: '78vw' }}>
      {/* soft floor shadow */}
      <div className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-black/40 blur-xl" style={{ width: 150, height: 26, bottom: 8 }} />

      <button
        onClick={onPet}
        aria-label={`Pet ${name}`}
        className="relative block w-full origin-bottom transition-transform duration-300 active:scale-[0.97] focus:outline-none animate-float-y"
      >
        <svg ref={svgRef} viewBox="0 0 220 240" className="w-full overflow-visible" style={{ transform: `scale(${stage.scale})` }}>
          <defs>
            <radialGradient id={`body-${gid}`} cx="38%" cy="30%" r="80%">
              <stop offset="0%" stopColor={skin.stops[0]} />
              <stop offset="55%" stopColor={skin.stops[1]} />
              <stop offset="100%" stopColor={skin.stops[2]} />
            </radialGradient>
            <radialGradient id={`belly-${gid}`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <filter id="petglow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* aura ring of orbiting motes */}
          {(aura?.color || isAstral) && (
            <g className="animate-spin-slow" style={{ transformOrigin: '110px 132px' }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const a = (Math.PI * 2 * i) / 7;
                const R = 96;
                const x = 110 + Math.cos(a) * R;
                const y = 132 + Math.sin(a) * R * 0.92;
                const c = aura?.color || '#a5f3fc';
                return isAstral && !aura?.color ? (
                  <text key={i} x={x} y={y} fontSize="16" textAnchor="middle" className="animate-twinkle fb" style={{ animationDelay: `${i * 0.2}s` }}>⭐</text>
                ) : (
                  <circle key={i} cx={x} cy={y} r={i % 2 ? 4 : 6} fill={c} opacity="0.85" style={{ filter: `drop-shadow(0 0 6px ${c})` }} className="animate-twinkle fb" />
                );
              })}
            </g>
          )}

          {/* glow halo behind body */}
          <ellipse cx="110" cy="134" rx="86" ry="84" fill={skin.glow} opacity={isAstral ? 0.5 : 0.32} style={{ filter: 'blur(14px)' }} className="animate-glow-pulse fb" />

          {/* the body + features, animated as a unit (breathe + reactions) */}
          <g className={`origin-bottom ${anim || 'animate-breathe'}`} style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}>
            {/* feet */}
            <ellipse cx="88" cy="214" rx="18" ry="10" fill={skin.stops[2]} />
            <ellipse cx="132" cy="214" rx="18" ry="10" fill={skin.stops[2]} />

            {/* arms */}
            <ellipse cx="30" cy="150" rx="13" ry="20" fill={skin.stops[1]} transform="rotate(-18 30 150)" />
            <ellipse cx="190" cy="150" rx="13" ry="20" fill={skin.stops[1]} transform="rotate(18 190 150)" />

            {/* body */}
            <ellipse cx="110" cy="132" rx="80" ry="84" fill={`url(#body-${gid})`} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
            {/* belly highlight */}
            <ellipse cx="104" cy="150" rx="52" ry="56" fill={`url(#belly-${gid})`} />
            {/* top sheen */}
            <ellipse cx="84" cy="80" rx="26" ry="16" fill="#ffffff" opacity="0.35" transform="rotate(-20 84 80)" />

            {/* stage flair */}
            {(isNova || isAstral) && (
              <>
                <text x="56" y="120" fontSize="11" opacity="0.8">✦</text>
                <text x="158" y="128" fontSize="11" opacity="0.8">✦</text>
              </>
            )}

            {/* blush */}
            {blush && (
              <>
                <ellipse cx="68" cy="132" rx="11" ry="7" fill="#fb7185" opacity="0.5" />
                <ellipse cx="152" cy="132" rx="11" ry="7" fill="#fb7185" opacity="0.5" />
              </>
            )}

            <Eyes face={face} mood={mood} leftRef={leftPupil} rightRef={rightPupil} />

            {/* mouth */}
            {mouthOpen ? (
              <g>
                <ellipse cx="110" cy="156" rx="15" ry={mood === 'ecstatic' ? 16 : 11} fill="#5b1230" />
                <ellipse cx="110" cy="163" rx="9" ry="6" fill="#fb7185" />
              </g>
            ) : (
              <path d={MOUTHS[mouthKey]} fill="none" stroke="#3b1026" strokeWidth="4.5" strokeLinecap="round" />
            )}

            {/* sweat drop when neglected */}
            {(mood === 'hungry' || mood === 'sad' || mood === 'dirty') && (
              <path d="M150,96 q4,10 0,14 q-6,-2 0,-14" fill="#7dd3fc" opacity="0.85" className="animate-float-y" />
            )}
          </g>

          {/* hat sits above everything */}
          <Hat id={hat} />
        </svg>
      </button>

      {/* sleepy Zzz */}
      {mood === 'sleepy' && (
        <div className="pointer-events-none absolute right-6 top-2 text-2xl text-white/80">
          <span className="inline-block animate-float-y" style={{ animationDelay: '0s' }}>z</span>
          <span className="inline-block animate-float-y text-3xl" style={{ animationDelay: '0.3s' }}>Z</span>
          <span className="inline-block animate-float-y text-4xl" style={{ animationDelay: '0.6s' }}>Z</span>
        </div>
      )}

      {/* name tag */}
      <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/40 px-4 py-1 text-sm font-bold backdrop-blur-md">
        {name} <span className="text-white/50">· {stage.name}</span>
      </div>
    </div>
  );
}
