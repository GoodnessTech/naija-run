import { userProfile } from '../progression/UserProfileManager.js';
import { leaderboardManager } from '../progression/LeaderboardManager.js';
import { gameAudio } from './GameAudio.js';
import { environmentDirector, ENVIRONMENTS } from '../environment/EnvironmentDirector.js';

export const GAME_STATUS = {
  LOADING: 'LOADING',
  MENU: 'MENU',
  COUNTDOWN: 'COUNTDOWN',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  REVIVE: 'REVIVE',
  GAMEOVER: 'GAMEOVER'
};

export const LANE = {
  LEFT: -1,
  CENTER: 0,
  RIGHT: 1
};

export const LANE_WIDTH = 2.4;

export const PLAYER_STATE = {
  RUNNING: 'RUNNING',
  JUMPING: 'JUMPING',
  SLIDING: 'SLIDING',
  DOWNED: 'DOWNED',
  DEAD: 'DEAD'
};

export const BIOMES = ENVIRONMENTS;

class GameStateManager {
  constructor() {
    this.listeners = new Set();
    const hasStorage = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    this.highScore = hasStorage ? parseInt(localStorage.getItem('naija_run_highscore') || '0', 10) : 0;
    this.highCash = hasStorage ? parseInt(localStorage.getItem('naija_run_highcash') || '0', 10) : 0;
    this.debugMode = false;
    this.remainingShields = 0;
    this.cashBonusMultiplier = 1.0;
    this.scoreMultiplier = 1.0;
    this.lastRunResult = null;
    this.reset();
  }

  reset() {
    this.status = GAME_STATUS.MENU;
    this.countdownValue = 3;
    this.countdownTimer = 0;
    this.distance = 0;
    
    // Starting speed is fast and energetic immediately (23.5 m/s)
    this.baseStartSpeed = 23.5;
    this.speed = this.baseStartSpeed;
    this.targetSpeed = this.baseStartSpeed;
    this.cash = 0;
    this.score = 0;
    this.pointMultiplier = 1;
    this.multiplierTimer = 0;
    this.magnetTimer = 0;
    this.speedBurstTimer = 0;
    this.isSpeedBurstActive = false;

    // Naira Streak System
    this.nairaStreak = 0;
    this.lastNairaTime = 0;

    // Chaser Tension System (5 Phases)
    this.guardianDistance = 22.0;
    this.guardianPressure = 0.0;
    this.chaserPhase = 1;

    // Lanes and Player State
    this.currentLane = LANE.CENTER;
    this.targetLane = LANE.CENTER;
    this.playerState = PLAYER_STATE.RUNNING;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.strikes = 0;
    this.isDowned = false;
    this.downedTimer = 0;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.cleanRunDistance = 0;
    
    // Near Miss and Alert feedback
    this.alertMessage = '';
    this.alertTimer = 0;
    this.nearMissCount = 0;
    this.fps = 60;
    this.lastNotifyTime = 0;
    this.last100mThreshold = 0;
    this.last500mAmbushThreshold = 0;
    this.activeFrontWitches = [];
    this.reviveCountdown = 0;

    // Chaos Events
    this.activeChaosEvent = null;
    this.chaosEventTimer = 0;
    this.lastChaosThreshold = 0;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(immediate = false) {
    const now = performance.now();
    if (immediate || now - this.lastNotifyTime > 40) {
      this.lastNotifyTime = now;
      const snapshot = this.getSnapshot();
      for (const listener of this.listeners) {
        listener(snapshot);
      }
    }
  }

  // Dynamic environment determination from Environment Director
  getCurrentBiome() {
    return environmentDirector.getEnvironmentAtDistance(this.distance).currentEnv;
  }

  getBiomeDisplayName() {
    return environmentDirector.getEnvironmentAtDistance(this.distance).config.name;
  }

  getBiomeSubtitle() {
    return environmentDirector.getEnvironmentAtDistance(this.distance).config.subtitle;
  }

  // Chaser 5-Phase Determination
  updateChaserPhase() {
    const d = this.guardianDistance;
    if (d > 16.0) this.chaserPhase = 1;
    else if (d > 12.0) this.chaserPhase = 2;
    else if (d > 8.0) this.chaserPhase = 3;
    else if (d > 4.0) this.chaserPhase = 4;
    else this.chaserPhase = 5;
  }

  getChaserPhaseTitle() {
    switch (this.chaserPhase) {
      case 1: return 'DISTANT THREAT';
      case 2: return 'LURKING IN SHADOWS';
      case 3: return 'CLOSING IN';
      case 4: return 'AGGRESSIVE PURSUIT';
      case 5: return 'EXTREME DANGER!';
      default: return 'DISTANT THREAT';
    }
  }

  // Smooth progressive speed progression curve (Starts fast at 23.5 m/s)
  calculateTargetSpeed() {
    const dist = this.distance;
    // 0-500m (Start): 23.5 -> 29.5 m/s
    // 500-1500m (Mid): 29.5 -> 35.5 m/s
    // 1500-3000m (Late): 35.5 -> 41.0 m/s
    // 3000m+ (Extreme): 41.0 -> 46.0+ m/s
    let calculated = this.baseStartSpeed;
    if (dist <= 500) {
      calculated = 23.5 + (dist / 500) * 6.0;
    } else if (dist <= 1500) {
      calculated = 29.5 + ((dist - 500) / 1000) * 6.0;
    } else if (dist <= 3000) {
      calculated = 35.5 + ((dist - 1500) / 1500) * 5.5;
    } else {
      calculated = 41.0 + Math.min(6.0, ((dist - 3000) / 1500) * 5.0);
    }

    if (this.isSpeedBurstActive) {
      calculated += 7.0; // Supersonic burst boost!
    }

    return calculated;
  }

  getSnapshot() {
    this.updateChaserPhase();
    const envData = environmentDirector.getEnvironmentAtDistance(this.distance);

    return {
      status: this.status,
      countdownValue: this.countdownValue,
      distance: Math.floor(this.distance),
      speed: Math.round(this.speed * 10) / 10,
      cash: this.cash,
      score: Math.floor(this.score),
      highScore: this.highScore,
      highCash: this.highCash,
      nairaStreak: this.nairaStreak,
      guardianDistance: Math.max(0, Math.round(this.guardianDistance * 10) / 10),
      guardianPressure: this.guardianPressure,
      chaserPhase: this.chaserPhase,
      chaserPhaseTitle: this.getChaserPhaseTitle(),
      playerState: this.playerState,
      currentLane: this.currentLane,
      strikes: this.strikes,
      isDowned: this.isDowned,
      isInvincible: this.isInvincible || this.isSpeedBurstActive,
      isSpeedBurstActive: this.isSpeedBurstActive,
      pointMultiplier: this.pointMultiplier,
      multiplierTimer: Math.ceil(this.multiplierTimer),
      isMagnetActive: this.magnetTimer > 0,
      alertMessage: this.alertMessage,
      isMuted: !gameAudio.isSoundOn,
      isMusicOn: gameAudio.isMusicOn,
      isSoundOn: gameAudio.isSoundOn,
      debugMode: this.debugMode,
      fps: this.fps,
      remainingShields: this.remainingShields || 0,
      reviveCountdown: Math.ceil(this.reviveCountdown),
      canReviveNaira: this.cash >= 1000 || userProfile.getSnapshot().wallet >= 1000,
      canRevivePoints: this.score >= 1500,
      currentBiome: envData.currentEnv,
      biomeDisplayName: envData.config.name,
      biomeSubtitle: envData.config.subtitle,
      isTransition: envData.isTransition,
      nextBiomeDisplayName: envData.nextConfig.name,
      speedLevel: Math.floor(this.distance / 100) + 1,
      lastRunResult: this.lastRunResult,
      activeChaosEvent: this.activeChaosEvent
    };
  }

  // Start sequence with high energy 3 -> 2 -> 1 -> GO!
  startCountdown() {
    this.reset();
    environmentDirector.resetForNewRun();
    gameAudio.resumeContext();
    const perks = userProfile.getActivePerks();
    this.guardianDistance = 22.0 + (perks.guardianStartDistanceBonus || 0);
    this.baseStartSpeed = 23.5 + (perks.speedBonus || 0);
    this.speed = this.baseStartSpeed;
    this.targetSpeed = this.baseStartSpeed;
    this.remainingShields = perks.shieldCount || 0;
    this.cashBonusMultiplier = 1.0 + (perks.cashBonusPercent || 0);
    this.scoreMultiplier = perks.scoreMultiplier || 1.0;
    this.lastRunResult = null;

    this.status = GAME_STATUS.COUNTDOWN;
    this.countdownValue = 3;
    this.countdownTimer = 0.65; // ~0.65s per tick
    gameAudio.playCountdownTick(3);
    this.notify(true);
  }

  startGame() {
    this.status = GAME_STATUS.PLAYING;
    this.playerState = PLAYER_STATE.RUNNING;
    gameAudio.startMusic('GAMEPLAY');
    this.notify(true);
  }

  pauseGame() {
    if (this.status === GAME_STATUS.PLAYING) {
      this.status = GAME_STATUS.PAUSED;
      gameAudio.setMusicState('MENU');
      this.notify(true);
    }
  }

  resumeGame() {
    if (this.status === GAME_STATUS.PAUSED) {
      this.status = GAME_STATUS.PLAYING;
      gameAudio.setMusicState(this.speed > 28.0 ? 'HIGHSPEED' : 'GAMEPLAY');
      this.notify(true);
    }
  }

  // 100m Speed increase milestone check
  checkSpeedProgression() {
    const current100m = Math.floor(this.distance / 100);
    if (current100m > this.last100mThreshold && current100m > 0) {
      this.last100mThreshold = current100m;
      this.alertMessage = `⚡ SPEED SURGE! ${(this.speed).toFixed(1)} m/s (+${current100m * 100}m)`;
      this.alertTimer = 1.0;
      gameAudio.playSpeedUp();
      
      // Scale music intensity if speed crosses 28 m/s
      if (this.speed > 28.0) {
        gameAudio.setMusicState('HIGHSPEED');
      }
      this.notify(true);
    }
  }

  // Rare Chaos Events System (Every ~350-500m)
  checkChaosEvents() {
    const currentEventThreshold = Math.floor(this.distance / 420);
    if (currentEventThreshold > this.lastChaosThreshold && currentEventThreshold > 0) {
      this.lastChaosThreshold = currentEventThreshold;
      if (Math.random() < 0.65 && !this.activeChaosEvent) {
        const events = ['SPEED_BURST', 'MONEY_RAIN', 'CHASER_SURGE', 'WITCH_SWARM'];
        const chosen = events[Math.floor(Math.random() * events.length)];
        this.triggerChaosEvent(chosen);
      }
    }
  }

  triggerChaosEvent(type) {
    if (type === 'SPEED_BURST') {
      this.activateSpeedBurst(5.0);
    } else if (type === 'MONEY_RAIN') {
      this.activeChaosEvent = { type: 'MONEY_RAIN', name: '💸 NAIRA SHOWER! CASH OVERFLOW!', timer: 8.0 };
      this.alertMessage = '💸 NAIRA SHOWER! CASH OVERFLOW!';
      this.alertTimer = 1.2;
      gameAudio.playChaosEvent();
    } else if (type === 'CHASER_SURGE') {
      this.guardianDistance = Math.max(6.0, this.guardianDistance - 5.0);
      this.activeChaosEvent = { type: 'CHASER_SURGE', name: '⚠️ CHASER SURGE! SHE IS CLOSING IN!', timer: 6.0 };
      this.alertMessage = '⚠️ CHASER SURGE! SHE IS CLOSING IN!';
      this.alertTimer = 1.2;
      gameAudio.playWitchShriek();
    } else if (type === 'WITCH_SWARM') {
      this.activeChaosEvent = { type: 'WITCH_SWARM', name: '👹 WITCH SHADOWS GATHER!', timer: 7.0 };
      this.alertMessage = '👹 WITCH SHADOWS GATHER!';
      this.alertTimer = 1.2;
      gameAudio.playWitchShriek();
    }
    this.notify(true);
  }

  // Speed Burst powerup / mechanic
  activateSpeedBurst(duration = 5.0) {
    this.isSpeedBurstActive = true;
    this.speedBurstTimer = duration;
    this.isInvincible = true;
    this.alertMessage = '⚡ HYPER SPEED BURST! 2X SCORE!';
    this.alertTimer = 1.2;
    gameAudio.playSpeedBurst();
    this.notify(true);
  }

  // Near-Miss Mechanic: Razor close obstacle dodge (+150 PTS bonus)
  triggerNearMiss(obstacleType = 'HAZARD') {
    if (this.status !== GAME_STATUS.PLAYING || this.isDowned) return;
    this.nearMissCount++;
    const bonusPts = Math.round(150 * (this.pointMultiplier || 1) * (this.scoreMultiplier || 1.0));
    this.score += bonusPts;
    this.alertMessage = `⚡ NEAR MISS! +${bonusPts} PTS!`;
    this.alertTimer = 0.9;
    gameAudio.playNearMiss();
    this.notify(true);
  }

  // 500m Front Witch Ambush
  check500mAmbush() {
    const current500m = Math.floor(this.distance / 500);
    if (current500m > this.last500mAmbushThreshold && current500m > 0) {
      this.last500mAmbushThreshold = current500m;
      const randomLane = Math.floor(Math.random() * 3) - 1;
      const witchId = `fw_${current500m}_${Date.now()}`;
      this.activeFrontWitches.push({
        id: witchId,
        lane: randomLane,
        z: this.playerZ - 45.0,
      });

      this.alertMessage = `👹 WITCH AMBUSH AHEAD! DODGE ${randomLane === -1 ? 'LEFT' : randomLane === 1 ? 'RIGHT' : 'CENTER'}!`;
      this.alertTimer = 1.2;
      gameAudio.playWitchShriek();
      this.notify(true);
    }
  }

  activateMultiplier(multiplier = 2, duration = 15) {
    this.pointMultiplier = multiplier;
    this.multiplierTimer = duration;
    this.alertMessage = `⚡ ${multiplier}X POINT MULTIPLIER ACTIVATED!`;
    this.alertTimer = 1.0;
    gameAudio.playMultiplierUp();
    this.notify(true);
  }

  collectValuable(type) {
    if (type === 'CORAL_BEADS') {
      this.cash += Math.round(5000 * (this.cashBonusMultiplier || 1.0));
      this.score += Math.round(500 * this.pointMultiplier * (this.scoreMultiplier || 1.0));
      this.alertMessage = '👑 ROYAL CORAL BEADS! +₦5,000 & 500 PTS!';
    } else if (type === 'GOLDEN_SPIKES') {
      this.remainingShields = (this.remainingShields || 0) + 1;
      this.cash += Math.round(2000 * (this.cashBonusMultiplier || 1.0));
      this.alertMessage = '👟 GOLDEN SPIKES! +1 SHIELD ACTIVE!';
    } else if (type === 'SANGO_SHADES') {
      this.magnetTimer = 12.0;
      this.alertMessage = '🕶️ SANGO SHADES! NAIRA MAGNET (12s)!';
    } else if (type === 'ROYAL_AGBADA') {
      this.cash += Math.round(10000 * (this.cashBonusMultiplier || 1.0));
      this.score += Math.round(1000 * this.pointMultiplier * (this.scoreMultiplier || 1.0));
      this.alertMessage = '✨ ROYAL AGBADA! +₦10,000 MEGA NAIRA!';
    }
    this.alertTimer = 1.2;
    gameAudio.playValuablePickup();
    this.notify(true);
  }

  triggerPointCatalyst(penalty = 100) {
    this.score = Math.max(0, this.score - penalty);
    this.alertMessage = `⚠️ CURSED FETISH TRAP! -${penalty} PTS!`;
    this.alertTimer = 1.0;
    gameAudio.playPointCatalyst();
    this.notify(true);
  }

  // Naira Collection with Denominations and Streaks
  collectNaira(amount = 100, isRisky = false) {
    const effectiveCash = Math.round(amount * (this.cashBonusMultiplier || 1.0));
    this.cash += effectiveCash;
    
    // Score based on denomination + risky lane bonus
    const basePts = amount >= 5000 ? 150 : amount >= 1000 ? 50 : amount >= 500 ? 25 : 10;
    const riskMultiplier = isRisky ? 2.0 : 1.0;
    this.score += Math.round(basePts * riskMultiplier * this.pointMultiplier * (this.scoreMultiplier || 1.0));

    // Naira Streak handling
    const now = performance.now();
    if (now - this.lastNairaTime < 2400) {
      this.nairaStreak++;
    } else {
      this.nairaStreak = 1;
    }
    this.lastNairaTime = now;

    // Trigger streak notifications on x3, x5, x10
    if (this.nairaStreak === 3 || this.nairaStreak === 5 || this.nairaStreak === 10 || this.nairaStreak === 15) {
      const bonusCash = this.nairaStreak * 100;
      this.cash += bonusCash;
      this.alertMessage = `🔥 NAIRA STREAK x${this.nairaStreak}! +₦${bonusCash.toLocaleString()} BONUS!`;
      this.alertTimer = 1.0;
      gameAudio.playNairaStreak(this.nairaStreak);
    } else if (amount >= 1000) {
      gameAudio.playHighValueNaira(amount);
    } else {
      gameAudio.playCollectCash();
    }

    // Minor guardian pushback on collecting Naira
    this.guardianDistance = Math.min(22.0, this.guardianDistance + 0.3);
    this.notify(false);
  }

  // Backward compatibility alias
  collectCash(amount = 1000) {
    this.collectNaira(amount, false);
  }

  // Obstacle Hit: 2nd hit kills!
  hitObstacle() {
    if (this.isDowned || this.isInvincible || this.isSpeedBurstActive || this.status !== GAME_STATUS.PLAYING) return;

    // Reset Naira streak on collision
    this.nairaStreak = 0;

    if (this.remainingShields > 0) {
      this.remainingShields--;
      this.alertMessage = '🛡️ VEHICLE SHIELD ABSORBED HIT!';
      this.alertTimer = 1.0;
      this.isInvincible = true;
      this.invincibleTimer = 1.5;
      this.notify(true);
      return;
    }

    this.strikes++;
    this.isDowned = true;
    this.downedTimer = 0.85;
    this.playerState = PLAYER_STATE.DOWNED;

    this.speed = 6.0;
    this.cleanRunDistance = 0;
    this.alertTimer = 1.0;

    if (this.strikes === 1) {
      this.guardianDistance = 6.0;
      this.alertMessage = '⚠️ WITCH AWAKENED BEHIND YOU! NEXT HIT KILLS! (1/2)';
      gameAudio.playWitchShriek();
      this.notify(true);
    } else {
      this.guardianDistance = 0.0;
      this.alertMessage = '💀 WITCH STRIKES! RUNNER DOWN!';
      gameAudio.playGameOver();
      this.promptRevive();
    }
  }

  promptRevive() {
    this.status = GAME_STATUS.REVIVE;
    this.reviveCountdown = 6.0;
    this.notify(true);
  }

  reviveWithNaira() {
    if (this.cash >= 1000) {
      this.cash -= 1000;
    } else if (userProfile.getSnapshot().wallet >= 1000) {
      userProfile.addCash(-1000);
    } else {
      return false;
    }
    this.completeRevive();
    return true;
  }

  reviveWithPoints() {
    if (this.score < 1500) return false;
    this.score -= 1500;
    this.completeRevive();
    return true;
  }

  completeRevive() {
    this.strikes = 0;
    this.isDowned = false;
    this.downedTimer = 0;
    this.isInvincible = true;
    this.invincibleTimer = 3.5;
    this.guardianDistance = 22.0;
    this.speed = Math.max(21.0, this.targetSpeed);
    this.playerState = PLAYER_STATE.RUNNING;
    this.status = GAME_STATUS.PLAYING;
    this.alertMessage = '✨ REVIVED! SAFE SHIELD ACTIVE (3s)!';
    this.alertTimer = 1.2;
    gameAudio.playRevive();
    gameAudio.startMusic(this.speed > 28.0 ? 'HIGHSPEED' : 'GAMEPLAY');
    this.notify(true);
  }

  declineRevive() {
    this.gameOver('GUARDIAN_CAUGHT');
  }

  gameOver(reason = 'GUARDIAN_CAUGHT') {
    if (this.status === GAME_STATUS.GAMEOVER) return;
    this.status = GAME_STATUS.GAMEOVER;
    this.playerState = PLAYER_STATE.DEAD;
    this.reason = reason;
    gameAudio.stopMusic();

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const runDate = new Date().toISOString();

    const runResult = userProfile.recordRun({
      id: runId,
      date: runDate,
      cash: this.cash,
      distance: this.distance,
      score: this.score
    });
    this.lastRunResult = runResult;

    leaderboardManager.recordRealRun({
      id: runId,
      date: runDate,
      distance: this.distance,
      cash: this.cash,
      score: this.score
    });

    if (typeof localStorage !== 'undefined') {
      if (this.score > this.highScore) {
        this.highScore = Math.floor(this.score);
        localStorage.setItem('naija_run_highscore', this.highScore.toString());
      }
      if (this.cash > this.highCash) {
        this.highCash = this.cash;
        localStorage.setItem('naija_run_highcash', this.highCash.toString());
      }
    }

    this.notify(true);
  }

  toggleSound() {
    return gameAudio.toggleSound();
  }

  toggleMusic() {
    return gameAudio.toggleMusic();
  }

  toggleMute() {
    return gameAudio.toggleSound();
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
    this.notify(true);
    return this.debugMode;
  }

  tick(dt) {
    // Countdown state handler
    if (this.status === GAME_STATUS.COUNTDOWN) {
      this.countdownTimer -= dt;
      if (this.countdownTimer <= 0) {
        if (this.countdownValue === 3) {
          this.countdownValue = 2;
          this.countdownTimer = 0.65;
          gameAudio.playCountdownTick(2);
        } else if (this.countdownValue === 2) {
          this.countdownValue = 1;
          this.countdownTimer = 0.65;
          gameAudio.playCountdownTick(1);
        } else if (this.countdownValue === 1) {
          this.countdownValue = 'GO!';
          this.countdownTimer = 0.55;
          gameAudio.playCountdownGo();
        } else {
          this.startGame();
          return;
        }
        this.notify(true);
      }
      return;
    }

    if (this.alertTimer > 0) {
      this.alertTimer -= dt;
      if (this.alertTimer <= 0) {
        this.alertMessage = '';
        this.notify(true);
      }
    }

    // Multiplier timer
    if (this.multiplierTimer > 0) {
      this.multiplierTimer -= dt;
      if (this.multiplierTimer <= 0) {
        this.pointMultiplier = 1;
        this.notify(true);
      }
    }

    // Speed Burst timer
    if (this.speedBurstTimer > 0) {
      this.speedBurstTimer -= dt;
      if (this.speedBurstTimer <= 0) {
        this.isSpeedBurstActive = false;
        this.notify(true);
      }
    }

    // Chaos Event timer
    if (this.activeChaosEvent) {
      this.activeChaosEvent.timer -= dt;
      if (this.activeChaosEvent.timer <= 0) {
        this.activeChaosEvent = null;
        this.notify(true);
      }
    }

    // Magnet timer
    if (this.magnetTimer > 0) {
      this.magnetTimer -= dt;
    }

    // Invincibility shield timer
    if (this.isInvincible && !this.isSpeedBurstActive) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
      }
    }

    // Revive countdown timer
    if (this.status === GAME_STATUS.REVIVE) {
      this.reviveCountdown -= dt;
      if (this.reviveCountdown <= 0) {
        this.declineRevive();
      } else {
        this.notify(false);
      }
    }

    // Downed recovery timer
    if (this.isDowned) {
      this.downedTimer -= dt;
      if (this.downedTimer <= 0) {
        this.isDowned = false;
        if (this.status === GAME_STATUS.PLAYING) {
          this.playerState = PLAYER_STATE.RUNNING;
        }
        this.notify(true);
      }
    }

    // Streak timeout check: reset streak if no note collected within 3.5s
    if (this.nairaStreak > 0 && performance.now() - this.lastNairaTime > 3500) {
      this.nairaStreak = 0;
    }
  }
}

export const gameState = new GameStateManager();
