import React, { useEffect, useRef, useState } from 'react';
import {
  SKINS, AURAS, ROOMS, FOODS, TOYS,
  WHEEL_PRIZES, WHEEL_COOLDOWN_MS, WHEEL_GEM_COST, BALANCE,
  stageForLevel,
} from './game/config.js';
import {
  addXp, applyEffects, computeMood, moodMultiplier, todayKey, makeInitialState,
} from './game/engine.js';
import { useGame } from './game/useGame.js';
import { useScreenShake } from './hooks.js';
import { audio } from './game/audio.js';
import { particles } from './game/particles.js';

import Hud from './components/Hud.jsx';
import Vitals from './components/Vitals.jsx';
import Pet from './components/Pet.jsx';
import RoomStage from './components/RoomStage.jsx';
import Toasts from './components/Toasts.jsx';
import Onboarding from './components/Onboarding.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import FortuneWheel from './components/FortuneWheel.jsx';
import MinigameHub from './components/minigames/MinigameHub.jsx';
import PetPanel from './components/panels/PetPanel.jsx';
import InventoryPanel from './components/panels/InventoryPanel.jsx';
import ShopPanel from './components/panels/ShopPanel.jsx';
import QuestsPanel from './components/panels/QuestsPanel.jsx';

const TABS = [
  { id: 'pet', label: 'Pet', icon: '🐾' },
  { id: 'bag', label: 'Bag', icon: '🎒' },
  { id: 'shop', label: 'Shop', icon: '🛍️' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
];

const pushLog = (g, msg) => [msg, ...g.log].slice(0, 12);

export default function App() {
  const { game, setGame, gameRef, awayTicks } = useGame();
  const [tab, setTab] = useState('pet');
  const [toasts, setToasts] = useState([]);
  const [floaters, setFloaters] = useState([]);
  const [petAction, setPetAction] = useState(null);
  const [modal, setModal] = useState(null); // 'arcade' | 'wheel' | 'settings'
  const [shakeClass, shake] = useScreenShake();
  const canvasRef = useRef(null);
  const petBoxRef = useRef(null);
  const actionId = useRef(0);

  // ---- system setup ---------------------------------------------------------
  useEffect(() => {
    if (canvasRef.current) particles.attach(canvasRef.current);
    return () => particles.detach();
  }, []);

  useEffect(() => {
    particles.reduced = !!game.settings.reducedFx;
    audio.applySettings(game.settings);
    if (audio.ctx && game.settings.music) audio.startMusic();
  }, [game.settings]);

  // Unlock audio on the first user gesture (browser autoplay policy).
  useEffect(() => {
    const unlock = () => {
      audio.unlock();
      audio.applySettings(gameRef.current.settings);
      if (gameRef.current.settings.music) audio.startMusic();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [gameRef]);

  // Welcome-back note after time away.
  useEffect(() => {
    if (awayTicks >= 36) {
      const mins = Math.round((awayTicks * BALANCE.tickMs) / 60000);
      addToast('Welcome back!', `${gameRef.current.name} missed you for ~${mins < 60 ? mins + 'm' : Math.round(mins / 60) + 'h'}.`, '👋');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awayTicks]);

  // ---- FX helpers -----------------------------------------------------------
  const addToast = (title, body, icon) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, body, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  const addFloater = (text, color = '#fff') => {
    const id = Date.now() + Math.random();
    setFloaters((f) => [...f, { id, text, color, x: 42 + Math.random() * 16, y: 34 + Math.random() * 12 }]);
    setTimeout(() => setFloaters((f) => f.filter((v) => v.id !== id)), 1000);
  };
  const triggerPet = (type) => setPetAction({ type, id: ++actionId.current });
  const petCenter = () => {
    const el = petBoxRef.current;
    if (!el) return [window.innerWidth / 2, window.innerHeight / 2];
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height * 0.45];
  };

  // ---- shared state mutators (operate on a fresh draft) ---------------------
  const mutQuest = (next, field, n = 1) => {
    next.quests = { ...next.quests, progress: { ...next.quests.progress, [field]: (next.quests.progress[field] || 0) + n } };
  };
  const earn = (next, amount) => {
    next.coins += amount;
    next.totals = { ...next.totals, coinsEarned: (next.totals.coinsEarned || 0) + amount };
    mutQuest(next, 'coinsEarned', amount);
  };
  // Applies level/evolve rewards onto `next`, returns FX list to fire after commit.
  const resolveLevel = (prev, next) => {
    const fx = [];
    if (next.level > prev.level) {
      const before = stageForLevel(prev.level).id;
      const after = stageForLevel(next.level).id;
      const bonus = 15 + next.level * 5;
      next.coins += bonus;
      if (after !== before) {
        next.gems += 1;
        next.log = pushLog({ log: next.log }, `🌟 ${next.name} evolved into ${stageForLevel(next.level).name}!`);
        fx.push('evolve');
      } else {
        next.log = pushLog({ log: next.log }, `⬆️ Reached level ${next.level}! +${bonus} 🪙`);
        fx.push('levelup');
      }
    }
    return fx;
  };
  const fireLevelFx = (kind, next) => {
    const [x, y] = petCenter();
    if (kind === 'evolve') {
      audio.evolve();
      particles.confetti({ x, y });
      particles.burst(x, y, { count: 28, power: 8 });
      shake(2);
      triggerPet('evolve');
      addToast('Evolution!', `${next.name} is now ${stageForLevel(next.level).name}`, '🌟');
    } else {
      audio.levelUp();
      particles.confetti({ x, y: y - 40 });
      shake(1);
      triggerPet('happy');
      addToast('Level Up!', `Reached level ${next.level}`, '⭐');
    }
  };
  // Commit + fire any pending level FX in one place.
  const commit = (prev, next) => {
    const fx = resolveLevel(prev, next);
    setGame(next);
    fx.forEach((k) => fireLevelFx(k, next));
    return next;
  };

  // ---- care actions ---------------------------------------------------------
  const feed = (item) => {
    const g = gameRef.current;
    if ((g.owned.food[item.id] || 0) <= 0) { audio.deny(); addToast('All out!', `Buy more ${item.name} in the Shop.`, '🛒'); return; }
    const xr = addXp(g, item.xp);
    const next = {
      ...g, level: xr.level, xp: xr.xp,
      stats: applyEffects(g.stats, item.effects),
      owned: { ...g.owned, food: { ...g.owned.food, [item.id]: g.owned.food[item.id] - 1 } },
      totals: { ...g.totals, feeds: g.totals.feeds + 1 },
      log: pushLog(g, `${g.name} ate ${item.name}. ${item.emoji}`),
    };
    mutQuest(next, 'feeds');
    audio.eat(); triggerPet('feed'); addFloater(`${item.emoji} yum`, '#fde68a');
    const [x, y] = petCenter(); particles.hearts(x, y, 4);
    commit(g, next);
  };

  const play = (item) => {
    const g = gameRef.current;
    if ((g.owned.toys[item.id] || 0) <= 0) { audio.deny(); addToast('No toy', `Buy ${item.name} in the Shop.`, '🛒'); return; }
    if (g.stats.energy < 10) { audio.deny(); addToast('Too tired', `${g.name} needs to rest first.`, '😴'); return; }
    const xr = addXp(g, item.xp);
    const next = {
      ...g, level: xr.level, xp: xr.xp,
      stats: applyEffects(g.stats, item.effects),
      owned: { ...g.owned, toys: { ...g.owned.toys, [item.id]: g.owned.toys[item.id] - 1 } },
      totals: { ...g.totals, plays: g.totals.plays + 1 },
      log: pushLog(g, `${g.name} played with ${item.name}. ${item.emoji}`),
    };
    mutQuest(next, 'plays');
    audio.play(); triggerPet('play'); addFloater(`${item.emoji} fun!`, '#f9a8d4');
    const [x, y] = petCenter(); particles.burst(x, y, { count: 10, colors: ['#f472b6', '#67e8f9'] });
    commit(g, next);
  };

  const clean = () => {
    const g = gameRef.current;
    const xr = addXp(g, BALANCE.cleanXp);
    const next = {
      ...g, level: xr.level, xp: xr.xp,
      stats: applyEffects(g.stats, { hygiene: 40, fun: 4 }),
      totals: { ...g.totals, cleans: g.totals.cleans + 1 },
      log: pushLog(g, `${g.name} is sparkling clean! ✨`),
    };
    mutQuest(next, 'cleans');
    audio.clean(); triggerPet('clean'); addFloater('✨ clean', '#7dd3fc');
    const [x, y] = petCenter(); particles.sparkle(x, y - 20, '#7dd3fc'); particles.sparkle(x + 30, y, '#bae6fd'); particles.sparkle(x - 30, y, '#bae6fd');
    commit(g, next);
  };

  const rest = () => {
    const g = gameRef.current;
    const xr = addXp(g, BALANCE.napXp);
    const next = {
      ...g, level: xr.level, xp: xr.xp,
      stats: applyEffects(g.stats, { energy: 38, hunger: -6, fun: -2 }),
      totals: { ...g.totals, naps: g.totals.naps + 1 },
      log: pushLog(g, `${g.name} took a power nap. 😴`),
    };
    audio.nap(); triggerPet('feed'); addFloater('💤 zzz', '#c4b5fd');
    commit(g, next);
  };

  const petPet = () => {
    const g = gameRef.current;
    const xr = addXp(g, BALANCE.petXp);
    const next = {
      ...g, level: xr.level, xp: xr.xp,
      stats: applyEffects(g.stats, { social: 9, fun: 4 }),
      totals: { ...g.totals, pets: (g.totals.pets || 0) + 1 },
    };
    mutQuest(next, 'pets');
    audio.pop(); triggerPet('pet');
    const [x, y] = petCenter(); particles.hearts(x, y, 3);
    addFloater('💕', '#f472b6');
    commit(g, next);
  };

  // ---- action bar -----------------------------------------------------------
  const onAction = (id) => {
    if (id === 'arcade') { setModal('arcade'); audio.tab(); return; }
    const g = gameRef.current;
    if (id === 'feed') {
      const owned = FOODS.filter((f) => (g.owned.food[f.id] || 0) > 0).sort((a, b) => a.effects.hunger - b.effects.hunger);
      if (!owned.length) { audio.deny(); addToast('Bag empty', 'Grab snacks in the Shop!', '🛒'); setTab('shop'); return; }
      feed(owned[0]);
    } else if (id === 'play') {
      const owned = TOYS.filter((t) => (g.owned.toys[t.id] || 0) > 0).sort((a, b) => a.effects.fun - b.effects.fun);
      if (!owned.length) { audio.deny(); addToast('No toys', 'Buy toys in the Shop!', '🛒'); setTab('shop'); return; }
      play(owned[0]);
    } else if (id === 'clean') clean();
    else if (id === 'rest') rest();
  };

  // ---- shop / inventory -----------------------------------------------------
  const buy = (kind, item) => {
    const g = gameRef.current;
    const price = item.price ?? item.cost ?? 0;
    const currency = item.currency || 'coins';
    const bal = currency === 'gems' ? g.gems : g.coins;
    if (bal < price) { audio.deny(); addToast('Not enough', currency === 'gems' ? 'You need more gems 💎' : 'You need more coins 🪙', '🚫'); return; }
    const next = { ...g, owned: { ...g.owned }, equipped: { ...g.equipped } };
    if (currency === 'gems') next.gems = g.gems - price; else next.coins = g.coins - price;
    if (kind === 'food') next.owned.food = { ...g.owned.food, [item.id]: (g.owned.food[item.id] || 0) + 1 };
    else if (kind === 'toy') next.owned.toys = { ...g.owned.toys, [item.id]: (g.owned.toys[item.id] || 0) + 1 };
    else if (kind === 'room') { next.owned.rooms = [...new Set([...g.owned.rooms, item.id])]; next.equipped.room = item.id; }
    else { const key = `${kind}s`; next.owned[key] = [...new Set([...(g.owned[key] || []), item.id])]; next.equipped[kind] = item.id; }
    next.log = pushLog(g, `Got ${item.name}! 🛍️`);
    setGame(next);
    audio.coin(); addToast('Purchased', item.name, '🛍️');
    if (kind !== 'food' && kind !== 'toy') triggerPet('happy');
  };

  const equip = (kind, item) => {
    const g = gameRef.current;
    setGame({ ...g, equipped: { ...g.equipped, [kind]: item.id } });
    audio.click(); triggerPet('happy');
  };

  // ---- quests / achievements ------------------------------------------------
  const claimQuest = (q) => {
    const g = gameRef.current;
    const done = (g.quests.progress[q.field] || 0) >= q.target;
    if (!done || g.quests.claimed.includes(q.id)) return;
    const next = { ...g, quests: { ...g.quests, claimed: [...g.quests.claimed, q.id] } };
    earn(next, q.reward);
    next.log = pushLog(g, `Quest complete: ${q.text} (+${q.reward}🪙)`);
    setGame(next);
    audio.coins(); addToast('Quest Complete!', `+${q.reward} coins`, '✅');
    const [x, y] = petCenter(); particles.coins(x, y, 8);
  };

  const claimAchievement = (a) => {
    const g = gameRef.current;
    if (!a.check(g) || g.achievements.includes(a.id)) return;
    const next = { ...g, achievements: [...g.achievements, a.id], gems: g.gems + (a.gems || 0) };
    earn(next, a.reward);
    next.log = pushLog(g, `🏅 Achievement: ${a.name}!`);
    setGame(next);
    audio.win(); addToast('Achievement Unlocked!', a.name, '🏆');
    const [x, y] = petCenter(); particles.confetti({ x, y }); shake(1);
  };

  // ---- daily gift -----------------------------------------------------------
  const dailyReady = game.lastDaily !== todayKey();
  const dailyGift = () => {
    const g = gameRef.current;
    const today = todayKey();
    if (g.lastDaily === today) { audio.deny(); addToast('Already claimed', 'Come back tomorrow!', '⏳'); return; }
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const streak = g.lastDaily === yesterday ? g.streak + 1 : 1;
    const reward = BALANCE.dailyBaseCoins + streak * BALANCE.dailyStreakBonus;
    const gemBonus = streak % 3 === 0 ? 1 : 0;
    const next = {
      ...g, lastDaily: today, streak, gems: g.gems + gemBonus,
      owned: { ...g.owned, food: { ...g.owned.food, berry: (g.owned.food.berry || 0) + 2 } },
    };
    earn(next, reward);
    next.log = pushLog(g, `🎁 Daily reward: +${reward}🪙 (streak ${streak})`);
    setGame(next);
    audio.win(); addToast('Daily Reward!', `+${reward} coins${gemBonus ? ' +1 💎' : ''} · streak ${streak}🔥`, '🎁');
    particles.confetti({ x: window.innerWidth / 2, y: window.innerHeight / 3 });
  };

  // ---- fortune wheel --------------------------------------------------------
  const wheelReady = Date.now() - (game.lastWheel || 0) >= WHEEL_COOLDOWN_MS;
  const wheelSpin = (useGems) => {
    const g = gameRef.current;
    if (useGems && g.gems < WHEEL_GEM_COST) return -1;
    // weighted pick
    const total = WHEEL_PRIZES.reduce((a, p) => a + p.weight, 0);
    let r = Math.random() * total;
    let index = 0;
    for (let i = 0; i < WHEEL_PRIZES.length; i++) { if ((r -= WHEEL_PRIZES[i].weight) <= 0) { index = i; break; } }
    const next = { ...g };
    if (useGems) next.gems = g.gems - WHEEL_GEM_COST; else next.lastWheel = Date.now();
    mutQuest(next, 'spins');
    setGame(next);
    audio.spin();
    return index;
  };
  const wheelLanded = (prize) => {
    const g = gameRef.current;
    const next = { ...g, owned: { ...g.owned, food: { ...g.owned.food } } };
    let msg = '';
    if (prize.kind === 'coins') { earn(next, prize.amount); msg = `+${prize.amount} coins`; }
    else if (prize.kind === 'gems') { next.gems = g.gems + prize.amount; msg = `+${prize.amount} gems`; }
    else if (prize.kind === 'food') { next.owned.food.berry = (g.owned.food.berry || 0) + prize.amount; msg = `+${prize.amount} Glow Berry`; }
    else if (prize.kind === 'xp') { const xr = addXp(g, prize.amount); next.level = xr.level; next.xp = xr.xp; msg = `+${prize.amount} XP`; }
    next.log = pushLog(g, `🎡 Fortune Wheel: ${msg}`);
    audio.win();
    const [x, y] = petCenter();
    if (prize.kind === 'coins') particles.coins(x, y, 10); else particles.confetti({ x, y });
    commit(g, next);
  };

  // ---- arcade results -------------------------------------------------------
  const gameComplete = (gameId, { score, combo }) => {
    const g = gameRef.current;
    // A happy pet performs better — a positive-only mood bonus (never a penalty).
    const moodMult = Math.max(1, moodMultiplier(computeMood(g.stats)));
    const coins = Math.max(15, Math.round(score * 0.8 * moodMult));
    const xp = Math.max(10, Math.round(score * 0.4));
    const prevBest = g.records.bestByGame?.[gameId] || 0;
    const newBest = score > prevBest;
    const xr = addXp(g, xp);
    const next = {
      ...g, level: xr.level, xp: xr.xp,
      stats: applyEffects(g.stats, { fun: 22, energy: -12, social: 8 }),
      totals: { ...g.totals, miniGames: (g.totals.miniGames || 0) + 1 },
      records: {
        ...g.records,
        bestMini: Math.max(g.records.bestMini, score),
        bestCombo: Math.max(g.records.bestCombo, combo),
        bestByGame: { ...g.records.bestByGame, [gameId]: Math.max(prevBest, score) },
      },
      log: pushLog(g, `🎮 Arcade: ${score} pts, +${coins}🪙`),
    };
    earn(next, coins);
    mutQuest(next, 'miniScore', score);
    mutQuest(next, 'miniGames', 1);
    commit(g, next);
    if (newBest) { audio.win(); particles.confetti({ x: window.innerWidth / 2, y: window.innerHeight / 3 }); }
    return { coins, xp, newBest };
  };

  // ---- settings -------------------------------------------------------------
  const changeSettings = (partial) => {
    const g = gameRef.current;
    const settings = { ...g.settings, ...partial };
    setGame({ ...g, settings });
    audio.applySettings(settings);
    if (settings.music) audio.startMusic();
    audio.click();
  };
  const resetGame = () => {
    const fresh = makeInitialState();
    fresh.onboarded = false;
    setGame(fresh);
    setModal(null);
    setTab('pet');
  };

  const completeOnboarding = (name, skinId) => {
    const g = gameRef.current;
    setGame({
      ...g, name, onboarded: true, bornAt: Date.now(),
      owned: { ...g.owned, skins: [...new Set([...g.owned.skins, skinId])] },
      equipped: { ...g.equipped, skin: skinId },
      log: [`${name} hatched and is ready to play!`],
    });
    audio.unlock();
    if (gameRef.current.settings.music) audio.startMusic();
  };

  // ---- derived --------------------------------------------------------------
  const skin = SKINS.find((s) => s.id === game.equipped.skin) || SKINS[0];
  const auraObj = AURAS.find((a) => a.id === game.equipped.aura) || AURAS[0];
  const room = ROOMS.find((r) => r.id === game.equipped.room) || ROOMS[0];
  const stage = stageForLevel(game.level);
  const mood = computeMood(game.stats);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-900 font-sans text-white">
      {/* global particle layer */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[55]" />
      {/* ambient backdrop */}
      <div className="stars pointer-events-none fixed inset-0 opacity-30" />
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(168,85,247,0.18), transparent 45%)' }} />

      <Toasts toasts={toasts} />

      {!game.onboarded ? (
        <Onboarding onComplete={completeOnboarding} />
      ) : (
        <div className={`relative ${shakeClass}`}>
          <Hud game={game} onDaily={dailyGift} dailyReady={dailyReady} onSettings={() => { setModal('settings'); audio.tab(); }} />

          <main className="relative z-10 mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[290px_1fr_380px]">
            {/* left: vitals */}
            <aside className="order-2 lg:order-1">
              <Vitals stats={game.stats} mood={mood} />
            </aside>

            {/* center: stage */}
            <RoomStage room={room} mood={mood} floaters={floaters} onAction={onAction} onWheel={() => { setModal('wheel'); audio.tab(); }} wheelReady={wheelReady}>
              <div ref={petBoxRef}>
                <Pet skin={skin} hat={game.equipped.hat} face={game.equipped.face} aura={auraObj} stage={stage} mood={mood} name={game.name} action={petAction} onPet={petPet} />
              </div>
            </RoomStage>

            {/* right: tabbed panels */}
            <aside className="order-3">
              <div className="panel sticky top-4 overflow-hidden rounded-3xl shadow-2xl">
                <nav className="grid grid-cols-4 border-b border-white/10">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTab(t.id); audio.tab(); }}
                      className={`flex flex-col items-center gap-0.5 py-3 text-xs font-bold transition ${tab === t.id ? 'bg-white/10 text-neon-cyan' : 'text-white/55 hover:bg-white/5'}`}
                    >
                      <span className="text-lg">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </nav>
                <div className="scroll-thin max-h-[calc(100vh-9rem)] overflow-y-auto p-4">
                  {tab === 'pet' && <PetPanel game={game} />}
                  {tab === 'bag' && <InventoryPanel game={game} onFeed={feed} onPlay={play} />}
                  {tab === 'shop' && <ShopPanel game={game} onBuy={buy} onEquip={equip} />}
                  {tab === 'goals' && <QuestsPanel game={game} onClaimQuest={claimQuest} onClaimAchievement={claimAchievement} />}
                </div>
              </div>
            </aside>
          </main>
        </div>
      )}

      {modal === 'arcade' && <MinigameHub game={game} onComplete={gameComplete} onClose={() => setModal(null)} />}
      {modal === 'wheel' && <FortuneWheel game={game} freeReady={wheelReady} onSpin={wheelSpin} onLanded={wheelLanded} onClose={() => setModal(null)} />}
      {modal === 'settings' && <SettingsModal game={game} onChange={changeSettings} onReset={resetGame} onClose={() => setModal(null)} />}
    </div>
  );
}
