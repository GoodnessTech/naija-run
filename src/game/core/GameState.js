import { userProfile } from '../progression/UserProfileManager.js';
import { leaderboardManager } from '../progression/LeaderboardManager.js';
import { gameAudio } from './GameAudio.js';

export const GAME_STATUS = {
  LOADING: 'LOADING',
  MENU: 'MENU',
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

class GameStateManager {
  constructor() {
    this.listeners = new Set();
    const hasStorage = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    this.highScore = hasStorage ? parseInt(localStorage.getItem('naija_run_highscore') || '0', 10) : 0;
    this.highCash = hasStorage ? parseInt(localStorage.getItem('naija_run_highcash') || '0', 10) : 0;
    this.isMuted = hasStorage ? localStorage.getItem('naija_run_muted') === 'true' : false;
    this.debugMode = false;
    this.remainingShields = 0;
    this.cashBonusMultiplier = 1.0;
    this.scoreMultiplier = 1.0;
    this.lastRunResult = null;
    this.reset();
  }

  reset() {
    this.status = GAME_STATUS.MENU;
    this.distance = 0;
    this.speed = 16.0;
    this.targetSpeed = 16.0;
    this.cash = 0;
    this.score = 0;
    this.pointMultiplier = 1; // 2X powerup multiplier
    this.multiplierTimer = 0;
    this.magnetTimer = 0; // Sango Shades coin magnet timer
    this.guardianDistance = 22.0;
    this.guardianPressure = 0.0;
    this.currentLane = LANE.CENTER;
    this.targetLane = LANE.CENTER;
    this.playerState = PLAYER_STATE.RUNNING;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.strikes = 0; // 0: Safe (witch hidden), 1: Witch behind (alerted), 2: Dead (dies on 2nd hit!)
    this.isDowned = false;
    this.downedTimer = 0;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.cleanRunDistance = 0;
    this.alertMessage = '';
    this.alertTimer = 0;
    this.fps = 60;
    this.lastNotifyTime = 0;
    this.last100mThreshold = 0;
    this.last500mAmbushThreshold = 0;
    this.activeFrontWitches = []; // Array of { id, lane, z }
    this.reviveCountdown = 0;
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

  getCurrentBiome() {
    const dist = this.distance % 1600;
    if (dist < 380) return 'RAINFOREST';
    if (dist < 780) return 'BENIN_SHRINE';
    if (dist < 1180) return 'LAGOS_HIGHWAY';
    return 'CLOUD_CHASM';
  }

  getSnapshot() {
    return {
      status: this.status,
      distance: Math.floor(this.distance),
      speed: Math.round(this.speed * 10) / 10,
      cash: this.cash,
      score: Math.floor(this.score),
      highScore: this.highScore,
      highCash: this.highCash,
      guardianDistance: Math.max(0, Math.round(this.guardianDistance * 10) / 10),
      guardianPressure: this.guardianPressure,
      playerState: this.playerState,
      currentLane: this.currentLane,
      strikes: this.strikes,
      isDowned: this.isDowned,
      isInvincible: this.isInvincible,
      pointMultiplier: this.pointMultiplier,
      multiplierTimer: Math.ceil(this.multiplierTimer),
      isMagnetActive: this.magnetTimer > 0,
      alertMessage: this.alertMessage,
      isMuted: this.isMuted,
      debugMode: this.debugMode,
      fps: this.fps,
      remainingShields: this.remainingShields || 0,
      reviveCountdown: Math.ceil(this.reviveCountdown),
      canReviveNaira: this.cash >= 1000 || userProfile.getSnapshot().wallet >= 1000,
      canRevivePoints: this.score >= 1500,
      currentBiome: this.getCurrentBiome(),
      speedLevel: Math.floor(this.distance / 100) + 1,
      lastRunResult: this.lastRunResult
    };
  }

  startGame() {
    this.reset();
    const perks = userProfile.getActivePerks();
    this.guardianDistance = 22.0 + (perks.guardianStartDistanceBonus || 0);
    this.speed = 16.0 + (perks.speedBonus || 0);
    this.targetSpeed = this.speed;
    this.remainingShields = perks.shieldCount || 0;
    this.cashBonusMultiplier = 1.0 + (perks.cashBonusPercent || 0);
    this.scoreMultiplier = perks.scoreMultiplier || 1.0;
    this.lastRunResult = null;

    this.status = GAME_STATUS.PLAYING;
    this.notify(true);
  }

  pauseGame() {
    if (this.status === GAME_STATUS.PLAYING) {
      this.status = GAME_STATUS.PAUSED;
      this.notify(true);
    }
  }

  resumeGame() {
    if (this.status === GAME_STATUS.PAUSED) {
      this.status = GAME_STATUS.PLAYING;
      this.notify(true);
    }
  }

  // 100m Speed increase check
  checkSpeedProgression() {
    const current100m = Math.floor(this.distance / 100);
    if (current100m > this.last100mThreshold && current100m > 0) {
      this.last100mThreshold = current100m;
      // Increase speed by 0.85 m/s every 100m (cap at 32 m/s)
      this.speed = Math.min(32.0, this.speed + 0.85);
      this.targetSpeed = this.speed;
      this.alertMessage = `⚡ SPEED SURGE! ${(this.speed).toFixed(1)} m/s (+${current100m * 100}m)`;
      this.alertTimer = 1.0;
      gameAudio.playSpeedUp();
      this.notify(true);
    }
  }

  // 500m Front Witch Ambush check
  check500mAmbush() {
    const current500m = Math.floor(this.distance / 500);
    if (current500m > this.last500mAmbushThreshold && current500m > 0) {
      this.last500mAmbushThreshold = current500m;
      // Spawn Front Witch ambush 42 meters ahead of runner
      const randomLane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const witchId = `fw_${current500m}_${Date.now()}`;
      this.activeFrontWitches.push({
        id: witchId,
        lane: randomLane,
        z: this.playerZ - 42.0,
      });

      this.alertMessage = `👹 WITCH AMBUSH AHEAD! DODGE ${randomLane === -1 ? 'LEFT' : randomLane === 1 ? 'RIGHT' : 'LANE'}!`;
      this.alertTimer = 1.2;
      gameAudio.playWitchShriek();
      this.notify(true);
    }
  }

  // 2X Point Multiplier collection
  activateMultiplier(multiplier = 2, duration = 15) {
    this.pointMultiplier = multiplier;
    this.multiplierTimer = duration;
    this.alertMessage = `⚡ ${multiplier}X POINT MULTIPLIER ACTIVATED!`;
    this.alertTimer = 1.0;
    gameAudio.playMultiplierUp();
    this.notify(true);
  }

  // Cultural Valuable Pickups (Coral Beads, Golden Spikes, Sango Shades, Royal Agbada)
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
      this.magnetTimer = 12.0; // 12 seconds coin magnet
      this.alertMessage = '🕶️ SANGO SHADES! COIN MAGNET ON (12s)!';
    } else if (type === 'ROYAL_AGBADA') {
      this.cash += Math.round(10000 * (this.cashBonusMultiplier || 1.0));
      this.score += Math.round(1000 * this.pointMultiplier * (this.scoreMultiplier || 1.0));
      this.alertMessage = '✨ ROYAL AGBADA! +₦10,000 MEGA CASH!';
    }
    this.alertTimer = 1.2;
    gameAudio.playValuablePickup();
    this.notify(true);
  }

  // Point Catalyst Trap (-100 PTS)
  triggerPointCatalyst(penalty = 100) {
    this.score = Math.max(0, this.score - penalty);
    this.alertMessage = `⚠️ CURSED FETISH TRAP! -${penalty} PTS!`;
    this.alertTimer = 1.0;
    gameAudio.playPointCatalyst();
    this.notify(true);
  }

  // Increases Naira balance by ₦1,000 per note hit (with active lifestyle multiplier)
  collectCash(amount = 1000) {
    const effectiveCash = Math.round(amount * (this.cashBonusMultiplier || 1.0));
    this.cash += effectiveCash;
    this.score += Math.round(25 * this.pointMultiplier * (this.scoreMultiplier || 1.0));
    // Slight guardian recovery on clean cash collection
    this.guardianDistance = Math.min(22.0, this.guardianDistance + 0.35);
    this.notify(false);
  }

  // Obstacle hit: DIES AFTER 2 HITS! (Strike 1 = Witch appears behind, Strike 2 = Fatal death / Revive)
  hitObstacle() {
    if (this.isDowned || this.isInvincible || this.status !== GAME_STATUS.PLAYING) return;

    // Check if player has an active vehicle shield
    if (this.remainingShields > 0) {
      this.remainingShields--;
      this.alertMessage = '🛡️ VEHICLE SHIELD ABSORBED HIT!';
      this.alertTimer = 1.0;
      this.isInvincible = true;
      this.invincibleTimer = 1.5; // Brief invincibility after shield break
      this.notify(true);
      return;
    }

    this.strikes++;
    this.isDowned = true;
    this.downedTimer = 0.85; // Down for 0.85s
    this.playerState = PLAYER_STATE.DOWNED;

    // Drastically reduce speed to 4.5 m/s on stumble
    this.speed = 4.5;
    this.cleanRunDistance = 0;
    this.alertTimer = 1.0;

    if (this.strikes === 1) {
      // Hit 1: Tripped, Witch appears behind!
      this.guardianDistance = 6.2;
      this.alertMessage = '⚠️ WITCH AWAKENED BEHIND YOU! NEXT HIT KILLS! (1/2)';
      gameAudio.playWitchShriek();
      this.notify(true);
    } else {
      // Hit 2: Fatal! Character dies after hitting obstacles twice!
      this.guardianDistance = 0.0;
      this.alertMessage = '💀 WITCH STRIKES! RUNNER DOWN!';
      gameAudio.playGameOver();
      // Trigger Revive Prompt!
      this.promptRevive();
    }
  }

  // Prompt Revive Screen
  promptRevive() {
    this.status = GAME_STATUS.REVIVE;
    this.reviveCountdown = 6.0; // 6 seconds to decide
    this.notify(true);
  }

  // Revive with ₦1,000 (from run cash or career vault)
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

  // Revive with 1,500 points
  reviveWithPoints() {
    if (this.score < 1500) return false;
    this.score -= 1500;
    this.completeRevive();
    return true;
  }

  // Successful Revive execution
  completeRevive() {
    this.strikes = 0;
    this.isDowned = false;
    this.downedTimer = 0;
    this.isInvincible = true;
    this.invincibleTimer = 3.5; // 3.5s golden invincibility shield
    this.guardianDistance = 22.0; // Push witch far back
    this.speed = Math.max(16.0, this.targetSpeed);
    this.playerState = PLAYER_STATE.RUNNING;
    this.status = GAME_STATUS.PLAYING;
    this.alertMessage = '✨ REVIVED! SAFE SHIELD ACTIVE (3s)!';
    this.alertTimer = 1.2;
    gameAudio.playRevive();
    this.notify(true);
  }

  // Give Up / Decline Revive
  declineRevive() {
    this.gameOver('GUARDIAN_CAUGHT');
  }

  gameOver(reason = 'GUARDIAN_CAUGHT') {
    if (this.status === GAME_STATUS.GAMEOVER) return;
    this.status = GAME_STATUS.GAMEOVER;
    this.playerState = PLAYER_STATE.DEAD;
    this.reason = reason;

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

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('naija_run_muted', this.isMuted.toString());
    }
    this.notify(true);
    return this.isMuted;
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
    this.notify(true);
    return this.debugMode;
  }

  // Called in game loop to handle timers
  tick(dt) {
    if (this.alertTimer > 0) {
      this.alertTimer -= dt;
      if (this.alertTimer <= 0) {
        this.alertMessage = '';
        this.notify(true);
      }
    }

    // 2X Multiplier timer
    if (this.multiplierTimer > 0) {
      this.multiplierTimer -= dt;
      if (this.multiplierTimer <= 0) {
        this.pointMultiplier = 1;
        this.notify(true);
      }
    }

    // Sango Shades Magnet timer
    if (this.magnetTimer > 0) {
      this.magnetTimer -= dt;
    }

    // Invincibility shield timer
    if (this.isInvincible) {
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
  }
}

export const gameState = new GameStateManager();
