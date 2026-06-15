# 🌌 My Chaos Pet

**Raise, play with, and evolve your own glowing cosmic chaos pet.** A juicy,
browser-first virtual-pet arcade game built with React + Vite. No accounts, no
downloads, no asset files — every pixel, sound, and particle is generated in
code, so the whole game is a tiny, instant-loading bundle.

> Hatch your egg, keep your pet happy, smash the arcade, and grow it from a
> tiny **Hatchling** all the way to a legendary **Astral** form.

---

## ✨ Features

- **A pet that feels alive** — a fully procedural SVG creature that breathes,
  blinks, tracks your cursor with its eyes, blushes, sweats when neglected, and
  emotes through 8 distinct moods.
- **5-stage evolution** — your buddy visibly transforms (Hatchling → Sprout →
  Spark → Nova → Astral) as it levels up, complete with celebratory FX.
- **Three real arcade games**, each with combos, escalating difficulty and
  personal-best tracking:
  - 🧺 **Spark Catch** — a physics catch game (mouse / touch / arrow keys).
  - 🧠 **Memory Pulse** — a Simon-style sequence-memory challenge.
  - 🫧 **Bubble Pop** — a 30-second combo-popping frenzy.
- **Deep, addictive progression** — dual currency (coins 🪙 + gems 💎), daily
  login streaks, rotating daily quests, tiered achievements, and a weighted
  **Fortune Wheel** with a free spin on a timer.
- **Care loop** — feed, clean, rest, play and pet your buddy across five vital
  stats. A happy pet earns bigger arcade payouts.
- **Deep customization** — skins, hats, faces, orbiting auras, and themed rooms,
  all browsable and equippable in the shop.
- **Juice everywhere** — procedural Web Audio sound effects + a generative
  ambient soundtrack, a canvas particle system (confetti, coins, hearts,
  sparks), screen shake, count-up counters and floating numbers.
- **Plays anywhere** — responsive layout, full touch support, offline progress
  catch-up, and autosave to `localStorage`. Honours `prefers-reduced-motion`
  and has an in-game reduced-effects toggle.

## 🎮 Controls

- **Click / tap the pet** to pet it (and earn affection).
- Use the **action bar** to Feed, Clean, Rest, Play, or open the **Arcade**.
- In **Spark Catch**: drag, move the mouse, or use **← / →** to steer the basket.
- Everything else is point-and-click / tap.

## 🚀 Run locally

```bash
npm install
npm run dev      # start the dev server (Vite)
```

Then open the local URL Vite prints.

### Production build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

The build uses **relative asset paths**, so `dist/` can be dropped onto any
static host or game portal (itch.io, CrazyGames, GitHub Pages, …).

### Deploy to GitHub Pages

A workflow at `.github/workflows/deploy-pages.yml` builds the app and publishes
it to GitHub Pages on every push to `main` (and on-demand via the Actions tab).

One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**
(the workflow also attempts to enable this automatically on its first run). The
site is then served at `https://<owner>.github.io/<repo>/` — the relative
`base` in `vite.config.js` makes the sub-path work without extra config.

## 🧱 Tech & architecture

- **React 19 + Vite + Tailwind CSS** — no game engine, no heavy runtime deps.
- **Zero binary assets** — visuals are SVG/CSS/Canvas; audio is synthesised with
  the **Web Audio API**; particles run on a single `<canvas>`.

```
src/
  game/          pure logic & systems (no UI)
    config.js      all content & balance (items, stages, quests, economy)
    engine.js      pure helpers (leveling, mood, decay, daily quests)
    useGame.js     state hook: persistence, decay loop, offline catch-up
    audio.js       procedural Web Audio SFX + generative music
    particles.js   canvas particle system
  components/    UI (Pet, Hud, RoomStage, panels, minigames, modals)
  hooks.js       count-up + screen-shake helpers
  App.jsx        composition root: actions, FX wiring, layout
```

Game state is fully serialisable and versioned; old saves are migrated forward
on load.

---

Made with chaos & love. 💜
