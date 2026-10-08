// High quality procedural Web Audio API synthesizer for Naija Run Gameplay 2.0
// Features authentic procedural Afrobeat background music + full sound effects suite
// Works 100% offline, zero external audio asset dependencies, low latency, mobile friendly

class GameAudioEngine {
  constructor() {
    this.ctx = null;
    const hasStorage = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    
    // Independent toggles persisted to localStorage
    this.isMusicOn = hasStorage ? localStorage.getItem('naija_run_music_on') !== 'false' : true;
    this.isSoundOn = hasStorage ? localStorage.getItem('naija_run_sound_on') !== 'false' : true;

    this.masterSoundGain = null;
    this.masterMusicGain = null;
    
    // Music state
    this.musicTimer = null;
    this.musicStep = 0;
    this.musicBpm = 112;
    this.musicState = 'STOPPED'; // 'STOPPED', 'MENU', 'GAMEPLAY', 'HIGHSPEED'
    this.lastFootstepTime = 0;
    this.lastHeartbeatTime = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Sound FX gain
        this.masterSoundGain = this.ctx.createGain();
        this.masterSoundGain.gain.setValueAtTime(this.isSoundOn ? 0.75 : 0, this.ctx.currentTime);
        this.masterSoundGain.connect(this.ctx.destination);

        // Music gain
        this.masterMusicGain = this.ctx.createGain();
        this.masterMusicGain.gain.setValueAtTime(this.isMusicOn ? 0.38 : 0, this.ctx.currentTime);
        this.masterMusicGain.connect(this.ctx.destination);
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

  setSoundOn(on) {
    this.isSoundOn = on;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('naija_run_sound_on', on.toString());
    }
    if (this.masterSoundGain && this.ctx) {
      this.masterSoundGain.gain.setValueAtTime(on ? 0.75 : 0, this.ctx.currentTime);
    }
  }

  setMusicOn(on) {
    this.isMusicOn = on;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('naija_run_music_on', on.toString());
    }
    if (this.masterMusicGain && this.ctx) {
      this.masterMusicGain.gain.setValueAtTime(on ? 0.38 : 0, this.ctx.currentTime);
    }
    if (on && this.musicState === 'STOPPED') {
      this.startMusic('GAMEPLAY');
    } else if (!on && this.musicTimer) {
      // Keep sequencer running or silent
    }
  }

  toggleSound() {
    this.resumeContext();
    this.setSoundOn(!this.isSoundOn);
    return this.isSoundOn;
  }

  toggleMusic() {
    this.resumeContext();
    this.setMusicOn(!this.isMusicOn);
    return this.isMusicOn;
  }

  // ==========================================
  // PROCEDURAL AFROBEAT BACKGROUND MUSIC
  // ==========================================

  startMusic(state = 'GAMEPLAY') {
    this.resumeContext();
    if (!this.ctx) return;
    this.musicState = state;
    if (this.musicTimer) return;

    this.musicStep = 0;
    this.scheduleNextBeat();
  }

  setMusicState(state) {
    this.musicState = state;
    if (state === 'STOPPED') {
      this.stopMusic();
    } else if (!this.musicTimer) {
      this.startMusic(state);
    }
  }

  stopMusic() {
    this.musicState = 'STOPPED';
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  scheduleNextBeat() {
    if (this.musicState === 'STOPPED' || !this.ctx) return;

    // Determine target BPM: accelerates with game speed!
    let targetBpm = 112;
    if (this.musicState === 'MENU') {
      targetBpm = 104;
    } else if (this.musicState === 'HIGHSPEED') {
      targetBpm = 132;
    } else {
      targetBpm = 118;
    }

    const stepDurationSec = (60 / targetBpm) / 4; // 16th note subdivision
    const stepDurationMs = stepDurationSec * 1000;

    if (this.isMusicOn) {
      this.playAfrobeatStep(this.musicStep, this.ctx.currentTime);
    }

    this.musicStep = (this.musicStep + 1) % 16;
    this.musicTimer = setTimeout(() => this.scheduleNextBeat(), stepDurationMs);
  }

  playAfrobeatStep(step, t) {
    if (!this.ctx || !this.masterMusicGain) return;

    // 1. Kick drum: African syncopated polyrhythm (steps 0, 6, 8, 14)
    const kickPattern = [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    if (kickPattern[step]) {
      this.synthKick(t, step === 0 ? 0.35 : 0.25);
    }

    // 2. Afrobeat Snare / Rimshot: steps 4 and 12 (backbeat) + syncopated ghost at 10
    if (step === 4 || step === 12) {
      this.synthRimshot(t, 0.26);
    } else if (step === 10 && this.musicState !== 'MENU') {
      this.synthRimshot(t, 0.14);
    }

    // 3. Shekere / Shaker: continuous 16th groove with accents
    const shakerVol = (step % 2 === 0) ? 0.12 : 0.07;
    this.synthShaker(t, shakerVol);

    // 4. Modal Funky Afrobeat Bass Line (A minor pentatonic: A1, C2, D2, E2, G2)
    // Dynamic syncopated bass groove
    const bassNotes = [
      55,   0, 55,   0, // A1, -, A1, -
       0,  65.4, 0,  73.4, // -, C2, -, D2
      82.4, 0,  0,  73.4, // E2, -, -, D2
      65.4, 0, 55,   0  // C2, -, A1, -
    ];
    const noteFreq = bassNotes[step];
    if (noteFreq > 0) {
      this.synthBassNote(t, noteFreq, 0.22);
    }

    // 5. Bright Kalimba / Marimba Chords on syncopated offbeats (steps 2, 7, 11, 15)
    if (step === 2 || step === 7 || step === 11 || step === 15) {
      const chordNotes = step % 4 === 2 ? [440, 523.25, 659.25] : [392, 493.88, 587.33];
      this.synthAfroChime(t, chordNotes, 0.12);
    }

    // 6. High Speed Percussion Layer (claps & wooden agogo on late game)
    if (this.musicState === 'HIGHSPEED' && (step === 2 || step === 8 || step === 14)) {
      this.synthAgogo(t, step === 8 ? 880 : 1174, 0.15);
    }
  }

  synthKick(t, vol) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.masterMusicGain);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch (e) {}
  }

  synthRimshot(t, vol) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.masterMusicGain);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  synthShaker(t, vol) {
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4200, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterMusicGain);
      noise.start(t);
      noise.stop(t + 0.055);
    } catch (e) {}
  }

  synthBassNote(t, freq, vol) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, t);
      filter.frequency.linearRampToValueAtTime(160, t + 0.18);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterMusicGain);
      osc.start(t);
      osc.stop(t + 0.24);
    } catch (e) {}
  }

  synthAfroChime(t, freqs, vol) {
    try {
      freqs.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(vol * 0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(this.masterMusicGain);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch (e) {}
  }

  synthAgogo(t, freq, vol) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.12);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.masterMusicGain);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  // ==========================================
  // SOUND EFFECTS SUITE
  // ==========================================

  playFootstep() {
    if (!this.isSoundOn || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastFootstepTime < 130) return;
    this.lastFootstepTime = now;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = 65 + Math.random() * 20;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  playLanding() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.14);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch (e) {}
  }

  playJump() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(460, t + 0.22);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.26);
    } catch (e) {}
  }

  playSlide() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, t);
      filter.frequency.linearRampToValueAtTime(140, t + 0.35);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.35);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterSoundGain);
      noise.start(t);
      noise.stop(t + 0.36);
    } catch (e) {}
  }

  // Collect standard Naira (₦100, ₦500)
  playCollectCash() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const freqs = [1318.51, 1975.53];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        gain.gain.setValueAtTime(0.18, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.35);
        osc.connect(gain);
        gain.connect(this.masterSoundGain);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.38);
      });
    } catch (e) {}
  }

  // Collect High-Value Naira (₦1,000, ₦5,000)
  playHighValueNaira(value = 1000) {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = value >= 5000 
        ? [1046.50, 1318.51, 1567.98, 2093.00, 2637.02] // C6 Major Pentatonic shimmer
        : [880.00, 1174.66, 1479.98, 1760.00];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.045);
        gain.gain.setValueAtTime(0.22, t + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.045 + 0.45);
        osc.connect(gain);
        gain.connect(this.masterSoundGain);
        osc.start(t + idx * 0.045);
        osc.stop(t + idx * 0.045 + 0.48);
      });
    } catch (e) {}
  }

  // Consecutive Naira Streak (x3, x5, x10)
  playNairaStreak(streakCount = 3) {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const baseFreq = streakCount >= 10 ? 880 : streakCount >= 5 ? 659.25 : 523.25;
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);
        gain.gain.setValueAtTime(0.25, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(this.masterSoundGain);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.38);
      });
    } catch (e) {}
  }

  // Near Miss Mechanic: razor-close obstacle dodge!
  playNearMiss() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // High whoosh + crisp ding
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.exponentialRampToValueAtTime(1600, t + 0.15);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch (e) {}
  }

  // Speed Burst: supersonic boost
  playSpeedBurst() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.4);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.48);
    } catch (e) {}
  }

  // Chaos Event warning
  playChaosEvent() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.6);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.7);
    } catch (e) {}
  }

  // Countdown Ticks: 3, 2, 1
  playCountdownTick(num = 3) {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = num === 1 ? 880 : num === 2 ? 660 : 520;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch (e) {}
  }

  // Countdown GO!
  playCountdownGo() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * 1.05, t + 0.2);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(this.masterSoundGain);
        osc.start(t);
        osc.stop(t + 0.55);
      });
    } catch (e) {}
  }

  playImpact() {
    if (!this.isSoundOn || !this.ctx) return;
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
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.36);
    } catch (e) {}
  }

  playCollision() {
    this.playImpact();
  }

  playHeartbeat(pressure = 0.5) {
    if (!this.isSoundOn || !this.ctx) return;
    const now = performance.now();
    const interval = 800 - pressure * 400;
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
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  playGuardianRoar() {
    if (!this.isSoundOn || !this.ctx) return;
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
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.9);
    } catch (e) {}
  }

  playGameOver() {
    this.setMusicState('STOPPED');
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [220, 196, 174, 146.83];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.25);
        gain.gain.setValueAtTime(0.25, t + idx * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.25 + 0.6);
        osc.connect(gain);
        gain.connect(this.masterSoundGain);
        osc.start(t + idx * 0.25);
        osc.stop(t + idx * 0.25 + 0.65);
      });
    } catch (e) {}
  }

  playTurn(dir = 1) {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(dir > 0 ? 320 : 260, t);
      osc.frequency.exponentialRampToValueAtTime(dir > 0 ? 540 : 180, t + 0.16);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, t);
      filter.Q.setValueAtTime(3, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }

  playSpeedUp() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.35);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.38);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {}
  }

  playMultiplierUp() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);
        gain.gain.setValueAtTime(0.2, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(this.masterSoundGain);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.32);
      });
    } catch (e) {}
  }

  playValuablePickup() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const chords = [880, 1108.73, 1318.51, 1760];
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        gain.gain.setValueAtTime(0.22, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.5);
        osc.connect(gain);
        gain.connect(this.masterSoundGain);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.52);
      });
    } catch (e) {}
  }

  playPointCatalyst() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(140, t);
      osc1.frequency.linearRampToValueAtTime(90, t + 0.25);
      osc2.frequency.setValueAtTime(148, t);
      osc2.frequency.linearRampToValueAtTime(95, t + 0.25);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterSoundGain);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.3);
      osc2.stop(t + 0.3);
    } catch (e) {}
  }

  playRevive() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const chord = [329.63, 440, 554.37, 659.25, 880];
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.5, t);
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.4);
        gain.gain.setValueAtTime(0.24, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.connect(gain);
        gain.connect(this.masterSoundGain);
        osc.start(t);
        osc.stop(t + 0.95);
      });
    } catch (e) {}
  }

  playWitchShriek() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.linearRampToValueAtTime(820, t + 0.2);
      osc.frequency.linearRampToValueAtTime(320, t + 0.6);
      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.7);
    } catch (e) {}
  }

  playButtonClick() {
    if (!this.isSoundOn || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc.connect(gain);
      gain.connect(this.masterSoundGain);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  }
}

export const gameAudio = new GameAudioEngine();
