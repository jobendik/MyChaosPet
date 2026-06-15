// =============================================================================
// Procedural audio engine (Web Audio API). No sample files — everything is
// synthesised on the fly so the build stays tiny and self-contained.
// =============================================================================

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxBus = null;
    this.musicBus = null;
    this.comp = null;
    this.enabledSfx = true;
    this.enabledMusic = true;
    this.volume = 0.7;
    this.musicTimer = null;
    this.nextNote = 0;
    this.step = 0;
    this._started = false;
  }

  // Create the context lazily on the first user gesture (autoplay policy).
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.comp = this.ctx.createDynamicsCompressor();
    this.comp.threshold.value = -14;
    this.comp.ratio.value = 12;
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.9;
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.enabledMusic ? 0.28 : 0;
    this.sfxBus.connect(this.master);
    this.musicBus.connect(this.master);
    this.master.connect(this.comp);
    this.comp.connect(this.ctx.destination);
  }

  applySettings({ sfx, music, volume }) {
    if (typeof sfx === 'boolean') this.enabledSfx = sfx;
    if (typeof music === 'boolean') this.enabledMusic = music;
    if (typeof volume === 'number') this.volume = volume;
    if (this.master) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    if (this.musicBus)
      this.musicBus.gain.setTargetAtTime(this.enabledMusic ? 0.28 : 0, this.ctx.currentTime, 0.1);
  }

  // ---- low level voice ------------------------------------------------------
  tone(freq, dur = 0.16, { type = 'sine', gain = 0.4, when = 0, slideTo = null, bus } = {}) {
    if (!this.ctx || !this.enabledSfx) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(bus || this.sfxBus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  noise(dur = 0.2, { gain = 0.3, type = 'highpass', freq = 1200 } = {}) {
    if (!this.ctx || !this.enabledSfx) return;
    const t = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(this.sfxBus);
    src.start(t);
  }

  // ---- named SFX ------------------------------------------------------------
  click() { this.tone(520, 0.08, { type: 'triangle', gain: 0.18 }); }
  hover() { this.tone(680, 0.05, { type: 'sine', gain: 0.06 }); }
  tab() { this.tone(440, 0.1, { type: 'triangle', gain: 0.14, slideTo: 640 }); }
  deny() { this.tone(180, 0.18, { type: 'sawtooth', gain: 0.16, slideTo: 120 }); }

  pop() {
    this.tone(720, 0.09, { type: 'sine', gain: 0.22, slideTo: 1080 });
  }

  coin() {
    this.tone(880, 0.07, { type: 'square', gain: 0.13 });
    this.tone(1320, 0.12, { type: 'square', gain: 0.12, when: 0.05 });
  }

  coins() {
    [0, 0.06, 0.12, 0.18].forEach((w, i) =>
      this.tone(740 + i * 120, 0.1, { type: 'triangle', gain: 0.14, when: w }),
    );
  }

  eat() {
    this.tone(300, 0.1, { type: 'sine', gain: 0.2, slideTo: 200 });
    this.noise(0.12, { gain: 0.12, type: 'bandpass', freq: 600 });
  }

  clean() {
    this.noise(0.4, { gain: 0.16, type: 'highpass', freq: 3000 });
    this.tone(1200, 0.3, { type: 'sine', gain: 0.08, slideTo: 2400 });
  }

  sparkle() {
    [1200, 1600, 2000].forEach((f, i) =>
      this.tone(f, 0.18, { type: 'sine', gain: 0.08, when: i * 0.05 }),
    );
  }

  play() {
    this.tone(600, 0.1, { type: 'triangle', gain: 0.18, slideTo: 900 });
  }

  nap() {
    this.tone(420, 0.5, { type: 'sine', gain: 0.12, slideTo: 280 });
  }

  combo(n) {
    const f = 520 + Math.min(n, 25) * 45;
    this.tone(f, 0.1, { type: 'square', gain: 0.16 });
    this.tone(f * 1.5, 0.12, { type: 'sine', gain: 0.1, when: 0.04 });
  }

  spin() {
    for (let i = 0; i < 10; i++)
      this.tone(400 + i * 40, 0.05, { type: 'triangle', gain: 0.08, when: i * 0.045 });
  }

  win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.tone(f, 0.3, { type: 'triangle', gain: 0.18, when: i * 0.08 }),
    );
  }

  levelUp() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      this.tone(f, 0.35, { type: 'triangle', gain: 0.2, when: i * 0.09 }),
    );
  }

  evolve() {
    [392, 523, 659, 784, 1047, 1568].forEach((f, i) =>
      this.tone(f, 0.5, { type: 'sawtooth', gain: 0.12, when: i * 0.12 }),
    );
    this.sparkle();
  }

  // ---- generative ambient music --------------------------------------------
  // Soft pentatonic arpeggio over a slowly shifting pad. Lookahead scheduler.
  startMusic() {
    if (!this.ctx || this._started) return;
    this._started = true;
    this.nextNote = this.ctx.currentTime + 0.1;
    this.step = 0;
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0]; // C pentatonic
    const chords = [0, 0, 2, 2, 4, 4, 3, 3]; // slow movement through the scale
    const schedule = () => {
      if (!this.ctx) return;
      while (this.nextNote < this.ctx.currentTime + 0.2) {
        const beat = this.step % 8;
        const octave = beat % 2 === 0 ? 1 : 2;
        const root = chords[Math.floor(this.step / 2) % chords.length];
        const note = scale[(root + beat) % scale.length] * octave;
        // arpeggio voice
        this._musicNote(note, this.nextNote, 0.5, 'triangle', 0.16);
        // soft pad every 2 beats
        if (beat % 4 === 0) this._musicNote(scale[root] / 2, this.nextNote, 1.8, 'sine', 0.1);
        this.nextNote += 0.26;
        this.step++;
      }
      this.musicTimer = setTimeout(schedule, 60);
    };
    schedule();
  }

  _musicNote(freq, when, dur, type, gain) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 1800;
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(filt);
    filt.connect(g);
    g.connect(this.musicBus);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  stopMusic() {
    if (this.musicTimer) clearTimeout(this.musicTimer);
    this.musicTimer = null;
    this._started = false;
  }
}

export const audio = new AudioEngine();
