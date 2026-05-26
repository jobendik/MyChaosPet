import React, { useEffect, useMemo, useRef, useState } from "react";

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.floor(n));

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

const rooms = [
  { id: "neon_nest", name: "Neon Nest", price: 0, bg: "from-slate-950 via-indigo-950 to-cyan-950", floor: "bg-cyan-300/10 border-cyan-200/20", glow: "shadow-cyan-400/30" },
  { id: "candy_lab", name: "Candy Lab", price: 650, bg: "from-fuchsia-950 via-pink-900 to-amber-700", floor: "bg-pink-100/15 border-pink-100/25", glow: "shadow-pink-300/30" },
  { id: "jungle_arcade", name: "Jungle Arcade", price: 950, bg: "from-emerald-950 via-teal-900 to-lime-800", floor: "bg-lime-100/15 border-lime-100/25", glow: "shadow-lime-300/30" },
  { id: "moon_bedroom", name: "Moon Bedroom", price: 1400, bg: "from-zinc-950 via-violet-950 to-slate-800", floor: "bg-violet-200/15 border-violet-100/25", glow: "shadow-violet-300/30" },
];

const cosmetics = [
  { id: "none", type: "hat", name: "No Hat", price: 0, icon: "·" },
  { id: "party_hat", type: "hat", name: "Party Cone", price: 180, icon: "△" },
  { id: "crown", type: "hat", name: "Tiny Crown", price: 420, icon: "♛" },
  { id: "antenna", type: "hat", name: "Signal Antenna", price: 560, icon: "⌁" },
  { id: "pink", type: "skin", name: "Bubblegum", price: 0, className: "from-pink-300 via-fuchsia-400 to-rose-500" },
  { id: "cyan", type: "skin", name: "Signal Blue", price: 240, className: "from-cyan-200 via-sky-400 to-blue-600" },
  { id: "lime", type: "skin", name: "Lime Pop", price: 300, className: "from-lime-200 via-emerald-400 to-green-600" },
  { id: "gold", type: "skin", name: "Honey Gold", price: 520, className: "from-yellow-200 via-amber-400 to-orange-500" },
  { id: "face_happy", type: "face", name: "Happy Face", price: 0, face: "happy" },
  { id: "face_sleepy", type: "face", name: "Sleepy Face", price: 220, face: "sleepy" },
  { id: "face_silly", type: "face", name: "Silly Face", price: 340, face: "silly" },
  { id: "face_robot", type: "face", name: "Robot Face", price: 520, face: "robot" },
];

const foodItems = [
  { id: "berry", name: "Glow Berry", cost: 22, hunger: 15, fun: 3, xp: 6, emoji: "🍓" },
  { id: "noodles", name: "Cosmic Noodles", cost: 48, hunger: 28, fun: 6, xp: 12, emoji: "🍜" },
  { id: "cake", name: "Moon Cake", cost: 88, hunger: 42, fun: 14, hygiene: -6, xp: 20, emoji: "🍰" },
  { id: "sushi", name: "Star Sushi", cost: 120, hunger: 55, fun: 8, xp: 30, emoji: "🍣" },
];

const toyItems = [
  { id: "ball", name: "Bounce Ball", cost: 90, fun: 28, energy: -8, xp: 18, emoji: "⚽" },
  { id: "laser", name: "Laser Dot", cost: 160, fun: 42, energy: -15, xp: 28, emoji: "🔴" },
  { id: "drone", name: "Tiny Drone", cost: 290, fun: 58, energy: -20, xp: 45, emoji: "🚁" },
];

const achievements = [
  { id: "first_feed", name: "First Snack", desc: "Feed your pet once.", reward: 60 },
  { id: "clean_sparkle", name: "Sparkle Mode", desc: "Reach 95 hygiene.", reward: 80 },
  { id: "level_3", name: "Growing Buddy", desc: "Reach level 3.", reward: 150 },
  { id: "coin_1000", name: "Pocket Tycoon", desc: "Hold 1,000 coins.", reward: 220 },
  { id: "mini_master", name: "Arcade Starter", desc: "Earn 300 points in minigames total.", reward: 180 },
];

const questTemplates = [
  { id: "feed2", text: "Feed Mochi 2 times", target: 2, field: "feeds", reward: 120 },
  { id: "play2", text: "Play 2 times", target: 2, field: "plays", reward: 140 },
  { id: "clean1", text: "Clean once", target: 1, field: "cleans", reward: 90 },
  { id: "arcade150", text: "Score 150 in minigames", target: 150, field: "miniScore", reward: 180 },
];

function makeInitialGame() {
  return {
    name: "Mochi",
    level: 1,
    xp: 0,
    coins: 420,
    gems: 5,
    streak: 1,
    lastDaily: null,
    stats: { hunger: 72, fun: 66, energy: 78, hygiene: 69, social: 58 },
    owned: { rooms: ["neon_nest"], cosmetics: ["none", "pink", "face_happy"], food: { berry: 2, noodles: 1 }, toys: { ball: 1 } },
    equipped: { room: "neon_nest", hat: "none", skin: "pink", face: "face_happy" },
    questProgress: { feeds: 0, plays: 0, cleans: 0, miniScore: 0 },
    claimedQuests: [],
    claimedAchievements: [],
    moodLog: ["Mochi moved in and is ready to play!"],
    minigameScoreTotal: 0,
  };
}

function levelFromXp(level, xp) {
  let lvl = level;
  let remaining = xp;
  let needed = 100 + lvl * 45;
  while (remaining >= needed) {
    remaining -= needed;
    lvl += 1;
    needed = 100 + lvl * 45;
  }
  return { level: lvl, xp: remaining, needed };
}

function StatBar({ label, value, icon }) {
  const tone = value > 70 ? "bg-emerald-300" : value > 35 ? "bg-amber-300" : "bg-rose-400";
  return (
    <div className="rounded-2xl bg-white/8 border border-white/10 p-3 shadow-lg shadow-black/10">
      <div className="mb-2 flex items-center justify-between text-xs text-white/75">
        <span className="font-semibold uppercase tracking-wide">{icon} {label}</span>
        <span className="tabular-nums">{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/30">
        <div className={`h-full rounded-full ${tone} transition-all duration-500`} style={{ width: `${clamp(value)}%` }} />
      </div>
    </div>
  );
}

function Pet({ game, mood, pulse, onPet }) {
  const skin = cosmetics.find((c) => c.id === game.equipped.skin)?.className || cosmetics.find((c) => c.id === "pink").className;
  const hat = cosmetics.find((c) => c.id === game.equipped.hat);
  const face = cosmetics.find((c) => c.id === game.equipped.face)?.face || "happy";
  const eyes = { happy: ["●", "●"], sleepy: ["◡", "◡"], silly: ["⊙", "◕"], robot: ["▣", "▣"] }[face];
  const mouth = mood === "sad" ? "︵" : mood === "sleepy" ? "—" : face === "silly" ? "ω" : "ᴗ";

  return (
    <button onClick={onPet} className={`relative h-64 w-64 rounded-[45%_55%_52%_48%] border border-white/30 bg-gradient-to-br ${skin} shadow-2xl shadow-white/10 transition-all duration-300 hover:scale-[1.03] active:scale-95 md:h-80 md:w-80 ${pulse ? "animate-bounce" : ""}`} style={{ filter: "drop-shadow(0 0 34px rgba(255,255,255,.18))" }} aria-label="Pet Mochi">
      <div className="absolute inset-5 rounded-[45%_55%_52%_48%] bg-white/20 blur-xl" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-7xl text-white drop-shadow-xl">{hat?.icon !== "·" ? hat?.icon : ""}</div>
      <div className="absolute left-16 top-20 grid h-12 w-12 place-items-center rounded-full bg-white/85 text-3xl font-black text-slate-900 shadow-inner">{eyes[0]}</div>
      <div className="absolute right-16 top-20 grid h-12 w-12 place-items-center rounded-full bg-white/85 text-3xl font-black text-slate-900 shadow-inner">{eyes[1]}</div>
      <div className="absolute left-1/2 top-36 -translate-x-1/2 text-6xl font-black text-white/90 drop-shadow-lg">{mouth}</div>
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-4"><div className="h-5 w-12 rounded-full bg-black/15" /><div className="h-5 w-12 rounded-full bg-black/15" /></div>
      <div className="absolute -bottom-6 left-8 h-14 w-14 rounded-full bg-white/20 blur-md" />
      <div className="absolute -right-5 top-20 animate-pulse text-4xl">✨</div>
    </button>
  );
}

function ToastStack({ toasts }) {
  return <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-2">{toasts.slice(-4).map((t) => <div key={t.id} className="max-w-xs rounded-2xl border border-white/15 bg-slate-950/90 px-4 py-3 text-white shadow-2xl backdrop-blur-xl"><div className="text-sm font-black">{t.title}</div><div className="text-xs text-white/70">{t.body}</div></div>)}</div>;
}

function FloatingText({ floaters }) {
  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{floaters.map((f) => <div key={f.id} className="absolute animate-ping text-xl font-black text-white drop-shadow-lg md:text-2xl" style={{ left: `${f.x}%`, top: `${f.y}%` }}>{f.text}</div>)}</div>;
}

function MiniGameModal({ setGame, close, addToast, addFloater }) {
  const [mode, setMode] = useState("catch");
  const [active, setActive] = useState(false);
  const [time, setTime] = useState(20);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState([]);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => { scoreRef.current = score; }, [score]);

  const makeTarget = () => ({ id: `${Date.now()}_${Math.random()}`, x: 8 + Math.random() * 82, y: 12 + Math.random() * 72, bad: mode === "avoid" && Math.random() < 0.45, emoji: mode === "memory" ? ["⭐", "🌙", "⚡", "💎", "🍓"][Math.floor(Math.random() * 5)] : "✨" });
  const spawnTargets = () => setTargets(Array.from({ length: mode === "avoid" ? 8 : 5 }, makeTarget));

  const start = () => { setActive(true); setTime(20); setScore(0); scoreRef.current = 0; spawnTargets(); };

  useEffect(() => {
    if (!active) return undefined;
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setActive(false);
          const finalScore = scoreRef.current;
          const coins = Math.max(20, Math.floor(finalScore * 0.9));
          const xp = Math.max(12, Math.floor(finalScore * 0.35));
          setGame((g) => {
            const leveled = levelFromXp(g.level, g.xp + xp);
            return { ...g, level: leveled.level, xp: leveled.xp, coins: g.coins + coins, stats: { ...g.stats, fun: clamp(g.stats.fun + 18), energy: clamp(g.stats.energy - 10), social: clamp(g.stats.social + 7) }, questProgress: { ...g.questProgress, plays: g.questProgress.plays + 1, miniScore: g.questProgress.miniScore + finalScore }, minigameScoreTotal: g.minigameScoreTotal + finalScore, moodLog: [`Arcade run: +${finalScore} score, +${coins} coins.`, ...g.moodLog].slice(0, 8) };
          });
          addToast("Arcade Complete", `+${coins} coins · +${xp} XP · ${finalScore} score`);
          addFloater(`+${coins} 🪙`, 48, 50);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active, setGame, addToast, addFloater]);

  const clickTarget = (target) => {
    if (!active) return;
    if (mode === "avoid" && target.bad) { setScore((s) => Math.max(0, s - 20)); addFloater("-20", target.x, target.y); }
    else { const gain = mode === "memory" ? 18 : mode === "avoid" ? 14 : 10; setScore((s) => s + gain); addFloater(`+${gain}`, target.x, target.y); }
    setTargets((items) => items.filter((i) => i.id !== target.id));
    setTimeout(() => setTargets((items) => [...items, makeTarget()]), 180);
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950 text-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5"><div><div className="text-xs uppercase tracking-[.35em] text-cyan-200/70">Mochi Arcade</div><h2 className="text-2xl font-black">Fast Reward Minigames</h2></div><button onClick={close} className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/15">Close</button></div>
        <div className="grid gap-0 md:grid-cols-[240px_1fr]">
          <div className="space-y-3 border-r border-white/10 bg-white/[.03] p-5">
            {[["catch", "Catch Sparks", "Click good sparks as fast as possible."], ["avoid", "Avoid Glitches", "Click rewards, avoid red glitches."], ["memory", "Symbol Burst", "Higher-value symbol popping."]].map(([id, title, desc]) => <button key={id} onClick={() => !active && setMode(id)} className={`w-full rounded-2xl border p-4 text-left transition ${mode === id ? "border-cyan-200/40 bg-cyan-300/15" : "border-white/10 bg-white/5 hover:bg-white/10"}`}><div className="font-black">{title}</div><div className="text-xs text-white/60">{desc}</div></button>)}
            <button onClick={start} disabled={active} className="w-full rounded-2xl bg-cyan-300 py-4 font-black text-slate-950 shadow-lg shadow-cyan-400/20 disabled:opacity-50">{active ? "Running..." : "Start 20s Run"}</button>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm"><div className="flex justify-between"><span>Score</span><b>{score}</b></div><div className="flex justify-between"><span>Time</span><b>{time}s</b></div></div>
          </div>
          <div className="relative h-[520px] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-black">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "38px 38px" }} />
            {!active && <div className="absolute inset-0 grid place-items-center p-8 text-center"><div><div className="mb-4 text-7xl">🎮</div><h3 className="text-3xl font-black">Choose a mode and start</h3><p className="mt-2 max-w-md text-white/60">Designed for quick CrazyGames sessions: instant action, visible rewards, and no real-money mechanics.</p></div></div>}
            {targets.map((t) => <button key={t.id} onClick={() => clickTarget(t)} className={`absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border text-3xl shadow-2xl transition hover:scale-110 active:scale-90 ${t.bad ? "border-rose-100 bg-rose-500/80" : "border-cyan-100/50 bg-white/15"}`} style={{ left: `${t.x}%`, top: `${t.y}%` }}>{t.bad ? "☠" : t.emoji}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopPanel({ game, setGame, addToast }) {
  const buy = (kind, item) => { setGame((g) => { const price = item.cost ?? item.price; if (g.coins < price) return g; const next = { ...g, coins: g.coins - price, owned: { ...g.owned } }; if (kind === "food") next.owned.food = { ...g.owned.food, [item.id]: (g.owned.food[item.id] || 0) + 1 }; if (kind === "toy") next.owned.toys = { ...g.owned.toys, [item.id]: (g.owned.toys[item.id] || 0) + 1 }; if (kind === "cosmetic") next.owned.cosmetics = [...new Set([...g.owned.cosmetics, item.id])]; if (kind === "room") next.owned.rooms = [...new Set([...g.owned.rooms, item.id])]; return next; }); addToast("Purchased", `${item.name} unlocked or added.`); };
  const equip = (item) => setGame((g) => ({ ...g, equipped: { ...g.equipped, ...(item.type === "hat" ? { hat: item.id } : {}), ...(item.type === "skin" ? { skin: item.id } : {}), ...(item.type === "face" ? { face: item.id } : {}) } }));
  const equipRoom = (room) => setGame((g) => ({ ...g, equipped: { ...g.equipped, room: room.id } }));
  return <div className="space-y-5"><section><h3 className="mb-3 text-lg font-black">Food</h3><div className="grid gap-3 sm:grid-cols-2">{foodItems.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/7 p-4"><div className="flex items-center justify-between"><b>{item.emoji} {item.name}</b><span className="text-amber-200">{item.cost} 🪙</span></div><div className="mt-1 text-xs text-white/60">Hunger +{item.hunger}, Fun +{item.fun}, XP +{item.xp}</div><button onClick={() => buy("food", item)} disabled={game.coins < item.cost} className="mt-3 w-full rounded-xl bg-white/10 py-2 hover:bg-white/15 disabled:opacity-40">Buy</button></div>)}</div></section><section><h3 className="mb-3 text-lg font-black">Toys</h3><div className="grid gap-3 sm:grid-cols-2">{toyItems.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/7 p-4"><div className="flex items-center justify-between"><b>{item.emoji} {item.name}</b><span className="text-amber-200">{item.cost} 🪙</span></div><div className="mt-1 text-xs text-white/60">Fun +{item.fun}, Energy {item.energy}, XP +{item.xp}</div><button onClick={() => buy("toy", item)} disabled={game.coins < item.cost} className="mt-3 w-full rounded-xl bg-white/10 py-2 hover:bg-white/15 disabled:opacity-40">Buy</button></div>)}</div></section><section><h3 className="mb-3 text-lg font-black">Cosmetics</h3><div className="grid gap-3 sm:grid-cols-2">{cosmetics.map((item) => { const owned = game.owned.cosmetics.includes(item.id); const equipped = Object.values(game.equipped).includes(item.id); return <div key={item.id} className="rounded-2xl border border-white/10 bg-white/7 p-4"><div className="flex items-center justify-between"><b>{item.icon || "●"} {item.name}</b><span className="text-amber-200">{item.price} 🪙</span></div><div className="mt-1 text-xs capitalize text-white/60">{item.type}</div>{owned ? <button onClick={() => equip(item)} className="mt-3 w-full rounded-xl border border-cyan-200/20 bg-cyan-300/15 py-2 hover:bg-cyan-300/25">{equipped ? "Equipped" : "Equip"}</button> : <button onClick={() => buy("cosmetic", item)} disabled={game.coins < item.price} className="mt-3 w-full rounded-xl bg-white/10 py-2 hover:bg-white/15 disabled:opacity-40">Buy</button>}</div>; })}</div></section><section><h3 className="mb-3 text-lg font-black">Rooms</h3><div className="grid gap-3 sm:grid-cols-2">{rooms.map((room) => { const owned = game.owned.rooms.includes(room.id); return <div key={room.id} className={`rounded-2xl border border-white/10 bg-gradient-to-br p-4 ${room.bg}`}><div className="flex items-center justify-between"><b>{room.name}</b><span className="text-amber-200">{room.price} 🪙</span></div>{owned ? <button onClick={() => equipRoom(room)} className="mt-3 w-full rounded-xl bg-white/15 py-2 hover:bg-white/20">{game.equipped.room === room.id ? "Active" : "Use Room"}</button> : <button onClick={() => buy("room", room)} disabled={game.coins < room.price} className="mt-3 w-full rounded-xl bg-white/10 py-2 hover:bg-white/15 disabled:opacity-40">Buy</button>}</div>; })}</div></section></div>;
}

function QuestsPanel({ game, setGame, addToast }) {
  const canClaimAchievement = (a) => a.id === "first_feed" ? game.questProgress.feeds >= 1 : a.id === "clean_sparkle" ? game.stats.hygiene >= 95 : a.id === "level_3" ? game.level >= 3 : a.id === "coin_1000" ? game.coins >= 1000 : a.id === "mini_master" ? game.minigameScoreTotal >= 300 : false;
  const claimQuest = (q) => { if (game.claimedQuests.includes(q.id) || game.questProgress[q.field] < q.target) return; setGame((g) => ({ ...g, coins: g.coins + q.reward, claimedQuests: [...g.claimedQuests, q.id] })); addToast("Quest Complete", `${q.text}: +${q.reward} coins`); };
  const claimAchievement = (a) => { if (game.claimedAchievements.includes(a.id) || !canClaimAchievement(a)) return; setGame((g) => ({ ...g, coins: g.coins + a.reward, claimedAchievements: [...g.claimedAchievements, a.id] })); addToast("Achievement", `${a.name}: +${a.reward} coins`); };
  return <div className="space-y-6"><section><h3 className="mb-3 text-lg font-black">Daily Quests</h3><div className="space-y-3">{questTemplates.map((q) => { const progress = Math.min(q.target, game.questProgress[q.field] || 0); const done = progress >= q.target; const claimed = game.claimedQuests.includes(q.id); return <div key={q.id} className="rounded-2xl border border-white/10 bg-white/7 p-4"><div className="flex justify-between gap-3"><b>{q.text}</b><span className="text-amber-200">+{q.reward} 🪙</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30"><div className="h-full bg-cyan-300" style={{ width: `${(progress / q.target) * 100}%` }} /></div><div className="mt-2 flex items-center justify-between text-xs text-white/60"><span>{progress}/{q.target}</span><button onClick={() => claimQuest(q)} disabled={!done || claimed} className="rounded-lg bg-white/10 px-3 py-1 disabled:opacity-40">{claimed ? "Claimed" : "Claim"}</button></div></div>; })}</div></section><section><h3 className="mb-3 text-lg font-black">Achievements</h3><div className="grid gap-3 sm:grid-cols-2">{achievements.map((a) => { const ok = canClaimAchievement(a); const claimed = game.claimedAchievements.includes(a.id); return <div key={a.id} className={`rounded-2xl border p-4 ${ok ? "border-emerald-200/30 bg-emerald-300/10" : "border-white/10 bg-white/7"}`}><div className="font-black">🏅 {a.name}</div><div className="mt-1 text-xs text-white/60">{a.desc}</div><button onClick={() => claimAchievement(a)} disabled={!ok || claimed} className="mt-3 w-full rounded-xl bg-white/10 py-2 hover:bg-white/15 disabled:opacity-40">{claimed ? "Claimed" : `Claim +${a.reward}`}</button></div>; })}</div></section></div>;
}

function InventoryPanel({ game, useFood, useToy }) {
  return <div className="space-y-5"><section><h3 className="mb-3 text-lg font-black">Food Inventory</h3><div className="grid gap-3 sm:grid-cols-2">{foodItems.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/7 p-4"><div className="flex justify-between"><b>{item.emoji} {item.name}</b><span>x{game.owned.food[item.id] || 0}</span></div><button onClick={() => useFood(item)} disabled={(game.owned.food[item.id] || 0) <= 0} className="mt-3 w-full rounded-xl bg-cyan-300/15 py-2 hover:bg-cyan-300/25 disabled:opacity-40">Feed</button></div>)}</div></section><section><h3 className="mb-3 text-lg font-black">Toy Inventory</h3><div className="grid gap-3 sm:grid-cols-2">{toyItems.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/7 p-4"><div className="flex justify-between"><b>{item.emoji} {item.name}</b><span>x{game.owned.toys[item.id] || 0}</span></div><button onClick={() => useToy(item)} disabled={(game.owned.toys[item.id] || 0) <= 0 || game.stats.energy < 10} className="mt-3 w-full rounded-xl bg-fuchsia-300/15 py-2 hover:bg-fuchsia-300/25 disabled:opacity-40">Play</button></div>)}</div></section></div>;
}

export default function MyChaosPetPrototype() {
  const [game, setGame] = usePersistentState("my-chaos-pet-prototype-v1", makeInitialGame());
  const [tab, setTab] = useState("home");
  const [toasts, setToasts] = useState([]);
  const [floaters, setFloaters] = useState([]);
  const [pulse, setPulse] = useState(false);
  const [showMini, setShowMini] = useState(false);
  const room = rooms.find((r) => r.id === game.equipped.room) || rooms[0];
  const avg = useMemo(() => Object.values(game.stats).reduce((a, b) => a + b, 0) / 5, [game.stats]);
  const mood = avg < 32 ? "sad" : game.stats.energy < 28 ? "sleepy" : avg > 78 ? "happy" : "okay";
  const xpNeed = 100 + game.level * 45;

  const addToast = (title, body) => { const id = Date.now() + Math.random(); setToasts((t) => [...t, { id, title, body }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600); };
  const addFloater = (text, x = 50, y = 50) => { const id = Date.now() + Math.random(); setFloaters((f) => [...f, { id, text, x, y }]); setTimeout(() => setFloaters((f) => f.filter((v) => v.id !== id)), 900); };
  const awardXp = (g, xp) => { const leveled = levelFromXp(g.level, g.xp + xp); return { ...g, level: leveled.level, xp: leveled.xp }; };

  useEffect(() => { const interval = setInterval(() => setGame((g) => ({ ...g, stats: { hunger: clamp(g.stats.hunger - 1.1), fun: clamp(g.stats.fun - 0.8), energy: clamp(g.stats.energy - 0.45), hygiene: clamp(g.stats.hygiene - 0.65), social: clamp(g.stats.social - 0.5) } })), 6500); return () => clearInterval(interval); }, [setGame]);

  const dailyGift = () => { const today = new Date().toISOString().slice(0, 10); if (game.lastDaily === today) { addToast("Already Claimed", "Come back tomorrow for another gift."); return; } const reward = 180 + game.streak * 35; setGame((g) => ({ ...g, coins: g.coins + reward, gems: g.gems + (g.streak % 3 === 0 ? 1 : 0), streak: g.lastDaily ? g.streak + 1 : 1, lastDaily: today, owned: { ...g.owned, food: { ...g.owned.food, berry: (g.owned.food.berry || 0) + 1 } }, moodLog: [`Daily gift claimed: +${reward} coins.`, ...g.moodLog].slice(0, 8) })); addToast("Daily Gift", `+${reward} coins and +1 Glow Berry.`); addFloater(`+${reward} 🪙`, 53, 36); };
  const simulatedReward = () => { setGame((g) => ({ ...g, coins: g.coins + 90, owned: { ...g.owned, food: { ...g.owned.food, berry: (g.owned.food.berry || 0) + 1 } } })); addToast("Rewarded Bonus", "Prototype: +90 coins and +1 berry. No real ad shown here."); };
  const petMochi = () => { setPulse(true); setTimeout(() => setPulse(false), 450); setGame((g) => ({ ...awardXp(g, 7), stats: { ...g.stats, social: clamp(g.stats.social + 8), fun: clamp(g.stats.fun + 4) }, moodLog: ["Mochi enjoyed the attention.", ...g.moodLog].slice(0, 8) })); addFloater("+love", 48 + Math.random() * 10, 38 + Math.random() * 8); };
  const useFood = (item) => { setGame((g) => { const count = g.owned.food[item.id] || 0; if (count <= 0) return g; const afterXp = awardXp(g, item.xp); return { ...afterXp, stats: { ...g.stats, hunger: clamp(g.stats.hunger + item.hunger), fun: clamp(g.stats.fun + item.fun), hygiene: clamp(g.stats.hygiene + (item.hygiene || 0)) }, owned: { ...g.owned, food: { ...g.owned.food, [item.id]: count - 1 } }, questProgress: { ...g.questProgress, feeds: g.questProgress.feeds + 1 }, moodLog: [`Mochi ate ${item.name}.`, ...g.moodLog].slice(0, 8) }; }); addToast("Fed Mochi", `${item.name}: +${item.hunger} hunger.`); addFloater(`${item.emoji} yum`, 52, 42); };
  const useToy = (item) => { setGame((g) => { const count = g.owned.toys[item.id] || 0; if (count <= 0 || g.stats.energy < 10) return g; const afterXp = awardXp(g, item.xp); return { ...afterXp, stats: { ...g.stats, fun: clamp(g.stats.fun + item.fun), energy: clamp(g.stats.energy + item.energy), social: clamp(g.stats.social + 6) }, owned: { ...g.owned, toys: { ...g.owned.toys, [item.id]: count - 1 } }, questProgress: { ...g.questProgress, plays: g.questProgress.plays + 1 }, moodLog: [`Mochi played with ${item.name}.`, ...g.moodLog].slice(0, 8) }; }); addToast("Play Time", `${item.name}: +${item.fun} fun.`); addFloater(`${item.emoji} +fun`, 54, 45); };
  const clean = () => { setGame((g) => ({ ...awardXp(g, 16), stats: { ...g.stats, hygiene: clamp(g.stats.hygiene + 36), fun: clamp(g.stats.fun + 4) }, questProgress: { ...g.questProgress, cleans: g.questProgress.cleans + 1 }, moodLog: ["Mochi is sparkling clean.", ...g.moodLog].slice(0, 8) })); addToast("Cleaned", "Hygiene boosted."); addFloater("✨ clean", 45, 48); };
  const nap = () => { setGame((g) => ({ ...awardXp(g, 12), stats: { ...g.stats, energy: clamp(g.stats.energy + 32), hunger: clamp(g.stats.hunger - 5), fun: clamp(g.stats.fun - 3) }, moodLog: ["Mochi took a power nap.", ...g.moodLog].slice(0, 8) })); addToast("Power Nap", "Energy restored."); addFloater("zZz", 50, 35); };
  const quickSnack = () => { const item = foodItems[0]; if ((game.owned.food[item.id] || 0) > 0) useFood(item); else addToast("No Berries", "Buy food in the shop first."); };
  const reset = () => { setGame(makeInitialGame()); addToast("Prototype Reset", "Fresh save created."); };

  return <div className="min-h-screen overflow-hidden bg-slate-950 font-sans text-white"><ToastStack toasts={toasts} />{showMini && <MiniGameModal setGame={setGame} close={() => setShowMini(false)} addToast={addToast} addFloater={addFloater} />}<div className={`relative min-h-screen bg-gradient-to-br ${room.bg}`}><div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.18), transparent 24%), radial-gradient(circle at 80% 10%, rgba(34,211,238,.22), transparent 28%), radial-gradient(circle at 70% 80%, rgba(244,114,182,.2), transparent 25%)" }} /><div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "44px 44px" }} /><FloatingText floaters={floaters} />
    <header className="relative z-10 px-4 pt-5 md:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-black/25 px-5 py-4 shadow-2xl backdrop-blur-xl"><div><div className="text-xs uppercase tracking-[.4em] text-cyan-100/70">Westbye Interactive Prototype</div><h1 className="text-2xl font-black tracking-tight md:text-4xl">My Chaos Pet</h1></div><div className="flex flex-wrap gap-3 text-sm"><div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><b>Lvl {game.level}</b><div className="text-xs text-white/55">{game.xp}/{xpNeed} XP</div></div><div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><b>{fmt(game.coins)} 🪙</b><div className="text-xs text-white/55">Coins</div></div><div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3"><b>{fmt(game.gems)} 💎</b><div className="text-xs text-white/55">Gems</div></div><button onClick={dailyGift} className="rounded-2xl bg-amber-300 px-5 py-3 font-black text-slate-950 shadow-lg shadow-amber-300/20">Daily Gift</button></div></div></header>
    <main className="relative z-10 mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-8 lg:grid-cols-[300px_1fr_360px]"><aside className="order-2 space-y-3 lg:order-1"><div className="rounded-[2rem] border border-white/10 bg-black/25 p-4 shadow-2xl backdrop-blur-xl"><h2 className="mb-4 text-xl font-black">Vitals</h2><div className="space-y-3"><StatBar label="Hunger" value={game.stats.hunger} icon="🍜" /><StatBar label="Fun" value={game.stats.fun} icon="🎈" /><StatBar label="Energy" value={game.stats.energy} icon="⚡" /><StatBar label="Hygiene" value={game.stats.hygiene} icon="🫧" /><StatBar label="Social" value={game.stats.social} icon="💬" /></div></div><div className="rounded-[2rem] border border-white/10 bg-black/25 p-4 shadow-2xl backdrop-blur-xl"><h2 className="mb-3 text-xl font-black">Mood Feed</h2><div className="max-h-48 space-y-2 overflow-auto pr-1">{game.moodLog.map((m, i) => <div key={i} className="rounded-xl bg-white/7 px-3 py-2 text-sm text-white/70">{m}</div>)}</div></div></aside>
    <section className="order-1 lg:order-2"><div className={`relative min-h-[640px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/20 shadow-2xl backdrop-blur-xl ${room.glow}`}><div className="absolute left-6 right-6 top-6 z-10 flex items-center justify-between gap-3"><div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl"><div className="text-xs uppercase tracking-[.3em] text-white/50">Current Room</div><div className="font-black">{room.name}</div></div><div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-right backdrop-blur-xl"><div className="text-xs uppercase tracking-[.3em] text-white/50">Mood</div><div className="font-black capitalize">{mood === "okay" ? "Content" : mood}</div></div></div><div className="absolute inset-x-12 bottom-20 h-40 rounded-[50%] border bg-white/10 blur-sm" /><div className={`absolute bottom-14 left-10 right-10 h-24 rounded-[50%] border ${room.floor}`} /><div className="absolute bottom-20 left-12 rotate-[-12deg] text-6xl opacity-80">🧸</div><div className="absolute bottom-24 right-16 rotate-[10deg] text-6xl opacity-80">🪩</div><div className="absolute left-16 top-40 grid h-24 w-24 place-items-center rounded-3xl border border-white/10 bg-white/10 text-4xl shadow-xl">🎁</div><div className="absolute right-12 top-44 grid h-20 w-28 place-items-center rounded-3xl border border-white/10 bg-white/10 text-4xl shadow-xl">📺</div><div className="absolute inset-0 grid place-items-center pt-16"><Pet game={game} mood={mood} pulse={pulse} onPet={petMochi} /></div><div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-3 md:grid-cols-5"><button onClick={quickSnack} className="rounded-2xl border border-white/10 bg-white/12 p-4 font-black backdrop-blur-xl hover:bg-white/18">🍓 Feed</button><button onClick={clean} className="rounded-2xl border border-white/10 bg-white/12 p-4 font-black backdrop-blur-xl hover:bg-white/18">🫧 Clean</button><button onClick={nap} className="rounded-2xl border border-white/10 bg-white/12 p-4 font-black backdrop-blur-xl hover:bg-white/18">🌙 Nap</button><button onClick={() => setShowMini(true)} className="rounded-2xl bg-cyan-300 p-4 font-black text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-200">🎮 Arcade</button><button onClick={simulatedReward} className="rounded-2xl bg-amber-300 p-4 font-black text-slate-950 shadow-lg shadow-amber-400/20 hover:bg-amber-200">🎁 Bonus</button></div></div></section>
    <aside className="order-3"><div className="sticky top-5 overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 shadow-2xl backdrop-blur-xl"><nav className="grid grid-cols-4 border-b border-white/10 bg-white/5">{[["home", "Home"], ["inventory", "Bag"], ["shop", "Shop"], ["quests", "Goals"]].map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`py-4 text-sm font-black ${tab === id ? "bg-white/12 text-cyan-100" : "text-white/55 hover:text-white"}`}>{label}</button>)}</nav><div className="max-h-[720px] overflow-auto p-5">{tab === "home" && <div className="space-y-4"><div className="rounded-2xl border border-white/10 bg-white/7 p-4"><div className="text-xs uppercase tracking-[.3em] text-white/50">Core Loop</div><h2 className="mt-1 text-2xl font-black">Care → Play → Earn → Customize</h2><p className="mt-2 text-sm text-white/65">A browser-first virtual pet loop: fast actions, quick minigames, visible upgrades, cosmetics, daily goals, and room progression.</p></div><div className="grid grid-cols-2 gap-3"><button onClick={() => setTab("inventory")} className="rounded-2xl bg-white/10 p-4 text-left hover:bg-white/15"><b>Open Bag</b><div className="text-xs text-white/55">Use food and toys</div></button><button onClick={() => setTab("shop")} className="rounded-2xl bg-white/10 p-4 text-left hover:bg-white/15"><b>Visit Shop</b><div className="text-xs text-white/55">Buy cosmetics</div></button><button onClick={() => setTab("quests")} className="rounded-2xl bg-white/10 p-4 text-left hover:bg-white/15"><b>Daily Goals</b><div className="text-xs text-white/55">Claim rewards</div></button><button onClick={() => setShowMini(true)} className="rounded-2xl bg-white/10 p-4 text-left hover:bg-white/15"><b>Arcade</b><div className="text-xs text-white/55">20s minigames</div></button></div><div className="rounded-2xl border border-rose-200/20 bg-rose-300/10 p-4"><b>Prototype Notes</b><p className="mt-1 text-sm text-white/65">This uses simulated rewarded bonuses only. For a real CrazyGames build, connect this to the SDK, save API, consent flow, audio, and mobile input polish.</p></div><button onClick={reset} className="w-full rounded-2xl bg-white/8 p-3 text-sm text-white/70 hover:bg-white/12">Reset Prototype Save</button></div>}{tab === "inventory" && <InventoryPanel game={game} useFood={useFood} useToy={useToy} />}{tab === "shop" && <ShopPanel game={game} setGame={setGame} addToast={addToast} />}{tab === "quests" && <QuestsPanel game={game} setGame={setGame} addToast={addToast} />}</div></div></aside></main></div></div>;
}
