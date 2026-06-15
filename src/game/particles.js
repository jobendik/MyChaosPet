// =============================================================================
// Lightweight canvas particle system. A single full-screen canvas is driven by
// an imperative API (particles.coins(x,y), .confetti(), .hearts(x,y)…) so any
// component can fire juicy feedback at screen coordinates.
// =============================================================================

class ParticleSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.raf = null;
    this.dpr = 1;
    this.last = 0;
    this.reduced = false;
    this._onResize = this.resize.bind(this);
  }

  attach(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this._onResize);
    this.last = performance.now();
    if (!this.raf) this.loop(this.last);
  }

  detach() {
    window.removeEventListener('resize', this._onResize);
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
  }

  resize() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
  }

  add(p) {
    if (this.reduced && this.particles.length > 30) return;
    this.particles.push(p);
  }

  // ---- emitters -------------------------------------------------------------
  burst(x, y, { count = 16, colors = ['#67e8f9', '#f472b6', '#c084fc', '#fbbf24'], power = 5 } = {}) {
    const n = this.reduced ? Math.ceil(count / 2) : count;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const sp = power * (0.6 + Math.random() * 0.8);
      this.add({
        kind: 'spark', x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: 0.018 + Math.random() * 0.02,
        size: 3 + Math.random() * 4,
        color: colors[(Math.random() * colors.length) | 0],
        grav: 0.04,
      });
    }
  }

  coins(x, y, n = 8) {
    const count = this.reduced ? Math.ceil(n / 2) : n;
    for (let i = 0; i < count; i++) {
      this.add({
        kind: 'coin', x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: -6 - Math.random() * 5,
        life: 1, decay: 0.012,
        size: 7 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        grav: 0.32,
      });
    }
  }

  hearts(x, y, n = 6) {
    const count = this.reduced ? Math.ceil(n / 2) : n;
    for (let i = 0; i < count; i++) {
      this.add({
        kind: 'heart', x: x + (Math.random() - 0.5) * 40, y,
        vx: (Math.random() - 0.5) * 1.6, vy: -1.4 - Math.random() * 1.4,
        life: 1, decay: 0.012,
        size: 10 + Math.random() * 10,
        sway: Math.random() * Math.PI * 2,
        color: ['#f472b6', '#fb7185', '#f9a8d4'][(Math.random() * 3) | 0],
      });
    }
  }

  confetti(opts = {}) {
    const cx = opts.x ?? window.innerWidth / 2;
    const cy = opts.y ?? window.innerHeight / 3;
    const n = this.reduced ? 40 : 90;
    const colors = ['#67e8f9', '#f472b6', '#c084fc', '#fbbf24', '#a3e635', '#fb7185'];
    for (let i = 0; i < n; i++) {
      this.add({
        kind: 'confetti', x: cx + (Math.random() - 0.5) * 120, y: cy,
        vx: (Math.random() - 0.5) * 12,
        vy: -8 - Math.random() * 8,
        life: 1, decay: 0.006 + Math.random() * 0.006,
        w: 6 + Math.random() * 6, h: 9 + Math.random() * 8,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.5,
        color: colors[(Math.random() * colors.length) | 0],
        grav: 0.22,
      });
    }
  }

  sparkle(x, y, color = '#fff') {
    for (let i = 0; i < (this.reduced ? 3 : 6); i++) {
      this.add({
        kind: 'spark', x, y,
        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
        life: 1, decay: 0.03, size: 2 + Math.random() * 3, color, grav: 0,
      });
    }
  }

  ring(x, y, color = '#67e8f9') {
    this.add({ kind: 'ring', x, y, life: 1, decay: 0.04, size: 8, color });
  }

  // ---- loop -----------------------------------------------------------------
  loop(now) {
    this.raf = requestAnimationFrame((t) => this.loop(t));
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life -= p.decay;
      if (p.life <= 0) { ps.splice(i, 1); continue; }
      if (p.vx !== undefined) { p.x += p.vx; p.y += p.vy; }
      if (p.grav) p.vy += p.grav;
      if (p.vr) p.rot += p.vr;
      this.draw(ctx, p);
    }
  }

  draw(ctx, p) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    if (p.kind === 'spark') {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'coin') {
      ctx.translate(p.x, p.y);
      ctx.scale(Math.cos(p.rot), 1); // spin illusion
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b45309';
      ctx.font = `bold ${p.size}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('¢', 0, 1);
    } else if (p.kind === 'heart') {
      p.sway += 0.12;
      const s = p.size;
      ctx.translate(p.x + Math.sin(p.sway) * 6, p.y);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(0, -s * 0.1, -s * 0.5, -s * 0.1, -s * 0.5, s * 0.2);
      ctx.bezierCurveTo(-s * 0.5, s * 0.5, 0, s * 0.7, 0, s);
      ctx.bezierCurveTo(0, s * 0.7, s * 0.5, s * 0.5, s * 0.5, s * 0.2);
      ctx.bezierCurveTo(s * 0.5, -s * 0.1, 0, -s * 0.1, 0, s * 0.3);
      ctx.fill();
    } else if (p.kind === 'confetti') {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * (0.4 + Math.abs(Math.cos(p.rot)) * 0.6));
    } else if (p.kind === 'ring') {
      p.size += 6;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 * p.life;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export const particles = new ParticleSystem();
