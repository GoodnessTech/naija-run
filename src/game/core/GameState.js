import { userProfile } from '../progression/UserProfileManager.js';
import { leaderboardManager } from '../progression/LeaderboardManager.js';

export const GAME_STATUS = {
  LOADING: 'LOADING',
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
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
    this.multiplier = 1;
    this.guardianDistance = 18.0;
    this.guardianPressure = 0.0;
    this.currentLane = LANE.CENTER;
    this.targetLane = LANE.CENTER;
    this.playerState = PLAYER_STATE.RUNNING;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.strikes = 0; // 0: Safe, 1: Stumble, 2: Witch right behind, 3: Dead
    this.isDowned = false;
    this.downedTimer = 0;
    this.cleanRunDistance = 0;
    this.alertMessage = '';
    this.alertTimer = 0;
    this.fps = 60;
    this.lastNotifyTime = 0;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(immediate = false) {
    const now = performance.now();
    if (immediate || now - this.lastNotifyTime > 50) {
      this.lastNotifyTime = now;
      const snapshot = this.getSnapshot();
      for (const listener of this.listeners) {
        listener(snapshot);
      }
    }
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
      alertMessage: this.alertMessage,
      isMuted: this.isMuted,
      debugMode: this.debugMode,
      fps: this.fps,
      remainingShields: this.remainingShields || 0,
      lastRunResult: this.lastRunResult
    };
  }

  startGame() {
    this.reset();
    // Retrieve and apply active lifestyle & gear perks!
    const perks = userProfile.getActivePerks();
    this.guardianDistance = 18.0 + (perks.guardianStartDistanceBonus || 0);
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

  gameOver(reason = 'GUARDIAN_CAUGHT') {
    if (this.status === GAME_STATUS.GAMEOVER) return;
    this.status = GAME_STATUS.GAMEOVER;
    this.playerState = PLAYER_STATE.DEAD;
    this.reason = reason;

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const runDate = new Date().toISOString();

    // Persist run cash and career stats into user profile vault!
    const runResult = userProfile.recordRun({
       id: runId,
       date: runDate,
       cash: this.cash,
       distance: this.distance,
       score: this.score
     });
    this.lastRunResult = runResult;

    // Record into real un-mocked leaderboard ledger!
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

  // Increases Naira balance by ₦1,000 per note hit (with active lifestyle multiplier)
  collectCash(amount = 1000) {
    const effectiveCash = Math.round(amount * (this.cashBonusMultiplier || 1.0));
    this.cash += effectiveCash;
    this.score += Math.round(25 * (this.scoreMultiplier || 1.0));
    // Slight guardian recovery on clean cash collection
    this.guardianDistance = Math.min(22.0, this.guardianDistance + 0.35);
    this.notify(true);
  }

  // Obstacle hit: downs character, reduces speed, increases witch pursuit, kills on 3rd hit
  hitObstacle() {
    if (this.isDowned || this.status !== GAME_STATUS.PLAYING) return;

    // Check if player has an active vehicle shield (e.g. Yellow Danfo Bus)!
    if (this.remainingShields > 0) {
      this.remainingShields--;
      this.alertMessage = '🛡️ DANFO SHIELD BROKE! HIT ABSORBED!';
      this.alertTimer = 0.5;
      this.notify(true);
      return;
    }

    this.strikes++;
    this.isDowned = true;
    this.downedTimer = 0.85; // Down for 0.85s
    this.playerState = PLAYER_STATE.DOWNED;

    // Drastically reduce speed to 4.5 m/s!
    this.speed = 4.5;
    this.cleanRunDistance = 0;

    // Banner message strictly 0.5s!
    this.alertTimer = 0.5;

    if (this.strikes === 1) {
      // Hit 1: Tripped, Witch closes in fast
      this.guardianDistance = 7.0;
      this.alertMessage = '⚠️ TRIPPED! WITCH CLOSING IN! (1/3)';
    } else if (this.strikes === 2) {
      // Hit 2: Witch right on runner's back, next hit kills!
      this.guardianDistance = 2.8;
      this.alertMessage = '👹 WITCH ON YOUR HEELS! NEXT HIT KILLS! (2/3)';
    } else {
      // Hit 3: Caught and killed!
      this.guardianDistance = 0.0;
      this.alertMessage = '💀 CAUGHT BY THE WITCH! GAME OVER';
      this.gameOver('GUARDIAN_CAUGHT');
      return;
    }

    this.notify(true);
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
