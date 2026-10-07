// High quality procedural Web Audio API synthesizer for Naija Run
// Works 100% offline, zero external sound asset dependencies, fully responsive

class GameAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.ambienceRunning = false;
    this.lastFootstepTime = 0;
    this.lastHeartbeatTime = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resumeContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  // Footstep: low earthy thud with slight pitch modulation
  playFootstep(lane = 0) {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastFootstepTime < 180) return;
    this.lastFootstepTime = now;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Earthy laterite pitch
      const freq = 65 + Math.random() * 20;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  // Jump: sweeping upwards whoosh
  playJump() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.22);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.26);
    } catch (e) {}
  }

  // Slide: low-pass filtered dirt sweep
  playSlide() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.linearRampToValueAtTime(150, t + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.36);
    } catch (e) {}
  }

  // Collect ₦1,000 Cash Note: crystal bright magical chime
  playCollectCash() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // High chime chord (Pentatonic: E6 and B6)
      const freqs = [1318.51, 1975.53];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.18, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.42);
      });
    } catch (e) {}
  }

  // Obstacle Stumble / Impact: punchy thump
  playImpact() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.3);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.36);
    } catch (e) {}
  }

  // Heartbeat when Guardian is near
  playHeartbeat(pressure = 0.5) {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    // Faster heartbeat when pressure is high
    const interval = 800 - pressure * 400; // 800ms down to 400ms
    if (now - this.lastHeartbeatTime < interval) return;
    this.lastHeartbeatTime = now;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

      const vol = 0.15 + pressure * 0.25;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  // Guardian roar / screech
  playGuardianRoar() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(140, t + 0.3);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.8);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.9);
    } catch (e) {}
  }

  // Game Over sting
  playGameOver() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [220, 196, 174, 146.83]; // Descending minor
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.25);

        gain.gain.setValueAtTime(0.25, t + idx * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.25 + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t + idx * 0.25);
        osc.stop(t + idx * 0.25 + 0.65);
      });
    } catch (e) {}
  }
}

export const gameAudio = new GameAudioEngine();
